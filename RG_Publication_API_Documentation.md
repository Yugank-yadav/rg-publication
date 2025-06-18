# RG Publication Website - Complete API Documentation

## Table of Contents

1. [Overview](#overview)
2. [Authentication & Authorization](#authentication--authorization)
3. [Product Management](#product-management)
4. [Shopping Cart](#shopping-cart)
5. [Search & Filter](#search--filter)
6. [Order Management](#order-management)
7. [User Profile](#user-profile)
8. [Content Management](#content-management)
9. [Analytics & Tracking](#analytics--tracking)
10. [File Upload](#file-upload)
11. [Database Schema](#database-schema)
12. [Implementation Priority](#implementation-priority)
13. [Security & Performance](#security--performance)

---

## Overview

### Base Configuration

**Base URL:** `https://api.rgpublication.com/v1`

**Authentication:** Bearer Token (JWT)

**Content-Type:** `application/json`

**Rate Limiting:** 1000 requests per hour per user

**API Versioning:** URL-based versioning (`/v1/`)

**Response Format:** All responses follow a consistent structure:

```json
{
  "success": boolean,
  "message": "string",
  "data": object,
  "error": "string",
  "timestamp": "ISO 8601 string",
  "requestId": "string"
}
```

### Common HTTP Status Codes

- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Access denied
- `404 Not Found` - Resource not found
- `422 Unprocessable Entity` - Validation error
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error

---

## Authentication & Authorization

### 1. User Registration

**Priority:** High (MVP)

```http
POST /auth/register
```

**Request Headers:**

```json
{
  "Content-Type": "application/json"
}
```

**Request Body:**

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "password": "SecurePassword123!",
  "phone": "+91-9876543210",
  "dateOfBirth": "1995-06-15",
  "role": "student"
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "usr_1234567890",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "phone": "+91-9876543210",
      "role": "student",
      "isEmailVerified": false,
      "createdAt": "2024-01-15T10:30:00Z"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresIn": null
    }
  },
  "timestamp": "2024-01-15T10:30:00Z",
  "requestId": "req_abc123"
}
```

**Error Responses:**

```json
{
  "success": false,
  "error": "VALIDATION_ERROR",
  "message": "Invalid input data",
  "details": [
    {
      "field": "email",
      "message": "Email already exists"
    }
  ],
  "timestamp": "2024-01-15T10:30:00Z",
  "requestId": "req_abc123"
}
```

### 2. User Login

**Priority:** High (MVP)

```http
POST /auth/login
```

**Request Body:**

```json
{
  "email": "john.doe@example.com",
  "password": "SecurePassword123!",
  "rememberMe": true
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "usr_1234567890",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "role": "student",
      "preferences": {
        "subjects": ["Mathematics", "Science"],
        "classes": [10, 11],
        "language": "en"
      }
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresIn": null
    }
  }
}
```

### 3. Token Refresh

**Priority:** Low (Optional - tokens don't expire)

```http
POST /auth/refresh
```

**Note:** This endpoint is optional since tokens are configured to never expire. It can be used for security purposes to rotate tokens if needed.

**Request Body:**

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": null
  }
}
```

### 4. Logout

**Priority:** Medium

```http
POST /auth/logout
```

**Request Headers:**

```json
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### 5. Password Reset Request

**Priority:** Medium

```http
POST /auth/password-reset
```

**Request Body:**

```json
{
  "email": "john.doe@example.com"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Password reset email sent"
}
```

### 6. Password Reset Confirm

**Priority:** Medium

```http
POST /auth/password-reset/confirm
```

**Request Body:**

```json
{
  "token": "reset_token_123",
  "newPassword": "NewSecurePassword123!"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

### 7. Email Verification

**Priority:** Medium

```http
POST /auth/verify-email
```

**Request Body:**

```json
{
  "token": "verification_token_123"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

---

## Product Management

### 1. Get All Products

**Priority:** High (MVP)

```http
GET /products
```

**Query Parameters:**

```
?page=1
&limit=20
&subject=Mathematics
&class=10
&type=Textbook
&featured=bestseller
&priceMin=200
&priceMax=500
&sortBy=price
&sortOrder=asc
&search=mathematics
&inStock=true
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "prod_1234567890",
        "title": "Complete Mathematics for Class 10",
        "description": "Comprehensive mathematics textbook covering all CBSE syllabus topics for Class 10 students.",
        "subject": "Mathematics",
        "class": 10,
        "type": "Textbook",
        "price": 350,
        "originalPrice": 400,
        "discount": 12.5,
        "currency": "INR",
        "isbn": "978-81-234-5678-9",
        "author": "Dr. R.K. Sharma",
        "publisher": "RG Publication",
        "edition": "2024",
        "pages": 456,
        "language": "English",
        "featured": "bestseller",
        "inStock": true,
        "stockQuantity": 150,
        "images": [
          {
            "id": "img_001",
            "url": "https://cdn.rgpublication.com/products/math-class10-cover.jpg",
            "alt": "Complete Mathematics for Class 10 - Cover",
            "type": "cover"
          }
        ],
        "tags": ["CBSE", "Mathematics", "Class 10", "Algebra", "Geometry"],
        "rating": {
          "average": 4.8,
          "count": 1247
        },
        "specifications": {
          "weight": "450g",
          "dimensions": "25cm x 18cm x 2cm",
          "binding": "Paperback",
          "printType": "Color"
        },
        "seo": {
          "slug": "complete-mathematics-class-10-cbse",
          "metaTitle": "Complete Mathematics for Class 10 - CBSE Textbook",
          "metaDescription": "Best mathematics textbook for Class 10 CBSE students."
        },
        "createdAt": "2024-01-01T00:00:00Z",
        "updatedAt": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 25,
      "totalItems": 500,
      "itemsPerPage": 20,
      "hasNextPage": true,
      "hasPreviousPage": false
    },
    "filters": {
      "subjects": ["Mathematics", "Science", "English", "Social Science"],
      "classes": [5, 6, 7, 8, 9, 10, 11, 12],
      "types": ["Textbook", "Practice Book", "Lab Manual", "Advanced Guide"],
      "featured": ["bestseller", "trending", "new-arrival"],
      "priceRange": {
        "min": 150,
        "max": 500
      }
    }
  }
}
```

### 2. Get Product by ID

**Priority:** High (MVP)

```http
GET /products/{productId}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "product": {
      "id": "prod_1234567890",
      "title": "Complete Mathematics for Class 10",
      "description": "Comprehensive mathematics textbook covering all CBSE syllabus topics for Class 10 students.",
      "longDescription": "This comprehensive mathematics textbook is designed specifically for Class 10 CBSE students. It covers all essential topics including Real Numbers, Polynomials, Linear Equations, Quadratic Equations, Arithmetic Progressions, Triangles, Coordinate Geometry, Trigonometry, Areas and Volumes, Statistics, and Probability.",
      "subject": "Mathematics",
      "class": 10,
      "type": "Textbook",
      "price": 350,
      "originalPrice": 400,
      "discount": 12.5,
      "currency": "INR",
      "isbn": "978-81-234-5678-9",
      "author": "Dr. R.K. Sharma",
      "publisher": "RG Publication",
      "edition": "2024",
      "pages": 456,
      "language": "English",
      "featured": "bestseller",
      "inStock": true,
      "stockQuantity": 150,
      "images": [
        {
          "id": "img_001",
          "url": "https://cdn.rgpublication.com/products/math-class10-cover.jpg",
          "alt": "Complete Mathematics for Class 10 - Cover",
          "type": "cover"
        },
        {
          "id": "img_002",
          "url": "https://cdn.rgpublication.com/products/math-class10-back.jpg",
          "alt": "Complete Mathematics for Class 10 - Back Cover",
          "type": "back"
        }
      ],
      "tableOfContents": [
        {
          "chapter": 1,
          "title": "Real Numbers",
          "pages": "1-25"
        },
        {
          "chapter": 2,
          "title": "Polynomials",
          "pages": "26-55"
        }
      ],
      "features": [
        "CBSE Curriculum Aligned",
        "Step-by-step Solutions",
        "Practice Exercises",
        "Previous Year Questions"
      ],
      "tags": ["CBSE", "Mathematics", "Class 10", "Algebra", "Geometry"],
      "rating": {
        "average": 4.8,
        "count": 1247,
        "distribution": {
          "5": 856,
          "4": 298,
          "3": 67,
          "2": 18,
          "1": 8
        }
      },
      "relatedProducts": [
        {
          "id": "prod_2345678901",
          "title": "Math Practice Book Class 10",
          "price": 280,
          "image": "https://cdn.rgpublication.com/products/math-practice-class10.jpg",
          "rating": 4.6
        }
      ],
      "specifications": {
        "weight": "450g",
        "dimensions": "25cm x 18cm x 2cm",
        "binding": "Paperback",
        "printType": "Color",
        "paperQuality": "High Quality"
      },
      "shipping": {
        "freeShippingEligible": true,
        "estimatedDelivery": "3-5 business days",
        "weight": 450
      },
      "seo": {
        "slug": "complete-mathematics-class-10-cbse",
        "metaTitle": "Complete Mathematics for Class 10 - CBSE Textbook",
        "metaDescription": "Best mathematics textbook for Class 10 CBSE students."
      }
    }
  }
}
```

### 3. Get Featured Products

**Priority:** High (MVP)

```http
GET /products/featured
```

**Query Parameters:**

```
?type=bestseller&limit=8
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "bestsellers": [
      {
        "id": "prod_1234567890",
        "title": "Complete Mathematics for Class 10",
        "price": 350,
        "originalPrice": 400,
        "image": "https://cdn.rgpublication.com/products/math-class10-cover.jpg",
        "rating": 4.8,
        "subject": "Mathematics",
        "class": 10,
        "featured": "bestseller"
      }
    ],
    "trending": [
      {
        "id": "prod_2345678901",
        "title": "Advanced Physics for Class 12",
        "price": 450,
        "image": "https://cdn.rgpublication.com/products/physics-class12-cover.jpg",
        "rating": 4.9,
        "subject": "Science",
        "class": 12,
        "featured": "trending"
      }
    ],
    "newArrivals": [
      {
        "id": "prod_3456789012",
        "title": "Chemistry Lab Manual Class 11",
        "price": 280,
        "image": "https://cdn.rgpublication.com/products/chemistry-lab-class11-cover.jpg",
        "rating": 4.7,
        "subject": "Science",
        "class": 11,
        "featured": "new-arrival"
      }
    ]
  }
}
```

---

## Shopping Cart

### 1. Get Cart

**Priority:** High (MVP)

```http
GET /cart
```

**Request Headers:**

```json
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "cart": {
      "id": "cart_1234567890",
      "userId": "usr_1234567890",
      "items": [
        {
          "id": "cart_item_001",
          "productId": "prod_1234567890",
          "product": {
            "id": "prod_1234567890",
            "title": "Complete Mathematics for Class 10",
            "price": 350,
            "originalPrice": 400,
            "image": "https://cdn.rgpublication.com/products/math-class10-cover.jpg",
            "subject": "Mathematics",
            "class": 10,
            "inStock": true,
            "stockQuantity": 150
          },
          "quantity": 2,
          "unitPrice": 350,
          "totalPrice": 700,
          "addedAt": "2024-01-15T10:30:00Z"
        }
      ],
      "summary": {
        "itemCount": 2,
        "subtotal": 700,
        "shipping": 0,
        "tax": 126,
        "discount": 0,
        "total": 826,
        "currency": "INR",
        "freeShippingEligible": true,
        "freeShippingThreshold": 500
      },
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T11:15:00Z"
    }
  }
}
```

### 2. Add Item to Cart

**Priority:** High (MVP)

```http
POST /cart/items
```

**Request Headers:**

```json
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "Content-Type": "application/json"
}
```

**Request Body:**

```json
{
  "productId": "prod_1234567890",
  "quantity": 2
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "message": "Item added to cart successfully",
  "data": {
    "cartItem": {
      "id": "cart_item_003",
      "productId": "prod_1234567890",
      "quantity": 2,
      "unitPrice": 350,
      "totalPrice": 700,
      "addedAt": "2024-01-15T12:00:00Z"
    },
    "cartSummary": {
      "itemCount": 4,
      "subtotal": 1400,
      "total": 1552
    }
  }
}
```

### 3. Update Cart Item

**Priority:** High (MVP)

```http
PUT /cart/items/{cartItemId}
```

**Request Body:**

```json
{
  "quantity": 3
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Cart item updated successfully",
  "data": {
    "cartItem": {
      "id": "cart_item_001",
      "quantity": 3,
      "totalPrice": 1050
    },
    "cartSummary": {
      "itemCount": 5,
      "subtotal": 1750,
      "total": 1940
    }
  }
}
```

### 4. Remove Cart Item

**Priority:** High (MVP)

```http
DELETE /cart/items/{cartItemId}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Item removed from cart successfully",
  "data": {
    "cartSummary": {
      "itemCount": 3,
      "subtotal": 1050,
      "total": 1166
    }
  }
}
```

### 5. Sync Cart (for localStorage integration)

**Priority:** High (MVP)

```http
POST /cart/sync
```

**Request Body:**

```json
{
  "items": [
    {
      "productId": "prod_1234567890",
      "quantity": 2
    },
    {
      "productId": "prod_2345678901",
      "quantity": 1
    }
  ]
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Cart synchronized successfully",
  "data": {
    "cart": {
      "id": "cart_1234567890",
      "items": [
        {
          "id": "cart_item_001",
          "productId": "prod_1234567890",
          "quantity": 2,
          "unitPrice": 350,
          "totalPrice": 700
        }
      ],
      "summary": {
        "itemCount": 3,
        "subtotal": 1150,
        "total": 1357
      }
    }
  }
}
```

---

## Search & Filter

### 1. Search Products

**Priority:** High (MVP)

```http
GET /search/products
```

**Query Parameters:**

```
?q=mathematics
&subject=Mathematics
&class=10
&type=Textbook
&featured=bestseller
&priceMin=200
&priceMax=500
&page=1
&limit=20
&sortBy=relevance
&sortOrder=desc
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "query": "mathematics",
    "results": [
      {
        "id": "prod_1234567890",
        "title": "Complete Mathematics for Class 10",
        "description": "Comprehensive mathematics textbook covering all CBSE syllabus topics",
        "price": 350,
        "originalPrice": 400,
        "image": "https://cdn.rgpublication.com/products/math-class10-cover.jpg",
        "subject": "Mathematics",
        "class": 10,
        "type": "Textbook",
        "featured": "bestseller",
        "rating": 4.8,
        "inStock": true,
        "relevanceScore": 0.95,
        "matchedFields": ["title", "description", "tags"]
      }
    ],
    "suggestions": {
      "didYouMean": "mathematics class 10",
      "relatedQueries": [
        "mathematics class 10 cbse",
        "mathematics practice book",
        "mathematics solutions"
      ]
    },
    "filters": {
      "subjects": [
        {
          "value": "Mathematics",
          "count": 45,
          "selected": true
        },
        {
          "value": "Science",
          "count": 23,
          "selected": false
        }
      ],
      "classes": [
        {
          "value": 10,
          "count": 15,
          "selected": true
        }
      ],
      "types": [
        {
          "value": "Textbook",
          "count": 25,
          "selected": true
        }
      ],
      "featured": [
        {
          "value": "bestseller",
          "count": 8,
          "selected": true
        }
      ]
    },
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalItems": 45,
      "itemsPerPage": 20
    },
    "searchTime": 0.045
  }
}
```

---

## Order Management

### 1. Create Order

**Priority:** High (MVP)

```http
POST /orders
```

**Request Headers:**

```json
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "Content-Type": "application/json"
}
```

**Request Body:**

```json
{
  "items": [
    {
      "productId": "prod_1234567890",
      "quantity": 2,
      "unitPrice": 350
    }
  ],
  "shippingAddress": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phone": "+91-9876543210",
    "addressLine1": "123 Main Street",
    "addressLine2": "Apartment 4B",
    "city": "Mumbai",
    "state": "Maharashtra",
    "postalCode": "400001",
    "country": "India"
  },
  "billingAddress": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phone": "+91-9876543210",
    "addressLine1": "123 Main Street",
    "addressLine2": "Apartment 4B",
    "city": "Mumbai",
    "state": "Maharashtra",
    "postalCode": "400001",
    "country": "India"
  },
  "paymentMethod": "razorpay",
  "couponCode": "SAVE10"
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "order": {
      "id": "ord_1234567890",
      "orderNumber": "RG-2024-001234",
      "userId": "usr_1234567890",
      "status": "pending",
      "items": [
        {
          "id": "order_item_001",
          "productId": "prod_1234567890",
          "title": "Complete Mathematics for Class 10",
          "quantity": 2,
          "unitPrice": 350,
          "totalPrice": 700
        }
      ],
      "summary": {
        "subtotal": 700,
        "shipping": 0,
        "tax": 126,
        "discount": 70,
        "total": 756,
        "currency": "INR"
      },
      "shippingAddress": {
        "firstName": "John",
        "lastName": "Doe",
        "addressLine1": "123 Main Street",
        "city": "Mumbai",
        "state": "Maharashtra",
        "postalCode": "400001",
        "country": "India"
      },
      "paymentMethod": "razorpay",
      "paymentStatus": "pending",
      "estimatedDelivery": "2024-01-20T00:00:00Z",
      "createdAt": "2024-01-15T12:00:00Z"
    },
    "paymentDetails": {
      "razorpayOrderId": "order_razorpay_123456",
      "amount": 756,
      "currency": "INR"
    }
  }
}
```

### 2. Get Order by ID

**Priority:** High (MVP)

```http
GET /orders/{orderId}
```

**Request Headers:**

```json
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "order": {
      "id": "ord_1234567890",
      "orderNumber": "RG-2024-001234",
      "userId": "usr_1234567890",
      "status": "confirmed",
      "items": [
        {
          "id": "order_item_001",
          "productId": "prod_1234567890",
          "title": "Complete Mathematics for Class 10",
          "image": "https://cdn.rgpublication.com/products/math-class10-cover.jpg",
          "quantity": 2,
          "unitPrice": 350,
          "totalPrice": 700
        }
      ],
      "summary": {
        "subtotal": 700,
        "shipping": 0,
        "tax": 126,
        "discount": 70,
        "total": 756,
        "currency": "INR"
      },
      "shippingAddress": {
        "firstName": "John",
        "lastName": "Doe",
        "addressLine1": "123 Main Street",
        "city": "Mumbai",
        "state": "Maharashtra",
        "postalCode": "400001",
        "country": "India"
      },
      "tracking": {
        "trackingNumber": "TRK123456789",
        "carrier": "Blue Dart",
        "status": "in_transit",
        "estimatedDelivery": "2024-01-20T00:00:00Z"
      },
      "paymentMethod": "razorpay",
      "paymentStatus": "completed",
      "timeline": [
        {
          "status": "pending",
          "timestamp": "2024-01-15T12:00:00Z",
          "description": "Order placed"
        },
        {
          "status": "confirmed",
          "timestamp": "2024-01-15T12:30:00Z",
          "description": "Payment confirmed"
        },
        {
          "status": "processing",
          "timestamp": "2024-01-16T09:00:00Z",
          "description": "Order being prepared"
        }
      ],
      "createdAt": "2024-01-15T12:00:00Z",
      "updatedAt": "2024-01-16T09:00:00Z"
    }
  }
}
```

---

## User Profile

### 1. Get User Profile

**Priority:** Medium

```http
GET /users/profile
```

**Request Headers:**

```json
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "usr_1234567890",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "phone": "+91-9876543210",
      "dateOfBirth": "1995-06-15",
      "role": "student",
      "avatar": "https://cdn.rgpublication.com/avatars/user_1234567890.jpg",
      "preferences": {
        "subjects": ["Mathematics", "Science"],
        "classes": [10, 11],
        "language": "en",
        "notifications": {
          "email": true,
          "sms": false,
          "push": true
        }
      },
      "addresses": [
        {
          "id": "addr_001",
          "type": "home",
          "firstName": "John",
          "lastName": "Doe",
          "addressLine1": "123 Main Street",
          "addressLine2": "Apartment 4B",
          "city": "Mumbai",
          "state": "Maharashtra",
          "postalCode": "400001",
          "country": "India",
          "isDefault": true
        }
      ],
      "stats": {
        "totalOrders": 15,
        "totalSpent": 12500,
        "wishlistItems": 8,
        "reviewsWritten": 5
      },
      "isEmailVerified": true,
      "isPhoneVerified": false,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  }
}
```

### 2. Update User Profile

**Priority:** Medium

```http
PUT /users/profile
```

**Request Body:**

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+91-9876543210",
  "dateOfBirth": "1995-06-15",
  "preferences": {
    "subjects": ["Mathematics", "Science", "English"],
    "classes": [10, 11, 12],
    "language": "en",
    "notifications": {
      "email": true,
      "sms": true,
      "push": true
    }
  }
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "user": {
      "id": "usr_1234567890",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "phone": "+91-9876543210",
      "preferences": {
        "subjects": ["Mathematics", "Science", "English"],
        "classes": [10, 11, 12],
        "language": "en"
      },
      "updatedAt": "2024-01-15T16:45:00Z"
    }
  }
}
```

