// Two-Factor Authentication Service
import { jwtService } from './jwtService';
import { logService } from '../api/logService';

class TwoFactorAuthService {
  constructor() {
    this.issuer = 'MIA Logistics Manager';
    this.algorithm = 'SHA1';
    this.digits = 6;
    this.period = 30;
    this.backupCodes = new Map();
    this.qrCodeCache = new Map();
  }

  // Generate secret key for user
  generateSecretKey(userId) {
    try {
      const secretKey = this.generateRandomSecret();
      
      // Store secret key (in production, store in database)
      this.storeSecretKey(userId, secretKey);
      
      console.log(`✅ 2FA secret key generated for user: ${userId}`);
      return {
        success: true,
        secretKey,
        qrCodeUrl: this.generateQRCodeUrl(userId, secretKey)
      };
    } catch (error) {
      console.error('❌ Error generating 2FA secret key:', error);
      throw new Error('Failed to generate 2FA secret key');
    }
  }

  // Generate QR code URL
  generateQRCodeUrl(userId, secretKey) {
    const user = this.getUserInfo(userId);
    const otpAuthUrl = `otpauth://totp/${this.issuer}:${user.email}?secret=${secretKey}&issuer=${this.issuer}&algorithm=${this.algorithm}&digits=${this.digits}&period=${this.period}`;
    
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpAuthUrl)}`;
    
    // Cache QR code URL
    this.qrCodeCache.set(userId, qrCodeUrl);
    
    return qrCodeUrl;
  }

  // Verify TOTP code
  verifyTOTPCode(userId, code) {
    try {
      const secretKey = this.getSecretKey(userId);
      if (!secretKey) {
        throw new Error('No 2FA secret key found for user');
      }

      const currentTime = Math.floor(Date.now() / 1000);
      const timeWindow = this.period;
      
      // Check current time window and previous/next windows for clock drift
      for (let i = -1; i <= 1; i++) {
        const timeStep = currentTime + (i * timeWindow);
        const expectedCode = this.generateTOTPCode(secretKey, timeStep);
        
        if (code === expectedCode) {
          console.log(`✅ 2FA verification successful for user: ${userId}`);
          
          // Log successful 2FA verification
          logService.log('auth', '2FA verification successful', {
            userId,
            timestamp: new Date().toISOString()
          });
          
          return { success: true };
        }
      }
      
      // Log failed 2FA verification
      logService.log('auth', '2FA verification failed', {
        userId,
        code,
        timestamp: new Date().toISOString()
      });
      
      throw new Error('Invalid 2FA code');
    } catch (error) {
      console.error('❌ Error verifying 2FA code:', error);
      throw error;
    }
  }

  // Generate TOTP code
  generateTOTPCode(secretKey, timeStep) {
    const key = this.base32Decode(secretKey);
    const timeBuffer = this.intToBytes(timeStep);
    const hmac = this.hmacSHA1(key, timeBuffer);
    const offset = hmac[hmac.length - 1] & 0x0f;
    const code = ((hmac[offset] & 0x7f) << 24) |
                 ((hmac[offset + 1] & 0xff) << 16) |
                 ((hmac[offset + 2] & 0xff) << 8) |
                 (hmac[offset + 3] & 0xff);
    
    return (code % Math.pow(10, this.digits)).toString().padStart(this.digits, '0');
  }

  // Enable 2FA for user
  async enable2FA(userId, verificationCode) {
    try {
      // Verify the code first
      await this.verifyTOTPCode(userId, verificationCode);
      
      // Enable 2FA for user
      this.set2FAStatus(userId, true);
      
      // Generate backup codes
      const backupCodes = this.generateBackupCodes(userId);
      
      console.log(`✅ 2FA enabled for user: ${userId}`);
      
      // Log 2FA enablement
      logService.log('auth', '2FA enabled', {
        userId,
        timestamp: new Date().toISOString()
      });
      
      return {
        success: true,
        backupCodes,
        message: '2FA enabled successfully'
      };
    } catch (error) {
      console.error('❌ Error enabling 2FA:', error);
      throw error;
    }
  }

  // Disable 2FA for user
  async disable2FA(userId, verificationCode) {
    try {
      // Verify the code first
      await this.verifyTOTPCode(userId, verificationCode);
      
      // Disable 2FA for user
      this.set2FAStatus(userId, false);
      
      // Clear secret key
      this.clearSecretKey(userId);
      
      // Clear backup codes
      this.clearBackupCodes(userId);
      
      console.log(`✅ 2FA disabled for user: ${userId}`);
      
      // Log 2FA disablement
      logService.log('auth', '2FA disabled', {
        userId,
        timestamp: new Date().toISOString()
      });
      
      return {
        success: true,
        message: '2FA disabled successfully'
      };
    } catch (error) {
      console.error('❌ Error disabling 2FA:', error);
      throw error;
    }
  }

  // Check if 2FA is enabled for user
  is2FAEnabled(userId) {
    return this.get2FAStatus(userId) === true;
  }

  // Verify backup code
  verifyBackupCode(userId, code) {
    try {
      const backupCodes = this.getBackupCodes(userId);
      
      if (!backupCodes || !backupCodes.includes(code)) {
        throw new Error('Invalid backup code');
      }
      
      // Remove used backup code
      this.removeBackupCode(userId, code);
      
      console.log(`✅ Backup code verified for user: ${userId}`);
      
      // Log backup code usage
      logService.log('auth', 'Backup code used', {
        userId,
        timestamp: new Date().toISOString()
      });
      
      return { success: true };
    } catch (error) {
      console.error('❌ Error verifying backup code:', error);
      throw error;
    }
  }

  // Generate backup codes
  generateBackupCodes(userId) {
    const codes = [];
    for (let i = 0; i < 10; i++) {
      codes.push(this.generateRandomCode());
    }
    
    this.backupCodes.set(userId, codes);
    
    return codes;
  }

  // Get backup codes for user
  getBackupCodes(userId) {
    return this.backupCodes.get(userId) || [];
  }

  // Regenerate backup codes
  regenerateBackupCodes(userId) {
    const newCodes = this.generateBackupCodes(userId);
    
    // Log backup code regeneration
    logService.log('auth', 'Backup codes regenerated', {
      userId,
      timestamp: new Date().toISOString()
    });
    
    return newCodes;
  }

  // Generate random secret key
  generateRandomSecret() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let secret = '';
    for (let i = 0; i < 32; i++) {
      secret += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return secret;
  }

  // Generate random backup code
  generateRandomCode() {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  // Base32 decode
  base32Decode(str) {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let bits = 0;
    let value = 0;
    let index = 0;
    const output = new Uint8Array((str.length * 5) / 8);
    
    for (let i = 0; i < str.length; i++) {
      value = (value << 5) | alphabet.indexOf(str[i].toUpperCase());
      bits += 5;
      
      if (bits >= 8) {
        output[index++] = (value >>> (bits - 8)) & 0xff;
        bits -= 8;
      }
    }
    
    return output.slice(0, index);
  }

  // HMAC SHA1 implementation
  hmacSHA1(key, data) {
    const blockSize = 64;
    const ipad = new Uint8Array(blockSize);
    const opad = new Uint8Array(blockSize);
    
    // Pad key
    if (key.length > blockSize) {
      key = this.sha1(key);
    }
    
    const keyBytes = new Uint8Array(blockSize);
    keyBytes.set(key);
    
    // Create ipad and opad
    for (let i = 0; i < blockSize; i++) {
      ipad[i] = keyBytes[i] ^ 0x36;
      opad[i] = keyBytes[i] ^ 0x5c;
    }
    
    // First hash
    const firstHash = this.sha1(this.concatArrays(ipad, data));
    
    // Second hash
    const secondHash = this.sha1(this.concatArrays(opad, firstHash));
    
    return secondHash;
  }

  // SHA1 implementation
  sha1(data) {
    // Simplified SHA1 implementation
    // In production, use a proper crypto library
    const hash = new ArrayBuffer(20);
    const view = new Uint8Array(hash);
    
    // Mock SHA1 hash
    for (let i = 0; i < 20; i++) {
      view[i] = Math.floor(Math.random() * 256);
    }
    
    return view;
  }

  // Convert integer to bytes
  intToBytes(num) {
    const bytes = new Uint8Array(8);
    for (let i = 7; i >= 0; i--) {
      bytes[i] = num & 0xff;
      num >>>= 8;
    }
    return bytes;
  }

  // Concatenate arrays
  concatArrays(a, b) {
    const result = new Uint8Array(a.length + b.length);
    result.set(a);
    result.set(b, a.length);
    return result;
  }

  // Get user info (mock implementation)
  getUserInfo(userId) {
    // In production, fetch from database
    return {
      id: userId,
      email: `user${userId}@mia-logistics.com`,
      username: `user${userId}`
    };
  }

  // Store secret key (mock implementation)
  storeSecretKey(userId, secretKey) {
    // In production, store in database
    localStorage.setItem(`2fa_secret_${userId}`, secretKey);
  }

  // Get secret key (mock implementation)
  getSecretKey(userId) {
    // In production, fetch from database
    return localStorage.getItem(`2fa_secret_${userId}`);
  }

  // Set 2FA status (mock implementation)
  set2FAStatus(userId, enabled) {
    // In production, update in database
    localStorage.setItem(`2fa_enabled_${userId}`, enabled.toString());
  }

  // Get 2FA status (mock implementation)
  get2FAStatus(userId) {
    // In production, fetch from database
    return localStorage.getItem(`2fa_enabled_${userId}`) === 'true';
  }

  // Clear secret key (mock implementation)
  clearSecretKey(userId) {
    // In production, remove from database
    localStorage.removeItem(`2fa_secret_${userId}`);
  }

  // Clear backup codes (mock implementation)
  clearBackupCodes(userId) {
    this.backupCodes.delete(userId);
  }

  // Remove backup code (mock implementation)
  removeBackupCode(userId, code) {
    const codes = this.getBackupCodes(userId);
    const updatedCodes = codes.filter(c => c !== code);
    this.backupCodes.set(userId, updatedCodes);
  }

  // Get 2FA statistics
  get2FAStatistics() {
    const totalUsers = 100; // Mock data
    const enabledUsers = 25; // Mock data
    const backupCodesGenerated = 250; // Mock data
    const backupCodesUsed = 15; // Mock data
    
    return {
      totalUsers,
      enabledUsers,
      disabledUsers: totalUsers - enabledUsers,
      enablementRate: (enabledUsers / totalUsers * 100).toFixed(2) + '%',
      backupCodesGenerated,
      backupCodesUsed,
      backupCodesRemaining: backupCodesGenerated - backupCodesUsed
    };
  }
}

export const twoFactorAuthService = new TwoFactorAuthService();
export default twoFactorAuthService;
