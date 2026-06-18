require("dotenv").config();
const admin = require("./config/firebase.config");
const { getFirestore } = require("firebase-admin/firestore");

console.log("Firebase Admin đã khởi tạo!");
try {
  const db = getFirestore();
  console.log("Firestore truy cập thành công!");
} catch (e) {
  console.error("Lỗi Firestore:", e);
}
process.exit(0);

