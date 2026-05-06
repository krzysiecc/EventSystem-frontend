import { Outlet } from "react-router-dom";
import ToastContainer from "@/components/ui/ToastContainer";

const RootLayout = () => {
  return (
    <div className="min-h-screen bg-bg-primary text-text-primary">
      <Outlet />
      <ToastContainer />
    </div>
  );
};

export default RootLayout;
