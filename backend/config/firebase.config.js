const admin = require("firebase-admin");

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY;

if (!projectId || !clientEmail || !privateKey) {
  console.warn("Cảnh báo: Thiếu cấu hình Firebase Admin trong biến môi trường.");
}

admin.initializeApp({
  credential: admin.cert({
    projectId: projectId,
    clientEmail: clientEmail,
    // Thay thế ký tự xuống dòng thực tế (\n) từ chuỗi private key
    privateKey: privateKey ? privateKey.replace(/\\n/g, '\n') : undefined
  })
});

module.exports = admin;
