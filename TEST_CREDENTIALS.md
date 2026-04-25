# 🔐 Test Credentials - Suraksha.ai Dummy Backend

## ✅ Password Support Added Successfully!

All mock users now have password authentication enabled.

---

## 👤 **Admin Credentials**

```json
{
  "email": "admin@suraksha.ai",
  "password": "123456",
  "role": "admin"
}
```

**Use for:** Admin dashboard, monitoring, SOS resolution

---

## 👥 **Citizen Credentials**

### Citizen 1: Rajesh Kumar (Test User)
```json
{
  "email": "rajesh.kumar@example.com",
  "password": "123456",
  "role": "citizen"
}
```
**Note:** Role is optional, defaults to 'citizen'

### Citizen 2: Rahul Sharma
```json
{
  "email": "rahul.sharma@example.com",
  "password": "123456",
  "role": "citizen"
}
```

### Citizen 3: Priya Patel
```json
{
  "email": "priya.patel@example.com",
  "password": "123456",
  "role": "citizen"
}
```

### Citizen 4: Amit Kumar
```json
{
  "email": "amit.kumar@example.com",
  "password": "123456",
  "role": "citizen"
}
```

**Use for:** Report submission, SOS alerts, viewing reports

---

## 🆕 **New User Registration**

If you try to login with an email that doesn't exist:
- A new citizen account will be created automatically
- The password you provide will be saved
- You can login again with the same credentials

**Example:**
```json
{
  "email": "newuser@example.com",
  "password": "mypassword",
  "role": "citizen"
}
```

---

## 🧪 **Testing Login**

### Using curl:
```bash
curl -X POST http://172.20.11.252:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "rahul.sharma@example.com",
    "password": "123456",
    "role": "citizen"
  }'
```

### Using JavaScript/Fetch:
```javascript
const response = await fetch('http://172.20.11.252:3002/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'rahul.sharma@example.com',
    password: '123456',
    role: 'citizen'
  })
});

const data = await response.json();
console.log(data);
// { success: true, token: "dummy-jwt-token-citizen-2026", user: {...} }
```

---

## ✅ **What Changed**

### 1. User Model (`src/data/models.ts`)
- Added optional `password?: string` field

### 2. Mock Data (`src/services/mockData.service.ts`)
- All mock users now have `password: '123456'`
- New users created with password support

### 3. Auth Controller (`src/controllers/auth.controller.ts`)
- Password validation for existing users
- Password storage for new users
- Returns 401 for invalid credentials

---

## 🔒 **Security Notes**

⚠️ **This is a DUMMY backend for testing only!**

- Passwords are stored in **plain text** (no hashing)
- No encryption or security measures
- **DO NOT use in production**
- **DO NOT use real passwords**

This is intentionally simple for hackathon/demo purposes.

---

## ✅ **Expected Behavior**

### ✅ Valid Login
```json
POST /api/auth/login
{
  "email": "rahul.sharma@example.com",
  "password": "123456",
  "role": "citizen"
}

Response: 200 OK
{
  "success": true,
  "token": "dummy-jwt-token-citizen-2026",
  "user": {
    "id": "...",
    "email": "rahul.sharma@example.com",
    "role": "citizen",
    "name": "Rahul Sharma",
    "phone": "+919876543211"
  }
}
```

### ❌ Invalid Password
```json
POST /api/auth/login
{
  "email": "rahul.sharma@example.com",
  "password": "wrongpassword",
  "role": "citizen"
}

Response: 401 Unauthorized
{
  "success": false,
  "error": "Invalid credentials"
}
```

### ✅ New User Registration
```json
POST /api/auth/login
{
  "email": "newuser@example.com",
  "password": "mypassword",
  "role": "citizen"
}

Response: 200 OK
{
  "success": true,
  "token": "dummy-jwt-token-citizen-2026",
  "user": {
    "id": "...",
    "email": "newuser@example.com",
    "role": "citizen"
  }
}
```

---

## 📊 **Summary**

✅ Password support added  
✅ All existing users have password: `123456`  
✅ New users can register with custom passwords  
✅ Invalid passwords return 401 error  
✅ No breaking changes to existing features  
✅ Minimal code changes (3 files only)  

**Server Status:** 🟢 Running on `http://172.20.11.252:3002`

---

## 🎯 **Ready for Testing!**

All features work with password authentication now. Your frontend can safely use email + password login.