### 3. Get User Orders

**Priority:** Medium

```http
GET /users/orders
```

**Query Parameters:**

```
?page=1&limit=10&status=completed
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "id": "ord_1234567890",
        "orderNumber": "RG-2024-001234",
        "status": "delivered",
        "total": 756,
        "currency": "INR",
        "itemCount": 2,
        "orderDate": "2024-01-15T12:00:00Z",
        "deliveryDate": "2024-01-20T14:30:00Z",
        "items": [
          {
            "id": "order_item_001",
            "productId": "prod_1234567890",
            "title": "Complete Mathematics for Class 10",
            "image": "https://cdn.rgpublication.com/products/math-class10-cover.jpg",
            "quantity": 2,
            "unitPrice": 350
          }
        ]
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 2,
      "totalItems": 15,
      "itemsPerPage": 10
    }
  }
}
```

---

## Content Management

### 1. Get Homepage Content

**Priority:** High (MVP)

```http
GET /content/homepage
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "hero": {
      "title": "Quality Educational Books for Every Student",
      "subtitle": "Discover comprehensive textbooks and study materials designed to help students excel in Mathematics and Science from Class 5 to Class 12.",
      "ctaText": "Explore Books",
      "ctaLink": "/shop",
      "backgroundImage": "https://cdn.rgpublication.com/hero/hero-bg.jpg",
      "features": [
        "CBSE Curriculum Aligned",
        "Expert Authors",
        "Comprehensive Coverage",
        "Practice Questions"
      ]
    },
    "featuredSections": {
      "bestsellers": {
        "title": "Best Selling Books",
        "subtitle": "Most popular books among students and teachers",
        "enabled": true,
        "limit": 8
      },
      "trending": {
        "title": "Trending Products",
        "subtitle": "Currently popular educational materials",
        "enabled": true,
        "limit": 8
      },
      "newArrivals": {
        "title": "New Arrivals",
        "subtitle": "Latest additions to our collection",
        "enabled": true,
        "limit": 8
      }
    },
    "testimonials": [
      {
        "id": "test_001",
        "name": "Priya Sharma",
        "role": "Class 10 Student",
        "content": "RG Publication books helped me score 95% in Mathematics. The explanations are clear and easy to understand.",
        "rating": 5,
        "image": "https://cdn.rgpublication.com/testimonials/priya.jpg"
      }
    ],
    "stats": {
      "studentsHelped": 50000,
      "booksPublished": 200,
      "yearsExperience": 15,
      "successRate": 98
    }
  }
}
```

