// Token Cache Service - Advanced token caching and optimization
import { jwtService } from './jwtService';
import { logService } from '../api/logService';

class TokenCacheService {
  constructor() {
    this.cache = new Map();
    this.refreshTokens = new Map();
    this.tokenBlacklist = new Set();
    this.cacheStats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      totalRequests: 0
    };
    
    this.cacheConfig = {
      maxSize: 1000,
      ttl: 3600000, // 1 hour
      refreshThreshold: 300000, // 5 minutes before expiry
      cleanupInterval: 600000, // 10 minutes
      compressionEnabled: true,
      encryptionEnabled: true
    };
    
    this.startCacheManagement();
  }

  // Start cache management
  startCacheManagement() {
    console.log('🚀 Starting token cache management...');
    
    // Start cleanup process
    this.startCleanupProcess();
    
    // Start refresh process
    this.startRefreshProcess();
    
    // Start compression process
    if (this.cacheConfig.compressionEnabled) {
      this.startCompressionProcess();
    }
    
    console.log('✅ Token cache management started');
  }

  // Start cleanup process
  startCleanupProcess() {
    setInterval(() => {
      this.cleanupExpiredTokens();
    }, this.cacheConfig.cleanupInterval);
  }

  // Start refresh process
  startRefreshProcess() {
    setInterval(() => {
      this.refreshExpiringTokens();
    }, this.cacheConfig.refreshThreshold);
  }

  // Start compression process
  startCompressionProcess() {
    setInterval(() => {
      this.compressCache();
    }, this.cacheConfig.cleanupInterval * 2);
  }

  // Cache token
  cacheToken(key, token, metadata = {}) {
    try {
      const cacheEntry = {
        token,
        metadata: {
          ...metadata,
          cachedAt: Date.now(),
          expiresAt: Date.now() + this.cacheConfig.ttl,
          accessCount: 0,
          lastAccessed: Date.now()
        }
      };
      
      // Compress token if enabled
      if (this.cacheConfig.compressionEnabled) {
        cacheEntry.token = this.compressToken(token);
      }
      
      // Encrypt token if enabled
      if (this.cacheConfig.encryptionEnabled) {
        cacheEntry.token = this.encryptToken(cacheEntry.token);
      }
      
      // Check cache size limit
      if (this.cache.size >= this.cacheConfig.maxSize) {
        this.evictLeastRecentlyUsed();
      }
      
      this.cache.set(key, cacheEntry);
      
      console.log(`✅ Token cached: ${key}`);
      
      // Log cache operation
      logService.log('cache', 'Token cached', {
        key,
        size: this.cache.size,
        timestamp: new Date().toISOString()
      });
      
      return true;
    } catch (error) {
      console.error('❌ Error caching token:', error);
      return false;
    }
  }

  // Get cached token
  getCachedToken(key) {
    try {
      this.cacheStats.totalRequests++;
      
      const cacheEntry = this.cache.get(key);
      
      if (!cacheEntry) {
        this.cacheStats.misses++;
        return null;
      }
      
      // Check if token is expired
      if (Date.now() > cacheEntry.metadata.expiresAt) {
        this.cache.delete(key);
        this.cacheStats.misses++;
        return null;
      }
      
      // Update access statistics
      cacheEntry.metadata.accessCount++;
      cacheEntry.metadata.lastAccessed = Date.now();
      
      let token = cacheEntry.token;
      
      // Decrypt token if enabled
      if (this.cacheConfig.encryptionEnabled) {
        token = this.decryptToken(token);
      }
      
      // Decompress token if enabled
      if (this.cacheConfig.compressionEnabled) {
        token = this.decompressToken(token);
      }
      
      this.cacheStats.hits++;
      
      console.log(`✅ Token retrieved from cache: ${key}`);
      
      return {
        token,
        metadata: cacheEntry.metadata
      };
    } catch (error) {
      console.error('❌ Error retrieving cached token:', error);
      this.cacheStats.misses++;
      return null;
    }
  }

  // Remove token from cache
  removeCachedToken(key) {
    try {
      const removed = this.cache.delete(key);
      
      if (removed) {
        console.log(`✅ Token removed from cache: ${key}`);
        
        // Log cache operation
        logService.log('cache', 'Token removed from cache', {
          key,
          size: this.cache.size,
          timestamp: new Date().toISOString()
        });
      }
      
      return removed;
    } catch (error) {
      console.error('❌ Error removing cached token:', error);
      return false;
    }
  }

  // Cache refresh token
  cacheRefreshToken(userId, refreshToken, metadata = {}) {
    try {
      const cacheEntry = {
        refreshToken,
        metadata: {
          ...metadata,
          cachedAt: Date.now(),
          expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days
          accessCount: 0,
          lastAccessed: Date.now()
        }
      };
      
      // Encrypt refresh token
      if (this.cacheConfig.encryptionEnabled) {
        cacheEntry.refreshToken = this.encryptToken(refreshToken);
      }
      
      this.refreshTokens.set(userId, cacheEntry);
      
      console.log(`✅ Refresh token cached for user: ${userId}`);
      
      return true;
    } catch (error) {
      console.error('❌ Error caching refresh token:', error);
      return false;
    }
  }

  // Get cached refresh token
  getCachedRefreshToken(userId) {
    try {
      const cacheEntry = this.refreshTokens.get(userId);
      
      if (!cacheEntry) {
        return null;
      }
      
      // Check if refresh token is expired
      if (Date.now() > cacheEntry.metadata.expiresAt) {
        this.refreshTokens.delete(userId);
        return null;
      }
      
      // Update access statistics
      cacheEntry.metadata.accessCount++;
      cacheEntry.metadata.lastAccessed = Date.now();
      
      let refreshToken = cacheEntry.refreshToken;
      
      // Decrypt refresh token
      if (this.cacheConfig.encryptionEnabled) {
        refreshToken = this.decryptToken(refreshToken);
      }
      
      console.log(`✅ Refresh token retrieved from cache for user: ${userId}`);
      
      return {
        refreshToken,
        metadata: cacheEntry.metadata
      };
    } catch (error) {
      console.error('❌ Error retrieving cached refresh token:', error);
      return null;
    }
  }

  // Remove refresh token from cache
  removeCachedRefreshToken(userId) {
    try {
      const removed = this.refreshTokens.delete(userId);
      
      if (removed) {
        console.log(`✅ Refresh token removed from cache for user: ${userId}`);
      }
      
      return removed;
    } catch (error) {
      console.error('❌ Error removing cached refresh token:', error);
      return false;
    }
  }

  // Blacklist token
  blacklistToken(token, reason = 'logout') {
    try {
      this.tokenBlacklist.add(token);
      
      console.log(`🚫 Token blacklisted: ${reason}`);
      
      // Log blacklist operation
      logService.log('cache', 'Token blacklisted', {
        reason,
        blacklistSize: this.tokenBlacklist.size,
        timestamp: new Date().toISOString()
      });
      
      return true;
    } catch (error) {
      console.error('❌ Error blacklisting token:', error);
      return false;
    }
  }

  // Check if token is blacklisted
  isTokenBlacklisted(token) {
    return this.tokenBlacklist.has(token);
  }

  // Remove token from blacklist
  removeFromBlacklist(token) {
    return this.tokenBlacklist.delete(token);
  }

  // Cleanup expired tokens
  cleanupExpiredTokens() {
    console.log('🧹 Cleaning up expired tokens...');
    
    const now = Date.now();
    let cleanedCount = 0;
    
    // Cleanup main cache
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.metadata.expiresAt) {
        this.cache.delete(key);
        cleanedCount++;
      }
    }
    
    // Cleanup refresh tokens
    for (const [userId, entry] of this.refreshTokens.entries()) {
      if (now > entry.metadata.expiresAt) {
        this.refreshTokens.delete(userId);
        cleanedCount++;
      }
    }
    
    // Cleanup blacklist (remove old entries)
    if (this.tokenBlacklist.size > 1000) {
      // Keep only recent blacklisted tokens
      const blacklistArray = Array.from(this.tokenBlacklist);
      this.tokenBlacklist.clear();
      blacklistArray.slice(-500).forEach(token => this.tokenBlacklist.add(token));
      cleanedCount += blacklistArray.length - 500;
    }
    
    console.log(`✅ Cleaned up ${cleanedCount} expired tokens`);
  }

  // Refresh expiring tokens
  refreshExpiringTokens() {
    console.log('🔄 Refreshing expiring tokens...');
    
    const now = Date.now();
    const refreshThreshold = this.cacheConfig.refreshThreshold;
    let refreshedCount = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.metadata.expiresAt - now < refreshThreshold) {
        // Token is expiring soon, refresh it
        this.refreshToken(key, entry);
        refreshedCount++;
      }
    }
    
    console.log(`✅ Refreshed ${refreshedCount} expiring tokens`);
  }

  // Refresh individual token
  refreshToken(key, cacheEntry) {
    try {
      // Decrypt and decompress token
      let token = cacheEntry.token;
      if (this.cacheConfig.encryptionEnabled) {
        token = this.decryptToken(token);
      }
      if (this.cacheConfig.compressionEnabled) {
        token = this.decompressToken(token);
      }
      
      // Verify token is still valid
      if (jwtService.verifyToken(token)) {
        // Extend expiry
        cacheEntry.metadata.expiresAt = Date.now() + this.cacheConfig.ttl;
        cacheEntry.metadata.lastRefreshed = Date.now();
        
        console.log(`✅ Token refreshed: ${key}`);
      } else {
        // Token is invalid, remove from cache
        this.cache.delete(key);
        console.log(`❌ Invalid token removed: ${key}`);
      }
    } catch (error) {
      console.error('❌ Error refreshing token:', error);
      this.cache.delete(key);
    }
  }

  // Evict least recently used token
  evictLeastRecentlyUsed() {
    let oldestKey = null;
    let oldestTime = Date.now();
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.metadata.lastAccessed < oldestTime) {
        oldestTime = entry.metadata.lastAccessed;
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      this.cache.delete(oldestKey);
      this.cacheStats.evictions++;
      console.log(`🗑️ Evicted least recently used token: ${oldestKey}`);
    }
  }

  // Compress cache
  compressCache() {
    if (!this.cacheConfig.compressionEnabled) return;
    
    console.log('🗜️ Compressing cache...');
    
    let compressedCount = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (!entry.metadata.compressed) {
        entry.token = this.compressToken(entry.token);
        entry.metadata.compressed = true;
        compressedCount++;
      }
    }
    
    console.log(`✅ Compressed ${compressedCount} cache entries`);
  }

  // Compress token
  compressToken(token) {
    try {
      // Simple compression - in production, use proper compression
      return btoa(token);
    } catch (error) {
      console.error('❌ Error compressing token:', error);
      return token;
    }
  }

  // Decompress token
  decompressToken(compressedToken) {
    try {
      // Simple decompression - in production, use proper decompression
      return atob(compressedToken);
    } catch (error) {
      console.error('❌ Error decompressing token:', error);
      return compressedToken;
    }
  }

  // Encrypt token
  encryptToken(token) {
    try {
      // Simple encryption - in production, use proper encryption
      return btoa(token);
    } catch (error) {
      console.error('❌ Error encrypting token:', error);
      return token;
    }
  }

  // Decrypt token
  decryptToken(encryptedToken) {
    try {
      // Simple decryption - in production, use proper decryption
      return atob(encryptedToken);
    } catch (error) {
      console.error('❌ Error decrypting token:', error);
      return encryptedToken;
    }
  }

  // Get cache statistics
  getCacheStatistics() {
    const stats = {
      cache: {
        size: this.cache.size,
        maxSize: this.cacheConfig.maxSize,
        utilization: (this.cache.size / this.cacheConfig.maxSize * 100).toFixed(2) + '%'
      },
      refreshTokens: {
        size: this.refreshTokens.size
      },
      blacklist: {
        size: this.tokenBlacklist.size
      },
      performance: {
        hitRate: this.cacheStats.totalRequests > 0 ? 
          (this.cacheStats.hits / this.cacheStats.totalRequests * 100).toFixed(2) + '%' : '0%',
        missRate: this.cacheStats.totalRequests > 0 ? 
          (this.cacheStats.misses / this.cacheStats.totalRequests * 100).toFixed(2) + '%' : '0%',
        evictionRate: this.cacheStats.totalRequests > 0 ? 
          (this.cacheStats.evictions / this.cacheStats.totalRequests * 100).toFixed(2) + '%' : '0%'
      },
      totals: {
        hits: this.cacheStats.hits,
        misses: this.cacheStats.misses,
        evictions: this.cacheStats.evictions,
        totalRequests: this.cacheStats.totalRequests
      }
    };
    
    return stats;
  }

  // Get cache performance metrics
  getCachePerformanceMetrics() {
    const now = Date.now();
    const last24Hours = now - 86400000;
    
    const metrics = {
      cacheHitRate: this.calculateHitRate(),
      averageResponseTime: this.calculateAverageResponseTime(),
      cacheUtilization: this.calculateCacheUtilization(),
      tokenRefreshRate: this.calculateTokenRefreshRate(),
      blacklistGrowthRate: this.calculateBlacklistGrowthRate(),
      compressionRatio: this.calculateCompressionRatio()
    };
    
    return metrics;
  }

  // Calculate hit rate
  calculateHitRate() {
    if (this.cacheStats.totalRequests === 0) return 0;
    return (this.cacheStats.hits / this.cacheStats.totalRequests * 100).toFixed(2);
  }

  // Calculate average response time
  calculateAverageResponseTime() {
    // Mock implementation - in production, track actual response times
    return Math.random() * 10 + 1; // 1-11ms
  }

  // Calculate cache utilization
  calculateCacheUtilization() {
    return (this.cache.size / this.cacheConfig.maxSize * 100).toFixed(2);
  }

  // Calculate token refresh rate
  calculateTokenRefreshRate() {
    // Mock implementation - in production, track actual refresh rates
    return Math.random() * 5 + 1; // 1-6%
  }

  // Calculate blacklist growth rate
  calculateBlacklistGrowthRate() {
    // Mock implementation - in production, track actual growth rates
    return Math.random() * 2 + 0.5; // 0.5-2.5%
  }

  // Calculate compression ratio
  calculateCompressionRatio() {
    // Mock implementation - in production, track actual compression ratios
    return Math.random() * 0.5 + 0.3; // 30-80%
  }

  // Clear all caches
  clearAllCaches() {
    try {
      this.cache.clear();
      this.refreshTokens.clear();
      this.tokenBlacklist.clear();
      
      // Reset statistics
      this.cacheStats = {
        hits: 0,
        misses: 0,
        evictions: 0,
        totalRequests: 0
      };
      
      console.log('✅ All caches cleared');
      
      // Log cache clear operation
      logService.log('cache', 'All caches cleared', {
        timestamp: new Date().toISOString()
      });
      
      return true;
    } catch (error) {
      console.error('❌ Error clearing caches:', error);
      return false;
    }
  }

  // Export cache data
  exportCacheData() {
    try {
      const cacheData = {
        cache: Array.from(this.cache.entries()),
        refreshTokens: Array.from(this.refreshTokens.entries()),
        blacklist: Array.from(this.tokenBlacklist),
        statistics: this.getCacheStatistics(),
        timestamp: new Date().toISOString()
      };
      
      return JSON.stringify(cacheData, null, 2);
    } catch (error) {
      console.error('❌ Error exporting cache data:', error);
      return null;
    }
  }

  // Import cache data
  importCacheData(data) {
    try {
      const cacheData = JSON.parse(data);
      
      this.cache = new Map(cacheData.cache);
      this.refreshTokens = new Map(cacheData.refreshTokens);
      this.tokenBlacklist = new Set(cacheData.blacklist);
      
      console.log('✅ Cache data imported successfully');
      
      return true;
    } catch (error) {
      console.error('❌ Error importing cache data:', error);
      return false;
    }
  }
}

export const tokenCacheService = new TokenCacheService();
export default tokenCacheService;
