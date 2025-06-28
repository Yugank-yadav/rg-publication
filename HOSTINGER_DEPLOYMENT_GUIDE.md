# RG Publication - Hostinger Deployment Guide

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Hostinger Account Setup](#hostinger-account-setup)
3. [Domain Configuration](#domain-configuration)
4. [Frontend Deployment (Next.js)](#frontend-deployment-nextjs)
5. [Backend Deployment (Node.js)](#backend-deployment-nodejs)
6. [Database Setup (MongoDB)](#database-setup-mongodb)
7. [Environment Configuration](#environment-configuration)
8. [SSL Certificate Setup](#ssl-certificate-setup)
9. [File Upload Configuration](#file-upload-configuration)
10. [Performance Optimization](#performance-optimization)
11. [Monitoring & Maintenance](#monitoring--maintenance)
12. [Troubleshooting](#troubleshooting)
13. [Rollback Procedures](#rollback-procedures)

---

## 📋 Prerequisites

### Required Accounts & Services

- **Hostinger Account**: Premium or Business plan (required for Node.js support)
- **Domain Name**: Either through Hostinger or external registrar
- **MongoDB Atlas Account**: For cloud database (recommended)
- **Git Repository**: GitHub, GitLab, or Bitbucket
- **Local Development Environment**: Working RG Publication setup

### Required Tools

```bash
# Install required tools locally
npm install -g @vercel/ncc  # For building Node.js apps
npm install -g pm2          # For process management
```

### Hostinger Plan Requirements

- **Minimum Plan**: Business Hosting (for Node.js support)
- **Recommended Plan**: Cloud Hosting or VPS
- **Features Needed**:
  - Node.js support (v18+)
  - SSH access
  - Custom domains
  - SSL certificates
  - File manager access

---

## 🏠 Hostinger Account Setup

### 1. Purchase Hosting Plan

1. Visit [Hostinger.com](https://hostinger.com)
2. Choose **Business Hosting** or higher plan
3. Complete purchase and account setup
4. Verify email and access control panel

### 2. Access Control Panel

1. Login to Hostinger control panel
2. Navigate to **Hosting** section
3. Click **Manage** on your hosting account
4. Familiarize yourself with the interface

### 3. Enable Node.js Support

1. In control panel, go to **Advanced** → **Node.js**
2. Click **Create Application**
3. Select Node.js version (18.x or higher)
4. Note the application path and URL

---

## 🌐 Domain Configuration

### 1. Domain Setup (If using Hostinger domain)

1. In control panel, go to **Domains**
2. Click **Manage** next to your domain
3. Ensure DNS is pointing to Hostinger servers

### 2. External Domain Configuration

If using external domain registrar:

```dns
# DNS Records to add at your registrar
Type: A
Name: @
Value: [Your Hostinger IP address]

Type: A
Name: www
Value: [Your Hostinger IP address]

Type: CNAME
Name: api
Value: [Your domain name]
```

### 3. Subdomain Setup for API

1. In control panel, go to **Domains** → **Subdomains**
2. Create subdomain: `api.yourdomain.com`
3. Point to your Node.js application directory

---

## 🎨 Frontend Deployment (Next.js)

### 1. Prepare Next.js for Production

#### Update next.config.js

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export", // Enable static export
  trailingSlash: true,
  images: {
    unoptimized: true, // Required for static export
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_FRONTEND_URL: process.env.NEXT_PUBLIC_FRONTEND_URL,
  },
};

module.exports = nextConfig;
```

#### Update Environment Variables

```env
# .env.production
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api/v1
NEXT_PUBLIC_FRONTEND_URL=https://yourdomain.com
```

### 2. Build and Export

```bash
# In your local project directory
npm run build

# This creates an 'out' directory with static files
```

### 3. Upload to Hostinger

#### Method 1: File Manager (Recommended for beginners)

1. In Hostinger control panel, go to **Files** → **File Manager**
2. Navigate to `public_html` directory
3. Delete default files (index.html, etc.)
4. Upload all files from your `out` directory
5. Ensure proper file permissions (644 for files, 755 for directories)

#### Method 2: FTP/SFTP

```bash
# Using SFTP (replace with your details)
sftp username@yourdomain.com
cd public_html
put -r out/* .
quit
```

#### Method 3: Git Deployment (Advanced)

```bash
# SSH into your Hostinger account
ssh username@yourdomain.com

# Clone your repository
git clone https://github.com/yourusername/rg-publication.git
cd rg-publication

# Install dependencies and build
npm install
npm run build

# Copy build files to public_html
cp -r out/* ../public_html/
```

### 4. Configure .htaccess for SPA Routing

Create `.htaccess` in `public_html`:

```apache
# .htaccess for Next.js static export
RewriteEngine On

# Handle client-side routing
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ /index.html [L]

# Enable compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>

# Set cache headers
<IfModule mod_expires.c>
    ExpiresActive on
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
</IfModule>
```

---

## ⚙️ Backend Deployment (Node.js)

### 1. Prepare Backend for Production

#### Update package.json

```json
{
  "scripts": {
    "start": "node server.js",
    "build": "ncc build server.js -o dist",
    "dev": "nodemon server.js"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

#### Create Production Environment File

```env
# backend/.env.production
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://yourdomain.com

# MongoDB Atlas connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/rg-publication

# JWT Configuration
JWT_SECRET=your-super-secure-production-jwt-secret-key-here
JWT_EXPIRES_IN=never

# File Upload
UPLOAD_DIR=/home/username/uploads
MAX_FILE_SIZE=5242880
```

### 2. Deploy to Hostinger

#### Method 1: Direct Upload

1. Create Node.js application in Hostinger control panel
2. Upload backend files to the application directory
3. Install dependencies via SSH or file manager

#### Method 2: SSH Deployment (Recommended)

```bash
# SSH into your Hostinger account
ssh username@yourdomain.com

# Navigate to Node.js application directory
cd domains/api.yourdomain.com

# Clone your repository
git clone https://github.com/yourusername/rg-publication.git .

# Install dependencies
npm install --production

# Copy environment file
cp backend/.env.production backend/.env

# Test the application
npm start
```

### 3. Configure Process Management

#### Install PM2

```bash
# Install PM2 globally
npm install -g pm2

# Create PM2 ecosystem file
```

#### Create ecosystem.config.js

```javascript
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: "rg-publication-api",
      script: "./backend/server.js",
      cwd: "/home/username/domains/api.yourdomain.com",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      error_file: "./logs/err.log",
      out_file: "./logs/out.log",
      log_file: "./logs/combined.log",
      time: true,
      max_memory_restart: "1G",
      restart_delay: 4000,
    },
  ],
};
```

#### Start Application with PM2

```bash
# Start the application
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup

# Check application status
pm2 status
pm2 logs
```

### 4. Configure Reverse Proxy

#### Create .htaccess for API subdomain

In `api.yourdomain.com` directory:

```apache
# .htaccess for Node.js API
RewriteEngine On

# Proxy all requests to Node.js application
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ http://localhost:3000/$1 [P,L]

# Enable CORS headers
Header always set Access-Control-Allow-Origin "https://yourdomain.com"
Header always set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
Header always set Access-Control-Allow-Headers "Content-Type, Authorization"
Header always set Access-Control-Allow-Credentials "true"

# Handle preflight requests
RewriteCond %{REQUEST_METHOD} OPTIONS
RewriteRule ^(.*)$ $1 [R=200,L]
```

---

## 🗄️ Database Setup (MongoDB)

### 1. MongoDB Atlas Setup (Recommended)

#### Create MongoDB Atlas Account

1. Visit [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for free account
3. Create new project: "RG Publication"
4. Build your first cluster (free tier available)

#### Configure Database Access

```bash
# Create database user
Username: rg-publication-user
Password: [Generate secure password]
Roles: Read and write to any database
```

#### Configure Network Access

```bash
# Add IP addresses
0.0.0.0/0  # Allow access from anywhere (for Hostinger)
# Or add specific Hostinger IP ranges for better security
```

#### Get Connection String

```bash
# Example connection string
mongodb+srv://rg-publication-user:password@cluster0.xxxxx.mongodb.net/rg-publication?retryWrites=true&w=majority
```

### 2. Database Seeding

#### Upload Seed Script

```bash
# SSH into Hostinger
ssh username@yourdomain.com
cd domains/api.yourdomain.com

# Run seed script
node backend/scripts/seed.js
```

#### Verify Database Setup

```bash
# Connect to MongoDB and verify data
node -e "
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI);
mongoose.connection.once('open', async () => {
  const User = require('./backend/models/User');
  const Product = require('./backend/models/Product');
  console.log('Users:', await User.countDocuments());
  console.log('Products:', await Product.countDocuments());
  process.exit(0);
});
"
```

### 3. Alternative: Local MongoDB on VPS

If using Hostinger VPS, you can install MongoDB locally:

```bash
# Install MongoDB on Ubuntu/Debian VPS
sudo apt update
sudo apt install -y mongodb

# Start MongoDB service
sudo systemctl start mongodb
sudo systemctl enable mongodb

# Create database and user
mongo
use rg-publication
db.createUser({
  user: "rg-publication-user",
  pwd: "secure-password",
  roles: ["readWrite"]
})
```

---

## 🔧 Environment Configuration

### 1. Production Environment Variables

#### Frontend Environment (.env.production)

```env
# Frontend production environment
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api/v1
NEXT_PUBLIC_FRONTEND_URL=https://yourdomain.com
NEXT_PUBLIC_SITE_NAME=RG Publication
NEXT_PUBLIC_CONTACT_EMAIL=contact@yourdomain.com
```

#### Backend Environment (.env)

```env
# Backend production environment
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://yourdomain.com

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/rg-publication

# JWT Configuration
JWT_SECRET=your-super-secure-production-jwt-secret-key-minimum-32-characters
JWT_EXPIRES_IN=never

# File Upload
UPLOAD_DIR=/home/username/uploads
MAX_FILE_SIZE=5242880

# Email Configuration (optional)
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=587
SMTP_USER=noreply@yourdomain.com
SMTP_PASS=your-email-password

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100
```

### 2. Security Configuration

#### Generate Secure JWT Secret

```bash
# Generate a secure JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

#### File Permissions

```bash
# Set proper file permissions
chmod 600 .env                    # Environment file
chmod 755 backend/               # Directory permissions
chmod 644 backend/*.js           # JavaScript files
chmod 755 backend/uploads/       # Upload directory
```

### 3. Environment Validation

#### Create Environment Checker

```javascript
// backend/utils/validateEnv.js
const requiredEnvVars = [
  "NODE_ENV",
  "PORT",
  "MONGODB_URI",
  "JWT_SECRET",
  "FRONTEND_URL",
];

const validateEnvironment = () => {
  const missing = requiredEnvVars.filter((envVar) => !process.env[envVar]);

  if (missing.length > 0) {
    console.error("Missing required environment variables:", missing);
    process.exit(1);
  }

  console.log("✅ Environment validation passed");
};

module.exports = validateEnvironment;
```

---

## 🔒 SSL Certificate Setup

### 1. Free SSL Certificate (Let's Encrypt)

#### Enable SSL in Hostinger Control Panel

1. Go to **Security** → **SSL**
2. Select your domain
3. Choose **Free SSL Certificate**
4. Click **Install SSL Certificate**
5. Wait for activation (usually 5-15 minutes)

#### Verify SSL Installation

```bash
# Test SSL certificate
curl -I https://yourdomain.com
curl -I https://api.yourdomain.com
```

### 2. Force HTTPS Redirect

#### Update .htaccess for Main Domain

```apache
# Force HTTPS redirect
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Existing Next.js configuration...
```

#### Update .htaccess for API Subdomain

```apache
# Force HTTPS for API
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Existing proxy configuration...
```

### 3. SSL Configuration in Node.js

#### Update Backend for HTTPS

```javascript
// backend/server.js - Add security headers
const helmet = require("helmet");

app.use(
  helmet({
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  })
);

// Force HTTPS in production
if (process.env.NODE_ENV === "production") {
  app.use((req, res, next) => {
    if (req.header("x-forwarded-proto") !== "https") {
      res.redirect(`https://${req.header("host")}${req.url}`);
    } else {
      next();
    }
  });
}
```

---

## 📁 File Upload Configuration

### 1. Create Upload Directory

#### Setup Upload Folder

```bash
# SSH into Hostinger
ssh username@yourdomain.com

# Create upload directories
mkdir -p /home/username/uploads/products
mkdir -p /home/username/uploads/avatars
mkdir -p /home/username/uploads/temp

# Set permissions
chmod 755 /home/username/uploads
chmod 755 /home/username/uploads/*
```

### 2. Configure Multer for File Uploads

#### Update Upload Middleware

```javascript
// backend/middleware/upload.js
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = process.env.UPLOAD_DIR || "./uploads";
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const fileFilter = (req, file, cb) => {
  // Allow only images
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB
  },
  fileFilter: fileFilter,
});

module.exports = upload;
```

### 3. Serve Static Files

#### Configure Static File Serving

```javascript
// backend/server.js
const express = require("express");
const path = require("path");

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Configure static file headers
app.use("/uploads", (req, res, next) => {
  res.setHeader("Cache-Control", "public, max-age=31536000"); // 1 year
  next();
});
```

#### Create .htaccess for Uploads Directory

```apache
# uploads/.htaccess
# Prevent execution of scripts in upload directory
<Files *.php>
    Order Deny,Allow
    Deny from all
</Files>

<Files *.js>
    Order Deny,Allow
    Deny from all
</Files>

# Set cache headers for images
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/webp "access plus 1 year"
</IfModule>
```

---

## ⚡ Performance Optimization

### 1. Frontend Optimization

#### Enable Compression

```apache
# .htaccess - Enable Gzip compression
<IfModule mod_deflate.c>
    # Compress HTML, CSS, JavaScript, Text, XML and fonts
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/vnd.ms-fontobject
    AddOutputFilterByType DEFLATE application/x-font
    AddOutputFilterByType DEFLATE application/x-font-opentype
    AddOutputFilterByType DEFLATE application/x-font-otf
    AddOutputFilterByType DEFLATE application/x-font-truetype
    AddOutputFilterByType DEFLATE application/x-font-ttf
    AddOutputFilterByType DEFLATE application/x-javascript
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE font/opentype
    AddOutputFilterByType DEFLATE font/otf
    AddOutputFilterByType DEFLATE font/ttf
    AddOutputFilterByType DEFLATE image/svg+xml
    AddOutputFilterByType DEFLATE image/x-icon
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/javascript
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/xml
</IfModule>
```

#### Browser Caching

```apache
# .htaccess - Browser caching
<IfModule mod_expires.c>
    ExpiresActive On

    # Images
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/webp "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
    ExpiresByType image/x-icon "access plus 1 year"

    # Video
    ExpiresByType video/mp4 "access plus 1 year"
    ExpiresByType video/mpeg "access plus 1 year"

    # CSS, JavaScript
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
    ExpiresByType application/x-javascript "access plus 1 month"

    # Others
    ExpiresByType application/pdf "access plus 1 month"
    ExpiresByType application/x-shockwave-flash "access plus 1 month"
</IfModule>
```

### 2. Backend Optimization

#### Enable Node.js Clustering

```javascript
// backend/cluster.js
const cluster = require("cluster");
const numCPUs = require("os").cpus().length;

if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);

  // Fork workers
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`);
    cluster.fork();
  });
} else {
  // Workers can share any TCP port
  require("./server.js");
  console.log(`Worker ${process.pid} started`);
}
```

#### Database Connection Optimization

```javascript
// backend/config/database.js
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      bufferCommands: false, // Disable mongoose buffering
      bufferMaxEntries: 0, // Disable mongoose buffering
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("Database connection error:", error);
    process.exit(1);
  }
};

module.exports = connectDB;
```

### 3. CDN Configuration

#### Setup Cloudflare (Optional)

1. Sign up for Cloudflare account
2. Add your domain to Cloudflare
3. Update nameservers at your registrar
4. Enable caching and optimization features

#### Configure CDN Headers

```apache
# .htaccess - CDN optimization
<IfModule mod_headers.c>
    # Add Vary: Accept-Encoding header
    <FilesMatch "\.(js|css|xml|gz|html)$">
        Header append Vary: Accept-Encoding
    </FilesMatch>

    # Cache static assets
    <FilesMatch "\.(css|js|png|jpg|jpeg|gif|ico|svg)$">
        Header set Cache-Control "public, max-age=31536000"
    </FilesMatch>
</IfModule>
```

---

## 📊 Monitoring & Maintenance

### 1. Application Monitoring

#### Setup PM2 Monitoring

```bash
# Monitor application status
pm2 status
pm2 logs rg-publication-api
pm2 monit

# View detailed information
pm2 show rg-publication-api

# Restart application
pm2 restart rg-publication-api

# Reload application (zero downtime)
pm2 reload rg-publication-api
```

#### Create Health Check Endpoint

```javascript
// backend/routes/health.js
const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

router.get("/health", async (req, res) => {
  try {
    // Check database connection
    const dbStatus =
      mongoose.connection.readyState === 1 ? "connected" : "disconnected";

    // Check memory usage
    const memoryUsage = process.memoryUsage();

    // Check uptime
    const uptime = process.uptime();

    res.status(200).json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      database: dbStatus,
      uptime: `${Math.floor(uptime / 60)} minutes`,
      memory: {
        used: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
        total: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
      },
      environment: process.env.NODE_ENV,
    });
  } catch (error) {
    res.status(500).json({
      status: "unhealthy",
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

module.exports = router;
```

### 2. Log Management

#### Configure Application Logging

```javascript
// backend/utils/logger.js
const winston = require("winston");
const path = require("path");

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: "rg-publication-api" },
  transports: [
    new winston.transports.File({
      filename: path.join(__dirname, "../logs/error.log"),
      level: "error",
    }),
    new winston.transports.File({
      filename: path.join(__dirname, "../logs/combined.log"),
    }),
  ],
});

if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  );
}

module.exports = logger;
```

#### Log Rotation Setup

```bash
# Create logrotate configuration
sudo nano /etc/logrotate.d/rg-publication

# Add configuration
/home/username/domains/api.yourdomain.com/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 username username
    postrotate
        pm2 reload rg-publication-api
    endscript
}
```

### 3. Database Maintenance

#### Automated Backup Script

```bash
#!/bin/bash
# backup-database.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/username/backups"
DB_NAME="rg-publication"

# Create backup directory
mkdir -p $BACKUP_DIR

# Create MongoDB backup
mongodump --uri="$MONGODB_URI" --out="$BACKUP_DIR/backup_$DATE"

# Compress backup
tar -czf "$BACKUP_DIR/backup_$DATE.tar.gz" -C "$BACKUP_DIR" "backup_$DATE"

# Remove uncompressed backup
rm -rf "$BACKUP_DIR/backup_$DATE"

# Keep only last 7 days of backups
find $BACKUP_DIR -name "backup_*.tar.gz" -mtime +7 -delete

echo "Backup completed: backup_$DATE.tar.gz"
```

#### Setup Cron Job for Backups

```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * /home/username/scripts/backup-database.sh >> /home/username/logs/backup.log 2>&1
```

### 4. Performance Monitoring

#### Setup Basic Monitoring Script

```bash
#!/bin/bash
# monitor-performance.sh

LOG_FILE="/home/username/logs/performance.log"
DATE=$(date '+%Y-%m-%d %H:%M:%S')

# Check disk usage
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}')

# Check memory usage
MEMORY_USAGE=$(free | grep Mem | awk '{printf "%.2f", $3/$2 * 100.0}')

# Check CPU load
CPU_LOAD=$(uptime | awk -F'load average:' '{print $2}' | awk '{print $1}' | sed 's/,//')

# Check if API is responding
API_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://api.yourdomain.com/health)

# Log metrics
echo "$DATE - Disk: $DISK_USAGE, Memory: $MEMORY_USAGE%, CPU Load: $CPU_LOAD, API Status: $API_STATUS" >> $LOG_FILE

# Alert if thresholds exceeded
if (( $(echo "$MEMORY_USAGE > 80" | bc -l) )); then
    echo "High memory usage: $MEMORY_USAGE%" | mail -s "Server Alert" admin@yourdomain.com
fi
```

---

## 🔧 Troubleshooting

### 1. Common Deployment Issues

#### Frontend Not Loading

**Problem**: Website shows 404 or blank page

**Solutions**:

```bash
# Check if files are uploaded correctly
ls -la /home/username/public_html/

# Verify .htaccess configuration
cat /home/username/public_html/.htaccess

# Check file permissions
find /home/username/public_html/ -type f -exec chmod 644 {} \;
find /home/username/public_html/ -type d -exec chmod 755 {} \;

# Clear browser cache and test
curl -I https://yourdomain.com
```

#### API Not Responding

**Problem**: API endpoints return 500 or connection errors

**Solutions**:

```bash
# Check PM2 status
pm2 status
pm2 logs rg-publication-api

# Check Node.js application
cd /home/username/domains/api.yourdomain.com
node backend/server.js

# Verify environment variables
cat backend/.env

# Check database connection
node -e "
const mongoose = require('mongoose');
require('dotenv').config({ path: 'backend/.env' });
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('DB Connected'))
  .catch(err => console.error('DB Error:', err));
"
```

#### SSL Certificate Issues

**Problem**: SSL certificate not working or expired

**Solutions**:

```bash
# Check SSL certificate status
openssl s_client -connect yourdomain.com:443 -servername yourdomain.com

# Renew SSL certificate in Hostinger control panel
# Go to Security → SSL → Renew Certificate

# Force HTTPS redirect
# Ensure .htaccess has proper redirect rules
```

### 2. Performance Issues

#### Slow Loading Times

**Diagnostic Steps**:

```bash
# Test website speed
curl -w "@curl-format.txt" -o /dev/null -s https://yourdomain.com

# Create curl-format.txt
echo "
     time_namelookup:  %{time_namelookup}s
        time_connect:  %{time_connect}s
     time_appconnect:  %{time_appconnect}s
    time_pretransfer:  %{time_pretransfer}s
       time_redirect:  %{time_redirect}s
  time_starttransfer:  %{time_starttransfer}s
                     ----------
          time_total:  %{time_total}s
" > curl-format.txt

# Check database performance
# Monitor slow queries in MongoDB Atlas
```

#### High Memory Usage

**Solutions**:

```bash
# Check memory usage
free -h
ps aux --sort=-%mem | head

# Restart PM2 processes
pm2 restart all

# Optimize Node.js memory
pm2 start ecosystem.config.js --node-args="--max-old-space-size=512"
```

### 3. Database Issues

#### Connection Timeouts

**Solutions**:

```bash
# Check MongoDB Atlas network access
# Ensure 0.0.0.0/0 is whitelisted

# Test connection string
node -e "
const mongoose = require('mongoose');
mongoose.connect('your-connection-string', {
  serverSelectionTimeoutMS: 5000
})
.then(() => console.log('Connected'))
.catch(err => console.error('Error:', err));
"

# Update connection string in .env
# Ensure proper URL encoding of special characters
```

#### Data Corruption

**Recovery Steps**:

```bash
# Restore from backup
cd /home/username/backups
tar -xzf backup_YYYYMMDD_HHMMSS.tar.gz

# Use mongorestore (for local MongoDB)
mongorestore --db rg-publication backup_YYYYMMDD_HHMMSS/rg-publication/

# For MongoDB Atlas, use MongoDB Compass or Atlas interface
```

---

## 🔄 Rollback Procedures

### 1. Frontend Rollback

#### Quick Rollback

```bash
# SSH into Hostinger
ssh username@yourdomain.com

# Backup current version
cp -r public_html public_html_backup_$(date +%Y%m%d_%H%M%S)

# Restore from previous backup
cp -r public_html_backup_PREVIOUS/* public_html/

# Or restore from Git
cd rg-publication
git checkout previous-working-commit
npm run build
cp -r out/* ../public_html/
```

#### Automated Rollback Script

```bash
#!/bin/bash
# rollback-frontend.sh

BACKUP_DIR="/home/username/backups/frontend"
PUBLIC_DIR="/home/username/public_html"

# List available backups
echo "Available backups:"
ls -la $BACKUP_DIR

# Prompt for backup selection
read -p "Enter backup timestamp (YYYYMMDD_HHMMSS): " TIMESTAMP

if [ -d "$BACKUP_DIR/backup_$TIMESTAMP" ]; then
    # Create current backup
    cp -r $PUBLIC_DIR "$BACKUP_DIR/current_$(date +%Y%m%d_%H%M%S)"

    # Restore selected backup
    rm -rf $PUBLIC_DIR/*
    cp -r "$BACKUP_DIR/backup_$TIMESTAMP"/* $PUBLIC_DIR/

    echo "Frontend rolled back to $TIMESTAMP"
else
    echo "Backup not found!"
fi
```

### 2. Backend Rollback

#### PM2 Rollback

```bash
# Stop current application
pm2 stop rg-publication-api

# Restore from Git
cd /home/username/domains/api.yourdomain.com
git log --oneline -10  # View recent commits
git checkout COMMIT_HASH

# Reinstall dependencies if needed
npm install --production

# Restart application
pm2 start ecosystem.config.js
pm2 save
```

#### Database Rollback

```bash
# For critical data issues, restore from backup
# This should be done carefully and tested first

# Create current backup before rollback
mongodump --uri="$MONGODB_URI" --out="backup_before_rollback_$(date +%Y%m%d_%H%M%S)"

# Restore from specific backup
mongorestore --uri="$MONGODB_URI" --drop backup_YYYYMMDD_HHMMSS/
```

### 3. Emergency Procedures

#### Complete Site Rollback

```bash
#!/bin/bash
# emergency-rollback.sh

echo "EMERGENCY ROLLBACK INITIATED"
echo "This will restore the entire site to the last known good state"

read -p "Are you sure? (yes/no): " CONFIRM

if [ "$CONFIRM" = "yes" ]; then
    # Stop all services
    pm2 stop all

    # Restore frontend
    cp -r /home/username/backups/frontend/last_good/* /home/username/public_html/

    # Restore backend
    cd /home/username/domains/api.yourdomain.com
    git checkout last-good-commit
    npm install --production

    # Restart services
    pm2 start ecosystem.config.js

    echo "Emergency rollback completed"
    echo "Please verify site functionality"
else
    echo "Rollback cancelled"
fi
```

#### Maintenance Mode

```html
<!-- maintenance.html -->
<!DOCTYPE html>
<html>
  <head>
    <title>RG Publication - Maintenance</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        text-align: center;
        padding: 50px;
        background: #f5f5f5;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        background: white;
        padding: 40px;
        border-radius: 10px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>🔧 Maintenance in Progress</h1>
      <p>We're currently updating our systems to serve you better.</p>
      <p>Please check back in a few minutes.</p>
      <p>Thank you for your patience!</p>
    </div>
  </body>
</html>
```

```bash
# Enable maintenance mode
cp maintenance.html /home/username/public_html/index.html

# Disable maintenance mode (restore normal site)
# Restore from backup or redeploy
```

---

## 📞 Support & Resources

### Hostinger Support

- **Control Panel**: Access through Hostinger dashboard
- **Live Chat**: Available 24/7 for technical issues
- **Knowledge Base**: [support.hostinger.com](https://support.hostinger.com)
- **Community Forum**: Active community for troubleshooting

### Monitoring Tools

- **PM2 Web Interface**: `pm2 web` (optional)
- **MongoDB Atlas Monitoring**: Built-in performance metrics
- **Google PageSpeed Insights**: For frontend performance
- **GTmetrix**: For detailed performance analysis

### Backup Verification

```bash
# Test backup integrity
tar -tzf backup_YYYYMMDD_HHMMSS.tar.gz > /dev/null && echo "Backup OK" || echo "Backup corrupted"

# Test database restore (on staging)
mongorestore --uri="staging-connection-string" --drop backup_folder/
```

### Emergency Contacts

- **Technical Lead**: [Your contact information]
- **Hostinger Support**: Available through control panel
- **MongoDB Atlas Support**: Available through Atlas dashboard

---

**Document Version**: 1.0
**Last Updated**: January 26, 2025
**Deployment Target**: Hostinger Business/Cloud Hosting
**Estimated Deployment Time**: 4-6 hours for complete setup

**Next Steps After Deployment**:

1. Test all functionality thoroughly
2. Set up monitoring and alerts
3. Configure automated backups
4. Document any custom configurations
5. Train team on maintenance procedures
