// Notification Model - For storing subscription expiry and other notification reminders
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['subscription-expiry', 'subscription-expired', 'payment-due', 'reminder'],
    default: 'subscription-expiry',
  },
  read: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  readAt: {
    type: Date,
  },
});

module.exports = mongoose.model('Notification', notificationSchema);
