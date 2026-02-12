// API Configuration
const API_CONFIG = {
  BASE_URL: process.env.API_BASE_URL || 'https://ophim1.com',
  TIMEOUT: 10000,
  HEADERS: {
    'accept': 'application/json',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache'
  }
};

module.exports = API_CONFIG;
