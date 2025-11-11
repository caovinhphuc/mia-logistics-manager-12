#!/usr/bin/env node

/**
 * System Status Check Script
 * Kiểm tra trạng thái hệ thống và các lỗi phổ biến
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 MIA Logistics Manager - System Status Check');
console.log('==============================================');
console.log('');

// Function to check file exists
function checkFile(filePath, description) {
    if (fs.existsSync(filePath)) {
        console.log(`✅ ${description}: ${filePath}`);
        return true;
    } else {
        console.log(`❌ ${description}: ${filePath} (not found)`);
        return false;
    }
}

// Function to check import statements
function checkImports(filePath, description) {
    if (!fs.existsSync(filePath)) {
        console.log(`❌ ${description}: File not found`);
        return false;
    }

    try {
        const content = fs.readFileSync(filePath, 'utf8');

        // Check for problematic imports
        const problematicImports = [
            'useGoogleSheetsAuth',
            'GoogleSheetsAuthContext'
        ];

        let hasIssues = false;
        problematicImports.forEach(importName => {
            if (content.includes(importName)) {
                console.log(`⚠️  ${description}: Contains ${importName}`);
                hasIssues = true;
            }
        });

        if (!hasIssues) {
            console.log(`✅ ${description}: No problematic imports`);
        }

        return !hasIssues;
    } catch (error) {
        console.log(`❌ ${description}: Error reading file - ${error.message}`);
        return false;
    }
}

try {
    console.log('📁 FILE STRUCTURE CHECK');
    console.log('========================');

    // Check critical files
    const criticalFiles = [
        ['./src/contexts/AuthContext.js', 'AuthContext'],
        ['./src/services/user/userService.js', 'UserService'],
        ['./src/services/google/googleSheetsService.js', 'GoogleSheetsService'],
        ['./src/services/google/googleAuthService.js', 'GoogleAuthService'],
        ['./src/components/auth/Login.js', 'Login Component'],
        ['./src/App.js', 'App Component'],
        ['./src/index.js', 'Index Component'],
        ['./.env', 'Environment Variables'],
        ['./backend/server.js', 'Backend Server']
    ];

    let allFilesExist = true;
    criticalFiles.forEach(([filePath, description]) => {
        if (!checkFile(filePath, description)) {
            allFilesExist = false;
        }
    });

    console.log('');

    console.log('🔍 IMPORT CHECK');
    console.log('===============');

    // Check for problematic imports
    const filesToCheck = [
        ['./src/components/auth/Login.js', 'Login Component'],
        ['./src/App.js', 'App Component'],
        ['./src/index.js', 'Index Component'],
        ['./src/components/layout/Header.jsx', 'Header Component'],
        ['./src/components/layout/MainLayout.jsx', 'MainLayout Component'],
        ['./src/components/common/MainLayout.jsx', 'Common MainLayout Component']
    ];

    let allImportsClean = true;
    filesToCheck.forEach(([filePath, description]) => {
        if (!checkImports(filePath, description)) {
            allImportsClean = false;
        }
    });

    console.log('');

    console.log('⚙️  CONFIGURATION CHECK');
    console.log('=======================');

    // Check environment variables
    if (fs.existsSync('./.env')) {
        const envContent = fs.readFileSync('./.env', 'utf8');

        const requiredVars = [
            'REACT_APP_GOOGLE_CLIENT_ID',
            'REACT_APP_GOOGLE_SPREADSHEET_ID',
            'REACT_APP_GOOGLE_API_KEY',
            'REACT_APP_USE_MOCK_DATA'
        ];

        requiredVars.forEach(varName => {
            if (envContent.includes(varName)) {
                console.log(`✅ Environment variable: ${varName}`);
            } else {
                console.log(`❌ Missing environment variable: ${varName}`);
            }
        });
    } else {
        console.log('❌ .env file not found');
    }

    console.log('');

    console.log('📋 SUMMARY');
    console.log('==========');

    if (allFilesExist && allImportsClean) {
        console.log('✅ System status: HEALTHY');
        console.log('🎉 All critical files exist and imports are clean');
        console.log('');
        console.log('Next steps:');
        console.log('1. Restart frontend: npm start');
        console.log('2. Test login with: admin@mia.vn');
        console.log('3. Check browser console for any remaining errors');
    } else {
        console.log('❌ System status: ISSUES DETECTED');
        console.log('🔧 Please fix the issues above before proceeding');
    }

} catch (error) {
    console.error('❌ Error during system check:', error.message);
    process.exit(1);
}
