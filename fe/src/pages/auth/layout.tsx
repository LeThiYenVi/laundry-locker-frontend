import { Outlet } from "react-router-dom";

const AuthLayout = () => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-blue-50">
      {/* Allow child routes to control layout (no fixed card wrapper) */}
      <Outlet />
    </div>
  );
};

export default AuthLayout;