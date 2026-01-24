import * as React from "react";
import { Search, Home, ArrowLeft, MapPin } from "lucide-react";
import { Button } from "~/components/ui";
import { useNavigate } from "react-router-dom";

export default function NotFoundPage(): React.JSX.Element {
  const navigate = useNavigate();

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
          
          <h2 className="text-3xl font-semibold text-gray-800">
            Không tìm thấy trang
          </h2>
          
          <p className="text-lg text-gray-600 max-w-md mx-auto">
            Rất tiếc, trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
            Có thể đường dẫn đã thay đổi hoặc bạn đã nhập sai địa chỉ.
          </p>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 max-w-md mx-auto">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-left">
                <p className="font-medium text-amber-900 mb-1">Gợi ý:</p>
                <ul className="text-amber-800 space-y-1">
                  <li>• Kiểm tra lại đường dẫn URL</li>
                  <li>• Quay về trang chủ và tìm kiếm lại</li>
                  <li>• Sử dụng menu điều hướng</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại
          </Button>
          
          <Button
            onClick={() => navigate("/")}
            className="flex items-center gap-2"
          >
            <Home className="h-4 w-4" />
            Về trang chủ
          </Button>
        </div>

        {/* Search Bar */}
        <div className="max-w-md mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm trang..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  // Handle search
                  console.log('Search:', e.currentTarget.value);
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
