import { Outlet } from "react-router-dom";
import ToastContainer from "@/components/ui/ToastContainer";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import ScrollHint from "@/components/ui/ScrollHint";
import SiteBackground from "@/components/ui/SiteBackground";
import CursorDot from "@/components/ui/CursorDot";

const RootLayout = () => {
  return (
    <div className="relative min-h-screen bg-bg-primary text-text-primary">
      <SiteBackground />
      <Outlet />
      <ToastContainer />
      <ConfirmDialog />
      <ScrollHint />
      <CursorDot />
    </div>
  );
};

export default RootLayout;
