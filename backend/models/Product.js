const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
    required: true,
    default: () => `prod_${Date.now()}${Math.random().toString(36).substr(2, 9)}`
  },
  title: {
    type: String,
    required: [true, 'Product title is required'],
    trim: true,
    maxlength: [255, 'Title cannot exceed 255 characters']
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    trim: true
  },
  longDescription: {
    type: String,
    trim: true
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    enum: ['Mathematics', 'Science', 'English', 'Social Science']
  },
  class: {
    type: Number,
    required: [true, 'Class is required'],
    min: [5, 'Class must be between 5 and 12'],
    max: [12, 'Class must be between 5 and 12']
  },
  type: {
    type: String,
    required: [true, 'Product type is required'],
    enum: ['Textbook', 'Practice Book', 'Lab Manual', 'Advanced Guide']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  originalPrice: {
    type: Number,
    min: [0, 'Original price cannot be negative']
  },
  currency: {
    type: String,
    default: 'INR'
  },
  isbn: {
    type: String,
    trim: true,
    unique: true,
    sparse: true
  },
  author: {
    type: String,
    required: [true, 'Author is required'],
    trim: true,
    maxlength: [100, 'Author name cannot exceed 100 characters']
  },
  publisher: {
    type: String,
    default: 'RG Publication',
    trim: true
  },
  edition: {
    type: String,
    trim: true
  },
  pages: {
    type: Number,
    min: [1, 'Pages must be at least 1']
  },
  language: {
    type: String,
    default: 'English'
  },
  featured: {
    type: String,
    enum: ['bestseller', 'trending', 'new-arrival'],
    default: null
  },
  inStock: {
    type: Boolean,
    default: true
  },
  stockQuantity: {
    type: Number,
    default: 0,
    min: [0, 'Stock quantity cannot be negative']
  },
  images: [{
    id: String,
    url: {
      type: String,
      required: true
    },
    alt: String,
    type: {
      type: String,
      enum: ['cover', 'back', 'inside', 'sample'],
      default: 'cover'
    }
  }],
  tableOfContents: [{
    chapter: Number,
    title: String,
    pages: String
  }],
  features: [String],
  tags: [String],
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    },
    distribution: {
      5: { type: Number, default: 0 },
      4: { type: Number, default: 0 },
      3: { type: Number, default: 0 },
      2: { type: Number, default: 0 },
      1: { type: Number, default: 0 }
    }
  },
  specifications: {
    weight: String,
    dimensions: String,
    binding: String,
    printType: String,
    paperQuality: String
  },
  shipping: {
    freeShippingEligible: {
      type: Boolean,
      default: true
    },
    estimatedDelivery: String,
    weight: Number
  },
  seo: {
    slug: {
      type: String,
      unique: true,
      sparse: true
    },
    metaTitle: String,
    metaDescription: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
productSchema.index({ subject: 1, class: 1 });
productSchema.index({ featured: 1 });
productSchema.index({ inStock: 1 });
productSchema.index({ 'seo.slug': 1 });
productSchema.index({ id: 1 });
productSchema.index({ title: 'text', description: 'text', tags: 'text' });

// Virtual for discount percentage
productSchema.virtual('discount').get(function() {
  if (this.originalPrice && this.originalPrice > this.price) {
    return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100 * 100) / 100;
  }
  return 0;
});

// Generate SEO slug before saving
productSchema.pre('save', function(next) {
  if (!this.seo.slug && this.title) {
    this.seo.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  next();
});

// Transform output to match API specification
productSchema.methods.toJSON = function() {
  const product = this.toObject();
  delete product._id;
  delete product.__v;
  return product;
};

module.exports = mongoose.model('Product', productSchema);
