/**
 * Telegram Notifier Service
 * Gửi thông báo qua Telegram khi có vấn đề với hệ thống
 */

const axios = require('axios');

class TelegramNotifier {
  constructor() {
    this.botToken = process.env.TELEGRAM_BOT_TOKEN || '';
    this.chatId = process.env.TELEGRAM_CHAT_ID || '';
    this.enabled = this.botToken && this.chatId;
  }

  /**
   * Gửi thông báo qua Telegram
   */
  async sendMessage(message, parseMode = 'Markdown') {
    if (!this.enabled) {
      console.log('⚠️ Telegram notifier disabled - missing bot token or chat ID');
      return false;
    }

    try {
      const response = await axios.post(`https://api.telegram.org/bot${this.botToken}/sendMessage`, {
        chat_id: this.chatId,
        text: message,
        parse_mode: parseMode
      });

      if (response.data.ok) {
        console.log('✅ Telegram notification sent successfully');
        return true;
      } else {
        console.error('❌ Failed to send Telegram notification:', response.data);
        return false;
      }
    } catch (error) {
      console.error('❌ Telegram notification error:', error.message);
      return false;
    }
  }

  /**
   * Gửi thông báo khởi động hệ thống
   */
  async sendStartupNotification() {
    const message = `🚀 *MIA Logistics Manager Started*

📅 *Time:* ${new Date().toLocaleString('vi-VN')}
🌐 *Frontend:* http://localhost:3000
🔧 *Backend:* http://localhost:3001
📊 *Health Check:* http://localhost:3001/health

✅ *System Status:* All services running`;

    return await this.sendMessage(message);
  }

  /**
   * Gửi thông báo lỗi hệ thống
   */
  async sendErrorNotification(service, error) {
    const message = `❌ *MIA Logistics Manager Error*

📅 *Time:* ${new Date().toLocaleString('vi-VN')}
🔧 *Service:* ${service}
❌ *Error:* ${error}

⚠️ *Action Required:* Please check the system`;

    return await this.sendMessage(message);
  }

  /**
   * Gửi thông báo cảnh báo
   */
  async sendWarningNotification(service, warning) {
    const message = `⚠️ *MIA Logistics Manager Warning*

📅 *Time:* ${new Date().toLocaleString('vi-VN')}
🔧 *Service:* ${service}
⚠️ *Warning:* ${warning}

📝 *Note:* System is running but may have issues`;

    return await this.sendMessage(message);
  }

  /**
   * Gửi thông báo kết nối thành công
   */
  async sendConnectionSuccessNotification(service, details) {
    const message = `✅ *MIA Logistics Manager Connection Success*

📅 *Time:* ${new Date().toLocaleString('vi-VN')}
🔧 *Service:* ${service}
✅ *Status:* Connected successfully
📊 *Details:* ${details}`;

    return await this.sendMessage(message);
  }

  /**
   * Gửi thông báo kết nối thất bại
   */
  async sendConnectionFailureNotification(service, error) {
    const message = `❌ *MIA Logistics Manager Connection Failed*

📅 *Time:* ${new Date().toLocaleString('vi-VN')}
🔧 *Service:* ${service}
❌ *Error:* ${error}

⚠️ *Action Required:* Please check the connection`;

    return await this.sendMessage(message);
  }

  /**
   * Test kết nối Telegram
   */
  async testConnection() {
    if (!this.enabled) {
      return { success: false, error: 'Telegram notifier disabled' };
    }

    try {
      const response = await axios.get(`https://api.telegram.org/bot${this.botToken}/getMe`);
      
      if (response.data.ok) {
        return { 
          success: true, 
          botInfo: response.data.result,
          message: 'Telegram connection successful'
        };
      } else {
        return { 
          success: false, 
          error: 'Invalid bot token or chat ID'
        };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error.message
      };
    }
  }
}

module.exports = TelegramNotifier;
