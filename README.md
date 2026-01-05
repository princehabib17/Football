# KickSlot - Football Booking Platform

A full-stack football booking application that allows users to discover, book, and pay for football games in the Philippines.

## Features

### Core Functionality
- Browse available football games
- View detailed game information (venue, date, time, available spots)
- **Guest checkout** - Book without creating an account
- Secure payment processing with **Philippines payment methods** (GCash, GrabPay, PayMaya, Cards)
- Payment in **Philippine Peso (PHP)**
- Booking confirmation with detailed receipt
- Real-time availability updates

### Security
- Helmet.js security headers
- CORS protection (restricted to frontend URL)
- Rate limiting (100 req/15min general, 5 req/15min auth)
- Input validation with express-validator
- JWT authentication (optional for users)
- Secure payment processing with Stripe

### Technical Features
- RESTful API architecture
- MongoDB database with Mongoose ODM
- Structured logging with Winston
- Comprehensive error handling
- Health check endpoint
- Docker deployment ready

## Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose
- **Stripe** for payment processing (PHP currency)
- **JWT** for authentication
- **Winston** for logging
- **Helmet** for security
- **express-validator** for input validation
- **express-rate-limit** for rate limiting

### Frontend
- **React** 19.1.1
- **React Router** for navigation
- **Axios** for API calls
- **Stripe React Elements** for payment UI

### DevOps
- Docker & Docker Compose
- Nginx for frontend serving
- Multi-stage builds for optimization

## Project Structure

```
Football/
├── backend/
│   ├── config/
│   │   └── logger.js              # Winston logger configuration
│   ├── middleware/
│   │   ├── auth.js                # Authentication middleware
│   │   └── errorHandler.js        # Global error handling
│   ├── models/
│   │   ├── User.js                # User model
│   │   ├── Game.js                # Game model
│   │   ├── Booking.js             # Booking model
│   │   └── Payment.js             # Payment model
│   ├── routes/
│   │   ├── auth.js                # Authentication routes
│   │   ├── games.js               # Game routes
│   │   ├── bookings.js            # Booking routes
│   │   └── payment.js             # Payment routes
│   ├── utils/
│   │   └── seed.js                # Database seeding script
│   ├── server.js                  # Main server file
│   ├── package.json
│   ├── Dockerfile
│   └── .env.example
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.js            # Game listing page
│   │   │   ├── GameDetail.js      # Game details page
│   │   │   ├── Checkout.js        # Payment checkout page
│   │   │   └── Confirmation.js    # Booking confirmation page
│   │   ├── App.js                 # Main app component
│   │   ├── index.js               # React entry point
│   │   └── index.css              # Global styles
│   ├── package.json
│   ├── Dockerfile
│   ├── nginx.conf
│   └── .env.example
├── docker-compose.yml
├── .gitignore
└── README.md
```

## Getting Started

### Prerequisites
- Node.js 20+ and npm
- MongoDB 7+
- Stripe account (with Philippines enabled)

### Environment Variables

#### Backend (.env)
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/kickslot
FRONTEND_URL=http://localhost:3000
JWT_SECRET=your-super-secret-jwt-key
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
CURRENCY=php
```

#### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

### Installation & Running

#### Option 1: Docker (Recommended)

1. **Set up environment variables:**
   ```bash
   # Copy example files and update with your Stripe keys
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```

2. **Start all services:**
   ```bash
   docker-compose up -d
   ```

3. **Seed the database:**
   ```bash
   docker-compose exec backend npm run seed
   ```

4. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - Health Check: http://localhost:5000/health

#### Option 2: Local Development

1. **Install dependencies:**
   ```bash
   # Backend
   cd backend
   npm install

   # Frontend
   cd ../frontend
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   # Copy and configure .env files
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```

3. **Start MongoDB:**
   ```bash
   # Make sure MongoDB is running on localhost:27017
   mongod
   ```

4. **Seed the database:**
   ```bash
   cd backend
   npm run seed
   ```

5. **Start the backend:**
   ```bash
   cd backend
   npm run dev
   ```

6. **Start the frontend:**
   ```bash
   cd frontend
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Games
- `GET /api/games` - List all games (query: ?status=open)
- `GET /api/games/:id` - Get game details
- `POST /api/games` - Create game (admin)
- `PUT /api/games/:id` - Update game (admin)
- `DELETE /api/games/:id` - Delete game (admin)

