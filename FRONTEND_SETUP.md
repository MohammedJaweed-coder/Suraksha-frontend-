# 🚀 Suraksha.ai Frontend Setup Guide

## For Your Friend Running Frontend in Antigravity Terminal

### ✅ Backend Status
**Backend is LIVE and accessible at:**
- 🌐 Network URL: `http://172.20.11.252:3002`
- 📊 Health Check: `http://172.20.11.252:3002/api/health`

---

## 📋 Prerequisites
1. Make sure you're on the **same network** as the backend server
2. Have **Antigravity terminal** installed
3. Have your **frontend project** ready

---

## 🔧 Frontend Configuration

### Step 1: Update API Base URL
In your frontend project, update the API base URL to point to the backend:

**For React/Vite projects:**
```javascript
// .env or .env.local
VITE_API_BASE_URL=http://172.20.11.252:3002/api
```

**For Next.js projects:**
```javascript
// .env.local
NEXT_PUBLIC_API_BASE_URL=http://172.20.11.252:3002/api
```

**For plain JavaScript:**
```javascript
const API_BASE_URL = 'http://172.20.11.252:3002/api';
```

---

## 🚀 Running Frontend in Antigravity Terminal

### Option 1: Vite/React Project
```bash
# Navigate to frontend directory
cd /path/to/frontend

# Install dependencies (if not already done)
npm install

# Run development server
npm run dev
```

### Option 2: Next.js Project
```bash
# Navigate to frontend directory
cd /path/to/frontend

# Install dependencies (if not already done)
npm install

# Run development server
npm run dev
```

### Option 3: Create React App
```bash
# Navigate to frontend directory
cd /path/to/frontend

# Install dependencies (if not already done)
npm install

# Run development server
npm start
```

---

## 🧪 Test Backend Connection

Before running the frontend, test if the backend is accessible:

```bash
# Test health endpoint
curl http://172.20.11.252:3002/api/health

# Or open in browser
# http://172.20.11.252:3002/api/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "mode": "dummy",
  "database": "in-memory mock data",
  "app": "Suraksha.ai Police/Safety Platform",
  "version": "1.0.0",
  "timestamp": "2026-04-25T...",
  "environment": "development"
}
```

---

## 📡 Available API Endpoints

### Authentication
- `POST /api/auth/login` - Login (admin: admin@suraksha.ai/123456, citizen: any credentials)
- `GET /api/auth/me` - Get current user info

### Reports
- `POST /api/report` - Submit new report
- `GET /api/report/my-reports?userId={userId}` - Get user's reports
- `GET /api/report/{id}?userId={userId}` - Get specific report

### SOS
- `POST /api/sos` - Trigger SOS alert
- `GET /api/sos/active` - Get active SOS alerts
- `POST /api/sos/{id}/resolve` - Resolve SOS alert (admin)

### Admin Dashboard
- `GET /api/admin/overview` - Dashboard statistics
- `GET /api/admin/reports` - All reports (with pagination)
- `GET /api/admin/sos` - All SOS alerts
- `GET /api/admin/notifications` - Admin notifications

### CCTV Monitoring
- `GET /api/cctv` - Get all CCTV feeds
- `POST /api/cctv/{id}/crowd` - Update crowd density
- `GET /api/cctv/high-risk` - Get high-risk feeds

### Routes
- `POST /api/routes` - Calculate safe routes
- `GET /api/routes/safe-locations` - Get safe locations

---

## 🔐 Authentication Flow

### 1. Login Request
```javascript
const response = await fetch('http://172.20.11.252:3002/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'anypassword',
    role: 'citizen' // or 'admin'
  })
});

const data = await response.json();
// Store token: data.token
// Store user: data.user
```

### 2. Use Token in Subsequent Requests
```javascript
const response = await fetch('http://172.20.11.252:3002/api/report/my-reports?userId={userId}', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

---

## 📝 Example: Submit Report

```javascript
const submitReport = async () => {
  const response = await fetch('http://172.20.11.252:3002/api/report', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      title: 'Traffic Violation',
      description: 'Red light jumping at MG Road junction - very dangerous situation',
      location: { lat: 12.9757, lng: 77.6011 },
      mediaType: 'image',
      mediaUrl: 'https://example.com/photo.jpg',
      userId: user.id
    })
  });

  const data = await response.json();
  console.log('Report submitted:', data);
  // Will include AI validation result and reward/penalty
};
```

---

## 🐛 Troubleshooting

### Issue: Cannot connect to backend
**Solution:**
1. Check if you're on the same network
2. Verify backend is running: `http://172.20.11.252:3002/api/health`
3. Check firewall settings on backend machine
4. Try using backend machine's IP address

### Issue: CORS errors
**Solution:**
- Backend already configured to accept requests from any origin
- Make sure you're using the correct URL format: `http://172.20.11.252:3002/api`

### Issue: 404 Not Found
**Solution:**
- Check endpoint path (should start with `/api/`)
- Verify the endpoint exists in the list above

---

## 🎯 Quick Start Checklist

- [ ] Backend is running on `http://172.20.11.252:3002`
- [ ] Test health endpoint works
- [ ] Update frontend API base URL
- [ ] Install frontend dependencies
- [ ] Run frontend in Antigravity terminal
- [ ] Test login functionality
- [ ] Test report submission
- [ ] Test SOS alert
- [ ] Test admin dashboard

---

## 📞 Support

If you encounter any issues:
1. Check backend logs for errors
2. Verify network connectivity
3. Test API endpoints using curl or Postman
4. Check browser console for errors

---

## 🎉 You're All Set!

Your backend is fully functional with:
- ✅ Authentication system
- ✅ Report submission with AI validation
- ✅ Reward & penalty system
- ✅ SOS alerts
- ✅ Admin dashboard
- ✅ CCTV monitoring
- ✅ Route calculation
- ✅ Mock data with Bengaluru locations

**Happy coding! 🚀**
