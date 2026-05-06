import { useRouteError, Link } from "react-router-dom";

const ErrorBoundary = () => {
  const error = useRouteError() as { statusText?: string; message?: string };
  console.error("Route Error:", error);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg-primary p-4">
      <h1 className="mb-4 text-3xl font-bold text-status-error">
        Coś poszło nie tak!
      </h1>
      <p className="mb-6 text-text-secondary">
        {error?.statusText || error?.message || "Wystąpił nieoczekiwany błąd."}
      </p>
      <Link
        to="/"
        className="rounded bg-accent-primary px-4 py-2 text-text-on-accent hover:bg-accent-hover"
      >
        Wróć na stronę główną
      </Link>
    </div>
  );
};

export default ErrorBoundary;
