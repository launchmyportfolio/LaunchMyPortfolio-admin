/* =====================================================
   API Configuration and Helper Functions
   Change API_BASE_URL to match your backend server
   ===================================================== */

// API Base URL - CHANGE THIS to your backend URL in production
const API_BASE_URL = 'http://localhost:5000/api';

// API Helper - Make authenticated requests
const apiCall = async (endpoint, method = 'GET', body = null) => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const options = {
    method,
    headers,
  };

  if (body && (method === 'POST' || method === 'PUT')) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    const data = await response.json();

    // Check if token is invalid
    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('admin');
      window.location.href = '/login.html';
      return { status: 401, data: { success: false, message: 'Unauthorized' } };
    }

    return { status: response.status, data };
  } catch (error) {
    console.error('API Error:', error);
    return { status: 500, error: error.message };
  }
};

// Authentication APIs
const authAPI = {
  login: (email, password) => apiCall('/auth/login', 'POST', { email, password }),
  register: (name, email, password) => apiCall('/auth/register', 'POST', { name, email, password }),
  getCurrentAdmin: () => apiCall('/auth/me', 'GET'),
};

// Customer APIs
const customerAPI = {
  create: (customerData) => apiCall('/customers', 'POST', customerData),
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/customers?${queryString}`, 'GET');
  },
  getById: (id) => apiCall(`/customers/${id}`, 'GET'),
  update: (id, customerData) => apiCall(`/customers/${id}`, 'PUT', customerData),
  delete: (id) => apiCall(`/customers/${id}`, 'DELETE'),
  
  // Payment APIs
  addPayment: (id, paymentData) => apiCall(`/customers/${id}/add-payment`, 'POST', paymentData),
  getPaymentHistory: (id) => apiCall(`/customers/${id}/payments`, 'GET'),
  
  // Subscription APIs
  getExpiredCustomers: () => apiCall('/customers/list/expired', 'GET'),
  getExpiringCustomers: (days = 7) => apiCall(`/customers/list/expiring-soon?days=${days}`, 'GET'),
  getExpiringSubscriptions: () => apiCall('/customers/list/expiring-soon', 'GET'),
  
  // Helper function to calculate subscription status from customer object
  calculateSubscriptionStatus: (customer) => {
    const endDate = customer && customer.subscriptionEndDate ? new Date(customer.subscriptionEndDate) : null;
    const now = new Date();
    let daysUntilExpiry = null;
    
    if (endDate) {
      daysUntilExpiry = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
    }
    
    return {
      data: {
        success: true,
        subscriptionStatus: customer && customer.status === 'expired' ? 'expired' : (endDate && endDate > now ? 'active' : 'inactive'),
        daysUntilExpiry,
        isExpiringSoon: daysUntilExpiry && daysUntilExpiry <= 7 && daysUntilExpiry > 0
      }
    };
  },
};

// Notification APIs
const notificationAPI = {
  getAll: (limit = 10, skip = 0) => apiCall(`/notifications?limit=${limit}&skip=${skip}`, 'GET'),
  markAsRead: (id) => apiCall(`/notifications/${id}/read`, 'PUT'),
  markAllAsRead: () => apiCall('/notifications/read-all', 'PUT'),
};

// Utility Functions
const utils = {
  // Check if user is logged in
  isLoggedIn: () => {
    return localStorage.getItem('token') !== null;
  },

  // Get stored admin info
  getAdminInfo: () => {
    const admin = localStorage.getItem('admin');
    return admin ? JSON.parse(admin) : null;
  },

  // Set admin info
  setAdminInfo: (admin) => {
    localStorage.setItem('admin', JSON.stringify(admin));
  },

  // Logout
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('admin');
    window.location.href = '/login.html';
  },

  // Format date
  formatDate: (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  },

  // Show notification
  showNotification: (message, type = 'info') => {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.classList.add('show');
    }, 10);

    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  },
};

// Redirect to login if not authenticated on protected pages
const protectPage = () => {
  if (!utils.isLoggedIn()) {
    window.location.href = '/login.html';
  }
};
