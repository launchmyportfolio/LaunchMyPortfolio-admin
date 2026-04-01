# Financial Tracking & Subscription Management - Implementation Guide

This admin CRM now includes comprehensive financial tracking and subscription management features.

## What's New

### 1. **Financial Tracking Fields**
When adding or editing a customer, you can now track:

- **Amount Value (₹)**: The value/budget amount
- **Yearly Subscription Amount (₹)**: Annual subscription cost
- **Website Developed Status**: Yes/No with optional details
- **Subscription Dates**: Start and end dates for subscription period

### 2. **Automatic Payment Recording**
Track every rupee received from each customer:
- Record payment amount
- Payment method (Cash, Bank Transfer, UPI, Card, Check, etc.)
- Payment description/notes
- Automatic date timestamping

### 3. **Payment History**
View complete payment history per customer showing:
- Payment date
- Amount received
- Payment method used
- Payment notes/description
- Total amount received (auto-calculated)

### 4. **Subscription Management**
- Set subscription start and end dates
- Automatic subscription status calculation (active/expired/upcoming)
- Track if expiring soon (within 7 days)
- Days until expiry counter

### 5. **Expiry Notifications**
- **Dashboard**: Shows alerts for all customers with expiring subscriptions
- **Auto-checks**: On dashboard load, displays notifications
- **Color coding**: Warning badges for subscriptions expiring soon
- **Manual check**: Visit customer finances page to see subscription details

## How to Use

### Adding a Customer with Financial Info

1. Go to **Customers** → **+ Add Customer**
2. Fill basic information (name, email, phone, etc.)
3. Scroll to **Website Development** section
4. Scroll to **Financial Information** section:
   - Enter "Amount Value" (₹)
   - Enter "Yearly Subscription Amount" (₹)
5. Scroll to **Subscription Details**:
   - Set "Subscription Start Date"
   - Set "Subscription End Date"
6. Click "Add Customer"

### Recording Payments

1. View a customer (click View button)
2. Click "View Finances" button
3. Scroll to "Record Payment" section
4. Enter:
   - **Amount** (₹): How much was paid
   - **Payment Method**: Cash/Bank/UPI/Card/Check
   - **Description**: Optional notes
5. Click "Record Payment"
6. Payment appears in Payment History below

### Viewing Financial Summary

Each customer has a finance dashboard showing:
- **Total Amount Received**: Sum of all payments
- **Amount Value**: Budget/credited amount
- **Yearly Subscription**: Annual cost
- **Subscription Status**: Current status with color badge
- **Days Until Expiry**: Countdown if subscription active
- **Payment History Table**: All payments recorded

### Subscription Expiry Tracking

**Automatic Notifications:**
- When you open the dashboard, you see alerts for expiring subscriptions
- Notifications appear for subscriptions expiring within 7 days

**Manual Check:**
- View customer → View Finances
- See subscription status, end date, and days remaining
- If expiring soon, you see a warning alert

**Color Coding:**
- 🟢 Active = Green
- 🔴 Expired = Red/Danger
- 🟡 Expiring Soon = Yellow/Warning
- ⚪ Upcoming = Gray

## Database Model Updates

### Customer Schema New Fields

```javascript
// Website Development
websiteDeveloped: Boolean
websiteDevelopmentDetails: String

// Payment Tracking
amountPaid: Number
amountValue: Number
yearlySubscriptionAmount: Number
totalAmountReceived: Number (auto-calculated)

// Subscription Dates
subscriptionStartDate: Date
subscriptionEndDate: Date

// Subscription Status
subscriptionStatus: String (active/expired/upcoming)

// Payment History
paymentHistory: [{
  date: Date,
  amount: Number,
  description: String,
  paymentMethod: String
}]

// Notification Tracking
expiryNotificationSent: Boolean
expiryNotificationDate: Date
```

## New API Endpoints

### Record Payment
```bash
POST /api/customers/:id/payment
Headers: Authorization: Bearer <token>
Body: {
  "amount": 50000,
  "description": "Monthly subscription",
  "paymentMethod": "bank_transfer"
}
```

### Get Payment History
```bash
GET /api/customers/:id/payments
Headers: Authorization: Bearer <token>
```

### Get Subscription Status
```bash
GET /api/customers/:id/subscription-status
Headers: Authorization: Bearer <token>
```

### Get Expiring Subscriptions
```bash
GET /api/customers/subscriptions/expiring
Headers: Authorization: Bearer <token>
```

## New Frontend Pages

### customer-finances.html
Complete financial management page for a single customer:
- Financial summary cards (total received, amount value, yearly subscription, status)
- Subscription details (start/end date, days to expiry, website status)
- Payment recording form
- Payment history table

### Updated Pages

**add-customer.html**
- Added financial information section
- Added website development section
- Added subscription details section

**edit-customer.html**
- All financial fields editable
- Subscription dates editable
- Website development tracking editable

**view-customer.html**
- Displays all financial information
- Shows subscription status with color badge
- "View Finances" button to access detailed financial page

**dashboard.html**
- Auto-checks for expiring subscriptions
- Shows notifications at top for any expiring subscriptions
- Updated with expiry alerts

## Best Practices

1. **Always Record Payments**: Track every rupee received for accurate financial records
2. **Update Subscription Dates**: Set accurate start/end dates for proper expiry tracking
3. **Check Dashboard Regularly**: Monitor expiring subscriptions from dashboard
4. **Use Payment Methods**: Select correct payment method for better categorization
5. **Add Descriptions**: Include notes in payments for future reference
6. **Website Tracking**: Mark when website development is complete with details

## Example Workflow

### Scenario: New Startup Wants Website & Subscription

1. **Add Customer**
   - Name: "ABC Tech Labs"
   - Email: "info@abctech.com"
   - Website Developed: Yes
   - Amount Value: ₹200,000
   - Yearly Subscription: ₹50,000
   - Start Date: 2026-04-01
   - End Date: 2027-04-01

2. **Initial Payment**
   - View Finances
   - Record Payment: ₹100,000 (Advance)
   - Method: Bank Transfer
   - Description: "Website development advance"

3. **Second Payment (After 6 months)**
   - Record Payment: ₹25,000 (Half yearly)
   - Method: UPI
   - Description: "6-month subscription"

4. **Track Subscription**
   - Dashboard shows: 270 days until expiry
   - Payment history shows both payments
   - Total received: ₹125,000

5. **Expiry Alert (7 days before)**
   - Dashboard notification appears
   - Customer finances page shows warning
   - Text: "⚠️ Subscription expiring in 5 days"

## Troubleshooting

**Issue**: Payment not showing in history
- Refresh the page
- Check network tab for errors
- Verify amount is > 0

**Issue**: Subscription status shows wrong
- Check if subscription dates are set correctly
- Update end date if needed
- Refresh page

**Issue**: No expiry notifications
- Ensure subscription end date is within 7 days
- Check browser console for errors
- Verify backend is running

**Issue**: Payment amount calculation wrong
- Check each payment individually
- Clear browser cache
- Manually verify by adding payment values

## Future Enhancements

- Bulk payment upload (CSV import)
- Email reminders for expiring subscriptions
- Payment templates/recurring payments
- Financial reports and analytics
- Invoice generation from payments
- Auto-email receipts
- Multi-currency support
