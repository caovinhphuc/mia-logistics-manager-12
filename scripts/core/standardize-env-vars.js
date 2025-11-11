#!/usr/bin/env node

/**
 * Script để chuẩn hóa các biến môi trường trong dự án
 * Tìm và thay thế các biến trùng lặp hoặc không nhất quán
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

// Mapping các biến cũ sang biến mới chuẩn hóa
const ENV_VAR_MAPPINGS = {
  // Google Sheets - chuẩn hóa
  SHEET_ID: 'REACT_APP_GOOGLE_SPREADSHEET_ID',
  GOOGLE_SHEETS_SHEET_ID: 'REACT_APP_GOOGLE_SPREADSHEET_ID',
  SERVICE_ACCOUNT_KEY: 'GOOGLE_SHEETS_PRIVATE_KEY',
  GOOGLE_SHEETS_SERVICE_ACCOUNT: 'GOOGLE_SHEETS_CLIENT_EMAIL',

  // Google Drive - chuẩn hóa
  GOOGLE_DRIVE_FOLDER: 'REACT_APP_GOOGLE_DRIVE_FOLDER_ID',
  DRIVE_FOLDER_ID: 'REACT_APP_GOOGLE_DRIVE_FOLDER_ID',

  // Google Apps Script - chuẩn hóa
  APPS_SCRIPT_ID: 'REACT_APP_GOOGLE_APPS_SCRIPT_ID',
  GOOGLE_SCRIPT_ID: 'REACT_APP_GOOGLE_APPS_SCRIPT_ID',

  // Email - chuẩn hóa
  EMAIL_FROM: 'SENDGRID_FROM_EMAIL',
  FROM_EMAIL_ADDRESS: 'SENDGRID_FROM_EMAIL',
  EMAIL_FROM_NAME: 'SENDGRID_FROM_NAME',
  FROM_NAME: 'SENDGRID_FROM_NAME',

  // Telegram - chuẩn hóa
  TELEGRAM_TOKEN: 'TELEGRAM_BOT_TOKEN',
  BOT_TOKEN: 'TELEGRAM_BOT_TOKEN',
  TELEGRAM_CHAT: 'TELEGRAM_CHAT_ID',
  BOT_CHAT_ID: 'TELEGRAM_CHAT_ID',

  // JWT - chuẩn hóa
  JWT_KEY: 'JWT_SECRET',
  SECRET_KEY: 'JWT_SECRET',
  AUTH_SECRET: 'JWT_SECRET',

  // Session - chuẩn hóa
  SESSION_KEY: 'REACT_APP_ENCRYPTION_KEY',
  ENCRYPTION_SECRET: 'REACT_APP_ENCRYPTION_KEY',
  SESSION_TIMEOUT_MS: 'REACT_APP_SESSION_TIMEOUT',

  // Rate Limiting - chuẩn hóa
  RATE_LIMIT_WINDOW: 'RATE_LIMIT_WINDOW_MS',
  RATE_LIMIT_MAX: 'RATE_LIMIT_MAX_ATTEMPTS',
  AUTH_RATE_LIMIT: 'AUTH_RATE_LIMIT_MAX_REQUESTS',

  // CORS - chuẩn hóa
  CORS_ORIGIN: 'CORS_ORIGINS',
  ALLOWED_ORIGINS: 'CORS_ORIGINS',

  // Logging - chuẩn hóa
  LOG_LEVEL_APP: 'REACT_APP_LOG_LEVEL',
  LOG_LEVEL_SERVER: 'LOG_LEVEL',
  LOG_FILE: 'LOG_FILE_PATH',
  LOG_DIR: 'LOG_FILE_PATH',

  // Monitoring - chuẩn hóa
  MONITORING_ENABLED: 'ENABLE_MONITORING',
  PERFORMANCE_MONITORING: 'REACT_APP_ENABLE_PERFORMANCE_MONITORING',
  MOCK_MODE_MESSAGES: 'REACT_APP_ENABLE_MOCK_MODE_MESSAGES',

  // File Upload - chuẩn hóa
  MAX_FILE_SIZE_MB: 'MAX_FILE_SIZE',
  UPLOAD_DIR: 'UPLOAD_PATH',
  FILES_DIR: 'UPLOAD_PATH',

  // Cache - chuẩn hóa
  CACHE_TIMEOUT: 'CACHE_TTL',
  CACHE_SIZE: 'CACHE_MAX_SIZE',
  CACHE_MAX_ITEMS: 'CACHE_MAX_SIZE',

  // Health Check - chuẩn hóa
  HEALTH_CHECK_INTERVAL_MS: 'HEALTH_CHECK_INTERVAL',
  HEALTH_INTERVAL: 'HEALTH_CHECK_INTERVAL',

  // Debug - chuẩn hóa
  DEBUG_MODE: 'DEBUG',
  VERBOSE: 'VERBOSE_LOGGING',
  VERBOSE_LOGS: 'VERBOSE_LOGGING',
};

// Các pattern cần tìm và thay thế
const REPLACEMENT_PATTERNS = [
  // Pattern 1: process.env.OLD_VAR -> process.env.NEW_VAR
  {
    pattern: /process\.env\.([A-Z_]+)/g,
    replacer: (match, varName) => {
      const newVarName = ENV_VAR_MAPPINGS[varName] || varName;
      return `process.env.${newVarName}`;
    },
  },

  // Pattern 2: 'OLD_VAR' -> 'NEW_VAR' trong object keys
  {
    pattern: /['"`]([A-Z_]+)['"`]\s*:/g,
    replacer: (match, varName) => {
      const newVarName = ENV_VAR_MAPPINGS[varName] || varName;
      return `'${newVarName}':`;
    },
  },

  // Pattern 3: OLD_VAR: -> NEW_VAR: trong object
  {
    pattern: /([A-Z_]+)\s*:/g,
    replacer: (match, varName) => {
      const newVarName = ENV_VAR_MAPPINGS[varName] || varName;
      return `${newVarName}:`;
    },
  },
];

// Thống kê thay đổi
const changes = {
  files: 0,
  replacements: 0,
  errors: 0,
};

// Hàm xử lý file
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let newContent = content;
    let fileChanges = 0;

    // Áp dụng các pattern replacement
    REPLACEMENT_PATTERNS.forEach(({ pattern, replacer }) => {
      const matches = newContent.match(pattern);
      if (matches) {
        newContent = newContent.replace(pattern, replacer);
        fileChanges += matches.length;
      }
    });

    // Nếu có thay đổi, ghi file mới
    if (newContent !== content) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      changes.files++;
      changes.replacements += fileChanges;
      console.log(`✅ Updated: ${path.relative(projectRoot, filePath)} (${fileChanges} changes)`);
    }
  } catch (error) {
    changes.errors++;
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

// Hàm duyệt thư mục
function walkDirectory(dir, extensions = ['.js', '.jsx', '.ts', '.tsx']) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Bỏ qua các thư mục không cần thiết
      if (!['node_modules', '.git', 'dist', 'build', 'coverage'].includes(file)) {
        walkDirectory(filePath, extensions);
      }
    } else if (stat.isFile()) {
      const ext = path.extname(file);
      if (extensions.includes(ext)) {
        processFile(filePath);
      }
    }
  });
}

// Hàm tạo báo cáo
function generateReport() {
  console.log('\n📊 Standardization Report');
  console.log('='.repeat(50));
  console.log(`Files processed: ${changes.files}`);
  console.log(`Total replacements: ${changes.replacements}`);
  console.log(`Errors: ${changes.errors}`);

  if (changes.replacements > 0) {
    console.log('\n🔄 Environment Variables Standardized:');
    console.log('-'.repeat(50));

    Object.entries(ENV_VAR_MAPPINGS).forEach(([oldVar, newVar]) => {
      console.log(`${oldVar.padEnd(30)} -> ${newVar}`);
    });
  }

  console.log('\n💡 Next Steps:');
  console.log('1. Review the changes made');
  console.log('2. Update your .env files with the standardized variable names');
  console.log('3. Test the application to ensure everything works');
  console.log('4. Update documentation with the new variable names');
}

// Hàm tạo file .env mẫu chuẩn hóa
function createStandardizedEnvFile() {
  const envContent = `# MIA LOGISTICS MANAGER - STANDARDIZED ENVIRONMENT VARIABLES
# Generated by standardize-env-vars.js

# Core Application
NODE_ENV=development
PORT=5000
HOST=localhost
FRONTEND_URL=http://localhost:3000
API_URL=http://localhost:5000/api/v1

# Google Services
REACT_APP_GOOGLE_API_KEY=your-google-api-key
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id
REACT_APP_ENABLE_GOOGLE_SHEETS=true
REACT_APP_GOOGLE_SPREADSHEET_ID=18B1PIhCDmBWyHZytvOcfj_1QbYBwczLf1x1Qbu0E5As
GOOGLE_SHEETS_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\nYOUR_PRIVATE_KEY\\n-----END PRIVATE KEY-----\\n"

REACT_APP_ENABLE_GOOGLE_DRIVE=true
REACT_APP_GOOGLE_DRIVE_FOLDER_ID=your-folder-id
GOOGLE_DRIVE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_DRIVE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\nYOUR_PRIVATE_KEY\\n-----END PRIVATE KEY-----\\n"

REACT_APP_ENABLE_GOOGLE_APPS_SCRIPT=true
REACT_APP_GOOGLE_APPS_SCRIPT_ID=your-script-id

# Authentication
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=7d
REACT_APP_ENCRYPTION_KEY=your-encryption-key
REACT_APP_SESSION_TIMEOUT=3600000

# Email
SENDGRID_API_KEY=your-sendgrid-key
SENDGRID_FROM_EMAIL=noreply@mia-logistics.com
SENDGRID_FROM_NAME=MIA Logistics Manager

# Telegram
TELEGRAM_BOT_TOKEN=your-bot-token
TELEGRAM_CHAT_ID=your-chat-id

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_ATTEMPTS=100
AUTH_RATE_LIMIT_MAX_REQUESTS=5

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:5000

# Logging
LOG_LEVEL=info
LOG_FILE_PATH=./logs/app.log
REACT_APP_LOG_LEVEL=info

# Development
REACT_APP_USE_MOCK_DATA=false
DEBUG=false
`;

  const envPath = path.join(projectRoot, '.env.standardized');
  fs.writeFileSync(envPath, envContent, 'utf8');
  console.log(`\n📄 Created standardized .env file: ${envPath}`);
}

// Main execution
function main() {
  console.log('🚀 Starting Environment Variables Standardization');
  console.log('='.repeat(60));

  // Xử lý các thư mục chính
  const directories = [
    path.join(projectRoot, 'src'),
    path.join(projectRoot, 'server'),
    path.join(projectRoot, 'scripts'),
  ];

  directories.forEach((dir) => {
    if (fs.existsSync(dir)) {
      console.log(`\n📁 Processing directory: ${path.relative(projectRoot, dir)}`);
      walkDirectory(dir);
    }
  });

  // Tạo báo cáo
  generateReport();

  // Tạo file .env chuẩn hóa
  createStandardizedEnvFile();

  console.log('\n✅ Standardization completed!');
}

// Chạy script
main();
