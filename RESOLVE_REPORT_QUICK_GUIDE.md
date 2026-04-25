# 🔧 Resolve Report - Quick Guide

## ✅ Feature: Admin Mark Report as Resolved

---

## 🚀 Quick Usage

### Endpoint
```
PATCH /api/report/:id/resolve
```

### Headers
```
role: admin
```

### Example
```bash
curl -X PATCH http://localhost:3002/api/report/{reportId}/resolve \
  -H "role: admin"
```

---

## 📊 Response

### Success (200)
```json
{
  "success": true,
  "message": "Report marked as resolved",
  "report": {
    "id": "...",
    "title": "...",
    "status": "resolved",
    "updatedAt": "..."
  }
}
```

### Access Denied (403)
```json
{
  "success": false,
  "error": "Only admin can resolve reports"
}
```

### Not Found (404)
```json
{
  "success": false,
  "error": "Report not found"
}
```

---

## 🧪 Test Commands

### PowerShell
```powershell
# Get a report ID first
$reports = Invoke-RestMethod "http://localhost:3002/api/admin/overview"

# Resolve as admin
$reportId = "your-report-id"
Invoke-RestMethod -Uri "http://localhost:3002/api/report/$reportId/resolve" `
  -Method PATCH `
  -Headers @{'role'='admin'}
```

### cURL
```bash
# Resolve as admin
curl -X PATCH http://localhost:3002/api/report/{reportId}/resolve \
  -H "role: admin"

# Try as citizen (should fail)
curl -X PATCH http://localhost:3002/api/report/{reportId}/resolve \
  -H "role: citizen"
```

---

## 🔒 Authorization

| Role | Can Resolve? |
|------|--------------|
| admin | ✅ Yes |
| citizen | ❌ No (403) |
| (no role) | ❌ No (403) |

---

## 📋 Report Statuses

| Status | Description |
|--------|-------------|
| pending | Initial status |
| valid | AI validated as valid |
| invalid | AI validated as invalid |
| **resolved** | **Admin marked as resolved** ✅ |
| processed | Processed by system |

---

## ✅ Quick Test

1. **Create a test report:**
   ```bash
   curl -X POST http://localhost:3002/api/report \
     -H "Content-Type: application/json" \
     -d '{
       "userId": "491cd006-44c0-4327-8258-65b4749f956f",
       "title": "Test Report",
       "description": "This is a test report for resolution",
       "location": {"lat": 12.9716, "lng": 77.5946},
       "mediaType": "image",
       "mediaUrl": "https://example.com/test.jpg"
     }'
   ```

2. **Copy the report ID from response**

3. **Resolve as admin:**
   ```bash
   curl -X PATCH http://localhost:3002/api/report/{reportId}/resolve \
     -H "role: admin"
   ```

4. **Verify status is "resolved"**

---

## 🎯 Summary

**Endpoint:** `PATCH /api/report/:id/resolve`  
**Auth:** Admin only (role header)  
**Action:** Changes status to "resolved"  
**Breaking Changes:** None

Simple admin-only feature to mark reports as resolved!
