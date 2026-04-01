# Payment & Subscription Management System

## Overview

The LaunchMyPortfolio Admin CRM now includes a comprehensive Payment & Subscription Management system that allows admins to:

- Track website development amounts and payments received
- Manage subscription dates and yearly amounts
- Record individual payment transactions with detailed information
- View payment history for each customer
- Monitor subscription expiry dates and receive notifications
- Track amount due (auto-calculated as the difference between website amount and payments received)
- Receive automatic notifications for expiring or expired subscriptions

## Customer Model Updates

### New Fields Added

```javascript
{
  // Website Development Fields
  websiteUrl: String,              // Customer's website URL
  websiteDevelopedAmount: Number,  // Total amount for website development (₹)
  
  // Payment Tracking
  amountPaid: Number,              // Total amount paid to date (auto-calculated from payment history)
  amountDue: Number,               // Amount still due = websiteDevelopedAmount - amountPaid (auto-calculated)
  
  // Subscription Management
  subscriptionStartDate: Date,     // When the subscription started
  subscriptionEndDate: Date,       // When the subscription ends
  yearlySubscriptionAmount: Number,// Annual subscription fee (₹)
  
  // Total Tracking
  totalAmountReceived: Number,     // Sum of all payments including subscriptions
  
  // Payment History (Array of transactions)
  paymentHistory: [{
    paymentDate: Date,
    paymentAmount: Number,
    paymentMode: String,           // 'cash', 'upi', 'bank', 'card', 'cheque', 'other'
    paymentType: String,           // 'website', 'subscription', 'extra'
    remarks: String
  }],
  
  // Reminder Tracking
  reminderSent: Boolean            // Whether a subscription expiry reminder was sent
}
```

## Backend APIs

### GET /api/customers
Enhanced with advanced search capabilities.

**Query Parameters:**
- `search`: Search by name, email, phone, company, or website URL
- `status`: Filter by status (active, inactive, pending)
- `sort`: Sort options - `latest`, `oldest`, `highestPaid`, `nearestExpiry`

**Response:**
```json
{
  "success": true,
  "count": 5,
  "customers": [
    {
      "_id": "...",
      "firstName": "John",
      "lastName": "Doe",
      "websiteUrl": "https://example.com",
      "amountPaid": 15000,
      "amountDue": 35000,
      "totalAmountReceived": 15000,
      "status": "active"
    }
  ]
}
```

### GET /api/customers/list/expired
Returns all customers with subscriptions that have already expired.

**Response:**
```json
{
  "success": true,
  "count": 2,
  "customers": [...]
}
```

### GET /api/customers/list/expiring-soon
Returns customers with subscriptions expiring within specified days.

**Query Parameters:**
- `days`: Number of days to check (default: 7)

**Response:**
```json
{
  "success": true,
  "count": 3,
  "days": 7,
  "customers": [...]
}
```

### POST /api/customers/:id/add-payment
Record a new payment for a customer.

**Request Body:**
```json
{
  "paymentAmount": 5000,
  "paymentDate": "2024-01-15",
  "paymentMode": "bank",
  "paymentType": "website",
  "remarks": "First installment for website development"
}
```

**Validations:**
- `paymentAmount`: Must be positive number
- `paymentMode`: One of [cash, upi, bank, card, cheque, other]
- `paymentType`: One of [website, subscription, extra]

**Response:**
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

### GET /api/customers/:id/payments
Get detailed payment information and history for a customer.

**Response:**
```json
{
  "success": true,
  "customerId": "...",
  "customerName": "John Doe",
  "company": "ABC Corp",
  "websiteUrl": "https://example.com",
  "websiteDevelopedAmount": 50000,
  "amountPaid": 20000,
  "amountDue": 30000,
  "totalAmountReceived": 20000,
  "subscriptionEndDate": "2024-12-31",
  "yearlySubscriptionAmount": 12000,
  "paymentHistory": [
    {
      "_id": "...",
      "paymentDate": "2024-01-15",
      "paymentAmount": 10000,
      "paymentMode": "bank",
      "paymentType": "website",
      "remarks": "First installment"
    },
    {
      "_id": "...",
      "paymentDate": "2024-02-01",
      "paymentAmount": 10000,
      "paymentMode": "upi",
      "paymentType": "website",
      "remarks": "Second installment"
    }
  ]
}
```

### GET /api/notifications
Get all notifications for the admin.

**Query Parameters:**
- `limit`: Number of notifications to return (default: 10)
- `skip`: Number of notifications to skip for pagination (default: 0)

**Response:**
```json
{
  "success": true,
  "totalCount": 25,
  "unreadCount": 5,
  "notifications": [
    {
      "_id": "...",
      "customerId": {
        "_id": "...",
        "firstName": "John",
        "lastName": "Doe"
      },
      "message": "Subscription for John Doe is expiring in 3 days (on Jan 20, 2024)",
      "type": "subscription-expiry",
      "read": false,
      "createdAt": "2024-01-17T08:00:00Z"
    }
  ]
}
```

### PUT /api/notifications/:id/read
Mark a specific notification as read.

