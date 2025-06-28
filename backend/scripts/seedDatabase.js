const mongoose = require("mongoose");
const Product = require("../models/Product");
const User = require("../models/User");
const Coupon = require("../models/Coupon");
const Notification = require("../models/Notification");
require("dotenv").config();

// Sample products data with comprehensive content
const sampleProducts = [
  {
    title: "Complete Mathematics for Class 10",
    description:
      "Comprehensive mathematics textbook covering all CBSE syllabus topics for Class 10 students.",
    longDescription:
      "This comprehensive mathematics textbook is designed specifically for Class 10 CBSE students. It covers all essential topics including Real Numbers, Polynomials, Linear Equations, Quadratic Equations, Arithmetic Progressions, Triangles, Coordinate Geometry, Trigonometry, Areas and Volumes, Statistics, and Probability.",
    subject: "Mathematics",
    class: 10,
    type: "Textbook",
    price: 350,
    originalPrice: 400,
    isbn: "978-81-234-5678-9",
    author: "Dr. R.K. Sharma",
    edition: "2024",
    pages: 456,
    featured: "bestseller",
    inStock: true,
    stockQuantity: 150,
    images: [
      {
        id: "img_001",
        url: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=600&fit=crop",
        alt: "Complete Mathematics for Class 10 - Cover",
        type: "cover",
      },
    ],
    features: [
      "Complete CBSE syllabus coverage",
      "Step-by-step problem solving",
      "Practice exercises with solutions",
      "Previous year question papers",
      "Conceptual clarity with examples",
      "Board exam preparation tips",
    ],
    tableOfContents: [
      { chapter: 1, title: "Real Numbers", pages: "1-25" },
      { chapter: 2, title: "Polynomials", pages: "26-55" },
      {
        chapter: 3,
        title: "Pair of Linear Equations in Two Variables",
        pages: "56-95",
      },
      { chapter: 4, title: "Quadratic Equations", pages: "96-125" },
      { chapter: 5, title: "Arithmetic Progressions", pages: "126-155" },
      { chapter: 6, title: "Triangles", pages: "156-195" },
      { chapter: 7, title: "Coordinate Geometry", pages: "196-235" },
      { chapter: 8, title: "Introduction to Trigonometry", pages: "236-275" },
      {
        chapter: 9,
        title: "Some Applications of Trigonometry",
        pages: "276-305",
      },
      { chapter: 10, title: "Circles", pages: "306-335" },
      { chapter: 11, title: "Areas Related to Circles", pages: "336-365" },
      { chapter: 12, title: "Surface Areas and Volumes", pages: "366-395" },
      { chapter: 13, title: "Statistics", pages: "396-425" },
      { chapter: 14, title: "Probability", pages: "426-456" },
    ],
    tags: ["CBSE", "Mathematics", "Class 10", "Algebra", "Geometry"],
    rating: {
      average: 4.8,
      count: 1247,
      distribution: { 5: 856, 4: 298, 3: 67, 2: 18, 1: 8 },
    },
    specifications: {
      weight: "450g",
      dimensions: "25cm x 18cm x 2cm",
      binding: "Paperback",
      printType: "Color",
    },
  },
  {
    title: "Advanced Physics for Class 12",
    description:
      "Advanced physics textbook for Class 12 students with detailed explanations and practice problems.",
    longDescription:
      "Comprehensive physics textbook covering all Class 12 topics including Electrostatics, Current Electricity, Magnetic Effects, Electromagnetic Induction, Alternating Current, Electromagnetic Waves, Ray Optics, Wave Optics, Dual Nature of Matter, Atoms, Nuclei, and Semiconductor Electronics.",
    subject: "Science",
    class: 12,
    type: "Textbook",
    price: 450,
    originalPrice: 500,
    isbn: "978-81-234-5679-6",
    author: "Prof. A.K. Singh",
    edition: "2024",
    pages: 520,
    featured: "trending",
    inStock: true,
    stockQuantity: 120,
    images: [
      {
        id: "img_002",
        url: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&h=600&fit=crop",
        alt: "Advanced Physics for Class 12 - Cover",
        type: "cover",
      },
    ],
    features: [
      "Complete NCERT syllabus coverage",
      "Detailed theory with illustrations",
      "Numerical problems with solutions",
      "JEE and NEET preparation",
      "Conceptual diagrams and graphs",
      "Previous year board questions",
    ],
    tableOfContents: [
      { chapter: 1, title: "Electric Charges and Fields", pages: "1-35" },
      {
        chapter: 2,
        title: "Electrostatic Potential and Capacitance",
        pages: "36-70",
      },
      { chapter: 3, title: "Current Electricity", pages: "71-105" },
      { chapter: 4, title: "Moving Charges and Magnetism", pages: "106-140" },
      { chapter: 5, title: "Magnetism and Matter", pages: "141-175" },
      { chapter: 6, title: "Electromagnetic Induction", pages: "176-210" },
      { chapter: 7, title: "Alternating Current", pages: "211-245" },
      { chapter: 8, title: "Electromagnetic Waves", pages: "246-280" },
      {
        chapter: 9,
        title: "Ray Optics and Optical Instruments",
        pages: "281-315",
      },
      { chapter: 10, title: "Wave Optics", pages: "316-350" },
      {
        chapter: 11,
        title: "Dual Nature of Radiation and Matter",
        pages: "351-385",
      },
      { chapter: 12, title: "Atoms", pages: "386-420" },
      { chapter: 13, title: "Nuclei", pages: "421-455" },
      { chapter: 14, title: "Semiconductor Electronics", pages: "456-520" },
    ],
    tags: ["CBSE", "Physics", "Class 12", "Mechanics", "Optics"],
    rating: {
      average: 4.9,
      count: 892,
      distribution: { 5: 712, 4: 134, 3: 32, 2: 10, 1: 4 },
    },
    specifications: {
      weight: "520g",
      dimensions: "25cm x 18cm x 2.5cm",
      binding: "Paperback",
      printType: "Color",
    },
  },
  {
    title: "Chemistry Lab Manual Class 11",
    description:
      "Comprehensive chemistry lab manual with detailed experiments and procedures.",
    subject: "Science",
    class: 11,
    type: "Lab Manual",
    price: 280,
    originalPrice: 320,
    isbn: "978-81-234-5680-2",
    author: "Dr. M.S. Reddy",
    edition: "2024",
    pages: 180,
    featured: "new-arrival",
    inStock: true,
    stockQuantity: 200,
    images: [
      {
        id: "img_003",
        url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop",
        alt: "Chemistry Lab Manual Class 11 - Cover",
        type: "cover",
      },
    ],
    tags: ["CBSE", "Chemistry", "Class 11", "Lab", "Experiments"],
    rating: {
      average: 4.7,
      count: 456,
      distribution: { 5: 298, 4: 112, 3: 34, 2: 8, 1: 4 },
    },
  },
  {
    title: "English Grammar and Composition Class 9",
    description:
      "Complete English grammar guide with composition writing techniques.",
    subject: "English",
    class: 9,
    type: "Textbook",
    price: 320,
    originalPrice: 360,
    isbn: "978-81-234-5681-9",
    author: "Mrs. P. Sharma",
    edition: "2024",
    pages: 380,
    featured: "bestseller",
    inStock: true,
    stockQuantity: 180,
    images: [
      {
        id: "img_004",
        url: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=600&fit=crop",
        alt: "English Grammar and Composition Class 9 - Cover",
        type: "cover",
      },
    ],
    tags: ["CBSE", "English", "Class 9", "Grammar", "Composition"],
    rating: {
      average: 4.6,
      count: 723,
      distribution: { 5: 456, 4: 189, 3: 56, 2: 15, 1: 7 },
    },
  },
  {
    title: "Social Science for Class 8",
    description:
      "Comprehensive social science textbook covering history, geography, and civics.",
    subject: "Social Science",
    class: 8,
    type: "Textbook",
    price: 290,
    originalPrice: 330,
    isbn: "978-81-234-5682-6",
    author: "Dr. R.N. Gupta",
    edition: "2024",
    pages: 420,
    featured: "trending",
    inStock: true,
    stockQuantity: 160,
    images: [
      {
        id: "img_005",
        url: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=400&h=600&fit=crop",
        alt: "Social Science for Class 8 - Cover",
        type: "cover",
      },
    ],
    tags: ["CBSE", "Social Science", "Class 8", "History", "Geography"],
    rating: {
      average: 4.5,
      count: 634,
      distribution: { 5: 378, 4: 189, 3: 45, 2: 16, 1: 6 },
    },
  },
  {
    title: "Mathematics Practice Book Class 10",
    description:
      "Extensive practice problems and solutions for Class 10 mathematics.",
    subject: "Mathematics",
    class: 10,
    type: "Practice Book",
    price: 250,
    originalPrice: 280,
    isbn: "978-81-234-5683-3",
    author: "Prof. S.K. Jain",
    edition: "2024",
    pages: 320,
    featured: null,
    inStock: true,
    stockQuantity: 140,
    images: [
      {
        id: "img_006",
        url: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400&h=600&fit=crop",
        alt: "Mathematics Practice Book Class 10 - Cover",
        type: "cover",
      },
    ],
    tags: ["CBSE", "Mathematics", "Class 10", "Practice", "Solutions"],
    rating: {
      average: 4.4,
      count: 512,
      distribution: { 5: 289, 4: 156, 3: 45, 2: 15, 1: 7 },
    },
  },

  // Additional comprehensive products for all classes

  // Class 5 Products
  {
    title: "Mathematics for Class 5",
    description:
      "Foundation mathematics textbook for Class 5 students with colorful illustrations.",
    longDescription:
      "A comprehensive mathematics textbook designed for Class 5 students, covering basic arithmetic, geometry, and problem-solving skills with engaging activities and colorful illustrations.",
    subject: "Mathematics",
    class: 5,
    type: "Textbook",
    price: 250,
    originalPrice: 300,
    isbn: "978-81-234-5001-1",
    author: "Mrs. S. Gupta",
    edition: "2024",
    pages: 280,
    featured: null,
    inStock: true,
    stockQuantity: 200,
    images: [
      {
        id: "img_101",
        url: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400&h=600&fit=crop",
        alt: "Mathematics for Class 5 - Cover",
        type: "cover",
      },
    ],
    features: [
      "Age-appropriate content",
      "Colorful illustrations",
      "Step-by-step explanations",
      "Practice exercises",
      "Fun activities and games",
      "Parent guidance notes",
    ],
    tableOfContents: [
      { chapter: 1, title: "Numbers and Place Value", pages: "1-25" },
      { chapter: 2, title: "Addition and Subtraction", pages: "26-50" },
      { chapter: 3, title: "Multiplication and Division", pages: "51-75" },
      { chapter: 4, title: "Fractions", pages: "76-100" },
      { chapter: 5, title: "Decimals", pages: "101-125" },
      { chapter: 6, title: "Measurement", pages: "126-150" },
      { chapter: 7, title: "Geometry", pages: "151-175" },
      { chapter: 8, title: "Data Handling", pages: "176-200" },
      { chapter: 9, title: "Patterns", pages: "201-225" },
      { chapter: 10, title: "Money", pages: "226-250" },
      { chapter: 11, title: "Time", pages: "251-280" },
    ],
    tags: ["CBSE", "Mathematics", "Class 5", "Foundation", "Primary"],
    rating: {
      average: 4.6,
      count: 345,
      distribution: { 5: 234, 4: 78, 3: 23, 2: 7, 1: 3 },
    },
    specifications: {
      weight: "350g",
      dimensions: "24cm x 17cm x 1.5cm",
      binding: "Paperback",
      printType: "Color",
    },
  },

  {
    title: "Science for Class 5",
    description:
      "Interactive science textbook introducing basic scientific concepts to young learners.",
    longDescription:
      "An engaging science textbook for Class 5 students that introduces fundamental scientific concepts through experiments, observations, and real-world examples.",
    subject: "Science",
    class: 5,
    type: "Textbook",
    price: 280,
    originalPrice: 320,
    isbn: "978-81-234-5002-8",
    author: "Dr. P. Kumar",
    edition: "2024",
    pages: 240,
    featured: null,
    inStock: true,
    stockQuantity: 180,
    images: [
      {
        id: "img_102",
        url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop",
        alt: "Science for Class 5 - Cover",
        type: "cover",
      },
    ],
    features: [
      "Hands-on experiments",
      "Real-world examples",
      "Safety guidelines",
      "Observation activities",
      "Environmental awareness",
      "STEM learning approach",
    ],
    tableOfContents: [
      { chapter: 1, title: "Plants Around Us", pages: "1-20" },
      { chapter: 2, title: "Animals Around Us", pages: "21-40" },
      { chapter: 3, title: "My Body", pages: "41-60" },
      { chapter: 4, title: "Food and Health", pages: "61-80" },
      { chapter: 5, title: "Matter and Materials", pages: "81-100" },
      { chapter: 6, title: "Force and Energy", pages: "101-120" },
      { chapter: 7, title: "Light and Sound", pages: "121-140" },
      { chapter: 8, title: "Water", pages: "141-160" },
      { chapter: 9, title: "Air", pages: "161-180" },
      { chapter: 10, title: "Weather and Climate", pages: "181-200" },
      { chapter: 11, title: "Our Environment", pages: "201-240" },
    ],
    tags: ["CBSE", "Science", "Class 5", "Experiments", "Nature"],
    rating: {
      average: 4.5,
      count: 289,
      distribution: { 5: 189, 4: 67, 3: 23, 2: 7, 1: 3 },
    },
    specifications: {
      weight: "320g",
      dimensions: "24cm x 17cm x 1.3cm",
      binding: "Paperback",
      printType: "Color",
    },
  },
];

