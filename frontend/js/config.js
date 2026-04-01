/**
 * Frontend Configuration
 * Handles environment-specific API endpoints
 */

// Detect current environment
const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';

// Set API Base URL based on environment
const config = {
  // Development: localhost
  development: {
    API_BASE_URL: 'http://localhost:5000/api',
    API_TIMEOUT: 10000,
  },

  // Production: Render or other hosting
  production: {
    // Update this with your actual Render backend URL
    // Example: https://launchportfolio-api.onrender.com/api
    // Find your backend URL in Render Dashboard → Services → your-backend-service
    API_BASE_URL: 'https://launchportfolio-api.onrender.com/api',
    API_TIMEOUT: 15000,
  },

  // Staging: for testing before production
  staging: {
    API_BASE_URL: 'https://staging-api.onrender.com/api',
    API_TIMEOUT: 10000,
  },
};

// Get current environment config
const environment = isProduction ? 'production' : 'development';
const appConfig = config[environment];

// Export for use in other scripts
window.APP_CONFIG = appConfig;
window.ENVIRONMENT = environment;

console.log(`🚀 Running in ${environment} mode`);
console.log(`📍 API Base URL: ${appConfig.API_BASE_URL}`);
