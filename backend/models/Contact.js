const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
    required: true,
    default: () => `contact_${Date.now()}${Math.random().toString(36).substr(2, 9)}`
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    trim: true,
    match: [/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number']
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true,
    maxlength: [200, 'Subject cannot exceed 200 characters']
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true,
    maxlength: [2000, 'Message cannot exceed 2000 characters']
  },
  type: {
    type: String,
    enum: ['general', 'support', 'sales', 'feedback', 'complaint'],
    default: 'general'
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'resolved', 'closed'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  assignedTo: {
    type: String,
    ref: 'User'
  },
  response: {
    message: String,
    respondedBy: {
      type: String,
      ref: 'User'
    },
    respondedAt: Date
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  ipAddress: String,
  userAgent: String
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
contactSchema.index({ status: 1 });
contactSchema.index({ type: 1 });
contactSchema.index({ priority: 1 });
contactSchema.index({ submittedAt: -1 });
contactSchema.index({ id: 1 });
contactSchema.index({ email: 1 });

// Method to respond to contact submission
contactSchema.methods.respond = function(message, respondedBy) {
  this.response = {
    message,
    respondedBy,
    respondedAt: new Date()
  };
  this.status = 'resolved';
  return this.save();
};

// Method to update status
contactSchema.methods.updateStatus = function(newStatus) {
  this.status = newStatus;
  return this.save();
};

// Transform output to match API specification
contactSchema.methods.toJSON = function() {
  const contact = this.toObject();
  delete contact._id;
  delete contact.__v;
  return contact;
};

module.exports = mongoose.model('Contact', contactSchema);
