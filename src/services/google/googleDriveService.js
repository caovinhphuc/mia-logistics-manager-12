import { log } from '../logging/logger';
import { googleAuthService } from './googleAuthService';

class GoogleDriveService {
  constructor() {
    this.isConnected = false;
    this.folderId = null;
    this.apiUrl = 'https://www.googleapis.com/drive/v3';
    this.uploadUrl = 'https://www.googleapis.com/upload/drive/v3';
    this.uploadProgressCallbacks = new Map();
    this.downloadProgressCallbacks = new Map();

    // Performance settings
    this.retryAttempts = 3;
    this.retryDelay = 1000;
    this.rateLimitDelay = 100; // 100ms between requests
    this.lastRequestTime = 0;
    this.maxFileSize = 5 * 1024 * 1024 * 1024; // 5GB
    this.chunkSize = 8 * 1024 * 1024; // 8MB chunks for resumable uploads

    // Cache settings
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    this.enableCaching = true;

    // Performance tracking
    this.performanceMetrics = new Map();
    this.requestCount = 0;
    this.errorCount = 0;
    this.totalUploadedBytes = 0;
    this.totalDownloadedBytes = 0;

    // Connection settings
    this.connectionSettings = {
      timeout: 30000, // 30 seconds
      maxRetries: 3,
      enableCaching: true,
      enableRateLimiting: true,
      enablePerformanceTracking: true,
      enableProgressTracking: true,
    };
  }

  async initialize() {
    try {
      console.log('🚀 Initializing Google Drive Service');

      // Check if Google Drive is enabled
      if (
        process.env.REACT_APP_ENABLE_GOOGLE_DRIVE === 'false' ||
        process.env.REACT_APP_GOOGLE_DRIVE_FOLDER_ID === 'disabled'
      ) {
        console.log('🔧 Google Drive disabled in environment configuration');
        this.isConnected = false;
        return;
      }

      // Initialize auth service if not already done
      if (!googleAuthService.isInitialized) {
        await googleAuthService.initialize();
      }

      if (!googleAuthService.isInitialized) {
        console.log('🔧 Google Auth not initialized, skipping Drive connection');
        this.isConnected = false;
        return;
      }

      this.isConnected = true;
      console.log('✅ Google Drive Service initialized successfully');
    } catch (error) {
      console.error('❌ Google Drive initialization failed:', error);
      this.isConnected = false;
      console.log('🔧 Google Drive will work in mock mode');
    }
  }

  async connect(folderId, options = {}) {
    try {
      console.log(`🔗 Connecting to Drive folder: ${folderId}`);

      const { enableCaching = true, enableRateLimiting = true, timeout = 30000 } = options;

      this.folderId = folderId;
      this.connectionSettings.enableCaching = enableCaching;
      this.connectionSettings.enableRateLimiting = enableRateLimiting;
      this.connectionSettings.timeout = timeout;

      // Test connection by getting folder info
      const folderInfo = await this.getFolderInfo(folderId);

      this.isConnected = true;
      console.log(`✅ Connected to Drive folder: ${folderInfo.name}`);

      return {
        folderId,
        name: folderInfo.name,
        createdTime: folderInfo.createdTime,
        modifiedTime: folderInfo.modifiedTime,
        webViewLink: folderInfo.webViewLink,
        connectedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('❌ Failed to connect to Google Drive:', error);
      throw error;
    }
  }

  async disconnect() {
    try {
      this.isConnected = false;
      this.folderId = null;
      this.cache.clear();
      this.performanceMetrics.clear();
      this.uploadProgressCallbacks.clear();
      this.downloadProgressCallbacks.clear();

      console.log('🔌 Disconnected from Google Drive');
    } catch (error) {
      console.error('❌ Error during disconnect:', error);
    }
  }

  async getFolderInfo(folderId) {
    try {
      const cacheKey = `folder_${folderId}`;

      // Check cache first
      if (this.enableCaching && this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey);
        if (Date.now() - cached.timestamp < this.cacheTimeout) {
          console.log(`📋 Using cached folder info for ${folderId}`);
          return cached.data;
        }
      }

      const headers = await googleAuthService.getAuthHeaders();

      const response = await this.makeRequest(`${this.apiUrl}/files/${folderId}`, {
        headers,
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`Failed to get folder info: ${response.statusText}`);
      }

      const folderInfo = await response.json();

      // Cache the result
      if (this.enableCaching) {
        this.cache.set(cacheKey, {
          data: folderInfo,
          timestamp: Date.now(),
        });
      }

      console.log(`📁 Retrieved folder info: ${folderInfo.name}`);
      return folderInfo;
    } catch (error) {
      console.error('❌ Failed to get folder info:', error);
      throw error;
    }
  }

