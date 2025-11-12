# 🚀 QUICK DEPLOYMENT GUIDE - MIA LOGISTICS

## TL;DR - Execute Now

### ✅ PREREQUISITE CHECK

```bash
# Check if backend is running
curl http://localhost:5050/api/health

# Check if frontend is running
curl http://localhost:3000

# If not, start them:
cd backend && npm start &
npm start &
```

---

## 📋 7 STEPS TO PRODUCTION

### 1️⃣ SHARE GOOGLE DRIVE (2 phút)

**Link:** <https://drive.google.com/drive/folders/1_Zy9Q31vPEHOSIT077kMolek3F3-yxZE>

**Share với:**

- <mia-vn-google-integration@sinuous-aviary-474820-e3.iam.gserviceaccount.com> ✉️
- <nuq74@sinuous-aviary-474820-e3.iam.gserviceaccount.com> ✉️

**Permission:** Editor

---

### 2️⃣ UPDATE SENDGRID (5 phút)

```bash
# 1. Get new API key from SendGrid
https://app.sendgrid.com → Settings → API Keys → Create

# 2. Update .env
nano .env
# Change: SENDGRID_API_KEY=SG.your_new_key_here

# 3. Test
curl -X POST http://localhost:5050/api/email/test \
  -H "Content-Type: application/json" \
  -d '{"to":"kho.1@mia.vn","subject":"Test","body":"OK"}'
```

---

### 3️⃣ TEST ALL APIs (2 phút)

```bash
# Make sure backend is running on port 5050
./test-all-apis.sh
```

**Expected:** ✅ 15+ endpoints passed

---

### 4️⃣ TEST UI (2 phút)

```bash
# Make sure frontend is running on port 3000
./test-ui-pages.sh
```

**Expected:** ✅ 12 pages OK

**Manual check:**

- Login: <http://localhost:3000/login> (<admin@mia.vn> / password)
- Dashboard works
- Maps loads

---

### 5️⃣ DEPLOY BACKEND (10 phút)

```bash
# Option A: Railway CLI
npm install -g @railway/cli
cd backend
railway login
railway init
railway up

# Option B: Railway Web UI
# 1. Go to https://railway.app
# 2. New Project → Deploy from GitHub
# 3. Select: mia-logistics-manager/backend
# 4. Add env variables from .env
# 5. Deploy

# Get URL: https://mia-logistics-backend.up.railway.app
```

**Test:**

```bash
curl https://mia-logistics-backend.up.railway.app/api/health
```

---

### 6️⃣ DEPLOY FRONTEND (10 phút)

```bash
# 1. Update .env.production
cat > .env.production << EOF
REACT_APP_API_BASE_URL=https://mia-logistics-backend.up.railway.app/api
REACT_APP_USE_MOCK_DATA=true
DISABLE_ESLINT_PLUGIN=true
GENERATE_SOURCEMAP=false
EOF

# 2. Deploy to Vercel
npm install -g vercel
vercel login
vercel --prod

# Get URL: https://mia-logistics.vercel.app
```

**Test:**

- Open: <https://mia-logistics.vercel.app>
- Login: <admin@mia.vn> / password

---

### 7️⃣ UPDATE GOOGLE OAUTH (5 phút)

```bash
# 1. Go to Google Cloud Console
https://console.cloud.google.com

# 2. APIs & Services → Credentials → OAuth 2.0 Client ID

# 3. Add these URLs:
Authorized JavaScript origins:
  - https://mia-logistics.vercel.app
  - https://mia-logistics-backend.up.railway.app

Authorized redirect URIs:
  - https://mia-logistics.vercel.app/auth/callback
  - https://mia-logistics-backend.up.railway.app/auth/callback

# 4. Save
```

---

## ✅ VERIFICATION

### Production URLs

```bash
# Backend
https://mia-logistics-backend.up.railway.app/api/health

# Frontend
https://mia-logistics.vercel.app

# Login credentials
admin@mia.vn / password
```

### Full System Test

```bash
# 1. Backend health
curl https://mia-logistics-backend.up.railway.app/api/health

# 2. Google Sheets status
curl https://mia-logistics-backend.up.railway.app/api/google-sheets-auth/status

# 3. Frontend loads
open https://mia-logistics.vercel.app

# 4. Login works
# Use: admin@mia.vn / password

# 5. Telegram notification
curl -X POST https://mia-logistics-backend.up.railway.app/api/telegram/test \
  -H "Content-Type: application/json" \
  -d '{"message":"Production is live! 🎉"}'
```

---

## 📊 PROGRESS TRACKER

```
✅ = Done
⬜ = Todo
🔄 = In Progress

[ ] 1. Google Drive shared
[ ] 2. SendGrid updated
[ ] 3. APIs tested
[ ] 4. UI tested
[ ] 5. Backend deployed
[ ] 6. Frontend deployed
[ ] 7. OAuth updated

Progress: 0/7 (0%)
```

---

## 🆘 TROUBLESHOOTING

### Backend won't start

```bash
# Check port
lsof -ti:5050 | xargs kill -9

# Check logs
tail -f logs/backend-startup.log

# Restart
cd backend && npm start
```

### Frontend build fails

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Railway deployment failed

```bash
# Check logs in Railway dashboard
# Or use CLI:
railway logs
```

### Vercel deployment failed

```bash
# Check build logs
vercel logs

# Redeploy
vercel --prod --force
```

---

## 📞 NEXT STEPS

After production deployment:

1. **Monitor**: Check Railway + Vercel dashboards
2. **Test**: Full user journey in production
3. **Telegram**: Verify notifications working
4. **Email**: Test SendGrid integration
5. **Performance**: Check Lighthouse score
6. **Security**: Review HTTPS, CORS, CSP

---

## 🎯 TIME ESTIMATE

| Task | Time |
|------|------|
| Google Drive | 2 min |
| SendGrid | 5 min |
| Test APIs | 2 min |
| Test UI | 2 min |
| Deploy Backend | 10 min |
| Deploy Frontend | 10 min |
| OAuth Update | 5 min |
| **TOTAL** | **~36 min** |

---

**Bạn sẵn sàng deploy chưa? Bắt đầu từ bước nào? 🚀**

Commands to run NOW:

```bash
# Test local first
./test-all-apis.sh
./test-ui-pages.sh

# Then deploy!
```
