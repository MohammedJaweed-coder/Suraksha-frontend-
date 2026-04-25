# 📧 Email Notification Setup Guide

## ✅ Feature Added: Email Notifications

Email notifications are now integrated into the Suraksha.ai backend for:
- 📝 **Report Submissions** - Admin receives email when new report is submitted
- 🚨 **SOS Alerts** - Admin receives urgent email when SOS is triggered

---

## 🔧 Current Status

**Installation:** ✅ Complete
- `nodemailer` package installed
- `@types/nodemailer` TypeScript types installed

**Implementation:** ✅ Complete
- Email service created: `src/services/email.service.ts`
- Report controller updated with email notification
- SOS controller updated with email notification
- Environment variables added to `.env`

**Default Mode:** 🔴 **DISABLED** (Email sending is OFF by default)

---

## 📋 Configuration

### Environment Variables (in `.env` file)

```env
# Email Configuration
EMAIL_ENABLED=false                    # Set to 'true' to enable email sending
EMAIL_USER=your-email@gmail.com        # Your Gmail address
EMAIL_PASSWORD=your-app-password       # Gmail App Password (NOT regular password)
ADMIN_EMAIL=admin@suraksha.ai          # Admin email to receive notifications
```

---

## 🚀 How to Enable Email Notifications

### Step 1: Get Gmail App Password

**Important:** You need a Gmail App Password, NOT your regular Gmail password.

1. Go to your Google Account: https://myaccount.google.com/
2. Click on **Security** in the left menu
3. Enable **2-Step Verification** (if not already enabled)
4. Go back to Security page
5. Click on **App passwords** (under 2-Step Verification)
6. Select **Mail** and **Other (Custom name)**
7. Enter "Suraksha Backend" as the name
8. Click **Generate**
9. Copy the 16-character password (format: `xxxx xxxx xxxx xxxx`)

### Step 2: Update `.env` File

```env
EMAIL_ENABLED=true
EMAIL_USER=your-actual-email@gmail.com
EMAIL_PASSWORD=your-16-char-app-password
ADMIN_EMAIL=admin@suraksha.ai
```

**Example:**
```env
EMAIL_ENABLED=true
EMAIL_USER=prakash.bhatt@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop
ADMIN_EMAIL=admin@suraksha.ai
```

### Step 3: Restart Backend Server

```bash
# Stop current server (Ctrl+C)
npm run dev
```

---

## 🧪 Testing Email Notifications

### Test 1: Submit a Report

**Request:**
```bash
curl -X POST http://localhost:3002/api/report \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-id",
    "title": "Test Report",
    "description": "This is a test report to verify email notifications",
    "location": { "lat": 12.9716, "lng": 77.5946 },
    "mediaType": "image",
    "mediaUrl": "https://example.com/test.jpg"
  }'
```

**Expected:**
- ✅ Report created successfully
- ✅ Email sent to admin (if EMAIL_ENABLED=true)
- ✅ Console log: `📧 Email sent to admin for report: [report-id]`

**If EMAIL_ENABLED=false:**
- ✅ Report created successfully
- ℹ️ Console log: `📧 Email disabled - Would have sent report notification to admin`

---

### Test 2: Trigger SOS Alert

**Request:**
```bash
curl -X POST http://localhost:3002/api/sos \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-id",
    "location": { "lat": 12.9716, "lng": 77.5946 }
  }'
```

**Expected:**
- ✅ SOS alert created
- ✅ Urgent email sent to admin (if EMAIL_ENABLED=true)
- ✅ Console log: `📧 SOS email sent to admin for alert: [alert-id]`

---

## 📧 Email Templates

### Report Notification Email

**Subject:** 🚨 New Incident Report Submitted - Suraksha.ai

**Content:**
- Report ID and title
- Description and status
- Location (lat/lng)
- Media type and URL
- User information
- AI validation result
- Action taken (reward/penalty)
- Timestamp

---

### SOS Alert Email

**Subject:** 🚨🚨 URGENT: SOS Alert Triggered - Suraksha.ai

**Content:**
- Alert ID and status
- Location with Google Maps link
- User information
- Timestamp
- Urgent action required notice

---

## 🔒 Security Notes

