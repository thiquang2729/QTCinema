// API Configuration
const API_CONFIG = {
  BASE_URL: process.env.API_BASE_URL || 'https://ophim1.com',
  TIMEOUT: 10000,
  HEADERS: {
    accept: 'application/json'
  }
};

module.exports = API_CONFIG;
