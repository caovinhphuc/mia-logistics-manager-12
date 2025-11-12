import cron from 'node-cron'
import { notificationConfig } from '../config/notification.js'
import emailService from './emailService.js'
import realtimeService from './realtimeService.js'
import telegramService from './telegramService.js'

class NotificationManager {
  constructor() {
    this.services = {
      telegram: telegramService,
      email: emailService,
      realtime: realtimeService,
    }
    this.scheduledTasks = new Map()
    this.notificationHistory = []
    this.isInitialized = false
    this.init()
  }

  init() {
    try {
      this.setupScheduledTasks()
      this.isInitialized = true
      console.log('📋 Notification Manager: ✅ ĐÃ KHỞI TẠO')
    } catch (error) {
      console.error('❌ Notification Manager initialization error:', error)
    }
  }

  setupScheduledTasks() {
    // Daily report at 8:00 AM
    if (notificationConfig.scheduling.dailyReport.enabled) {
      this.scheduleTask('daily-report', notificationConfig.scheduling.dailyReport.cron, () => {
        this.sendDailyReport()
      })
    }

    // Weekly report at 9:00 AM on Monday
    if (notificationConfig.scheduling.weeklyReport.enabled) {
      this.scheduleTask('weekly-report', notificationConfig.scheduling.weeklyReport.cron, () => {
        this.sendWeeklyReport()
      })
    }

    // Monthly report at 10:00 AM on 1st day of month
    if (notificationConfig.scheduling.monthlyReport.enabled) {
      this.scheduleTask('monthly-report', notificationConfig.scheduling.monthlyReport.cron, () => {
        this.sendMonthlyReport()
      })
    }

    // System health check every 30 minutes
    if (notificationConfig.scheduling.systemHealthCheck.enabled) {
      this.scheduleTask(
        'system-health-check',
        notificationConfig.scheduling.systemHealthCheck.cron,
        () => {
          this.performSystemHealthCheck()
        },
      )
    }

    console.log('📅 Cron Jobs: ✅ ĐÃ CẤU HÌNH TẤT CẢ TÁC VỤ')
  }

  scheduleTask(name, cronExpression, task) {
    if (this.scheduledTasks.has(name)) {
      this.scheduledTasks.get(name).stop()
    }

    const scheduledTask = cron.schedule(
      cronExpression,
      () => {
        console.log(`⏰ Đang thực hiện tác vụ định kỳ: ${name}`)
        task()
      },
      {
        scheduled: true,
        timezone: 'Asia/Ho_Chi_Minh',
      },
    )

    this.scheduledTasks.set(name, scheduledTask)
    console.log(`⏰ Cron Job '${name}': ✅ ĐÃ LÊN LỊCH (${cronExpression})`)
  }

  // Send notification through all configured channels
  async sendNotification(templateName, data, recipients = [], priority = 'medium') {
    if (!this.isInitialized) {
      console.error('❌ Notification Manager not initialized')
      return false
    }

    const channels = notificationConfig.channels[priority] || notificationConfig.channels.medium
    const results = {
      success: [],
      failed: [],
      timestamp: new Date().toISOString(),
    }

    // Send to Telegram
    if (channels.includes('telegram')) {
      try {
        const success = await this.services.telegram.sendNotification(templateName, data, priority)
        if (success) {
          results.success.push('telegram')
        } else {
          results.failed.push('telegram')
        }
      } catch (error) {
        console.error('❌ Telegram notification error:', error)
        results.failed.push('telegram')
      }
    }

    // Send to Email
    if (channels.includes('email') && recipients.length > 0) {
      try {
        await this.services.email.sendNotification(templateName, data, recipients, priority)
        results.success.push('email')
      } catch (error) {
        console.error('❌ Email notification error:', error)
        results.failed.push('email')
      }
    }

    // Send to Real-time
    if (channels.includes('realtime')) {
      try {
        const success = this.services.realtime.broadcastNotification(templateName, data, {
          priority,
        })
        if (success) {
          results.success.push('realtime')
        } else {
          results.failed.push('realtime')
        }
      } catch (error) {
        console.error('❌ Real-time notification error:', error)
        results.failed.push('realtime')
      }
    }

    // Log notification
    this.logNotification(templateName, data, results)

    return results.success.length > 0
  }

  // Carrier update notification
  async sendCarrierUpdate(carrierData, priority = 'medium') {
    const data = {
      carrierName: carrierData.name,
      serviceAreas: carrierData.serviceAreas,
      pricing: `${carrierData.pricingMethod} - ${carrierData.baseRate} VNĐ`,
      contact: `${carrierData.contactPerson} (${carrierData.phone})`,
      status: carrierData.isActive ? 'Active' : 'Inactive',
      timestamp: new Date().toLocaleString('vi-VN'),
    }

    return this.sendNotification('carrierUpdate', data, [], priority)
  }

  // Order status update notification
  async sendOrderStatusUpdate(orderData, priority = 'medium') {
    const data = {
      orderId: orderData.orderId,
      customerName: orderData.customerName,
      address: orderData.address,
      value: `${orderData.value} VNĐ`,
      status: orderData.status,
      timestamp: new Date().toLocaleString('vi-VN'),
    }

    return this.sendNotification('orderStatus', data, [], priority)
  }

