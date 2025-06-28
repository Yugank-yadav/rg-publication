const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
    required: true,
    default: () => `notif_${Date.now()}${Math.random().toString(36).substr(2, 9)}`
  },
  userId: {
    type: String,
    required: true,
    ref: 'User'
  },
  type: {
    type: String,
    enum: ['order', 'product', 'promotion', 'system', 'review', 'wishlist'],
    required: true
  },
  category: {
    type: String,
    enum: ['info', 'success', 'warning', 'error'],
    default: 'info'
  },
  title: {
    type: String,
    required: [true, 'Notification title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  message: {
    type: String,
    required: [true, 'Notification message is required'],
    trim: true,
    maxlength: [1000, 'Message cannot exceed 1000 characters']
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  channels: {
    email: {
      enabled: {
        type: Boolean,
        default: false
      },
      sent: {
        type: Boolean,
        default: false
      },
      sentAt: Date,
      error: String
    },
    push: {
      enabled: {
        type: Boolean,
        default: false
      },
      sent: {
        type: Boolean,
        default: false
      },
      sentAt: Date,
      error: String
    },
    inApp: {
      enabled: {
        type: Boolean,
        default: true
      },
      read: {
        type: Boolean,
        default: false
      },
      readAt: Date
    }
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  scheduledFor: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date
  },
  actionUrl: {
    type: String,
    trim: true
  },
  actionText: {
    type: String,
    trim: true,
    maxlength: [50, 'Action text cannot exceed 50 characters']
  },
  metadata: {
    orderId: String,
    productId: String,
    reviewId: String,
    couponCode: String,
    source: String,
    campaign: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ id: 1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ 'channels.inApp.read': 1 });
notificationSchema.index({ scheduledFor: 1 });
notificationSchema.index({ expiresAt: 1 });

// Virtual for read status
notificationSchema.virtual('isRead').get(function() {
  return this.channels.inApp.read;
});

// Virtual for delivery status
notificationSchema.virtual('deliveryStatus').get(function() {
  const status = {
    email: this.channels.email.enabled ? (this.channels.email.sent ? 'sent' : 'pending') : 'disabled',
    push: this.channels.push.enabled ? (this.channels.push.sent ? 'sent' : 'pending') : 'disabled',
    inApp: this.channels.inApp.enabled ? 'delivered' : 'disabled'
  };
  return status;
});

// Method to mark as read
notificationSchema.methods.markAsRead = function() {
  this.channels.inApp.read = true;
  this.channels.inApp.readAt = new Date();
  return this.save();
};

// Method to mark email as sent
notificationSchema.methods.markEmailSent = function(error = null) {
  this.channels.email.sent = !error;
  this.channels.email.sentAt = new Date();
  if (error) {
    this.channels.email.error = error;
  }
  return this.save();
};

// Method to mark push as sent
notificationSchema.methods.markPushSent = function(error = null) {
  this.channels.push.sent = !error;
  this.channels.push.sentAt = new Date();
  if (error) {
    this.channels.push.error = error;
  }
  return this.save();
};

// Static method to create notification
notificationSchema.statics.createNotification = async function(data) {
  const notification = new this(data);
  await notification.save();
  
  // Trigger delivery based on enabled channels
  if (notification.channels.email.enabled) {
    // Queue email delivery
    await this.queueEmailDelivery(notification);
  }
  
  if (notification.channels.push.enabled) {
    // Queue push notification delivery
    await this.queuePushDelivery(notification);
  }
  
  return notification;
};

// Static method to queue email delivery
notificationSchema.statics.queueEmailDelivery = async function(notification) {
  // This would integrate with email service (SendGrid, Nodemailer, etc.)
  console.log(`📧 Queuing email notification: ${notification.title}`);
  
  // Simulate email sending
  setTimeout(async () => {
    try {
      // Email sending logic would go here
      await notification.markEmailSent();
      console.log(`✅ Email sent for notification: ${notification.id}`);
    } catch (error) {
      await notification.markEmailSent(error.message);
      console.error(`❌ Email failed for notification: ${notification.id}`, error);
    }
  }, 1000);
};

// Static method to queue push delivery
notificationSchema.statics.queuePushDelivery = async function(notification) {
  // This would integrate with push service (Firebase, OneSignal, etc.)
  console.log(`📱 Queuing push notification: ${notification.title}`);
  
  // Simulate push sending
  setTimeout(async () => {
    try {
      // Push sending logic would go here
      await notification.markPushSent();
      console.log(`✅ Push sent for notification: ${notification.id}`);
    } catch (error) {
      await notification.markPushSent(error.message);
      console.error(`❌ Push failed for notification: ${notification.id}`, error);
    }
  }, 500);
};

// Auto-delete expired notifications
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Transform output to match API specification
notificationSchema.methods.toJSON = function() {
  const notification = this.toObject();
  delete notification._id;
  delete notification.__v;
  return notification;
};

module.exports = mongoose.model('Notification', notificationSchema);
