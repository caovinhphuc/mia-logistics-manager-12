import dotenv from "dotenv";
import path from "path";

// Load .env from server directory first
dotenv.config();
// Fallback: also try to load from project root if running from different location
const rootEnvPath = path.resolve(process.cwd(), "../.env");
dotenv.config({ path: rootEnvPath });

export const notificationConfig = {
  // Telegram Bot Configuration
  telegram: {
    token: process.env.TELEGRAM_BOT_TOKEN,
    webhookUrl: process.env.TELEGRAM_WEBHOOK_URL,
    chatId: process.env.TELEGRAM_CHAT_ID || "-4818209867",
    enabled: true,
  },

  // Email Configuration
  email: {
    sendgrid: {
      apiKey: process.env.SENDGRID_API_KEY,
      fromEmail: process.env.SENDGRID_FROM_EMAIL || "noreply@mia-logistics.com",
      fromName: process.env.SENDGRID_FROM_NAME || "MIA Logistics Manager",
      enabled: !!process.env.SENDGRID_API_KEY,
    },
    nodemailer: {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      enabled: !!(process.env.SMTP_HOST && process.env.SMTP_USER),
    },
  },

  // Real-time Configuration
  realtime: {
    socketIo: {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
      },
      enabled: true,
    },
  },

  // Job Queue Configuration
  queue: {
    redis: {
      host: process.env.REDIS_HOST || "localhost",
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD,
    },
    enabled: true,
  },

  // Notification Templates
  templates: {
    carrierUpdate: {
      telegram:
        "🚚 Cập nhật Nhà vận chuyển\n\n📋 {carrierName}\n📍 Khu vực: {serviceAreas}\n💰 Giá: {pricing}\n📞 Liên hệ: {contact}\n\n🔄 Trạng thái: {status}",
      email: {
        subject: "Cập nhật Nhà vận chuyển - {carrierName}",
        template: "carrier-update",
      },
    },
    orderStatus: {
      telegram:
        "📦 *Cập nhật Đơn hàng*\n\n🆔 **{orderId}**\n👤 Khách hàng: {customerName}\n📍 Địa chỉ: {address}\n💰 Giá trị: {value}\n\n📊 Trạng thái: {status}",
      email: {
        subject: "Cập nhật Đơn hàng - {orderId}",
        template: "order-status",
      },
    },
    systemAlert: {
      telegram:
        "⚠️ *Cảnh báo Hệ thống*\n\n🔍 **{alertType}**\n📝 Mô tả: {description}\n⏰ Thời gian: {timestamp}\n\n🔧 Hành động: {action}",
      email: {
        subject: "Cảnh báo Hệ thống - {alertType}",
        template: "system-alert",
      },
    },
    dailyReport: {
      telegram:
        "📊 *Báo cáo Hàng ngày*\n\n📅 Ngày: {date}\n🚚 Nhà vận chuyển: {carrierCount}\n📦 Đơn hàng: {orderCount}\n💰 Doanh thu: {revenue}\n\n📈 So với hôm qua: {comparison}",
      email: {
        subject: "Báo cáo Hàng ngày - {date}",
        template: "daily-report",
      },
    },
  },

  // Scheduling Configuration
  scheduling: {
    dailyReport: {
      cron: "0 8 * * *", // 8:00 AM daily
      enabled: true,
    },
    weeklyReport: {
      cron: "0 9 * * 1", // 9:00 AM every Monday
      enabled: true,
    },
    monthlyReport: {
      cron: "0 10 1 * *", // 10:00 AM 1st day of month
      enabled: true,
    },
    systemHealthCheck: {
      cron: "*/30 * * * *", // Every 30 minutes
      enabled: true,
    },
  },

  // Notification Channels Priority
  channels: {
    high: ["telegram", "email", "realtime"],
    medium: ["telegram", "realtime"],
    low: ["realtime"],
  },
};

export default notificationConfig;
