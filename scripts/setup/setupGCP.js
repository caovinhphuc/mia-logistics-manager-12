// Google Cloud Platform Setup Script
// Triển khai GCP setup theo GOOGLE_CLOUD_SETUP.md

const fs = require('fs');
const path = require('path');

console.log('🚀 Google Cloud Platform Setup');
console.log('==============================');
console.log('');

// Configuration
const GCP_CONFIG = {
  projectId: 'mia-logistics-prod',
  projectName: 'MIA Logistics Production',
  serviceAccountName: 'mia-logistics-service',
  serviceAccountDisplayName: 'MIA Logistics Service Account',
  billingAccountId: 'YOUR_BILLING_ACCOUNT_ID', // Cần cập nhật
};

// Required APIs
const REQUIRED_APIS = [
  'sheets.googleapis.com',
  'drive.googleapis.com',
  'script.googleapis.com',
  'maps-backend.googleapis.com',
  'places-backend.googleapis.com',
  'directions-backend.googleapis.com',
  'distance-matrix-backend.googleapis.com',
  'geocoding-backend.googleapis.com',
  'geolocation.googleapis.com',
  'monitoring.googleapis.com'
];

// Service Account Roles
const SERVICE_ACCOUNT_ROLES = [
  'roles/sheets.editor',
  'roles/drive.file',
  'roles/script.developer'
];

// Generate gcloud commands
function generateGCloudCommands() {
  console.log('📋 GCloud Commands:');
  console.log('==================');
  console.log('');

  // 1. Create project
  console.log('1. Tạo Google Cloud Project:');
  console.log(`gcloud projects create ${GCP_CONFIG.projectId} --name="${GCP_CONFIG.projectName}"`);
  console.log(`gcloud config set project ${GCP_CONFIG.projectId}`);
  console.log('');

  // 2. Enable billing
  console.log('2. Enable billing:');
  console.log(`gcloud beta billing projects link ${GCP_CONFIG.projectId} --billing-account=${GCP_CONFIG.billingAccountId}`);
  console.log('');

  // 3. Enable APIs
  console.log('3. Enable APIs:');
  REQUIRED_APIS.forEach(api => {
    console.log(`gcloud services enable ${api}`);
  });
  console.log('');

  // 4. Create service account
  console.log('4. Tạo Service Account:');
  console.log(`gcloud iam service-accounts create ${GCP_CONFIG.serviceAccountName} \\`);
  console.log(`  --display-name="${GCP_CONFIG.serviceAccountDisplayName}" \\`);
  console.log(`  --description="Service account for MIA Logistics Manager"`);
  console.log('');

  // 5. Get service account email
  console.log('5. Lấy Service Account Email:');
  console.log(`SA_EMAIL=$(gcloud iam service-accounts list \\`);
  console.log(`  --filter="displayName:${GCP_CONFIG.serviceAccountDisplayName}" \\`);
  console.log(`  --format="value(email)")`);
  console.log('');

  // 6. Grant roles
  console.log('6. Cấp quyền cho Service Account:');
  SERVICE_ACCOUNT_ROLES.forEach(role => {
    console.log(`gcloud projects add-iam-policy-binding ${GCP_CONFIG.projectId} \\`);
    console.log(`  --member="serviceAccount:$SA_EMAIL" \\`);
    console.log(`  --role="${role}"`);
  });
  console.log('');

  // 7. Create service account key
  console.log('7. Tạo Service Account Key:');
  console.log(`mkdir -p credentials`);
  console.log(`gcloud iam service-accounts keys create credentials/service-account-key.json \\`);
  console.log(`  --iam-account=$SA_EMAIL`);
  console.log('');

  // 8. Create API key
  console.log('8. Tạo API Key cho Maps:');
  console.log(`gcloud alpha services api-keys create --display-name="MIA Logistics Maps API Key"`);
  console.log('');

  // 9. Get API key
  console.log('9. Lấy API Key:');
  console.log(`API_KEY=$(gcloud alpha services api-keys list \\`);
  console.log(`  --filter="displayName:MIA Logistics Maps API Key" \\`);
  console.log(`  --format="value(name)")`);
  console.log('');

  // 10. Restrict API key
  console.log('10. Giới hạn API Key:');
  console.log(`gcloud alpha services api-keys update $API_KEY \\`);
  console.log(`  --api-target=maps-backend.googleapis.com \\`);
  console.log(`  --api-target=places-backend.googleapis.com \\`);
  console.log(`  --api-target=directions-backend.googleapis.com`);
  console.log('');

  console.log('⚠️  Lưu ý:');
  console.log('- Thay thế YOUR_BILLING_ACCOUNT_ID bằng billing account ID thực');
  console.log('- Chạy các lệnh gcloud theo thứ tự');
  console.log('- Lưu trữ service account key an toàn');
}

