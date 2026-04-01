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
    // Get from window.__ENV__ set by Render, or use default
    API_BASE_URL: window.__ENV__?.API_BASE_URL || 'https://launchportfolio-api.onrender.com/api',
    API_TIMEOUT: 15000,
  },

  // Staging: for testing before production
  staging: {
    API_BASE_URL: window.__ENV__?.API_BASE_URL || 'https://staging-api.onrender.com/api',
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
