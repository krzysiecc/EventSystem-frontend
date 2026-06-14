import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import { apiClient } from "@/lib/apiClient";
import { useToastStore } from "@/store/useToastStore";
import AuthBrand from "@/components/ui/AuthBrand";

const loginSchema = z.object({
  email: z.string().email({ message: "Niepoprawny adres e-mail" }),
  password: z
    .string()
    .min(6, { message: "Hasło musi mieć co najmniej 6 znaków" }),
});

type LoginFormInputs = z.infer<typeof loginSchema>;

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((state) => state.login);
  const addToast = useToastStore((state) => state.addToast);

  // Redirect to intended page or role-based default after login
  const from = location.state?.from?.pathname || null;

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormInputs) => {
    try {
      const response = await apiClient("/auth/login", {
        method: "POST",
        body: JSON.stringify(data),
      });

      const result = await response.json();

      const normalizedRole =
        result.role.charAt(0).toUpperCase() + result.role.slice(1);
      login(normalizedRole, result.userId.toString());

      addToast("Zalogowano pomyślnie!", "success");

      // Only honour the "from" redirect when it belongs to this user's role,
      // otherwise the role guard would immediately bounce to /unauthorized.
      const rolePath = `/${result.role.toLowerCase()}`;
      const target =
        from && from !== "/unauthorized" && from.startsWith(rolePath)
          ? from
          : rolePath;

      navigate(target, { replace: true });
    } catch (error: unknown) {
      addToast("Nie udało się zalogować: sprawdź dane logowania", "error");
      setError("root", {
        type: "manual",
        message: error instanceof Error ? error.message : "Błąd serwera",
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="relative w-full max-w-md rounded-xl border border-border-light bg-surface-raised p-8 shadow-lg">
        <AuthBrand />
        <h2 className="mb-6 text-center text-2xl font-bold text-text-primary">
          Zaloguj się do swojego konta
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Adres e-mail
            </label>
            <input
              type="email"
              {...register("email")}
              className={`w-full rounded-md border p-2 bg-bg-tertiary text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary ${
                errors.email ? "border-status-error" : "border-border-medium"
              }`}
              placeholder="student@uczelnia.edu.pl"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-status-error">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Hasło
            </label>
            <input
              type="password"
              {...register("password")}
              className={`w-full rounded-md border p-2 bg-bg-tertiary text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary ${
                errors.password ? "border-status-error" : "border-border-medium"
              }`}
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-status-error">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* API-level error display */}
          {errors.root && (
            <div className="rounded-md bg-status-error-bg p-3">
              <p className="text-sm text-status-error">{errors.root.message}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-md bg-accent-primary py-2 text-text-on-accent transition-colors hover:bg-accent-hover disabled:opacity-50"
          >
            {isSubmitting ? "Logowanie..." : "Zaloguj się"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm space-y-2">
          <div>
            <span className="text-text-secondary">Nie masz konta? </span>
            <Link
              to="/register"
              className="font-medium text-accent-primary hover:underline"
            >
              Zarejestruj się jako student
            </Link>
          </div>
          <div>
            <Link
              to="/register-organizer"
              className="text-sm text-text-muted hover:underline"
            >
              Rejestracja organizatora
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