// Generate Apps Script setup
function generateAppsScriptSetup() {
  console.log('📜 Apps Script Setup:');
  console.log('====================');
  console.log('');

  const appsScriptCode = `
// MIA Logistics Manager - Apps Script Setup
function setupMIALogistics() {
  console.log('🚀 Setting up MIA Logistics Manager Apps Script');

  // 1. Create main spreadsheet
  createMainSpreadsheet();

  // 2. Setup Google Drive folders
  createDriveFolderStructure();

  // 3. Setup triggers
  setupTriggers();

  // 4. Setup data validation
  setupDataValidation();

  console.log('✅ MIA Logistics Manager setup completed');
}

function createMainSpreadsheet() {
  const ss = SpreadsheetApp.create('MIA Logistics Database');

  // Transport Requests Sheet (54 columns)
  const transportSheet = ss.insertSheet('Transport_Requests');
  const transportHeaders = [
    'ID', 'RequestDate', 'CustomerID', 'CustomerName', 'CustomerPhone',
    'CustomerEmail', 'OriginAddress', 'OriginLat', 'OriginLng', 'DestinationAddress',
    'DestinationLat', 'DestinationLng', 'CargoType', 'CargoWeight', 'CargoVolume',
    'CargoValue', 'VehicleType', 'DriverID', 'DriverName', 'VehicleID',
    'VehiclePlate', 'Status', 'Priority', 'ScheduledDate', 'ActualStartDate',
    'ActualEndDate', 'Distance', 'EstimatedCost', 'ActualCost', 'FuelCost',
    'TollCost', 'OtherCosts', 'PaymentMethod', 'PaymentStatus', 'Notes',
    'CreatedBy', 'CreatedAt', 'UpdatedBy', 'UpdatedAt', 'Route',
    'EstimatedDuration', 'ActualDuration', 'WeatherCondition', 'TrafficCondition', 'CustomerRating',
    'DriverRating', 'CompletionNotes', 'DocumentsUploaded', 'InsuranceInfo', 'SpecialInstructions',
    'ContactPerson', 'BackupDriver', 'EmergencyContact', 'ComplianceCheck'
  ];

  transportSheet.getRange(1, 1, 1, transportHeaders.length).setValues([transportHeaders]);

  // Format headers
  transportSheet.getRange(1, 1, 1, transportHeaders.length)
    .setBackground('#1976d2')
    .setFontColor('white')
    .setFontWeight('bold');

  transportSheet.setFrozenRows(1);

  // Add data validation for Status
  const statusRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['Pending', 'Confirmed', 'In Transit', 'Delivered', 'Cancelled'])
    .build();
  transportSheet.getRange(2, 22, 1000, 1).setDataValidation(statusRule);

  console.log('✅ Transport Requests sheet created');
  return ss.getUrl();
}

function createDriveFolderStructure() {
  const mainFolder = DriveApp.createFolder('MIA Logistics Files');

  const folders = [
    'Transport Documents',
    'Warehouse Images',
    'Staff Documents',
    'Partner Contracts',
    'System Backups',
    'Invoice Templates',
    'Reports Archive',
    'Vehicle Documents',
    'Insurance Papers',
    'Compliance Records'
  ];

  folders.forEach(folderName => {
    mainFolder.createFolder(folderName);
  });

  console.log('✅ Drive folder structure created');
  return mainFolder.getId();
}

function setupTriggers() {
  // Delete existing triggers
  ScriptApp.getProjectTriggers().forEach(trigger => {
    ScriptApp.deleteTrigger(trigger);
  });

  // Daily backup trigger
  ScriptApp.newTrigger('dailyBackup')
    .timeBased()
    .everyDays(1)
    .atHour(2)
    .create();

  // Hourly data sync trigger
  ScriptApp.newTrigger('syncData')
    .timeBased()
    .everyHours(1)
    .create();

  console.log('✅ Triggers set up successfully');
}

function setupDataValidation() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // Protect header rows
  const sheets = ss.getSheets();
  sheets.forEach(sheet => {
    const protection = sheet.getRange(1, 1, 1, sheet.getLastColumn()).protect();
    protection.setDescription('Header row - Do not edit');
  });

  console.log('✅ Data validation set up successfully');
}

function dailyBackup() {
  const ss = SpreadsheetApp.openById('YOUR_SPREADSHEET_ID');
  const timestamp = Utilities.formatDate(new Date(), 'GMT+7', 'yyyyMMdd_HHmmss');

  const backup = ss.copy('MIA_Logistics_Backup_' + timestamp);

  console.log('✅ Daily backup created: ' + backup.getUrl());
}
`;

  console.log('Apps Script code để setup:');
  console.log('==========================');
  console.log(appsScriptCode);
}

