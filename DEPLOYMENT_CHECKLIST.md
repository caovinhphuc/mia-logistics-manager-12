# 🚀 MIA LOGISTICS - DEPLOYMENT CHECKLIST

## Priority 1: Production Ready

### ✅ BƯỚC 1: Google Drive Folder Sharing

**Folder ID:** `1_Zy9Q31vPEHOSIT077kMolek3F3-yxZE`

**Link:** <https://drive.google.com/drive/folders/1_Zy9Q31vPEHOSIT077kMolek3F3-yxZE>

**Service Accounts cần share:**

```
1. mia-vn-google-integration@sinuous-aviary-474820-e3.iam.gserviceaccount.com
2. nuq74@sinuous-aviary-474820-e3.iam.gserviceaccount.com
```

**Hướng dẫn:**

1. ✅ Mở link Google Drive folder
2. ✅ Click "Share" button (góc trên bên phải)
3. ✅ Add email: `mia-vn-google-integration@sinuous-aviary-474820-e3.iam.gserviceaccount.com`
4. ✅ Set permission: **Editor**
5. ✅ Bỏ tick "Notify people" (không cần email notification)
6. ✅ Click "Share"
7. ✅ Repeat cho email thứ 2: `nuq74@sinuous-aviary-474820-e3.iam.gserviceaccount.com`

**Test sau khi share:**

```bash
cd backend
npm start
# Test Drive API
curl http://localhost:5050/api/drive/test
```

**Status:** ⬜ TODO

---

### ✅ BƯỚC 2: Update SendGrid API Key

**Current (Invalid):**

```
SENDGRID_API_KEY=6TJF5SH4EEAD5RTTWF4RUUUS
```

**Cách lấy SendGrid API Key mới:**

1. ✅ Truy cập: <https://app.sendgrid.com>
2. ✅ Login hoặc Sign up (nếu chưa có account)
3. ✅ Settings > API Keys
4. ✅ Create API Key
   - Name: `MIA-Logistics-Production`
   - Permission: **Full Access**
5. ✅ Copy API key (bắt đầu với `SG.`)
6. ✅ Update vào file `.env`:

```bash
# File: .env
SENDGRID_API_KEY=SG.your_new_api_key_here
EMAIL_FROM=kho.1@mia.vn
```

7. ✅ Verify email sender trong SendGrid (<kho.1@mia.vn>)

**Test sau khi update:**

```bash
# Backend phải đang chạy
curl -X POST http://localhost:5050/api/email/test \
  -H "Content-Type: application/json" \
  -d '{
    "to": "kho.1@mia.vn",
    "subject": "Test Email from MIA Logistics",
    "body": "Email service working!"
  }'
```

**Status:** ⬜ TODO

---

### ✅ BƯỚC 3: Test API Endpoints (50+)

**Script tự động test:**

```bash
# Tạo test script
cat > test-all-apis.sh << 'EOF'
#!/bin/bash

echo "🧪 Testing MIA Logistics API Endpoints"
echo "======================================"

BASE_URL="http://localhost:5050"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
PASSED=0
FAILED=0

# Test function
test_endpoint() {
    local method=$1
    local endpoint=$2
    local description=$3
    local data=$4

    echo -n "Testing: $description ... "

    if [ "$method" = "GET" ]; then
        response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$endpoint")
    else
        response=$(curl -s -o /dev/null -w "%{http_code}" -X $method "$BASE_URL$endpoint" \
            -H "Content-Type: application/json" \
            -d "$data")
    fi

    if [ $response -eq 200 ] || [ $response -eq 201 ]; then
        echo -e "${GREEN}✅ PASS${NC} ($response)"
        ((PASSED++))
    else
        echo -e "${RED}❌ FAIL${NC} ($response)"
        ((FAILED++))
    fi
}

echo ""
echo "1️⃣  HEALTH & STATUS"
test_endpoint "GET" "/api/health" "Health Check"
test_endpoint "GET" "/api/google-sheets-auth/status" "Google Sheets Status"

echo ""
echo "2️⃣  AUTHENTICATION (9 endpoints)"
test_endpoint "POST" "/api/auth/login" "Login" '{"email":"admin@mia.vn","password":"password"}'
test_endpoint "GET" "/api/auth/me" "Get Current User"
test_endpoint "GET" "/api/auth/users" "Get All Users"

echo ""
echo "3️⃣  CARRIERS"
test_endpoint "GET" "/api/carriers" "Get All Carriers"

echo ""
echo "4️⃣  TRANSFERS"
test_endpoint "GET" "/api/transfers" "Get All Transfers"

echo ""
echo "5️⃣  LOCATIONS"
test_endpoint "GET" "/api/locations" "Get All Locations"

echo ""
echo "6️⃣  TRANSPORT REQUESTS"
test_endpoint "GET" "/api/transport-requests" "Get Transport Requests"

echo ""
echo "7️⃣  INBOUND DOMESTIC"
test_endpoint "GET" "/api/inbound/domestic" "Get Inbound Domestic"

echo ""
echo "8️⃣  INBOUND INTERNATIONAL"
test_endpoint "GET" "/api/inbound/international" "Get Inbound International"

echo ""
echo "9️⃣  ROLES"
test_endpoint "GET" "/api/roles" "Get All Roles"

echo ""
echo "🔟 EMPLOYEES"
test_endpoint "GET" "/api/employees" "Get All Employees"

echo ""
echo "1️⃣1️⃣ ROLE PERMISSIONS"
test_endpoint "GET" "/api/role-permissions" "Get Role Permissions"

echo ""
echo "1️⃣2️⃣ SETTINGS"
test_endpoint "GET" "/api/settings/volume-rules" "Get Volume Rules"

echo ""
echo "1️⃣3️⃣ GOOGLE SHEETS"
test_endpoint "GET" "/api/sheets/info" "Get Sheets Info"

echo ""
echo "1️⃣4️⃣ ADMIN"
test_endpoint "GET" "/api/admin/stats" "Get System Stats"
test_endpoint "GET" "/api/admin/sheets" "Get All Sheets"

echo ""
echo "1️⃣5️⃣ TELEGRAM"
test_endpoint "POST" "/api/telegram/test" "Test Telegram" '{"message":"Test from API"}'

echo ""
echo "======================================"
echo -e "📊 SUMMARY:"
echo -e "   ${GREEN}Passed: $PASSED${NC}"
echo -e "   ${RED}Failed: $FAILED${NC}"
echo -e "   Total: $((PASSED + FAILED))"
echo "======================================"

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}⚠️  Some tests failed!${NC}"
    exit 1
fi
EOF

chmod +x test-all-apis.sh
```

