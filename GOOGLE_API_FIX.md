# Google Sheets API Error Fix

## 🐛 Problem

**Error:** `Cannot read properties of undefined (reading 'spreadsheets')`

### Root Cause

Google Sheets API was not initialized because:

1. Invalid/missing Google API credentials in `.env`
   - `REACT_APP_GOOGLE_CLIENT_ID=n` (invalid)
   - `REACT_APP_GOOGLE_API_KEY=your-production-api-key` (placeholder)
2. App was trying to connect to real Google Sheets API without proper credentials
3. Fallback data had wrong user emails (<admin@company.com> instead of <admin@mia.vn>)

### Error Stack Trace

```
TypeError: Cannot read properties of undefined (reading 'spreadsheets')
    at GoogleSheetsService.getData (googleSheetsService.js:266:1)
    at UserService.getUsers (userService.js:75:1)
    at UserService.getUserByEmail (userService.js:139:1)
    at GoogleAuthService.login (googleAuthService.js:100:1)
```

## ✅ Solution

### 1. Enable Mock Mode (.env)

```bash
# Feature Flags - Use Mock Data (no real Google credentials)
REACT_APP_USE_MOCK_DATA=true
REACT_APP_ENABLE_GOOGLE_SHEETS=false
REACT_APP_ENABLE_GOOGLE_DRIVE=false
REACT_APP_ENABLE_GOOGLE_APPS_SCRIPT=false

# Set placeholder credentials
REACT_APP_GOOGLE_CLIENT_ID=mock-client-id
REACT_APP_GOOGLE_API_KEY=mock-api-key
```

### 2. Update Fallback User Data

Fixed user credentials in `googleSheetsService.js`:

**Before:**

```javascript
Users: [
  ['id', 'email', 'fullName', 'role', 'status', ...],
  ['1', 'admin@company.com', 'Admin User', 'admin', 'active', ...],
  ['2', 'manager@company.com', 'Manager User', 'manager', 'active', ...],
]
```

**After:**

```javascript
Users: [
  ['id', 'email', 'fullName', 'role', 'isActive', ...],
  ['1', 'admin@mia.vn', 'MIA Admin', 'admin', 'true', ..., '$2b$10$...'], // admin123
  ['2', 'manager@mia.vn', 'MIA Manager', 'manager', 'true', ..., '$2b$10$...'], // manager123
  ['3', 'user@mia.vn', 'MIA User', 'user', 'true', ..., '$2b$10$...'], // user123
]
```

## 🎯 Test Credentials

### Mock Mode Users (current setup)

| Email | Password | Role |
|-------|----------|------|
| <admin@mia.vn> | admin123 | admin |
| <manager@mia.vn> | manager123 | manager |
| <user@mia.vn> | user123 | user |

## 🚀 How to Run

### Development with Mock Data (No Google API needed)

```bash
# Quick start
./start-mock.sh

# Or manually
npm start
```

Then login with: **<admin@mia.vn>** / **admin123**

### Production with Real Google Sheets

To use real Google Sheets API, you need to:

1. **Get Google Cloud credentials:**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a project
   - Enable Google Sheets API
   - Create API Key and OAuth 2.0 Client ID

2. **Update `.env` file:**

```bash
REACT_APP_GOOGLE_CLIENT_ID=your-real-client-id.apps.googleusercontent.com
REACT_APP_GOOGLE_API_KEY=your-real-api-key
REACT_APP_USE_MOCK_DATA=false
REACT_APP_ENABLE_GOOGLE_SHEETS=true
```

3. **Restart the app**

## 📋 Files Modified

1. **`.env`**
   - Set `REACT_APP_USE_MOCK_DATA=true`
   - Disabled Google Sheets/Drive/Apps Script
   - Set mock credentials

2. **`src/services/google/googleSheetsService.js`**
   - Updated fallback Users data
   - Changed emails to @mia.vn
   - Added real bcrypt password hashes
   - Changed field name: `status` → `isActive`

3. **`start-mock.sh`** (new file)
   - Quick start script for development
   - Shows available test credentials

## 🔍 How Mock Mode Works

When `REACT_APP_USE_MOCK_DATA=true`:

1. GoogleContext checks the environment variable
2. Skips Google API initialization
3. GoogleSheetsService returns fallback data instead of calling API
4. All services work with in-memory data
5. No external API calls or credentials needed

## ⚠️ Current Limitations

### Mock Mode

- ✅ Login works
- ✅ User authentication works
- ✅ All basic CRUD operations work
- ❌ Changes don't persist (in-memory only)
- ❌ No real-time sync with Google Sheets
- ❌ No Google Drive file uploads
- ❌ No Apps Script automation

### Missing Backend

- Password verification happens in frontend (bcryptjs in browser)
- Should move to backend API for production
- No JWT token validation endpoint

## 🎯 Next Steps (Optional)

### For Development

- ✅ Current setup works fine for testing
- Continue development with mock data
- Test all features without Google API costs

### For Production

1. Set up real Google Cloud project
2. Get proper API credentials
3. Update .env with real credentials
4. Test with actual Google Sheets
5. Consider building a proper backend API for authentication

## 📊 Status

✅ **FIXED** - App now works in mock mode
✅ Login functional with <admin@mia.vn>/admin123
✅ No Google API errors
✅ Fallback data properly configured

---

**Quick Test:**

```bash
npm start
# Then login with: admin@mia.vn / admin123
```
