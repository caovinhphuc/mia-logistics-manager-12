// JWT Service - Xử lý JWT tokens
import CryptoJS from 'crypto-js';

class JWTService {
  constructor() {
    this.secretKey = process.env.REACT_APP_JWT_SECRET || 'mia-logistics-secret-key-2024';
    this.algorithm = 'HS256';
    this.expirationTime = 24 * 60 * 60; // 24 hours in seconds
  }

  // Tạo JWT token
  createToken(payload) {
    try {
      const header = {
        alg: this.algorithm,
        typ: 'JWT'
      };

      const now = Math.floor(Date.now() / 1000);
      const claims = {
        ...payload,
        iat: now,
        exp: now + this.expirationTime,
        iss: 'mia-logistics-manager',
        aud: 'mia-logistics-users'
      };

      // Encode header
      const encodedHeader = this.base64UrlEncode(JSON.stringify(header));

      // Encode payload
      const encodedPayload = this.base64UrlEncode(JSON.stringify(claims));

      // Create signature
      const signature = this.createSignature(encodedHeader, encodedPayload);

      // Combine all parts
      const token = `${encodedHeader}.${encodedPayload}.${signature}`;

      console.log('✅ JWT token created successfully');
      return token;
    } catch (error) {
      console.error('❌ Error creating JWT token:', error);
      throw new Error('Failed to create JWT token');
    }
  }

  // Verify JWT token
  verifyToken(token) {
    try {
      if (!token || typeof token !== 'string') {
        return { valid: false, error: 'Invalid token format' };
      }

      const parts = token.split('.');
      if (parts.length !== 3) {
        return { valid: false, error: 'Invalid token structure' };
      }

      const [encodedHeader, encodedPayload, signature] = parts;

      // Verify signature
      const expectedSignature = this.createSignature(encodedHeader, encodedPayload);
      if (signature !== expectedSignature) {
        return { valid: false, error: 'Invalid signature' };
      }

      // Decode payload
      const payload = JSON.parse(this.base64UrlDecode(encodedPayload));

      // Check expiration
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp < now) {
        return { valid: false, error: 'Token expired' };
      }

      // Check issuer
      if (payload.iss !== 'mia-logistics-manager') {
        return { valid: false, error: 'Invalid issuer' };
      }

      // Check audience
      if (payload.aud !== 'mia-logistics-users') {
        return { valid: false, error: 'Invalid audience' };
      }

      console.log('✅ JWT token verified successfully');
      return { valid: true, payload };
    } catch (error) {
      console.error('❌ Error verifying JWT token:', error);
      return { valid: false, error: 'Token verification failed' };
    }
  }

  // Refresh JWT token
  refreshToken(token) {
    try {
      const verification = this.verifyToken(token);
      if (!verification.valid) {
        throw new Error('Invalid token cannot be refreshed');
      }

      const { payload } = verification;

      // Remove iat and exp from payload
      const { iat, exp, ...newPayload } = payload;

      // Create new token with same payload
      const newToken = this.createToken(newPayload);

      console.log('✅ JWT token refreshed successfully');
      return newToken;
    } catch (error) {
      console.error('❌ Error refreshing JWT token:', error);
      throw new Error('Failed to refresh token');
    }
  }

  // Decode JWT token (without verification)
  decodeToken(token) {
    try {
      if (!token || typeof token !== 'string') {
        return null;
      }

      const parts = token.split('.');
      if (parts.length !== 3) {
        return null;
      }

      const [, encodedPayload] = parts;
      const payload = JSON.parse(this.base64UrlDecode(encodedPayload));

      return payload;
    } catch (error) {
      console.error('❌ Error decoding JWT token:', error);
      return null;
    }
  }

  // Check if token is expired
  isTokenExpired(token) {
    try {
      const payload = this.decodeToken(token);
      if (!payload || !payload.exp) {
        return true;
      }

      const now = Math.floor(Date.now() / 1000);
      return payload.exp < now;
    } catch (error) {
      console.error('❌ Error checking token expiration:', error);
      return true;
    }
  }

  // Get token expiration time
  getTokenExpiration(token) {
    try {
      const payload = this.decodeToken(token);
      if (!payload || !payload.exp) {
        return null;
      }

      return new Date(payload.exp * 1000);
    } catch (error) {
      console.error('❌ Error getting token expiration:', error);
      return null;
    }
  }

  // Create signature
  createSignature(encodedHeader, encodedPayload) {
    const data = `${encodedHeader}.${encodedPayload}`;
    const signature = CryptoJS.HmacSHA256(data, this.secretKey);
    return this.base64UrlEncode(signature.toString());
  }

  // Base64 URL encode
  base64UrlEncode(str) {
    return btoa(str)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  // Base64 URL decode
  base64UrlDecode(str) {
    // Add padding if needed
    const padded = str + '='.repeat((4 - str.length % 4) % 4);
    const base64 = padded.replace(/-/g, '+').replace(/_/g, '/');
    return atob(base64);
  }

  // Generate secure random string
  generateSecureRandom(length = 32) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // Create refresh token
  createRefreshToken(userId) {
    const payload = {
      userId,
      type: 'refresh',
      tokenId: this.generateSecureRandom(16)
    };

    return this.createToken(payload);
  }

  // Verify refresh token
  verifyRefreshToken(token) {
    const verification = this.verifyToken(token);
    if (!verification.valid) {
      return verification;
    }

    const { payload } = verification;
    if (payload.type !== 'refresh') {
      return { valid: false, error: 'Invalid token type' };
    }

    return verification;
  }
}

export const jwtService = new JWTService();
export default jwtService;
