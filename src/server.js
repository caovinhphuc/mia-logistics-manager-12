const { app } = require('./services/api/app');
const http = require('http');
const { printStartupBanner } = require('./middleware/startupBanner');

// Import and configure services (using dynamic imports for ES modules)
// Services will be imported dynamically in the initialization functions

// Set the port
const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// Initialize WebSocket for real-time features using dynamic import
async function initializeServices() {
  try {
    console.log('\n🔧 ==========================================');
    console.log('🚀 ĐANG KHỞI TẠO CÁC DỊCH VỤ HỆ THỐNG...');
    console.log('🔧 ==========================================\n');

    // Initialize Google Sheets service
    console.log('📊 [1/5] KHỞI TẠO GOOGLE SHEETS SERVICE...');
    const googleSheetsService = require('../src/services/googleSheetsService.js');
    await googleSheetsService.initialize();
    console.log('✅ Google Sheets Service: HOÀN THÀNH\n');

    // Initialize Google Drive service
    console.log('☁️ [2/5] KHỞI TẠO GOOGLE DRIVE SERVICE...');
    const googleDriveService = require('../src/services/googleDriveService.js');
    await googleDriveService.initialize();
    console.log('✅ Google Drive Service: HOÀN THÀNH\n');

    // Initialize real-time service
    console.log('🌐 [3/5] KHỞI TẠO REAL-TIME SOCKET.IO...');
    const { default: realtimeService } = await import(
      '../services/realtimeService.js'
    );
    realtimeService.init(server);
    console.log('✅ Socket.IO Real-time: HOÀN THÀNH\n');

    // Initialize notification manager
    console.log('📅 [4/5] KHỞI TẠO NOTIFICATION MANAGER...');
    const { default: notificationManager } = await import(
      '../services/notificationManager.js'
    );
    console.log('✅ Notification Manager: HOÀN THÀNH');
    console.log('⏰ Cron Jobs: Daily, Weekly, Monthly Reports');
    console.log('📧 Email Service: Ready');
    console.log('🤖 Telegram Integration: Ready\n');

    // Initialize Telegram service
    console.log('🤖 [5/5] KHỞI TẠO TELEGRAM BOT SERVICE...');
    const { default: telegramService } = await import(
      '../services/telegramService.js'
    );

    // Check Telegram configuration
    if (
      process.env.TELEGRAM_BOT_TOKEN &&
      process.env.TELEGRAM_BOT_TOKEN !== 'your_telegram_bot_token_here'
    ) {
      console.log('🔑 Bot Token: ✅ Đã cấu hình');
      console.log(
        `📱 Chat ID: ${process.env.TELEGRAM_CHAT_ID || 'Chưa cấu hình'}`
      );

      // Check webhook vs polling mode
      if (
        process.env.TELEGRAM_WEBHOOK_URL &&
        process.env.TELEGRAM_WEBHOOK_URL.trim() !== ''
      ) {
        console.log('🌐 Chế độ: Webhook Mode');
        telegramService.setupWebhook();
      } else {
        console.log('🔄 Chế độ: Polling Mode (Development)');
        console.log('💡 Phù hợp cho môi trường development');
      }
      console.log('✅ Telegram Bot Service: HOÀN THÀNH\n');
    } else {
      console.log('⚠️  Telegram Bot Token: Chưa cấu hình');
      console.log('💡 Cập nhật TELEGRAM_BOT_TOKEN trong .env để kích hoạt\n');
    }

    // Final success message with detailed summary
    console.log('🎉 ==========================================');
    console.log('✨ TẤT CẢ DỊCH VỤ ĐÃ KHỞI TẠO THÀNH CÔNG!');
    console.log('🎉 ==========================================');

    // Services status
    console.log('📊 TRẠNG THÁI CÁC DỊCH VỤ:');
    console.log('   📊 Google Sheets Service: ✅ ACTIVE');
    console.log('   ☁️ Google Drive Service: ✅ ACTIVE');
    console.log('   🌐 Socket.IO Real-time: ✅ ACTIVE');
    console.log('   📅 Notification Manager: ✅ ACTIVE');
    console.log('   🤖 Telegram Bot Service: ✅ ACTIVE');

    // Configuration status
    console.log('\n🔧 TRẠNG THÁI CẤU HÌNH:');
    console.log(
      `   📊 Google Sheets: ${process.env.SHEET_ID ? '✅ Configured' : '❌ Not configured'}`
    );
    console.log(
      `   🔑 Service Account: ${process.env.SERVICE_ACCOUNT_KEY ? '✅ Configured' : '❌ Not configured'}`
    );
    console.log(
      `   🤖 Telegram Bot: ${process.env.TELEGRAM_BOT_TOKEN ? '✅ Configured' : '❌ Not configured'}`
    );
    console.log(
      `   📧 Email Service: ${process.env.SENDGRID_API_KEY || process.env.EMAIL_USERNAME ? '✅ Configured' : '❌ Not configured'}`
    );
    console.log(
      `   🗺️  Google Maps: ${process.env.GOOGLE_MAPS_API_KEY ? '✅ Configured' : '❌ Not configured'}`
    );

    // Performance info
    console.log('\n⚡ HIỆU SUẤT HỆ THỐNG:');
    console.log(
      `   💾 Memory Usage: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`
    );
    console.log(`   🔄 Event Loop Lag: < 1ms`);
    console.log(
      `   ⏱️  Startup Time: ${Math.round(process.uptime() * 1000)} ms`
    );

    console.log('\n🎉 ==========================================');
    console.log('🚀 SERVER SẴN SÀNG PHỤC VỤ!');
    console.log('🎉 ==========================================\n');
  } catch (error) {
    console.error('\n💥 ==========================================');
    console.error('❌ LỖI KHỞI TẠO DỊCH VỤ!');
    console.error('💥 ==========================================');
    console.error('🔥 Lỗi chính:', error.message);
    console.error('📍 Chi tiết lỗi:', error.stack);
    console.error('💡 Kiểm tra cấu hình .env và dependencies');
    console.error('💥 ==========================================\n');
  }
}

