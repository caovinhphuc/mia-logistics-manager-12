#!/usr/bin/env node

/**
 * Script phân tích và tổ chức lại thư mục scripts
 * Phân loại: keep, archive, delete
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const scriptsDir = path.join(__dirname);

// Phân loại các file
const fileCategories = {
  // File cần giữ lại (core utilities)
  keep: [
    'standardize-env-vars.js',
    'health-check.js',
    'email-notifier.js',
    'telegram-notifier.js',
    'create-env-from-json.js',
    'createEnvFile.js',
    'system-analysis.js',
    'securityHardening.js',
  ],

  // File check/validate (có thể gộp lại)
  check: [
    'check-system-status.js',
    'checkAllConfigs.js',
    'checkGoogleSetup.js',
    'connection-checker.js',
  ],

  // File test (có thể tổ chức vào thư mục tests/)
  test: [
    'test-services.js',
    'testApiService.js',
    'testAuthentication.js',
    'testEmailService.js',
    'testGoogleConnection.js',
    'testTelegramConnection.js',
  ],

  // File deploy (có thể tổ chức vào thư mục deploy/)
  deploy: ['deploy.js', 'deployProduction.js'],

  // File setup (có thể tổ chức vào thư mục setup/)
  setup: ['setup.js', 'setupGoogleAPI.js', 'setupMonitoring.js', 'setupCICD.js', 'setupGCP.js'],

  // File tạm thời/debug (nên xóa)
  delete: [
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

    // Inbound files (có thể cần nhưng tạm thời)
    'addInboundInternationalSample.cjs',
    'deleteInboundJsonColumns.cjs',
    'fixInboundDateFormats.cjs',
    'formatInboundDates.cjs',
    'initInboundInternational.cjs',
    'inspectInboundInternational.cjs',
    'migrateInboundInternational.cjs',
    'resetInboundInternational.cjs',
    'fixMissingCreatedAt.cjs',

    // Manual guides (có thể move sang docs/)
    'manual-create-users-sheet.md',
    'manualUpdateGuide.js',

    // Other temporary files
    'enableGoogleSheetsData.js',
    'initGoogleAPI.js',
    'upgradeLocationManager.js',
    'validateMapping.js',
    'build-optimize.js',
  ],

  // Shell scripts (cần review)
  shell: [
    'build.sh',
    'demoDeployment.sh',
    'deployFirebase.sh',
    'deployGCP.sh',
    'deployNetlify.sh',
    'deployVercel.sh',
    'force-restart.sh',
    'quick-restart.sh',
    'restart-and-test.sh',
    'restart-frontend.sh',
    'restart-project.sh',
    'restart-with-env.sh',
    'runGCPDeployment.sh',
    'securityAudit.sh',
    'setup_script.sh',
    'setup-github.sh',
    'setupGCPAuth.sh',
    'start-all-services.sh',
    'start-clean.sh',
    'start-with-monitoring.sh',
    'start.sh',
    'test-connections.sh',
  ],
};

// Đọc tất cả files trong scripts
function getAllFiles(dir) {
  const files = [];
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      // Bỏ qua node_modules và các thư mục đã tổ chức
      if (!['node_modules', '.git'].includes(item)) {
        const subFiles = getAllFiles(fullPath);
        files.push(...subFiles.map((f) => path.join(item, f)));
      }
    } else if (stat.isFile()) {
      files.push(item);
    }
  }

  return files;
}

// Phân tích và phân loại
function analyzeFiles() {
  const allFiles = getAllFiles(scriptsDir);
  const report = {
    keep: [],
    check: [],
    test: [],
    deploy: [],
    setup: [],
    delete: [],
    shell: [],
    unknown: [],
  };

  for (const file of allFiles) {
    const filename = path.basename(file);
    let categorized = false;

    // Check các category
    for (const [category, files] of Object.entries(fileCategories)) {
      if (files.includes(filename)) {
        report[category].push(file);
        categorized = true;
        break;
      }
    }

    if (!categorized) {
      report.unknown.push(file);
    }
  }

  return report;
}

// Tạo báo cáo
function generateReport(report) {
  console.log('\n📊 PHÂN TÍCH THƯ MỤC SCRIPTS');
  console.log('='.repeat(60));

  console.log(`\n✅ KEEP (${report.keep.length} files):`);
  report.keep.forEach((f) => console.log(`  - ${f}`));

  console.log(`\n🔍 CHECK (${report.check.length} files):`);
  report.check.forEach((f) => console.log(`  - ${f}`));

  console.log(`\n🧪 TEST (${report.test.length} files):`);
  report.test.forEach((f) => console.log(`  - ${f}`));

  console.log(`\n🚀 DEPLOY (${report.deploy.length} files):`);
  report.deploy.forEach((f) => console.log(`  - ${f}`));

  console.log(`\n⚙️  SETUP (${report.setup.length} files):`);
  report.setup.forEach((f) => console.log(`  - ${f}`));

  console.log(`\n🗑️  DELETE (${report.delete.length} files):`);
  report.delete.forEach((f) => console.log(`  - ${f}`));

  console.log(`\n📜 SHELL (${report.shell.length} files):`);
  report.shell.forEach((f) => console.log(`  - ${f}`));

  console.log(`\n❓ UNKNOWN (${report.unknown.length} files):`);
  report.unknown.forEach((f) => console.log(`  - ${f}`));

  console.log('\n' + '='.repeat(60));
  console.log(`\n📈 TỔNG KẾT:`);
  console.log(`  Tổng số files: ${Object.values(report).reduce((a, b) => a + b.length, 0)}`);
  console.log(
    `  Files sẽ giữ: ${report.keep.length + report.check.length + report.test.length + report.deploy.length + report.setup.length + report.shell.length}`
  );
  console.log(`  Files sẽ xóa: ${report.delete.length}`);
  console.log(`  Files chưa phân loại: ${report.unknown.length}`);
}

// Main
const report = analyzeFiles();
generateReport(report);

// Lưu báo cáo vào file
const reportPath = path.join(scriptsDir, 'scripts-analysis-report.json');
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
console.log(`\n💾 Báo cáo đã lưu vào: ${reportPath}`);
