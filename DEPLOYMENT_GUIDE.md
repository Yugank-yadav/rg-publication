# RG Publication - Complete Deployment Guide

This guide covers deploying both the Next.js frontend and Node.js backend for the RG Publication educational books website.

## 🏗️ Architecture Overview

- **Frontend**: Next.js 15.3.3 (React-based)
- **Backend**: Node.js/Express.js with MongoDB
- **Database**: MongoDB with sample educational books data
- **Authentication**: JWT-based with non-expiring tokens
- **Deployment**: Vercel (Frontend) + Railway/Heroku (Backend)

## 📋 Prerequisites

- Node.js 18+
- MongoDB 4.4+
- Git
- Vercel CLI (optional)
- Railway CLI or Heroku CLI (for backend deployment)

## 🚀 Quick Start (Development)

### 1. Clone and Setup

```bash
git clone <repository-url>
cd rg-publication
```

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run seed
npm run dev
```

Backend will run on `http://localhost:5000`

### 3. Frontend Setup

```bash
cd ../
npm install
npm run dev
```

Frontend will run on `http://localhost:3000`

## 🌐 Production Deployment

### Backend Deployment (Railway - Recommended)

1. **Create Railway Account**
   - Sign up at [railway.app](https://railway.app)
   - Connect your GitHub account

2. **Deploy Backend**
   ```bash
   cd backend
   railway login
   railway init
   railway add mongodb
   railway deploy
   ```

3. **Set Environment Variables**
   ```bash
   railway variables set NODE_ENV=production
   railway variables set JWT_SECRET=your-production-secret
   railway variables set FRONTEND_URL=https://your-frontend-domain.vercel.app
   ```

4. **Seed Production Database**
   ```bash
   railway run npm run seed
   ```

### Frontend Deployment (Vercel - Recommended)

1. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Select the root directory (not /backend)

2. **Configure Environment Variables**
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-domain.railway.app/api/v1
   ```

3. **Deploy**
   - Vercel will automatically deploy on every push to main branch

### Alternative: Docker Deployment

1. **Backend with Docker**
   ```bash
   cd backend
   docker-compose up -d
   ```

2. **Frontend with Docker**
   ```bash
   # Create Dockerfile in root
   docker build -t rg-publication-frontend .
   docker run -p 3000:3000 rg-publication-frontend
   ```

## 🔧 Configuration

### Backend Environment Variables

```env
# Production Configuration
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://your-frontend-domain.vercel.app

# Database
MONGODB_URI=mongodb://your-production-db-url

# JWT
JWT_SECRET=your-super-secure-production-secret
JWT_EXPIRES_IN=never

# Email (Optional)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Security
BCRYPT_SALT_ROUNDS=12
```

### Frontend Environment Variables

```env
NEXT_PUBLIC_API_URL=https://your-backend-domain.railway.app/api/v1
```

## 🧪 Testing Deployment

### 1. Health Check
```bash
curl https://your-backend-domain.railway.app/health
```

### 2. API Endpoints
```bash
# Get products
curl https://your-backend-domain.railway.app/api/v1/products

# Get featured products
curl https://your-backend-domain.railway.app/api/v1/products/featured

# Search products
curl "https://your-backend-domain.railway.app/api/v1/search/products?q=mathematics"
```

### 3. Frontend Integration
- Visit your Vercel URL
- Test navigation between pages
- Test product browsing and search
- Test cart functionality (requires user registration)

## 📊 Monitoring & Maintenance

### Backend Monitoring

1. **Health Checks**
   - Railway provides automatic health monitoring
   - Custom health endpoint: `/health`

2. **Logs**
   ```bash
   railway logs
   ```

3. **Database Monitoring**
   - Monitor MongoDB Atlas dashboard
   - Check connection health and query performance

### Frontend Monitoring

1. **Vercel Analytics**
   - Built-in performance monitoring
   - Real user metrics

2. **Error Tracking**
   - Vercel automatically tracks build and runtime errors

## 🔒 Security Checklist

### Backend Security

- ✅ JWT tokens with secure secrets
- ✅ Password hashing with bcrypt
- ✅ Rate limiting implemented
- ✅ Input validation on all endpoints
- ✅ CORS properly configured
- ✅ Helmet security headers
- ✅ Environment variables secured

### Frontend Security

- ✅ No sensitive data in client-side code
- ✅ API calls use HTTPS
- ✅ Proper error handling
- ✅ XSS protection through React

## 🚨 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Check FRONTEND_URL in backend .env
   - Ensure CORS is properly configured

2. **Database Connection**
   - Verify MONGODB_URI is correct
   - Check MongoDB Atlas IP whitelist

3. **API Not Found**
   - Verify backend is deployed and running
   - Check NEXT_PUBLIC_API_URL in frontend

4. **Authentication Issues**
   - Verify JWT_SECRET is set
   - Check token format in requests

### Debug Commands

```bash
# Backend logs
railway logs --tail

# Frontend build logs
vercel logs

# Test API connectivity
curl -v https://your-backend-domain.railway.app/health
```

## 📈 Performance Optimization

### Backend Optimizations

- Database indexing implemented
- Response compression enabled
- Efficient pagination
- Caching headers set

### Frontend Optimizations

- Next.js automatic optimizations
- Image optimization with next/image
- Code splitting and lazy loading
- Static generation where possible

## 🔄 CI/CD Pipeline

### Automatic Deployment

1. **Backend**: Railway auto-deploys on push to main
2. **Frontend**: Vercel auto-deploys on push to main

### Manual Deployment

```bash
# Backend
cd backend
railway deploy

# Frontend
cd ../
vercel --prod
```

## 📞 Support

For deployment issues:
- Check logs first
- Review environment variables
- Test API endpoints individually
- Contact support if needed

---

**Last Updated**: January 19, 2025  
**Version**: 1.0.0
