/**
 * Connection Status Service
 * Monitors backend API and Google Sheets connection status
 */

class ConnectionStatusService {
  constructor() {
    this.backendUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
    this.checkInterval = 10000; // 10 seconds
    this.timeout = 5000; // 5 seconds
    this.status = {
      backend: false,
      googleSheets: false,
      lastCheck: null,
      isChecking: false
    };
    this.listeners = [];
    this.intervalId = null;
  }

  /**
   * Start monitoring connections
   */
  startMonitoring() {
    if (this.intervalId) {
      return;
    }

    // Initial check
    this.checkConnections();

    // Set up interval
    this.intervalId = setInterval(() => {
      this.checkConnections();
    }, this.checkInterval);

    console.log('🔗 Connection monitoring started');
  }

  /**
   * Stop monitoring connections
   */
  stopMonitoring() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    console.log('🔗 Connection monitoring stopped');
  }

  /**
   * Check all connections
   */
  async checkConnections() {
    if (this.status.isChecking) {
      return;
    }

    this.status.isChecking = true;
    this.status.lastCheck = new Date();

    try {
      // Check backend connection
      const backendStatus = await this.checkBackendConnection();

      // Check Google Sheets connection
      const googleSheetsStatus = await this.checkGoogleSheetsConnection();

      // Update status
      this.status.backend = backendStatus;
      this.status.googleSheets = googleSheetsStatus;

      // Notify listeners
      this.notifyListeners();

    } catch (error) {
      console.error('Connection check error:', error);
      this.status.backend = false;
      this.status.googleSheets = false;
      this.notifyListeners();
    } finally {
      this.status.isChecking = false;
    }
  }

  /**
   * Check backend API connection
   */
  async checkBackendConnection() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(`${this.backendUrl}/health`, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        return data.status === 'healthy';
      }

      return false;
    } catch (error) {
      console.warn('Backend connection check failed:', error.message);
      return false;
    }
  }

  /**
   * Check Google Sheets connection
   */
  async checkGoogleSheetsConnection() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(`${this.backendUrl}/api/sheets/test`, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        return data.success === true;
      }

      return false;
    } catch (error) {
      console.warn('Google Sheets connection check failed:', error.message);
      return false;
    }
  }

  /**
   * Get current connection status
   */
  getStatus() {
    return { ...this.status };
  }

  /**
   * Check if all connections are healthy
   */
  isAllConnected() {
    return this.status.backend && this.status.googleSheets;
  }

  /**
   * Check if backend is connected
   */
  isBackendConnected() {
    return this.status.backend;
  }

  /**
   * Check if Google Sheets is connected
   */
  isGoogleSheetsConnected() {
    return this.status.googleSheets;
  }

  /**
   * Add status change listener
   */
  addListener(callback) {
    this.listeners.push(callback);
  }

  /**
   * Remove status change listener
   */
  removeListener(callback) {
    this.listeners = this.listeners.filter(listener => listener !== callback);
  }

  /**
   * Notify all listeners of status change
   */
  notifyListeners() {
    this.listeners.forEach(listener => {
      try {
        listener(this.getStatus());
      } catch (error) {
        console.error('Listener error:', error);
      }
    });
  }

  /**
   * Get connection status summary
   */
  getStatusSummary() {
    const { backend, googleSheets, lastCheck, isChecking } = this.status;

    return {
      backend: {
        connected: backend,
        status: backend ? 'connected' : 'disconnected',
        color: backend ? 'green' : 'red'
      },
      googleSheets: {
        connected: googleSheets,
        status: googleSheets ? 'connected' : 'disconnected',
        color: googleSheets ? 'green' : 'red'
      },
      overall: {
        connected: backend && googleSheets,
        status: backend && googleSheets ? 'all_connected' : 'partial_disconnected',
        color: backend && googleSheets ? 'green' : 'orange'
      },
      lastCheck,
      isChecking
    };
  }
}

// Create singleton instance
const connectionStatusService = new ConnectionStatusService();

export default connectionStatusService;
