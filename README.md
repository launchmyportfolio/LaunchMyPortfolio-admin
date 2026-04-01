# LaunchMyPortfolio Admin CRM

A complete admin system for managing customers with secure JWT authentication, search/filter capabilities, and a clean UI.

## Project Structure

```
LaunchMyPortfolio-admin/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection config
│   ├── models/
│   │   ├── Admin.js              # Admin schema
│   │   └── Customer.js           # Customer schema
│   ├── routes/
│   │   ├── auth.js               # Auth endpoints
│   │   └── customers.js          # Customer CRUD endpoints
│   ├── middleware/
│   │   └── authMiddleware.js     # JWT protection
│   ├── package.json
│   ├── .env.example              # Environment variables template
│   └── server.js                 # Main server file
│
└── frontend/
    ├── css/
    │   └── style.css             # Global styles
    ├── js/
    │   └── api.js                # API calls and utilities
    ├── login.html                # Login/Register page
    ├── dashboard.html            # Dashboard with stats
    ├── customers.html            # Customer list with search/filter/sort
    ├── add-customer.html         # Add new customer
    ├── view-customer.html        # View customer details
    └── edit-customer.html        # Edit customer
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local instance or Atlas)
- A code editor/IDE

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file from example:
```bash
cp .env.example .env
```

4. Update `.env` with your values:
```
MONGO_URI=mongodb://localhost:27017/launchportfolio_admin
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

5. Start MongoDB (if running locally):
```bash
# macOS with Homebrew
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Windows
net start MongoDB
```

6. Start the backend server:
```bash
npm start
# or with auto-reload
npm run dev
```

The server will run on `http://localhost:5000`

### Frontend Setup

1. The frontend uses plain HTML, CSS, and JavaScript - no build step required
2. Update the API base URL in `frontend/js/api.js` if needed (defaults to `http://localhost:5000/api`)
3. Open `frontend/login.html` in a browser or serve using a local server:

```bash
# Using Python 3
python -m http.server 3000 --directory ./frontend

# Using Node.js http-server
npx http-server ./frontend -p 3000
```

Open browser to `http://localhost:3000/`

## Default Test Credentials

The system comes with no default admin account. You must register first:

1. Open login page
2. Click "Register here"
3. Create your admin account
4. Login with your credentials

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new admin
- `POST /api/auth/login` - Admin login
- `GET /api/auth/me` - Get current admin (requires token)

### Customers
All customer endpoints require JWT token in Authorization header: `Bearer <token>`

- `POST /api/customers` - Create customer
- `GET /api/customers?search=&status=&plan=&sort=` - Get all customers with filters
- `GET /api/customers/:id` - Get single customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer

### Payment & Subscription Tracking
All endpoints require JWT token

- `POST /api/customers/:id/payment` - Record payment for customer
- `GET /api/customers/:id/payments` - Get payment history
- `GET /api/customers/:id/subscription-status` - Get subscription status and days until expiry
- `GET /api/customers/subscriptions/expiring` - Get all customers with expiring subscriptions (within 7 days)

### Query Parameters
- `search` - Search by first name, last name, or email
- `status` - Filter by status (active, inactive, pending)
- `plan` - Filter by plan (starter, professional, enterprise, none)
- `sort` - Sort by date (latest, oldest)

## Financial Tracking System

Each customer can track complete financial information:

### Customer Financial Fields
- **Amount Value (₹)**: Amount credited to the customer
- **Amount Paid (₹)**: Total amount received/paid
- **Yearly Subscription Amount (₹)**: Annual subscription cost
- **Total Amount Received**: Auto-calculated total from all payments
- **Payment History**: Array of all payments with date, amount, method, and description

### Subscription Management
- **Subscription Start Date**: When subscription begins
- **Subscription End Date**: When subscription expires
- **Subscription Status**: Auto-calculated (active, expired, upcoming, paused)
- **Expiry Notifications**: Automatic alerts when expiring within 7 days

### Website Development Tracking
- **Website Developed**: Boolean flag for completion
- **Website Development Details**: URL, features, and other details

### Payment Methods Supported
- Cash
- Bank Transfer
- UPI
- Card
- Check
- Other

