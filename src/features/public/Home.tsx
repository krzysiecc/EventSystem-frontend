import { Link, Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";

const Home = () => {
  const { isAuthenticated, user } = useAuthStore();

  if (isAuthenticated && user) {
    return <Navigate to={`/${user.role.toLowerCase()}`} replace />;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg-primary p-6 text-center">
      <div className="max-w-3xl space-y-8">
        <h1 className="text-5xl font-extrabold tracking-tight text-text-primary sm:text-6xl">
          Student Event <span className="text-accent-primary">Manager</span>
        </h1>
        <p className="text-lg leading-relaxed text-text-secondary sm:text-xl">
          Odkrywaj wydarzenia na kampusie, zarządzaj biletami i organizuj
          niezapomniane imprezy.
        </p>

        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            to="/login"
            className="w-full rounded-lg bg-accent-primary px-8 py-3 text-lg font-semibold text-text-on-accent transition-colors hover:bg-accent-hover sm:w-auto shadow-md"
          >
            Zaloguj się
          </Link>
          <Link
            to="/register"
            className="w-full rounded-lg bg-surface-raised px-8 py-3 text-lg font-semibold text-accent-primary border border-border-medium transition-colors hover:bg-accent-subtle sm:w-auto shadow-sm"
          >
            Jestem studentem
          </Link>
        </div>

        <div className="pt-8">
          <p className="text-sm text-text-muted">
            Jesteś organizatorem?{" "}
            <Link
              to="/register-organizer"
              className="font-medium text-accent-primary hover:underline"
            >
              Załóż konto organizatora
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;
