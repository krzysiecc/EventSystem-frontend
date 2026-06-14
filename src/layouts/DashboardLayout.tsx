import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  LogOut,
  LayoutDashboard,
  Users,
  KeyRound,
  ScrollText,
  CalendarDays,
  Compass,
  Ticket,
  User,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import ThemeSwitcher from "@/components/ui/ThemeSwitcher";

type NavItem = { to: string; label: string; Icon: LucideIcon; end?: boolean };

const DashboardLayout = ({ role }: { role: string }) => {
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const basePath = `/${role.toLowerCase()}`;

  const roleLabel =
    role === "Student"
      ? "Studenta"
      : role === "Organizer"
        ? "Organizatora"
        : "Administratora";

  const navItems: NavItem[] =
    role === "Admin"
      ? [
          { to: basePath, label: "Panel", Icon: LayoutDashboard, end: true },
          { to: `${basePath}/users`, label: "Użytkownicy", Icon: Users },
          { to: `${basePath}/tokens`, label: "Tokeny", Icon: KeyRound },
          { to: `${basePath}/events`, label: "Wydarzenia", Icon: CalendarDays },
          { to: `${basePath}/logs`, label: "Logi", Icon: ScrollText },
        ]
      : role === "Organizer"
        ? [
            { to: basePath, label: "Panel", Icon: LayoutDashboard, end: true },
            {
              to: `${basePath}/events`,
              label: "Wydarzenia",
              Icon: CalendarDays,
            },
            { to: `${basePath}/profile`, label: "Profil", Icon: User },
          ]
        : [
            { to: basePath, label: "Panel", Icon: LayoutDashboard, end: true },
            { to: `${basePath}/events`, label: "Wydarzenia", Icon: Compass },
            { to: `${basePath}/tickets`, label: "Bilety", Icon: Ticket },
            { to: `${basePath}/profile`, label: "Profil", Icon: User },
          ];

  return (
    <div className="relative z-10 min-h-screen">
      {/* Main content area — bottom padding clears the floating dock */}
      <main className="mx-auto w-full px-4 pb-32 pt-6 md:px-8">
        <Outlet />
      </main>

      {/* Floating bottom navigation dock */}
      <nav className="fixed inset-x-0 bottom-4 z-50 px-3">
        <div className="animate-fade-in mx-auto flex w-[90%] max-w-5xl items-center gap-2 rounded-xl border border-border-light bg-surface-raised/85 p-2 shadow-lg backdrop-blur-md">
          {/* Brand */}
          <div
            className="hidden items-center gap-2 pl-1 pr-2 sm:flex"
            title={`Panel ${roleLabel}`}
          >
            <div className="grid h-8 w-8 place-items-center rounded bg-accent-primary text-text-on-accent">
              <Zap size={16} />
            </div>
            <span className="hidden text-sm font-bold text-text-primary lg:inline">
              EventHub
            </span>
          </div>

          {/* Nav pills — rozciągnięte równo na całą szerokość paska */}
          <div className="flex flex-1 items-center justify-center gap-1.5">
            {navItems.map(({ to, label, Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                title={label}
                className={({ isActive }) =>
                  `flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition ${
                    isActive
                      ? "bg-accent-primary text-text-on-accent"
                      : "text-text-muted hover:text-text-primary"
                  }`
                }
              >
                <Icon size={16} />
                <span className="hidden sm:inline">{label}</span>
              </NavLink>
            ))}
          </div>

          {/* Right cluster: theme + logout */}
          <div className="flex items-center gap-2 pl-1">
            <ThemeSwitcher />
            <button
              onClick={handleLogout}
              aria-label="Wyloguj się"
              title="Wyloguj się"
              className="grid h-9 w-9 place-items-center rounded-md text-status-error transition hover:bg-status-error-bg"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default DashboardLayout;
