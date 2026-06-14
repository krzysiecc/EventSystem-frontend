import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Plus } from "lucide-react";
import DOMPurify from "dompurify";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { useToastStore } from "@/store/useToastStore";
import LocationPicker, {
  type LocationValue,
} from "@/components/ui/LocationPicker";

const createEventSchema = z
  .object({
    title: z
      .string()
      .min(3, "Tytuł musi mieć min. 3 znaki")
      .max(100, "Tytuł jest za długi"),
    startDate: z.string().min(1, "Data startu jest wymagana"),
    endDate: z.string().min(1, "Data końca jest wymagana"),
    maxCapacity: z.coerce.number().min(1, "Pojemność musi wynosić minimum 1"),
    description: z.string().min(10, "Opis musi mieć min. 10 znaków"),
  })
  .refine((d) => new Date(d.endDate) >= new Date(d.startDate), {
    message: "Koniec nie może być wcześniej niż start",
    path: ["endDate"],
  });

type CreateEventInputs = z.infer<typeof createEventSchema>;
type CreateEventFormInputs = z.input<typeof createEventSchema>;
type CreatePayload = CreateEventInputs & LocationValue;

const labelClass =
  "mb-1.5 block font-mono text-xs uppercase tracking-wider text-text-muted";
const inputClass =
  "w-full rounded-md border border-border-medium bg-bg-tertiary p-2 text-text-primary focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary";

// minimalna data = teraz (lokalnie), żeby nie dało się wybrać przeszłości
const minDateTime = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
};

const CreateEvent = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const addToast = useToastStore((state) => state.addToast);
  const min = minDateTime();

  const [loc, setLoc] = useState<LocationValue>({
    location: "",
    locationName: "",
    lat: null,
    lng: null,
  });
  const [locError, setLocError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateEventFormInputs, unknown, CreateEventInputs>({
    resolver: zodResolver(createEventSchema),
  });

  const createEventMutation = useMutation({
    mutationFn: async (payload: CreatePayload) => {
      const cleanDescription = DOMPurify.sanitize(payload.description);
      const response = await apiClient("/events", {
        method: "POST",
        body: JSON.stringify({
          ...payload,
          description: cleanDescription,
          date: payload.startDate, // kompatybilność ze starym backendem
        }),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organizer", "events"] });
      addToast("Wydarzenie zostało pomyślnie utworzone", "success");
      navigate("/organizer");
    },
    onError: () => {
      addToast("Wystąpił błąd podczas tworzenia wydarzenia.", "error");
    },
  });

  const onSubmit = (data: CreateEventInputs) => {
    if (loc.location.trim().length < 2) {
      setLocError("Podaj lokalizację");
      return;
    }
    setLocError(null);
    createEventMutation.mutate({ ...data, ...loc });
  };

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        to="/organizer"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-accent-primary hover:underline"
      >
        <ArrowLeft size={15} />
        Powrót do panelu
      </Link>
      <h1 className="mb-6 text-3xl font-extrabold tracking-tight text-text-primary">
        Utwórz nowe wydarzenie
      </h1>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-5 rounded-xl border border-border-light bg-surface-raised p-6 shadow-sm"
      >
        <div>
          <label className={labelClass}>Tytuł wydarzenia</label>
          <input
            {...register("title")}
            className={inputClass}
            placeholder="np. Nocne Programowanie z Pizzą"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-status-error">
              {errors.title.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <label className={labelClass}>Początek</label>
            <input
              type="datetime-local"
              min={min}
              {...register("startDate")}
              className={inputClass}
            />
            {errors.startDate && (
              <p className="mt-1 text-sm text-status-error">
                {errors.startDate.message}
              </p>
            )}
          </div>
          <div>
            <label className={labelClass}>Koniec</label>
            <input
              type="datetime-local"
              min={min}
              {...register("endDate")}
              className={inputClass}
            />
            {errors.endDate && (
              <p className="mt-1 text-sm text-status-error">
                {errors.endDate.message}
              </p>
            )}
          </div>
        </div>

        <div>
          <label className={labelClass}>Liczba miejsc (dostępnych)</label>
          <input
            type="number"
            {...register("maxCapacity")}
            className={inputClass}
            placeholder="np. 50"
          />
          {errors.maxCapacity && (
            <p className="mt-1 text-sm text-status-error">
              {errors.maxCapacity.message}
            </p>
          )}
        </div>

        <div>
          <label className={labelClass}>Lokalizacja</label>
          <LocationPicker value={loc} onChange={setLoc} />
          {locError && (
            <p className="mt-1 text-sm text-status-error">{locError}</p>
          )}
        </div>

        <div>
          <label className={labelClass}>
            Opis (obsługuje HTML, bezpieczny przed XSS)
          </label>
          <textarea
            {...register("description")}
            rows={5}
            className={inputClass}
            placeholder="Podaj szczegóły wydarzenia..."
          ></textarea>
          {errors.description && (
            <p className="mt-1 text-sm text-status-error">
              {errors.description.message}
            </p>
          )}
        </div>

        <div className="border-t border-border-light pt-4">
          <button
            type="submit"
            disabled={createEventMutation.isPending}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-accent-primary py-2.5 font-medium text-text-on-accent transition hover:bg-accent-hover disabled:opacity-50"
          >
            <Plus size={16} />
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
