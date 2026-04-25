# Frontend Port Information

## Current Status

🔴 **Frontend is NOT running**

Based on port scan:
- ✅ Backend: Running on **port 3002**
- ❌ Frontend: **Not running** (no port 5173, 5174, 3000, or 8080 detected)

---

## Expected Frontend Port

Based on the screenshot you showed, the frontend uses **Vite** and typically runs on:
- **Port 5173** (Vite default)
- Or **Port 5174** (if 5173 is taken)

---

## How to Start the Frontend

### Step 1: Navigate to Frontend Directory
```bash
cd suraksha-front
```

### Step 2: Start the Frontend
```bash
npm run dev
```

### Step 3: Check the Output
You should see something like:
```
VITE v6.4.2  ready in 717 ms

➜  Local:   http://localhost:5174/
➜  Network: http://10.175.138.235:5174/
```

The port number (5173 or 5174) will be shown in the output.

---

## After Frontend Starts

### Access the Frontend
Open your browser and go to:
- **Local**: http://localhost:5173 (or 5174)
- **Network**: http://10.175.138.235:5173 (or 5174)

### Test Login
1. **Citizen Tab**:
   - Email: `citizen@suraksha.ai`
   - Password: `12345678`

2. **Administrator Tab**:
   - Email: `admin@suraksha.ai`
   - Password: `123456`

---

## Current Port Status

```
Port 3002: ✅ Backend (Suraksha.ai API)
Port 5173: ❌ Not in use (Frontend should start here)
Port 5174: ❌ Not in use (Alternative frontend port)
```

---

## If Frontend Won't Start

### Error: "Port 5173 is already in use"

**Solution 1: Kill all node processes**
```powershell
taskkill /F /IM node.exe
```

Then restart:
```bash
# Backend
cd C:\Users\PRAKASH BHATT\OneDrive\Desktop\Suraksha.ai
npm run dev

# Frontend (in new terminal)
cd suraksha-front
npm run dev
```

**Solution 2: Use the fix script**
Double-click `fix-frontend-port.bat`

**Solution 3: Use different port**
Edit `suraksha-front/vite.config.js`:
```javascript
export default {
  server: {
    port: 5175, // Use different port
    host: true
  }
}
```

---

## Quick Check Commands

### Check if backend is running
```powershell
Invoke-RestMethod -Uri 'http://localhost:3002/api/health'
```

### Check which ports are in use
```powershell
netstat -ano | Select-String "LISTENING" | Select-String "3002|5173|5174"
```

### Check node processes
```powershell
Get-Process node
```

---

## Summary

- 🟢 **Backend**: Running on port 3002
- 🔴 **Frontend**: Not running yet
- 🎯 **Next Step**: Start the frontend with `npm run dev` in the `suraksha-front` directory
- 📍 **Expected Port**: 5173 or 5174

Once the frontend starts, you'll see the port number in the terminal output.