### Bookings
- `GET /api/bookings` - List bookings (query: ?userId, ?gameId, ?status)
- `GET /api/bookings/:id` - Get booking details
- `POST /api/bookings/:id/cancel` - Cancel booking

### Payments
- `POST /api/payment/create-payment-intent` - Create payment intent
- `POST /api/payment/confirm-payment` - Confirm payment
- `POST /api/payment/webhook` - Stripe webhook handler

### Health
- `GET /health` - Health check endpoint

## Payment Flow

1. User selects game and number of players
2. User enters guest information (name, email, phone)
3. Frontend creates payment intent via backend
4. Backend creates Booking and Payment records (status: pending)
5. User enters card details (Stripe Elements)
6. Frontend confirms payment with Stripe
7. Backend confirms payment success
8. Booking status updated to 'confirmed'
9. Game player count updated
10. User redirected to confirmation page

## Guest Checkout

The app supports **guest checkout** - users can book without creating an account:
- No forced registration
- Guest information stored in `guestInfo` field of Booking
- Optional authentication for returning users
- Bookings can be made with or without user account

## Philippine Payment Methods

Stripe integration supports:
- Credit/Debit Cards (Visa, Mastercard, etc.)
- GCash
- GrabPay
- PayMaya
- All amounts in Philippine Peso (PHP)

## Security Features

1. **Helmet.js** - Sets security HTTP headers
2. **CORS** - Restricted to frontend URL only
3. **Rate Limiting** - Prevents brute force attacks
4. **Input Validation** - All inputs validated with express-validator
5. **JWT Authentication** - Secure token-based auth
6. **Password Hashing** - bcryptjs with salt rounds
7. **Error Handling** - No sensitive data in error responses
8. **Logging** - Structured logging with Winston

## Production Deployment

### Production Checklist

1. **Environment Variables:**
   - [ ] Update `JWT_SECRET` with secure random string
   - [ ] Add production Stripe keys
   - [ ] Set `NODE_ENV=production`
   - [ ] Update `FRONTEND_URL` to production domain
   - [ ] Configure `MONGODB_URI` for production database

2. **Database:**
   - [ ] Use MongoDB Atlas or managed MongoDB
   - [ ] Enable authentication
   - [ ] Set up backups
   - [ ] Create indexes for performance

3. **Security:**
   - [ ] Enable HTTPS/SSL
   - [ ] Configure Stripe webhooks
   - [ ] Set up monitoring (Sentry, DataDog, etc.)
   - [ ] Review and update rate limits
   - [ ] Enable database encryption at rest

4. **Infrastructure:**
   - [ ] Deploy with Docker or Kubernetes
   - [ ] Set up load balancer
   - [ ] Configure CDN for frontend
   - [ ] Set up automated backups
   - [ ] Configure log aggregation

### Docker Production Deployment

```bash
# Build images
docker-compose build

# Run in production mode
NODE_ENV=production docker-compose up -d

# View logs
docker-compose logs -f

# Scale backend
docker-compose up -d --scale backend=3
```

## Monitoring

### Health Check
```bash
curl http://localhost:5000/health
```

Response:
```json
{
  "uptime": 123.456,
  "message": "OK",
  "timestamp": 1234567890,
  "database": "connected"
}
```

### Logs
Logs are stored in `backend/logs/`:
- `combined.log` - All logs
- `error.log` - Error logs only

## Development

### Adding New Games
```bash
cd backend
npm run seed
```

### Running Tests
```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```

## Current Production Readiness: 80%

### Completed (80%)
✅ Core functionality working
✅ Payment processing with PHP support
✅ Guest checkout implemented
✅ Security hardened (CORS, rate limiting, helmet)
✅ Error handling and logging
✅ Database models and validation
✅ Docker deployment ready
✅ Health checks
✅ Environment configuration

### Remaining for Full Production (20%)
- [ ] Comprehensive test coverage (60%+ recommended)
- [ ] CI/CD pipeline setup
- [ ] Advanced monitoring (Sentry, DataDog)
- [ ] Email notifications for bookings
- [ ] SMS notifications (Twilio)
- [ ] Admin dashboard
- [ ] User dashboard (booking history)
- [ ] Refund handling
- [ ] Performance optimizations (caching, CDN)

## License

MIT

## Support

For issues or questions, please create an issue in the repository.