---

## Analytics & Tracking

### 1. Track Page View

**Priority:** Low

```http
POST /analytics/pageview
```

**Request Body:**

```json
{
  "page": "/shop",
  "title": "Educational Book Shop",
  "referrer": "https://google.com",
  "userAgent": "Mozilla/5.0...",
  "sessionId": "sess_1234567890"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Page view tracked"
}
```

### 2. Track Product View

**Priority:** Medium

```http
POST /analytics/product-view
```

**Request Body:**

```json
{
  "productId": "prod_1234567890",
  "source": "search",
  "position": 1,
  "sessionId": "sess_1234567890"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Product view tracked"
}
```

### 3. Track Add to Cart

**Priority:** Medium

```http
POST /analytics/add-to-cart
```

**Request Body:**

```json
{
  "productId": "prod_1234567890",
  "quantity": 2,
  "price": 350,
  "source": "product_page",
  "sessionId": "sess_1234567890"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Add to cart tracked"
}
```

---

## File Upload

### 1. Upload Product Image

**Priority:** Medium (Admin)

```http
POST /upload/product-image
```

**Request Headers:**

```json
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "Content-Type": "multipart/form-data"
}
```

**Request Body (Form Data):**

```
file: [image file]
productId: prod_1234567890
type: cover
alt: Complete Mathematics for Class 10 - Cover
```

