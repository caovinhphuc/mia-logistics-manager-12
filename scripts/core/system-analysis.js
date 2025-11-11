#!/usr/bin/env node

/**
 * System Analysis Script
 * Thống kê và phân tích hệ thống MIA Logistics Manager
 */

const fs = require('fs');
const path = require('path');

console.log('📊 MIA Logistics Manager - System Analysis');
console.log('==========================================');
console.log('');

// Function to count files
function countFiles(dir, extension = null) {
    let count = 0;
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            count += countFiles(filePath, extension);
        } else if (extension === null || file.endsWith(extension)) {
            count++;
        }
    }

    return count;
}

// Function to get directory size
function getDirSize(dir) {
    let size = 0;
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            size += getDirSize(filePath);
        } else {
            size += stat.size;
        }
    }

    return size;
}

// Function to format bytes
function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Function to analyze imports
function analyzeImports(dir) {
    const imports = new Map();
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            const subImports = analyzeImports(filePath);
            for (const [key, value] of subImports) {
                imports.set(key, (imports.get(key) || 0) + value);
            }
        } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
            try {
                const content = fs.readFileSync(filePath, 'utf8');
                const lines = content.split('\n');

                for (const line of lines) {
                    if (line.includes('import') && line.includes('from')) {
                        const match = line.match(/from\s+['"]([^'"]+)['"]/);
                        if (match) {
                            const importPath = match[1];
                            imports.set(importPath, (imports.get(importPath) || 0) + 1);
                        }
                    }
                }
            } catch (error) {
                // Skip files that can't be read
            }
        }
    }

    return imports;
}

try {
    // 1. File Structure Analysis
    console.log('📁 FILE STRUCTURE ANALYSIS');
    console.log('==========================');

    const srcDir = './src';
    const totalFiles = countFiles(srcDir);
    const jsFiles = countFiles(srcDir, '.js');
    const jsxFiles = countFiles(srcDir, '.jsx');
    const cssFiles = countFiles(srcDir, '.css');
    const jsonFiles = countFiles(srcDir, '.json');

    console.log(`Total files: ${totalFiles}`);
    console.log(`JavaScript files (.js): ${jsFiles}`);
    console.log(`React files (.jsx): ${jsxFiles}`);
    console.log(`CSS files: ${cssFiles}`);
    console.log(`JSON files: ${jsonFiles}`);
    console.log('');

    // 2. Directory Structure
    console.log('📂 DIRECTORY STRUCTURE');
    console.log('======================');

    function printDir(dir, prefix = '', maxDepth = 3, currentDepth = 0) {
        if (currentDepth >= maxDepth) return;

        const items = fs.readdirSync(dir);
        const dirs = items.filter(item => {
            const itemPath = path.join(dir, item);
            return fs.statSync(itemPath).isDirectory();
        });

        dirs.forEach((item, index) => {
            const isLast = index === dirs.length - 1;
            const itemPath = path.join(dir, item);
            const fileCount = countFiles(itemPath);

            console.log(`${prefix}${isLast ? '└──' : '├──'} ${item}/ (${fileCount} files)`);

            if (currentDepth < maxDepth - 1) {
                printDir(itemPath, prefix + (isLast ? '   ' : '│  '), maxDepth, currentDepth + 1);
            }
        });
    }

    printDir(srcDir);
    console.log('');

    // 3. Size Analysis
    console.log('📏 SIZE ANALYSIS');
    console.log('================');

    const srcSize = getDirSize(srcDir);
    const nodeModulesSize = fs.existsSync('./node_modules') ? getDirSize('./node_modules') : 0;

    console.log(`Source code size: ${formatBytes(srcSize)}`);
    console.log(`Node modules size: ${formatBytes(nodeModulesSize)}`);
    console.log('');

    // 4. Import Analysis
    console.log('📦 IMPORT ANALYSIS');
    console.log('==================');

    const imports = analyzeImports(srcDir);
    const sortedImports = Array.from(imports.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

    console.log('Top 10 most imported modules:');
    sortedImports.forEach(([module, count]) => {
        console.log(`  ${module}: ${count} times`);
    });
    console.log('');

    // 5. Authentication Analysis
    console.log('🔐 AUTHENTICATION ANALYSIS');
    console.log('==========================');

    const authFiles = [
        './src/contexts/AuthContext.js',
        './src/contexts/GoogleSheetsAuthContext.js',
        './src/services/google/googleAuthService.js',
        './src/services/user/userService.js',
        './src/components/auth/Login.js'
    ];

    console.log('Authentication-related files:');
    authFiles.forEach(file => {
        if (fs.existsSync(file)) {
            const size = fs.statSync(file).size;
            const lines = fs.readFileSync(file, 'utf8').split('\n').length;
            console.log(`  ✅ ${file} (${lines} lines, ${formatBytes(size)})`);
        } else {
            console.log(`  ❌ ${file} (not found)`);
        }
    });
    console.log('');

    // 6. Configuration Analysis
    console.log('⚙️  CONFIGURATION ANALYSIS');
    console.log('==========================');

    const configFiles = [
        './package.json',
        './.env',
        './src/config/google.js',
        './backend/config/environment.js'
    ];

    console.log('Configuration files:');
    configFiles.forEach(file => {
        if (fs.existsSync(file)) {
            const size = fs.statSync(file).size;
            console.log(`  ✅ ${file} (${formatBytes(size)})`);
        } else {
            console.log(`  ❌ ${file} (not found)`);
        }
    });
    console.log('');

    // 7. Summary
    console.log('📋 SUMMARY');
    console.log('==========');
    console.log(`Total source files: ${totalFiles}`);
    console.log(`Main languages: JavaScript (${jsFiles}), React (${jsxFiles})`);
    console.log(`Source code size: ${formatBytes(srcSize)}`);
    console.log(`Authentication system: ${authFiles.filter(f => fs.existsSync(f)).length}/${authFiles.length} files present`);
    console.log(`Configuration files: ${configFiles.filter(f => fs.existsSync(f)).length}/${configFiles.length} files present`);

    console.log('');
    console.log('🎉 System analysis completed!');

} catch (error) {
    console.error('❌ Error during analysis:', error.message);
    process.exit(1);
}
