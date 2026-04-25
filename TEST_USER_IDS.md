# Test User IDs Reference

## Fixed User IDs for Testing

These user IDs are now **hardcoded** and will remain consistent across server restarts.

### Admin User
```
ID: admin-user-001
Email: admin@suraksha.ai
Password: 123456
Role: admin
Name: Police Admin
Phone: +919876543210
```

### Citizen Users

#### User 1
```
ID: citizen-user-001
Email: rajesh.kumar@example.com
Password: 123456
Role: citizen
Name: Rajesh Kumar
Phone: +919876543210
```

#### User 2
```
ID: citizen-user-002
Email: rahul.sharma@example.com
Password: 123456
Role: citizen
Name: Rahul Sharma
Phone: +919876543211
```

#### User 3
```
ID: citizen-user-003
Email: priya.patel@example.com
Password: 123456
Role: citizen
Name: Priya Patel
Phone: +919876543212
```

#### User 4
```
ID: citizen-user-004
Email: amit.kumar@example.com
Password: 123456
Role: citizen
Name: Amit Kumar
Phone: +919876543213
```

---

## Usage in Frontend

When submitting a report, use the appropriate user ID:

```javascript
// Example: Submit report as Rajesh Kumar
const reportData = {
  userId: 'citizen-user-001',
  title: 'Traffic Violation',
  description: 'Red light jumping at Silk Board junction',
  location: { lat: 12.9176, lng: 77.6237 },
  mediaType: 'image',
  mediaUrl: 'https://example.com/photo.jpg'
};

fetch('http://172.20.11.252:3002/api/report', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(reportData)
});
```

---

## Admin Inbox Testing

Now when you fetch the admin inbox, reporter information will display correctly:

```bash
# Get admin inbox
curl http://172.20.11.252:3002/api/admin/inbox

# Response will include:
{
  "success": true,
  "inbox": [
    {
      "id": "...",
      "userId": "citizen-user-001",
      "reporterEmail": "rajesh.kumar@example.com",
      "reporterName": "Rajesh Kumar",
      "reporterPhone": "+919876543210",
      "title": "...",
      ...
    }
  ]
}
```

---

## Acknowledge Report (Admin Only)

```bash
# Acknowledge a report (requires admin role header)
curl -X POST http://172.20.11.252:3002/api/admin/inbox/{reportId}/acknowledge \
  -H "role: admin"
```

---

## ✅ Fixed Issues

1. **User IDs are now consistent** - No more UUID regeneration on restart
2. **Reporter info displays correctly** - Email, name, phone now show in inbox
3. **Acknowledge button works** - Admin can mark reports as processed
4. **Frontend can use fixed IDs** - No need to fetch user IDs dynamically
