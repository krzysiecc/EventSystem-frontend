import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, Link } from "react-router-dom";
import DOMPurify from "dompurify";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { useToastStore } from "@/store/useToastStore";

// TODO: check validation with DTOs
const createEventSchema = z.object({
  title: z
    .string()
    .min(3, "Tytuł musi mieć min. 3 znaki")
    .max(100, "Tytuł jest za długi"),
  date: z.string().min(1, "Data jest wymagana"),
  location: z.string().min(2, "Lokalizacja musi mieć min. 2 znaki"),
  capacity: z.coerce.number().min(1, "Pojemność musi wynosić minimum 1"),
  description: z.string().min(10, "Opis musi mieć min. 10 znaków"),
});

type CreateEventInputs = z.infer<typeof createEventSchema>;
type CreateEventFormInputs = z.input<typeof createEventSchema>;

const CreateEvent = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const addToast = useToastStore((state) => state.addToast);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateEventFormInputs, unknown, CreateEventInputs>({
    resolver: zodResolver(createEventSchema),
  });

  const createEventMutation = useMutation({
    mutationFn: async (data: CreateEventInputs) => {
      const cleanDescription = DOMPurify.sanitize(data.description);

      const response = await apiClient("/events", {
        method: "POST",
        body: JSON.stringify({ ...data, description: cleanDescription }),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organizer", "events"] });
      addToast("Wydarzenie zostało pomyślnie utworzone (draft)", "success");
      navigate("/organizer");
    },
    onError: () => {
      addToast("Wystąpił błąd podczas tworzenia wydarzenia.", "error");
    },
  });

  const onSubmit = (data: CreateEventInputs) => {
    createEventMutation.mutate(data);
  };

  return (
    <div className="layout-container py-6 max-w-2xl">
      <div className="mb-6">
        <Link to="/organizer" className="text-accent-primary hover:underline">
          ← Powrót do panelu
        </Link>
        <h1 className="text-2xl font-bold text-text-primary mt-4">
          Utwórz nowe wydarzenie
        </h1>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-surface-raised p-6 rounded-xl border border-border-light shadow-sm space-y-5"
      >
        {/* Tytuł */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">
            Tytuł wydarzenia
          </label>
          <input
            {...register("title")}
            className="w-full rounded-md border border-border-medium bg-bg-tertiary p-2 text-text-primary focus:ring-2 focus:ring-accent-primary"
            placeholder="np. Nocne Programowanie z Pizzą"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-status-error">
              {errors.title.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Data */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Data i godzina
            </label>
            <input
              type="datetime-local"
              {...register("date")}
              className="w-full rounded-md border border-border-medium bg-bg-tertiary p-2 text-text-primary focus:ring-2 focus:ring-accent-primary"
            />
            {errors.date && (
              <p className="mt-1 text-sm text-status-error">
                {errors.date.message}
              </p>
            )}
          </div>

          {/* Pojemność */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Liczba miejsc (dostępnych)
            </label>
            <input
              type="number"
              {...register("capacity")}
              className="w-full rounded-md border border-border-medium bg-bg-tertiary p-2 text-text-primary focus:ring-2 focus:ring-accent-primary"
              placeholder="np. 50"
            />
            {errors.capacity && (
              <p className="mt-1 text-sm text-status-error">
                {errors.capacity.message}
              </p>
            )}
          </div>
        </div>

        {/* Lokalizacja */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">
            Lokalizacja
          </label>
          <input
            {...register("location")}
            className="w-full rounded-md border border-border-medium bg-bg-tertiary p-2 text-text-primary focus:ring-2 focus:ring-accent-primary"
            placeholder="np. Aula Główna, Budynek A"
          />
          {errors.location && (
            <p className="mt-1 text-sm text-status-error">
              {errors.location.message}
            </p>
          )}
        </div>

        {/* Opis */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">
            Opis (obsługuje HTML, bezpieczny przed XSS)
          </label>
          <textarea
            {...register("description")}
            rows={5}
            className="w-full rounded-md border border-border-medium bg-bg-tertiary p-2 text-text-primary focus:ring-2 focus:ring-accent-primary"
            placeholder="Podaj szczegóły wydarzenia..."
          ></textarea>
          {errors.description && (
            <p className="mt-1 text-sm text-status-error">
              {errors.description.message}
            </p>
          )}
        </div>

        <div className="pt-4 border-t border-border-light">
          <button
            type="submit"
            disabled={createEventMutation.isPending}
            className="w-full bg-accent-primary text-text-on-accent py-2 rounded-md font-medium hover:bg-accent-hover transition-colors disabled:opacity-50"
          >
            {createEventMutation.isPending
              ? "Zapisywanie..."
              : "Utwórz wydarzenie"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateEvent;
