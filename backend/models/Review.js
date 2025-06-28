const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
    required: true,
    default: () => `review_${Date.now()}${Math.random().toString(36).substr(2, 9)}`
  },
  productId: {
    type: String,
    required: true,
    ref: 'Product'
  },
  userId: {
    type: String,
    required: true,
    ref: 'User'
  },
  orderId: {
    type: String,
    ref: 'Order'
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be between 1 and 5'],
    max: [5, 'Rating must be between 1 and 5']
  },
  title: {
    type: String,
    required: [true, 'Review title is required'],
    trim: true,
    maxlength: [200, 'Review title cannot exceed 200 characters']
  },
  comment: {
    type: String,
    required: [true, 'Review comment is required'],
    trim: true,
    maxlength: [2000, 'Review comment cannot exceed 2000 characters']
  },
  pros: [{
    type: String,
    trim: true,
    maxlength: [100, 'Pro cannot exceed 100 characters']
  }],
  cons: [{
    type: String,
    trim: true,
    maxlength: [100, 'Con cannot exceed 100 characters']
  }],
  verified: {
    type: Boolean,
    default: false
  },
  helpful: {
    count: {
      type: Number,
      default: 0
    },
    users: [{
      type: String,
      ref: 'User'
    }]
  },
  reported: {
    count: {
      type: Number,
      default: 0
    },
    users: [{
      type: String,
      ref: 'User'
    }]
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'hidden'],
    default: 'pending'
  },
  moderatorNotes: {
    type: String,
    trim: true
  },
  images: [{
    id: String,
    url: String,
    alt: String
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
reviewSchema.index({ productId: 1 });
reviewSchema.index({ userId: 1 });
reviewSchema.index({ productId: 1, status: 1 });
reviewSchema.index({ rating: 1 });
reviewSchema.index({ createdAt: -1 });
reviewSchema.index({ id: 1 });

// Compound index for preventing duplicate reviews
reviewSchema.index({ productId: 1, userId: 1 }, { unique: true });

// Virtual for review age
reviewSchema.virtual('reviewAge').get(function() {
  const now = new Date();
  const diffTime = Math.abs(now - this.createdAt);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) return '1 day ago';
  if (diffDays < 30) return `${diffDays} days ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
});

// Method to mark review as helpful
reviewSchema.methods.markHelpful = function(userId) {
  if (this.helpful.users.includes(userId)) {
    throw new Error('User has already marked this review as helpful');
  }
  
  this.helpful.users.push(userId);
  this.helpful.count = this.helpful.users.length;
  return this.save();
};

// Method to unmark review as helpful
reviewSchema.methods.unmarkHelpful = function(userId) {
  const index = this.helpful.users.indexOf(userId);
  if (index === -1) {
    throw new Error('User has not marked this review as helpful');
  }
  
  this.helpful.users.splice(index, 1);
  this.helpful.count = this.helpful.users.length;
  return this.save();
};

// Method to report review
reviewSchema.methods.reportReview = function(userId) {
  if (this.reported.users.includes(userId)) {
    throw new Error('User has already reported this review');
  }
  
  this.reported.users.push(userId);
  this.reported.count = this.reported.users.length;
  
  // Auto-hide if reported by 5 or more users
  if (this.reported.count >= 5) {
    this.status = 'hidden';
  }
  
  return this.save();
};

// Update product rating when review is saved
reviewSchema.post('save', async function() {
  if (this.status === 'approved') {
    await updateProductRating(this.productId);
  }
});

// Update product rating when review is removed
reviewSchema.post('remove', async function() {
  await updateProductRating(this.productId);
});

// Function to update product rating
async function updateProductRating(productId) {
  const Product = mongoose.model('Product');
  const Review = mongoose.model('Review');
  
  const reviews = await Review.find({ 
    productId, 
    status: 'approved' 
  }).select('rating');
  
  if (reviews.length === 0) {
    await Product.findOneAndUpdate(
      { id: productId },
      {
        'rating.average': 0,
        'rating.count': 0,
        'rating.distribution': { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
      }
    );
    return;
  }
  
  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = Math.round((totalRating / reviews.length) * 10) / 10;
  
  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach(review => {
    distribution[review.rating]++;
  });
  
  await Product.findOneAndUpdate(
    { id: productId },
    {
      'rating.average': averageRating,
      'rating.count': reviews.length,
      'rating.distribution': distribution
    }
  );
}

// Transform output to match API specification
reviewSchema.methods.toJSON = function() {
  const review = this.toObject();
  delete review._id;
  delete review.__v;
  return review;
};

module.exports = mongoose.model('Review', reviewSchema);