### Features
- Record each payment with date, amount, method, and description
- View complete payment history for each customer
- Automatic calculation of total amount received
- Subscription status tracking with automatic expiry detection
- Dashboard notifications for expiring subscriptions
- Financial dashboard per customer showing all financial metrics

## Features

✓ JWT-based authentication with secure password hashing
✓ Admin registration and login
✓ Customer CRUD operations
✓ Search customers by name/email
✓ Filter by status and plan
✓ Sort by newest/oldest
✓ localStorage for authentication tokens
✓ Protected routes with automatic redirect
✓ Responsive UI for desktop and mobile
✓ Clean, modern admin interface
✓ Confirmation modals for destructive actions
✓ Toast notifications for feedback
✓ **Financial Tracking**: Track amount paid, amount value, yearly subscription
✓ **Payment History**: Record each rupee received with date, method, and notes
✓ **Website Development Tracking**: Mark if website developed with details
✓ **Subscription Management**: Set subscription dates and automatically track status
✓ **Expiry Notifications**: Automatic alerts when subscriptions expire or expiring soon (within 7 days)
✓ **Payment Recording**: Add payments with multiple payment methods (cash, bank transfer, UPI, card, etc.)
✓ **Financial Dashboard**: View total amount received and payment history per customer
✓ **Subscription Status**: Automatic status calculation (active, expired, upcoming, paused)

## Technologies Used

**Backend:**
- Node.js + Express
- MongoDB + Mongoose
- JWT for authentication
- bcryptjs for password hashing
- CORS for cross-origin requests
- Morgan for request logging

**Frontend:**
- Pure HTML5
- CSS3 with CSS variables
- Vanilla JavaScript (no frameworks)
- localStorage for client-side storage

## Deployment

### Backend Deployment (Heroku, Railway, Vercel)

1. Set environment variables on your hosting platform:
   - `MONGO_URI` - MongoDB Atlas connection string
   - `JWT_SECRET` - Strong random secret
   - `PORT` - Port (usually assigned by platform)
   - `CORS_ORIGIN` - Your frontend URL
   - `NODE_ENV` - Set to 'production'

2. Push code to repository (GitHub)

3. Connect repository to hosting platform

4. Deploy

**Example MongoDB Atlas Setup:**
- Go to mongodb.com and create free cluster
- Get connection string
- Add IP address to whitelist
- Use connection string in MONGO_URI

### Frontend Deployment (Netlify, Vercel, GitHub Pages)

1. Update `API_BASE_URL` in `frontend/js/api.js` to your backend URL:
```javascript
const API_BASE_URL = 'https://your-backend-url.com/api';
```

2. Push frontend code to GitHub

3. Connect to Netlify/Vercel and deploy

4. Deploy

Or simply upload the entire `frontend` folder to any static hosting service.

## Environment Variables

### Backend (.env)
```
MONGO_URI=mongodb://localhost:27017/launchportfolio_admin
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

For production:
- Use strong random JWT_SECRET (min 32 characters)
- Set NODE_ENV to 'production'
- Use MongoDB Atlas instead of local
- Update CORS_ORIGIN to match frontend domain
- Use HTTPS

### Frontend (js/api.js)
```javascript
const API_BASE_URL = 'http://localhost:5000/api'; // Change for production
```

## Security Notes

- JWT tokens expire after 7 days
- Passwords are hashed with bcryptjs (10 salt rounds)
- Protected routes require valid JWT token
- CORS is enabled (configure origin for production)
- Use environment variables for secrets
- Never commit .env file to version control

## Troubleshooting

**MongoDB Connection Error:**
- Ensure MongoDB is running
- Check MONGO_URI is correct
- Verify network access (firewall/antivirus)

**CORS Error:**
- Update CORS_ORIGIN in backend .env
- Ensure frontend is using correct API_BASE_URL

**Token Errors:**
- Clear localStorage and login again
- Check token hasn't expired
- Verify JWT_SECRET matches between login and API calls

**Form Submissions Fail:**
- Check browser console for errors
- Verify API endpoint is running
- Ensure correct headers are being sent

## Future Enhancements

- Email notifications
- Customer import/export (CSV)
- Advanced analytics and reporting
- Role-based access control (RBAC)
- Activity logging and audit trail
- Two-factor authentication (2FA)
- Dark mode UI
- API rate limiting
- Data backup and recovery

## License

MIT License - feel free to use this project for your own purposes
