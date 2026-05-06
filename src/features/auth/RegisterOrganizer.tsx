import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, Link } from "react-router-dom";
import { apiClient } from "@/lib/apiClient";
import { useToastStore } from "@/store/useToastStore";

/**
 * @description Zod schema for organizer registration.
 * Validates email, password strength, password confirmation, and org token.
 */
const registerOrganizerSchema = z
  .object({
    email: z.string().email({ message: "Niepoprawny adres e-mail" }),
    password: z
      .string()
      .min(8, { message: "Hasło musi mieć co najmniej 8 znaków" }),
    confirmPassword: z.string(),
    organizationToken: z
      .string()
      .min(5, { message: "Token organizacyjny jest wymagany" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Hasła nie są zgodne",
    path: ["confirmPassword"],
  });

type RegisterOrganizerInputs = z.infer<typeof registerOrganizerSchema>;

const RegisterOrganizer = () => {
  const navigate = useNavigate();
  const addToast = useToastStore((state) => state.addToast);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterOrganizerInputs>({
    resolver: zodResolver(registerOrganizerSchema),
  });

  const onSubmit = async (data: RegisterOrganizerInputs) => {
    try {
      // TODO: confirm payload shape matches .NET DTO
      await apiClient("/auth/register-organizer", {
        method: "POST",
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          organizationToken: data.organizationToken,
        }),
      });

      addToast(
        "Konto utworzone pomyślnie! Możesz się teraz zalogować.",
        "success",
      );
      navigate("/login");
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Rejestracja nie powiodła się. Sprawdź token lub spróbuj ponownie.";

      addToast("Rejestracja nie powiodła się.", "error");
      setError("root", { type: "manual", message });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md rounded-xl bg-surface-raised p-8 shadow-lg border border-border-light">
        <h2 className="mb-2 text-2xl font-bold text-text-primary text-center">
          Rejestracja Organizatora
        </h2>
        <p className="mb-6 text-center text-sm text-text-secondary">
          Wprowadź swoje dane i token organizacyjny, aby utworzyć konto.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email field */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Adres e-mail
            </label>
            <input
              type="email"
              {...register("email")}
              placeholder="organizator@uczelnia.edu.pl"
              className={`w-full rounded-md border p-2 bg-bg-tertiary text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary ${
                errors.email ? "border-status-error" : "border-border-medium"
              }`}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-status-error">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Organization token field */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Token organizacyjny
            </label>
            <input
              type="text"
              {...register("organizationToken")}
              placeholder="np. ORG-2026-XYZ"
              className={`w-full rounded-md border p-2 bg-bg-tertiary text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary ${
                errors.organizationToken
                  ? "border-status-error"
                  : "border-border-medium"
              }`}
            />
            {errors.organizationToken && (
              <p className="mt-1 text-sm text-status-error">
                {errors.organizationToken.message}
              </p>
            )}
          </div>

          {/* Password field */}
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
            />
            {errors.password && (
              <p className="mt-1 text-sm text-status-error">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Confirm password field */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Potwierdź hasło
            </label>
            <input
              type="password"
              {...register("confirmPassword")}
              className={`w-full rounded-md border p-2 bg-bg-tertiary text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary ${
                errors.confirmPassword
                  ? "border-status-error"
                  : "border-border-medium"
              }`}
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-status-error">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* API-level error */}
          {errors.root && (
            <div className="rounded-md bg-status-error-bg p-3">
              <p className="text-sm text-status-error">{errors.root.message}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-md bg-accent-primary py-2 mt-4 text-text-on-accent transition-colors hover:bg-accent-hover disabled:opacity-50"
          >
            {isSubmitting ? "Tworzenie konta..." : "Zarejestruj się"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <span className="text-text-secondary">Masz już konto? </span>
          <Link
            to="/login"
            className="font-medium text-accent-primary hover:underline"
          >
            Zaloguj się
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterOrganizer;
