# Backend Architecture - MVC Pattern

## Tổng quan

Backend được tổ chức theo mô hình **MVC (Model-View-Controller)** với các layers riêng biệt để dễ bảo trì và mở rộng.

## Cấu trúc thư mục

```
backend/
├── config/
│   └── api.config.js           # API configuration
├── controllers/
│   └── movieController.js      # HTTP request handlers
├── services/
│   └── movieService.js         # Business logic
├── repositories/
│   └── movieRepository.js      # Data access layer
├── models/
│   └── Movie.js                # Data models
├── routes/
│   └── movies.js               # Route definitions
└── server.js                   # Express app
```

---

## Các Layers

### 1. Repository Layer (Data Access)

**File:** [movieRepository.js](file:///d:/Dev/Code/QTcinema/backend/repositories/movieRepository.js)

**Nhiệm vụ:**
- Gọi API bên ngoài (OPhim)
- Sau này sẽ tương tác với Database

**Methods:**
- `getHomeMovies(page)` - Lấy danh sách phim
- `getMovieBySlug(slug)` - Lấy chi tiết phim
- `searchMovies(keyword, page)` - Tìm kiếm
- `getMoviesByCategory(categorySlug, page)` - Theo thể loại
- `getMoviesByCountry(countrySlug, page)` - Theo quốc gia

**Ví dụ:**
```javascript
const movieRepository = require('../repositories/movieRepository');
const data = await movieRepository.getHomeMovies(1);
```

---

### 2. Service Layer (Business Logic)

**File:** [movieService.js](file:///d:/Dev/Code/QTcinema/backend/services/movieService.js)

**Nhiệm vụ:**
- Xử lý business logic
- Transform data từ repository
- Validate dữ liệu

**Methods:**
- `transformMovie(movie)` - Transform movie data
- `transformMovieDetail(movieData)` - Transform chi tiết
- `getHomeMovies(page)` - Lấy danh sách (có transform)
- `getMovieBySlug(slug)` - Lấy chi tiết (có transform)
- `searchMovies(keyword, page)` - Tìm kiếm (có transform)

**Ví dụ:**
```javascript
const movieService = require('../services/movieService');
const result = await movieService.getHomeMovies(1);
// result đã được transform phù hợp với frontend
```

---

### 3. Controller Layer (Request Handlers)

**File:** [movieController.js](file:///d:/Dev/Code/QTcinema/backend/controllers/movieController.js)

**Nhiệm vụ:**
- Xử lý HTTP requests/responses
- Validate input từ client
- Format response trả về
- Không chứa business logic

**Methods:**
- `getHomeMovies(req, res)` - Handle GET /api/movies
- `getMovieBySlug(req, res)` - Handle GET /api/movies/:slug
- `searchMovies(req, res)` - Handle GET /api/movies/search/:keyword

**Ví dụ:**
```javascript
async getHomeMovies(req, res) {
  try {
    const page = req.query.page || 1;
    const result = await movieService.getHomeMovies(page);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```

---

### 4. Routes Layer

**File:** [movies.js](file:///d:/Dev/Code/QTcinema/backend/routes/movies.js)

**Nhiệm vụ:**
- Định nghĩa API endpoints
- Map routes đến controller methods

**Endpoints:**
```javascript
GET  /api/movies                  → getHomeMovies
GET  /api/movies/search/:keyword  → searchMovies
GET  /api/movies/category/:slug   → getMoviesByCategory
GET  /api/movies/country/:slug    → getMoviesByCountry
GET  /api/movies/:slug            → getMovieBySlug
```

---

### 5. Models Layer

**File:** [Movie.js](file:///d:/Dev/Code/QTcinema/backend/models/Movie.js)

**Nhiệm vụ:**
- Định nghĩa cấu trúc dữ liệu
- Validate data
- Sau này sẽ mapping với Database schema

---

### 6. Config Layer

**File:** [api.config.js](file:///d:/Dev/Code/QTcinema/backend/config/api.config.js)

**Nhiệm vụ:**
- Centralized configuration
- API URLs, timeouts, headers

---

## Flow Diagram

```
Request
   ↓
Routes (movies.js)
   ↓
Controller (movieController.js)
   ↓
Service (movieService.js)
   ↓
Repository (movieRepository.js)
   ↓
External API / Database
   ↓
Transform & Return
```

---

## Lợi ích của kiến trúc này

### ✅ Separation of Concerns
Mỗi layer có trách nhiệm riêng, không overlap.

### ✅ Dễ bảo trì
Thay đổi business logic chỉ cần sửa Service layer.

### ✅ Dễ test
Có thể test từng layer độc lập.

### ✅ Dễ mở rộng
Thêm tính năng mới chỉ cần thêm methods vào đúng layer.

### ✅ Ready cho Database
Repository layer sẵn sàng để thay thế API bằng Database.

---

## Ví dụ sử dụng

### Thêm endpoint mới

**1. Repository** - Thêm method gọi API:
```javascript
// repositories/movieRepository.js
async getTrendingMovies() {
  const response = await this.apiClient.get('/v1/api/trending');
  return response.data;
}
```

**2. Service** - Thêm business logic:
```javascript
// services/movieService.js
async getTrendingMovies() {
  const response = await movieRepository.getTrendingMovies();
  return {
    status: 'success',
    items: response.items.map(m => this.transformMovie(m))
  };
}
```

**3. Controller** - Thêm request handler:
```javascript
// controllers/movieController.js
async getTrendingMovies(req, res) {
  try {
    const result = await movieService.getTrendingMovies();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```

**4. Routes** - Định nghĩa route:
```javascript
// routes/movies.js
router.get('/trending', movieController.getTrendingMovies.bind(movieController));
```

---

## Chuẩn bị cho Database

Khi cần thêm database, chỉ cần:

1. **Cài đặt ORM/ODM** (Mongoose, Sequelize, Prisma...)
2. **Cập nhật Repository layer** - Thay API calls bằng DB queries
3. **Không cần sửa** Service, Controller, Routes!

**Ví dụ với MongoDB:**
```javascript
// repositories/movieRepository.js
const Movie = require('../models/Movie');

async getHomeMovies(page = 1) {
  const movies = await Movie.find()
    .limit(20)
    .skip((page - 1) * 20);
  return movies;
}
```

---

## Kết luận

Backend hiện tại đã được tổ chức theo mô hình **MVC** với:
- ✅ Tách biệt layers rõ ràng
- ✅ Dễ bảo trì và mở rộng
- ✅ Sẵn sàng cho database
- ✅ Code clean và có tổ chức
