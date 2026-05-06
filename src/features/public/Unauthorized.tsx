import { Link } from "react-router-dom";

/**
 * @description Fallback page when a user tries to access a route they don't have roles for.
 */
const Unauthorized = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg-primary p-4">
      <div className="text-center max-w-md bg-surface-raised p-8 rounded-xl shadow-md border border-border-light">
        <h1 className="text-4xl font-bold text-status-error mb-4">403</h1>
        <h2 className="text-xl font-semibold text-text-primary mb-2">
          Odmowa dostępu
        </h2>
        <p className="text-text-secondary mb-6">
          Nie masz wymaganych uprawnień, aby wyświetlić tę stronę.
        </p>
        <Link
          to="/"
          className="inline-block rounded-md bg-accent-primary px-6 py-2 text-text-on-accent hover:bg-accent-hover transition-colors"
        >
          Wróć do strony głównej
        </Link>
      </div>
    </div>
  );
};

export default Unauthorized;
