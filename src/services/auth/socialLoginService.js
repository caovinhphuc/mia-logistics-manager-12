// Social Login Service - Google, Facebook, GitHub integration
import { logService } from '../api/logService';

class SocialLoginService {
  constructor() {
    this.providers = {
      google: {
        name: 'Google',
        clientId: process.env.REACT_APP_GOOGLE_CLIENT_ID,
        scope: 'openid profile email',
        authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
        tokenUrl: 'https://oauth2.googleapis.com/token',
        userInfoUrl: 'https://www.googleapis.com/oauth2/v2/userinfo'
      },
      facebook: {
        name: 'Facebook',
        clientId: process.env.REACT_APP_FACEBOOK_CLIENT_ID,
        scope: 'email,public_profile',
        authUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
        tokenUrl: 'https://graph.facebook.com/v18.0/oauth/access_token',
        userInfoUrl: 'https://graph.facebook.com/me'
      },
      github: {
        name: 'GitHub',
        clientId: process.env.REACT_APP_GITHUB_CLIENT_ID,
        scope: 'user:email',
        authUrl: 'https://github.com/login/oauth/authorize',
        tokenUrl: 'https://github.com/login/oauth/access_token',
        userInfoUrl: 'https://api.github.com/user'
      },
      microsoft: {
        name: 'Microsoft',
        clientId: process.env.REACT_APP_MICROSOFT_CLIENT_ID,
        scope: 'openid profile email',
        authUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
        tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
        userInfoUrl: 'https://graph.microsoft.com/v1.0/me'
      }
    };

    this.redirectUri = `${window.location.origin}/auth/callback`;
    this.stateStore = new Map();
  }

  // Initialize social login
  initializeSocialLogin() {
    console.log('🔗 Initializing social login providers...');

    // Load Google API
    this.loadGoogleAPI();

    // Load Facebook SDK
    this.loadFacebookSDK();

    // Load GitHub API
    this.loadGitHubAPI();

    // Load Microsoft Graph API
    this.loadMicrosoftAPI();

    console.log('✅ Social login providers initialized');
  }

