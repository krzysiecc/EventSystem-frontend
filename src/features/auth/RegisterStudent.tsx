import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, Link } from "react-router-dom";
import { apiClient } from "@/lib/apiClient";
import { useToastStore } from "@/store/useToastStore";
import AuthBrand from "@/components/ui/AuthBrand";

/**
 * @description Zod schema for student registration.
 * Validates first name, last name, email, password strength, and password confirmation.
 */
const registerStudentSchema = z
  .object({
    firstName: z.string().min(2, "Wymagane"),
    lastName: z.string().min(2, "Wymagane"),
    email: z.email({ message: "Niepoprawny adres email" }),
    password: z
      .string()
      .min(8, { message: "Hasło musi mieć co najmniej 8 znaków" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Hasła nie są zgodne",
    path: ["confirmPassword"],
  });

type RegisterStudentInputs = z.infer<typeof registerStudentSchema>;

const RegisterStudent = () => {
  const navigate = useNavigate();
  const addToast = useToastStore((state) => state.addToast);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterStudentInputs>({
    resolver: zodResolver(registerStudentSchema),
  });

  const onSubmit = async (data: RegisterStudentInputs) => {
    try {
      await apiClient("/auth/register/student", {
        method: "POST",
        body: JSON.stringify({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          password: data.password,
        }),
      });

      addToast(
        "Konto utworzone pomyślnie! Możesz się teraz zalogować.",
        "success",
      );
      navigate("/login");
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Rejestracja nie powiodła się. Spróbuj ponownie.";
      setError("root", {
        type: "manual",
        message: errorMessage,
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="relative w-full max-w-md rounded-xl border border-border-light bg-surface-raised p-8 shadow-lg">
        <AuthBrand />
        <h2 className="mb-2 text-center text-2xl font-bold text-text-primary">
          Rejestracja Studenta
        </h2>
        <p className="mb-6 text-center text-sm text-text-secondary">
          Dołącz do platformy, aby odkrywać i uczestniczyć w wydarzeniach
          studenckich.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* First Name */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Imię
            </label>
            <input
              type="text"
              {...register("firstName")}
              className={`w-full rounded-md border p-2 bg-bg-tertiary text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary ${errors.firstName ? "border-status-error" : "border-border-medium"}`}
            />
            {errors.firstName && (
              <p className="mt-1 text-sm text-status-error">
                {errors.firstName.message}
              </p>
            )}
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Nazwisko
            </label>
            <input
              type="text"
              {...register("lastName")}
              className={`w-full rounded-md border p-2 bg-bg-tertiary text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary ${errors.lastName ? "border-status-error" : "border-border-medium"}`}
            />
            {errors.lastName && (
              <p className="mt-1 text-sm text-status-error">
                {errors.lastName.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Adres e-mail
            </label>
            <input
              type="email"
              {...register("email")}
              className={`w-full rounded-md border p-2 bg-bg-tertiary text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary ${errors.email ? "border-status-error" : "border-border-medium"}`}
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
              className={`w-full rounded-md border p-2 bg-bg-tertiary text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary ${errors.password ? "border-status-error" : "border-border-medium"}`}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-status-error">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Potwierdź hasło
            </label>
            <input
              type="password"
              {...register("confirmPassword")}
              className={`w-full rounded-md border p-2 bg-bg-tertiary text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary ${errors.confirmPassword ? "border-status-error" : "border-border-medium"}`}
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-status-error">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

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

export default RegisterStudent;
