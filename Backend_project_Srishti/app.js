const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

// Import middleware
const { errorHandler, notFound } = require('./middleware/errorMiddleware');

const app = express();

// Security middleware
app.use(helmet());

// CORS middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com'] 
    : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl} - ${new Date().toISOString()}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/dashboard', dashboardRoutes);

// API documentation endpoint
app.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Finance Data Processing API',
    version: '1.0.0',
    endpoints: {
      auth: {
        'POST /api/auth/login': 'Login user (email-based)',
        'GET /api/auth/me': 'Get current user profile',
        'GET /api/auth/validate': 'Validate token'
      },
      users: {
        'POST /api/users': 'Create user (Admin only)',
        'GET /api/users': 'List users with pagination (Admin only)',
        'GET /api/users/:id': 'Get single user (Admin only)',
        'PATCH /api/users/:id': 'Update user role/status (Admin only)',
        'DELETE /api/users/:id': 'Delete user (Admin only)'
      },
      transactions: {
        'POST /api/transactions': 'Create transaction (Admin only)',
        'GET /api/transactions': 'List transactions with filtering (Viewer+)',
        'GET /api/transactions/:id': 'Get single transaction (Viewer+)',
        'PATCH /api/transactions/:id': 'Update transaction (Admin only)',
        'DELETE /api/transactions/:id': 'Delete transaction (Admin only)',
        'GET /api/transactions/categories': 'Get all categories (Viewer+)'
      },
      dashboard: {
        'GET /api/dashboard/summary': 'Get financial summary (Viewer+)',
        'GET /api/dashboard/category-summary': 'Get category-wise summary (Viewer+)',
        'GET /api/dashboard/recent': 'Get recent transactions (Viewer+)',
        'GET /api/dashboard/monthly-trends': 'Get monthly trends (Viewer+)',
        'GET /api/dashboard/user-stats': 'Get user statistics (Analyst+)',
        'GET /api/dashboard/top-categories': 'Get top categories (Viewer+)'
      }
    },
    roles: {
      viewer: 'Can read transactions and dashboard data',
      analyst: 'Can read transactions + access analytics',
      admin: 'Full access to all features'
    }
  });
});

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

module.exports = app;
