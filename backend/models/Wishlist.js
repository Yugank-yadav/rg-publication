const mongoose = require('mongoose');

const wishlistItemSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    default: () => `wishlist_item_${Date.now()}${Math.random().toString(36).substr(2, 9)}`
  },
  productId: {
    type: String,
    required: true,
    ref: 'Product'
  },
  addedAt: {
    type: Date,
    default: Date.now
  }
}, {
  _id: false
});

const wishlistSchema = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
    required: true,
    default: () => `wishlist_${Date.now()}${Math.random().toString(36).substr(2, 9)}`
  },
  userId: {
    type: String,
    required: true,
    ref: 'User',
    unique: true
  },
  items: [wishlistItemSchema]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
wishlistSchema.index({ userId: 1 });
wishlistSchema.index({ id: 1 });
wishlistSchema.index({ 'items.productId': 1 });

// Virtual for item count
wishlistSchema.virtual('itemCount').get(function() {
  return this.items.length;
});

// Method to add item to wishlist
wishlistSchema.methods.addItem = function(productId) {
  const existingItem = this.items.find(item => item.productId === productId);
  
  if (existingItem) {
    throw new Error('Product already in wishlist');
  }
  
  this.items.push({ productId });
  return this.save();
};

// Method to remove item from wishlist
wishlistSchema.methods.removeItem = function(itemId) {
  const itemIndex = this.items.findIndex(item => item.id === itemId);
  
  if (itemIndex === -1) {
    throw new Error('Wishlist item not found');
  }
  
  this.items.splice(itemIndex, 1);
  return this.save();
};

// Method to check if product is in wishlist
wishlistSchema.methods.hasProduct = function(productId) {
  return this.items.some(item => item.productId === productId);
};

// Method to clear wishlist
wishlistSchema.methods.clear = function() {
  this.items = [];
  return this.save();
};

// Transform output to match API specification
wishlistSchema.methods.toJSON = function() {
  const wishlist = this.toObject();
  delete wishlist._id;
  delete wishlist.__v;
  return wishlist;
};

module.exports = mongoose.model('Wishlist', wishlistSchema);