// Sample admin user
const adminUser = {
  firstName: "Admin",
  lastName: "User",
  email: "admin@rgpublication.com",
  password: "admin123",
  role: "admin",
  isEmailVerified: true,
};

// Sample coupons
const sampleCoupons = [
  {
    code: "SAVE10",
    name: "Save 10% on Orders Above ₹500",
    description:
      "Get 10% discount on orders above ₹500. Maximum discount ₹100.",
    type: "percentage",
    value: 10,
    maxDiscount: 100,
    minOrderValue: 500,
    usageLimit: {
      total: 1000,
      perUser: 3,
    },
    validFrom: new Date(),
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    isActive: true,
  },
  {
    code: "WELCOME50",
    name: "Welcome Offer - ₹50 Off",
    description: "Flat ₹50 off on your first order above ₹300.",
    type: "fixed",
    value: 50,
    minOrderValue: 300,
    usageLimit: {
      total: 500,
      perUser: 1,
    },
    validFrom: new Date(),
    validUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
    userEligibility: {
      newUsersOnly: true,
    },
    isActive: true,
  },
  {
    code: "STUDENT15",
    name: "Student Special - 15% Off",
    description: "Special 15% discount for students on all textbooks.",
    type: "percentage",
    value: 15,
    maxDiscount: 200,
    minOrderValue: 200,
    usageLimit: {
      total: 2000,
      perUser: 5,
    },
    validFrom: new Date(),
    validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
    userEligibility: {
      userRoles: ["student"],
    },
    applicableCategories: [
      {
        subject: "Mathematics",
        types: ["Textbook"],
      },
      {
        subject: "Science",
        types: ["Textbook"],
      },
    ],
    isActive: true,
  },
  {
    code: "BULK25",
    name: "Bulk Order Discount",
    description: "₹25 off on orders above ₹1000. Perfect for bulk purchases.",
    type: "fixed",
    value: 25,
    minOrderValue: 1000,
    usageLimit: {
      total: 100,
      perUser: 2,
    },
    validFrom: new Date(),
    validUntil: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
    isActive: true,
  },
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/rg-publication"
    );
    console.log("✅ Connected to MongoDB");

    // Clear existing data
    await Product.deleteMany({});
    await User.deleteMany({});
    await Coupon.deleteMany({});
    await Notification.deleteMany({});
    console.log("🗑️ Cleared existing data");

    // Insert sample products
    const products = await Product.insertMany(sampleProducts);
    console.log(`📚 Inserted ${products.length} sample products`);

    // Insert admin user
    const admin = new User(adminUser);
    await admin.save();
    console.log("👤 Created admin user");

    // Insert sample coupons
    const coupons = await Coupon.insertMany(sampleCoupons);
    console.log(`🎫 Inserted ${coupons.length} sample coupons`);

    // Create sample notifications for admin user
    const sampleNotifications = [
      {
        userId: admin.id,
        type: "system",
        category: "info",
        title: "Welcome to RG Publication Admin Panel",
        message:
          "Your admin account has been successfully created. You can now manage users, products, and orders.",
        channels: {
          email: { enabled: false },
          push: { enabled: false },
          inApp: { enabled: true },
        },
        priority: "medium",
        actionUrl: "/admin/dashboard",
        actionText: "Go to Dashboard",
      },
      {
        userId: admin.id,
        type: "system",
        category: "success",
        title: "Database Seeding Completed",
        message: "Sample data has been successfully loaded into the database.",
        channels: {
          email: { enabled: false },
          push: { enabled: false },
          inApp: { enabled: true },
        },
        priority: "low",
      },
    ];

    const notifications = await Notification.insertMany(sampleNotifications);
    console.log(`🔔 Inserted ${notifications.length} sample notifications`);

    console.log("\n🎉 Database seeding completed successfully!");
    console.log("\nSample data created:");
    console.log(`- ${products.length} products`);
    console.log("- 1 admin user (admin@rgpublication.com / admin123)");
    console.log(`- ${coupons.length} sample coupons`);
    console.log(`- ${notifications.length} sample notifications`);
    console.log("\nSample coupons:");
    coupons.forEach((coupon) => {
      console.log(`  - ${coupon.code}: ${coupon.name}`);
    });
    console.log("\nNew API endpoints available:");
    console.log("- Admin Management: /api/v1/admin/*");
    console.log("- File Uploads: /api/v1/upload/*");
    console.log("- Analytics: /api/v1/analytics/*");
    console.log("- Notifications: /api/v1/notifications/*");
    console.log("- System Management: /api/v1/system/*");
    console.log("\nYou can now start the server and test the APIs.");
  } catch (error) {
    console.error("❌ Database seeding failed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("📡 Disconnected from MongoDB");
  }
}

// Run the seeding script
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase, sampleProducts, adminUser };
