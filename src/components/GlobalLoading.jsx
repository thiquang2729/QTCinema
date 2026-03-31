import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';

function GlobalLoading() {
  const activeRequests = useSelector((state) => state.ui.activeRequests);
  const [isShowing, setIsShowing] = useState(false);
  const location = useLocation();

  useEffect(() => {
    let timer;
    if (activeRequests > 0) {
      // Đợi một chút để tránh chớp màn hình với các request quá nhanh liên tục
      timer = setTimeout(() => setIsShowing(true), 200);
    } else {
      // Đợi xíu trước khi tắt để hiệu ứng mượt
      timer = setTimeout(() => setIsShowing(false), 300);
    }
    return () => clearTimeout(timer);
  }, [activeRequests]);

  // Luôn bắt đầu trạng thái load khi chuyển trang nếu trang đó có khả năng gọi API (reset ngay nếu ko có)
  // Thực tế việc phụ thuộc activeRequests là đủ mạnh, việc debouncing ở trên giúp chống chớp.

  if (!isShowing && activeRequests === 0) return null;

  return (
    <div
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-black/80 backdrop-blur-md transition-opacity duration-500 ease-in-out ${
        activeRequests > 0 ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Premium Loader Design */}
      <div className="relative flex items-center justify-center">
        {/* Vòng ngoài cùng */}
        <div className="absolute w-24 h-24 border-4 border-t-red-600 border-r-transparent border-b-red-900 border-l-transparent rounded-full animate-spin"></div>
        {/* Vòng giữa */}
        <div className="absolute w-16 h-16 border-4 border-r-white border-t-transparent border-l-gray-600 border-b-transparent rounded-full animate-[spin_1.5s_linear_reverse]"></div>
        {/* Core glow */}
        <div className="w-8 h-8 bg-red-600 rounded-full animate-pulse shadow-[0_0_30px_10px_rgba(220,38,38,0.6)]"></div>
      </div>
      
      <div className="mt-8 text-center">
        <h3 className="text-xl font-bold tracking-[0.2em] text-white animate-pulse">
          QTCINEMA
        </h3>
        <p className="text-sm font-medium tracking-widest text-white mt-2 uppercase">
          Đang tải nội dung...
        </p>
      </div>
    </div>
  );
}

export default GlobalLoading;
