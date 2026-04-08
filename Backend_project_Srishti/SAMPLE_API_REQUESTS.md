# Sample API Requests

This document contains sample API requests for testing the Finance Data Processing and Access Control System.

## 🔐 Authentication Examples

### 1. Login (Email-based)
```bash
# Request
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com"
  }'

# Response (Success)
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "64a1b2c3d4e5f6789012345",
      "name": "Admin User",
      "email": "admin@example.com",
      "role": "admin",
      "status": "active"
    }
  }
}
```

### 2. Get Current User Profile
```bash
# Request
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Response
{
  "success": true,
  "data": {
    "user": {
      "id": "64a1b2c3d4e5f6789012345",
      "name": "Admin User",
      "email": "admin@example.com",
      "role": "admin",
      "status": "active",
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

## 👥 User Management Examples

### 1. Create User (Admin Only)
```bash
# Request
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ADMIN_JWT_TOKEN>" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "role": "analyst",
    "status": "active"
  }'

# Response
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "user": {
      "id": "64a1b2c3d4e5f6789012346",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "analyst",
      "status": "active",
      "createdAt": "2024-01-15T11:00:00.000Z"
    }
  }
}
```

### 2. List Users with Pagination (Admin Only)
```bash
# Request
curl -X GET "http://localhost:5000/api/users?page=1&limit=5&role=analyst" \
  -H "Authorization: Bearer <ADMIN_JWT_TOKEN>"

# Response
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "64a1b2c3d4e5f6789012346",
        "name": "John Doe",
        "email": "john@example.com",
        "role": "analyst",
        "status": "active",
        "createdAt": "2024-01-15T11:00:00.000Z",
        "updatedAt": "2024-01-15T11:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 5,
      "total": 1,
      "pages": 1
    }
  }
}
```

### 3. Update User Role (Admin Only)
```bash
# Request
curl -X PATCH http://localhost:5000/api/users/64a1b2c3d4e5f6789012346 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ADMIN_JWT_TOKEN>" \
  -d '{
    "role": "admin",
    "status": "active"
  }'

# Response
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "user": {
      "id": "64a1b2c3d4e5f6789012346",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "admin",
      "status": "active",
      "createdAt": "2024-01-15T11:00:00.000Z",
      "updatedAt": "2024-01-15T12:00:00.000Z"
    }
  }
}
```

## 💰 Transaction Management Examples

### 1. Create Transaction (Admin Only)
```bash
# Request
curl -X POST http://localhost:5000/api/transactions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ADMIN_JWT_TOKEN>" \
  -d '{
    "amount": 1500.00,
    "type": "income",
    "category": "Salary",
    "date": "2024-01-15",
    "notes": "Monthly salary payment"
  }'

# Response
{
  "success": true,
  "message": "Transaction created successfully",
  "data": {
    "transaction": {
      "id": "64a1b2c3d4e5f6789012347",
      "amount": 1500,
      "type": "income",
      "category": "Salary",
      "date": "2024-01-15T00:00:00.000Z",
      "notes": "Monthly salary payment",
      "formattedAmount": "+$1500.00",
      "createdBy": {
        "id": "64a1b2c3d4e5f6789012345",
        "name": "Admin User",
        "email": "admin@example.com"
      },
      "createdAt": "2024-01-15T12:30:00.000Z"
    }
  }
}
```

### 2. Create Expense Transaction
```bash
# Request
curl -X POST http://localhost:5000/api/transactions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ADMIN_JWT_TOKEN>" \
  -d '{
    "amount": 250.50,
    "type": "expense",
    "category": "Groceries",
    "date": "2024-01-16",
    "notes": "Weekly grocery shopping"
  }'

# Response
{
  "success": true,
  "message": "Transaction created successfully",
  "data": {
    "transaction": {
      "id": "64a1b2c3d4e5f6789012348",
      "amount": 250.5,
      "type": "expense",
      "category": "Groceries",
      "date": "2024-01-16T00:00:00.000Z",
      "notes": "Weekly grocery shopping",
      "formattedAmount": "-$250.50",
      "createdBy": {
        "id": "64a1b2c3d4e5f6789012345",
        "name": "Admin User",
        "email": "admin@example.com"
      },
      "createdAt": "2024-01-16T09:15:00.000Z"
    }
  }
}
```

### 3. Get Transactions with Filtering
```bash
# Request - Get all income transactions
curl -X GET "http://localhost:5000/api/transactions?type=income&page=1&limit=10" \
  -H "Authorization: Bearer <JWT_TOKEN>"

# Request - Filter by date range and category
curl -X GET "http://localhost:5000/api/transactions?startDate=2024-01-01&endDate=2024-01-31&category=Groceries" \
  -H "Authorization: Bearer <JWT_TOKEN>"

# Request - Search transactions
curl -X GET "http://localhost:5000/api/transactions?search=salary&sortBy=amount&sortOrder=desc" \
  -H "Authorization: Bearer <JWT_TOKEN>"