**Response (201 Created):**

```json
{
  "success": true,
  "message": "Image uploaded successfully",
  "data": {
    "image": {
      "id": "img_001",
      "url": "https://cdn.rgpublication.com/products/math-class10-cover.jpg",
      "alt": "Complete Mathematics for Class 10 - Cover",
      "type": "cover",
      "size": 245760,
      "dimensions": {
        "width": 400,
        "height": 600
      },
      "uploadedAt": "2024-01-15T16:45:00Z"
    }
  }
}
```

### 2. Upload User Avatar

**Priority:** Low

```http
POST /upload/avatar
```

**Request Headers:**

```json
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "Content-Type": "multipart/form-data"
}
```

**Request Body (Form Data):**

```
file: [image file]
```

**Response (201 Created):**

```json
{
  "success": true,
  "message": "Avatar uploaded successfully",
  "data": {
    "avatar": {
      "url": "https://cdn.rgpublication.com/avatars/user_1234567890.jpg",
      "size": 102400,
      "uploadedAt": "2024-01-15T16:45:00Z"
    }
  }
}
```

---

## Database Schema

### Core Tables

#### Users Table

```sql
CREATE TABLE users (
  id VARCHAR(20) PRIMARY KEY,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  date_of_birth DATE,
  role ENUM('student', 'teacher', 'parent', 'admin') DEFAULT 'student',
  avatar_url VARCHAR(255),
  is_email_verified BOOLEAN DEFAULT FALSE,
  is_phone_verified BOOLEAN DEFAULT FALSE,
  preferences JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role)
);
```

