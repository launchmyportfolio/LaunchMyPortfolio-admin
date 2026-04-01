// Main Express Server
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const cron = require('node-cron');
const connectDB = require('./config/db');

// Import models and routes
const authRoutes = require('./routes/auth');
const customerRoutes = require('./routes/customers');
const Customer = require('./models/Customer');
const Notification = require('./models/Notification');
const { protect } = require('./middleware/authMiddleware');

// Initialize express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(morgan('dev'));

// Configure CORS for multiple origins
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000').split(',').map(origin => origin.trim());
app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);

// Notification Routes
// @route   GET /api/notifications
// @desc    Get all notifications for admin
// @access  Private
app.get('/api/notifications', protect, async (req, res) => {
  try {
    const { limit = 10, skip = 0 } = req.query;
    
    const notifications = await Notification.find()
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .populate('customerId', 'firstName lastName');

    const totalCount = await Notification.countDocuments();
    const unreadCount = await Notification.countDocuments({ read: false });

    res.status(200).json({
      success: true,
      totalCount,
      unreadCount,
      notifications
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/notifications/:id/read
// @desc    Mark a notification as read
// @access  Private
app.put('/api/notifications/:id/read', protect, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    notification.read = true;
    notification.readAt = new Date();
    await notification.save();

    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      notification
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/notifications/read-all
// @desc    Mark all notifications as read
// @access  Private
app.put('/api/notifications/read-all', protect, async (req, res) => {
  try {
    await Notification.updateMany(
      { read: false },
      { read: true, readAt: new Date() }
    );

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Scheduled job to check for expiring subscriptions (every day at 8 AM)
cron.schedule('0 8 * * *', async () => {
  try {
    console.log('Running subscription expiry check job...');
    
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    // Find expired subscriptions
    const expiredCustomers = await Customer.find({
      subscriptionEndDate: { $lt: now }
    });

    // Find subscriptions expiring within 7 days
    const expiringCustomers = await Customer.find({
      subscriptionEndDate: { $gte: now, $lte: sevenDaysFromNow }
    });

    // Create notifications for expired subscriptions
    for (const customer of expiredCustomers) {
      if (!customer.reminderSent || customer.status === 'active') {
        const existingNotification = await Notification.findOne({
          customerId: customer._id,
          type: 'subscription-expired'
        });

        if (!existingNotification) {
          await Notification.create({
            customerId: customer._id,
            message: `Subscription for ${customer.firstName} ${customer.lastName} has expired (${customer.subscriptionEndDate.toLocaleDateString()})`,
            type: 'subscription-expired',
            read: false
          });
        }

        // Update customer status
        customer.status = 'expired';
        customer.reminderSent = true;
        await customer.save();
      }
    }

    // Create notifications for subscriptions expiring within 7 days
    for (const customer of expiringCustomers) {
      const daysUntilExpiry = Math.ceil((customer.subscriptionEndDate - now) / (1000 * 60 * 60 * 24));
      
      const existingNotification = await Notification.findOne({
        customerId: customer._id,
        type: 'subscription-expiry'
      });

      if (!existingNotification && daysUntilExpiry > 0) {
        await Notification.create({
          customerId: customer._id,
          message: `Subscription for ${customer.firstName} ${customer.lastName} is expiring in ${daysUntilExpiry} days (on ${customer.subscriptionEndDate.toLocaleDateString()})`,
          type: 'subscription-expiry',
          read: false
        });
      }
    }

    console.log(`✓ Subscription check completed. Found ${expiredCustomers.length} expired and ${expiringCustomers.length} expiring subscriptions`);
  } catch (error) {
    console.error('Error in subscription check job:', error.message);
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Server is running' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✓ Server running on http://localhost:${PORT}`);
});
