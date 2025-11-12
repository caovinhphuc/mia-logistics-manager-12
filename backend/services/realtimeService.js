import { Server } from 'socket.io'
import { notificationConfig } from '../config/notification.js'

class RealtimeService {
  constructor() {
    this.io = null
    this.connectedClients = new Map()
    this.isInitialized = false
  }

  init(server) {
    if (!notificationConfig.realtime.socketIo.enabled) {
      console.log('⚠️ Socket.IO: TẮT CHẾ ĐỘ REAL-TIME')
      return
    }

    try {
      this.io = new Server(server, {
        cors: notificationConfig.realtime.socketIo.cors,
        transports: ['websocket', 'polling'],
      })

      this.setupEventHandlers()
      this.isInitialized = true
      console.log('🌐 Socket.IO Real-time: ✅ ĐÃ KHỞI TẠO')
    } catch (error) {
      console.error('❌ Socket.IO: LỖI KHỞI TẠO:', error)
    }
  }

  setupEventHandlers() {
    if (!this.io) return

    this.io.on('connection', (socket) => {
      console.log(`🔌 Client connected: ${socket.id}`)

      // Store client info
      this.connectedClients.set(socket.id, {
        id: socket.id,
        connectedAt: new Date(),
        userAgent: socket.handshake.headers['user-agent'],
        ip: socket.handshake.address,
      })

      // Handle client authentication
      socket.on('authenticate', (data) => {
        this.handleAuthentication(socket, data)
      })

      // Handle notification preferences
      socket.on('setNotificationPreferences', (preferences) => {
        this.handleNotificationPreferences(socket, preferences)
      })

      // Handle client disconnect
      socket.on('disconnect', () => {
        console.log(`🔌 Client disconnected: ${socket.id}`)
        this.connectedClients.delete(socket.id)
      })

      // Handle ping/pong for connection health
      socket.on('ping', () => {
        socket.emit('pong', { timestamp: Date.now() })
      })

      // Send welcome message
      socket.emit('welcome', {
        message: 'Connected to MIA Logistics Manager',
        timestamp: new Date().toISOString(),
        features: ['real-time-notifications', 'live-updates', 'system-alerts'],
      })
    })
  }

  handleAuthentication(socket, data) {
    // Simple authentication - in production, implement proper JWT validation
    const { userId, token } = data

    if (userId && token) {
      const client = this.connectedClients.get(socket.id)
      if (client) {
        client.userId = userId
        client.authenticated = true
        client.authenticatedAt = new Date()

        // Join user-specific room
        socket.join(`user:${userId}`)

        socket.emit('authenticated', {
          success: true,
          userId,
          message: 'Authentication successful',
        })

        console.log(`✅ Client ${socket.id} authenticated as user ${userId}`)
      }
    } else {
      socket.emit('authenticated', {
        success: false,
        message: 'Authentication failed - missing credentials',
      })
    }
  }

  handleNotificationPreferences(socket, preferences) {
    const client = this.connectedClients.get(socket.id)
    if (client) {
      client.notificationPreferences = preferences

      socket.emit('notificationPreferencesUpdated', {
        success: true,
        preferences,
        message: 'Notification preferences updated',
      })

      console.log(`⚙️ Client ${socket.id} updated notification preferences`)
    }
  }

  // Send notification to all connected clients
  broadcastNotification(type, data, options = {}) {
    if (!this.io || !this.isInitialized) {
      console.error('❌ Socket.IO not initialized')
      return false
    }

    try {
      const notification = {
        id: this.generateNotificationId(),
        type,
        data,
        timestamp: new Date().toISOString(),
        priority: options.priority || 'medium',
        ...options,
      }

      this.io.emit('notification', notification)
      console.log(`📢 Broadcast notification: ${type} to ${this.connectedClients.size} clients`)
      return true
    } catch (error) {
      console.error('❌ Broadcast notification error:', error)
      return false
    }
  }