  // System alert notification
  async sendSystemAlert(alertType, description, action = '', priority = 'high') {
    const data = {
      alertType,
      description,
      action,
      timestamp: new Date().toLocaleString('vi-VN'),
    }

    return this.sendNotification('systemAlert', data, [], priority)
  }

  // Daily report
  async sendDailyReport() {
    // Get daily statistics (mock data for now)
    const reportData = {
      date: new Date().toLocaleDateString('vi-VN'),
      carrierCount: 2,
      orderCount: 0,
      revenue: '0',
      comparison: '0%',
    }

    const data = {
      date: reportData.date,
      carrierCount: reportData.carrierCount,
      orderCount: reportData.orderCount,
      revenue: `${reportData.revenue} VNĐ`,
      comparison: reportData.comparison,
    }

    return this.sendNotification('dailyReport', data, [], 'low')
  }

  // Weekly report
  async sendWeeklyReport() {
    const now = new Date()
    const weekNumber = this.getWeekNumber(now)
    const year = now.getFullYear()

    const reportData = {
      weekNumber,
      year,
      totalOrders: 0,
      weeklyRevenue: '0',
      successfulOrders: 0,
      successRate: '0%',
    }

    const data = {
      weekNumber: reportData.weekNumber,
      year: reportData.year,
      totalOrders: reportData.totalOrders,
      weeklyRevenue: `${reportData.weeklyRevenue} VNĐ`,
      successfulOrders: reportData.successfulOrders,
      successRate: reportData.successRate,
    }

    return this.sendNotification('weeklyReport', data, [], 'low')
  }

  // Monthly report
  async sendMonthlyReport() {
    const now = new Date()
    const month = now.toLocaleDateString('vi-VN', { month: 'long' })
    const year = now.getFullYear()

    const reportData = {
      month,
      year,
      totalOrders: 0,
      monthlyRevenue: '0',
      newCustomers: 0,
      activeCarriers: 2,
    }

    const data = {
      month: reportData.month,
      year: reportData.year,
      totalOrders: reportData.totalOrders,
      monthlyRevenue: `${reportData.monthlyRevenue} VNĐ`,
      newCustomers: reportData.newCustomers,
      activeCarriers: reportData.activeCarriers,
    }

    return this.sendNotification('monthlyReport', data, [], 'low')
  }

  // System health check
  async performSystemHealthCheck() {
    const healthStatus = {
      telegram: this.services.telegram.isInitialized,
      email: this.services.email.isInitialized,
      realtime: this.services.realtime.isInitialized,
      timestamp: new Date().toISOString(),
    }

    const allServicesHealthy = Object.values(healthStatus).every((status) => status === true)

    if (!allServicesHealthy) {
      await this.sendSystemAlert(
        'System Health Check Failed',
        'One or more notification services are not responding',
        'Check server logs and restart services if necessary',
      )
    }

    console.log('🏥 Kiểm tra sức khỏe hệ thống hoàn tất:', healthStatus)
    return healthStatus
  }

  // Get week number
  getWeekNumber(date) {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1)
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7)
  }

  // Log notification
  logNotification(templateName, data, results) {
    const logEntry = {
      id: this.generateNotificationId(),
      templateName,
      data,
      results,
      timestamp: new Date().toISOString(),
    }

    this.notificationHistory.push(logEntry)

    // Keep only last 1000 notifications
    if (this.notificationHistory.length > 1000) {
      this.notificationHistory = this.notificationHistory.slice(-1000)
    }

    console.log(
      `📝 Thông báo đã được ghi log: ${templateName} - Thành công: ${results.success.length}, Thất bại: ${results.failed.length}`,
    )
  }

  // Generate notification ID
  generateNotificationId() {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Get notification history
  getNotificationHistory(limit = 50) {
    return this.notificationHistory.slice(-limit).reverse()
  }

  // Get scheduled tasks status
  getScheduledTasksStatus() {
    const status = {}
    for (const [name, task] of this.scheduledTasks) {
      status[name] = {
        running: task.running || false,
        nextDate: 'Scheduled',
      }
    }
    return status
  }

  // Get service status
  getServiceStatus() {
    return {
      isInitialized: this.isInitialized,
      telegram: this.services.telegram.getBotInfo(),
      email: this.services.email.getServiceInfo(),
      realtime: this.services.realtime.getServiceInfo(),
      scheduledTasks: this.getScheduledTasksStatus(),
      notificationHistory: {
        total: this.notificationHistory.length,
        recent: this.notificationHistory.slice(-10),
      },
    }
  }

  // Stop all scheduled tasks
  stopScheduledTasks() {
    for (const [name, task] of this.scheduledTasks) {
      task.stop()
      console.log(`⏹️ Đã dừng tác vụ định kỳ: ${name}`)
    }
    this.scheduledTasks.clear()
  }

  // Restart scheduled tasks
  restartScheduledTasks() {
    this.stopScheduledTasks()
    this.setupScheduledTasks()
  }
}

export default new NotificationManager()
