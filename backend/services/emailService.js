import sgMail from '@sendgrid/mail'
import handlebars from 'handlebars'
import mjml from 'mjml'
import nodemailer from 'nodemailer'
import { notificationConfig } from '../config/notification.js'

class EmailService {
  constructor() {
    this.sendgridClient = null
    this.nodemailerTransporter = null
    this.templates = new Map()
    this.isInitialized = false
    this.init()
  }

  init() {
    // Initialize SendGrid
    if (notificationConfig.email.sendgrid.enabled) {
      sgMail.setApiKey(notificationConfig.email.sendgrid.apiKey)
      this.sendgridClient = sgMail
      console.log('📧 Email SendGrid: ✅ ĐÃ KHỞI TẠO')
    }

    // Initialize Nodemailer as fallback
    if (notificationConfig.email.nodemailer.enabled) {
      this.nodemailerTransporter = nodemailer.createTransport({
        host: notificationConfig.email.nodemailer.host,
        port: notificationConfig.email.nodemailer.port,
        secure: notificationConfig.email.nodemailer.secure,
        auth: notificationConfig.email.nodemailer.auth,
      })
      console.log('📧 Nodemailer Email: ✅ ĐÃ KHỞI TẠO')
    }

    this.loadTemplates()
    this.isInitialized = true
  }

  loadTemplates() {
    // Load email templates
    this.templates.set('carrier-update', this.getCarrierUpdateTemplate())
    this.templates.set('order-status', this.getOrderStatusTemplate())
    this.templates.set('system-alert', this.getSystemAlertTemplate())
    this.templates.set('daily-report', this.getDailyReportTemplate())
    this.templates.set('weekly-report', this.getWeeklyReportTemplate())
    this.templates.set('monthly-report', this.getMonthlyReportTemplate())

    // Map notification template names to email template names
    this.templateMapping = {
      carrierUpdate: 'carrier-update',
      orderStatus: 'order-status',
      systemAlert: 'system-alert',
      dailyReport: 'daily-report',
      weeklyReport: 'weekly-report',
      monthlyReport: 'monthly-report',
    }
  }

  getCarrierUpdateTemplate() {
    const mjmlTemplate = `
      <mjml>
        <mj-head>
          <mj-title>MIA Logistics - Cập nhật Nhà vận chuyển</mj-title>
          <mj-font name="Roboto" href="https://fonts.googleapis.com/css?family=Roboto" />
          <mj-attributes>
            <mj-all font-family="Roboto, Arial, sans-serif" />
          </mj-attributes>
        </mj-head>
        <mj-body background-color="#f4f4f4">
          <mj-section background-color="#ffffff" padding="20px">
            <mj-column>
              <mj-text font-size="24px" font-weight="bold" color="#2c3e50" align="center">
                🚚 Cập nhật Nhà vận chuyển
              </mj-text>
              <mj-divider border-color="#ecf0f1" />
              <mj-text font-size="16px" color="#34495e">
                <strong>Tên nhà vận chuyển:</strong> {{carrierName}}
              </mj-text>
              <mj-text font-size="16px" color="#34495e">
                <strong>Khu vực hoạt động:</strong> {{serviceAreas}}
              </mj-text>
              <mj-text font-size="16px" color="#34495e">
                <strong>Phương thức tính giá:</strong> {{pricingMethod}}
              </mj-text>
              <mj-text font-size="16px" color="#34495e">
                <strong>Liên hệ:</strong> {{contact}}
              </mj-text>
              <mj-text font-size="16px" color="#34495e">
                <strong>Trạng thái:</strong> {{status}}
              </mj-text>
              <mj-divider border-color="#ecf0f1" />
              <mj-text font-size="14px" color="#7f8c8d" align="center">
                Thời gian cập nhật: {{timestamp}}
              </mj-text>
            </mj-column>
          </mj-section>
        </mj-body>
      </mjml>
    `

    return handlebars.compile(mjml(mjmlTemplate).html)
  }