**Chạy test:**

```bash
# Make sure backend is running
cd backend && npm start

# In another terminal
./test-all-apis.sh
```

**Status:** ⬜ TODO

---

### ✅ BƯỚC 4: Test UI Pages

**Manual Testing Checklist:**

```bash
# Start frontend
npm start
# Browser: http://localhost:3000
```

**Pages to test:**

- [ ] **Login Page** (`/login`)
  - [ ] Login with <admin@mia.vn> / password
  - [ ] Error handling for wrong password
  - [ ] Remember me checkbox

- [ ] **Dashboard** (`/`)
  - [ ] Load statistics
  - [ ] Charts rendering
  - [ ] Real-time data

- [ ] **Maps** (`/maps`)
  - [ ] Google Maps loads
  - [ ] Markers display
  - [ ] Route calculation

- [ ] **Transport**
  - [ ] Locations Saved (`/transport/locations-saved`)
  - [ ] Transport Requests
  - [ ] Pending Transfers

- [ ] **Inbound**
  - [ ] Domestic (`/inbound/domestic`)
  - [ ] International (`/inbound/international`)
  - [ ] Calendar view

- [ ] **Carriers** (`/carriers`)
  - [ ] List view
  - [ ] Add new carrier
  - [ ] Edit carrier

- [ ] **Employees** (`/employees`)
  - [ ] Grid view
  - [ ] Table view
  - [ ] CRUD operations

- [ ] **Settings**
  - [ ] Roles (`/settings/roles`)
  - [ ] Permissions (`/settings/permissions`)
  - [ ] Users (`/settings/users`)

- [ ] **Reports** (`/reports`)
  - [ ] Generate reports
  - [ ] Export functionality

**Automated UI Test Script:**

```bash
cat > test-ui-pages.sh << 'EOF'
#!/bin/bash

echo "🖥️  Testing UI Pages"
echo "==================="

BASE_URL="http://localhost:3000"

pages=(
    "/ Dashboard"
    "/login Login"
    "/maps Maps"
    "/transport/locations-saved Locations"
    "/inbound/domestic Inbound-Domestic"
    "/inbound/international Inbound-International"
    "/carriers Carriers"
    "/employees Employees"
    "/settings/roles Roles"
    "/settings/permissions Permissions"
    "/settings/users Users"
    "/reports Reports"
)

for page in "${pages[@]}"; do
    IFS=' ' read -r -a array <<< "$page"
    path="${array[0]}"
    name="${array[1]}"

    echo -n "Testing $name ... "
    response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$path")

    if [ $response -eq 200 ]; then
        echo "✅ OK"
    else
        echo "❌ FAIL ($response)"
    fi
done

echo "==================="
echo "✅ UI Test Complete"
EOF

chmod +x test-ui-pages.sh
./test-ui-pages.sh
```

**Status:** ⬜ TODO

---

### ✅ BƯỚC 5: Deploy Backend to Railway

**Prerequisites:**

- Git repository pushed to GitHub
- Railway account (free tier OK)

**Step-by-step:**

