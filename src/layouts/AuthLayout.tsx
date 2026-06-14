import { Outlet } from "react-router-dom";
import ThemeSwitcher from "@/components/ui/ThemeSwitcher";

const AuthLayout = () => {
  return (
    <div className="relative min-h-screen bg-bg-primary">
      <div className="absolute right-4 top-4 z-50">
        <ThemeSwitcher />
      </div>
      <Outlet />
    </div>
  );
};

export default AuthLayout;