#### Products Table

```sql
CREATE TABLE products (
  id VARCHAR(20) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  long_description TEXT,
  subject ENUM('Mathematics', 'Science', 'English', 'Social Science') NOT NULL,
  class TINYINT NOT NULL,
  type ENUM('Textbook', 'Practice Book', 'Lab Manual', 'Advanced Guide') NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),
  currency VARCHAR(3) DEFAULT 'INR',
  isbn VARCHAR(20),
  author VARCHAR(100),
  publisher VARCHAR(100) DEFAULT 'RG Publication',
  edition VARCHAR(10),
  pages INT,
  language VARCHAR(20) DEFAULT 'English',
  featured ENUM('bestseller', 'trending', 'new-arrival'),
  in_stock BOOLEAN DEFAULT TRUE,
  stock_quantity INT DEFAULT 0,
  tags JSON,
  specifications JSON,
  seo_slug VARCHAR(255) UNIQUE,
  meta_title VARCHAR(255),
  meta_description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_subject_class (subject, class),
  INDEX idx_featured (featured),
  INDEX idx_in_stock (in_stock),
  INDEX idx_seo_slug (seo_slug)
);
```

#### Orders Table

```sql
CREATE TABLE orders (
  id VARCHAR(20) PRIMARY KEY,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  user_id VARCHAR(20) NOT NULL,
  status ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
  subtotal DECIMAL(10,2) NOT NULL,
  shipping DECIMAL(10,2) DEFAULT 0,
  tax DECIMAL(10,2) DEFAULT 0,
  discount DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'INR',
  payment_method VARCHAR(50),
  payment_status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
  shipping_address JSON,
  billing_address JSON,
  tracking_number VARCHAR(100),
  estimated_delivery DATE,
  delivered_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_order_number (order_number)
);
```

