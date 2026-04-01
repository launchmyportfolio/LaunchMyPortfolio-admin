# Quick Reference - Payment & Subscription Features

## 🚀 Quick Start

### 1. Create a Customer with Website Project
```javascript
POST /api/customers
{
  "firstName": "John",
  "lastName": "Doe", 
  "email": "john@example.com",
  "websiteUrl": "https://example.com",
  "websiteDevelopedAmount": 50000,  // Website cost
  "subscriptionStartDate": "2024-01-01",
  "subscriptionEndDate": "2024-12-31",
  "yearlySubscriptionAmount": 12000
}
```

### 2. Record Payments
```javascript
POST /api/customers/{customerId}/add-payment
{
  "paymentAmount": 10000,
  "paymentDate": "2024-01-15",
  "paymentMode": "bank",        // cash, upi, bank, card, cheque, other
  "paymentType": "website",     // website, subscription, extra
  "remarks": "First installment"
}
```

### 3. View Payment Summary
```javascript
GET /api/customers/{customerId}/payments
// Returns: customer info + financial summary + payment history
```

### 4. Check for Expiring Subscriptions
```javascript
GET /api/customers/list/expiring-soon?days=7
GET /api/customers/list/expired
```

### 5. Get Notifications
```javascript
GET /api/notifications?limit=10&skip=0
// Returns: [notifications with customer details]

PUT /api/notifications/{notificationId}/read
// Mark as read

PUT /api/notifications/read-all
// Mark all as read
```

## 📋 Field Names Reference

### Customer Model
```javascript
// Website Project
websiteUrl                  // String
websiteDevelopedAmount      // Number (₹)

// Payments (auto-calculated)
amountPaid                  // Number
amountDue                   // Number (websiteDevelopedAmount - amountPaid)
totalAmountReceived         // Number (sum of all payments)

// Subscriptions
subscriptionStartDate       // Date
subscriptionEndDate         // Date
yearlySubscriptionAmount    // Number (₹)

// History
paymentHistory[]            // Array of payment objects
- paymentDate
- paymentAmount
- paymentMode
- paymentType
- remarks

// Status
reminderSent                // Boolean
status                      // 'pending', 'active', 'expired' (auto-updated)
```

## 🎯 Page Navigation

```
Dashboard
├── View Notifications (new section)
├── Click notification → Customer View
└── Navigate to Customers

Customers List
├── Click "Payments" → payments.html?id={customerId}
├── Click "View" → view-customer.html?id={customerId}
├── Click "Edit" → edit-customer.html?id={customerId}
└── Click "Delete" → Delete confirmation

Payments Page (NEW)
├── Summary Cards (Website Amount, Paid, Due, Sub. End)
├── Payment History Tab
│   └── Table of all payments
└── Add Payment Tab
    └── Form to record new payment

Add/Edit Customer
├── Basic Info Section
├── Website Development Section
│   ├── Website URL
│   └── Website Amount
└── Subscription Section
    ├── Start Date
    ├── End Date
    └── Yearly Amount
```

## 💰 Payment Mode Options

- **cash** - Cash payment
- **upi** - UPI transfer
- **bank** - Bank transfer
- **card** - Card payment
- **cheque** - Cheque payment
- **other** - Other method

## 📝 Payment Type Options

- **website** - Website development payment
- **subscription** - Subscription payment
- **extra** - Extra/miscellaneous payment

## 🔔 Notification Types

- **subscription-expiry** - Subscription expiring within 7 days
- **subscription-expired** - Subscription has already expired
- **payment-due** - Payment reminder (for future use)
- **reminder** - General reminder (for future use)

## ⏰ Automatic Updates

### Daily at 8:00 AM (Cron Job)
- Checks for expired subscriptions → Creates notifications + updates status
- Checks for expiring subscriptions (within 7 days) → Creates notifications
- Prevents duplicate notifications

### On Payment Recording
- `amountPaid` ← automatically increased
- `amountDue` ← automatically recalculated
- `totalAmountReceived` ← automatically recalculated

