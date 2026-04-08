# Finance Data Processing and Access Control System

A complete backend system for finance data processing with role-based access control, built with Node.js, Express.js, and MongoDB.

## 🚀 Features

### Core Features
- **User Management**: Create, read, update, and delete users with role-based permissions
- **Financial Records**: Comprehensive transaction management with income/expense tracking
- **Dashboard Analytics**: Real-time financial summaries and trends using MongoDB aggregation
- **Role-Based Access Control**: Three-tier permission system (Viewer, Analyst, Admin)
- **Authentication**: JWT-based authentication with email-based login
- **Advanced Filtering**: Search, filter, and paginate transactions
- **Data Validation**: Comprehensive input validation and error handling

### Technical Features
- **RESTful API**: Clean, well-documented API endpoints
- **Database Optimization**: Indexed queries and aggregation pipelines
- **Error Handling**: Global error handling with proper HTTP status codes
- **Security**: Rate limiting, CORS, helmet security headers
- **Logging**: Request logging and error tracking
- **Soft Delete**: Optional soft delete for transactions
- **Pagination**: Efficient pagination for large datasets

## 📋 Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Built-in validation with validator.js
- **Security**: Helmet, CORS, Rate Limiting
- **Development**: Nodemon for hot reloading

## 🏗️ Project Structure

```
backend/
│
├── models/                    # Database models
│   ├── User.js               # User schema and methods
│   └── Transaction.js       # Transaction schema and methods
│
├── controllers/              # Business logic handlers
│   ├── authController.js     # Authentication logic
│   ├── userController.js     # User management logic
│   ├── transactionController.js # Transaction management logic
│   └── dashboardController.js  # Analytics and dashboard logic
│
├── routes/                   # API route definitions
│   ├── authRoutes.js         # Authentication routes
│   ├── userRoutes.js         # User management routes
│   ├── transactionRoutes.js  # Transaction routes
│   └── dashboardRoutes.js    # Dashboard analytics routes
│
├── middleware/               # Custom middleware
│   ├── authMiddleware.js     # JWT authentication
│   ├── roleMiddleware.js     # Role-based access control
│   └── errorMiddleware.js    # Error handling utilities
│
├── config/                   # Configuration files
│   └── db.js                 # Database connection setup
│
├── app.js                    # Express app configuration
├── server.js                 # Server startup and configuration
├── package.json              # Dependencies and scripts
├── .env                      # Environment variables
└── README.md                 # This file
```

## 🛠️ Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd finance-data-processing-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit the `.env` file with your configuration:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # Database Configuration
   MONGODB_URI=mongodb://localhost:27017/finance_db

   # JWT Configuration
   JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
   JWT_EXPIRE=7d

   # Rate Limiting
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ```

4. **Start MongoDB**
   - For local MongoDB: `mongod`
   - Or use MongoDB Atlas and update the MONGODB_URI

5. **Run the application**
   ```bash
   # Development mode with hot reload
   npm run dev

   # Production mode
   npm start
   ```

6. **Verify the server is running**
   - Health check: `http://localhost:5000/health`
   - API documentation: `http://localhost:5000/api`

## 🔐 Role-Based Access Control

### User Roles

#### Viewer
- **Permissions**: Read-only access
- **Can View**: Transactions, dashboard analytics, categories
- **Cannot**: Create, update, or delete anything

#### Analyst  
- **Permissions**: Read access + analytics
- **Can View**: All viewer permissions + user statistics
- **Cannot**: Create, update, or delete anything

#### Admin
- **Permissions**: Full access
- **Can Do**: Everything - CRUD operations on users and transactions

### Access Control Implementation

The system implements role-based access control using middleware:

```javascript
// Example: Protect admin-only routes
router.post('/users', protect, isAdmin, createUser);

// Example: Allow viewer and above
router.get('/transactions', protect, isViewerOrAbove, getTransactions);
```

## 📚 API Endpoints

### Authentication

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/auth/login` | Login with email | Public |
| GET | `/api/auth/me` | Get current user profile | Private |
| GET | `/api/auth/validate` | Validate JWT token | Private |

### User Management

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/users` | Create new user | Admin |
| GET | `/api/users` | List users with pagination | Admin |
| GET | `/api/users/:id` | Get single user | Admin |
| PATCH | `/api/users/:id` | Update user role/status | Admin |
| DELETE | `/api/users/:id` | Delete user | Admin |

