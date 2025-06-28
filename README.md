# 📚 RG Publication - Educational Books & Resources

A modern, responsive e-commerce platform for educational books and resources, built with Next.js 15, featuring an interactive 3D hero section, comprehensive product catalog, and dedicated admin dashboard.

![RG Publication Website](https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1200&h=600&fit=crop&auto=format)

## 🌟 Features

### **Public Website**

- **Interactive 3D Hero Section** with cursor-tracking animations
- **Responsive Product Catalog** with advanced filtering and search
- **Shopping Cart & Wishlist** with persistent storage
- **User Authentication** with JWT tokens
- **Mobile-First Design** with Tailwind CSS and Framer Motion

### **Admin Dashboard**

- **Clean, Dedicated Interface** separate from public website navigation
- **Dashboard Analytics** with charts and metrics
- **Product Management** with CRUD operations
- **User Management** with role-based access control
- **Order Processing** and inventory tracking
- **Responsive Admin Sidebar** with mobile support

### **Technical Features**

- **Next.js 15** with App Router and Server Components
- **Conditional Layouts** (admin vs public interfaces)
- **Context-Based State Management** for cart, auth, and wishlist
- **Production-Ready Logging** with environment-based levels
- **API Integration** with comprehensive error handling
- **Performance Optimized** with lazy loading and code splitting

## 🚀 Live Demo

- **Website**: [https://rg-publication.vercel.app](https://rg-publication.vercel.app)
- **Admin Dashboard**: [https://rg-publication.vercel.app/admin](https://rg-publication.vercel.app/admin)

## 🛠️ Tech Stack

### **Frontend**

- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Heroicons
- **State Management**: React Context API
- **HTTP Client**: Axios with interceptors

### **Backend Integration**

- **API**: RESTful APIs with Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT tokens with role-based access
- **File Storage**: Multer for file uploads

### **Deployment**

- **Frontend**: Vercel with automatic deployments
- **Backend**: Railway (separate repository)
- **Domain**: Custom domain with SSL

## 📦 Installation & Setup

### **Prerequisites**

- Node.js 18+ and npm
- Git for version control
- Backend API running (see backend repository)

### **Local Development**

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/rg-publication.git
   cd rg-publication
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   ```bash
   cp .env.example .env.local
   ```

   Update `.env.local` with your configuration:

   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
   NEXT_PUBLIC_APP_NAME=RG Publication
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Start development server**

   ```bash
   npm run dev
   ```

5. **Open in browser**
   - Website: [http://localhost:3000](http://localhost:3000)
   - Admin: [http://localhost:3000/admin](http://localhost:3000/admin)

### **Production Build**

```bash
# Build for production
npm run build

# Start production server
npm start

# Or deploy to Vercel
vercel --prod
```

## 🏗️ Project Structure

```
rg-publication/
├── app/                    # Next.js App Router
│   ├── admin/             # Admin dashboard pages
│   ├── auth/              # Authentication pages
│   ├── shop/              # E-commerce pages
│   ├── layout.js          # Root layout with conditional rendering
│   └── page.js            # Homepage
├── components/            # Reusable React components
│   ├── admin/             # Admin-specific components
│   ├── ui/                # UI components
│   └── ConditionalLayout.js # Layout switcher
├── contexts/              # React Context providers
│   ├── AuthContext.js     # Authentication state
│   ├── CartContext.js     # Shopping cart state
│   └── ToastContext.js    # Notification system
├── lib/                   # Utility libraries
│   ├── api.js             # API client with interceptors
│   └── logger.js          # Production-ready logging
└── public/                # Static assets
```

## 🔐 Authentication & Authorization

### **User Roles**

- **Student**: Default role for registered users
- **Admin**: Full access to admin dashboard and management features

### **Admin Access**

To access the admin dashboard, users must:

1. Be authenticated (logged in)
2. Have `role: "admin"` in their user profile

### **Protected Routes**

- `/admin/*` - Requires admin role
- `/profile` - Requires authentication
- Cart operations - Requires authentication

## 🚀 Deployment Guide

### **Vercel Deployment**

1. **Connect GitHub Repository**

   - Import project in Vercel dashboard
   - Connect to your GitHub repository

2. **Configure Environment Variables**

   ```env
   NEXT_PUBLIC_API_URL=https://your-backend.railway.app/api/v1
   NEXT_PUBLIC_APP_NAME=RG Publication
   NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
   ```

3. **Deploy**
   - Automatic deployment on push to main branch
   - Preview deployments for pull requests

### **Custom Domain**

1. Add domain in Vercel dashboard
2. Configure DNS records
3. SSL certificate automatically provisioned

## 🔧 Development

### **Available Scripts**

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'feat: add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ for education and learning**
