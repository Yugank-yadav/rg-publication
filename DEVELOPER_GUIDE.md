# RG Publication - Complete Developer Guide

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Environment Setup](#environment-setup)
3. [Codebase Architecture](#codebase-architecture)
4. [Frontend Development](#frontend-development)
5. [Backend Development](#backend-development)
6. [Database Management](#database-management)
7. [API Integration](#api-integration)
8. [Common Development Tasks](#common-development-tasks)
9. [Code Patterns & Conventions](#code-patterns--conventions)
10. [Testing Guidelines](#testing-guidelines)
11. [Troubleshooting](#troubleshooting)

---

## 📖 Project Overview

**RG Publication** is a modern educational books e-commerce platform designed for the Indian market, serving students, teachers, and parents with quality educational resources.

### Technology Stack

- **Frontend**: Next.js 15.3.3, React 18, Tailwind CSS, Framer Motion
- **Backend**: Node.js, Express.js, MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **State Management**: React Context API
- **Styling**: Tailwind CSS with custom theme (#a8f1ff)
- **Animations**: Framer Motion for smooth interactions

### Key Features

- 🔐 User authentication (Student, Teacher, Parent, Admin roles)
- 📚 Product catalog with advanced filtering
- 🛒 Shopping cart with persistence
- 💳 Order management system
- ❤️ Wishlist functionality
- 🔍 Advanced search capabilities
- 📱 Fully responsive design
- 🎨 Interactive 3D hero section
- 📊 Admin dashboard (in development)

---

## 🚀 Environment Setup

### Prerequisites

```bash
# Required software
Node.js 18+ (LTS recommended)
MongoDB 4.4+
Git
VS Code (recommended)
```

### Initial Setup

```bash
# 1. Clone the repository
git clone <repository-url>
cd rg-publication

# 2. Install frontend dependencies
npm install

# 3. Install backend dependencies
cd backend
npm install
cd ..

# 4. Create environment files
cp .env.example .env.local
cp backend/.env.example backend/.env
```

### Environment Variables

#### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000
```

#### Backend (backend/.env)

```env
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000

# Database
MONGODB_URI=mongodb://localhost:27017/rg-publication

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=never

# File Upload (optional)
UPLOAD_DIR=uploads
MAX_FILE_SIZE=5242880
```

### Database Setup

```bash
# 1. Start MongoDB service
# Windows: Start MongoDB service from Services
# macOS: brew services start mongodb-community
# Linux: sudo systemctl start mongod

# 2. Seed the database with sample data
cd backend
npm run seed

# This creates:
# - 6 sample products (Math & Science books)
# - 1 admin user (admin@rgpublication.com / admin123)
```

### Running the Application

```bash
# Terminal 1: Start backend server
cd backend
npm run dev
# Server runs on http://localhost:5000

# Terminal 2: Start frontend development server
npm run dev
# Frontend runs on http://localhost:3000
```

### Development Tools Setup

```bash
# Install recommended VS Code extensions
# - ES7+ React/Redux/React-Native snippets
# - Tailwind CSS IntelliSense
# - MongoDB for VS Code
# - Thunder Client (API testing)
```

---

## 🏗️ Codebase Architecture

### Project Structure

```
rg-publication/
├── app/                    # Next.js App Router pages
│   ├── globals.css        # Global styles and Tailwind imports
│   ├── layout.js          # Root layout with providers
│   ├── page.js            # Homepage
│   ├── about/             # About page
│   ├── auth/              # Authentication pages
│   │   ├── login/         # Login page
│   │   └── register/      # Registration page
│   ├── cart/              # Shopping cart page
│   ├── contact/           # Contact page
│   ├── profile/           # User profile page
│   ├── search/            # Search results page
│   ├── shop/              # Product pages
│   │   ├── page.js        # Product listing
│   │   └── [id]/          # Product detail page
│   └── wishlist/          # Wishlist page
├── components/            # Reusable React components
│   ├── avatar.js          # User avatar component
│   ├── dropdown.js        # Dropdown menu system
│   ├── navbar.js          # Navigation components
│   ├── main-navbar.js     # Main site navigation
│   ├── hero-section.js    # Interactive 3D hero
│   ├── best-selling-books.js
│   ├── trending-products.js
│   ├── new-arrivals.js
│   ├── testimonials.js
│   ├── contact-us.js
│   ├── footer.js
│   ├── ErrorBoundary.js   # Error handling
│   ├── LoadingSpinner.js  # Loading states
│   └── index.js           # Component exports
├── contexts/              # React Context providers
│   ├── AuthContext.js     # Authentication state
│   ├── CartContext.js     # Shopping cart state
│   ├── WishlistContext.js # Wishlist state
│   └── ToastContext.js    # Notification system
├── hooks/                 # Custom React hooks
│   └── useNetworkStatus.js
├── lib/                   # Utility libraries
│   └── api.js             # API client and endpoints
├── data/                  # Static data (fallbacks)
│   └── products.js        # Sample product data
├── public/                # Static assets
├── backend/               # Node.js/Express backend
│   ├── server.js          # Main server file
│   ├── models/            # MongoDB schemas
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Cart.js
│   │   ├── Order.js
│   │   ├── Wishlist.js
│   │   ├── Review.js
│   │   └── Contact.js
│   ├── routes/            # API route handlers
│   │   ├── auth.js        # Authentication routes
│   │   ├── products.js    # Product management
│   │   ├── cart.js        # Cart operations
│   │   ├── orders.js      # Order management
│   │   ├── users.js       # User management
│   │   ├── search.js      # Search functionality
│   │   ├── wishlist.js    # Wishlist operations
│   │   ├── contact.js     # Contact form
│   │   ├── admin.js       # Admin operations
│   │   └── analytics.js   # Analytics data
│   ├── middleware/        # Express middleware
│   │   ├── auth.js        # Authentication middleware
│   │   ├── validation.js  # Input validation
│   │   └── upload.js      # File upload handling
│   ├── utils/             # Utility functions
│   └── scripts/           # Database scripts
│       └── seed.js        # Database seeding
├── package.json           # Frontend dependencies
├── tailwind.config.js     # Tailwind CSS configuration
├── next.config.js         # Next.js configuration
└── README.md              # Project documentation
```

### Architecture Principles

#### 1. Separation of Concerns

- **Frontend**: UI/UX, state management, user interactions
- **Backend**: Business logic, data validation, API endpoints
- **Database**: Data persistence and relationships

#### 2. Component-Based Architecture

- **Atomic Design**: Small, reusable components
- **Context Providers**: Global state management
- **Custom Hooks**: Reusable logic extraction

#### 3. API-First Design

- **RESTful APIs**: Consistent endpoint structure
- **Error Handling**: Standardized error responses
- **Validation**: Input validation on both frontend and backend

---

## 🎨 Frontend Development

### Component Structure

#### Basic Component Template

```jsx
"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

const ComponentName = ({ prop1, prop2, ...props }) => {
  const [state, setState] = useState(initialValue);

  useEffect(() => {
    // Side effects here
  }, [dependencies]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="component-styles"
      {...props}
    >
      {/* Component content */}
    </motion.div>
  );
};

export default ComponentName;
```

#### Key Components Breakdown

##### 1. MainNavbar (`components/main-navbar.js`)

**Purpose**: Primary site navigation with authentication integration

**Props**: None (uses contexts)

**Key Features**:

- Responsive design with mobile menu
- User authentication status display
- Cart item count indicator
- Active page highlighting

**Usage Example**:

```jsx
// Already included in layout.js
import MainNavbar from "@/components/main-navbar";

<MainNavbar />;
```

**Modification Guide**:

```jsx
// To add new navigation items
const navigationItems = [
  { name: "Home", href: "/" },
  { name: "Shop", href: "/shop" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
  // Add new item here
  { name: "New Page", href: "/new-page" },
];
```

##### 2. Product Display Components

**BestSellingBooks** (`components/best-selling-books.js`)

```jsx
// API Integration
useEffect(() => {
  const loadBestsellingBooks = async () => {
    try {
      const response = await productAPI.getFeaturedProducts("bestseller");
      if (response.success) {
        setBooks(response.data.bestsellers);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  loadBestsellingBooks();
}, []);
```

**Props**: None (fetches data internally)

**Modification Guide**:

```jsx
// To change the number of displayed products
const PRODUCTS_TO_SHOW = 8; // Change this value

// To modify the grid layout
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  {/* Change lg:grid-cols-4 to desired column count */}
</div>;
```

##### 3. HeroSection (`components/hero-section.js`)

**Purpose**: Interactive 3D hero section with cursor tracking

**Key Features**:

- 3D book animation with Framer Motion
- Cursor tracking for interactive effects
- Responsive design

**Modification Guide**:

```jsx
// To adjust 3D rotation sensitivity
const rotateX = (mouseY - centerY) * 0.1; // Change 0.1 for sensitivity
const rotateY = (mouseX - centerX) * 0.1;

// To change the book image
<img
  src="/path/to/new-book-image.jpg" // Update image path
  alt="Interactive Book"
  className="w-full h-full object-cover"
/>;
```

### State Management with Contexts

#### AuthContext Usage

```jsx
import { useAuth } from "@/contexts/AuthContext";

const MyComponent = () => {
  const {
    user, // Current user object
    isLoading, // Loading state
    isAuthenticated, // Authentication status
    login, // Login function
    logout, // Logout function
    register, // Registration function
  } = useAuth();

  const handleLogin = async (credentials) => {
    const result = await login(credentials);
    if (result.success) {
      // Handle successful login
    } else {
      // Handle login error
    }
  };

  return (
    <div>
      {isAuthenticated ? (
        <p>Welcome, {user.firstName}!</p>
      ) : (
        <button onClick={() => handleLogin(credentials)}>Login</button>
      )}
    </div>
  );
};
```

#### CartContext Usage

```jsx
import { useCart } from "@/contexts/CartContext";

const ProductCard = ({ product }) => {
  const { addToCart, cartItems, isLoading } = useCart();

  const handleAddToCart = async () => {
    const result = await addToCart(product.id, 1);
    if (result.success) {
      // Item added successfully
    }
  };

  const isInCart = cartItems.some((item) => item.productId === product.id);

  return (
    <div className="product-card">
      <h3>{product.title}</h3>
      <p>₹{product.price}</p>
      <button
        onClick={handleAddToCart}
        disabled={isLoading || isInCart}
        className={`btn ${isInCart ? "btn-disabled" : "btn-primary"}`}
      >
        {isInCart ? "In Cart" : "Add to Cart"}
      </button>
    </div>
  );
};
```

### Styling Guidelines

#### Tailwind CSS Patterns

```jsx
// Card component pattern
<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">

// Button patterns
<button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
  Primary Button
</button>

<button className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors">
  Secondary Button
</button>

// Input patterns
<input
  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
  type="text"
  placeholder="Enter text..."
/>

// Theme color usage
<div className="bg-[#a8f1ff] text-blue-900"> {/* Primary theme color */}
```

#### Animation Patterns with Framer Motion

```jsx
// Page transitions
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -20 }}
  transition={{ duration: 0.3 }}
>

// Hover animations
<motion.div
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  transition={{ type: "spring", stiffness: 300 }}
>

// Stagger animations for lists
<motion.div
  variants={{
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }}
  initial="hidden"
  animate="show"
>
  {items.map((item, index) => (
    <motion.div
      key={index}
      variants={{
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
      }}
    >
      {item}
    </motion.div>
  ))}
</motion.div>
```

---

## ⚙️ Backend Development

### Server Structure

#### Main Server File (`backend/server.js`)

```javascript
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
require("dotenv").config();

const app = express();

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/v1/auth", require("./routes/auth"));
app.use("/api/v1/products", require("./routes/products"));
app.use("/api/v1/cart", require("./routes/cart"));
app.use("/api/v1/orders", require("./routes/orders"));
// ... other routes

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: "INTERNAL_SERVER_ERROR",
    message: "Something went wrong!",
    timestamp: new Date().toISOString(),
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### Database Models

#### User Model (`backend/models/User.js`)

```javascript
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      unique: true,
      required: true,
      default: () =>
        `user_${Date.now()}${Math.random().toString(36).substr(2, 9)}`,
    },
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      maxlength: [50, "First name cannot exceed 50 characters"],
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      maxlength: [50, "Last name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // Don't include password in queries by default
    },
    role: {
      type: String,
      enum: ["student", "teacher", "parent", "admin"],
      default: "student",
    },
    // ... other fields
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
```

#### Product Model (`backend/models/Product.js`)

```javascript
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      unique: true,
      required: true,
      default: () =>
        `prod_${Date.now()}${Math.random().toString(36).substr(2, 9)}`,
    },
    title: {
      type: String,
      required: [true, "Product title is required"],
      trim: true,
      maxlength: [255, "Title cannot exceed 255 characters"],
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
      trim: true,
    },
    subject: {
      type: String,
      required: [true, "Subject is required"],
      enum: ["Mathematics", "Science", "English", "Social Science"],
    },
    class: {
      type: Number,
      required: [true, "Class is required"],
      min: [5, "Class must be between 5 and 12"],
      max: [12, "Class must be between 5 and 12"],
    },
    type: {
      type: String,
      required: [true, "Product type is required"],
      enum: ["Textbook", "Practice Book", "Lab Manual", "Advanced Guide"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    originalPrice: {
      type: Number,
      min: [0, "Original price cannot be negative"],
    },
    author: {
      type: String,
      required: [true, "Author is required"],
      trim: true,
    },
    publisher: {
      type: String,
      default: "RG Publication",
      trim: true,
    },
    isbn: {
      type: String,
      unique: true,
      sparse: true,
    },
    featured: {
      type: String,
      enum: ["bestseller", "trending", "new-arrival"],
      default: null,
    },
    inStock: {
      type: Boolean,
      default: true,
    },
    stockQuantity: {
      type: Number,
      default: 0,
      min: [0, "Stock quantity cannot be negative"],
    },
    images: [
      {
        id: String,
        url: String,
        alt: String,
      },
    ],
    rating: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      count: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for performance
productSchema.index({ subject: 1, class: 1 });
productSchema.index({ featured: 1 });
productSchema.index({ title: "text", description: "text" });

module.exports = mongoose.model("Product", productSchema);
```

### API Route Structure

#### Authentication Routes (`backend/routes/auth.js`)

```javascript
const express = require("express");
const User = require("../models/User");
const { generateToken } = require("../middleware/auth");
const { body, validationResult } = require("express-validator");

const router = express.Router();

// Register new user
router.post(
  "/register",
  [
    body("firstName")
      .trim()
      .isLength({ min: 1 })
      .withMessage("First name is required"),
    body("lastName")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Last name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],
  async (req, res) => {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: "VALIDATION_ERROR",
          message: "Invalid input data",
          details: errors.array(),
          timestamp: new Date().toISOString(),
        });
      }

      const {
        firstName,
        lastName,
        email,
        password,
        role = "student",
      } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          error: "USER_EXISTS",
          message: "User with this email already exists",
          timestamp: new Date().toISOString(),
        });
      }

      // Create new user
      const user = new User({
        firstName,
        lastName,
        email,
        password,
        role,
      });

      await user.save();

      // Generate JWT token
      const token = generateToken(user.id);

      // Return user data (without password)
      const userData = user.toJSON();
      delete userData.password;

      res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: {
          user: userData,
          token,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({
        success: false,
        error: "INTERNAL_SERVER_ERROR",
        message: "Registration failed",
        timestamp: new Date().toISOString(),
      });
    }
  }
);

// Login user
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").isLength({ min: 1 }).withMessage("Password is required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: "VALIDATION_ERROR",
          message: "Invalid input data",
          details: errors.array(),
          timestamp: new Date().toISOString(),
        });
      }

      const { email, password } = req.body;

      // Find user and include password for comparison
      const user = await User.findOne({ email }).select("+password");
      if (!user) {
        return res.status(401).json({
          success: false,
          error: "INVALID_CREDENTIALS",
          message: "Invalid email or password",
          timestamp: new Date().toISOString(),
        });
      }

      // Check password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          error: "INVALID_CREDENTIALS",
          message: "Invalid email or password",
          timestamp: new Date().toISOString(),
        });
      }

      // Generate JWT token
      const token = generateToken(user.id);

      // Return user data (without password)
      const userData = user.toJSON();
      delete userData.password;

      res.status(200).json({
        success: true,
        message: "Login successful",
        data: {
          user: userData,
          token,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({
        success: false,
        error: "INTERNAL_SERVER_ERROR",
        message: "Login failed",
        timestamp: new Date().toISOString(),
      });
    }
  }
);

module.exports = router;
```

### Middleware

#### Authentication Middleware (`backend/middleware/auth.js`)

```javascript
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "never",
  });
};

// Verify JWT token middleware
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        error: "AUTHENTICATION_REQUIRED",
        message: "Access token is required",
        timestamp: new Date().toISOString(),
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ id: decoded.userId });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "INVALID_TOKEN",
        message: "Invalid or expired token",
        timestamp: new Date().toISOString(),
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: "AUTHENTICATION_ERROR",
      message: "Authentication failed",
      timestamp: new Date().toISOString(),
    });
  }
};

// Role-based authorization middleware
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "AUTHENTICATION_REQUIRED",
        message: "Authentication required",
        timestamp: new Date().toISOString(),
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: "INSUFFICIENT_PERMISSIONS",
        message: "Insufficient permissions for this action",
        timestamp: new Date().toISOString(),
      });
    }

    next();
  };
};

// Admin only middleware
const requireAdmin = requireRole(["admin"]);

module.exports = {
  generateToken,
  authenticateToken,
  requireRole,
  requireAdmin,
};
```

---

## 🗄️ Database Management

### MongoDB Connection

```javascript
// backend/server.js
const mongoose = require("mongoose");

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  });
```

### Database Seeding

```javascript
// backend/scripts/seed.js
const mongoose = require("mongoose");
const User = require("../models/User");
const Product = require("../models/Product");
require("dotenv").config();

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});

    // Create admin user
    const adminUser = new User({
      firstName: "Admin",
      lastName: "User",
      email: "admin@rgpublication.com",
      password: "admin123",
      role: "admin",
    });
    await adminUser.save();

    // Create sample products
    const sampleProducts = [
      {
        title: "Mathematics Class 10 - NCERT",
        description: "Complete mathematics textbook for class 10 students",
        subject: "Mathematics",
        class: 10,
        type: "Textbook",
        price: 299,
        originalPrice: 399,
        author: "NCERT",
        featured: "bestseller",
        stockQuantity: 100,
        images: [
          {
            id: "img1",
            url: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=400&fit=crop&auto=format",
            alt: "Mathematics Class 10 Book",
          },
        ],
      },
      // ... more products
    ];

    await Product.insertMany(sampleProducts);

    console.log("Database seeded successfully");
    process.exit(0);
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
};

seedDatabase();
```

### Database Queries Examples

#### Finding Products with Filters

```javascript
// Get products with filters
const getProducts = async (filters) => {
  const query = {};

  // Subject filter
  if (filters.subject) {
    query.subject = filters.subject;
  }

  // Class filter
  if (filters.class) {
    query.class = parseInt(filters.class);
  }

  // Price range filter
  if (filters.minPrice || filters.maxPrice) {
    query.price = {};
    if (filters.minPrice) query.price.$gte = parseFloat(filters.minPrice);
    if (filters.maxPrice) query.price.$lte = parseFloat(filters.maxPrice);
  }

  // Text search
  if (filters.search) {
    query.$text = { $search: filters.search };
  }

  // Execute query with pagination
  const page = parseInt(filters.page) || 1;
  const limit = parseInt(filters.limit) || 12;
  const skip = (page - 1) * limit;

  const products = await Product.find(query)
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const total = await Product.countDocuments(query);

  return {
    products,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      itemsPerPage: limit,
    },
  };
};
```

#### Aggregation Pipeline Example

```javascript
// Get sales analytics
const getSalesAnalytics = async (startDate, endDate) => {
  const pipeline = [
    {
      $match: {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
        status: { $in: ["confirmed", "delivered"] },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
          day: { $dayOfMonth: "$createdAt" },
        },
        totalSales: { $sum: "$summary.total" },
        orderCount: { $sum: 1 },
        avgOrderValue: { $avg: "$summary.total" },
      },
    },
    {
      $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 },
    },
  ];

  return await Order.aggregate(pipeline);
};
```

---

## 🔌 API Integration

### Frontend API Client (`lib/api.js`)

#### Base API Configuration

```javascript
import axios from "axios";

// Create axios instance
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response.data; // Return only data part
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem("token");
      window.location.href = "/auth/login";
    }

    return Promise.reject({
      message: error.response?.data?.message || "An error occurred",
      status: error.response?.status,
      data: error.response?.data,
    });
  }
);
```

#### API Endpoint Functions

```javascript
// Authentication APIs
export const authAPI = {
  login: async (credentials) => {
    return await api.post("/auth/login", credentials);
  },

  register: async (userData) => {
    return await api.post("/auth/register", userData);
  },

  logout: async () => {
    return await api.post("/auth/logout");
  },
};

// Product APIs
export const productAPI = {
  getProducts: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return await api.get(`/products?${queryString}`);
  },

  getProduct: async (id) => {
    return await api.get(`/products/${id}`);
  },

  getFeaturedProducts: async (type = "bestsellers") => {
    return await api.get(`/products/featured?type=${type}`);
  },
};

// Cart APIs
export const cartAPI = {
  getCart: async () => {
    return await api.get("/cart");
  },

  addItem: async (productId, quantity) => {
    return await api.post("/cart/items", { productId, quantity });
  },

  updateItem: async (itemId, quantity) => {
    return await api.put(`/cart/items/${itemId}`, { quantity });
  },

  removeItem: async (itemId) => {
    return await api.delete(`/cart/items/${itemId}`);
  },

  syncCart: async (localCartItems) => {
    return await api.post("/cart/sync", { items: localCartItems });
  },
};
```

### Error Handling Patterns

#### API Error Handling

```javascript
// In React components
const handleAPICall = async () => {
  try {
    setIsLoading(true);
    const response = await productAPI.getProducts(filters);

    if (response.success) {
      setProducts(response.data.products);
    } else {
      setError(response.message || "Failed to load products");
    }
  } catch (error) {
    console.error("API Error:", error);
    setError(error.message || "An unexpected error occurred");
  } finally {
    setIsLoading(false);
  }
};
```

#### Retry Logic

```javascript
// Retry failed requests
const retryRequest = async (apiCall, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await apiCall();
    } catch (error) {
      if (i === maxRetries - 1) throw error;

      // Wait before retry (exponential backoff)
      await new Promise((resolve) =>
        setTimeout(resolve, Math.pow(2, i) * 1000)
      );
    }
  }
};

// Usage
const loadProducts = async () => {
  try {
    const response = await retryRequest(() => productAPI.getProducts());
    setProducts(response.data.products);
  } catch (error) {
    setError("Failed to load products after multiple attempts");
  }
};
```

---

## 🛠️ Common Development Tasks

### Adding a New Component

#### 1. Create Component File

```jsx
// components/new-component.js
"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

const NewComponent = ({ prop1, prop2, ...props }) => {
  const [state, setState] = useState(null);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="new-component-styles"
      {...props}
    >
      <h2 className="text-2xl font-bold text-gray-900">{prop1}</h2>
      <p className="text-gray-600">{prop2}</p>
    </motion.div>
  );
};

export default NewComponent;
```

#### 2. Export Component

```javascript
// components/index.js
export { default as NewComponent } from "./new-component";
```

#### 3. Use Component

```jsx
// In any page or component
import { NewComponent } from "@/components";

<NewComponent prop1="Title" prop2="Description" />;
```

### Adding a New API Endpoint

#### 1. Create Route Handler

```javascript
// backend/routes/new-feature.js
const express = require("express");
const { authenticateToken } = require("../middleware/auth");
const { body, validationResult } = require("express-validator");

const router = express.Router();

// GET endpoint
router.get("/", async (req, res) => {
  try {
    // Your logic here
    res.status(200).json({
      success: true,
      data: {
        /* your data */
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "INTERNAL_SERVER_ERROR",
      message: "Failed to fetch data",
      timestamp: new Date().toISOString(),
    });
  }
});

// POST endpoint with validation
router.post(
  "/",
  [
    body("field1").notEmpty().withMessage("Field1 is required"),
    body("field2").isEmail().withMessage("Valid email required"),
  ],
  authenticateToken,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: "VALIDATION_ERROR",
          details: errors.array(),
          timestamp: new Date().toISOString(),
        });
      }

      // Your logic here
      res.status(201).json({
        success: true,
        message: "Created successfully",
        data: {
          /* created data */
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: "INTERNAL_SERVER_ERROR",
        message: "Creation failed",
        timestamp: new Date().toISOString(),
      });
    }
  }
);

module.exports = router;
```

#### 2. Register Route in Server

```javascript
// backend/server.js
app.use("/api/v1/new-feature", require("./routes/new-feature"));
```

#### 3. Add Frontend API Function

```javascript
// lib/api.js
export const newFeatureAPI = {
  getData: async () => {
    return await api.get("/new-feature");
  },

  createData: async (data) => {
    return await api.post("/new-feature", data);
  },
};
```

### Adding a New Page

#### 1. Create Page File

```jsx
// app/new-page/page.js
"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";

export default function NewPage() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    // Load data when component mounts
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // API call here
      setIsLoading(false);
    } catch (error) {
      console.error("Error loading data:", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-8">New Page</h1>

          {isLoading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div>{/* Page content */}</div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
```

#### 2. Add Navigation Link

```jsx
// components/main-navbar.js
const navigationItems = [
  // ... existing items
  { name: "New Page", href: "/new-page" },
];
```

### Modifying Existing Features

#### 1. Adding New Product Fields

```javascript
// backend/models/Product.js
// Add new field to schema
newField: {
  type: String,
  required: false,
  default: null
}

// Update validation in routes
body('newField').optional().isLength({ max: 100 })
```

#### 2. Updating Frontend Components

```jsx
// components/product-card.js
// Add new field display
<div className="product-new-field">
  {product.newField && (
    <span className="text-sm text-gray-500">{product.newField}</span>
  )}
</div>
```

---

## 📝 Code Patterns & Conventions

### Naming Conventions

#### Files and Folders

```
// Components: kebab-case
components/product-card.js
components/user-profile.js

// Pages: kebab-case
app/product-detail/page.js
app/user-settings/page.js

// API routes: kebab-case
backend/routes/user-management.js
backend/routes/order-processing.js

// Models: PascalCase
backend/models/User.js
backend/models/Product.js
```

#### Variables and Functions

```javascript
// Variables: camelCase
const userName = "john";
const productList = [];
const isLoading = false;

// Functions: camelCase
const getUserData = () => {};
const handleSubmit = () => {};
const validateInput = () => {};

// Constants: UPPER_SNAKE_CASE
const API_BASE_URL = "http://localhost:5000";
const MAX_FILE_SIZE = 5242880;
```

#### React Components

```jsx
// Component names: PascalCase
const ProductCard = () => {};
const UserProfile = () => {};

// Props: camelCase
<ProductCard productId="123" isLoading={false} />;

// Event handlers: handle + Action
const handleClick = () => {};
const handleSubmit = () => {};
const handleInputChange = () => {};
```

### Error Handling Patterns

#### Frontend Error Handling

```jsx
const ComponentWithErrorHandling = () => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAction = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await someAPI.call();

      if (result.success) {
        // Handle success
      } else {
        setError(result.message || 'Operation failed');
      }
    } catch (error) {
      setError(error.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
        <button
          onClick={() => setError(null)}
          className="mt-2 text-red-600 hover:text-red-800"
        >
          Dismiss
        </button>
      </div>
    );
  }

  return (
    // Component content
  );
};
```

#### Backend Error Handling

```javascript
// Consistent error response format
const sendErrorResponse = (
  res,
  statusCode,
  errorCode,
  message,
  details = null
) => {
  res.status(statusCode).json({
    success: false,
    error: errorCode,
    message,
    details,
    timestamp: new Date().toISOString(),
  });
};

// Usage in routes
router.post("/endpoint", async (req, res) => {
  try {
    // Route logic
  } catch (error) {
    console.error("Route error:", error);

    if (error.name === "ValidationError") {
      return sendErrorResponse(
        res,
        400,
        "VALIDATION_ERROR",
        "Invalid input data",
        error.errors
      );
    }

    if (error.code === 11000) {
      return sendErrorResponse(
        res,
        409,
        "DUPLICATE_ERROR",
        "Resource already exists"
      );
    }

    sendErrorResponse(
      res,
      500,
      "INTERNAL_SERVER_ERROR",
      "Internal server error"
    );
  }
});
```

### State Management Patterns

#### Context Pattern

```jsx
// Create context
const FeatureContext = createContext();

// Provider component
export const FeatureProvider = ({ children }) => {
  const [state, setState] = useState(initialState);

  const actions = {
    updateState: (newState) => setState(newState),
    resetState: () => setState(initialState),
  };

  return (
    <FeatureContext.Provider value={{ state, ...actions }}>
      {children}
    </FeatureContext.Provider>
  );
};

// Custom hook
export const useFeature = () => {
  const context = useContext(FeatureContext);
  if (!context) {
    throw new Error("useFeature must be used within FeatureProvider");
  }
  return context;
};
```

#### Loading States Pattern

```jsx
const useAsyncOperation = () => {
  const [state, setState] = useState({
    data: null,
    isLoading: false,
    error: null,
  });

  const execute = async (asyncFunction) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const data = await asyncFunction();
      setState({ data, isLoading: false, error: null });
      return { success: true, data };
    } catch (error) {
      setState((prev) => ({ ...prev, isLoading: false, error: error.message }));
      return { success: false, error: error.message };
    }
  };

  return { ...state, execute };
};
```

---

## 🧪 Testing Guidelines

### Frontend Testing

#### Component Testing with React Testing Library

```jsx
// __tests__/components/ProductCard.test.js
import { render, screen, fireEvent } from "@testing-library/react";
import ProductCard from "@/components/ProductCard";

const mockProduct = {
  id: "1",
  title: "Test Product",
  price: 299,
  author: "Test Author",
};

describe("ProductCard", () => {
  test("renders product information", () => {
    render(<ProductCard product={mockProduct} />);

    expect(screen.getByText("Test Product")).toBeInTheDocument();
    expect(screen.getByText("₹299")).toBeInTheDocument();
    expect(screen.getByText("Test Author")).toBeInTheDocument();
  });

  test("handles add to cart click", () => {
    const mockAddToCart = jest.fn();
    render(<ProductCard product={mockProduct} onAddToCart={mockAddToCart} />);

    const addButton = screen.getByText("Add to Cart");
    fireEvent.click(addButton);

    expect(mockAddToCart).toHaveBeenCalledWith(mockProduct.id);
  });
});
```

#### API Testing

```javascript
// __tests__/api/productAPI.test.js
import { productAPI } from "@/lib/api";

// Mock axios
jest.mock("axios");

describe("productAPI", () => {
  test("getProducts returns product list", async () => {
    const mockResponse = {
      success: true,
      data: {
        products: [mockProduct],
      },
    };

    axios.get.mockResolvedValue({ data: mockResponse });

    const result = await productAPI.getProducts();

    expect(result.success).toBe(true);
    expect(result.data.products).toHaveLength(1);
  });
});
```

### Backend Testing

#### API Route Testing with Supertest

```javascript
// __tests__/routes/auth.test.js
const request = require("supertest");
const app = require("../../server");
const User = require("../../models/User");

describe("Auth Routes", () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe("POST /api/v1/auth/register", () => {
    test("should register new user", async () => {
      const userData = {
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        password: "password123",
      };

      const response = await request(app)
        .post("/api/v1/auth/register")
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.token).toBeDefined();
    });

    test("should return error for duplicate email", async () => {
      // Create user first
      await User.create({
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        password: "password123",
      });

      const response = await request(app)
        .post("/api/v1/auth/register")
        .send({
          firstName: "Jane",
          lastName: "Doe",
          email: "john@example.com",
          password: "password123",
        })
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe("USER_EXISTS");
    });
  });
});
```

#### Model Testing

```javascript
// __tests__/models/User.test.js
const User = require("../../models/User");

describe("User Model", () => {
  test("should hash password before saving", async () => {
    const user = new User({
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      password: "plaintext",
    });

    await user.save();

    expect(user.password).not.toBe("plaintext");
    expect(user.password.length).toBeGreaterThan(20);
  });

  test("should compare passwords correctly", async () => {
    const user = new User({
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      password: "password123",
    });

    await user.save();

    const isMatch = await user.comparePassword("password123");
    const isNotMatch = await user.comparePassword("wrongpassword");

    expect(isMatch).toBe(true);
    expect(isNotMatch).toBe(false);
  });
});
```

### Running Tests

```bash
# Frontend tests
npm test

# Backend tests
cd backend
npm test

# Test coverage
npm run test:coverage

# Watch mode for development
npm run test:watch
```

---

## 🔧 Troubleshooting

### Common Issues and Solutions

#### 1. MongoDB Connection Issues

**Problem**: `MongoNetworkError: failed to connect to server`

**Solutions**:

```bash
# Check if MongoDB is running
# Windows
net start MongoDB

# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Check connection string
MONGODB_URI=mongodb://localhost:27017/rg-publication
```

#### 2. JWT Token Issues

**Problem**: `JsonWebTokenError: invalid token`

**Solutions**:

```javascript
// Check JWT_SECRET in .env
JWT_SECRET=your-very-long-and-secure-secret-key

// Clear localStorage if token is corrupted
localStorage.removeItem('token');

// Verify token format in API calls
Authorization: Bearer <token>
```

#### 3. CORS Issues

**Problem**: `Access to fetch blocked by CORS policy`

**Solutions**:

```javascript
// backend/server.js
app.use(cors({
  origin: process.env.FRONTEND_URL, // Make sure this matches your frontend URL
  credentials: true
}));

// Check environment variables
FRONTEND_URL=http://localhost:3000
```

#### 4. Build Issues

**Problem**: `Module not found` or build failures

**Solutions**:

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Next.js cache
rm -rf .next

# Check import paths
import { Component } from '@/components'; // Correct
import { Component } from '../components'; // Avoid relative paths
```

#### 5. API Integration Issues

**Problem**: API calls failing or returning unexpected data

**Solutions**:

```javascript
// Add debugging to API calls
console.log("API Request:", { url, method, data });
console.log("API Response:", response);

// Check network tab in browser dev tools
// Verify API endpoint URLs
// Check request/response headers
```

### Debugging Tools

#### Frontend Debugging

```javascript
// React Developer Tools
// Install browser extension for React debugging

// Console debugging
console.log("State:", state);
console.log("Props:", props);

// Network debugging
// Use browser Network tab to inspect API calls
```

#### Backend Debugging

```javascript
// Add logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, req.body);
  next();
});

// MongoDB debugging
mongoose.set("debug", true);

// Error logging
console.error("Error details:", {
  message: error.message,
  stack: error.stack,
  request: req.body,
});
```

### Performance Optimization

#### Frontend Optimization

```jsx
// Use React.memo for expensive components
const ExpensiveComponent = React.memo(({ data }) => {
  return <div>{/* Complex rendering */}</div>;
});

// Lazy load components
const LazyComponent = lazy(() => import("./LazyComponent"));

// Optimize images
<Image
  src="/image.jpg"
  alt="Description"
  width={300}
  height={200}
  loading="lazy"
/>;
```

#### Backend Optimization

```javascript
// Add database indexes
productSchema.index({ subject: 1, class: 1 });
productSchema.index({ title: "text", description: "text" });

// Use pagination for large datasets
const products = await Product.find(query)
  .skip((page - 1) * limit)
  .limit(limit);

// Cache frequently accessed data
const redis = require("redis");
const client = redis.createClient();
```

---

**Document Version**: 1.0
**Last Updated**: January 26, 2025
**Maintained By**: RG Publication Development Team

For additional support, refer to:

- API Documentation: `RG_Publication_API_Documentation.md`
- Dashboard Guide: `DASHBOARD_HANDOFF_GUIDE.md`
- Deployment Guide: `DEPLOYMENT_GUIDE.md`
