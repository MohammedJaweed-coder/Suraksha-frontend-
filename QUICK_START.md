# ⚡ Quick Start - Suraksha.ai Backend

## 🌐 Backend URL
```
http://172.20.11.252:3002
```

## 🚀 For Your Friend (Frontend Developer)

### 1️⃣ Set API Base URL in Frontend
```javascript
// .env or config file
API_BASE_URL=http://172.20.11.252:3002/api
```

### 2️⃣ Run Frontend in Antigravity Terminal
```bash
cd /path/to/frontend
npm install
npm run dev
```

### 3️⃣ Test Connection
```bash
curl http://172.20.11.252:3002/api/health
```

## 🔑 Test Credentials

### Admin Login
```json
{
  "email": "admin@suraksha.ai",
  "password": "123456",
  "role": "admin"
}
```

### Citizen Login
```json
{
  "email": "any@email.com",
  "password": "anypassword",
  "role": "citizen"
}
```

## 📡 Key Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login |
| POST | `/api/report` | Submit report |
| GET | `/api/report/my-reports` | Get my reports |
| POST | `/api/sos` | Trigger SOS |
| GET | `/api/admin/overview` | Dashboard stats |
| GET | `/api/cctv` | CCTV feeds |
| POST | `/api/routes` | Calculate routes |

## ✅ All Features Working
- ✅ Authentication (one-time login)
- ✅ Report submission (image/video)
- ✅ AI validation (auto reward/penalty)
- ✅ SOS alerts
- ✅ Admin dashboard
- ✅ CCTV monitoring
- ✅ Route calculation
- ✅ Notifications

## 🎯 Ready for Demo!
