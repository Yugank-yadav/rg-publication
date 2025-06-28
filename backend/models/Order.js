const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    default: () => `order_item_${Date.now()}${Math.random().toString(36).substr(2, 9)}`
  },
  productId: {
    type: String,
    required: true,
    ref: 'Product'
  },
  title: {
    type: String,
    required: true
  },
  image: String,
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1']
  },
  unitPrice: {
    type: Number,
    required: true,
    min: [0, 'Unit price cannot be negative']
  },
  totalPrice: {
    type: Number,
    required: true,
    min: [0, 'Total price cannot be negative']
  }
}, {
  _id: false
});

const addressSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: String,
  phone: String,
  addressLine1: { type: String, required: true },
  addressLine2: String,
  city: { type: String, required: true },
  state: { type: String, required: true },
  postalCode: { type: String, required: true },
  country: { type: String, default: 'India' }
}, {
  _id: false
});

const timelineSchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  description: String
}, {
  _id: false
});

const orderSchema = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
    required: true,
    default: () => `ord_${Date.now()}${Math.random().toString(36).substr(2, 9)}`
  },
  orderNumber: {
    type: String,
    unique: true,
    required: true
  },
  userId: {
    type: String,
    required: true,
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  items: [orderItemSchema],
  summary: {
    subtotal: {
      type: Number,
      required: true,
      min: [0, 'Subtotal cannot be negative']
    },
    shipping: {
      type: Number,
      default: 0,
      min: [0, 'Shipping cannot be negative']
    },
    tax: {
      type: Number,
      default: 0,
      min: [0, 'Tax cannot be negative']
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, 'Discount cannot be negative']
    },
    total: {
      type: Number,
      required: true,
      min: [0, 'Total cannot be negative']
    },
    currency: {
      type: String,
      default: 'INR'
    }
  },
  shippingAddress: {
    type: addressSchema,
    required: true
  },
  billingAddress: addressSchema,
  paymentMethod: {
    type: String,
    required: true,
    enum: ['razorpay', 'cod', 'bank_transfer']
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentDetails: {
    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String,
    transactionId: String
  },
  tracking: {
    trackingNumber: String,
    carrier: String,
    status: String,
    estimatedDelivery: Date
  },
  timeline: [timelineSchema],
  notes: String,
  estimatedDelivery: Date,
  deliveredAt: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
orderSchema.index({ userId: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ id: 1 });
orderSchema.index({ createdAt: -1 });

// Generate order number before saving
orderSchema.pre('save', function(next) {
  if (!this.orderNumber) {
    const year = new Date().getFullYear();
    const timestamp = Date.now().toString().slice(-6);
    this.orderNumber = `RG-${year}-${timestamp}`;
  }
  next();
});

// Add timeline entry when status changes
orderSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    const statusDescriptions = {
      pending: 'Order placed',
      confirmed: 'Payment confirmed',
      processing: 'Order being prepared',
      shipped: 'Order shipped',
      delivered: 'Order delivered',
      cancelled: 'Order cancelled'
    };
    
    this.timeline.push({
      status: this.status,
      description: statusDescriptions[this.status] || `Status changed to ${this.status}`
    });
  }
  next();
});

// Method to update status
orderSchema.methods.updateStatus = function(newStatus, description) {
  this.status = newStatus;
  if (description) {
    this.timeline.push({
      status: newStatus,
      description
    });
  }
  return this.save();
};

// Method to add tracking information
orderSchema.methods.addTracking = function(trackingNumber, carrier, estimatedDelivery) {
  this.tracking = {
    trackingNumber,
    carrier,
    status: 'in_transit',
    estimatedDelivery
  };
  return this.save();
};

// Transform output to match API specification
orderSchema.methods.toJSON = function() {
  const order = this.toObject();
  delete order._id;
  delete order.__v;
  return order;
};

module.exports = mongoose.model('Order', orderSchema);
