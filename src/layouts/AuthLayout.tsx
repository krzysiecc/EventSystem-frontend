import { Outlet } from "react-router-dom";
import ThemeSwitcher from "@/components/ui/ThemeSwitcher";
import AuthGeometry from "@/components/ui/AuthGeometry";

const AuthLayout = () => {
  return (
    <div className="relative z-10 min-h-screen">
      <AuthGeometry />
      <div className="absolute right-4 top-4 z-50">
        <ThemeSwitcher />
      </div>
      <Outlet />
    </div>
  );
};

export default AuthLayout;
