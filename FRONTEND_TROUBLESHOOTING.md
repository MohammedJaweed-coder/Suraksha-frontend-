# 🔧 Frontend Login Troubleshooting Guide

## ✅ Backend Status: WORKING

**All passwords are set to:** `123456`

**Tested and confirmed working:**
- ✅ Admin: `admin@suraksha.ai` / `123456`
- ✅ Citizen: `rajesh.kumar@example.com` / `123456`
- ✅ Citizen: `rahul.sharma@example.com` / `123456`
- ✅ Citizen: `priya.patel@example.com` / `123456`
- ✅ Citizen: `amit.kumar@example.com` / `123456`

---

## 🚨 Frontend Issue: Cannot Access Login

### Root Cause Analysis

The frontend is failing because:

1. **Wrong Endpoint:** Frontend calling `/auth/verify-authentication` instead of `/api/auth/login`
2. **Wrong Protocol:** Using HTTPS instead of HTTP
3. **Network Issue:** May not be able to reach `172.20.11.252` due to firewall/network

---

## 🔧 Solution: 3 Steps to Fix

### Step 1: Update `.env` File in Frontend Project

**Location:** Frontend project root (where `package.json` is)

**Create or update `.env` file:**

```env
# Use localhost (recommended for same machine)
VITE_API_BASE_URL=http://localhost:3002

# OR use network IP (if frontend is on different machine)
# VITE_API_BASE_URL=http://172.20.11.252:3002
```

**Important:** Use `http://` NOT `https://`

---

### Step 2: Fix Login Code in `LoginPage.tsx`

**Find this code (WRONG):**
```typescript
const response = await axios.post('/auth/verify-authentication', {
  email: email,
  password: password,
  role: role  // ❌ This endpoint doesn't exist
});
```

**Replace with (CORRECT):**
```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3002';

const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
  email: email,
  password: password
  // role is optional - defaults to 'citizen'
});
```

---

### Step 3: Complete Working Login Implementation

**Full working code for `LoginPage.tsx`:**

```typescript
import axios from 'axios';
import { useState } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3002';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('🔐 Attempting login to:', `${API_BASE_URL}/api/auth/login`);
      
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        email: email,
        password: password
      });

      if (response.data.success) {
        console.log('✅ Login successful!');
        
        // Store token
        localStorage.setItem('token', response.data.token);
        
        // Store user data
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        // Show success
        alert(`Welcome ${response.data.user.name}!`);
        
        // Navigate to dashboard
        // window.location.href = '/dashboard';
      }
    } catch (error) {
      console.error('❌ Login failed:', error);
      
      if (axios.isAxiosError(error)) {
        if (error.response) {
          // Server responded with error
          alert(error.response.data.error || 'Invalid credentials');
        } else if (error.request) {
          // No response from server
          alert('Cannot connect to backend. Please check:\n1. Backend is running\n2. API URL is correct\n3. Using HTTP not HTTPS');
        }
      } else {
        alert('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
      
      {/* Test credentials hint */}
      <p style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
        Test: rajesh.kumar@example.com / 123456
      </p>
    </form>
  );
};
```

---

## 🧪 Test Backend First (Before Running Frontend)

### Test 1: Health Check

**Open browser and visit:**
```
http://localhost:3002/api/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "mode": "dummy",
  "database": "in-memory mock data",
  "app": "Suraksha.ai Police/Safety Platform"
}
```

**If this fails:** Backend is not running or wrong port.

---

### Test 2: Test Login from Browser Console

**Open browser console (F12) and run:**

```javascript
fetch('http://localhost:3002/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'rajesh.kumar@example.com',
    password: '123456'
  })
})
.then(r => r.json())
.then(data => {
  console.log('✅ Login Response:', data);
  if (data.success) {
    console.log('✅ Token:', data.token);
    console.log('✅ User:', data.user);
  }
})
.catch(err => console.error('❌ Error:', err));
```

