import * as React from "react";
import { useEffect, useState } from "react";
import { Search, Home, ArrowLeft, MapPin, Sparkles } from "lucide-react";
import { Button } from "~/components/ui";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  findClosestRoute, 
  getRouteSuggestions, 
  isValidRoute,
  ROUTE_ALIASES 
} from "~/lib/fuzzy-router";

// Route display names cho UI
const ROUTE_NAMES: Record<string, string> = {
  "/": "Trang chủ",
  "/auth/login": "Đăng nhập",
  "/auth/register": "Đăng ký",
  "/admin/dashboard": "Dashboard",
  "/admin/users": "Ngườii dùng",
  "/admin/orders": "Đơn hàng",
  "/admin/stores": "Cửa hàng",
  "/admin/lockers": "Tủ đồ",
  "/admin/services": "Dịch vụ",
  "/admin/payments": "Thanh toán",
  "/admin/loyalty": "Khách hàng thân thiết",
  "/admin/partners": "Đối tác",
  "/admin/feedback": "Phản hồi",
  "/admin/scheduler": "Lập lịch",
  "/partner/dashboard": "Partner Dashboard",
  "/partner/orders": "Đơn hàng",
  "/partner/staff": "Nhân viên",
  "/partner/revenue": "Doanh thu",
  "/partner/lockers": "Tủ đồ",
  "/partner/services": "Dịch vụ",
  "/partner/settings": "Cài đặt",
};

