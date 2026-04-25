# ✅ Frontend Login Issue - FIXED

## Problem
Frontend was getting **415 (Unsupported Media Type)** error when calling `/api/v1/auth/login`

## Root Cause
Backend routes were configured as `/api/auth/login` but frontend was calling `/api/v1/auth/login`

## Solution
Added `/v1` prefix to all API routes while maintaining backward compatibility.

---

## Working Endpoints

### With /v1 prefix (Frontend uses these)
```
POST /api/v1/auth/login
GET  /api/v1/auth/me
POST /api/v1/report
GET  /api/v1/report/my-reports
POST /api/v1/sos
GET  /api/v1/sos/active
GET  /api/v1/admin/overview
GET  /api/v1/admin/inbox
POST /api/v1/admin/inbox/:id/acknowledge
GET  /api/v1/cctv
POST /api/v1/routes
```

### Without /v1 prefix (Backward compatibility)
```
POST /api/auth/login
GET  /api/auth/me
POST /api/report
... (all other endpoints)
```

---

## Test Login

### Using PowerShell
```powershell
$body = @{
  email = 'rajesh.kumar@example.com'
  password = '123456'
} | ConvertTo-Json

Invoke-RestMethod -Uri 'http://localhost:3002/api/v1/auth/login' `
  -Method Post `
  -Body $body `
  -ContentType 'application/json'
```

### Using curl
```bash
curl -X POST http://localhost:3002/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"rajesh.kumar@example.com","password":"123456"}'
```

### Expected Response
```json
{
  "success": true,
  "token": "dummy-jwt-token-citizen-2026",
  "user": {
    "id": "citizen-user-001",
    "email": "rajesh.kumar@example.com",
    "role": "citizen",
    "name": "Rajesh Kumar",
    "phone": "+919876543210"
  }
}
```

---

## Debug Logging

The backend now logs all login requests:
```
📥 Login request: POST /api/v1/auth/login
📋 Content-Type: application/json
📦 Body: { email: '...', password: '...' }
🔐 Citizen login: rajesh.kumar@example.com
```

This helps debug any Content-Type or body parsing issues.

---

## Test Credentials

### Admin
```
Email: admin@suraksha.ai
Password: 123456
```

### Citizens
```
Email: rajesh.kumar@example.com
Password: 123456

Email: rahul.sharma@example.com
Password: 123456

Email: priya.patel@example.com
Password: 123456

Email: amit.kumar@example.com
Password: 123456
```

---

## Frontend Configuration

Make sure your frontend `.env` has:
```env
VITE_API_BASE_URL=http://172.20.11.252:3002
VITE_API_VERSION=v1
```

Or in your axios config:
```javascript
const api = axios.create({
  baseURL: 'http://172.20.11.252:3002/api/v1',
  headers: {
    'Content-Type': 'application/json'
  }
});
```

---

## Changes Made

### File: `src/suraksha-app.ts`

1. **Added /v1 routes** (for frontend compatibility)
```typescript
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/report', reportRoutes);
app.use('/api/v1/sos', sosRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/cctv', cctvRoutes);
app.use('/api/v1/routes', routeRoutes);
```

2. **Kept original routes** (for backward compatibility)
```typescript
app.use('/api/auth', authRoutes);
app.use('/api/report', reportRoutes);
// ... etc
```

3. **Added debug logging** for login requests
```typescript
app.use((req, _res, next) => {
  if (req.path.includes('/auth/login')) {
    console.log(`📥 Login request: ${req.method} ${req.path}`);
    console.log(`📋 Content-Type: ${req.headers['content-type']}`);
    console.log(`📦 Body:`, req.body);
  }
  next();
});
```

---

## ✅ Status

🟢 **Backend Running**: http://172.20.11.252:3002
🟢 **Login Endpoint Working**: `/api/v1/auth/login`
🟢 **All Routes Available**: With and without `/v1` prefix
🟢 **Debug Logging Active**: Shows request details
🟢 **Zero TypeScript Errors**

---

## Next Steps for Frontend

1. Try logging in again - it should work now
2. Check browser console - no more 415 errors
3. If still issues, check Network tab for:
   - Request URL (should be `/api/v1/auth/login`)
   - Content-Type header (should be `application/json`)
   - Request body (should have email and password)

---

## Common Issues

### Issue: Still getting 415 error
**Solution**: Make sure Content-Type header is set to `application/json`

### Issue: CORS error
**Solution**: Backend already has CORS enabled for localhost:3000 and localhost:5173

### Issue: Network error
**Solution**: Check if backend is running on http://172.20.11.252:3002

### Issue: Invalid credentials
**Solution**: Use password `123456` for all test accounts
