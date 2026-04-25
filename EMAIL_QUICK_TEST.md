# 📧 Email Notification - Quick Test Guide

## ✅ Feature Status

**Installation:** ✅ Complete  
**Integration:** ✅ Complete  
**Default Mode:** 🔴 Disabled (EMAIL_ENABLED=false)

---

## 🧪 Test Without Email (Current Setup)

Email is currently **DISABLED** by default. You can test the feature without configuring Gmail:

### Test 1: Submit Report (Email Disabled)

```bash
curl -X POST http://localhost:3002/api/report \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "491cd006-44c0-4327-8258-65b4749f956f",
    "title": "Test Report with Email Notification",
    "description": "This is a test report to verify email notification integration works correctly",
    "location": { "lat": 12.9716, "lng": 77.5946 },
    "mediaType": "image",
    "mediaUrl": "https://example.com/test-report.jpg"
  }'
```

**Expected Console Output:**
```
📝 New report submitted: Test Report with Email Notification by user 491cd006-44c0-4327-8258-65b4749f956f
🤖 AI Validation Result: VALID: Media exists and description length > 20
💰 Reward assigned: ₹50 voucher
📧 Email disabled - Would have sent report notification to admin
```

**Expected API Response:**
```json
{
  "success": true,
  "message": "Report submitted successfully",
  "report": {
    "id": "...",
    "title": "Test Report with Email Notification",
    "status": "valid",
    "aiValidationResult": "VALID: Media exists and description length > 20",
    "action": {
      "type": "reward",
      "value": "₹50 voucher"
    },
    "createdAt": "2026-04-25T..."
  }
}
```

---

### Test 2: Trigger SOS (Email Disabled)

```bash
curl -X POST http://localhost:3002/api/sos \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "491cd006-44c0-4327-8258-65b4749f956f",
    "location": { "lat": 12.9716, "lng": 77.5946 }
  }'
```

**Expected Console Output:**
```
🚨 SOS Alert triggered by user 491cd006-44c0-4327-8258-65b4749f956f at [12.9716, 77.5946]
📢 Notification sent to Police Control Room
📧 Email disabled - Would have sent SOS alert to admin
```

**Expected API Response:**
```json
{
  "success": true,
  "message": "SOS alert triggered successfully",
  "alert": {
    "id": "...",
    "location": { "lat": 12.9716, "lng": 77.5946 },
    "status": "active",
    "createdAt": "2026-04-25T..."
  }
}
```

---

## 🚀 Enable Email Notifications (Optional)

If you want to actually send emails:

### Step 1: Get Gmail App Password

1. Go to: https://myaccount.google.com/security
2. Enable 2-Step Verification
3. Go to: https://myaccount.google.com/apppasswords
4. Generate App Password for "Mail"
5. Copy the 16-character password

### Step 2: Update `.env`

```env
EMAIL_ENABLED=true
EMAIL_USER=your-actual-email@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx
ADMIN_EMAIL=admin@suraksha.ai
```

### Step 3: Restart Server

```bash
# Server will auto-restart with nodemon
# Or manually: Ctrl+C then npm run dev
```

### Step 4: Test Again

Run the same curl commands above.

**Expected Console Output (Email Enabled):**
```
📝 New report submitted: Test Report with Email Notification by user ...
🤖 AI Validation Result: VALID: Media exists and description length > 20
💰 Reward assigned: ₹50 voucher
📧 Email sent to admin for report: abc-123-def
```

**Check your admin email inbox for the notification!**

---

## 📊 What Gets Logged

### When EMAIL_ENABLED=false (Default)
```
📧 Email disabled - Would have sent report notification to admin
📧 Email disabled - Would have sent SOS alert to admin
```

### When EMAIL_ENABLED=true
```
📧 Email sent to admin for report: [report-id]
📧 SOS email sent to admin for alert: [alert-id]
```

### If Email Fails (Network/Credentials Issue)
```
❌ Failed to send email notification: [error message]
```

**Important:** Email failure does NOT block the API. Report/SOS creation always succeeds.

---

## ✅ Verification Checklist

**Without Email (Current Setup):**
- [ ] Report submission works
- [ ] Console shows "Email disabled" message
- [ ] API returns success
- [ ] SOS alert works
- [ ] Console shows "Email disabled" message
- [ ] API returns success

**With Email Enabled:**
- [ ] Report submission works
- [ ] Console shows "Email sent to admin"
- [ ] Admin receives email with report details
- [ ] SOS alert works
- [ ] Console shows "SOS email sent to admin"
- [ ] Admin receives urgent SOS email

---

## 🎯 Summary

**Current Status:**
- ✅ Email feature fully integrated
- ✅ Non-blocking design (email failure doesn't affect API)
- ✅ Disabled by default (safe for development)
- ✅ Easy to enable when needed

**To Test:**
1. Run the curl commands above
2. Check console for "Email disabled" messages
3. Verify API responses are successful

**To Enable:**
1. Get Gmail App Password
2. Update `.env` with credentials
3. Set `EMAIL_ENABLED=true`
4. Restart server
5. Test again and check email inbox

**Email Templates Include:**
- Report: Full details, AI validation, action taken
- SOS: Urgent alert with location and Google Maps link
