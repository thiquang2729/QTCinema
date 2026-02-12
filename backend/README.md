# Backend API Proxy - README

## Tổng quan

Backend Node.js này hoạt động như một **API proxy** để:
- Bảo vệ API keys khỏi bị lộ trên frontend
- Kiểm soát và validate requests
- Transform data trước khi trả về cho frontend
- Cache responses nếu cần

## Cấu trúc thư mục

```
backend/
├── routes/
│   └── movies.js          # Movie API routes
├── server.js              # Express server chính
├── .env.example           # Environment variables mẫu
├── .gitignore
└── package.json
```

## Cài đặt

```bash
cd backend
npm install
```

## Cấu hình

1. Tạo file `.env` từ `.env.example`:
```bash
cp .env.example .env
```

2. Thêm API key vào `.env`:
```env
PORT=5000
API_BASE_URL=https://api.themoviedb.org/3
API_KEY=your_tmdb_api_key_here
```

## Chạy Backend

```bash
# Production
npm start

# Development
npm run dev
```

Backend sẽ chạy tại: `http://localhost:5000`

## API Endpoints

### 1. Health Check
```
GET /health
```
Kiểm tra backend có hoạt động không.

### 2. Lấy danh sách phim
```
GET /api/movies
```
Trả về danh sách phim phổ biến.

### 3. Lấy chi tiết phim
```
GET /api/movies/:id
```
Trả về thông tin chi tiết của phim theo ID.

### 4. Tìm kiếm phim
```
GET /api/movies/search/:query
```
Tìm kiếm phim theo từ khóa.

## Tích hợp với Frontend

Frontend đã được cấu hình để gọi backend tại `http://localhost:5000/api`.

File cấu hình: `frontend/src/services/axiosInstance.js`

## Lưu ý bảo mật

- **KHÔNG** commit file `.env` lên Git
- API key được lưu trữ an toàn trên server
- Frontend không bao giờ biết API key
