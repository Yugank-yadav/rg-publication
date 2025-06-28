# RG Publication Backend API

A comprehensive Node.js/Express.js/MongoDB backend for the RG Publication educational books website.

## 🚀 Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **Product Management**: Complete CRUD operations for educational books and materials
- **Shopping Cart**: Full cart functionality with localStorage synchronization
- **Order Processing**: End-to-end order management with payment integration
- **Search & Filter**: Advanced product search with filtering and suggestions
- **Contact Forms**: Contact form submissions with admin management
- **Security**: Rate limiting, input validation, and security best practices
- **Performance**: Database indexing, pagination, and optimized queries

## 📋 Prerequisites

- Node.js 18+
- MongoDB 4.4+
- npm or yarn

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd rg-publication/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Database Setup**
   ```bash
   # Start MongoDB service
   # Then seed the database with sample data
   npm run seed
   ```

5. **Start the server**
   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

## 🌐 API Endpoints

### Base URL
```
http://localhost:5000/api/v1
```

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `POST /auth/refresh` - Token refresh (optional)

### Products
- `GET /products` - Get all products with filtering
- `GET /products/featured` - Get featured products
- `GET /products/:id` - Get product by ID

### Shopping Cart
- `GET /cart` - Get user cart
- `POST /cart/items` - Add item to cart
- `PUT /cart/items/:id` - Update cart item
- `DELETE /cart/items/:id` - Remove cart item
- `POST /cart/sync` - Sync cart with localStorage

### Orders
- `POST /orders` - Create new order
- `GET /orders/:id` - Get order by ID
- `GET /orders` - Get user orders

### Search
- `GET /search/products` - Search products
- `GET /search/suggestions` - Get search suggestions

### Contact
- `POST /contact/submit` - Submit contact form
- `GET /contact/submissions` - Get submissions (Admin only)

## 📊 Database Schema

### Core Collections

- **users** - User accounts and profiles
- **products** - Educational books and materials
- **carts** - Shopping cart data
- **orders** - Order information and tracking
- **contacts** - Contact form submissions

## 🔧 Configuration

### Environment Variables

```env
# Server Configuration
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000

# Database
MONGODB_URI=mongodb://localhost:27017/rg-publication

# JWT Configuration
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=never

# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Security
BCRYPT_SALT_ROUNDS=12
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- --testPathPattern=auth
```

## 📝 API Response Format

All API responses follow a consistent format:

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

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with configurable salt rounds
- **Rate Limiting**: Configurable request rate limiting
- **Input Validation**: Comprehensive request validation
- **CORS Protection**: Configurable CORS settings
- **Helmet Security**: Security headers and protection

## 📈 Performance Optimizations

- **Database Indexing**: Optimized indexes for frequent queries
- **Pagination**: Efficient pagination for large datasets
- **Caching**: Response caching for static data
- **Compression**: Gzip compression for responses

## 🚀 Deployment

### Production Setup

1. **Environment Configuration**
   ```bash
   NODE_ENV=production
   MONGODB_URI=mongodb://your-production-db
   JWT_SECRET=your-production-secret
   ```

2. **Build and Start**
   ```bash
   npm run build
   npm start
   ```

3. **Process Management**
   ```bash
   # Using PM2
   npm install -g pm2
   pm2 start server.js --name "rg-publication-api"
   ```

## 📚 Sample Data

The database can be seeded with sample data:

```bash
npm run seed
```

This creates:
- 6 sample products across different subjects and classes
- 1 admin user (admin@rgpublication.com / admin123)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Email: support@rgpublication.com
- Documentation: See API documentation in `/docs`
- Issues: Create an issue on GitHub

---

**Version**: 1.0.0  
**Last Updated**: January 19, 2025