export default function NotFoundPage(): React.JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [didRedirect, setDidRedirect] = useState(false);

  useEffect(() => {
    const currentPath = location.pathname;
    
    // Kiểm tra nếu là alias exact match thì redirect ngay
    const normalizedPath = currentPath.toLowerCase().trim();
    if (ROUTE_ALIASES[normalizedPath] && normalizedPath !== currentPath) {
      navigate(ROUTE_ALIASES[normalizedPath], { replace: true });
      return;
    }

    // Thử tìm route gần nhất
    const closestRoute = findClosestRoute(currentPath);
    
    if (closestRoute && closestRoute !== currentPath && !isValidRoute(currentPath)) {
      // Tự động redirect sau 2 giây cho user thấy thông báo
      setDidRedirect(true);
      const timer = setTimeout(() => {
        navigate(closestRoute, { replace: true });
      }, 2000);
      return () => clearTimeout(timer);
    } else {
      // Không tìm được route phù hợp, hiển thị gợi ý
      setSuggestions(getRouteSuggestions(currentPath, 4));
      setIsChecking(false);
    }
  }, [location.pathname, navigate]);

  const currentPath = location.pathname;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-amber-50 to-white p-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* Illustration Area */}
        <div className="relative flex justify-center items-end gap-12 mb-8">
          {/* Broken Wire/Signpost */}
          <div className="relative">
            {/* Fallen Signpost */}
            <div className="relative">
              <div className="w-32 h-12 bg-yellow-400 rounded-lg flex items-center justify-center transform -rotate-12 shadow-lg">
                <span className="text-2xl font-bold text-gray-800">404</span>
              </div>
              <div className="w-4 h-20 bg-amber-900 rounded absolute top-6 left-1/2 -translate-x-1/2 transform rotate-45"></div>
            </div>
            
            {/* Disconnected Wire */}
            <div className="absolute -top-8 left-0">
              <svg width="120" height="60" viewBox="0 0 120 60" className="opacity-60">
                <path
                  d="M 10 10 Q 40 30, 60 25"
                  stroke="#374151"
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"
                />
                <circle cx="10" cy="10" r="4" fill="#374151" />
              </svg>
            </div>
          </div>

          {/* Worker 1 - Confused */}
          <div className="flex flex-col items-center relative">
            {/* Question marks floating */}
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 text-4xl animate-bounce">
              ❓
            </div>
            
            <div className="w-12 h-12 rounded-full bg-yellow-400 mb-2 relative">
              {/* Confused face */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="flex gap-2 mb-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-800"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-800"></div>
                </div>
                <div className="w-4 h-1 bg-gray-800 rounded-full"></div>
              </div>
            </div>
            <div className="w-10 h-14 bg-yellow-500 rounded-sm relative">
              {/* Hand scratching head */}
              <div className="absolute -top-2 -right-4 w-6 h-6 bg-yellow-400 rounded-full"></div>
            </div>
            <div className="flex gap-1 justify-center mt-1">
              <div className="w-2.5 h-10 bg-blue-900 rounded-sm"></div>
              <div className="w-2.5 h-10 bg-blue-900 rounded-sm"></div>
            </div>
          </div>

          {/* Worker 2 - Holding Map */}
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-yellow-400 mb-2"></div>
            <div className="w-10 h-14 bg-yellow-500 rounded-sm relative">
              {/* Map */}
              <div className="absolute -left-6 top-2 w-16 h-12 bg-white border-2 border-gray-400 rounded transform -rotate-12">
                <div className="p-1">
                  <div className="w-full h-1 bg-blue-400 mb-1"></div>
                  <div className="w-2/3 h-1 bg-red-400 mb-1"></div>
                  <div className="w-full h-1 bg-green-400"></div>
                </div>
              </div>
            </div>
            <div className="flex gap-1 justify-center mt-1">
              <div className="w-2.5 h-10 bg-blue-900 rounded-sm"></div>
              <div className="w-2.5 h-10 bg-blue-900 rounded-sm"></div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Search className="h-12 w-12 text-amber-500" />
            <h1 className="text-6xl font-bold text-gray-900">404</h1>
          </div>
          
          {didRedirect ? (
            // Hiển thị khi đang redirect tự động
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
              <div className="flex items-center justify-center gap-2 text-blue-700">
                <Sparkles className="h-5 w-5" />
                <span className="font-medium">Tự động chuyển hướng...</span>
              </div>
              <p className="text-sm text-blue-600 mt-1">
                Phát hiện URL gần đúng, đang chuyển đến trang phù hợp
              </p>
              <div className="mt-3 flex items-center justify-center gap-2 text-sm">
                <code className="bg-blue-100 px-2 py-1 rounded text-blue-800">{currentPath}</code>
                <span>→</span>
                <code className="bg-green-100 px-2 py-1 rounded text-green-800">
                  {findClosestRoute(currentPath)}
                </code>
              </div>
            </div>
          ) : (
            // Hiển thị khi không tìm được
            <>
              <h2 className="text-3xl font-semibold text-gray-800">
                Không tìm thấy trang
              </h2>
              
              <p className="text-lg text-gray-600 max-w-md mx-auto">
                Đường dẫn <code className="bg-gray-100 px-2 py-1 rounded text-gray-800">{currentPath}</code> không tồn tại.
              </p>

              {/* Gợi ý các trang gần nhất */}
              {suggestions.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 max-w-md mx-auto">
                  <div className="flex items-start gap-3">
                    <Sparkles className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-left">
                      <p className="font-medium text-amber-900 mb-2">Có thể bạn muốn tìm:</p>
                      <div className="flex flex-wrap gap-2">
                        {suggestions.map((route) => (
                          <button
                            key={route}
                            onClick={() => navigate(route)}
                            className="text-left px-3 py-1.5 bg-white border border-amber-300 rounded-md 
                                     text-amber-800 hover:bg-amber-100 hover:border-amber-400 
                                     transition-colors text-sm"
                          >
                            {ROUTE_NAMES[route] || route}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-w-md mx-auto">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-gray-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-left">
                    <p className="font-medium text-gray-900 mb-1">Gợi ý:</p>
                    <ul className="text-gray-600 space-y-1">
                      <li>• Kiểm tra lại đường dẫn URL</li>
                      <li>• Gõ <code>/login</code> thay vì <code>/auth/login</code></li>
                      <li>• Gõ <code>/order</code> thay vì <code>/admin/orders</code></li>
                      <li>• Quay về trang chủ và tìm kiếm lại</li>
                    </ul>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
            disabled={didRedirect}
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại
          </Button>
          
          <Button
            onClick={() => navigate("/")}
            className="flex items-center gap-2"
            disabled={didRedirect}
          >
            <Home className="h-4 w-4" />
            Về trang chủ
          </Button>
        </div>

        {/* Quick Links */}
        {!didRedirect && (
          <div className="max-w-md mx-auto pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-3">Truy cập nhanh:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {[
                { path: "/admin/dashboard", label: "Dashboard" },
                { path: "/admin/orders", label: "Đơn hàng" },
                { path: "/admin/users", label: "Users" },
                { path: "/partner/dashboard", label: "Partner" },
              ].map((link) => (
                <button
                  key={link.path}
                  onClick={() => navigate(link.path)}
                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-md 
                           text-gray-700 text-sm transition-colors"
                >
                  {link.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
