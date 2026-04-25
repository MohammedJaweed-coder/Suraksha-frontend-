# 🔧 Frontend Configuration Fix Guide

## 🚨 **Issues Detected:**

1. ❌ Frontend trying to connect to `/auth/verify-authentication` (wrong endpoint)
2. ❌ Network error - API base URL likely incorrect
3. ❌ Using HTTPS with IP address (should use HTTP)

---

## ✅ **Solution: Update Frontend Configuration**

### **Step 1: Fix API Base URL**

Your frontend is trying to use HTTPS with an IP address. Update your API configuration:

**File:** `.env` or `.env.local` (in your frontend project)

```env
# ❌ WRONG - Don't use HTTPS with IP
VITE_API_BASE_URL=https://172.20.11.252:3002

# ✅ CORRECT - Use HTTP with IP
VITE_API_BASE_URL=http://172.20.11.252:3002
```

**OR use localhost:**
```env
VITE_API_BASE_URL=http://localhost:3002
```

---

### **Step 2: Fix Login Endpoint**

Your frontend is calling the wrong endpoint. Update your login code:

**File:** `LoginPage.tsx` (or wherever you handle login)

**❌ WRONG:**
```typescript
// Don't use this endpoint
const response = await axios.post('/auth/verify-authentication', {...});
```

**✅ CORRECT:**
```typescript
// Use this endpoint instead
const response = await axios.post('/auth/login', {
  email: email,
  password: password
  // role is optional, defaults to 'citizen'
});
```

---

### **Step 3: Complete Login Implementation**

Here's the correct login implementation:

```typescript
// LoginPage.tsx
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3002';

const onSubmit = async (values: { email: string; password: string }) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
      email: values.email,
      password: values.password
      // role is optional - defaults to 'citizen'
    });

    if (response.data.success) {
      // Store token
      localStorage.setItem('token', response.data.token);
      
      // Store user data
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Navigate to dashboard
      console.log('Login successful:', response.data.user);
      // navigate('/dashboard');
    }
  } catch (error) {
    console.error('Login Error:', error);
    
    if (axios.isAxiosError(error)) {
      if (error.response) {
        // Server responded with error
        alert(error.response.data.error || 'Login failed');
      } else if (error.request) {
        // No response from server
        alert('Cannot connect to server. Please check if backend is running.');
      }
    }
  }
};
```

---

### **Step 4: Configure Axios Base URL**

Create an axios instance with the correct base URL:

**File:** `src/api/axios.ts` (create if doesn't exist)

```typescript
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3002';

const axiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosInstance;
```

**Then use it in your components:**
```typescript
import axiosInstance from './api/axios';

// Login
const response = await axiosInstance.post('/auth/login', {
  email: 'rajesh.kumar@example.com',
  password: '123456'
});
```

---

## 🧪 **Test Your Configuration**

### **Test 1: Check Backend is Running**

Open browser and visit:
```
http://172.20.11.252:3002/api/health
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

### **Test 2: Test Login Endpoint**

Use browser console or Postman:
```javascript
fetch('http://172.20.11.252:3002/api/auth/login', {
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

**Expected Response:**
```json
{
  "success": true,
  "token": "dummy-jwt-token-citizen-2026",
  "user": {
    "id": "...",
    "email": "rajesh.kumar@example.com",
    "role": "citizen",
    "name": "Rajesh Kumar"
  }
}
```

---

## 🔧 **Quick Fix Checklist**

- [ ] Update `.env` to use `http://` not `https://`
- [ ] Change endpoint from `/auth/verify-authentication` to `/auth/login`
- [ ] Update request payload to `{ email, password }`
- [ ] Remove `role` field (it's optional)
- [ ] Test backend health endpoint first
- [ ] Test login with correct credentials

---

## 📋 **Correct API Endpoints**

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/auth/login` | POST | Login with email + password |
| `/api/auth/me` | GET | Get current user info |
| `/api/report` | POST | Submit report |
| `/api/sos` | POST | Trigger SOS alert |
| `/api/admin/overview` | GET | Dashboard stats |

---

## 🚨 **Common Mistakes to Avoid**

1. ❌ Using HTTPS with IP address (use HTTP)
2. ❌ Wrong endpoint `/auth/verify-authentication` (use `/auth/login`)
3. ❌ Missing `/api` prefix in URL
4. ❌ Sending `role` as required field (it's optional)
5. ❌ Not checking if backend is running first

---

## 🎯 **Expected Working Configuration**

**Backend:** `http://172.20.11.252:3002` ✅ Running  
**Frontend API URL:** `http://172.20.11.252:3002/api`  
**Login Endpoint:** `POST /api/auth/login`  
**Payload:** `{ email, password }`  
**Test User:** `rajesh.kumar@example.com` / `123456`

---

## 🔍 **Debugging Steps**

If still not working:

1. **Check backend is running:**
   ```bash
   curl http://172.20.11.252:3002/api/health
   ```

2. **Check CORS is allowing your frontend:**
   - Backend allows: `http://localhost:3000`, `http://localhost:5173`
   - If your frontend runs on different port, update `.env` file

3. **Check browser console for exact error:**
   - Network tab shows the actual request URL
   - Console shows the error message

4. **Test with curl first:**
   ```bash
   curl -X POST http://172.20.11.252:3002/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"rajesh.kumar@example.com","password":"123456"}'
   ```

---

## ✅ **After Fixing**

Your login should work with:
- Email: `rajesh.kumar@example.com`
- Password: `123456`
- No role needed (defaults to citizen)

**Success Response:**
```json
{
  "success": true,
  "token": "dummy-jwt-token-citizen-2026",
  "user": { ... }
}
```