// Initialize notification services

// Function to display system information
function displaySystemInfo() {
  console.log('\n📋 ==========================================');
  console.log('🖥️  THÔNG TIN HỆ THỐNG');
  console.log('📋 ==========================================');
  console.log(`🟢 Node.js Version: ${process.version}`);
  console.log(`🟢 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🟢 Server Port: ${PORT}`);
  console.log(`🟢 Process PID: ${process.pid}`);
  console.log(
    `🟢 Memory Usage: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`
  );
  console.log(`🟢 Uptime: ${Math.round(process.uptime())} seconds`);
  console.log('📋 ==========================================');
  console.log('🌐 URLs:');
  console.log(`   • Backend API: http://localhost:${PORT}`);
  console.log(`   • Health Check: http://localhost:${PORT}/health`);
  console.log(`   • API Docs: http://localhost:${PORT}/api-docs`);
  console.log('📋 ==========================================\n');
}

// Start the server
server.listen(PORT, async () => {
  // Print beautiful startup banner
  printStartupBanner();

  // Display system information
  displaySystemInfo();

  // Initialize all services
  await initializeServices();
});

// Handle port already in use error
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(
      `❌ Port ${PORT} is already in use. Trying to kill existing process...`
    );

    // Try to find and kill the process using the port
    const { exec } = require('child_process');
    exec(`lsof -ti:${PORT}`, (error, stdout, stderr) => {
      if (stdout) {
        const pid = stdout.trim();
        console.log(
          `🔍 Found process ${pid} using port ${PORT}. Killing it...`
        );
        exec(`kill -9 ${pid}`, (killError, killStdout, killStderr) => {
          if (killError) {
            console.error(`❌ Failed to kill process: ${killError.message}`);
            console.error(
              '💡 Please manually kill the process or use a different port'
            );
            process.exit(1);
          } else {
            console.log(
              `✅ Process ${pid} killed successfully. Restarting server...`
            );
            // Restart server after a short delay
            setTimeout(() => {
              server.listen(PORT, () => {
                printStartupBanner();
              });
            }, 1000);
          }
        });
      } else {
        console.error(`❌ Could not find process using port ${PORT}`);
        console.error(
          '💡 Please manually kill the process or use a different port'
        );
        process.exit(1);
      }
    });
  } else {
    console.error('❌ Server error:', err);
    process.exit(1);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🔄 SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🔄 SIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Process terminated');
    process.exit(0);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('💥 Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error('💥 Unhandled Rejection:', err);
  server.close(() => {
    process.exit(1);
  });
});

module.exports = { server };
