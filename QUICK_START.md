# LaunchMyPortfolio Admin CRM - Quick Start Guide

## Backend Quick Start

```bash
cd backend
npm install
cp .env.example .env
npm start
```

Server runs on `http://localhost:5000`

## Frontend Quick Start

```bash
# Option 1: Using Python
cd frontend
python -m http.server 3000

# Option 2: Using Node.js
cd frontend
npx http-server -p 3000
```

Frontend runs on `http://localhost:3000` or `http://localhost:3000/login.html`

## API Configuration

- Backend API Base URL: `http://localhost:5000/api`
- Frontend already configured for local development
- Change `API_BASE_URL` in `frontend/js/api.js` for production

## First Steps

1. Start MongoDB (if local)
2. Start backend server
3. Serve frontend files
4. Open `login.html` in browser
5. Register a new admin account
6. Login and start managing customers

## Testing

### Add Test Customer via API
```bash
curl -X POST http://localhost:5000/api/customers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "555-0123",
    "company": "Acme Corp",
    "status": "active",
    "plan": "professional"
  }'
```

## Structure

- **Backend**: Node.js/Express REST API with MongoDB
- **Frontend**: Static HTML/CSS/JS with fetch API calls
- **Auth**: JWT tokens stored in localStorage
- **DB Models**: Admin and Customer

All endpoints are protected with JWT middleware.
