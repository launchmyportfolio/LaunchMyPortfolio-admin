// Customer Model - Enhanced with Website Projects and Payment Tracking
const mongoose = require('mongoose');

const paymentHistorySchema = new mongoose.Schema({
  paymentDate: {
    type: Date,
    default: Date.now,
    required: true,
  },
  paymentAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  paymentMode: {
    type: String,
    enum: ['cash', 'upi', 'bank', 'card', 'cheque', 'other'],
    default: 'other',
  },
  paymentType: {
    type: String,
    enum: ['website', 'subscription', 'extra'],
    default: 'website',
  },
  remarks: {
    type: String,
    trim: true,
  },
}, { _id: true });

const customerSchema = new mongoose.Schema({
  // Basic Information
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
  },
  phone: {
    type: String,
    trim: true,
  },
  company: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'expired'],
    default: 'pending',
  },
  plan: {
    type: String,
    default: 'none',
  },
  notes: {
    type: String,
    trim: true,
  },

  // Website Development Tracking
  websiteUrl: {
    type: String,
    trim: true,
  },
  websiteDevelopedAmount: {
    type: Number,
    default: 0,
    min: 0,
  },

  // Payment Tracking
  amountPaid: {
    type: Number,
    default: 0,
    min: 0,
  },
  amountDue: {
    type: Number,
    default: 0,
    min: 0,
  },

  // Subscription Information
  subscriptionStartDate: {
    type: Date,
  },
  subscriptionEndDate: {
    type: Date,
  },
  yearlySubscriptionAmount: {
    type: Number,
    default: 0,
    min: 0,
  },

  // Total Income from Customer
  totalAmountReceived: {
    type: Number,
    default: 0,
    min: 0,
  },

  // Payment History - Comprehensive tracking
  paymentHistory: [paymentHistorySchema],

  // Notification Tracking
  reminderSent: {
    type: Boolean,
    default: false,
  },

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Pre-save middleware to calculate derived fields
customerSchema.pre('save', function (next) {
  // Calculate amountDue
  this.amountDue = Math.max(0, this.websiteDevelopedAmount - this.amountPaid);

  // Calculate totalAmountReceived from paymentHistory
  this.totalAmountReceived = this.paymentHistory.reduce((total, payment) => {
    return total + payment.paymentAmount;
  }, 0);

  // Update status if subscription expired
  if (this.subscriptionEndDate && this.subscriptionEndDate < new Date()) {
    this.status = 'expired';
  }

  this.updatedAt = new Date();
  next();
});

// Method to add payment
customerSchema.methods.addPayment = function (paymentAmount, paymentDate, paymentMode, paymentType, remarks) {
  this.paymentHistory.push({
    paymentDate,
    paymentAmount,
    paymentMode,
    paymentType,
    remarks,
  });

  this.amountPaid += paymentAmount;
  this.amountDue = Math.max(0, this.websiteDevelopedAmount - this.amountPaid);
  this.totalAmountReceived = this.paymentHistory.reduce((total, payment) => {
    return total + payment.paymentAmount;
  }, 0);
};

// Method to check if subscription is expired
customerSchema.methods.isSubscriptionExpired = function () {
  return this.subscriptionEndDate && this.subscriptionEndDate < new Date();
};

// Method to check if subscription is expiring soon (within X days)
customerSchema.methods.isExpiringWithinDays = function (days = 7) {
  if (!this.subscriptionEndDate) return false;
  const now = new Date();
  const daysUntilExpiry = (this.subscriptionEndDate - now) / (1000 * 60 * 60 * 24);
  return daysUntilExpiry > 0 && daysUntilExpiry <= days;
};

// Method to get days until expiry
customerSchema.methods.getDaysUntilExpiry = function () {
  if (!this.subscriptionEndDate) return null;
  const now = new Date();
  const daysUntilExpiry = (this.subscriptionEndDate - now) / (1000 * 60 * 60 * 24);
  return Math.ceil(daysUntilExpiry);
};

module.exports = mongoose.model('Customer', customerSchema);