  // Load Google API
  loadGoogleAPI() {
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: this.providers.google.clientId,
        callback: this.handleGoogleCallback.bind(this),
        auto_select: false,
        cancel_on_tap_outside: false
      });
    }
  }

  // Load Facebook SDK
  loadFacebookSDK() {
    if (window.FB) {
      window.FB.init({
        appId: this.providers.facebook.clientId,
        cookie: true,
        xfbml: true,
        version: 'v18.0'
      });
    }
  }

  // Load GitHub API
  loadGitHubAPI() {
    // GitHub uses OAuth 2.0, no SDK needed
    console.log('GitHub API ready for OAuth 2.0');
  }

  // Load Microsoft API
  loadMicrosoftAPI() {
    // Microsoft uses MSAL library
    if (window.msal) {
      const msalConfig = {
        auth: {
          clientId: this.providers.microsoft.clientId,
          authority: 'https://login.microsoftonline.com/common',
          redirectUri: this.redirectUri
        },
        cache: {
          cacheLocation: 'sessionStorage',
          storeAuthStateInCookie: false
        }
      };

      this.msalInstance = new window.msal.PublicClientApplication(msalConfig);
    }
  }

  // Google login
  async loginWithGoogle() {
    try {
      console.log('🔄 Starting Google login...');

      if (window.google) {
        // Use Google Identity Services
        window.google.accounts.id.prompt();
      } else {
        // Fallback to OAuth 2.0
        this.redirectToProvider('google');
      }
    } catch (error) {
      console.error('❌ Google login error:', error);
      throw new Error('Google login failed');
    }
  }

  // Facebook login
  async loginWithFacebook() {
    try {
      console.log('🔄 Starting Facebook login...');

      return new Promise((resolve, reject) => {
        if (window.FB) {
          window.FB.login((response) => {
            if (response.authResponse) {
              this.handleFacebookCallback(response.authResponse)
                .then(resolve)
                .catch(reject);
            } else {
              reject(new Error('Facebook login cancelled'));
            }
          }, { scope: this.providers.facebook.scope });
        } else {
          this.redirectToProvider('facebook');
        }
      });
    } catch (error) {
      console.error('❌ Facebook login error:', error);
      throw new Error('Facebook login failed');
    }
  }

  // GitHub login
  async loginWithGitHub() {
    try {
      console.log('🔄 Starting GitHub login...');
      this.redirectToProvider('github');
    } catch (error) {
      console.error('❌ GitHub login error:', error);
      throw new Error('GitHub login failed');
    }
  }

  // Microsoft login
  async loginWithMicrosoft() {
    try {
      console.log('🔄 Starting Microsoft login...');

      if (this.msalInstance) {
        const loginRequest = {
          scopes: ['openid', 'profile', 'email']
        };

        const response = await this.msalInstance.loginPopup(loginRequest);
        return this.handleMicrosoftCallback(response);
      } else {
        this.redirectToProvider('microsoft');
      }
    } catch (error) {
      console.error('❌ Microsoft login error:', error);
      throw new Error('Microsoft login failed');
    }
  }

  // Redirect to provider
  redirectToProvider(provider) {
    const providerConfig = this.providers[provider];
    if (!providerConfig) {
      throw new Error(`Unsupported provider: ${provider}`);
    }

    const state = this.generateState();
    this.stateStore.set(state, { provider, timestamp: Date.now() });

    const params = new URLSearchParams({
      client_id: providerConfig.clientId,
      redirect_uri: this.redirectUri,
      scope: providerConfig.scope,
      response_type: 'code',
      state: state,
      access_type: 'offline',
      prompt: 'consent'
    });

    const authUrl = `${providerConfig.authUrl}?${params.toString()}`;
    window.location.href = authUrl;
  }

  // Handle Google callback
  async handleGoogleCallback(response) {
    try {
      console.log('🔄 Handling Google callback...');

      const userInfo = {
        id: response.sub,
        email: response.email,
        name: response.name,
        picture: response.picture,
        provider: 'google'
      };

      return await this.processSocialLogin(userInfo);
    } catch (error) {
      console.error('❌ Google callback error:', error);
      throw error;
    }
  }

  // Handle Facebook callback
  async handleFacebookCallback(authResponse) {
    try {
      console.log('🔄 Handling Facebook callback...');

      // Get user info
      const userInfo = await this.getFacebookUserInfo(authResponse.access_token);

      return await this.processSocialLogin(userInfo);
    } catch (error) {
      console.error('❌ Facebook callback error:', error);
      throw error;
    }
  }

  // Handle GitHub callback
  async handleGitHubCallback(code, state) {
    try {
      console.log('🔄 Handling GitHub callback...');

      // Verify state
      if (!this.verifyState(state)) {
        throw new Error('Invalid state parameter');
      }

      // Exchange code for token
      const token = await this.exchangeCodeForToken('github', code);

      // Get user info
      const userInfo = await this.getGitHubUserInfo(token);

      return await this.processSocialLogin(userInfo);
    } catch (error) {
      console.error('❌ GitHub callback error:', error);
      throw error;
    }
  }

  // Handle Microsoft callback
  async handleMicrosoftCallback(response) {
    try {
      console.log('🔄 Handling Microsoft callback...');

      const userInfo = {
        id: response.account.homeAccountId,
        email: response.account.username,
        name: response.account.name,
        picture: null,
        provider: 'microsoft'
      };

      return await this.processSocialLogin(userInfo);
    } catch (error) {
      console.error('❌ Microsoft callback error:', error);
      throw error;
    }
  }

  // Process social login
  async processSocialLogin(userInfo) {
    try {
      console.log(`🔄 Processing ${userInfo.provider} login for: ${userInfo.email}`);

      // Check if user exists
      let user = await this.findUserBySocialId(userInfo.id, userInfo.provider);

      if (!user) {
        // Check if user exists by email
        user = await this.findUserByEmail(userInfo.email);

        if (user) {
          // Link social account to existing user
          await this.linkSocialAccount(user.id, userInfo.id, userInfo.provider);
        } else {
          // Create new user
          user = await this.createSocialUser(userInfo);
        }
      }

      // Create session
      const session = await this.createSocialSession(user);

      // Log social login
      logService.log('auth', 'Social login successful', {
        userId: user.id,
        provider: userInfo.provider,
        email: userInfo.email
      });

      console.log(`✅ ${userInfo.provider} login successful for: ${userInfo.email}`);

      return {
        success: true,
        user: user,
        session: session,
        provider: userInfo.provider
      };
    } catch (error) {
      console.error('❌ Social login processing error:', error);
      throw error;
    }
  }

  // Get Facebook user info
  async getFacebookUserInfo(accessToken) {
    try {
      const response = await fetch(`${this.providers.facebook.userInfoUrl}?fields=id,name,email,picture&access_token=${accessToken}`);
      const data = await response.json();

      return {
        id: data.id,
        email: data.email,
        name: data.name,
        picture: data.picture?.data?.url,
        provider: 'facebook'
      };
    } catch (error) {
      throw new Error('Failed to get Facebook user info');
    }
  }

  // Get GitHub user info
  async getGitHubUserInfo(accessToken) {
    try {
      const response = await fetch(this.providers.github.userInfoUrl, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });
      const data = await response.json();

      // Get email from GitHub
      const emailResponse = await fetch('https://api.github.com/user/emails', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });
      const emails = await emailResponse.json();
      const primaryEmail = emails.find(email => email.primary)?.email || emails[0]?.email;

      return {
        id: data.id.toString(),
        email: primaryEmail,
        name: data.name || data.login,
        picture: data.avatar_url,
        provider: 'github'
      };
    } catch (error) {
      throw new Error('Failed to get GitHub user info');
    }
  }

  // Exchange code for token
  async exchangeCodeForToken(provider, code) {
    try {
      const providerConfig = this.providers[provider];

      const response = await fetch(providerConfig.tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        body: new URLSearchParams({
          client_id: providerConfig.clientId,
          client_secret: this.getClientSecret(provider),
          code: code,
          redirect_uri: this.redirectUri,
          grant_type: 'authorization_code'
        })
      });

      const data = await response.json();
      return data.access_token;
    } catch (error) {
      throw new Error(`Failed to exchange code for token: ${provider}`);
    }
  }

  // Generate state parameter
  generateState() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  // Verify state parameter
  verifyState(state) {
    const storedState = this.stateStore.get(state);
    if (!storedState) {
      return false;
    }

    // Check if state is not too old (5 minutes)
    const now = Date.now();
    if (now - storedState.timestamp > 300000) {
      this.stateStore.delete(state);
      return false;
    }

    this.stateStore.delete(state);
    return true;
  }

  // Get client secret (mock implementation)
  getClientSecret(provider) {
    const secrets = {
      google: process.env.REACT_APP_GOOGLE_CLIENT_SECRET,
      facebook: process.env.REACT_APP_FACEBOOK_CLIENT_SECRET,
      github: process.env.REACT_APP_GITHUB_CLIENT_SECRET,
      microsoft: process.env.REACT_APP_MICROSOFT_CLIENT_SECRET
    };

    return secrets[provider];
  }

  // Find user by social ID
  async findUserBySocialId(socialId, provider) {
    // Mock implementation - in production, query database
    const socialUsers = JSON.parse(localStorage.getItem('social_users') || '[]');
    const socialUser = socialUsers.find(u => u.socialId === socialId && u.provider === provider);

    if (socialUser) {
      return {
        id: socialUser.userId,
        email: socialUser.email,
        name: socialUser.name,
        provider: provider
      };
    }

    return null;
  }

  // Find user by email
  async findUserByEmail(email) {
    // Mock implementation - in production, query database
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    return users.find(u => u.email === email);
  }

  // Link social account
  async linkSocialAccount(userId, socialId, provider) {
    // Mock implementation - in production, update database
    const socialUsers = JSON.parse(localStorage.getItem('social_users') || '[]');
    socialUsers.push({
      userId,
      socialId,
      provider,
      linkedAt: new Date().toISOString()
    });
    localStorage.setItem('social_users', JSON.stringify(socialUsers));
  }

  // Create social user
  async createSocialUser(userInfo) {
    // Mock implementation - in production, create in database
    const user = {
      id: Date.now(),
      email: userInfo.email,
      name: userInfo.name,
      picture: userInfo.picture,
      provider: userInfo.provider,
      role: 'viewer',
      isActive: true,
      createdAt: new Date().toISOString()
    };

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    users.push(user);
    localStorage.setItem('users', JSON.stringify(users));

    // Link social account
    await this.linkSocialAccount(user.id, userInfo.id, userInfo.provider);

    return user;
  }

  // Create social session
  async createSocialSession(user) {
    const session = {
      id: `session_${user.id}_${Date.now()}`,
      userId: user.id,
      provider: user.provider,
      createdAt: Date.now(),
      expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
    };

    return session;
  }

  // Unlink social account
  async unlinkSocialAccount(userId, provider) {
    try {
      // Mock implementation - in production, remove from database
      const socialUsers = JSON.parse(localStorage.getItem('social_users') || '[]');
      const updatedSocialUsers = socialUsers.filter(u => !(u.userId === userId && u.provider === provider));
      localStorage.setItem('social_users', JSON.stringify(updatedSocialUsers));

      console.log(`✅ Social account unlinked: ${provider}`);

      // Log unlink
      logService.log('auth', 'Social account unlinked', {
        userId,
        provider,
        timestamp: new Date().toISOString()
      });

      return { success: true };
    } catch (error) {
      console.error('❌ Error unlinking social account:', error);
      throw error;
    }
  }

  // Get linked social accounts
  async getLinkedSocialAccounts(userId) {
    // Mock implementation - in production, query database
    const socialUsers = JSON.parse(localStorage.getItem('social_users') || '[]');
    return socialUsers.filter(u => u.userId === userId);
  }

  // Get social login statistics
  getSocialLoginStatistics() {
    // Mock implementation - in production, query database
    return {
      totalSocialLogins: 150,
      googleLogins: 60,
      facebookLogins: 40,
      githubLogins: 30,
      microsoftLogins: 20,
      linkedAccounts: 75,
      newUsersFromSocial: 25
    };
  }
}

export const socialLoginService = new SocialLoginService();
export default socialLoginService;
