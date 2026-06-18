import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop - Tự động cuộn trang lên trên cùng khi thay đổi route hoặc phân trang/bộ lọc
 */
function ScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    // Cuộn lên đầu trang ngay lập tức để người dùng bắt đầu xem nội dung mới từ trên xuống
    window.scrollTo(0, 0);
  }, [pathname, search]);

  return null;
}

export default ScrollToTop;