#### Cart Table

```sql
CREATE TABLE carts (
  id VARCHAR(20) PRIMARY KEY,
  user_id VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_user_id (user_id)
);
```

#### Cart Items Table

```sql
CREATE TABLE cart_items (
  id VARCHAR(20) PRIMARY KEY,
  cart_id VARCHAR(20) NOT NULL,
  product_id VARCHAR(20) NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id),
  INDEX idx_cart_id (cart_id),
  INDEX idx_product_id (product_id),
  UNIQUE KEY unique_cart_product (cart_id, product_id)
);
```

---

## Implementation Priority

### Phase 1: MVP (High Priority)

**Timeline: 4-6 weeks**

#### Authentication & Core Features

- ✅ User Registration (`POST /auth/register`)
- ✅ User Login (`POST /auth/login`)
- ✅ Get All Products (`GET /products`)
- ✅ Get Product by ID (`GET /products/{productId}`)
- ✅ Get Featured Products (`GET /products/featured`)
- ✅ Search Products (`GET /search/products`)

#### Shopping Cart & Orders

- ✅ Get Cart (`GET /cart`)
- ✅ Add Item to Cart (`POST /cart/items`)
- ✅ Update Cart Item (`PUT /cart/items/{cartItemId}`)
- ✅ Remove Cart Item (`DELETE /cart/items/{cartItemId}`)
- ✅ Sync Cart (`POST /cart/sync`)
- ✅ Create Order (`POST /orders`)
- ✅ Get Order by ID (`GET /orders/{orderId}`)