# Response
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "64a1b2c3d4e5f6789012347",
        "amount": 1500,
        "type": "income",
        "category": "Salary",
        "date": "2024-01-15T00:00:00.000Z",
        "notes": "Monthly salary payment",
        "formattedAmount": "+$1500.00",
        "createdBy": {
          "id": "64a1b2c3d4e5f6789012345",
          "name": "Admin User",
          "email": "admin@example.com"
        },
        "createdAt": "2024-01-15T12:30:00.000Z",
        "updatedAt": "2024-01-15T12:30:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "pages": 1
    },
    "summary": {
      "totalIncome": 1500,
      "totalExpense": 0,
      "netBalance": 1500,
      "count": 1
    }
  }
}
```

### 4. Get Single Transaction
```bash
# Request
curl -X GET http://localhost:5000/api/transactions/64a1b2c3d4e5f6789012347 \
  -H "Authorization: Bearer <JWT_TOKEN>"

# Response
{
  "success": true,
  "data": {
    "transaction": {
      "id": "64a1b2c3d4e5f6789012347",
      "amount": 1500,
      "type": "income",
      "category": "Salary",
      "date": "2024-01-15T00:00:00.000Z",
      "notes": "Monthly salary payment",
      "formattedAmount": "+$1500.00",
      "createdBy": {
        "id": "64a1b2c3d4e5f6789012345",
        "name": "Admin User",
        "email": "admin@example.com"
      },
      "createdAt": "2024-01-15T12:30:00.000Z",
      "updatedAt": "2024-01-15T12:30:00.000Z"
    }
  }
}
```

### 5. Update Transaction (Admin Only)
```bash
# Request
curl -X PATCH http://localhost:5000/api/transactions/64a1b2c3d4e5f6789012347 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ADMIN_JWT_TOKEN>" \
  -d '{
    "amount": 1600.00,
    "notes": "Monthly salary with bonus"
  }'

# Response
{
  "success": true,
  "message": "Transaction updated successfully",
  "data": {
    "transaction": {
      "id": "64a1b2c3d4e5f6789012347",
      "amount": 1600,
      "type": "income",
      "category": "Salary",
      "date": "2024-01-15T00:00:00.000Z",
      "notes": "Monthly salary with bonus",
      "formattedAmount": "+$1600.00",
      "createdBy": {
        "id": "64a1b2c3d4e5f6789012345",
        "name": "Admin User",
        "email": "admin@example.com"
      },
      "createdAt": "2024-01-15T12:30:00.000Z",
      "updatedAt": "2024-01-16T10:00:00.000Z"
    }
  }
}
```

### 6. Get Transaction Categories
```bash
# Request
curl -X GET http://localhost:5000/api/transactions/categories \
  -H "Authorization: Bearer <JWT_TOKEN>"

# Response
{
  "success": true,
  "data": {
    "categories": [
      "Groceries",
      "Salary",
      "Utilities",
      "Entertainment",
      "Transportation"
    ]
  }
}
```

## 📊 Dashboard Analytics Examples

### 1. Get Financial Summary
```bash
# Request
curl -X GET http://localhost:5000/api/dashboard/summary \
  -H "Authorization: Bearer <JWT_TOKEN>"

# Request with date range
curl -X GET "http://localhost:5000/api/dashboard/summary?startDate=2024-01-01&endDate=2024-01-31" \
  -H "Authorization: Bearer <JWT_TOKEN>"

# Response
{
  "success": true,
  "data": {
    "totalIncome": 1600,
    "totalExpense": 250.5,
    "netBalance": 1349.5,
    "incomeCount": 1,
    "expenseCount": 1,
    "avgIncome": 1600,
    "avgExpense": 250.5
  }
}
```

### 2. Get Category Summary
```bash
# Request
curl -X GET http://localhost:5000/api/dashboard/category-summary \
  -H "Authorization: Bearer <JWT_TOKEN>"

# Response
{
  "success": true,
  "data": {
    "categories": [
      {
        "category": "Salary",
        "income": {
          "totalAmount": 1600,
          "count": 1,
          "avgAmount": 1600
        },
        "expense": {
          "totalAmount": 0,
          "count": 0,
          "avgAmount": 0
        },
        "netAmount": 1600,
        "totalAmount": 1600,
        "totalCount": 1
      },
      {
        "category": "Groceries",
        "income": {
          "totalAmount": 0,
          "count": 0,
          "avgAmount": 0
        },
        "expense": {
          "totalAmount": 250.5,
          "count": 1,
          "avgAmount": 250.5
        },
        "netAmount": -250.5,
        "totalAmount": 250.5,
        "totalCount": 1
      }
    ]
  }
}
```

### 3. Get Recent Transactions
```bash
# Request
curl -X GET "http://localhost:5000/api/dashboard/recent?limit=5" \
  -H "Authorization: Bearer <JWT_TOKEN>"

