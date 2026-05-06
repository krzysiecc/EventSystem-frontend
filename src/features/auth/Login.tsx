import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import { apiClient } from "@/lib/apiClient";

/**
 * @description Login component with form validation using Zod and react-hook-form. Handles authentication and redirects based on user role or intended destination.
 *
 * @param {string} email      user's email address, must be a valid email format
 * @param {string} password   user's password, must be at least 6 characters long
 * @returns {JSX.Element}     login form with validation and error handling
 */
const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

type LoginFormInputs = z.infer<typeof loginSchema>;

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((state) => state.login);

  const from = location.state?.from?.pathname || "/";

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
      login(result.accessToken);

      if (result.refreshToken) {
        localStorage.setItem("refreshToken", result.refreshToken);
      }

      navigate(from, { replace: true });
    } catch {
      setError("root", {
        type: "manual",
        message: "Invalid credentials or server error",
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md rounded-xl bg-surface-raised p-8 shadow-lg border border-border-light">
        <h2 className="mb-6 text-2xl font-bold text-text-primary text-center">
          Sign in to your account
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* email field */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Email Address
            </label>
            <input
              type="email"
              {...register("email")}
              className={`w-full rounded-md border p-2 bg-bg-tertiary text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary ${
                errors.email ? "border-status-error" : "border-border-medium"
              }`}
              placeholder="student@domain.edu"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-status-error">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* password field */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Password
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
          
          {/* api error display */}
          {errors.root && (
            <div className="rounded-md bg-status-error-bg p-3">
              <p className="text-sm text-status-error">{errors.root.message}</p>
            </div>
          )}

          {/* submit button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-md bg-accent-primary py-2 text-text-on-accent transition-colors hover:bg-accent-hover disabled:opacity-50"
          >
            {isSubmitting ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
