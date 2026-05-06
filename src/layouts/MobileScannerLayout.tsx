import { Outlet, Link } from "react-router-dom";

const MobileScannerLayout = () => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black text-white">
      <header className="flex items-center justify-between bg-gray-900 p-4">
        <span className="font-bold">Skaner biletów</span>
        <Link to="/organizer" className="text-accent-secondary hover:underline">
          Zamknij
        </Link>
      </header>
      <main className="relative flex-1">
        <Outlet />
      </main>
    </div>
  );
};

export default MobileScannerLayout;