  getOrderStatusTemplate() {
    const mjmlTemplate = `
      <mjml>
        <mj-head>
          <mj-title>MIA Logistics - Cập nhật Đơn hàng</mj-title>
          <mj-font name="Roboto" href="https://fonts.googleapis.com/css?family=Roboto" />
          <mj-attributes>
            <mj-all font-family="Roboto, Arial, sans-serif" />
          </mj-attributes>
        </mj-head>
        <mj-body background-color="#f4f4f4">
          <mj-section background-color="#ffffff" padding="20px">
            <mj-column>
              <mj-text font-size="24px" font-weight="bold" color="#2c3e50" align="center">
                📦 Cập nhật Đơn hàng
              </mj-text>
              <mj-divider border-color="#ecf0f1" />
              <mj-text font-size="16px" color="#34495e">
                <strong>Mã đơn hàng:</strong> {{orderId}}
              </mj-text>
              <mj-text font-size="16px" color="#34495e">
                <strong>Khách hàng:</strong> {{customerName}}
              </mj-text>
              <mj-text font-size="16px" color="#34495e">
                <strong>Địa chỉ:</strong> {{address}}
              </mj-text>
              <mj-text font-size="16px" color="#34495e">
                <strong>Giá trị:</strong> {{value}}
              </mj-text>
              <mj-text font-size="16px" color="#34495e">
                <strong>Trạng thái:</strong> {{status}}
              </mj-text>
              <mj-divider border-color="#ecf0f1" />
              <mj-text font-size="14px" color="#7f8c8d" align="center">
                Cập nhật lúc: {{timestamp}}
              </mj-text>
            </mj-column>
          </mj-section>
        </mj-body>
      </mjml>
    `

    return handlebars.compile(mjml(mjmlTemplate).html)
  }

  getSystemAlertTemplate() {
    const mjmlTemplate = `
      <mjml>
        <mj-head>
          <mj-title>MIA Logistics - Cảnh báo Hệ thống</mj-title>
          <mj-font name="Roboto" href="https://fonts.googleapis.com/css?family=Roboto" />
          <mj-attributes>
            <mj-all font-family="Roboto, Arial, sans-serif" />
          </mj-attributes>
        </mj-head>
        <mj-body background-color="#f4f4f4">
          <mj-section background-color="#ffffff" padding="20px">
            <mj-column>
              <mj-text font-size="24px" font-weight="bold" color="#e74c3c" align="center">
                ⚠️ Cảnh báo Hệ thống
              </mj-text>
              <mj-divider border-color="#ecf0f1" />
              <mj-text font-size="16px" color="#34495e">
                <strong>Loại cảnh báo:</strong> {{alertType}}
              </mj-text>
              <mj-text font-size="16px" color="#34495e">
                <strong>Mô tả:</strong> {{description}}
              </mj-text>
              <mj-text font-size="16px" color="#34495e">
                <strong>Hành động cần thiết:</strong> {{action}}
              </mj-text>
              <mj-divider border-color="#ecf0f1" />
              <mj-text font-size="14px" color="#7f8c8d" align="center">
                Thời gian: {{timestamp}}
              </mj-text>
            </mj-column>
          </mj-section>
        </mj-body>
      </mjml>
    `

    return handlebars.compile(mjml(mjmlTemplate).html)
  }