  async uploadFile(file, folderId = null, options = {}) {
    try {
      const startTime = Date.now();

      const {
        name = file.name,
        description = '',
        metadata = {},
        onProgress = null,
        overwrite = false,
        chunkSize = this.chunkSize,
      } = options;

      const targetFolderId = folderId || this.folderId;
      if (!targetFolderId) {
        throw new Error('No folder ID specified');
      }

      // Validate file size
      if (file.size > this.maxFileSize) {
        throw new Error(
          `File size exceeds maximum limit of ${this.maxFileSize / (1024 * 1024 * 1024)}GB`
        );
      }

      const headers = await googleAuthService.getAuthHeaders();

      // Create file metadata
      const fileMetadata = {
        name,
        parents: [targetFolderId],
        description,
        ...metadata,
      };

      // Check for existing file if overwrite is enabled
      if (overwrite) {
        const existingFile = await this.findFileByName(name, targetFolderId);
        if (existingFile) {
          await this.deleteFile(existingFile.id);
        }
      }

      let result;

      // Use resumable upload for larger files
      if (file.size > 5 * 1024 * 1024) {
        // 5MB
        result = await this.resumableUpload(file, fileMetadata, headers, {
          onProgress,
          chunkSize,
        });
      } else {
        result = await this.simpleUpload(file, fileMetadata, headers, {
          onProgress,
        });
      }

      const uploadTime = Date.now() - startTime;
      this.trackPerformance('upload', uploadTime, true);
      this.totalUploadedBytes += file.size;

      console.log(`✅ File uploaded successfully: ${name} (${uploadTime}ms)`);
      return result;
    } catch (error) {
      this.trackPerformance('upload', 0, false);
      console.error('❌ Failed to upload file:', error);
      throw error;
    }
  }

