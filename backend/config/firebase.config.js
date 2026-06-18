const admin = require("firebase-admin");

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
let privateKey = process.env.FIREBASE_PRIVATE_KEY;

if (privateKey) {
  // Loại bỏ dấu nháy kép/đơn ở đầu và cuối chuỗi nếu có (do copy từ file env)
  privateKey = privateKey.trim().replace(/^["']/, '').replace(/["']$/, '');
  // Thay thế ký tự xuống dòng \n dạng text thành ký tự xuống dòng thực tế
  privateKey = privateKey.replace(/\\n/g, '\n');
}

if (!projectId || !clientEmail || !privateKey) {
  console.warn("Cảnh báo: Thiếu cấu hình Firebase Admin trong biến môi trường.");
}

try {
  admin.initializeApp({
    credential: admin.cert({
      projectId: projectId,
      clientEmail: clientEmail,
      privateKey: privateKey
    })
  });
} catch (error) {
  console.error("Lỗi khi khởi tạo Firebase Admin:", error);
}

module.exports = admin;
