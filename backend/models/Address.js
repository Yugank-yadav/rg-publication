const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
    required: true,
    default: () => `addr_${Date.now()}${Math.random().toString(36).substr(2, 9)}`
  },
  userId: {
    type: String,
    required: true,
    ref: 'User'
  },
  type: {
    type: String,
    enum: ['home', 'work', 'other'],
    default: 'home'
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    match: [/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number']
  },
  addressLine1: {
    type: String,
    required: [true, 'Address line 1 is required'],
    trim: true,
    maxlength: [255, 'Address line 1 cannot exceed 255 characters']
  },
  addressLine2: {
    type: String,
    trim: true,
    maxlength: [255, 'Address line 2 cannot exceed 255 characters']
  },
  landmark: {
    type: String,
    trim: true,
    maxlength: [100, 'Landmark cannot exceed 100 characters']
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true,
    maxlength: [100, 'City cannot exceed 100 characters']
  },
  state: {
    type: String,
    required: [true, 'State is required'],
    trim: true,
    maxlength: [100, 'State cannot exceed 100 characters']
  },
  postalCode: {
    type: String,
    required: [true, 'Postal code is required'],
    trim: true,
    match: [/^\d{6}$/, 'Please enter a valid 6-digit postal code']
  },
  country: {
    type: String,
    default: 'India',
    trim: true
  },
  coordinates: {
    latitude: {
      type: Number,
      min: [-90, 'Latitude must be between -90 and 90'],
      max: [90, 'Latitude must be between -90 and 90']
    },
    longitude: {
      type: Number,
      min: [-180, 'Longitude must be between -180 and 180'],
      max: [180, 'Longitude must be between -180 and 180']
    }
  },
  deliveryInstructions: {
    type: String,
    trim: true,
    maxlength: [500, 'Delivery instructions cannot exceed 500 characters']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
addressSchema.index({ userId: 1 });
addressSchema.index({ id: 1 });
addressSchema.index({ userId: 1, isDefault: 1 });

// Virtual for full name
addressSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for formatted address
addressSchema.virtual('formattedAddress').get(function() {
  let address = this.addressLine1;
  if (this.addressLine2) address += `, ${this.addressLine2}`;
  if (this.landmark) address += `, ${this.landmark}`;
  address += `, ${this.city}, ${this.state} ${this.postalCode}`;
  if (this.country !== 'India') address += `, ${this.country}`;
  return address;
});

// Ensure only one default address per user
addressSchema.pre('save', async function(next) {
  if (this.isDefault && this.isModified('isDefault')) {
    // Remove default flag from other addresses of the same user
    await this.constructor.updateMany(
      { userId: this.userId, _id: { $ne: this._id } },
      { $set: { isDefault: false } }
    );
  }
  next();
});

// Set as default if it's the first address for the user
addressSchema.pre('save', async function(next) {
  if (this.isNew) {
    const addressCount = await this.constructor.countDocuments({ userId: this.userId });
    if (addressCount === 0) {
      this.isDefault = true;
    }
  }
  next();
});

// Transform output to match API specification
addressSchema.methods.toJSON = function() {
  const address = this.toObject();
  delete address._id;
  delete address.__v;
  return address;
};

module.exports = mongoose.model('Address', addressSchema);
