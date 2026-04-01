// Customer Routes
const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/authMiddleware');

// @route   POST /api/customers
// @desc    Create a new customer
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      company,
      status,
      plan,
      notes,
      websiteUrl,
      websiteDevelopedAmount,
      subscriptionStartDate,
      subscriptionEndDate,
      yearlySubscriptionAmount
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email) {
      return res.status(400).json({
        success: false,
        message: 'firstName, lastName, and email are required'
      });
    }

    // Check if customer already exists
    let customer = await Customer.findOne({ email });
    if (customer) {
      return res.status(400).json({
        success: false,
        message: 'Customer with this email already exists'
      });
    }

    // Create customer
    customer = await Customer.create({
      firstName,
      lastName,
      email,
      phone,
      company,
      status,
      plan,
      notes,
      websiteUrl,
      websiteDevelopedAmount,
      subscriptionStartDate: subscriptionStartDate ? new Date(subscriptionStartDate) : null,
      subscriptionEndDate: subscriptionEndDate ? new Date(subscriptionEndDate) : null,
      yearlySubscriptionAmount,
      amountPaid: 0,
      totalAmountReceived: 0,
      paymentHistory: [],
      reminderSent: false
    });

    res.status(201).json({
      success: true,
      message: 'Customer created successfully',
      customer
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/customers
// @desc    Get all customers with advanced search, filter, and sort
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { search, status, sort } = req.query;
    let query = {};

    // Advanced search by name, email, phone, company, or website URL
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { websiteUrl: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Sort order
    let sortObj = {};
    if (sort === 'latest') {
      sortObj = { createdAt: -1 };
    } else if (sort === 'oldest') {
      sortObj = { createdAt: 1 };
    } else if (sort === 'highestPaid') {
      sortObj = { totalAmountReceived: -1 };
    } else if (sort === 'nearestExpiry') {
      sortObj = { subscriptionEndDate: 1 };
    } else {
      sortObj = { createdAt: -1 };
    }

    // Execute query
    const customers = await Customer.find(query).sort(sortObj);

    res.status(200).json({
      success: true,
      count: customers.length,
      customers
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/customers/list/expired
// @desc    Get all customers with expired subscriptions
// @access  Private
router.get('/list/expired', protect, async (req, res) => {
  try {
    const now = new Date();
    const expiredCustomers = await Customer.find({
      subscriptionEndDate: { $lt: now }
    });

    res.status(200).json({
      success: true,
      count: expiredCustomers.length,
      customers: expiredCustomers
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/customers/list/expiring-soon
// @desc    Get all customers with subscriptions expiring within specified days
// @access  Private
router.get('/list/expiring-soon', protect, async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const now = new Date();
    const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    const expiringCustomers = await Customer.find({
      subscriptionEndDate: { $gte: now, $lte: futureDate }
    });

    res.status(200).json({
      success: true,
      count: expiringCustomers.length,
      days,
      customers: expiringCustomers
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/customers/:id
// @desc    Get a single customer
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    res.status(200).json({
      success: true,
      customer
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/customers/:id
// @desc    Update a customer
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    let customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    const {
      firstName,
      lastName,
      email,
      phone,
      company,
      status,
      plan,
      notes,
      websiteUrl,
      websiteDevelopedAmount,
      subscriptionStartDate,
      subscriptionEndDate,
      yearlySubscriptionAmount
    } = req.body;

    // Update basic fields
    if (firstName) customer.firstName = firstName;
    if (lastName) customer.lastName = lastName;
    if (email) customer.email = email;
    if (phone) customer.phone = phone;
    if (company) customer.company = company;
    if (status) customer.status = status;
    if (plan) customer.plan = plan;
    if (notes !== undefined) customer.notes = notes;

    // Update website and subscription fields
    if (websiteUrl !== undefined) customer.websiteUrl = websiteUrl;
    if (websiteDevelopedAmount !== undefined) customer.websiteDevelopedAmount = websiteDevelopedAmount;
    if (subscriptionStartDate !== undefined)
      customer.subscriptionStartDate = subscriptionStartDate ? new Date(subscriptionStartDate) : null;
    if (subscriptionEndDate !== undefined)
      customer.subscriptionEndDate = subscriptionEndDate ? new Date(subscriptionEndDate) : null;
    if (yearlySubscriptionAmount !== undefined) customer.yearlySubscriptionAmount = yearlySubscriptionAmount;

    customer.updatedAt = Date.now();
    customer = await customer.save();

    res.status(200).json({
      success: true,
      message: 'Customer updated successfully',
      customer
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/customers/:id
// @desc    Delete a customer
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    await Customer.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Customer deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/customers/:id/add-payment
// @desc    Record a payment for a customer
// @access  Private
router.post('/:id/add-payment', protect, async (req, res) => {
  try {
    const { paymentAmount, paymentDate, paymentMode, paymentType, remarks } = req.body;

    // Validate required fields
    if (!paymentAmount || paymentAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid paymentAmount is required'
      });
    }

    if (!paymentDate) {
      return res.status(400).json({
        success: false,
        message: 'paymentDate is required'
      });
    }

    if (!paymentMode || !['cash', 'upi', 'bank', 'card', 'cheque', 'other'].includes(paymentMode)) {
      return res.status(400).json({
        success: false,
        message: 'Valid paymentMode (cash/upi/bank/card/cheque/other) is required'
      });
    }

    if (!paymentType || !['website', 'subscription', 'extra'].includes(paymentType)) {
      return res.status(400).json({
        success: false,
        message: 'Valid paymentType (website/subscription/extra) is required'
      });
    }

    let customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Add payment using model method
    customer.addPayment(paymentAmount, new Date(paymentDate), paymentMode, paymentType, remarks || '');
    customer.updatedAt = Date.now();
    customer = await customer.save();

    res.status(201).json({
      success: true,
      message: 'Payment recorded successfully',
      customer
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/customers/:id/payments
// @desc    Get payment history and financial summary for a customer
// @access  Private
router.get('/:id/payments', protect, async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    res.status(200).json({
      success: true,
      customerId: customer._id,
      customerName: `${customer.firstName} ${customer.lastName}`,
      company: customer.company,
      websiteUrl: customer.websiteUrl,
      websiteDevelopedAmount: customer.websiteDevelopedAmount,
      amountPaid: customer.amountPaid,
      amountDue: customer.amountDue,
      totalAmountReceived: customer.totalAmountReceived,
      subscriptionEndDate: customer.subscriptionEndDate,
      yearlySubscriptionAmount: customer.yearlySubscriptionAmount,
      paymentHistory: customer.paymentHistory
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
