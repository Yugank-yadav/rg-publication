# RG Publication 📚

A modern, interactive educational books and resources website built with Next.js, featuring stunning 3D animations and responsive design.

![RG Publication Website](https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1200&h=600&fit=crop&auto=format)

## ✨ Features

### 🎨 Interactive Design

- **3D Cursor-Tracking Book**: Interactive 3D book in hero section that responds to mouse movement
- **Smooth Animations**: Framer Motion animations throughout the site
- **Responsive Layout**: Mobile-first design that works on all devices
- **Modern UI**: Clean, professional design with custom theme color (#a8f1ff)

### 📖 Content Sections

- **Hero Section**: Interactive 3D book with cursor tracking
- **Best Selling Books**: Featured publications with hover effects
- **Trending Products**: Hot trending books with fire badges
- **New Arrivals**: Latest publications with sparkle badges
- **Testimonials**: Customer reviews with ratings
- **Contact Form**: Business contact information and inquiry form
- **Footer**: Newsletter signup and comprehensive site navigation

### 🚀 Technical Features

- **Next.js 15**: Latest version with App Router
- **Tailwind CSS**: Utility-first CSS framework
- **Framer Motion**: Advanced animations and interactions
- **Image Optimization**: Next.js Image component with external image support
- **Form Handling**: Contact form with validation
- **SEO Optimized**: Proper meta tags and semantic HTML
- **Production Ready**: Zero build errors, optimized for deployment

## 🛠️ Tech Stack

- **Framework**: Next.js 15.3.3
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Heroicons
- **Images**: Next.js Image with Unsplash integration
- **Deployment**: Vercel (recommended)

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/YOUR_USERNAME/rg-publication.git
   cd rg-publication
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Run development server**

   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:3000
   ```

### Build for Production

```bash
# Create production build
npm run build

# Start production server
npm run start
```

## 📁 Project Structure

```
rg-publication/
├── app/                    # Next.js App Router
│   ├── globals.css        # Global styles
│   ├── layout.js          # Root layout
│   └── page.js            # Homepage
├── components/            # React components
│   ├── hero-section.js    # Interactive 3D hero
│   ├── best-selling-books.js
│   ├── trending-products.js
│   ├── new-arrivals.js
│   ├── testimonials.js
│   ├── contact-us.js
│   └── footer.js
├── public/               # Static assets
├── next.config.js        # Next.js configuration
└── tailwind.config.js    # Tailwind configuration
```

## 🎯 Key Components

### Hero Section

- Interactive 3D book with cursor tracking
- Smooth spring physics animations
- Dynamic shadow effects
- Responsive design

### Book Sections

- Grid layouts (1/2/4 columns)
- Hover animations with scale/shadow effects
- Star ratings and pricing
- Category badges

### Contact Form

- Form validation
- Business information display
- Social media links
- Interactive animations

## 🌐 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Connect repository to Vercel
3. Deploy automatically

### Netlify

1. Build the project: `npm run build`
2. Deploy the `out` folder to Netlify

## 📝 Environment Variables

No environment variables required for basic functionality.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- **Unsplash**: High-quality images
- **Heroicons**: Beautiful icon set
- **Framer Motion**: Smooth animations
- **Tailwind CSS**: Utility-first styling

---

**Built with ❤️ for education and learning**