### Transaction Management

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/transactions` | Create transaction | Admin |
| GET | `/api/transactions` | List transactions with filtering | Viewer+ |
| GET | `/api/transactions/:id` | Get single transaction | Viewer+ |
| PATCH | `/api/transactions/:id` | Update transaction | Admin |
| DELETE | `/api/transactions/:id` | Delete transaction | Admin |
| GET | `/api/transactions/categories` | Get all categories | Viewer+ |

### Dashboard Analytics

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/dashboard/summary` | Financial summary (income/expense) | Viewer+ |
| GET | `/api/dashboard/category-summary` | Category-wise totals | Viewer+ |
| GET | `/api/dashboard/recent` | Recent transactions | Viewer+ |
| GET | `/api/dashboard/monthly-trends` | Monthly income vs expense | Viewer+ |
| GET | `/api/dashboard/user-stats` | User statistics | Analyst+ |
| GET | `/api/dashboard/top-categories` | Top categories by amount | Viewer+ |

## 📝 Sample API Requests

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com"}'
```

### Create User (Admin)
```bash
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "role": "analyst",
    "status": "active"
  }'
```

### Create Transaction (Admin)
```bash
curl -X POST http://localhost:5000/api/transactions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -d '{
    "amount": 1500.00,
    "type": "income",
    "category": "Salary",
    "date": "2024-01-15",
    "notes": "Monthly salary"
  }'
```

### Get Transactions with Filtering
```bash
curl -X GET "http://localhost:5000/api/transactions?type=income&startDate=2024-01-01&endDate=2024-12-31&page=1&limit=10" \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

### Get Dashboard Summary
```bash
curl -X GET http://localhost:5000/api/dashboard/summary \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

## 🔍 Query Parameters

### Transactions Endpoint
- `type`: Filter by transaction type (`income`, `expense`)
- `category`: Filter by category (partial match)
- `startDate`: Filter transactions from this date
- `endDate`: Filter transactions until this date
- `search`: Search in category and notes fields
- `minAmount`: Minimum amount filter
- `maxAmount`: Maximum amount filter
- `page`: Page number for pagination (default: 1)
- `limit`: Items per page (default: 20)
- `sortBy`: Field to sort by (default: `date`)
- `sortOrder`: Sort order (`asc`, `desc`, default: `desc`)

### Dashboard Endpoints
- `startDate`: Filter data from this date
- `endDate`: Filter data until this date
- `months`: Number of months for trends (default: 12)
- `limit`: Limit for top categories (default: 10)
- `type`: Filter by transaction type for top categories

## 🚨 Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "message": "Error description"
}
```

### Common HTTP Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (authentication required)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `500`: Internal Server Error

## 📊 Database Schema

### User Model
```javascript
{
  name: String (required, max 50 chars),
  email: String (required, unique, valid email),
  role: String (enum: ['viewer', 'analyst', 'admin'], default: 'viewer'),
  status: String (enum: ['active', 'inactive'], default: 'active'),
  createdAt: Date,
  updatedAt: Date
}
```

### Transaction Model
```javascript
{
  amount: Number (required, > 0),
  type: String (enum: ['income', 'expense'], required),
  category: String (required, max 50 chars),
  date: Date (required, default: now),
  notes: String (optional, max 500 chars),
  createdBy: ObjectId (ref: 'User', required),
  isDeleted: Boolean (default: false, soft delete),
  createdAt: Date,
  updatedAt: Date
}
```

## 🔄 Development Workflow

### Adding New Features
1. Define the data model in `/models`
2. Create controller logic in `/controllers`
3. Define routes in `/routes`
4. Add middleware if needed in `/middleware`
5. Update API documentation

### Database Operations
- Use Mongoose for all database operations
- Implement proper validation at model level
- Use aggregation pipelines for complex analytics
- Add indexes for frequently queried fields

### Security Best Practices
- Always validate input data
- Use parameterized queries (Mongoose handles this)
- Implement proper authentication and authorization
- Never expose sensitive information in responses
- Use HTTPS in production

## 🚀 Deployment

### Environment Setup
1. Set `NODE_ENV=production`
2. Use a strong `JWT_SECRET`
3. Configure production MongoDB connection
4. Set up proper CORS origins
5. Configure rate limiting for production traffic

### Docker Deployment (Optional)
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For issues and questions:
1. Check the API documentation at `/api`
2. Review the error messages carefully
3. Check the logs for detailed error information
4. Ensure all environment variables are properly set

## 🔄 Assumptions Made

1. **Authentication**: Email-based login without password hashing (as requested)
2. **Database**: MongoDB is running locally or connection string is provided
3. **Environment**: Development environment with default settings
4. **Data**: Initial data seeding is not included (can be added as needed)
5. **Testing**: Unit tests are not included but can be added
6. **Frontend**: This is a backend-only API; frontend integration is separate

## 📈 Performance Considerations

- Database indexes are optimized for common queries
- Pagination prevents large dataset transfers
- Aggregation pipelines are optimized for analytics
- Rate limiting prevents API abuse
- Error handling prevents memory leaks

---

**Built with ❤️ for robust financial data management**
