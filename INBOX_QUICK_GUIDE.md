# 📬 Admin Inbox - Quick Guide

## ✅ Feature: Admin Inbox for Reports

Reports are now stored in an admin inbox like messages!

---

## 🚀 Quick Usage

### Get All Reports in Inbox
```bash
GET /api/admin/inbox
```

### With Pagination
```bash
GET /api/admin/inbox?page=1&limit=10
```

### Filter by Status
```bash
GET /api/admin/inbox?status=valid
```

---

## 📊 Response Format

```json
{
  "success": true,
  "inbox": [
    {
      "id": "...",
      "title": "...",
      "description": "...",
      "status": "valid",
      "createdAt": "..."
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 4,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  },
  "unreadCount": 4
}
```

---

## 🧪 Quick Test

### PowerShell
```powershell
# Fetch inbox
Invoke-RestMethod "http://localhost:3002/api/admin/inbox"

# With pagination
Invoke-RestMethod "http://localhost:3002/api/admin/inbox?page=1&limit=5"

# Filter by status
Invoke-RestMethod "http://localhost:3002/api/admin/inbox?status=valid"
```

### cURL
```bash
# Fetch inbox
curl http://localhost:3002/api/admin/inbox

# With pagination
curl "http://localhost:3002/api/admin/inbox?page=1&limit=5"

# Filter by status
curl "http://localhost:3002/api/admin/inbox?status=resolved"
```

---

## 📋 Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 20 | Items per page |
| `status` | string | - | Filter by status |

---

## 🔄 How It Works

```
User submits report
    ↓
Report created
    ↓
Added to admin inbox (newest first)
    ↓
Email sent to admin (if enabled)
    ↓
Admin fetches inbox
    ↓
GET /api/admin/inbox
```

---

## 📧 Email Integration

**Status:** Optional (disabled by default)

**To Enable:**
1. Update `.env`:
   ```env
   EMAIL_ENABLED=true
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-app-password
   ADMIN_EMAIL=admin@suraksha.ai
   ```
2. Restart server

**Email Sent When:**
- New report submitted
- Contains full report details
- HTML formatted

---

## 📊 Inbox Features

✅ **Chronological Order** - Newest reports first  
✅ **Pagination** - Handle large number of reports  
✅ **Filtering** - Filter by status  
✅ **Unread Count** - Total number of reports  
✅ **Email Notifications** - Optional email alerts

---

## 🎯 Summary

**Endpoint:** `GET /api/admin/inbox`  
**Purpose:** View all reports like messages  
**Order:** Newest first  
**Pagination:** Yes  
**Filtering:** By status  
**Email:** Optional

Simple inbox-style interface for admin to view all reports!
