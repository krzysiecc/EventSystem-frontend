import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Plus } from "lucide-react";
import DOMPurify from "dompurify";
import { useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { useToastStore } from "@/store/useToastStore";
import LocationPicker, {
  type LocationValue,
} from "@/components/ui/LocationPicker";
import RecurrencePicker from "@/components/ui/RecurrencePicker";
import {
  DEFAULT_RECURRENCE,
  expandOccurrences,
  toLocalInput,
  type Recurrence,
} from "@/lib/recurrence";

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
  const [recurrence, setRecurrence] = useState<Recurrence>(DEFAULT_RECURRENCE);
  const [submitting, setSubmitting] = useState(false);
  // Postęp tworzenia serii (np. 3/12) — null dla pojedynczego wydarzenia.
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(
    null,
  );

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CreateEventFormInputs, unknown, CreateEventInputs>({
    resolver: zodResolver(createEventSchema),
  });

  // useWatch (zamiast watch()) — przyjazne dla React Compiler, odświeża podgląd
  // cyklu przy zmianie dat startu/końca.
  const startVal = useWatch({ control, name: "startDate" }) ?? "";
  const endVal = useWatch({ control, name: "endDate" }) ?? "";

  const onSubmit = async (data: CreateEventInputs) => {
    if (loc.location.trim().length < 2) {
      setLocError("Podaj lokalizację");
      return;
    }
    setLocError(null);

    const { occurrences } = expandOccurrences(
      data.startDate,
      data.endDate,
      recurrence,
    );
    if (occurrences.length === 0) {
      addToast(
        "Brak terminów do utworzenia — sprawdź ustawienia powtarzania.",
        "error",
      );
      return;
    }

    const cleanDescription = DOMPurify.sanitize(data.description);
    const postOne = (start: Date, end: Date) =>
      apiClient("/events", {
        method: "POST",
        body: JSON.stringify({
          title: data.title,
          maxCapacity: data.maxCapacity,
          description: cleanDescription,
          ...loc,
          startDate: toLocalInput(start),
          endDate: toLocalInput(end),
          date: toLocalInput(start), // kompatybilność ze starym backendem
        }),
      }).then((r) => r.json());

    setSubmitting(true);

    // Pojedyncze wydarzenie — bez paska postępu.
    if (occurrences.length === 1) {
      try {
        await postOne(occurrences[0].start, occurrences[0].end);
        queryClient.invalidateQueries({ queryKey: ["organizer", "events"] });
        addToast("Wydarzenie zostało pomyślnie utworzone", "success");
        navigate("/organizer");
      } catch {
        addToast("Wystąpił błąd podczas tworzenia wydarzenia.", "error");
        setSubmitting(false);
      }
      return;
    }

    // Seria — tworzymy po kolei, zliczając sukcesy i porażki (częściowe
    // niepowodzenie nie przerywa reszty terminów).
    let ok = 0;
    let failed = 0;
    setProgress({ done: 0, total: occurrences.length });
    for (let i = 0; i < occurrences.length; i++) {
      try {
        await postOne(occurrences[i].start, occurrences[i].end);
        ok++;
      } catch {
        failed++;
      }
      setProgress({ done: i + 1, total: occurrences.length });
    }
    queryClient.invalidateQueries({ queryKey: ["organizer", "events"] });
    setSubmitting(false);
    setProgress(null);

    if (failed === 0) {
      addToast(`Utworzono serię: ${ok} terminów.`, "success");
      navigate("/organizer");
    } else if (ok > 0) {
      addToast(
        `Utworzono ${ok} z ${occurrences.length} terminów; ${failed} nie powiodło się.`,
        "error",
      );
      navigate("/organizer");
    } else {
      addToast("Nie udało się utworzyć żadnego terminu.", "error");
    }
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
          <label className={labelClass}>Cykliczność</label>
          <RecurrencePicker
            value={recurrence}
            onChange={setRecurrence}
            start={startVal}
            end={endVal}
          />
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
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-accent-primary py-2.5 font-medium text-text-on-accent transition hover:bg-accent-hover disabled:opacity-50"
          >
            <Plus size={16} />
            {progress
              ? `Tworzenie ${progress.done}/${progress.total}…`
              : submitting
                ? "Zapisywanie..."
                : recurrence.repeat
                  ? "Utwórz serię"
                  : "Utwórz wydarzenie"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateEvent;
