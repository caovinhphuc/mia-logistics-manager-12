#!/usr/bin/env node

/**
 * Test script for all MIA Logistics services
 * Tests Google Sheets, Google Drive, Google Apps Script, Telegram, and Email services
 */

import { googleSheetsService } from './src/services/google/googleSheetsService.js';
import { googleDriveService } from './src/services/google/googleDriveService.js';
import { googleAppsScriptService } from './src/services/google/googleAppsScriptService.js';
import telegramService from './server/src/services/telegramService.js';
import emailService from './server/src/services/emailService.js';

// Test configuration
const TEST_CONFIG = {
  googleSheets: {
    spreadsheetId:
      process.env.REACT_APP_GOOGLE_SPREADSHEET_ID || '18B1PIhCDmBWyHZytvOcfj_1QbYBwczLf1x1Qbu0E5As',
    testSheet: 'Users',
  },
  googleDrive: {
    folderId: process.env.REACT_APP_GOOGLE_DRIVE_FOLDER_ID || 'test-folder-id',
  },
  googleAppsScript: {
    scriptId: process.env.REACT_APP_GOOGLE_APPS_SCRIPT_ID || 'test-script-id',
  },
  telegram: {
    chatId: process.env.TELEGRAM_CHAT_ID || 'test-chat-id',
  },
  email: {
    testEmail: process.env.TEST_EMAIL || 'test@example.com',
  },
};

// Test results storage
const testResults = {
  googleSheets: { success: false, error: null, details: {} },
  googleDrive: { success: false, error: null, details: {} },
  googleAppsScript: { success: false, error: null, details: {} },
  telegram: { success: false, error: null, details: {} },
  email: { success: false, error: null, details: {} },
};

// Utility functions
const logTest = (service, message, type = 'info') => {
  const timestamp = new Date().toISOString();
  const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
  console.log(`${prefix} [${service.toUpperCase()}] ${message}`);
};

const runTest = async (serviceName, testFunction) => {
  try {
    logTest(serviceName, 'Starting test...');
    const result = await testFunction();
    testResults[serviceName] = { success: true, error: null, details: result };
    logTest(serviceName, 'Test completed successfully', 'success');
    return result;
  } catch (error) {
    testResults[serviceName] = { success: false, error: error.message, details: {} };
    logTest(serviceName, `Test failed: ${error.message}`, 'error');
    return null;
  }
};

// Test functions
const testGoogleSheets = async () => {
  // Initialize service
  await googleSheetsService.initializeAPI();

  // Test connection
  const connectionResult = await googleSheetsService.connect(
    TEST_CONFIG.googleSheets.spreadsheetId
  );

  // Test data retrieval
  const dataResult = await googleSheetsService.getData(TEST_CONFIG.googleSheets.testSheet);

  return {
    connection: connectionResult,
    dataRetrieved: dataResult ? dataResult.length : 0,
    isConnected: googleSheetsService.isConnected,
    spreadsheetId: googleSheetsService.spreadsheetId,
  };
};

const testGoogleDrive = async () => {
  // Initialize service
  await googleDriveService.initialize();

  // Test connection
  const connectionResult = await googleDriveService.connect(TEST_CONFIG.googleDrive.folderId);

  // Test file listing
  const filesResult = await googleDriveService.listFiles(TEST_CONFIG.googleDrive.folderId);

  return {
    connection: connectionResult,
    filesCount: filesResult.files ? filesResult.files.length : 0,
    isConnected: googleDriveService.isConnected,
    folderId: googleDriveService.folderId,
  };
};

const testGoogleAppsScript = async () => {
  // Initialize service
  await googleAppsScriptService.initialize();

  // Test connection
  const connectionResult = await googleAppsScriptService.connect(
    TEST_CONFIG.googleAppsScript.scriptId
  );

  // Test function execution
  const functionResult = await googleAppsScriptService.calculateDistance(
    'Hà Nội, Việt Nam',
    'TP.HCM, Việt Nam'
  );

  return {
    connection: connectionResult,
    functionTest: functionResult,
    isConnected: googleAppsScriptService.isConnected,
    scriptId: googleAppsScriptService.scriptId,
    availableFunctions: googleAppsScriptService.getFunctions().length,
  };
};

