#!/usr/bin/env node

/**
 * Script dọn dẹp thư mục scripts
 * Xóa files tạm thời, trùng lặp và tổ chức lại
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const scriptsDir = path.join(__dirname);

// Files cần xóa (tạm thời/debug/trùng lặp)
const filesToDelete = [
  // Fix files
  'fixDuplicateKeys.js',
  'fixGoogleSheetsError.js',
  'fixGoogleSheetsMethods.js',
  'fixGoogleSheetsUserData.js',
  'fixLocationsServiceError.js',
  'fixLocationTypesError.js',
  'fixMapError.js',
  'fixMockDataInitialization.js',
  'fixProcessEnvError.js',
  'fixProxyServiceError.js',
  'fixTableContainerError.js',
  'fixUserActiveIssue.js',
  'fixViewModuleError.js',

  // Debug files
  'debugFrontend.js',
  'debugGoogleSheets.js',
  'debugUserData.js',

  // Final/Summary files (tạm thời)
  'finalDeploymentStatus.js',
  'finalFixSummary.js',
  'finalGoogleSheetsSummary.js',
  'finalGoogleSheetsTest.js',
  'finalTest.js',
  'finalUserDataFix.js',
  'finalUserManagementSummary.js',
  'googleSheetsIntegrationSummary.js',
  'emailLoginSummary.js',

  // Restart files (có thể gộp)
  'restartAfterFix.js',
  'restartFrontend.js',

  // Test files cũ/trùng lặp
  'test-login-browser-simple.js',
  'test-login-browser.js',
  'test-login-direct.js',
  'test-login-final.js',
  'test-login-flow.js',
  'test-login-simple.js',
  'test-mui-theme-fix.js',
  'testAfterFix.js',
  'testFrontendAccess.js',
  'testFrontendLoading.js',
  'testFullSystem.js',
  'testMockData.js',
  'testWithRealUsers.js',
  'testWithServiceAccount.js',
  'testAllUsers.js',
  'testAdvancedFeatures.js',
  'testDeployment.js',
  'testGoogleIntegration.js',
  'testGoogleSheetsConnection.js',
  'testGoogleSheetsData.js',
  'testUserManagementSystem.js',

  // Update files trùng lặp
  'updateSheetNow.js',
  'updateSheetSimple.js',
  'updateSheetsWithAPI.js',
  'updateSheetViaURL.js',
  'updateSheetWithAPI.js',
  'updateSheetWithCredentials.js',
  'updateGoogleSheet.js',
  'updateGoogleSheetDirect.js',
  'updateExistingSheet.js',
  'updateGoogleSheetsUserManagement.js',
  'updateEmailLogin.js',
  'updateEnvWithApiKey.js',

  // Check files trùng lặp
  'check-and-add-user.js',
  'check-current-sheets.js',
  'check-google-sheets-direct.js',
  'check-google-sheets-structure.js',
  'check-sheets-api.js',
  'checkExistingSheets.js',
  'checkCredentials.js',
  'checkGoogleAPI.js',
  'checkGoogleSheetsData.js',
  'checkSheetStructure.js',
  'checkMissingDescriptionColumns.cjs',
  'simple-google-sheets-check.js',
  'test-sheets-connection.js',

  // Create files trùng lặp
  'createSampleData.js',
  'createSampleLocations.js',
  'createSampleUserData.js',
  'createTestInboundData.cjs',
  'createTestInboundDataFixed.cjs',
  'createDomesticTestData.cjs',
  'createUsersSheet.js',
  'create-users-sheet.js',
  'create-users-sheet-apps-script.js',
  'create-users-sheet-service-account.js',
  'createGoogleApiKey.js',
  'createUserManagementSheets.js',
  'implementUserManagement.js',
  'deployUserManagement.js',

  // Analyze files
  'analyzeExistingData.js',
  'analyzeUserManagementSheets.js',

  // Inbound files (tạm thời)
  'addInboundInternationalSample.cjs',
  'deleteInboundJsonColumns.cjs',
  'fixInboundDateFormats.cjs',
  'formatInboundDates.cjs',
  'initInboundInternational.cjs',
  'inspectInboundInternational.cjs',
  'migrateInboundInternational.cjs',
  'resetInboundInternational.cjs',
  'fixMissingCreatedAt.cjs',

  // Manual guides (move sang docs/)
  'manual-create-users-sheet.md',
  'manualUpdateGuide.js',

  // Other temporary files
  'enableGoogleSheetsData.js',
  'initGoogleAPI.js',
  'upgradeLocationManager.js',
  'validateMapping.js',
  'build-optimize.js',
  'showDeploymentStatus.js',
  'test-all-users.js',
  'test-browser-console.js',
];

// Files cần giữ lại (core utilities)
const filesToKeep = [
  'standardize-env-vars.js',
  'health-check.js',
  'email-notifier.js',
  'telegram-notifier.js',
  'create-env-from-json.js',
  'createEnvFile.js',
  'system-analysis.js',
  'securityHardening.js',
  'test-services.js',
  'testApiService.js',
  'testAuthentication.js',
  'testEmailService.js',
  'testGoogleConnection.js',
  'testTelegramConnection.js',
  'deploy.js',
  'deployProduction.js',
  'setup.js',
  'setupGoogleAPI.js',
  'setupMonitoring.js',
  'setupCICD.js',
  'setupGCP.js',
  'check-system-status.js',
  'checkAllConfigs.js',
  'checkGoogleSetup.js',
  'connection-checker.js',
];

// Tạo thư mục tổ chức
const organizeDirectories = [
  'core', // Core utilities
  'tests', // Test files
  'deploy', // Deployment scripts
  'setup', // Setup scripts
  'checks', // Validation scripts
  'shell', // Shell scripts
];

// Tạo thư mục tổ chức
function createOrganizeDirectories() {
  console.log('📁 Tạo thư mục tổ chức...');

  organizeDirectories.forEach((dir) => {
    const dirPath = path.join(scriptsDir, dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`  ✅ Tạo thư mục: ${dir}`);
    }
  });
}

// Xóa files tạm thời
function deleteTemporaryFiles() {
  console.log('\n🗑️  Xóa files tạm thời...');
  let deletedCount = 0;

  filesToDelete.forEach((file) => {
    const filePath = path.join(scriptsDir, file);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
        console.log(`  ✅ Đã xóa: ${file}`);
        deletedCount++;
      } catch (error) {
        console.log(`  ❌ Lỗi xóa ${file}: ${error.message}`);
      }
    }
  });

  console.log(`\n📊 Đã xóa ${deletedCount} files tạm thời`);
}

// Tổ chức files còn lại
function organizeRemainingFiles() {
  console.log('\n📂 Tổ chức files còn lại...');

  const fileMappings = {
    core: [
      'standardize-env-vars.js',
      'health-check.js',
      'email-notifier.js',
      'telegram-notifier.js',
      'create-env-from-json.js',
      'createEnvFile.js',
      'system-analysis.js',
      'securityHardening.js',
    ],
    tests: [
      'test-services.js',
      'testApiService.js',
      'testAuthentication.js',
      'testEmailService.js',
      'testGoogleConnection.js',
      'testTelegramConnection.js',
    ],
    deploy: ['deploy.js', 'deployProduction.js'],
    setup: ['setup.js', 'setupGoogleAPI.js', 'setupMonitoring.js', 'setupCICD.js', 'setupGCP.js'],
    checks: [
      'check-system-status.js',
      'checkAllConfigs.js',
      'checkGoogleSetup.js',
      'connection-checker.js',
    ],
  };

  let movedCount = 0;

  Object.entries(fileMappings).forEach(([dir, files]) => {
    const targetDir = path.join(scriptsDir, dir);

    files.forEach((file) => {
      const sourcePath = path.join(scriptsDir, file);
      const targetPath = path.join(targetDir, file);

      if (fs.existsSync(sourcePath)) {
        try {
          fs.renameSync(sourcePath, targetPath);
          console.log(`  ✅ Moved ${file} → ${dir}/`);
          movedCount++;
        } catch (error) {
          console.log(`  ❌ Lỗi move ${file}: ${error.message}`);
        }
      }
    });
  });

  console.log(`\n📊 Đã di chuyển ${movedCount} files`);
}

// Gộp shell scripts
function consolidateShellScripts() {
  console.log('\n📜 Gộp shell scripts...');

  const shellDir = path.join(scriptsDir, 'shell');
  if (!fs.existsSync(shellDir)) {
    fs.mkdirSync(shellDir, { recursive: true });
  }

  // Tìm tất cả .sh files
  const shellFiles = [];
  function findShellFiles(dir) {
    const items = fs.readdirSync(dir);
    items.forEach((item) => {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory() && !['node_modules', '.git', 'shell'].includes(item)) {
        findShellFiles(fullPath);
      } else if (stat.isFile() && item.endsWith('.sh')) {
        shellFiles.push(fullPath);
      }
    });
  }

  findShellFiles(scriptsDir);

  let movedShellCount = 0;
  shellFiles.forEach((filePath) => {
    const fileName = path.basename(filePath);
    const targetPath = path.join(shellDir, fileName);

    try {
      if (!fs.existsSync(targetPath)) {
        fs.renameSync(filePath, targetPath);
        console.log(`  ✅ Moved ${fileName} → shell/`);
        movedShellCount++;
      } else {
        // File đã tồn tại, xóa file cũ
        fs.unlinkSync(filePath);
        console.log(`  🗑️  Deleted duplicate ${fileName}`);
      }
    } catch (error) {
      console.log(`  ❌ Lỗi move ${fileName}: ${error.message}`);
    }
  });

  console.log(`\n📊 Đã gộp ${movedShellCount} shell scripts`);
}

// Xóa thư mục trống
function removeEmptyDirectories() {
  console.log('\n🧹 Xóa thư mục trống...');

  function removeEmptyDirs(dir) {
    const items = fs.readdirSync(dir);
    let isEmpty = true;

    items.forEach((item) => {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        if (removeEmptyDirs(fullPath)) {
          fs.rmdirSync(fullPath);
          console.log(`  🗑️  Xóa thư mục trống: ${path.relative(scriptsDir, fullPath)}`);
        } else {
          isEmpty = false;
        }
      } else {
        isEmpty = false;
      }
    });

    return isEmpty;
  }

  removeEmptyDirs(scriptsDir);
}

// Tạo README cho thư mục scripts
function createScriptsREADME() {
  const readmeContent = `# Scripts Directory

## 📁 Cấu Trúc Thư Mục

### core/
Core utilities và services chính:
- \`standardize-env-vars.js\` - Chuẩn hóa biến môi trường
- \`health-check.js\` - Kiểm tra sức khỏe hệ thống
- \`email-notifier.js\` - Gửi email thông báo
- \`telegram-notifier.js\` - Gửi Telegram thông báo
- \`system-analysis.js\` - Phân tích hệ thống
- \`securityHardening.js\` - Bảo mật hệ thống

### tests/
Test scripts cho các services:
- \`test-services.js\` - Test tất cả services
- \`testApiService.js\` - Test API service
- \`testAuthentication.js\` - Test authentication
- \`testEmailService.js\` - Test email service
- \`testGoogleConnection.js\` - Test Google connection
- \`testTelegramConnection.js\` - Test Telegram connection

### deploy/
Deployment scripts:
- \`deploy.js\` - Deploy chính
- \`deployProduction.js\` - Deploy production

### setup/
Setup và configuration scripts:
- \`setup.js\` - Setup chính
- \`setupGoogleAPI.js\` - Setup Google API
- \`setupMonitoring.js\` - Setup monitoring
- \`setupCICD.js\` - Setup CI/CD
- \`setupGCP.js\` - Setup Google Cloud Platform

### checks/
Validation và check scripts:
- \`check-system-status.js\` - Check trạng thái hệ thống
- \`checkAllConfigs.js\` - Check tất cả configs
- \`checkGoogleSetup.js\` - Check Google setup
- \`connection-checker.js\` - Check connections

### shell/
Shell scripts:
- Các file .sh được gộp vào đây

## 🚀 Sử Dụng

\`\`\`bash
# Chạy health check
node core/health-check.js

# Test services
node tests/test-services.js

# Deploy
node deploy/deploy.js

# Setup
node setup/setup.js
\`\`\`

## 📝 Ghi Chú

- Tất cả files tạm thời, debug, và trùng lặp đã được xóa
- Files được tổ chức theo chức năng
- Shell scripts được gộp vào thư mục shell/
`;

  const readmePath = path.join(scriptsDir, 'README.md');
  fs.writeFileSync(readmePath, readmeContent);
  console.log('\n📝 Đã tạo README.md cho thư mục scripts');
}

// Main function
function main() {
  console.log('🧹 BẮT ĐẦU DỌN DẸP THƯ MỤC SCRIPTS');
  console.log('='.repeat(50));

  try {
    createOrganizeDirectories();
    deleteTemporaryFiles();
    organizeRemainingFiles();
    consolidateShellScripts();
    removeEmptyDirectories();
    createScriptsREADME();

    console.log('\n✅ HOÀN THÀNH DỌN DẸP!');
    console.log('='.repeat(50));
    console.log('📊 Kết quả:');
    console.log('  - Đã xóa files tạm thời/debug/trùng lặp');
    console.log('  - Đã tổ chức files theo chức năng');
    console.log('  - Đã gộp shell scripts');
    console.log('  - Đã tạo README.md');
  } catch (error) {
    console.error('❌ Lỗi trong quá trình dọn dẹp:', error.message);
  }
}

// Chạy script
main();