  // Send notification to specific user
  sendToUser(userId, type, data, options = {}) {
    if (!this.io || !this.isInitialized) {
      console.error('❌ Socket.IO not initialized')
      return false
    }

    try {
      const notification = {
        id: this.generateNotificationId(),
        type,
        data,
        timestamp: new Date().toISOString(),
        priority: options.priority || 'medium',
        ...options,
      }

      this.io.to(`user:${userId}`).emit('notification', notification)
      console.log(`📢 User notification: ${type} to user ${userId}`)
      return true
    } catch (error) {
      console.error('❌ User notification error:', error)
      return false
    }
  }

  // Send notification to specific room
  sendToRoom(room, type, data, options = {}) {
    if (!this.io || !this.isInitialized) {
      console.error('❌ Socket.IO not initialized')
      return false
    }

    try {
      const notification = {
        id: this.generateNotificationId(),
        type,
        data,
        timestamp: new Date().toISOString(),
        priority: options.priority || 'medium',
        ...options,
      }

      this.io.to(room).emit('notification', notification)
      console.log(`📢 Room notification: ${type} to room ${room}`)
      return true
    } catch (error) {
      console.error('❌ Room notification error:', error)
      return false
    }
  }

  // Send system alert
  sendSystemAlert(alertType, description, action = '') {
    return this.broadcastNotification(
      'system-alert',
      {
        alertType,
        description,
        action,
        severity: 'warning',
      },
      { priority: 'high' },
    )
  }

  // Send carrier update notification
  sendCarrierUpdate(carrierData) {
    return this.broadcastNotification('carrier-update', {
      carrierId: carrierData.carrierId,
      carrierName: carrierData.name,
      serviceAreas: carrierData.serviceAreas,
      pricing: `${carrierData.pricingMethod} - ${carrierData.baseRate} VNĐ`,
      contact: `${carrierData.contactPerson} (${carrierData.phone})`,
      status: carrierData.isActive ? 'Active' : 'Inactive',
      timestamp: new Date().toLocaleString('vi-VN'),
    })
  }

  // Send order status update
  sendOrderStatusUpdate(orderData) {
    return this.broadcastNotification('order-status', {
      orderId: orderData.orderId,
      customerName: orderData.customerName,
      address: orderData.address,
      value: `${orderData.value} VNĐ`,
      status: orderData.status,
      timestamp: new Date().toLocaleString('vi-VN'),
    })
  }

  // Send daily report
  sendDailyReport(reportData) {
    return this.broadcastNotification(
      'daily-report',
      {
        date: new Date().toLocaleDateString('vi-VN'),
        carrierCount: reportData.carrierCount || 0,
        orderCount: reportData.orderCount || 0,
        revenue: `${reportData.revenue || 0} VNĐ`,
        comparison: reportData.comparison || '0%',
      },
      { priority: 'low' },
    )
  }

  // Send weekly report
  sendWeeklyReport(reportData) {
    return this.broadcastNotification(
      'weekly-report',
      {
        weekNumber: reportData.weekNumber,
        year: reportData.year,
        totalOrders: reportData.totalOrders || 0,
        weeklyRevenue: `${reportData.weeklyRevenue || 0} VNĐ`,
        successfulOrders: reportData.successfulOrders || 0,
        successRate: reportData.successRate || '0%',
      },
      { priority: 'low' },
    )
  }

  // Send monthly report
  sendMonthlyReport(reportData) {
    return this.broadcastNotification(
      'monthly-report',
      {
        month: reportData.month,
        year: reportData.year,
        totalOrders: reportData.totalOrders || 0,
        monthlyRevenue: `${reportData.monthlyRevenue || 0} VNĐ`,
        newCustomers: reportData.newCustomers || 0,
        activeCarriers: reportData.activeCarriers || 0,
      },
      { priority: 'low' },
    )
  }

  // Generate unique notification ID
  generateNotificationId() {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Get connection statistics
  getConnectionStats() {
    return {
      totalConnections: this.connectedClients.size,
      authenticatedUsers: Array.from(this.connectedClients.values()).filter((c) => c.authenticated)
        .length,
      connectedClients: Array.from(this.connectedClients.values()),
    }
  }

  // Get service info
  getServiceInfo() {
    return {
      isInitialized: this.isInitialized,
      enabled: notificationConfig.realtime.socketIo.enabled,
      cors: notificationConfig.realtime.socketIo.cors,
      connectionStats: this.getConnectionStats(),
    }
  }
}

export default new RealtimeService()