```bash
# 1. Prepare backend for deployment
cd backend

# 2. Create railway.json config
cat > railway.json << 'EOF'
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "node server.cjs",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
EOF

# 3. Create .railwayignore
cat > .railwayignore << 'EOF'
node_modules/
logs/
*.log
.env.local
.env.development
EOF

# 4. Install Railway CLI
npm install -g @railway/cli

# 5. Login to Railway
railway login

# 6. Initialize project
railway init

# 7. Deploy
railway up

# 8. Add environment variables
railway variables set PORT=5050
railway variables set NODE_ENV=production
railway variables set GOOGLE_SPREADSHEET_ID=18B1PIhCDmBWyHZytvOcfj_1QbYBwczLf1x1Qbu0E5As
railway variables set TELEGRAM_BOT_TOKEN=8434038911:AAEsXilwvPkpCNxt0pAZybgXag7xJnNpmN0
railway variables set TELEGRAM_CHAT_ID=-4818209867
railway variables set SENDGRID_API_KEY=<YOUR_NEW_KEY>
railway variables set EMAIL_FROM=kho.1@mia.vn

# 9. Get deployment URL
railway domain

# Output: https://mia-logistics-backend.up.railway.app
```

**Alternative: Railway Web UI**

1. ✅ Go to <https://railway.app>
2. ✅ Login with GitHub
3. ✅ New Project → Deploy from GitHub repo
4. ✅ Select: `mia-logistics-manager`
5. ✅ Root Directory: `backend`
6. ✅ Add Environment Variables (from .env)
7. ✅ Deploy
8. ✅ Generate Domain

**Test deployment:**

```bash
# Replace with your Railway URL
RAILWAY_URL="https://mia-logistics-backend.up.railway.app"

curl $RAILWAY_URL/api/health
curl $RAILWAY_URL/api/google-sheets-auth/status
```

**Status:** ⬜ TODO

---

### ✅ BƯỚC 6: Deploy Frontend to Vercel

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Login to Vercel
vercel login

# 3. Create production .env file
cat > .env.production << 'EOF'
# Replace with your Railway backend URL
REACT_APP_API_BASE_URL=https://mia-logistics-backend.up.railway.app/api

# Google Configuration (same as .env)
REACT_APP_GOOGLE_CLIENT_ID=mock-client-id
REACT_APP_GOOGLE_API_KEY=mock-api-key
REACT_APP_GOOGLE_SPREADSHEET_ID=18B1PIhCDmBWyHZytvOcfj_1QbYBwczLf1x1Qbu0E5As

# Feature Flags
REACT_APP_USE_MOCK_DATA=true
REACT_APP_ENABLE_GOOGLE_SHEETS=false
REACT_APP_ENABLE_GOOGLE_DRIVE=false

# Build
DISABLE_ESLINT_PLUGIN=true
GENERATE_SOURCEMAP=false
EOF

# 4. Build test
npm run build

# 5. Deploy to Vercel
vercel --prod

# Follow prompts:
# - Project name: mia-logistics-manager
# - Framework: Create React App
# - Root: ./
# - Build command: npm run build
# - Output directory: build

# 6. Get deployment URL
# Output: https://mia-logistics.vercel.app
```

**Add Environment Variables in Vercel Dashboard:**

1. ✅ Go to <https://vercel.com/dashboard>
2. ✅ Select project: `mia-logistics-manager`
3. ✅ Settings → Environment Variables
4. ✅ Add all variables from `.env.production`
5. ✅ Redeploy

**Test production:**

```bash
# Open in browser
https://mia-logistics.vercel.app

# Test login
# Email: admin@mia.vn
# Password: password
```

**Status:** ⬜ TODO

---

### ✅ BƯỚC 7: Update OAuth Redirect URIs

```bash
# 1. Go to Google Cloud Console
https://console.cloud.google.com

# 2. Select project: "MIA Logistics Manager"

# 3. APIs & Services → Credentials

# 4. Click on OAuth 2.0 Client ID

# 5. Add Authorized JavaScript origins:
- http://localhost:3000
- https://mia-logistics.vercel.app
- https://mia-logistics-backend.up.railway.app

# 6. Add Authorized redirect URIs:
- http://localhost:3000/auth/callback
- https://mia-logistics.vercel.app/auth/callback
- https://mia-logistics-backend.up.railway.app/auth/callback

# 7. Save
```

**Status:** ⬜ TODO

---

## 📊 PROGRESS TRACKER

```
Priority 1 Checklist:
[ ] 1. Share Google Drive folder
[ ] 2. Update SendGrid API key
[ ] 3. Test API endpoints (50+)
[ ] 4. Test UI pages
[ ] 5. Deploy Backend to Railway
[ ] 6. Deploy Frontend to Vercel
[ ] 7. Update OAuth redirect URIs

Progress: 0/7 (0%)
```

---

## 🚀 QUICK START COMMANDS

```bash
# Test everything locally first
./start-project.sh

# Test APIs
./test-all-apis.sh

# Test UI
./test-ui-pages.sh

# Deploy backend
cd backend && railway up

# Deploy frontend
vercel --prod
```

---

## 📞 SUPPORT

Need help? Check logs:

```bash
# Backend logs
tail -f logs/backend-startup.log

# Frontend logs
npm start
```