  getDailyReportTemplate() {
    const mjmlTemplate = `
      <mjml>
        <mj-head>
          <mj-title>MIA Logistics - Báo cáo Hàng ngày</mj-title>
          <mj-font name="Roboto" href="https://fonts.googleapis.com/css?family=Roboto" />
          <mj-attributes>
            <mj-all font-family="Roboto, Arial, sans-serif" />
          </mj-attributes>
        </mj-head>
        <mj-body background-color="#f4f4f4">
          <mj-section background-color="#ffffff" padding="20px">
            <mj-column>
              <mj-text font-size="24px" font-weight="bold" color="#2c3e50" align="center">
                📊 Báo cáo Hàng ngày
              </mj-text>
              <mj-text font-size="18px" color="#7f8c8d" align="center">
                {{date}}
              </mj-text>
              <mj-divider border-color="#ecf0f1" />
              <mj-text font-size="16px" color="#34495e">
                <strong>Nhà vận chuyển:</strong> {{carrierCount}}
              </mj-text>
              <mj-text font-size="16px" color="#34495e">
                <strong>Đơn hàng:</strong> {{orderCount}}
              </mj-text>
              <mj-text font-size="16px" color="#34495e">
                <strong>Doanh thu:</strong> {{revenue}}
              </mj-text>
              <mj-text font-size="16px" color="#34495e">
                <strong>So với hôm qua:</strong> {{comparison}}
              </mj-text>
              <mj-divider border-color="#ecf0f1" />
              <mj-text font-size="14px" color="#7f8c8d" align="center">
                Báo cáo tự động từ MIA Logistics Manager
              </mj-text>
            </mj-column>
          </mj-section>
        </mj-body>
      </mjml>
    `

    return handlebars.compile(mjml(mjmlTemplate).html)
  }

  getWeeklyReportTemplate() {
    const mjmlTemplate = `
      <mjml>
        <mj-head>
          <mj-title>MIA Logistics - Báo cáo Hàng tuần</mj-title>
          <mj-font name="Roboto" href="https://fonts.googleapis.com/css?family=Roboto" />
          <mj-attributes>
            <mj-all font-family="Roboto, Arial, sans-serif" />
          </mj-attributes>
        </mj-head>
        <mj-body background-color="#f4f4f4">
          <mj-section background-color="#ffffff" padding="20px">
            <mj-column>
              <mj-text font-size="24px" font-weight="bold" color="#2c3e50" align="center">
                📈 Báo cáo Hàng tuần
              </mj-text>
              <mj-text font-size="18px" color="#7f8c8d" align="center">
                Tuần {{weekNumber}} - {{year}}
              </mj-text>
              <mj-divider border-color="#ecf0f1" />
              <mj-text font-size="16px" color="#34495e">
                <strong>Tổng đơn hàng:</strong> {{totalOrders}}
              </mj-text>
              <mj-text font-size="16px" color="#34495e">
                <strong>Doanh thu tuần:</strong> {{weeklyRevenue}}
              </mj-text>
              <mj-text font-size="16px" color="#34495e">
                <strong>Đơn hàng thành công:</strong> {{successfulOrders}}
              </mj-text>
              <mj-text font-size="16px" color="#34495e">
                <strong>Tỷ lệ thành công:</strong> {{successRate}}
              </mj-text>
              <mj-divider border-color="#ecf0f1" />
              <mj-text font-size="14px" color="#7f8c8d" align="center">
                Báo cáo tự động từ MIA Logistics Manager
              </mj-text>
            </mj-column>
          </mj-section>
        </mj-body>
      </mjml>
    `

    return handlebars.compile(mjml(mjmlTemplate).html)
  }

  getMonthlyReportTemplate() {
    const mjmlTemplate = `
      <mjml>
        <mj-head>
          <mj-title>MIA Logistics - Báo cáo Hàng tháng</mj-title>
          <mj-font name="Roboto" href="https://fonts.googleapis.com/css?family=Roboto" />
          <mj-attributes>
            <mj-all font-family="Roboto, Arial, sans-serif" />
          </mj-attributes>
        </mj-head>
        <mj-body background-color="#f4f4f4">
          <mj-section background-color="#ffffff" padding="20px">
            <mj-column>
              <mj-text font-size="24px" font-weight="bold" color="#2c3e50" align="center">
                📊 Báo cáo Hàng tháng
              </mj-text>
              <mj-text font-size="18px" color="#7f8c8d" align="center">
                {{month}} {{year}}
              </mj-text>
              <mj-divider border-color="#ecf0f1" />
              <mj-text font-size="16px" color="#34495e">
                <strong>Tổng đơn hàng:</strong> {{totalOrders}}
              </mj-text>
              <mj-text font-size="16px" color="#34495e">
                <strong>Doanh thu tháng:</strong> {{monthlyRevenue}}
              </mj-text>
              <mj-text font-size="16px" color="#34495e">
                <strong>Khách hàng mới:</strong> {{newCustomers}}
              </mj-text>
              <mj-text font-size="16px" color="#34495e">
                <strong>Nhà vận chuyển hoạt động:</strong> {{activeCarriers}}
              </mj-text>
              <mj-divider border-color="#ecf0f1" />
              <mj-text font-size="14px" color="#7f8c8d" align="center">
                Báo cáo tự động từ MIA Logistics Manager
              </mj-text>
            </mj-column>
          </mj-section>
        </mj-body>
      </mjml>
    `

    return handlebars.compile(mjml(mjmlTemplate).html)
  }

