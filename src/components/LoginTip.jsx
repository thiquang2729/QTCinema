import { useState, useEffect } from 'react';
import { useUser, useClerk } from '@clerk/react';
import { Sparkles, X, LogIn } from 'lucide-react';

const STORAGE_KEY = 'qtcinema_has_seen_login_tip';

function LoginTip() {
  const { isSignedIn, isLoaded } = useUser();
  const { openSignIn } = useClerk();
  const [showTip, setShowTip] = useState(false);
  const [isDismissed, setIsDismissed] = useState(() => {
    try {
      return Boolean(localStorage.getItem(STORAGE_KEY));
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (!isLoaded || isSignedIn || isDismissed) {
      return;
    }

    // Đợi 1.5 giây sau khi trang tải để tip hiển thị nhẹ nhàng
    const timer = setTimeout(() => {
      setShowTip(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, [isLoaded, isSignedIn, isDismissed]);

  const handleDismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, 'true');
    } catch {
      // Bỏ qua nếu môi trường không hỗ trợ localStorage
    }
    setIsDismissed(true);
  };

  const handleSignIn = () => {
    handleDismiss();
    openSignIn();
  };

  // Không hiển thị nếu chưa tải xong, đã đăng nhập, đã đóng tip, hoặc chưa đến thời gian hiển thị
  if (!isLoaded || isSignedIn || isDismissed || !showTip) {
    return null;
  }

  return (
    <aside
      aria-label="Gợi ý đăng nhập"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-50 transition-all duration-500 ease-out animate-in fade-in slide-in-from-bottom-5"
    >
      <div className="relative overflow-hidden bg-neutral-900/95 border border-red-500/30 rounded-2xl p-4 shadow-[0_10px_35px_rgba(0,0,0,0.8),0_0_20px_rgba(220,38,38,0.15)] backdrop-blur-xl ring-1 ring-white/10">
        {/* Vệt sáng trang trí nền */}
        <div className="absolute -top-12 -right-12 w-28 h-28 bg-red-600/15 rounded-full blur-2xl pointer-events-none" />

        {/* Nút đóng (X) góc phải */}
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          aria-label="Đóng thông báo"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-3.5 pr-6">
          {/* Icon nổi bật */}
          <div className="shrink-0 p-2.5 bg-red-500/10 border border-red-500/25 rounded-xl text-red-500 shadow-inner">
            <Sparkles className="w-5 h-5" />
          </div>

          {/* Nội dung tip */}
          <div className="flex-1">
            <h4 className="text-sm font-bold text-white mb-1 flex items-center gap-1.5">
              Gợi ý trải nghiệm
            </h4>
            <p className="text-xs text-gray-300 leading-relaxed">
              Đăng nhập để lưu tiến trình xem và danh sách phim yêu thích của bạn!
            </p>

            {/* Các nút hành động */}
            <div className="mt-3.5 flex items-center gap-2">
              <button
                onClick={handleSignIn}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg shadow-md shadow-red-600/30 hover:shadow-red-600/50 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Đăng nhập ngay</span>
              </button>

              <button
                onClick={handleDismiss}
                className="px-2.5 py-1.5 text-xs text-gray-400 hover:text-gray-200 transition-colors cursor-pointer"
              >
                Để sau
              </button>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default LoginTip;