// Generate monitoring setup
function generateMonitoringSetup() {
  console.log('📊 Monitoring Setup:');
  console.log('====================');
  console.log('');

  const monitoringConfig = {
    displayName: "MIA Logistics Monitoring",
    widgets: [
      {
        title: "API Requests",
        xyChart: {
          dataSets: [{
            timeSeriesQuery: {
              filter: 'resource.type="consumed_api"',
              aggregation: {
                alignmentPeriod: "60s",
                perSeriesAligner: "ALIGN_RATE"
              }
            }
          }]
        }
      },
      {
        title: "Error Rate",
        xyChart: {
          dataSets: [{
            timeSeriesQuery: {
              filter: 'resource.type="consumed_api" AND metric.label.response_code_class="4xx"'
            }
          }]
        }
      }
    ]
  };

  console.log('Monitoring Dashboard Config:');
  console.log(JSON.stringify(monitoringConfig, null, 2));
  console.log('');

  console.log('Tạo monitoring dashboard:');
  console.log('gcloud alpha monitoring dashboards create --config-from-file=monitoring/dashboard-config.yaml');
}

// Generate security configuration
function generateSecurityConfig() {
  console.log('🔒 Security Configuration:');
  console.log('==========================');
  console.log('');

  console.log('1. API Key Security:');
  console.log('gcloud alpha services api-keys update $API_KEY --allowed-referrers="https://yourdomain.com/*"');
  console.log('');

  console.log('2. OAuth Configuration (cần cập nhật):');
  const oauthConfig = {
    web: {
      client_id: "YOUR_CLIENT_ID",
      project_id: GCP_CONFIG.projectId,
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
      client_secret: "YOUR_CLIENT_SECRET",
      redirect_uris: [
        "https://yourdomain.com/auth/google/callback"
      ],
      javascript_origins: [
        "https://yourdomain.com"
      ]
    }
  };

  console.log(JSON.stringify(oauthConfig, null, 2));
  console.log('');

  console.log('3. Service Account Key Rotation:');
  console.log('gcloud iam service-accounts keys create new-key.json --iam-account=$SA_EMAIL');
  console.log('gcloud iam service-accounts keys delete OLD_KEY_ID --iam-account=$SA_EMAIL');
}

// Generate troubleshooting guide
function generateTroubleshootingGuide() {
  console.log('🚨 Troubleshooting Guide:');
  console.log('=========================');
  console.log('');

  console.log('1. Quota Exceeded Errors:');
  console.log('gcloud logging read "protoPayload.methodName=SheetsService.BatchUpdate" --limit=50');
  console.log('');

  console.log('2. Permission Denied:');
  console.log(`gcloud projects get-iam-policy ${GCP_CONFIG.projectId} --flatten="bindings[].members" --filter="bindings.members:*${GCP_CONFIG.serviceAccountName}*"`);
  console.log('');

  console.log('3. API Key Issues:');
  console.log('curl "https://maps.googleapis.com/maps/api/geocode/json?address=Hanoi&key=YOUR_API_KEY"');
  console.log('');

  console.log('4. Check API Status:');
  console.log('gcloud services list --enabled');
  console.log('');

  console.log('5. Check Billing:');
  console.log('gcloud billing accounts list');
  console.log('gcloud billing projects describe ' + GCP_CONFIG.projectId);
}

// Main function
function main() {
  console.log('🎯 MIA Logistics Manager - Google Cloud Platform Setup');
  console.log('======================================================');
  console.log('');

  generateGCloudCommands();
  console.log('');

  generateAppsScriptSetup();
  console.log('');

  generateMonitoringSetup();
  console.log('');

  generateSecurityConfig();
  console.log('');

  generateTroubleshootingGuide();
  console.log('');

  console.log('📚 Tài liệu tham khảo:');
  console.log('=====================');
  console.log('- GOOGLE_CLOUD_SETUP.md: Hướng dẫn chi tiết');
  console.log('- GOOGLE_SETUP_GUIDE.md: Hướng dẫn setup cơ bản');
  console.log('- GOOGLE_APIS_DEPLOYMENT.md: Hướng dẫn deployment');
  console.log('');

  console.log('⚠️  Lưu ý quan trọng:');
  console.log('====================');
  console.log('1. Thay thế YOUR_BILLING_ACCOUNT_ID bằng billing account ID thực');
  console.log('2. Cập nhật YOUR_CLIENT_ID và YOUR_CLIENT_SECRET trong OAuth config');
  console.log('3. Thay thế yourdomain.com bằng domain thực');
  console.log('4. Lưu trữ service account key an toàn');
  console.log('5. Kiểm tra API quotas và billing');
  console.log('');

  console.log('✅ Setup script hoàn thành!');
  console.log('   Tiếp theo: Chạy các lệnh gcloud theo thứ tự');
}

// Run the script
main();