  async simpleUpload(file, metadata, headers, options = {}) {
    try {
      const { onProgress } = options;

      const formData = new FormData();
      formData.append(
        'metadata',
        new Blob([JSON.stringify(metadata)], {
          type: 'application/json',
        })
      );
      formData.append('file', file);

      // Track upload progress
      if (onProgress) {
        this.uploadProgressCallbacks.set(file.name, onProgress);
      }

      const response = await this.makeRequest(`${this.uploadUrl}/files?uploadType=multipart`, {
        method: 'POST',
        headers: {
          Authorization: headers.Authorization,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();

      // Clear progress callback
      if (onProgress) {
        this.uploadProgressCallbacks.delete(file.name);
      }

      return result;
    } catch (error) {
      console.error('❌ Simple upload failed:', error);
      throw error;
    }
  }

  async resumableUpload(file, metadata, headers, options = {}) {
    try {
      const { onProgress, chunkSize } = options;

      // Initiate resumable upload
      const initResponse = await this.makeRequest(`${this.uploadUrl}/files?uploadType=resumable`, {
        method: 'POST',
        headers: {
          ...headers,
          'X-Upload-Content-Type': file.type,
          'X-Upload-Content-Length': file.size.toString(),
        },
        body: JSON.stringify(metadata),
      });

      if (!initResponse.ok) {
        throw new Error(`Upload initiation failed: ${initResponse.statusText}`);
      }

      const uploadUrl = initResponse.headers.get('Location');

      // Upload file in chunks
      const totalChunks = Math.ceil(file.size / chunkSize);
      let uploadedBytes = 0;

      for (let i = 0; i < totalChunks; i++) {
        const start = i * chunkSize;
        const end = Math.min(start + chunkSize, file.size);
        const chunk = file.slice(start, end);

        const chunkResponse = await this.makeRequest(uploadUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': file.type,
            'Content-Range': `bytes ${start}-${end - 1}/${file.size}`,
          },
          body: chunk,
        });

        if (!chunkResponse.ok) {
          throw new Error(`Chunk upload failed: ${chunkResponse.statusText}`);
        }

        uploadedBytes += chunk.size;

        // Report progress
        if (onProgress) {
          const progress = (uploadedBytes / file.size) * 100;
          onProgress({
            loaded: uploadedBytes,
            total: file.size,
            percentage: Math.round(progress),
            chunk: i + 1,
            totalChunks,
          });
        }
      }

      // Finalize upload
      const finalResponse = await this.makeRequest(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type,
          'Content-Range': `bytes ${uploadedBytes}-${uploadedBytes}/${file.size}`,
        },
      });

      if (!finalResponse.ok) {
        throw new Error(`Upload finalization failed: ${finalResponse.statusText}`);
      }

      return await finalResponse.json();
    } catch (error) {
      console.error('❌ Resumable upload failed:', error);
      throw error;
    }
  }

  async downloadFile(fileId, options = {}) {
    try {
      const startTime = Date.now();

      const { onProgress = null, format = 'original', exportFormat = null } = options;

      const headers = await googleAuthService.getAuthHeaders();

      let url = `${this.apiUrl}/files/${fileId}?alt=media`;

      // Add format parameters
      if (format !== 'original') {
        url += `&format=${format}`;
      }

      if (exportFormat) {
        url += `&exportFormat=${exportFormat}`;
      }

      // Track download progress
      if (onProgress) {
        this.downloadProgressCallbacks.set(fileId, onProgress);
      }

      const response = await this.makeRequest(url, {
        headers,
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`Download failed: ${response.statusText}`);
      }

      const blob = await response.blob();
      const downloadTime = Date.now() - startTime;

      this.trackPerformance('download', downloadTime, true);
      this.totalDownloadedBytes += blob.size;

      // Clear progress callback
      if (onProgress) {
        this.downloadProgressCallbacks.delete(fileId);
      }

      console.log(`✅ File downloaded successfully: ${fileId} (${downloadTime}ms)`);
      return blob;
    } catch (error) {
      this.trackPerformance('download', 0, false);
      console.error('❌ Failed to download file:', error);
      throw error;
    }
  }

  async deleteFile(fileId, options = {}) {
    try {
      const { permanent = false } = options;

      const headers = await googleAuthService.getAuthHeaders();

      let url = `${this.apiUrl}/files/${fileId}`;
      if (permanent) {
        url += '?permanent=true';
      }

      const response = await this.makeRequest(url, {
        method: 'DELETE',
        headers,
      });

      if (!response.ok) {
        throw new Error(`Delete failed: ${response.statusText}`);
      }

      // Clear cache for this file
      this.clearCacheForFile(fileId);

      console.log(`✅ File deleted successfully: ${fileId}`);
      return { success: true };
    } catch (error) {
      console.error('❌ Failed to delete file:', error);
      throw error;
    }
  }

  async listFiles(folderId = null, options = {}) {
    try {
      const {
        orderBy = 'modifiedTime desc',
        pageSize = 100,
        includeTrashed = false,
        mimeType = null,
        name = null,
        useCache = true,
      } = options;

      const targetFolderId = folderId || this.folderId;
      const cacheKey = `files_${targetFolderId}_${JSON.stringify(options)}`;

      // Check cache first
      if (useCache && this.enableCaching && this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey);
        if (Date.now() - cached.timestamp < this.cacheTimeout) {
          console.log(`📋 Using cached file list for ${targetFolderId}`);
          return cached.data;
        }
      }

      let headers;
      try {
        headers = await googleAuthService.getAuthHeaders();
      } catch (error) {
        log.mockMode('Failed to get auth headers, using mock data for file list');
        return this.getMockFileList(targetFolderId, mimeType);
      }

      let query = `'${targetFolderId}' in parents`;

      if (!includeTrashed) {
        query += ' and trashed=false';
      }

      if (mimeType) {
        query += ` and mimeType='${mimeType}'`;
      }

      if (name) {
        query += ` and name contains '${name}'`;
      }

      const params = new URLSearchParams({
        q: query,
        fields:
          'files(id,name,mimeType,size,createdTime,modifiedTime,webViewLink,thumbnailLink,parents,description,owners,permissions)',
        orderBy,
        pageSize: pageSize.toString(),
      });

      const response = await this.makeRequest(`${this.apiUrl}/files?${params}`, {
        headers,
        method: 'GET',
      });

      if (!response.ok) {
        log.mockMode(`List files failed: ${response.statusText}, falling back to mock data`);
        return this.getMockFileList(targetFolderId, mimeType);
      }

      const result = await response.json();

      // Cache the result
      if (useCache && this.enableCaching) {
        this.cache.set(cacheKey, {
          data: result,
          timestamp: Date.now(),
        });
      }

      console.log(`📁 Retrieved ${result.files?.length || 0} files from folder ${targetFolderId}`);
      return result;
    } catch (error) {
      console.error('❌ Failed to list files:', error);
      throw error;
    }
  }

  async searchFiles(query, options = {}) {
    try {
      const {
        orderBy = 'modifiedTime desc',
        pageSize = 50,
        includeTrashed = false,
        mimeType = null,
        useCache = true,
      } = options;

      const cacheKey = `search_${query}_${JSON.stringify(options)}`;

      // Check cache first
      if (useCache && this.enableCaching && this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey);
        if (Date.now() - cached.timestamp < this.cacheTimeout) {
          console.log(`📋 Using cached search results for: ${query}`);
          return cached.data;
        }
      }

      const headers = await googleAuthService.getAuthHeaders();

      let searchQuery = query;

      if (!includeTrashed) {
        searchQuery += ' and trashed=false';
      }

      if (mimeType) {
        searchQuery += ` and mimeType='${mimeType}'`;
      }

      const params = new URLSearchParams({
        q: searchQuery,
        fields:
          'files(id,name,mimeType,size,createdTime,modifiedTime,webViewLink,thumbnailLink,parents,description,owners,permissions)',
        orderBy,
        pageSize: pageSize.toString(),
      });

      const response = await this.makeRequest(`${this.apiUrl}/files?${params}`, {
        headers,
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`);
      }

      const result = await response.json();

      // Cache the result
      if (useCache && this.enableCaching) {
        this.cache.set(cacheKey, {
          data: result,
          timestamp: Date.now(),
        });
      }

      console.log(`🔍 Search completed: ${query} - Found ${result.files?.length || 0} files`);
      return result;
    } catch (error) {
      console.error('❌ Failed to search files:', error);
      throw error;
    }
  }

  async createFolder(name, parentFolderId = null, options = {}) {
    try {
      const { description = '', colorRgb = null, useCache = true } = options;

      const headers = await googleAuthService.getAuthHeaders();
      const targetParent = parentFolderId || this.folderId;

      const metadata = {
        name,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [targetParent],
        description,
        ...(colorRgb && { folderColorRgb: colorRgb }),
      };

      const response = await this.makeRequest(`${this.apiUrl}/files`, {
        method: 'POST',
        headers,
        body: JSON.stringify(metadata),
      });

      if (!response.ok) {
        throw new Error(`Folder creation failed: ${response.statusText}`);
      }

      const result = await response.json();

      // Clear cache for parent folder
      if (useCache) {
        this.clearCacheForFolder(targetParent);
      }

      console.log(`✅ Folder created successfully: ${name}`);
      return result;
    } catch (error) {
      console.error('❌ Failed to create folder:', error);
      throw error;
    }
  }

  async moveFile(fileId, newParentId, options = {}) {
    try {
      const { useCache = true } = options;

      const headers = await googleAuthService.getAuthHeaders();

      // Get current parents
      const fileInfo = await this.makeRequest(`${this.apiUrl}/files/${fileId}?fields=parents`, {
        headers,
        method: 'GET',
      });

      if (!fileInfo.ok) {
        throw new Error('Failed to get file info');
      }

      const { parents } = await fileInfo.json();
      const previousParents = parents.join(',');

      // Move file
      const response = await this.makeRequest(
        `${this.apiUrl}/files/${fileId}?addParents=${newParentId}&removeParents=${previousParents}`,
        {
          method: 'PATCH',
          headers,
        }
      );

      if (!response.ok) {
        throw new Error(`Move failed: ${response.statusText}`);
      }

      const result = await response.json();

      // Clear cache for affected folders
      if (useCache) {
        this.clearCacheForFolder(newParentId);
        parents.forEach((parentId) => this.clearCacheForFolder(parentId));
      }

      console.log(`✅ File moved successfully: ${fileId}`);
      return result;
    } catch (error) {
      console.error('❌ Failed to move file:', error);
      throw error;
    }
  }

  async copyFile(fileId, newName = null, newParentId = null) {
    try {
      const headers = await googleAuthService.getAuthHeaders();

      const metadata = {
        ...(newName && { name: newName }),
        ...(newParentId && { parents: [newParentId] }),
      };

      const response = await this.makeRequest(`${this.apiUrl}/files/${fileId}/copy`, {
        method: 'POST',
        headers,
        body: JSON.stringify(metadata),
      });

      if (!response.ok) {
        throw new Error(`Copy failed: ${response.statusText}`);
      }

      const result = await response.json();

      // Clear cache for parent folder
      if (newParentId) {
        this.clearCacheForFolder(newParentId);
      }

      console.log(`✅ File copied successfully: ${fileId}`);
      return result;
    } catch (error) {
      console.error('❌ Failed to copy file:', error);
      throw error;
    }
  }

  async getQuota() {
    try {
      const headers = await googleAuthService.getAuthHeaders();

      const response = await this.makeRequest(`${this.apiUrl}/about?fields=storageQuota`, {
        headers,
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`Get quota failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Failed to get quota:', error);
      throw error;
    }
  }

  async shareFile(fileId, email, role = 'reader', options = {}) {
    try {
      const { type = 'user', sendNotificationEmail = true, emailMessage = '' } = options;

      const headers = await googleAuthService.getAuthHeaders();

      const permission = {
        type,
        role,
        emailAddress: email,
        ...(sendNotificationEmail && { sendNotificationEmail }),
        ...(emailMessage && { emailMessage }),
      };

      const response = await this.makeRequest(`${this.apiUrl}/files/${fileId}/permissions`, {
        method: 'POST',
        headers,
        body: JSON.stringify(permission),
      });

      if (!response.ok) {
        throw new Error(`Share failed: ${response.statusText}`);
      }

      console.log(`✅ File shared successfully: ${fileId} with ${email}`);
      return await response.json();
    } catch (error) {
      console.error('❌ Failed to share file:', error);
      throw error;
    }
  }

  async getFilePermissions(fileId) {
    try {
      const headers = await googleAuthService.getAuthHeaders();

      const response = await this.makeRequest(`${this.apiUrl}/files/${fileId}/permissions`, {
        headers,
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`Get permissions failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Failed to get file permissions:', error);
      throw error;
    }
  }

  async updateFileMetadata(fileId, metadata) {
    try {
      const headers = await googleAuthService.getAuthHeaders();

      const response = await this.makeRequest(`${this.apiUrl}/files/${fileId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(metadata),
      });

      if (!response.ok) {
        throw new Error(`Update metadata failed: ${response.statusText}`);
      }

      // Clear cache for this file
      this.clearCacheForFile(fileId);

      console.log(`✅ File metadata updated successfully: ${fileId}`);
      return await response.json();
    } catch (error) {
      console.error('❌ Failed to update file metadata:', error);
      throw error;
    }
  }

  async findFileByName(name, folderId = null) {
    try {
      const targetFolderId = folderId || this.folderId;
      const query = `name='${name}' and '${targetFolderId}' in parents and trashed=false`;

      const result = await this.searchFiles(query);
      return result.files && result.files.length > 0 ? result.files[0] : null;
    } catch (error) {
      console.error('❌ Failed to find file by name:', error);
      throw error;
    }
  }

  async syncFiles(folderId = null) {
    try {
      console.log('🔄 Syncing files...');

      const files = await this.listFiles(folderId);
      const syncResult = {
        success: true,
        fileCount: files.files?.length || 0,
        lastSync: new Date().toISOString(),
        folderId: folderId || this.folderId,
      };

      console.log('✅ Files sync completed');
      return syncResult;
    } catch (error) {
      log.mockMode(`Failed to sync files: ${error.message}, returning mock sync result`);
      return {
        success: true,
        fileCount: 0,
        lastSync: new Date().toISOString(),
        folderId: folderId || this.folderId,
        mockMode: true,
      };
    }
  }

  // Enhanced request handling
  async makeRequest(url, options = {}) {
    try {
      // Rate limiting
      if (this.connectionSettings.enableRateLimiting) {
        await this.enforceRateLimit();
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        options.timeout || this.connectionSettings.timeout
      );

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      this.lastRequestTime = Date.now();
      this.requestCount++;

      return response;
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    }
  }

  async enforceRateLimit() {
    const timeSinceLastRequest = Date.now() - this.lastRequestTime;
    if (timeSinceLastRequest < this.rateLimitDelay) {
      await new Promise((resolve) =>
        setTimeout(resolve, this.rateLimitDelay - timeSinceLastRequest)
      );
    }
  }

  async retryOperation(operation, attempts = this.retryAttempts) {
    for (let i = 0; i < attempts; i++) {
      try {
        return await operation();
      } catch (error) {
        if (i === attempts - 1) throw error;

        console.warn(`⚠️ Operation failed, retrying... (${i + 1}/${attempts})`);
        await new Promise((resolve) => setTimeout(resolve, this.retryDelay * (i + 1)));
      }
    }
  }

  trackPerformance(operation, executionTime, success) {
    try {
      if (!this.connectionSettings.enablePerformanceTracking) return;

      const key = operation;
      const current = this.performanceMetrics.get(key) || {
        count: 0,
        totalTime: 0,
        successCount: 0,
        errorCount: 0,
        averageTime: 0,
        lastExecution: null,
      };

      current.count++;
      current.totalTime += executionTime;
      current.averageTime = current.totalTime / current.count;
      current.lastExecution = new Date().toISOString();

      if (success) {
        current.successCount++;
      } else {
        current.errorCount++;
        this.errorCount++;
      }

      this.performanceMetrics.set(key, current);
    } catch (error) {
      console.warn('Failed to track performance:', error);
    }
  }

  // Cache management
  clearCacheForFile(fileId) {
    const keysToDelete = [];
    for (const key of this.cache.keys()) {
      if (key.includes(fileId)) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach((key) => this.cache.delete(key));
  }

  clearCacheForFolder(folderId) {
    const keysToDelete = [];
    for (const key of this.cache.keys()) {
      if (key.includes(folderId)) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach((key) => this.cache.delete(key));
  }

  clearCache() {
    this.cache.clear();
    console.log('🗑️ Cache cleared');
  }

  // Utility methods for MIA Logistics specific use cases
  async uploadTransportDocument(file, transportId, options = {}) {
    try {
      const folderName = `Transport_${transportId}`;

      // Create transport-specific folder if it doesn't exist
      let transportFolder = await this.searchFiles(
        `name='${folderName}' and mimeType='application/vnd.google-apps.folder'`
      );

      if (!transportFolder.files || transportFolder.files.length === 0) {
        transportFolder = await this.createFolder(folderName, null, {
          description: `Documents for transport ${transportId}`,
          colorRgb: '#4285f4',
        });
        return await this.uploadFile(file, transportFolder.id, options);
      } else {
        return await this.uploadFile(file, transportFolder.files[0].id, options);
      }
    } catch (error) {
      console.error('❌ Failed to upload transport document:', error);
      throw error;
    }
  }

  async uploadWarehouseImage(file, itemCode, options = {}) {
    try {
      const folderName = 'Warehouse_Images';

      // Create warehouse images folder if it doesn't exist
      let imagesFolder = await this.searchFiles(
        `name='${folderName}' and mimeType='application/vnd.google-apps.folder'`
      );

      if (!imagesFolder.files || imagesFolder.files.length === 0) {
        imagesFolder = await this.createFolder(folderName, null, {
          description: 'Images for warehouse items',
          colorRgb: '#34a853',
        });
      }

      return await this.uploadFile(file, imagesFolder.files[0].id, {
        name: `${itemCode}_${Date.now()}.${file.name.split('.').pop()}`,
        description: `Image for warehouse item: ${itemCode}`,
        ...options,
      });
    } catch (error) {
      console.error('❌ Failed to upload warehouse image:', error);
      throw error;
    }
  }

  async uploadStaffDocument(file, staffId, documentType, options = {}) {
    try {
      const folderName = `Staff_${staffId}`;

      // Create staff-specific folder if it doesn't exist
      let staffFolder = await this.searchFiles(
        `name='${folderName}' and mimeType='application/vnd.google-apps.folder'`
      );

      if (!staffFolder.files || staffFolder.files.length === 0) {
        staffFolder = await this.createFolder(folderName, null, {
          description: `Documents for staff member ${staffId}`,
          colorRgb: '#fbbc04',
        });
      }

      return await this.uploadFile(file, staffFolder.files[0].id, {
        name: `${documentType}_${Date.now()}.${file.name.split('.').pop()}`,
        description: `${documentType} for staff member: ${staffId}`,
        ...options,
      });
    } catch (error) {
      console.error('❌ Failed to upload staff document:', error);
      throw error;
    }
  }

  async uploadPartnerDocument(file, partnerId, documentType, options = {}) {
    try {
      const folderName = `Partner_${partnerId}`;

      // Create partner-specific folder if it doesn't exist
      let partnerFolder = await this.searchFiles(
        `name='${folderName}' and mimeType='application/vnd.google-apps.folder'`
      );

      if (!partnerFolder.files || partnerFolder.files.length === 0) {
        partnerFolder = await this.createFolder(folderName, null, {
          description: `Documents for partner ${partnerId}`,
          colorRgb: '#ea4335',
        });
      }

      return await this.uploadFile(file, partnerFolder.files[0].id, {
        name: `${documentType}_${Date.now()}.${file.name.split('.').pop()}`,
        description: `${documentType} for partner: ${partnerId}`,
        ...options,
      });
    } catch (error) {
      console.error('❌ Failed to upload partner document:', error);
      throw error;
    }
  }

  // Performance and monitoring
  getPerformanceMetrics() {
    return {
      totalRequests: this.requestCount,
      totalErrors: this.errorCount,
      successRate:
        this.requestCount > 0
          ? ((this.requestCount - this.errorCount) / this.requestCount) * 100
          : 0,
      totalUploadedBytes: this.totalUploadedBytes,
      totalDownloadedBytes: this.totalDownloadedBytes,
      operationMetrics: Object.fromEntries(this.performanceMetrics),
      cacheSize: this.cache.size,
    };
  }

  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      folderId: this.folderId,
      cacheSize: this.cache.size,
      requestCount: this.requestCount,
      errorCount: this.errorCount,
      totalUploadedBytes: this.totalUploadedBytes,
      totalDownloadedBytes: this.totalDownloadedBytes,
    };
  }

  // Mock mode methods
  getMockFileList(targetFolderId, mimeType) {
    log.mockMode('Returning mock file list');
    return {
      files: [
        {
          id: 'mock-file-1',
          name: 'mock-document.pdf',
          mimeType: 'application/pdf',
          size: '1024',
          createdTime: new Date().toISOString(),
          modifiedTime: new Date().toISOString(),
          parents: [targetFolderId],
        },
        {
          id: 'mock-file-2',
          name: 'mock-spreadsheet.xlsx',
          mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          size: '2048',
          createdTime: new Date().toISOString(),
          modifiedTime: new Date().toISOString(),
          parents: [targetFolderId],
        },
      ],
      nextPageToken: null,
    };
  }

  // Cleanup method
  cleanup() {
    this.disconnect();
    this.clearCache();
    this.performanceMetrics.clear();
    this.uploadProgressCallbacks.clear();
    this.downloadProgressCallbacks.clear();
  }
}

export const googleDriveService = new GoogleDriveService();