  async sendEmail(to, subject, templateName, data, options = {}) {
    if (!this.isInitialized) {
      console.error('❌ Email service not initialized')
      return false
    }

    try {
      console.log(`📧 Attempting to send email to: ${to}`)
      console.log(`📧 Template: ${templateName}`)
      console.log(`📧 Subject: ${subject}`)

      // Map notification template name to email template name
      const emailTemplateName = this.templateMapping[templateName] || templateName
      console.log(`📧 Mapped template name: ${emailTemplateName}`)

      const template = this.templates.get(emailTemplateName)
      if (!template) {
        console.error(`❌ Email template '${emailTemplateName}' not found`)
        console.error(`❌ Available templates: ${Array.from(this.templates.keys()).join(', ')}`)
        return false
      }

      const htmlContent = template(data)
      const emailData = {
        to,
        from: {
          email: notificationConfig.email.sendgrid.fromEmail,
          name: notificationConfig.email.sendgrid.fromName,
        },
        subject,
        html: htmlContent,
        ...options,
      }

      console.log(`📧 From email: ${notificationConfig.email.sendgrid.fromEmail}`)
      console.log(`📧 SendGrid client available: ${!!this.sendgridClient}`)

      // Try SendGrid first
      if (this.sendgridClient) {
        console.log('📧 Attempting SendGrid send...')
        await this.sendgridClient.send(emailData)
        console.log(`✅ Email sent via SendGrid to ${to}`)
        return true
      }

      // Fallback to Nodemailer
      if (this.nodemailerTransporter) {
        console.log('📧 Attempting Nodemailer send...')
        await this.nodemailerTransporter.sendMail({
          from: notificationConfig.email.sendgrid.fromEmail,
          to,
          subject,
          html: htmlContent,
          ...options,
        })
        console.log(`✅ Email sent via Nodemailer to ${to}`)
        return true
      }

      console.error('❌ No email service available')
      return false
    } catch (error) {
      console.error('❌ Email send error:', error)
      console.error('❌ Error details:', error.message)
      if (error.response) {
        console.error('❌ SendGrid response:', error.response.body)
      }
      return false
    }
  }

  async sendNotification(templateName, data, recipients, priority = 'medium') {
    const channels = notificationConfig.channels[priority] || notificationConfig.channels.medium

    if (channels.includes('email') && recipients && recipients.length > 0) {
      const template = notificationConfig.templates[templateName]
      if (template && template.email) {
        const subject = this.formatTemplate(template.email.subject, data)

        for (const recipient of recipients) {
          await this.sendEmail(recipient.email, subject, templateName, data)
        }
      }
    }
  }

  formatTemplate(template, data) {
    let result = template

    Object.keys(data).forEach((key) => {
      const placeholder = `{${key}}`
      result = result.replace(new RegExp(placeholder, 'g'), data[key] || 'N/A')
    })

    return result
  }

  // Get service info
  getServiceInfo() {
    return {
      isInitialized: this.isInitialized,
      sendgridEnabled: notificationConfig.email.sendgrid.enabled,
      nodemailerEnabled: notificationConfig.email.nodemailer.enabled,
      availableTemplates: Array.from(this.templates.keys()),
    }
  }
}

export default new EmailService()