### Gmail App Password
- ✅ **Use App Password** - NOT your regular Gmail password
- ✅ **Keep it secret** - Don't commit `.env` to Git
- ✅ **Revoke if compromised** - Can be revoked from Google Account settings

### .env File Security
```bash
# .gitignore already includes .env
# Never commit .env to version control
```

---

## 🚨 Important: Non-Blocking Design

**Email failures will NOT block API responses:**

```typescript
try {
  await sendReportEmail(report, user?.email);
} catch (emailError) {
  // Email error is logged but doesn't fail the request
  console.error('📧 Email notification failed:', emailError.message);
}
```

**This means:**
- ✅ Report/SOS creation always succeeds
- ✅ Email is sent in background
- ✅ Email failure only logs error
- ✅ API response is not delayed by email sending

---

## 🧪 Email Configuration Test

The email service includes a test function:

```typescript
import { testEmailConfiguration } from './services/email.service';

// Test if email is configured correctly
const isValid = await testEmailConfiguration();
```

**Console output:**
- ✅ `Email configuration is valid` - Ready to send emails
- ❌ `Email configuration test failed` - Check credentials
- ℹ️ `Email is disabled in configuration` - EMAIL_ENABLED=false

---

## 📊 Email Sending Logs

### When EMAIL_ENABLED=true

**Report submission:**
```
📝 New report submitted: Test Report by user test-user-id
🤖 AI Validation Result: VALID: Media exists and description length > 20
💰 Reward assigned: ₹50 voucher
📧 Email sent to admin for report: abc-123-def
```

**SOS alert:**
```
🚨 SOS Alert triggered by user test-user-id at [12.9716, 77.5946]
📢 Notification sent to Police Control Room
📧 SOS email sent to admin for alert: xyz-789-uvw
```

### When EMAIL_ENABLED=false

**Report submission:**
```
📝 New report submitted: Test Report by user test-user-id
🤖 AI Validation Result: VALID: Media exists and description length > 20
💰 Reward assigned: ₹50 voucher
📧 Email disabled - Would have sent report notification to admin
```

**SOS alert:**
```
🚨 SOS Alert triggered by user test-user-id at [12.9716, 77.5946]
📢 Notification sent to Police Control Room
📧 Email disabled - Would have sent SOS alert to admin
```

---

## 🔧 Troubleshooting

### Error: "Invalid login credentials"

**Cause:** Using regular Gmail password instead of App Password

**Solution:** Generate Gmail App Password (see Step 1 above)

---

### Error: "Less secure app access"

**Cause:** Gmail security settings

**Solution:** Use App Password instead of enabling "Less secure apps"

---

### Error: "Email configuration test failed"

**Cause:** Wrong credentials or network issue

**Solution:**
1. Verify EMAIL_USER is correct Gmail address
2. Verify EMAIL_PASSWORD is 16-character App Password
3. Check internet connection
4. Try generating new App Password

---

### Email not received

**Check:**
1. ✅ EMAIL_ENABLED=true in `.env`
2. ✅ Backend restarted after `.env` changes
3. ✅ Check spam/junk folder
4. ✅ Verify ADMIN_EMAIL is correct
5. ✅ Check backend console for email logs

---

## 📋 Quick Reference

| Setting | Default | Description |
|---------|---------|-------------|
| `EMAIL_ENABLED` | `false` | Enable/disable email sending |
| `EMAIL_USER` | `your-email@gmail.com` | Gmail address to send from |
| `EMAIL_PASSWORD` | `your-app-password` | Gmail App Password (16 chars) |
| `ADMIN_EMAIL` | `admin@suraksha.ai` | Admin email to receive alerts |

---

## ✅ Summary

**Installation:** ✅ Complete  
**Configuration:** ⏳ Needs Gmail App Password  
**Default Mode:** 🔴 Disabled (safe for development)  
**Production Ready:** ✅ Yes (after configuration)

**To enable:**
1. Get Gmail App Password
2. Update `.env` with credentials
3. Set `EMAIL_ENABLED=true`
4. Restart backend

**Email notifications will be sent for:**
- Every report submission → Admin receives detailed report email
- Every SOS alert → Admin receives urgent alert email

**Email failures will NOT affect API functionality.**
