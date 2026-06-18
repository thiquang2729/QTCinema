require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const app = require('./app');
const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend server đang chạy tại http://localhost:${PORT}`);
});