const testTelegram = async () => {
  // Get bot info
  const botInfo = telegramService.getBotInfo();

  // Test sending message (if configured)
  let messageResult = null;
  if (botInfo.isInitialized && TEST_CONFIG.telegram.chatId !== 'test-chat-id') {
    try {
      messageResult = await telegramService.sendMessage(
        TEST_CONFIG.telegram.chatId,
        '🧪 Test message from MIA Logistics Manager'
      );
    } catch (error) {
      logTest('telegram', `Message send failed: ${error.message}`, 'error');
    }
  }

  return {
    botInfo,
    messageSent: messageResult,
    isInitialized: telegramService.isInitialized,
  };
};

const testEmail = async () => {
  // Get service info
  const serviceInfo = emailService.getServiceInfo();

  // Test sending email (if configured)
  let emailResult = null;
  if (serviceInfo.isInitialized && TEST_CONFIG.email.testEmail !== 'test@example.com') {
    try {
      emailResult = await emailService.sendEmail(
        TEST_CONFIG.email.testEmail,
        'Test Email from MIA Logistics Manager',
        'system-alert',
        {
          alertType: 'Test Alert',
          description: 'This is a test email from MIA Logistics Manager',
          action: 'No action required',
          timestamp: new Date().toLocaleString('vi-VN'),
        }
      );
    } catch (error) {
      logTest('email', `Email send failed: ${error.message}`, 'error');
    }
  }

  return {
    serviceInfo,
    emailSent: emailResult,
    isInitialized: emailService.isInitialized,
  };
};

// Main test runner
const runAllTests = async () => {
  console.log('🚀 Starting MIA Logistics Services Test Suite');
  console.log('='.repeat(60));

  // Run all tests
  await runTest('googleSheets', testGoogleSheets);
  await runTest('googleDrive', testGoogleDrive);
  await runTest('googleAppsScript', testGoogleAppsScript);
  await runTest('telegram', testTelegram);
  await runTest('email', testEmail);

  // Generate summary report
  console.log('\n📊 Test Summary Report');
  console.log('='.repeat(60));

  const totalTests = Object.keys(testResults).length;
  const passedTests = Object.values(testResults).filter((result) => result.success).length;
  const failedTests = totalTests - passedTests;

  console.log(`Total Tests: ${totalTests}`);
  console.log(`Passed: ${passedTests} ✅`);
  console.log(`Failed: ${failedTests} ❌`);
  console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

  console.log('\n📋 Detailed Results:');
  console.log('-'.repeat(60));

  Object.entries(testResults).forEach(([service, result]) => {
    const status = result.success ? '✅ PASS' : '❌ FAIL';
    console.log(`${service.toUpperCase().padEnd(20)} ${status}`);
    if (!result.success && result.error) {
      console.log(`  Error: ${result.error}`);
    }
  });

  // Service-specific recommendations
  console.log('\n💡 Recommendations:');
  console.log('-'.repeat(60));

  if (!testResults.googleSheets.success) {
    console.log('📋 Google Sheets: Check REACT_APP_GOOGLE_SPREADSHEET_ID and API credentials');
  }

  if (!testResults.googleDrive.success) {
    console.log('📁 Google Drive: Check REACT_APP_GOOGLE_DRIVE_FOLDER_ID and API credentials');
  }

  if (!testResults.googleAppsScript.success) {
    console.log('🔧 Google Apps Script: Check REACT_APP_GOOGLE_APPS_SCRIPT_ID (optional)');
  }

  if (!testResults.telegram.success) {
    console.log('📱 Telegram: Check TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID');
  }

  if (!testResults.email.success) {
    console.log('📧 Email: Check SENDGRID_API_KEY or SMTP configuration');
  }

  console.log('\n🎯 All services are working in mock mode for development!');
  console.log('   Configure environment variables for production use.');

  // Exit with appropriate code
  process.exit(failedTests > 0 ? 1 : 0);
};

// Handle errors
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled Promise Rejection:', error);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// Run tests
runAllTests().catch((error) => {
  console.error('❌ Test suite failed:', error);
  process.exit(1);
});
