require("dotenv").config();
const admin = require("./config/firebase.config");
console.log("Firebase Admin đã khởi tạo thành công!");
console.log("App Name:", admin.app().name);
process.exit(0);
