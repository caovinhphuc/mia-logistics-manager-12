// Google Sheets Service - Sử dụng Google Sheets thực tế

class GoogleSheetsService {
  constructor() {
    this.gapi = null;
    this.isConnected = false;
    this.spreadsheetId = null;
    this.spreadsheetTitle = null;
    this.sheets = {};
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  // Initialize Google API
  async initializeAPI() {
    if (this.gapi) return;

    // Check if Google services are enabled
    if (
      process.env.REACT_APP_ENABLE_GOOGLE_SHEETS === 'false' ||
      process.env.REACT_APP_GOOGLE_API_KEY === 'disabled'
    ) {
      console.log('🔧 Google Sheets API disabled in environment configuration');
      return Promise.resolve();
    }

    // Check if environment variables are configured
    if (!process.env.REACT_APP_GOOGLE_API_KEY || !process.env.REACT_APP_GOOGLE_CLIENT_ID) {
      console.warn('⚠️ Google API credentials not configured. Using mock mode.');
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      // Check if script already exists
      if (document.querySelector('script[src*="apis.google.com"]')) {
        console.log('📋 Google API script already loaded');
        if (window.gapi) {
          this.gapi = window.gapi;
          resolve();
        } else {
          console.log('⚠️ Google API script loaded but gapi not available, using fallback mode');
          resolve();
        }
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.async = true;
      script.defer = true;

      // Add timeout to prevent hanging
      const timeout = setTimeout(() => {
        console.log('⏰ Google API script loading timeout, using fallback mode');
        resolve();
      }, 10000); // 10 seconds timeout

      script.onload = () => {
        clearTimeout(timeout);
        console.log('📋 Google API script loaded successfully');
        window.gapi.load('client', async () => {
          try {
            console.log('📋 Initializing Google API client...');
            await window.gapi.client.init({
              apiKey: process.env.REACT_APP_GOOGLE_API_KEY,
              clientId: process.env.REACT_APP_GOOGLE_CLIENT_ID,
              discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
              scope: 'https://www.googleapis.com/auth/spreadsheets',
              ux_mode: 'popup',
              redirect_uri: window.location.origin,
            });
            this.gapi = window.gapi;
            console.log('✅ Google API client initialized successfully');
            resolve();
          } catch (error) {
            // Only log specific errors, not all initialization failures
            if (error.error === 'idpiframe_initialization_failed') {
              console.log('⚠️ Google API initialization failed - using fallback mode');
            } else {
              console.error('❌ Google API client initialization failed:', error);
            }
            console.log('💡 Using fallback mode');
            resolve();
          }
        });
      };

      script.onerror = (error) => {
        clearTimeout(timeout);
        console.error('❌ Failed to load Google API script:', error);
        console.log('💡 This is normal if Google API is not available. Using fallback mode.');
        resolve();
      };

      document.head.appendChild(script);
    });
  }

  // Connect to Google Sheets
  async connect(spreadsheetId) {
    try {
      console.log('📋 Connecting to Google Sheets...', { spreadsheetId });

      this.spreadsheetId = spreadsheetId;

      // Initialize Google Sheets API
      try {
        await this.initializeAPI();
      } catch (error) {
        console.warn('⚠️ Google API initialization failed, using fallback mode:', error.message);
        // Continue with fallback mode
      }

      // Check if we have Google API available
      if (!this.gapi || !this.gapi.client) {
        console.warn('⚠️ Google API not available, using fallback mode');
        return this.connectFallback(spreadsheetId);
      }

      // Get spreadsheet metadata
      const response = await this.gapi.client.sheets.spreadsheets.get({
        spreadsheetId: this.spreadsheetId,
      });

      const spreadsheet = response.result;
      this.spreadsheetTitle = spreadsheet.properties.title;

      // Get all sheets
      this.sheets = {};
      spreadsheet.sheets.forEach((sheet) => {
        this.sheets[sheet.properties.title] = {
          sheetId: sheet.properties.sheetId,
          title: sheet.properties.title,
          rowCount: sheet.properties.gridProperties.rowCount,
          columnCount: sheet.properties.gridProperties.columnCount,
        };
      });

      this.isConnected = true;

      console.log(`📋 Connected to spreadsheet: ${this.spreadsheetTitle}`);
      console.log(`📋 Available sheets: [${Object.keys(this.sheets).join(', ')}]`);

      return {
        title: this.spreadsheetTitle,
        sheetCount: Object.keys(this.sheets).length,
        sheets: Object.keys(this.sheets),
        lastConnected: new Date().toISOString(),
      };
    } catch (error) {
      console.error('❌ Failed to connect to Google Sheets:', error);
      console.log('🔄 Trying fallback mode...');
      return this.connectFallback(spreadsheetId);
    }
  }

  // Fallback connection mode
  async connectFallback(spreadsheetId) {
    console.log('📋 Using fallback mode for Google Sheets');

    this.spreadsheetId = spreadsheetId;
    this.spreadsheetTitle = 'MIA Logistics Manager (Fallback Mode)';
    this.isConnected = true;

    // Create mock sheets structure
    this.sheets = {
      Carriers: {
        sheetId: 1,
        title: 'Carriers',
        rowCount: 100,
        columnCount: 10,
      },
      Transports: {
        sheetId: 2,
        title: 'Transports',
        rowCount: 100,
        columnCount: 10,
      },
      Warehouse: {
        sheetId: 3,
        title: 'Warehouse',
        rowCount: 100,
        columnCount: 10,
      },
      Staff: {
        sheetId: 4,
        title: 'Staff',
        rowCount: 100,
        columnCount: 10,
      },
      Partners: {
        sheetId: 5,
        title: 'Partners',
        rowCount: 100,
        columnCount: 10,
      },
      Users: {
        sheetId: 6,
        title: 'Users',
        rowCount: 100,
        columnCount: 10,
      },
    };

    console.log(`📋 Fallback mode connected: ${this.spreadsheetTitle}`);
    console.log(`📋 Available sheets: [${Object.keys(this.sheets).join(', ')}]`);

    return {
      title: this.spreadsheetTitle,
      sheetCount: Object.keys(this.sheets).length,
      sheets: Object.keys(this.sheets),
      lastConnected: new Date().toISOString(),
      mode: 'fallback',
    };
  }

  // Get data from Google Sheets
  async getData(sheetName, range = null, useCache = true) {
    try {
      // Try direct API call first
      if (process.env.REACT_APP_GOOGLE_API_KEY && this.spreadsheetId) {
        console.log(`📊 Getting data directly from Google Sheets API: "${sheetName}"`);
        const apiKey = process.env.REACT_APP_GOOGLE_API_KEY;
        const rangeParam = range ? `${sheetName}!${range}` : `${sheetName}!A:Z`;
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/${rangeParam}?key=${apiKey}`;

        try {
          const response = await fetch(url);
          if (response.ok) {
            const data = await response.json();
            if (data.values && data.values.length > 0) {
              console.log(`✅ Successfully got data from Google Sheets: "${sheetName}"`);
              return data.values;
            }
          }
        } catch (apiError) {
          console.log(
            `⚠️ Direct API call failed: ${apiError.message}, trying fallback for "${sheetName}"`
          );
        }
      }

      if (!this.isConnected || !this.sheets[sheetName]) {
        throw new Error(`Sheet "${sheetName}" not found or not connected`);
      }

      // Check if we're in fallback mode
      if (!this.gapi || !this.gapi.client) {
        console.log(`📋 Using fallback data for "${sheetName}"`);
        return this.getFallbackData(sheetName);
      }

      // Check cache first
      const cacheKey = `${sheetName}_${range || 'all'}`;
      if (useCache && this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey);
        if (Date.now() - cached.timestamp < this.cacheTimeout) {
          console.log(`📋 Using cached data for ${sheetName}`);
          return cached.data;
        }
      }

      // Lấy dữ liệu thực tế từ Google Sheets
      console.log(`📊 Getting real data from Google Sheets: "${sheetName}"`);

      const response = await this.gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: range ? `${sheetName}!${range}` : `${sheetName}!A:Z`,
      });

      const values = response.result.values || [];

      if (values.length === 0) {
        console.log(`📋 Sheet "${sheetName}" is empty`);
        return [];
      }

      // Parse data
      const headers = values[0];
      const data = values.slice(1).map((row, index) => {
        const item = {};
        headers.forEach((header, colIndex) => {
          item[header] = row[colIndex] || '';
        });
        item._rowIndex = index + 2; // +2 because of header row and 0-based index
        return item;
      });

      // Cache the data
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now(),
      });

      console.log(`✅ Retrieved ${data.length} rows from "${sheetName}"`);
      return data;
    } catch (error) {
      console.error(`❌ Failed to get data from "${sheetName}":`, error);
      console.log(`🔄 Using fallback data for "${sheetName}"`);
      return this.getFallbackData(sheetName);
    }
  }

  // Fallback data for when Google API is not available
  getFallbackData(sheetName) {
    console.log(`📋 Providing fallback data for "${sheetName}"`);

    const fallbackData = {
      Carriers: [
        {
          carrierId: 'C001',
          name: 'Công ty vận chuyển ABC',
          contactPerson: 'Nguyễn Văn A',
          email: 'abc@example.com',
          phone: '0123456789',
          address: 'Hà Nội, TP.HCM',
          status: 'active',
        },
        {
          carrierId: 'C002',
          name: 'Dịch vụ logistics XYZ',
          contactPerson: 'Trần Thị B',
          email: 'xyz@example.com',
          phone: '0987654321',
          address: 'Đà Nẵng, Hải Phòng',
          status: 'active',
        },
        {
          carrierId: 'C003',
          name: 'Express Delivery',
          contactPerson: 'Lê Văn C',
          email: 'express@example.com',
          phone: '0369852741',
          address: 'Toàn quốc',
          status: 'inactive',
        },
      ],
      Transports: [
        {
          transportId: 'T001',
          carrierId: 'C001',
          origin: 'Hà Nội',
          destination: 'TP.HCM',
          status: 'completed',
          createdAt: '2024-01-15',
        },
        {
          transportId: 'T002',
          carrierId: 'C002',
          origin: 'Đà Nẵng',
          destination: 'Hải Phòng',
          status: 'in_progress',
          createdAt: '2024-01-16',
        },
        {
          transportId: 'T003',
          carrierId: 'C001',
          origin: 'TP.HCM',
          destination: 'Cần Thơ',
          status: 'pending',
          createdAt: '2024-01-17',
        },
      ],
      Warehouse: [
        {
          itemId: 'W001',
          name: 'Laptop Dell',
          category: 'Electronics',
          stockQuantity: 50,
          location: 'Kho A',
        },
        {
          itemId: 'W002',
          name: 'Máy in HP',
          category: 'Electronics',
          stockQuantity: 25,
          location: 'Kho B',
        },
        {
          itemId: 'W003',
          name: 'Ghế văn phòng',
          category: 'Furniture',
          stockQuantity: 100,
          location: 'Kho C',
        },
      ],
      Staff: [
        {
          staffId: 'S001',
          name: 'Nguyễn Văn D',
          position: 'Manager',
          department: 'Operations',
          status: 'active',
        },
        {
          staffId: 'S002',
          name: 'Trần Thị E',
          position: 'Operator',
          department: 'Warehouse',
          status: 'active',
        },
        {
          staffId: 'S003',
          name: 'Lê Văn F',
          position: 'Driver',
          department: 'Transport',
          status: 'active',
        },
      ],
      Partners: [
        {
          partnerId: 'P001',
          companyName: 'Nhà cung cấp A',
          contactPerson: 'Nguyễn Văn G',
          email: 'partnera@example.com',
          status: 'active',
        },
        {
          partnerId: 'P002',
          companyName: 'Nhà cung cấp B',
          contactPerson: 'Trần Thị H',
          email: 'partnerb@example.com',
          status: 'active',
        },
        {
          partnerId: 'P003',
          companyName: 'Nhà cung cấp C',
          contactPerson: 'Lê Văn I',
          email: 'partnerc@example.com',
          status: 'inactive',
        },
      ],
      Users: [
        ['id', 'email', 'fullName', 'role', 'status', 'createdAt', 'updatedAt', 'passwordHash'],
        [
          '1',
          'admin@company.com',
          'Admin User',
          'admin',
          'active',
          '2024-01-01',
          '2024-01-01',
          'hashed_password_123',
        ],
        [
          '2',
          'manager@company.com',
          'Manager User',
          'manager',
          'active',
          '2024-01-01',
          '2024-01-01',
          'hashed_password_456',
        ],
        [
          '3',
          'user@company.com',
          'Regular User',
          'user',
          'active',
          '2024-01-01',
          '2024-01-01',
          'hashed_password_789',
        ],
      ],
    };

    return fallbackData[sheetName] || [];
  }

  // Update data in Google Sheets
  async updateValues(sheetName, range, values, options = {}) {
    try {
      const { validateData = true } = options;

      if (!this.isConnected || !this.sheets[sheetName]) {
        throw new Error(`Sheet "${sheetName}" not found or not connected`);
      }

      // Validate data if required
      if (validateData) {
        this.validateUpdateData(values);
      }

      // Sử dụng Google Sheets API thực tế
      console.log(`📝 Updating values in Google Sheets: "${sheetName}"`);

      const response = await this.gapi.client.sheets.spreadsheets.values.update({
        spreadsheetId: this.spreadsheetId,
        range: `${sheetName}!${range}`,
        valueInputOption: 'RAW',
        resource: {
          values: values,
        },
      });

      // Clear cache for this sheet
      this.clearCacheForSheet(sheetName);

      console.log(`✅ Updated ${values.length} rows in "${sheetName}"`);
      return {
        success: true,
        updatedCells: values.length,
        timestamp: new Date().toISOString(),
        response: response.result,
      };
    } catch (error) {
      console.error(`❌ Failed to update values in ${sheetName}:`, error);
      throw error;
    }
  }

  // Add new data to Google Sheets
  async appendData(sheetName, values, options = {}) {
    try {
      if (!this.isConnected || !this.sheets[sheetName]) {
        throw new Error(`Sheet "${sheetName}" not found or not connected`);
      }

      console.log(`➕ Appending data to Google Sheets: "${sheetName}"`);

      const response = await this.gapi.client.sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range: `${sheetName}!A:Z`,
        valueInputOption: 'RAW',
        insertDataOption: 'INSERT_ROWS',
        resource: {
          values: values,
        },
      });

      // Clear cache for this sheet
      this.clearCacheForSheet(sheetName);

      console.log(`✅ Appended ${values.length} rows to "${sheetName}"`);
      return {
        success: true,
        appendedRows: values.length,
        timestamp: new Date().toISOString(),
        response: response.result,
      };
    } catch (error) {
      console.error(`❌ Failed to append data to ${sheetName}:`, error);
      throw error;
    }
  }

  // Delete data from Google Sheets
  async deleteData(sheetName, range, options = {}) {
    try {
      if (!this.isConnected || !this.sheets[sheetName]) {
        throw new Error(`Sheet "${sheetName}" not found or not connected`);
      }

      console.log(`🗑️ Deleting data from Google Sheets: "${sheetName}"`);

      const response = await this.gapi.client.sheets.spreadsheets.batchUpdate({
        spreadsheetId: this.spreadsheetId,
        resource: {
          requests: [
            {
              deleteDimension: {
                range: {
                  sheetId: this.sheets[sheetName].sheetId,
                  dimension: 'ROWS',
                  startIndex: range.startRow - 1,
                  endIndex: range.endRow,
                },
              },
            },
          ],
        },
      });

      // Clear cache for this sheet
      this.clearCacheForSheet(sheetName);

      console.log(`✅ Deleted data from "${sheetName}"`);
      return {
        success: true,
        timestamp: new Date().toISOString(),
        response: response.result,
      };
    } catch (error) {
      console.error(`❌ Failed to delete data from ${sheetName}:`, error);
      throw error;
    }
  }

  // Validate update data
  validateUpdateData(values) {
    if (!Array.isArray(values)) {
      throw new Error('Values must be an array');
    }

    if (values.length === 0) {
      throw new Error('Values array cannot be empty');
    }
  }

  // Clear cache for specific sheet
  clearCacheForSheet(sheetName) {
    const keysToDelete = [];
    for (const key of this.cache.keys()) {
      if (key.startsWith(`${sheetName}_`)) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach((key) => this.cache.delete(key));
  }

  // Clear all cache
  clearAllCache() {
    this.cache.clear();
  }

  // Get connection status
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      spreadsheetId: this.spreadsheetId,
      spreadsheetTitle: this.spreadsheetTitle,
      sheets: Object.keys(this.sheets),
      lastConnected: this.lastConnected,
    };
  }

  // Disconnect
  disconnect() {
    this.isConnected = false;
    this.spreadsheetId = null;
    this.spreadsheetTitle = null;
    this.sheets = {};
    this.clearAllCache();
    console.log('📋 Disconnected from Google Sheets');
  }
}

// Create singleton instance
const googleSheetsService = new GoogleSheetsService();

// Export both named and default
export { googleSheetsService };
export default googleSheetsService;
