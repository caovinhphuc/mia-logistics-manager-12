// server/update-env.js
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');

// Read current .env file
let envContent = '';
if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, 'utf8');
}

// Google Sheets configuration to add
const googleSheetsConfig = `
# Google Sheets Configuration
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\nYOUR_PRIVATE_KEY_HERE\\n-----END PRIVATE KEY-----\\n"
GOOGLE_SPREADSHEET_ID=your-spreadsheet-id-here`;

// Check if Google Sheets config already exists
if (envContent.includes('GOOGLE_SERVICE_ACCOUNT_EMAIL')) {
  console.log('✅ Google Sheets configuration already exists in .env');
} else {
  // Add Google Sheets config to .env
  const updatedContent = envContent + googleSheetsConfig;

  try {
    fs.writeFileSync(envPath, updatedContent);
    console.log('✅ Added Google Sheets configuration to .env');
    console.log('📝 Please update the following values in .env:');
    console.log('   • GOOGLE_SERVICE_ACCOUNT_EMAIL');
    console.log('   • GOOGLE_PRIVATE_KEY');
    console.log('   • GOOGLE_SPREADSHEET_ID');
  } catch (error) {
    console.error('❌ Error updating .env:', error.message);
  }
}

console.log('\n📋 Current .env configuration:');
console.log('='.repeat(50));
console.log(envContent);
console.log('='.repeat(50));