#### Content Management

- ✅ Get Homepage Content (`GET /content/homepage`)

### Phase 2: Enhanced Features (Medium Priority)

**Timeline: 6-8 weeks**

#### User Management

- 🔄 Password Reset (`POST /auth/password-reset`)
- 🔄 Email Verification (`POST /auth/verify-email`)
- 🔄 Get User Profile (`GET /users/profile`)
- 🔄 Update User Profile (`PUT /users/profile`)
- 🔄 Get User Orders (`GET /users/orders`)

#### Product Features

- 🔄 Get Product Reviews (`GET /products/{productId}/reviews`)
- 🔄 Add Product Review (`POST /products/{productId}/reviews`)
- 🔄 Update Product Stock (`PUT /products/{productId}/stock`)

#### Search & Analytics

- 🔄 Search Suggestions (`GET /search/suggestions`)
- 🔄 Track Product View (`POST /analytics/product-view`)
- 🔄 Track Add to Cart (`POST /analytics/add-to-cart`)

#### File Upload

- 🔄 Upload Product Image (`POST /upload/product-image`)

### Phase 3: Advanced Features (Low Priority)

**Timeline: 8-10 weeks**

#### Analytics & Optimization

- ⏳ Popular Searches (`GET /search/popular`)
- ⏳ Search Analytics (`POST /search/analytics`)
- ⏳ Track Page View (`POST /analytics/pageview`)
- ⏳ Upload User Avatar (`POST /upload/avatar`)

