# TÀI LIỆU KỸ THUẬT: API & LUỒNG HOẠT ĐỘNG FRONTEND (QTCINEMA)

Tài liệu này mô tả chi tiết luồng hoạt động của Frontend, cấu trúc tích hợp API và đặc tả kỹ thuật của component phát video (`VideoPlayer.jsx`) của hệ thống phim **QTCinema**. Tài liệu được chuẩn bị phục vụ cho việc thiết kế và lập trình lại toàn bộ giao diện (Frontend) mới của hệ thống.

---

## 1. Tổng Quan Kiến Trúc Frontend Hiện Tại

*   **Framework**: React (Vite)
*   **Quản lý State**: Redux Toolkit (để lưu trữ danh sách phim trang chủ, chi tiết phim đang chọn, kết quả tìm kiếm và trạng thái tải trang global).
*   **Routing**: React Router v6 (`BrowserRouter`).
*   **HTTP Client**: Axios.
*   **Styling**: Hiện tại sử dụng TailwindCSS (ở các bản dựng cũ) hoặc CSS tùy biến. Dự án mới sẽ được xây dựng lại giao diện hoàn toàn mới từ đầu, ngoại trừ phần Video Player.

### 1.1. Cấu hình Axios Instance và Interceptors
Tệp tin cấu hình chính: [axiosInstance.js](file:///d:/Dev/Code/QTcinema/src/services/axiosInstance.js)

*   **Base URL**: Ưu tiên đọc biến môi trường `import.meta.env.VITE_BACKEND_URL`, nếu không có sẽ mặc định là `/api` (được chuyển tiếp qua Vite Proxy trong môi trường dev).
*   **Request Interceptor**:
    *   Tự động kích hoạt trạng thái loading global bằng cách gửi action `startRequest()` tới `uiSlice` (trừ khi request được thiết lập thuộc tính `hideLoader: true`).
    *   Tự động kiểm tra và gắn JWT token từ `localStorage.getItem('token')` vào Header dưới dạng `Authorization: Bearer <token>` nếu có.
*   **Response Interceptor**:
    *   Tự động tắt loading global (`endRequest()`).
    *   Xử lý tập trung các mã lỗi HTTP:
        *   `401 (Unauthorized)`: Xóa token khỏi localStorage và tự động chuyển hướng người dùng về trang đăng nhập `/login`.
        *   `403 (Forbidden)`: Ghi log lỗi không có quyền truy cập.
        *   `404 (Not Found)`: Ghi log lỗi tài nguyên không tồn tại.
        *   `500 (Internal Server Error)`: Ghi log lỗi máy chủ.
        *   `Network Error`: Ghi log lỗi kết nối đến server.

---

## 2. Hệ Thống Định Tuyến (Routing) Của Frontend
Tệp tin cấu hình chính: [App.jsx](file:///d:/Dev/Code/QTcinema/src/App.jsx)

Hệ thống định tuyến chia làm 5 trang chính:

| Đường Dẫn (Route) | Component Trang | Chức Năng |
| :--- | :--- | :--- |
| `/` | `Home.jsx` | Trang chủ: Banner phim nổi bật, Phim mới cập nhật, Phim Hàn Quốc, Phim Trung Quốc, Phim Âu Mỹ, Phim Hoạt Hình. |
| `/phim/:slug` | `MovieDetail.jsx` | Trang chi tiết phim: Hiển thị thông tin mô tả, thể loại, quốc gia, diễn viên, đạo diễn, danh sách tập phim và thư viện ảnh. |
| `/xem/:slug` | `WatchPage.jsx` | Trang xem phim trực tuyến: Chứa màn hình video player và danh sách chọn tập phim/chọn server phát. |
| `/danh-sach/:slug` | `MovieListPage.jsx` | Trang danh sách phim kết hợp bộ lọc (phân trang, sắp xếp, lọc theo năm, thể loại, quốc gia). |
| `/search/:keyword` | `SearchPage.jsx` | Trang hiển thị danh sách kết quả tìm kiếm phim theo từ khóa. |

---

## 3. Đặc Tả Chi Tiết Các API Endpoints Từ Backend

Toàn bộ các yêu cầu HTTP được gọi từ Frontend thông qua các Thunk Action trong Redux Slice [movieSlice.js](file:///d:/Dev/Code/QTcinema/src/redux/slices/movieSlice.js) hoặc trực tiếp qua `axiosInstance.js`.

### 3.1. Lấy danh sách phim Trang Chủ
*   **Endpoint**: `GET /api/movies` (Hoặc thông qua Redux action `fetchMovies`)
*   **Query Params**:
    *   `page` (number, mặc định `1`): Trang cần lấy.
*   **Kiểu Dữ Liệu Trả Về (Response)**:
    ```json
    {
      "status": "success",
      "items": [
        // Danh sách đối tượng Movie rút gọn (Basic Movie)
      ],
      "pagination": {
        "totalItems": 1200,
        "totalItemsPerPage": 24,
        "currentPage": 1,
        "totalPages": 50
      },
      "cdnImageUrl": "https://img.ophim.live"
    }
    ```

### 3.2. Lấy danh sách phim theo phân loại và bộ lọc phức tạp
*   **Endpoint**: `GET /api/movies/list/:slug` (Hoặc thông qua Redux action `fetchMoviesByList`)
*   **Path Parameter**: `:slug` đại diện cho loại danh sách cần lấy. Các slug hợp lệ gồm:
    *   `phim-moi`: Phim mới cập nhật
    *   `phim-bo`: Phim bộ nhiều tập
    *   `phim-le`: Phim lẻ một tập
    *   `tv-shows`: Chương trình truyền hình
    *   `hoat-hinh`: Phim hoạt hình / Anime
    *   `phim-vietsub`: Phim phụ đề tiếng Việt
    *   `phim-thuyet-minh`: Phim lồng tiếng Việt thuyết minh
    *   `phim-sap-chieu`: Phim trailer / sắp công chiếu
    *   `phim-chieu-rap`: Phim chiếu rạp
*   **Query Params**:
    *   `page` (number, mặc định `1`)
    *   `limit` (number, mặc định `24`)
    *   `sort_field` (string, mặc định `modified.time` | các giá trị khác: `year`, `_id`): Trường dùng để sắp xếp.
    *   `sort_type` (string, mặc định `desc` | `asc`): Thứ tự sắp xếp.
    *   `category` (string, tùy chọn): Slug của thể loại phim (vd: `hanh-dong`, `tinh-cam`).
    *   `country` (string, tùy chọn): Slug của quốc gia (vd: `han-quoc`, `trung-quoc`, `au-my`).
    *   `year` (number, tùy chọn): Năm sản xuất (vd: `2026`).
*   **Kiểu Dữ Liệu Trả Về (Response)**:
    ```json
    {
      "status": "success",
      "items": [
        // Danh sách đối tượng Movie rút gọn (Basic Movie)
      ],
      "pagination": {
        "totalItems": 450,
        "totalItemsPerPage": 24,
        "currentPage": 1,
        "totalPages": 19
      }
    }
    ```

### 3.3. Tìm kiếm phim
*   **Endpoint**: `GET /api/movies/search/:keyword` (Hoặc thông qua Redux action `searchMovies`)
*   **Path Parameter**: `:keyword` là từ khóa cần tìm kiếm (tối thiểu 2 ký tự).
*   **Query Params**:
    *   `page` (number, mặc định `1`)
    *   `limit` (number, mặc định `24` hoặc `8` khi gọi gợi ý ở Navbar)
*   **Đặc biệt**: API này được Frontend sử dụng ở cả **Trang Tìm Kiếm** (hiển thị grid) và **Gợi Ý Tìm Kiếm tức thời (Search Suggestion Dropdown)** ở thanh Navbar (gọi ngầm với cấu hình `hideLoader: true` và `limit: 8` kèm debounce 300ms).
*   **Kiểu Dữ Liệu Trả Về (Response)**:
    ```json
    {
      "status": "success",
      "items": [
        // Danh sách đối tượng Movie rút gọn khớp từ khóa
      ],
      "pagination": {
        "totalItems": 15,
        "totalItemsPerPage": 24,
        "currentPage": 1,
        "totalPages": 1
      }
    }
    ```

### 3.4. Lấy chi tiết phim
*   **Endpoint**: `GET /api/movies/:slug` (Hoặc thông qua Redux action `fetchMovieById`)
*   **Path Parameter**: `:slug` của phim (ví dụ: `phim-vinh-quang-trong-han-thu`).
*   **Kiểu Dữ Liệu Trả Về (Response)**:
    ```json
    {
      "status": "success",
      "data": {
        // Đối tượng Movie chi tiết (Detailed Movie)
      }
    }
    ```

### 3.5. Lấy hình ảnh phim (Thư viện Poster & Backdrop từ TMDB)
*   **Endpoint**: `GET /api/movies/:slug/images` (Hoặc thông qua Redux action `fetchMovieImages`)
*   **Path Parameter**: `:slug` của phim.
*   **Kiểu Dữ Liệu Trả Về (Response)**:
    ```json
    {
      "status": "success",
      "data": {
        "tmdbId": 123456,
        "slug": "ten-phim-slug",
        "images": [
          {
            "width": 1920,
            "height": 1080,
            "aspectRatio": 1.777,
            "type": "backdrop", // Hoặc "poster"
            "filePath": "/image_path.jpg",
            "urls": {
              "original": "https://image.tmdb.org/t/p/original/image_path.jpg",
              "w1280": "https://image.tmdb.org/t/p/w1280/image_path.jpg",
              "w780": "https://image.tmdb.org/t/p/w780/image_path.jpg",
              "w300": "https://image.tmdb.org/t/p/w300/image_path.jpg"
            }
          }
        ],
        "backdrops": [ /* Lọc các phần tử có type là backdrop */ ],
        "posters": [ /* Lọc các phần tử có type là poster */ ]
      }
    }
    ```

### 3.6. Lấy danh sách quốc gia (API phụ trợ)
*   **Endpoint**: `GET /api/movies/countries` (Hoặc thông qua Redux action `fetchCountries`)
*   **Kiểu Dữ Liệu Trả Về (Response)**:
    ```json
    {
      "status": "success",
      "items": [
        { "id": "620a2300e0fc277084dfd6d2", "name": "Hàn Quốc", "slug": "han-quoc" },
        { "id": "62093063196e9f4ab6b448b8", "name": "Trung Quốc", "slug": "trung-quoc" }
      ]
    }
    ```
    *Lưu ý: Hiện tại trang lọc phim `MovieListPage.jsx` đang sử dụng danh sách quốc gia và thể loại tĩnh khai báo cứng trong file để giảm số lượng kết nối mạng, nhưng backend vẫn cung cấp sẵn API này.*

### 3.7. Lấy danh sách phim theo quốc gia cụ thể (Trang chủ gọi trực tiếp)
*   **Endpoint**: `GET /api/movies/country/:slug`
*   **Path Parameter**: `:slug` quốc gia (vd: `han-quoc`, `trung-quoc`, `au-my`).
*   **Query Params**: `page`, `limit`, `sort_field`, `sort_type` (tương tự API 3.2).

### 3.8. Lấy danh sách phim theo thể loại cụ thể
*   **Endpoint**: `GET /api/movies/category/:slug`
*   **Path Parameter**: `:slug` thể loại (vd: `hanh-dong`, `tinh-cam`).

---

## 4. Chi Tiết Cấu Trúc Dữ Liệu Phim (Data Contracts)

### 4.1. Đối Tượng Phim Rút Gọn (Basic Movie)
Dữ liệu của phim hiển thị trong các danh sách, slider và tìm kiếm.
*   `id` (string): ID duy nhất của phim.
*   `slug` (string): Slug định tuyến (dùng để chuyển trang chi tiết).
*   `title` (string): Tên phim tiếng Việt.
*   `originalTitle` (string): Tên gốc (tiếng Anh/Hàn/Trung...).
*   `alternativeNames` (array of string): Các tên gọi khác của phim.
*   `description` (string): Mô tả ngắn gọn của phim.
*   `rating` (number): Điểm đánh giá trung bình từ TMDB (thường từ 0.0 đến 10.0).
*   `year` (number): Năm sản xuất.
*   `posterPath` (string): URL tuyệt đối của ảnh dọc Poster.
*   `thumbUrl` (string): URL tuyệt đối của ảnh ngang đại diện (Thumbnail).
*   `type` (string): Loại phim (`series` - Phim bộ | `single` - Phim lẻ).
*   `category` (array of objects): Các danh mục thể loại gồm `{ id, name, slug }`.
*   `country` (array of objects): Các quốc gia gồm `{ id, name, slug }`.
*   `quality` (string): Chất lượng hiển thị (ví dụ: `FHD`, `HD`, `SD`).
*   `lang` (string): Phụ đề / Thuyết minh (ví dụ: `Vietsub`, `Thuyết Minh`, `Lồng Tiếng`).
*   `episode_current` (string): Tập phim hiện tại (ví dụ: `Tập 16 Vietsub`, `Hoàn tất (16/16)`).
*   `episode_total` (string): Tổng số tập dự kiến (ví dụ: `16`, `1`).

### 4.2. Đối Tượng Phim Chi Tiết (Detailed Movie)
Dữ liệu được trả về cho trang chi tiết phim chứa thêm các thông tin phụ trợ và danh sách tập phim đầy đủ.
*   *Tất cả các trường của Basic Movie*, kèm theo:
*   `ratingCount` (number): Số lượng người đánh giá.
*   `imdb` (object): Thông tin liên quan đến ID IMDb.
*   `status` (string): Trạng thái phim (`completed` - Hoàn thành | `ongoing` - Đang tiến hành).
*   `time` (string): Thời lượng phim (ví dụ: `45 phút / tập`, `120 phút`).
*   `view` (number): Lượt xem trên hệ thống.
*   `actor` (array of string): Danh sách tên các diễn viên chính (ví dụ: `["Song Hye-kyo", "Lee Do-hyun"]`).
*   `director` (array of string): Danh sách tên các đạo diễn.
*   `trailer_url` (string): URL trailer trên Youtube.
*   `episodes` (array of objects): Xem cấu trúc chi tiết bên dưới.

### 4.3. Cấu Trúc Danh Sách Tập Phim (Episodes)
Danh sách tập phim được phân chia theo từng cụm máy chủ phát (Server).
```json
"episodes": [
  {
    "server_name": "Vietsub #1",
    "server_data": [
      {
        "name": "1",
        "slug": "tap-01",
        "filename": "Tập 1",
        "link_embed": "https://player.ophim.live/video/...",
        "link_m3u8": "https://s3.phim.live/video/tap-1/index.m3u8" // Đường dẫn quan trọng truyền vào Player
      },
      {
        "name": "2",
        "slug": "tap-02",
        "filename": "Tập 2",
        "link_embed": "https://player.ophim.live/video/...",
        "link_m3u8": "https://s3.phim.live/video/tap-2/index.m3u8"
      }
    ]
  }
]
```

---

## 5. BẮT BUỘC GIỮ LẠI: Component Trình Phát Video (`VideoPlayer.jsx`)
Đường dẫn file: [VideoPlayer.jsx](file:///d:/Dev/Code/QTcinema/src/components/VideoPlayer.jsx)

> [!IMPORTANT]
> Đây là thành phần được yêu cầu giữ nguyên logic và giao diện điều khiển như cũ khi code lại giao diện mới của Frontend. AI khác khi đọc tài liệu này cần giữ lại nguyên vẹn file này và chỉ tích hợp/import nó vào trang xem phim (`WatchPage.jsx`) mới.

### 5.1. Các Thư Viện Sử Dụng & Phụ Thuộc
*   `hls.js`: Thư viện xử lý giải mã và truyền luồng video định dạng `.m3u8` (HTTP Live Streaming) trên các trình duyệt không hỗ trợ native.
*   `lucide-react`: Chứa các icon điều khiển (`Play`, `Pause`, `Volume2`, `VolumeX`, `Maximize2`, `RotateCcw`, `RotateCw`, `Film`).

### 5.2. Các Props Nhận Vào (Component Props)
Component được định nghĩa nhận vào các props sau:
```javascript
function VideoPlayer({
  src,           // [Bắt buộc] String - Đường dẫn URL phát phim .m3u8 (lấy từ link_m3u8 của tập phim)
  poster,        // [Tùy chọn] String - Ảnh đại diện khi video chưa phát (backdrop hoặc poster phim)
  title,         // [Tùy chọn] String - Tên bộ phim hiện tại
  episodeLabel,  // [Tùy chọn] String - Tên tập phim đang xem (ví dụ: "Tập 1")
  autoPlay = false,    // [Tùy chọn] Boolean - Tự động phát khi mount hoặc đổi tập
  fullScreen = false,  // [Tùy chọn] Boolean - Nếu true, chiếm toàn bộ không gian cha làm overlay
})
```

### 5.3. Các Tính Năng & Luồng Xử Lý Logic Trong VideoPlayer

1.  **Cập nhật tiêu đề trang (Document Title)**:
    *   Tự động đổi tiêu đề tab trình duyệt theo định dạng: `[Tên Phim] - [Tên Tập]` (ví dụ: `Vinh Quang Trong Hận Thù - Tập 1`). Khi Unmount component, tự phục hồi lại tiêu đề gốc của trang.
2.  **Khởi tạo HLS và tương thích trình duyệt**:
    *   Khi `src` thay đổi, tiến hành hủy thực thể HLS cũ nếu có (`hlsRef.current.destroy()`).
    *   Nếu trình duyệt hỗ trợ `Hls.isSupported()` (các trình duyệt Chromium như Chrome, Edge, Brave...): Khởi tạo HLS instance mới với cấu hình tối ưu độ trễ thấp (`lowLatencyMode: true`) và luồng chạy ngầm (`enableWorker: true`). Đính kèm video element và load source.
    *   Nếu là Safari (iOS/macOS) hỗ trợ phát HLS native: Gán trực tiếp `videoRef.current.src = src`.
3.  **Điều Khiển Phím Tắt Bàn Phím (Keyboard Shortcuts)**:
    *   `Phím Space (Dấu cách)`: Tạm dừng / Phát tiếp video (ngăn hành vi cuộn trang mặc định).
    *   `Mũi tên sang Phải (ArrowRight)`: Tua nhanh tới trước 10 giây.
    *   `Mũi tên sang Trái (ArrowLeft)`: Tua ngược về sau 10 giây.
4.  **Tương Tác Bằng Cử Chỉ / Chạm (Gesture & Touch Events)**:
    *   `Single Tap (Chạm đơn)`: Ẩn/Hiện thanh điều khiển (Controls Overlay).
    *   `Double Tap (Chạm đúp)`:
        *   Nếu chạm đúp vào nửa bên trái màn hình: Tua ngược 10 giây.
        *   Nếu chạm đúp vào nửa bên phải màn hình: Tua nhanh 10 giây.
5.  **Tự Động Ẩn Thanh Điều Khiển (Auto-hide Controls)**:
    *   Khi video đang chạy (`isPlaying === true`): Thanh điều khiển sẽ tự động ẩn đi sau 5 giây không có tương tác chuột hay chạm màn hình. Khi rê chuột (pointer move), thanh điều khiển sẽ hiện lại và bộ đếm thời gian được reset.
    *   Khi video đang tạm dừng (`isPlaying === false`): Thanh điều khiển luôn hiển thị trực quan để người dùng thao tác.
6.  **Tính năng bổ sung trên giao diện tùy biến (Style Netflix)**:
    *   Logo thương hiệu `QTCinema` hiển thị mờ ở góc trên bên phải màn hình.
    *   Nút tua nhanh/lùi 10s trực quan ở giữa màn hình (chỉ hiển thị trên PC).
    *   Thanh chỉnh âm lượng (Volume Slider) hiện ra khi click vào biểu tượng loa.
    *   Menu thay đổi tốc độ phát (Speed Menu) hỗ trợ các mốc tốc độ: `0.5x`, `0.75x`, `1.0x` (Mặc định), `1.25x`, `1.5x`, `2.0x`.
    *   Nút bật/tắt chế độ toàn màn hình (Fullscreen) sử dụng HTML5 Fullscreen API (`requestFullscreen` / `exitFullscreen`).

---

## 6. Luồng Dữ Liệu Chi Tiết Tại Các Trang (Frontend Flow)

### 6.1. Luồng hoạt động tại Trang Chủ (`Home.jsx`)
1.  Khi trang được tải, component render `HeroSlider` và `MovieList` chính (dành cho phim mới cập nhật).
2.  `MovieList` kiểm tra nếu không nhận danh sách phim ngoại vi (`movies` prop), nó sẽ tự động dispatch `fetchMovies()` để gọi `GET /api/movies`. Danh sách phim này được lưu vào Redux và đồng thời cấp dữ liệu cho `HeroSlider` tự động trích xuất 5 phim đầu tiên làm slide chuyển động (mỗi 3 giây).
3.  Đồng thời, trang chủ khởi chạy 4 hiệu ứng `useEffect` song song để lấy phim theo quốc gia và thể loại thông qua Axios:
    *   `GET /api/movies/country/han-quoc` -> Lưu vào state `koreanMovies`.
    *   `GET /api/movies/country/trung-quoc` -> Lưu vào state `chinaMovies`.
    *   `GET /api/movies/country/au-my` -> Lưu vào state `europeMovies`.
    *   `GET /api/movies/list/hoat-hinh` -> Lưu vào state `animationMovies`.
4.  Khi người dùng nhấp vào một bộ phim bất kỳ, ứng dụng thực hiện cuộn mượt lên đầu trang (`window.scrollTo`) và chuyển hướng sang trang chi tiết `/phim/:slug`.

### 6.2. Luồng hoạt động tại Trang Chi Tiết Phim (`MovieDetail.jsx`)
1.  Đọc tham số `:slug` từ URL của React Router.
2.  Kích hoạt 2 luồng tải dữ liệu song song qua Redux:
    *   `dispatch(fetchMovieById(slug))` gọi `GET /api/movies/:slug`.
    *   `dispatch(fetchMovieImages(slug))` gọi `GET /api/movies/:slug/images`.
3.  Hiển thị giao diện:
    *   Lấy ảnh nền (Backdrop) chất lượng cao của phim từ danh sách ảnh TMDB vừa tải (ưu tiên lấy ảnh đầu tiên trong mảng `backdrops`, kích thước `w1280` hoặc `original`). Nếu không có ảnh TMDB, tự động sử dụng ảnh `thumbUrl` hoặc `posterPath` để thay thế.
    *   Hiển thị thông tin tên phim, tên gốc, điểm đánh giá, năm, thời lượng, thể loại, quốc gia (kèm emoji cờ quốc gia tương ứng từ danh sách ánh xạ tĩnh `COUNTRY_FLAG_EMOJI_BY_SLUG`), danh sách diễn viên và đạo diễn.
    *   Mô tả phim (HTML) được hiển thị an toàn bằng `dangerouslySetInnerHTML`.
    *   Hiển thị danh sách tập phim: Phân chia theo từng máy chủ (Server) phát. Mỗi tập phim là một nút bấm.
4.  Điều hướng phát phim:
    *   Click vào nút "Xem phim" lớn: Tự động chuyển đến trang xem phim `/xem/:slug` (mặc định phát server đầu tiên, tập đầu tiên).
    *   Click vào một tập cụ thể: Chuyển hướng sang `/xem/:slug?server=${serverIndex}&ep=${epIndex}` để chỉ định cụ thể tập và server phát phim.

### 6.3. Luồng hoạt động tại Trang Xem Phim (`WatchPage.jsx`)
1.  Đọc tham số `:slug` từ URL và các query parameters `server` và `ep` từ URL Search Params.
2.  Khi trang được tải, tiến hành gọi API tải thông tin chi tiết phim và hình ảnh (để lấy danh sách tập phim và ảnh nền làm poster cho trình phát video):
    *   `dispatch(fetchMovieById(slug))`
    *   `dispatch(fetchMovieImages(slug))`
3.  Xác định tập phim cần phát thông qua hàm `findEpisode(movie, serverIndex, epIndex)`:
    *   Lấy cụm dữ liệu server tương ứng với `serverIndex` (nếu sai lệch hoặc không truyền thì mặc định là `0`).
    *   Tìm tập phim tương ứng với `epIndex` trong mảng `server_data` của server đó (nếu không có thì mặc định lấy tập đầu tiên).
    *   Trả về đầy đủ thông tin tập phim bao gồm: `name` (tên tập), `link_m3u8` (link stream phim), `serverName` và chỉ số của tập.
4.  Truyền link stream này vào component **`VideoPlayer`** làm thuộc tính `src`, kèm theo ảnh poster đại diện và tiêu đề tập.
5.  Render danh sách các tập phim bên dưới hoặc bên cạnh video. Khi người dùng click chọn một tập phim khác:
    *   Không thực hiện reload/navigate lại trang (để tránh gián đoạn trải nghiệm).
    *   Chỉ cập nhật lại `serverIndex` và `currentEpisode` thông qua React local state. Trình phát `VideoPlayer` phát hiện thay đổi `src` sẽ tự động hủy luồng HLS cũ, khởi tạo luồng mới và tự động phát tập phim tiếp theo.

### 6.4. Luồng hoạt động tại Trang Danh Sách Phim (`MovieListPage.jsx`)
1.  Đọc tham số danh sách `:slug` từ URL và các query parameters lọc (`page`, `sort_field`, `sort_type`, `category`, `country`, `year`).
2.  Mỗi khi slug danh sách hoặc bất kỳ bộ lọc nào thay đổi:
    *   Tự động dispatch action `fetchMoviesByList({ slug, params: { ... } })` để gọi API `GET /api/movies/list/:slug` kèm theo các tham số bộ lọc.
3.  Khi thay đổi bất kỳ bộ lọc nào (như đổi thể loại, quốc gia, năm, cách sắp xếp), hệ thống sẽ tự động cập nhật URL Search Params và đưa số trang (`page`) quay trở về `1`.
4.  Giao diện hiển thị danh sách phim dạng Grid. Bên dưới có thanh phân trang đơn giản: Trang trước, vị trí Trang hiện tại / Tổng số trang (`totalPages` được tính toán từ `pagination.totalItems` và `pagination.totalItemsPerPage`), và Trang sau.

### 6.5. Luồng hoạt động tại Trang Tìm Kiếm Phim (`SearchPage.jsx`)
1.  Đọc từ khóa từ URL `:keyword`.
2.  Nếu từ khóa hợp lệ (độ dài `>= 2` ký tự), tự động dispatch `searchMovies({ keyword, page: 1, limit: 24 })` để gọi API `GET /api/movies/search/:keyword`.
3.  Hiển thị danh sách kết quả dạng Grid bằng cách truyền mảng kết quả `searchResults` vào component `MovieList` (`<MovieList movies={searchResults} />`).
4.  Nếu không tìm thấy kết quả nào, hiển thị giao diện thông báo trống kèm nút "Quay lại trang chủ".
