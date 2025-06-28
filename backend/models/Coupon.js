const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
    required: true,
    default: () => `coupon_${Date.now()}${Math.random().toString(36).substr(2, 9)}`
  },
  code: {
    type: String,
    required: [true, 'Coupon code is required'],
    unique: true,
    uppercase: true,
    trim: true,
    match: [/^[A-Z0-9]{3,20}$/, 'Coupon code must be 3-20 characters, letters and numbers only']
  },
  name: {
    type: String,
    required: [true, 'Coupon name is required'],
    trim: true,
    maxlength: [100, 'Coupon name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Coupon description is required'],
    trim: true,
    maxlength: [500, 'Coupon description cannot exceed 500 characters']
  },
  type: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: [true, 'Coupon type is required']
  },
  value: {
    type: Number,
    required: [true, 'Coupon value is required'],
    min: [0, 'Coupon value cannot be negative']
  },
  maxDiscount: {
    type: Number,
    min: [0, 'Maximum discount cannot be negative']
  },
  minOrderValue: {
    type: Number,
    default: 0,
    min: [0, 'Minimum order value cannot be negative']
  },
  maxOrderValue: {
    type: Number,
    min: [0, 'Maximum order value cannot be negative']
  },
  usageLimit: {
    total: {
      type: Number,
      min: [1, 'Total usage limit must be at least 1']
    },
    perUser: {
      type: Number,
      default: 1,
      min: [1, 'Per user usage limit must be at least 1']
    }
  },
  usageCount: {
    total: {
      type: Number,
      default: 0
    },
    users: [{
      userId: {
        type: String,
        ref: 'User'
      },
      count: {
        type: Number,
        default: 0
      },
      lastUsed: {
        type: Date,
        default: Date.now
      }
    }]
  },
  validFrom: {
    type: Date,
    required: [true, 'Valid from date is required']
  },
  validUntil: {
    type: Date,
    required: [true, 'Valid until date is required']
  },
  applicableProducts: [{
    type: String,
    ref: 'Product'
  }],
  applicableCategories: [{
    subject: {
      type: String,
      enum: ['Mathematics', 'Science', 'English', 'Social Science']
    },
    classes: [{
      type: Number,
      min: 5,
      max: 12
    }],
    types: [{
      type: String,
      enum: ['Textbook', 'Practice Book', 'Lab Manual', 'Advanced Guide']
    }]
  }],
  excludedProducts: [{
    type: String,
    ref: 'Product'
  }],
  userEligibility: {
    newUsersOnly: {
      type: Boolean,
      default: false
    },
    specificUsers: [{
      type: String,
      ref: 'User'
    }],
    userRoles: [{
      type: String,
      enum: ['student', 'teacher', 'parent']
    }]
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: String,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
couponSchema.index({ code: 1 });
couponSchema.index({ id: 1 });
couponSchema.index({ isActive: 1, validFrom: 1, validUntil: 1 });
couponSchema.index({ 'applicableProducts': 1 });

// Virtual for current status
couponSchema.virtual('status').get(function() {
  const now = new Date();
  
  if (!this.isActive) return 'inactive';
  if (now < this.validFrom) return 'not_started';
  if (now > this.validUntil) return 'expired';
  if (this.usageLimit.total && this.usageCount.total >= this.usageLimit.total) return 'exhausted';
  
  return 'active';
});

// Virtual for discount display
couponSchema.virtual('discountDisplay').get(function() {
  if (this.type === 'percentage') {
    return `${this.value}% OFF`;
  } else {
    return `₹${this.value} OFF`;
  }
});

// Method to validate coupon for user and cart
couponSchema.methods.validateForUser = function(userId, cartTotal, cartItems = []) {
  const now = new Date();
  
  // Check if coupon is active
  if (!this.isActive) {
    throw new Error('Coupon is not active');
  }
  
  // Check date validity
  if (now < this.validFrom) {
    throw new Error('Coupon is not yet valid');
  }
  
  if (now > this.validUntil) {
    throw new Error('Coupon has expired');
  }
  
  // Check total usage limit
  if (this.usageLimit.total && this.usageCount.total >= this.usageLimit.total) {
    throw new Error('Coupon usage limit exceeded');
  }
  
  // Check per-user usage limit
  const userUsage = this.usageCount.users.find(u => u.userId === userId);
  if (userUsage && userUsage.count >= this.usageLimit.perUser) {
    throw new Error('You have already used this coupon the maximum number of times');
  }
  
  // Check minimum order value
  if (cartTotal < this.minOrderValue) {
    throw new Error(`Minimum order value of ₹${this.minOrderValue} required`);
  }
  
  // Check maximum order value
  if (this.maxOrderValue && cartTotal > this.maxOrderValue) {
    throw new Error(`Maximum order value of ₹${this.maxOrderValue} exceeded`);
  }
  
  return true;
};

// Method to calculate discount
couponSchema.methods.calculateDiscount = function(cartTotal, cartItems = []) {
  let applicableAmount = cartTotal;
  
  // If specific products are defined, only apply to those products
  if (this.applicableProducts.length > 0) {
    applicableAmount = cartItems
      .filter(item => this.applicableProducts.includes(item.productId))
      .reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  }
  
  // If categories are defined, apply category filters
  if (this.applicableCategories.length > 0) {
    // This would require product details to check categories
    // For now, we'll use the full cart total
  }
  
  let discount = 0;
  
  if (this.type === 'percentage') {
    discount = (applicableAmount * this.value) / 100;
    
    // Apply maximum discount limit
    if (this.maxDiscount && discount > this.maxDiscount) {
      discount = this.maxDiscount;
    }
  } else {
    discount = Math.min(this.value, applicableAmount);
  }
  
  return Math.round(discount * 100) / 100;
};

// Method to record usage
couponSchema.methods.recordUsage = function(userId) {
  this.usageCount.total += 1;
  
  const userUsage = this.usageCount.users.find(u => u.userId === userId);
  if (userUsage) {
    userUsage.count += 1;
    userUsage.lastUsed = new Date();
  } else {
    this.usageCount.users.push({
      userId,
      count: 1,
      lastUsed: new Date()
    });
  }
  
  return this.save();
};

// Transform output to match API specification
couponSchema.methods.toJSON = function() {
  const coupon = this.toObject();
  delete coupon._id;
  delete coupon.__v;
  return coupon;
};

module.exports = mongoose.model('Coupon', couponSchema);