#### Additional Features

- ⏳ Token Refresh (`POST /auth/refresh`) - Optional since tokens don't expire
- ⏳ Logout (`POST /auth/logout`)
- ⏳ Clear Cart (`DELETE /cart`)
- ⏳ Apply Coupon (`POST /cart/coupon`)

---

## Security & Performance

### Security Measures

#### Authentication & Authorization

- **JWT Tokens**: Secure token-based authentication (non-expiring for user convenience)
- **Password Hashing**: bcrypt with salt rounds ≥ 12
- **Rate Limiting**: 1000 requests/hour per user, 100 requests/minute per IP
- **Input Validation**: Comprehensive validation for all endpoints
- **SQL Injection Prevention**: Parameterized queries only
- **XSS Protection**: Input sanitization and output encoding
- **Token Security**: Tokens stored securely, optional refresh endpoint for rotation

#### Data Protection

- **HTTPS Only**: All API endpoints require HTTPS
- **CORS Configuration**: Restricted to allowed origins
- **API Key Management**: Secure storage and rotation
- **Sensitive Data**: PII encryption at rest
- **Audit Logging**: All user actions logged

### Performance Optimizations

#### Caching Strategy

- **Redis Cache**: Product data, search results (TTL: 1 hour)
- **CDN**: Static assets and product images
- **Database Indexing**: Optimized indexes for frequent queries
- **Query Optimization**: Efficient database queries with pagination

#### Scalability

- **Database Connection Pooling**: Efficient connection management
- **Horizontal Scaling**: Load balancer ready architecture
- **Async Processing**: Background jobs for analytics and emails
- **Image Optimization**: Automatic compression and resizing

### Monitoring & Logging

#### Application Monitoring

- **Health Checks**: `/health` endpoint for service monitoring
- **Performance Metrics**: Response time, throughput tracking
- **Error Tracking**: Comprehensive error logging and alerting
- **Database Monitoring**: Query performance and connection health

#### Business Metrics

- **User Analytics**: Registration, login, conversion rates
- **Product Analytics**: Views, cart additions, purchase rates
- **Search Analytics**: Query performance, result relevance
- **Revenue Tracking**: Sales, order values, popular products

---

## Integration Guidelines

### Frontend Integration

#### Authentication Flow

```javascript
// Login example
const response = await fetch("/api/v1/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, password }),
});

const { data } = await response.json();
localStorage.setItem("accessToken", data.tokens.accessToken);
```

#### Cart Synchronization

```javascript
// Sync localStorage cart with server
const localCart = JSON.parse(localStorage.getItem("cart") || "[]");
await fetch("/api/v1/cart/sync", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ items: localCart }),
});
```

### Third-Party Integrations

#### Payment Gateway (Razorpay)

- **Order Creation**: Generate Razorpay order before payment
- **Payment Verification**: Verify payment signature on backend
- **Webhook Handling**: Process payment status updates

#### Shipping Partners

- **Rate Calculation**: Real-time shipping cost calculation
- **Tracking Integration**: Automatic tracking number updates
- **Delivery Notifications**: SMS/Email notifications

#### Email Service (SendGrid/AWS SES)

- **Transactional Emails**: Order confirmations, shipping updates
- **Marketing Emails**: Newsletter, promotional campaigns
- **Template Management**: Dynamic email templates

---

**Document Version**: 1.0
**Last Updated**: January 15, 2024
**Total Endpoints**: 45+
**Estimated Development Time**: 8-10 weeks

This comprehensive API documentation provides all the necessary endpoints to replace the current static/mock data implementations in the RG Publication website. The APIs are designed to support the Featured Collections system, cart functionality, search capabilities, and all existing website features while providing a scalable foundation for future enhancements.
