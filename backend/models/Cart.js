const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    default: () => `cart_item_${Date.now()}${Math.random().toString(36).substr(2, 9)}`
  },
  productId: {
    type: String,
    required: true,
    ref: 'Product'
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1'],
    default: 1
  },
  unitPrice: {
    type: Number,
    required: true,
    min: [0, 'Unit price cannot be negative']
  },
  addedAt: {
    type: Date,
    default: Date.now
  }
}, {
  _id: false
});

const cartSchema = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
    required: true,
    default: () => `cart_${Date.now()}${Math.random().toString(36).substr(2, 9)}`
  },
  userId: {
    type: String,
    required: true,
    ref: 'User',
    unique: true
  },
  items: [cartItemSchema],
  appliedCoupon: {
    code: String,
    discount: Number,
    description: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
cartSchema.index({ userId: 1 });
cartSchema.index({ id: 1 });

// Virtual for cart summary
cartSchema.virtual('summary').get(function() {
  const itemCount = this.items.reduce((total, item) => total + item.quantity, 0);
  const subtotal = this.items.reduce((total, item) => total + (item.unitPrice * item.quantity), 0);
  
  // Calculate discount
  const discount = this.appliedCoupon ? this.appliedCoupon.discount : 0;
  
  // Calculate shipping (free shipping for orders above ₹500)
  const shipping = subtotal >= 500 ? 0 : 50;
  
  // Calculate tax (18% GST)
  const taxableAmount = subtotal - discount;
  const tax = Math.round(taxableAmount * 0.18 * 100) / 100;
  
  // Calculate total
  const total = subtotal - discount + shipping + tax;
  
  return {
    itemCount,
    subtotal: Math.round(subtotal * 100) / 100,
    shipping: Math.round(shipping * 100) / 100,
    tax: Math.round(tax * 100) / 100,
    discount: Math.round(discount * 100) / 100,
    total: Math.round(total * 100) / 100,
    currency: 'INR',
    freeShippingEligible: subtotal >= 500,
    freeShippingThreshold: 500
  };
});

// Method to add item to cart
cartSchema.methods.addItem = function(productId, quantity, unitPrice) {
  const existingItemIndex = this.items.findIndex(item => item.productId === productId);
  
  if (existingItemIndex > -1) {
    // Update existing item
    this.items[existingItemIndex].quantity += quantity;
    this.items[existingItemIndex].unitPrice = unitPrice; // Update price in case it changed
  } else {
    // Add new item
    this.items.push({
      productId,
      quantity,
      unitPrice
    });
  }
  
  return this.save();
};

// Method to update item quantity
cartSchema.methods.updateItem = function(itemId, quantity) {
  const item = this.items.id(itemId);
  if (!item) {
    throw new Error('Cart item not found');
  }
  
  if (quantity <= 0) {
    this.items.pull(itemId);
  } else {
    item.quantity = quantity;
  }
  
  return this.save();
};

// Method to remove item
cartSchema.methods.removeItem = function(itemId) {
  this.items.pull(itemId);
  return this.save();
};

// Method to clear cart
cartSchema.methods.clear = function() {
  this.items = [];
  this.appliedCoupon = undefined;
  return this.save();
};

// Method to apply coupon
cartSchema.methods.applyCoupon = function(couponCode, discount, description) {
  this.appliedCoupon = {
    code: couponCode,
    discount,
    description
  };
  return this.save();
};

// Method to remove coupon
cartSchema.methods.removeCoupon = function() {
  this.appliedCoupon = undefined;
  return this.save();
};

// Transform output to match API specification
cartSchema.methods.toJSON = function() {
  const cart = this.toObject();
  delete cart._id;
  delete cart.__v;
  
  // Transform items
  cart.items = cart.items.map(item => {
    const transformedItem = { ...item };
    transformedItem.totalPrice = Math.round(item.unitPrice * item.quantity * 100) / 100;
    return transformedItem;
  });
  
  return cart;
};

module.exports = mongoose.model('Cart', cartSchema);
