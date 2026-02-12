# Service Layer Architecture

## Tổng quan

Service layer được tổ chức thành nhiều modules nhỏ theo **Single Responsibility Principle**. Mỗi service chịu trách nhiệm cho một domain cụ thể.

---

## Cấu trúc Services

```
services/
├── transformService.js      # Data transformation
├── homeService.js           # Home page logic
├── movieDetailService.js    # Movie detail logic
├── searchService.js         # Search & filter logic
└── movieService.js          # Main aggregate service
```

---

## 1. TransformService

**File:** [transformService.js](file:///d:/Dev/Code/QTcinema/backend/services/transformService.js)

**Trách nhiệm:**
- Transform data từ OPhim API format
- Xử lý image URLs
- Data normalization

**Methods:**
- `transformMovie(movie)` - Transform basic movie
- `transformMovieDetail(movieData)` - Transform detailed movie
- `buildImageUrl(imagePath, cdnUrl)` - Build full image URL
- `applyImageUrls(movie, cdnUrl)` - Apply URLs to movie object

**Ví dụ:**
```javascript
const transformService = require('./transformService');

const movie = transformService.transformMovie(rawData);
transformService.applyImageUrls(movie, cdnUrl);
```

---

## 2. HomeService

**File:** [homeService.js](file:///d:/Dev/Code/QTcinema/backend/services/homeService.js)

**Trách nhiệm:**
- Xử lý logic trang chủ
- Lấy danh sách phim chính

**Methods:**
- `getHomeMovies(page)` - Get home page movies

**Flow:**
```
Repository → Transform → Apply Images → Return
```

---

## 3. MovieDetailService

**File:** [movieDetailService.js](file:///d:/Dev/Code/QTcinema/backend/services/movieDetailService.js)

**Trách nhiệm:**
- Xử lý chi tiết phim
- Validate movie exists

**Methods:**
- `getMovieBySlug(slug)` - Get movie details

**Error Handling:**
- Throws error nếu không tìm thấy phim

---

## 4. SearchService

**File:** [searchService.js](file:///d:/Dev/Code/QTcinema/backend/services/searchService.js)

**Trách nhiệm:**
- Tìm kiếm phim
- Filter theo category/country

**Methods:**
- `searchMovies(keyword, page)` - Search by keyword
- `getMoviesByCategory(categorySlug, page)` - Filter by category
- `getMoviesByCountry(countrySlug, page)` - Filter by country

---

## 5. MovieService (Aggregate)

**File:** [movieService.js](file:///d:/Dev/Code/QTcinema/backend/services/movieService.js)

**Trách nhiệm:**
- **Aggregate service** - Điều phối các service modules
- Entry point cho controller
- Không chứa business logic trực tiếp

**Methods:**
```javascript
getHomeMovies(page)          → homeService.getHomeMovies()
getMovieBySlug(slug)         → movieDetailService.getMovieBySlug()
searchMovies(keyword, page)  → searchService.searchMovies()
getMoviesByCategory(...)     → searchService.getMoviesByCategory()
getMoviesByCountry(...)      → searchService.getMoviesByCountry()
```

**Pattern:** Facade Pattern

---

## Lợi ích của kiến trúc này

### ✅ Single Responsibility
Mỗi service có một trách nhiệm rõ ràng.

### ✅ Reusability
TransformService có thể được dùng ở nhiều nơi.

### ✅ Testability
Dễ test từng module độc lập.

### ✅ Maintainability
Sửa logic trang chủ chỉ cần sửa HomeService.

### ✅ Scalability
Dễ thêm service mới (ví dụ: UserService, CommentService).

---

## Data Flow

```
Controller
    ↓
MovieService (Aggregate)
    ↓
Specific Service (Home/Detail/Search)
    ↓
Repository
    ↓
TransformService
    ↓
Return to Controller
```

---

## Ví dụ sử dụng

### Trong Controller

```javascript
const movieService = require('../services/movieService');

class MovieController {
  async getHomeMovies(req, res) {
    const result = await movieService.getHomeMovies(page);
    res.json(result);
  }
}
```

Controller **không cần biết** về HomeService, SearchService... Chỉ cần gọi MovieService.

---

## Thêm Service mới

**Ví dụ:** Thêm CommentService

**1. Tạo service:**
```javascript
// services/commentService.js
class CommentService {
  async getCommentsByMovieId(movieId) {
    // Logic here
  }
}
module.exports = new CommentService();
```

**2. Thêm vào MovieService:**
```javascript
// services/movieService.js
const commentService = require('./commentService');

class MovieService {
  async getMovieComments(movieId) {
    return commentService.getCommentsByMovieId(movieId);
  }
}
```

**3. Controller tự động có access:**
```javascript
const comments = await movieService.getMovieComments(movieId);
```

---

## Best Practices

### 1. Dependency Injection
Services import các dependencies cần thiết.

### 2. Error Handling
Mỗi service throw meaningful errors.

### 3. Async/Await
Sử dụng async/await consistently.

### 4. Separation of Concerns
- **Repository**: Data access
- **Service**: Business logic
- **Controller**: HTTP handling

### 5. Single Entry Point
Controller chỉ gọi MovieService, không gọi trực tiếp các specific services.

---

## Kết luận

Service layer hiện tại:
- ✅ Modular và organized
- ✅ Dễ maintain và scale
- ✅ Follow SOLID principles
- ✅ Ready for testing
- ✅ Clear separation of concerns
