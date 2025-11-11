/**
 * Email Notifier Service
 * Gửi thông báo qua Email khi có vấn đề với hệ thống
 */

const nodemailer = require('nodemailer');

class EmailNotifier {
  constructor() {
    this.transporter = null;
    this.enabled = false;
    this.initialize();
  }

  /**
   * Khởi tạo email transporter
   */
  initialize() {
    try {
      // Gmail configuration
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER || '',
          pass: process.env.EMAIL_PASS || ''
        }
      });

      this.enabled = process.env.EMAIL_USER && process.env.EMAIL_PASS;
      
      if (this.enabled) {
        console.log('✅ Email notifier initialized');
      } else {
        console.log('⚠️ Email notifier disabled - missing credentials');
      }
    } catch (error) {
      console.error('❌ Email notifier initialization failed:', error.message);
      this.enabled = false;
    }
  }

  /**
   * Gửi email thông báo
   */
  async sendEmail(subject, message, html = null) {
    if (!this.enabled) {
      console.log('⚠️ Email notifier disabled - missing credentials');
      return false;
    }

    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_TO || process.env.EMAIL_USER,
        subject: subject,
        text: message,
        html: html || message
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Email notification sent successfully');
      return true;
    } catch (error) {
      console.error('❌ Email notification error:', error.message);
      return false;
    }
  }

  /**
   * Gửi thông báo khởi động hệ thống
   */
  async sendStartupNotification() {
    const subject = '🚀 MIA Logistics Manager Started';
    const message = `MIA Logistics Manager Started

Time: ${new Date().toLocaleString('vi-VN')}
Frontend: http://localhost:3000
Backend: http://localhost:3001
Health Check: http://localhost:3001/health

System Status: All services running`;

    const html = `
      <h2>🚀 MIA Logistics Manager Started</h2>
      <p><strong>Time:</strong> ${new Date().toLocaleString('vi-VN')}</p>
      <p><strong>Frontend:</strong> <a href="http://localhost:3000">http://localhost:3000</a></p>
      <p><strong>Backend:</strong> <a href="http://localhost:3001">http://localhost:3001</a></p>
      <p><strong>Health Check:</strong> <a href="http://localhost:3001/health">http://localhost:3001/health</a></p>
      <p><strong>System Status:</strong> All services running</p>
    `;

    return await this.sendEmail(subject, message, html);
  }

  /**
   * Gửi thông báo lỗi hệ thống
   */
  async sendErrorNotification(service, error) {
    const subject = '❌ MIA Logistics Manager Error';
    const message = `MIA Logistics Manager Error

Time: ${new Date().toLocaleString('vi-VN')}
Service: ${service}
Error: ${error}

Action Required: Please check the system`;

    const html = `
      <h2>❌ MIA Logistics Manager Error</h2>
      <p><strong>Time:</strong> ${new Date().toLocaleString('vi-VN')}</p>
      <p><strong>Service:</strong> ${service}</p>
      <p><strong>Error:</strong> ${error}</p>
      <p><strong>Action Required:</strong> Please check the system</p>
    `;

    return await this.sendEmail(subject, message, html);
  }

  /**
   * Gửi thông báo cảnh báo
   */
  async sendWarningNotification(service, warning) {
    const subject = '⚠️ MIA Logistics Manager Warning';
    const message = `MIA Logistics Manager Warning

Time: ${new Date().toLocaleString('vi-VN')}
Service: ${service}
Warning: ${warning}

Note: System is running but may have issues`;

    const html = `
      <h2>⚠️ MIA Logistics Manager Warning</h2>
      <p><strong>Time:</strong> ${new Date().toLocaleString('vi-VN')}</p>
      <p><strong>Service:</strong> ${service}</p>
      <p><strong>Warning:</strong> ${warning}</p>
      <p><strong>Note:</strong> System is running but may have issues</p>
    `;

    return await this.sendEmail(subject, message, html);
  }

  /**
   * Test kết nối Email
   */
  async testConnection() {
    if (!this.enabled) {
      return { success: false, error: 'Email notifier disabled' };
    }

    try {
      await this.transporter.verify();
      return { 
        success: true, 
        message: 'Email connection successful'
      };
    } catch (error) {
      return { 
        success: false, 
        error: error.message
      };
    }
  }
}

module.exports = EmailNotifier;