**Expected Response:**
```json
{
  "success": true,
  "token": "dummy-jwt-token-citizen-2026",
  "user": {
    "id": "491cd006-44c0-4327-8258-65b4749f956f",
    "email": "rajesh.kumar@example.com",
    "role": "citizen",
    "name": "Rajesh Kumar",
    "phone": "+919876543210"
  }
}
```

**If this works:** Backend is fine, issue is in frontend code.

---

## 🚨 Common Errors and Solutions

### Error 1: `ERR_CONNECTION_REFUSED`

**Cause:** Backend not running or wrong URL

**Solution:**
1. Check backend is running: `npm run dev` in backend folder
2. Verify port 3002 is correct
3. Use `localhost` instead of `172.20.11.252`

---

### Error 2: `Failed to load resource: /auth/verify-authentication`

**Cause:** Wrong endpoint in frontend code

**Solution:** Change to `/api/auth/login` (see Step 2 above)

---

### Error 3: `ERR_SSL_PROTOCOL_ERROR`

**Cause:** Using HTTPS with HTTP server

**Solution:** Change `.env` to use `http://` not `https://`

---

### Error 4: `Invalid credentials`

**Cause:** Wrong password or email

**Solution:** Use these test credentials:
- Email: `rajesh.kumar@example.com`
- Password: `123456`

---

### Error 5: CORS Error

**Cause:** Frontend running on port not allowed by backend

**Solution:** Backend allows `localhost:3000` and `localhost:5173`
- If your frontend runs on different port, update backend `.env`:
  ```env
  CORS_ORIGINS=http://localhost:3000,http://localhost:5173,http://localhost:YOUR_PORT
  ```
- Restart backend after changing `.env`

---

## 📋 Checklist Before Testing

- [ ] Backend is running (`npm run dev` in backend folder)
- [ ] Backend health check works: `http://localhost:3002/api/health`
- [ ] Frontend `.env` has `VITE_API_BASE_URL=http://localhost:3002`
- [ ] Login code uses `/api/auth/login` endpoint
- [ ] Login code uses `http://` not `https://`
- [ ] Test credentials: `rajesh.kumar@example.com` / `123456`
- [ ] Frontend restarted after `.env` changes

---

## 🎯 Quick Test Commands

### Backend Test (PowerShell)
```powershell
# Test health
Invoke-RestMethod http://localhost:3002/api/health

# Test login
Invoke-RestMethod -Uri "http://localhost:3002/api/auth/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"email":"rajesh.kumar@example.com","password":"123456"}'
```

### Frontend Test (Browser Console)
```javascript
// Test from browser console
fetch('http://localhost:3002/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'rajesh.kumar@example.com',
    password: '123456'
  })
})
.then(r => r.json())
.then(console.log);
```

---

## ✅ Expected Working Flow

1. User enters: `rajesh.kumar@example.com` / `123456`
2. Frontend sends POST to: `http://localhost:3002/api/auth/login`
3. Backend validates password
4. Backend returns: `{ success: true, token: "...", user: {...} }`
5. Frontend stores token in localStorage
6. Frontend redirects to dashboard

---

## 📞 Still Not Working?

If you've followed all steps and it's still not working:

1. **Check backend logs:** Look at the terminal where backend is running
2. **Check browser console:** Look for exact error message
3. **Check network tab:** See what URL is actually being called
4. **Verify .env is loaded:** Add `console.log(import.meta.env.VITE_API_BASE_URL)` in frontend
5. **Try different browser:** Sometimes cache causes issues

---

## 🎉 Success Indicators

When working correctly, you should see:

**Backend logs:**
```
🔐 Citizen login: rajesh.kumar@example.com
```

**Frontend console:**
```
✅ Login successful!
✅ Token: dummy-jwt-token-citizen-2026
✅ User: { name: "Rajesh Kumar", role: "citizen", ... }
```

**Browser:**
- No errors in console
- Token stored in localStorage
- User redirected to dashboard
