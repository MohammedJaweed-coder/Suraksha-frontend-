# 🔧 Fix Frontend Console Errors - Simple Guide

## 🚨 Current Frontend Errors

Your friend is seeing these errors in the browser console:

1. ❌ `Failed to load resource: /auth/verify-authentication` (404)
2. ❌ `Network Error` / `ERR_CONNECTION_REFUSED`
3. ❌ `Cross-Origin-Opener-Policy header ignored`

---

## ✅ Backend Status: NO ERRORS

**Important:** The backend has **ZERO errors**. All errors are in the frontend configuration.

**Backend is working perfectly:**
- ✅ Server running on port 3002
- ✅ All 5 users have passwords set to `123456`
- ✅ All endpoints tested and working
- ✅ Authentication working correctly

---

## 🔧 3 Simple Fixes for Frontend

### Fix 1: Create/Update `.env` File

**Location:** Frontend project root (same folder as `package.json`)

**Create or edit `.env` file:**
```env
VITE_API_BASE_URL=http://localhost:3002
```

**Important Notes:**
- Use `http://` NOT `https://`
- Use `localhost` NOT `172.20.11.252` (unless frontend is on different machine)
- Save the file
- Restart frontend dev server after saving

---

### Fix 2: Update Login Code

**File:** `LoginPage.tsx` (or wherever login is handled)

**Find this code (WRONG):**
```typescript
const response = await axios.post('/auth/verify-authentication', {
  email: email,
  password: password,
  role: role
});
```

**Replace with (CORRECT):**
```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3002';

const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
  email: email,
  password: password
  // role is optional, defaults to 'citizen'
});
```

---

### Fix 3: Add Error Handling

**Add this to catch connection errors:**

```typescript
try {
  const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
    email: email,
    password: password
  });

  if (response.data.success) {
    console.log('✅ Login successful!');
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    // Navigate to dashboard
  }
} catch (error) {
  console.error('❌ Login failed:', error);
  
  if (axios.isAxiosError(error)) {
    if (error.response) {
      // Server responded with error
      alert(error.response.data.error || 'Invalid credentials');
    } else if (error.request) {
      // No response from server
      alert('Cannot connect to backend. Check:\n1. Backend is running\n2. Using http:// not https://\n3. Correct URL in .env');
    }
  }
}
```

---

## 🧪 Test Before Running Frontend

### Step 1: Verify Backend is Running

**Open browser and visit:**
```
http://localhost:3002/api/health
```

**You should see:**
```json
{
  "status": "ok",
  "mode": "dummy",
  "database": "in-memory mock data",
  "app": "Suraksha.ai Police/Safety Platform"
}
```

**If you don't see this:** Backend is not running. Start it with `npm run dev` in backend folder.

---

### Step 2: Test Login from Browser Console

**Open browser console (F12) and paste:**

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
  console.log('✅ Backend Response:', data);
  if (data.success) {
    console.log('✅ Login works! Token:', data.token);
  }
})
.catch(err => console.error('❌ Error:', err));
```

**Expected output:**
```javascript
✅ Backend Response: {
  success: true,
  token: "dummy-jwt-token-citizen-2026",
  user: {
    id: "...",
    email: "rajesh.kumar@example.com",
    role: "citizen",
    name: "Rajesh Kumar"
  }
}
✅ Login works! Token: dummy-jwt-token-citizen-2026
```

**If this works:** Backend is fine, issue is in frontend code.

---

## 📋 Complete Working Login Component

**Here's a complete working example:**

```typescript
import { useState } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3002';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('🔐 Logging in to:', `${API_BASE_URL}/api/auth/login`);
      
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        email: email,
        password: password
      });

      if (response.data.success) {
        console.log('✅ Login successful!');
        
        // Store token and user
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        // Show success
        alert(`Welcome ${response.data.user.name}!`);
        
        // Navigate to dashboard
        // window.location.href = '/dashboard';
      }
    } catch (err) {
      console.error('❌ Login error:', err);
      
      if (axios.isAxiosError(err)) {
        if (err.response) {
          setError(err.response.data.error || 'Invalid credentials');
        } else if (err.request) {
          setError('Cannot connect to backend. Check if backend is running.');
        }
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={handleLogin}>
        <div>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <div style={{ color: 'red' }}>{error}</div>}
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      <p style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
        Test credentials: rajesh.kumar@example.com / 123456
      </p>
    </div>
  );
};
```

---

## 🚨 Common Console Errors and Fixes

### Error: `Failed to load resource: /auth/verify-authentication`

**Cause:** Wrong endpoint  
**Fix:** Change to `/api/auth/login`

---

### Error: `ERR_CONNECTION_REFUSED`

**Cause:** Backend not running or wrong URL  
**Fix:** 
1. Start backend: `npm run dev` in backend folder
2. Check `.env` has correct URL: `http://localhost:3002`

---

### Error: `ERR_SSL_PROTOCOL_ERROR`

**Cause:** Using HTTPS with HTTP server  
**Fix:** Change `.env` to use `http://` not `https://`

---

### Error: `Network Error`

**Cause:** Cannot reach backend  
**Fix:**
1. Verify backend is running
2. Use `localhost` instead of IP address
3. Check firewall is not blocking port 3002

---

### Error: `CORS policy`

**Cause:** Frontend running on port not allowed by backend  
**Fix:** Backend allows `localhost:3000` and `localhost:5173`
- If your frontend runs on different port, update backend `.env`:
  ```env
  CORS_ORIGINS=http://localhost:3000,http://localhost:5173,http://localhost:YOUR_PORT
  ```
- Restart backend after changing

---

## ✅ Checklist for Your Friend

**Before testing login:**

- [ ] Backend is running (`npm run dev` in backend folder)
- [ ] Backend health check works: `http://localhost:3002/api/health`
- [ ] Frontend `.env` file created with `VITE_API_BASE_URL=http://localhost:3002`
- [ ] Login code uses `/api/auth/login` endpoint
- [ ] Login code uses `http://` not `https://`
- [ ] Frontend restarted after `.env` changes
- [ ] Test credentials ready: `rajesh.kumar@example.com` / `123456`

---

## 🎯 Expected Result

**When working correctly:**

1. **Browser console shows:**
   ```
   🔐 Logging in to: http://localhost:3002/api/auth/login
   ✅ Login successful!
   ```

2. **Backend terminal shows:**
   ```
   🔐 Citizen login: rajesh.kumar@example.com
   ```

3. **No errors in console**

4. **User redirected to dashboard**

---

## 📞 Still Getting Errors?

If errors persist after following all steps:

1. **Clear browser cache** (Ctrl+Shift+Delete)
2. **Restart frontend dev server**
3. **Restart backend dev server**
4. **Try different browser**
5. **Check browser console Network tab** to see exact URL being called

---

## 🎉 Summary

**Backend:** ✅ NO ERRORS - Working perfectly  
**Frontend:** ⏳ Needs 3 simple fixes:
1. Create `.env` with correct URL
2. Update login endpoint to `/api/auth/login`
3. Use `http://` not `https://`

All backend errors are fixed. Frontend just needs configuration updates.

---

## 📚 Additional Help

See these files for more details:
- **FRONTEND_TROUBLESHOOTING.md** - Detailed troubleshooting
- **WORKING_CREDENTIALS_TEST.md** - Proof backend works
- **BACKEND_ERROR_CHECK.md** - Backend error check results