### On Customer Save
- `amountDue` = max(0, websiteDevelopedAmount - amountPaid)
- `totalAmountReceived` = sum(paymentHistory.paymentAmount)
- `status` = 'expired' if subscriptionEndDate < now

## 🎨 UI Components

### Summary Cards (Payments Page)
```html
<div class="summary-cards">
  <div class="card">
    <div class="card-title">Website Amount</div>
    <div class="card-value">₹50,000</div>
  </div>
  ...
</div>
```

### Payment Table
```
Date | Amount | Mode | Type | Remarks
```

### Notification Item
```
Message + Type Badge + Date/Time
(Click to view customer)
```

### Status Badges
```
.badge-active    (Green)
.badge-inactive  (Gray)
.badge-pending   (Yellow)
.badge-expired   (Red)
.badge-info      (Blue)
```

## 🔐 API Response Examples

### Add Payment Response
```json
{
  "success": true,
  "message": "Payment recorded successfully",
  "customer": {
    "_id": "...",
    "amountPaid": 20000,
    "amountDue": 30000,
    "totalAmountReceived": 20000,
    "paymentHistory": [...]
  }
}
```

### Get Payments Response
```json
{
  "success": true,
  "customerId": "...",
  "customerName": "John Doe",
  "companyName": "ABC Corp",
  "websiteUrl": "https://example.com",
  "websiteDevelopedAmount": 50000,
  "amountPaid": 20000,
  "amountDue": 30000,
  "totalAmountReceived": 20000,
  "subscriptionEndDate": "2024-12-31",
  "paymentHistory": [
    {
      "paymentDate": "2024-01-15",
      "paymentAmount": 10000,
      "paymentMode": "bank",
      "paymentType": "website",
      "remarks": "First installment"
    },
    ...
  ]
}
```

### Get Notifications Response
```json
{
  "success": true,
  "totalCount": 25,
  "unreadCount": 5,
  "notifications": [
    {
      "_id": "...",
      "customerId": {
        "firstName": "John",
        "lastName": "Doe"
      },
      "message": "Subscription expiring in 3 days",
      "type": "subscription-expiry",
      "read": false,
      "createdAt": "2024-01-17T08:00:00Z"
    },
    ...
  ]
}
```

## 🐛 Common Tasks

### Calculate Amount Due
```javascript
amountDue = websiteDevelopedAmount - amountPaid
// Automatically calculated by system
```

### Check If Subscription Is Expired
```javascript
const isExpired = subscriptionEndDate < new Date();
const daysSinceExpiry = Math.floor((new Date() - subscriptionEndDate) / (1000*60*60*24));
```

### Check Days Until Expiry
```javascript
const daysUntil = Math.ceil((subscriptionEndDate - new Date()) / (1000*60*60*24));
const isExpiringWithin7Days = daysUntil > 0 && daysUntil <= 7;
```

### Check Total Received
```javascript
const totalReceived = paymentHistory.reduce((sum, p) => sum + p.paymentAmount, 0);
// But use totalAmountReceived field which is auto-calculated
```

## 📊 Search & Filter Examples

### Search Customers
```
GET /api/customers?search=example.com
// Searches by: name, email, phone, company, website URL

GET /api/customers?status=active&sort=highestPaid
// Filter by status, sort by amount paid (descending)

GET /api/customers?sort=nearestExpiry
// Sort by subscription end date (ascending)
```

## 🛠️ Environment Setup

### Required for Email Notifications (Future)
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
SMTP_FROM_EMAIL=noreply@launchmyportfolio.com
```

## 📱 Responsive Design

All pages are mobile-responsive:
- Dashboard notifications stack vertically
- Payment table scrolls horizontally on small screens
- Summary cards convert to single column on mobile
- Tabs maintain full functionality

## 🎓 Learning Resources

See these files for detailed information:
- `PAYMENTS_AND_SUBSCRIPTIONS.md` - Complete API documentation
- `IMPLEMENTATION_SUMMARY.md` - Implementation details
- Backend models - Source of truth for schema
- Frontend pages - UI/UX examples