# Response
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "64a1b2c3d4e5f6789012348",
        "amount": 250.5,
        "type": "expense",
        "category": "Groceries",
        "date": "2024-01-16T00:00:00.000Z",
        "notes": "Weekly grocery shopping",
        "formattedAmount": "-$250.50",
        "createdBy": {
          "id": "64a1b2c3d4e5f6789012345",
          "name": "Admin User",
          "email": "admin@example.com"
        },
        "createdAt": "2024-01-16T09:15:00.000Z"
      },
      {
        "id": "64a1b2c3d4e5f6789012347",
        "amount": 1600,
        "type": "income",
        "category": "Salary",
        "date": "2024-01-15T00:00:00.000Z",
        "notes": "Monthly salary with bonus",
        "formattedAmount": "+$1600.00",
        "createdBy": {
          "id": "64a1b2c3d4e5f6789012345",
          "name": "Admin User",
          "email": "admin@example.com"
        },
        "createdAt": "2024-01-15T12:30:00.000Z"
      }
    ]
  }
}
```

### 4. Get Monthly Trends
```bash
# Request
curl -X GET "http://localhost:5000/api/dashboard/monthly-trends?months=6" \
  -H "Authorization: Bearer <JWT_TOKEN>"

# Response
{
  "success": true,
  "data": {
    "trends": [
      {
        "year": 2024,
        "month": 1,
        "totalIncome": 1600,
        "totalExpense": 250.5,
        "netBalance": 1349.5,
        "incomeCount": 1,
        "expenseCount": 1,
        "totalTransactions": 2,
        "monthName": "Jan",
        "monthYear": "Jan 2024"
      }
    ],
    "period": {
      "startDate": "2023-08-01T00:00:00.000Z",
      "endDate": "2024-01-16T12:00:00.000Z",
      "months": 6
    }
  }
}
```

### 5. Get User Statistics (Analyst+)
```bash
# Request
curl -X GET http://localhost:5000/api/dashboard/user-stats \
  -H "Authorization: Bearer <ANALYST_OR_ADMIN_JWT_TOKEN>"

# Response
{
  "success": true,
  "data": {
    "totalUsers": 2,
    "activeUsers": 2,
    "inactiveUsers": 0,
    "byRole": {
      "admin": {
        "total": 1,
        "active": 1,
        "inactive": 0
      },
      "analyst": {
        "total": 1,
        "active": 1,
        "inactive": 0
      }
    }
  }
}
```

### 6. Get Top Categories
```bash
# Request
curl -X GET "http://localhost:5000/api/dashboard/top-categories?limit=5&type=expense" \
  -H "Authorization: Bearer <JWT_TOKEN>"

# Response
{
  "success": true,
  "data": {
    "categories": [
      {
        "category": "Groceries",
        "totalAmount": 250.5,
        "count": 1,
        "avgAmount": 250.5
      },
      {
        "category": "Salary",
        "totalAmount": 1600,
        "count": 1,
        "avgAmount": 1600
      }
    ]
  }
}
```

## 🚨 Error Response Examples

### Authentication Error (401)
```json
{
  "success": false,
  "message": "Access denied. No token provided."
}
```

### Authorization Error (403)
```json
{
  "success": false,
  "message": "Access denied. Required role: admin. Current role: viewer"
}
```

### Validation Error (400)
```json
{
  "success": false,
  "message": "Validation Error: amount: Path `amount` is required., type: Path `type` is required."
}
```

### Not Found Error (404)
```json
{
  "success": false,
  "message": "User not found"
}
```

### Duplicate Key Error (400)
```json
{
  "success": false,
  "message": "email 'john@example.com' already exists. Please use a different value."
}
```

## 📝 Postman Collection

You can import these requests into Postman using the following collection format:

```json
{
  "info": {
    "name": "Finance API",
    "description": "Finance Data Processing and Access Control System",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:5000"
    },
    {
      "key": "token",
      "value": ""
    }
  ],
  "item": [
    {
      "name": "Auth",
      "item": [
        {
          "name": "Login",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"admin@example.com\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/api/auth/login",
              "host": ["{{baseUrl}}"],
              "path": ["api", "auth", "login"]
            }
          },
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "if (pm.response.code === 200) {",
                  "    const response = pm.response.json();",
                  "    pm.collectionVariables.set('token', response.data.token);",
                  "}"
                ]
              }
            }
          ]
        }
      ]
    }
  ]
}
```

## 🔄 Testing Workflow

1. **Start the server**: `npm run dev`
2. **Create an admin user** via MongoDB directly or through the API
3. **Login** to get JWT token
4. **Use the token** in Authorization header for all protected routes
5. **Test different roles** by creating users with different roles and using their tokens

## 📊 Sample Data Setup

You can create sample data using these requests:

```bash
# Create multiple transactions for testing
curl -X POST http://localhost:5000/api/transactions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -d '{
    "amount": 2000,
    "type": "income",
    "category": "Freelance",
    "date": "2024-01-10",
    "notes": "Freelance project payment"
  }'

curl -X POST http://localhost:5000/api/transactions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -d '{
    "amount": 150,
    "type": "expense",
    "category": "Utilities",
    "date": "2024-01-12",
    "notes": "Electric bill"
  }'
```

These sample requests cover all major functionality of the API and can be used for testing and development purposes.
