/**
 * Connection Checker Service
 * Kiểm tra kết nối các services: Google Sheets, Email, Telegram
 */

const axios = require('axios');
const TelegramNotifier = require('./telegram-notifier');
const EmailNotifier = require('./email-notifier');

class ConnectionChecker {
  constructor() {
    this.telegramNotifier = new TelegramNotifier();
    this.emailNotifier = new EmailNotifier();
    this.results = {
      googleSheets: { success: false, error: null },
      email: { success: false, error: null },
      telegram: { success: false, error: null },
      backend: { success: false, error: null },
      frontend: { success: false, error: null }
    };
  }

  /**
   * Kiểm tra kết nối Google Sheets
   */
  async checkGoogleSheets() {
    try {
      console.log('🔍 Checking Google Sheets connection...');
      
      const response = await axios.get('http://localhost:3001/api/sheets/test', {
        timeout: 10000
      });

      if (response.data.success) {
        console.log('✅ Google Sheets connection successful');
        this.results.googleSheets = { success: true, error: null };
        return true;
      } else {
        console.log('❌ Google Sheets connection failed');
        this.results.googleSheets = { success: false, error: 'API returned failure' };
        return false;
      }
    } catch (error) {
      console.log('❌ Google Sheets connection failed:', error.message);
      this.results.googleSheets = { success: false, error: error.message };
      return false;
    }
  }

  /**
   * Kiểm tra kết nối Email
   */
  async checkEmail() {
    try {
      console.log('🔍 Checking Email connection...');
      
      const result = await this.emailNotifier.testConnection();
      
      if (result.success) {
        console.log('✅ Email connection successful');
        this.results.email = { success: true, error: null };
        return true;
      } else {
        console.log('❌ Email connection failed:', result.error);
        this.results.email = { success: false, error: result.error };
        return false;
      }
    } catch (error) {
      console.log('❌ Email connection failed:', error.message);
      this.results.email = { success: false, error: error.message };
      return false;
    }
  }

  /**
   * Kiểm tra kết nối Telegram
   */
  async checkTelegram() {
    try {
      console.log('🔍 Checking Telegram connection...');
      
      const result = await this.telegramNotifier.testConnection();
      
      if (result.success) {
        console.log('✅ Telegram connection successful');
        this.results.telegram = { success: true, error: null };
        return true;
      } else {
        console.log('❌ Telegram connection failed:', result.error);
        this.results.telegram = { success: false, error: result.error };
        return false;
      }
    } catch (error) {
      console.log('❌ Telegram connection failed:', error.message);
      this.results.telegram = { success: false, error: error.message };
      return false;
    }
  }

  /**
   * Kiểm tra kết nối Backend
   */
  async checkBackend() {
    try {
      console.log('🔍 Checking Backend connection...');
      
      const response = await axios.get('http://localhost:3001/health', {
        timeout: 10000
      });

      if (response.data.status === 'healthy') {
        console.log('✅ Backend connection successful');
        this.results.backend = { success: true, error: null };
        return true;
      } else {
        console.log('❌ Backend connection failed');
        this.results.backend = { success: false, error: 'Backend not healthy' };
        return false;
      }
    } catch (error) {
      console.log('❌ Backend connection failed:', error.message);
      this.results.backend = { success: false, error: error.message };
      return false;
    }
  }

  /**
   * Kiểm tra kết nối Frontend
   */
  async checkFrontend() {
    try {
      console.log('🔍 Checking Frontend connection...');
      
      const response = await axios.get('http://localhost:3000', {
        timeout: 10000
      });

      if (response.status === 200) {
        console.log('✅ Frontend connection successful');
        this.results.frontend = { success: true, error: null };
        return true;
      } else {
        console.log('❌ Frontend connection failed');
        this.results.frontend = { success: false, error: `HTTP ${response.status}` };
        return false;
      }
    } catch (error) {
      console.log('❌ Frontend connection failed:', error.message);
      this.results.frontend = { success: false, error: error.message };
      return false;
    }
  }

  /**
   * Kiểm tra tất cả kết nối
   */
  async checkAllConnections() {
    console.log('🔍 Checking all connections...');
    
    const results = await Promise.allSettled([
      this.checkBackend(),
      this.checkFrontend(),
      this.checkGoogleSheets(),
      this.checkEmail(),
      this.checkTelegram()
    ]);

    console.log('📊 Connection check completed');
    return this.results;
  }

  /**
   * Gửi thông báo kết quả kiểm tra
   */
  async sendNotificationResults() {
    const failedServices = [];
    const successServices = [];

    Object.entries(this.results).forEach(([service, result]) => {
      if (result.success) {
        successServices.push(service);
      } else {
        failedServices.push(service);
      }
    });

    // Gửi thông báo qua Telegram nếu có lỗi
    if (failedServices.length > 0) {
      const errorMessage = `❌ *Connection Check Failed*

📅 *Time:* ${new Date().toLocaleString('vi-VN')}
❌ *Failed Services:* ${failedServices.join(', ')}
✅ *Success Services:* ${successServices.join(', ')}

⚠️ *Action Required:* Please check the failed services`;

      await this.telegramNotifier.sendMessage(errorMessage);
    }

    // Gửi thông báo qua Email nếu có lỗi
    if (failedServices.length > 0) {
      const errorMessage = `Connection Check Failed

Time: ${new Date().toLocaleString('vi-VN')}
Failed Services: ${failedServices.join(', ')}
Success Services: ${successServices.join(', ')}

Action Required: Please check the failed services`;

      await this.emailNotifier.sendEmail(
        '❌ MIA Logistics Manager - Connection Check Failed',
        errorMessage
      );
    }

    // Gửi thông báo thành công nếu tất cả đều OK
    if (failedServices.length === 0) {
      const successMessage = `✅ *All Connections Successful*

📅 *Time:* ${new Date().toLocaleString('vi-VN')}
✅ *All Services:* ${successServices.join(', ')}

🎉 *System Status:* All services running properly`;

      await this.telegramNotifier.sendMessage(successMessage);
    }

    return {
      failed: failedServices,
      success: successServices,
      total: Object.keys(this.results).length
    };
  }

  /**
   * Hiển thị kết quả kiểm tra
   */
  displayResults() {
    console.log('\n📊 Connection Check Results:');
    console.log('============================');
    
    Object.entries(this.results).forEach(([service, result]) => {
      const status = result.success ? '✅' : '❌';
      const message = result.success ? 'Connected' : `Failed: ${result.error}`;
      console.log(`${status} ${service}: ${message}`);
    });
    
    console.log('============================');
  }
}

// Run if called directly
if (require.main === module) {
  const checker = new ConnectionChecker();
  
  checker.checkAllConnections()
    .then(() => {
      checker.displayResults();
      return checker.sendNotificationResults();
    })
    .then((results) => {
      console.log('\n📊 Notification Results:');
      console.log(`Failed: ${results.failed.join(', ') || 'None'}`);
      console.log(`Success: ${results.success.join(', ')}`);
      console.log(`Total: ${results.total}`);
    })
    .catch((error) => {
      console.error('❌ Connection check failed:', error);
      process.exit(1);
    });
}

module.exports = ConnectionChecker;