**Response:**
```json
{
  "success": true,
  "message": "Notification marked as read",
  "notification": {...}
}
```

### PUT /api/notifications/read-all
Mark all notifications as read.

**Response:**
```json
{
  "success": true,
  "message": "All notifications marked as read"
}
```

## Scheduled Task - Subscription Expiry Checker

A cron job runs every day at **8:00 AM** to check for:

1. **Expired Subscriptions**: Updates customer status to 'expired' and creates a notification
2. **Expiring Subscriptions**: Checks if subscription ends within 7 days and creates a notification

### Notification Types
- `subscription-expired`: Subscription has already passed its end date
- `subscription-expiry`: Subscription is expiring within 7 days

## Frontend Pages

### Customers Page (`customers.html`)
Updated table columns:
- Name
- Email
- Website (URL with link)
- Paid (₹ amount)
- Due (₹ amount)
- Sub. End (subscription end date)
- Status (badge)
- Actions (View, Payments, Edit, Delete)

### Payments Page (`payments.html`) - NEW
Dedicated page for managing customer payments.

**Features:**
- Customer information header
- Summary cards showing:
  - Website Amount
  - Amount Paid
  - Amount Due
  - Subscription End Date
- Two tabs:
  - **Payment History**: Table showing all payments with date, amount, mode, type, remarks
  - **Add Payment**: Form to record new payments with validation

**URL:** `payments.html?id=customerId`

### Add Customer Page (`add-customer.html`) - UPDATED
New fields added:
- Website URL
- Website Development Amount (₹)
- Yearly Subscription Amount (₹)
- Subscription Start Date
- Subscription End Date

### Edit Customer Page (`edit-customer.html`) - UPDATED
Same fields as Add Customer page for flexibility in updates.

### Dashboard (`dashboard.html`) - UPDATED
New Notifications section showing:
- Unread notification count badge
- Latest 10 notifications with:
  - Message
  - Type badge (subscription-expiry, subscription-expired, payment-due, reminder)
  - Date/time
  - Link to customer view when clicked
- Mark All as Read button

## Key Features

### Auto-Calculated Fields
1. **amountPaid**: Automatically recalculated from paymentHistory sum when a payment is added
2. **amountDue**: Automatically calculated as `websiteDevelopedAmount - amountPaid`
3. **totalAmountReceived**: Sum of all paymentHistory amounts

### Payment Tracking
- Multiple payment modes supported: Cash, UPI, Bank, Card, Cheque, Other
- Payment types: Website Development, Subscription, Extra
- Each payment includes date, amount, mode, type, and optional remarks
- Full history maintained for audit trail

### Subscription Management
- Automatic status updates based on subscription dates
- Expiry notifications generated daily
- Customers with expired subscriptions flagged as 'expired' status
- Optional reminder tracking

### Notification System
- Unread count display
- Mark individual or all notifications as read
- Clickable notifications to view customer details
- Different notification types with visual badges

## Frontend API Client (`js/api.js`)

```javascript
// Payment APIs
customerAPI.addPayment(id, paymentData)
customerAPI.getPaymentHistory(id)

// Subscription APIs
customerAPI.getExpiredCustomers()
customerAPI.getExpiringCustomers(days=7)

// Notification APIs
notificationAPI.getAll(limit=10, skip=0)
notificationAPI.markAsRead(id)
notificationAPI.markAllAsRead()
```

## Environment Configuration

Update `.env` with:
```
# SMTP Configuration (for future email notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
SMTP_FROM_EMAIL=noreply@launchmyportfolio.com
```

## Data Migration Notes

If upgrading from previous version:
1. Existing customers will have default values for new fields
2. `amountPaid` and `totalAmountReceived` will be 0
3. `amountDue` will equal `websiteDevelopedAmount` (if set)
4. `paymentHistory` will be empty array
5. `subscriptionStartDate` and `subscriptionEndDate` will be null
6. Cron job will not create notifications for existing subscriptions on first run

## Validation Rules

### Payment Recording
- Payment amount must be positive
- Payment date is required
- Payment mode must be valid
- Payment type must be valid

### Customer Fields
- Website URL (optional, must be valid if provided)
- Website Developed Amount (optional, must be positive if provided)
- Subscription dates can be past or future
- Yearly subscription amount (optional, must be positive if provided)

## Status Codes

All API endpoints return standard HTTP status codes:
- `200`: Success
- `201`: Created (for POST requests)
- `400`: Bad Request (validation error)
- `404`: Not Found
- `500`: Server Error

## Example Workflow

1. **Create Customer**
   - Enter customer details and website amount
   - Set subscription start and end dates
   - System auto-calculates amountDue = websiteDevelopedAmount

2. **Record Payments**
   - User navigates to Payments page from customers list
   - Records individual payments as they're received
   - System auto-updates: amountPaid, amountDue, totalAmountReceived

3. **Monitor Subscriptions**
   - Dashboard shows notifications for expiring subscriptions
   - Cron job at 8 AM checks and notifies admin
   - Admin can click notifications to view customer details

4. **Admin Actions**
   - Mark notifications as read
   - View payment history filtered by date, mode, or type
   - Export reports of pending amounts due
   - Manage customer status updates

