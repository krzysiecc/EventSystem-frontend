import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, ImagePlus, Trash2, Save } from "lucide-react";
import DOMPurify from "dompurify";
import {
  useOrganizerEventDetails,
  useUpdateEvent,
  useDeleteEvent,
  useUploadEventImage,
} from "./api/useEvents";
import { useToastStore } from "@/store/useToastStore";
import { useConfirmStore } from "@/store/useConfirmStore";
import { useAuthStore } from "@/store/useAuthStore";
import LocationPicker, {
  type LocationValue,
} from "@/components/ui/LocationPicker";

const editEventSchema = z
  .object({
    title: z
      .string()
      .min(3, "Tytuł musi mieć min. 3 znaki")
      .max(100, "Tytuł jest za długi"),
    startDate: z.string().min(1, "Data startu jest wymagana"),
    endDate: z.string().min(1, "Data końca jest wymagana"),
    maxCapacity: z.number().min(1, "Pojemność musi wynosić minimum 1"),
    description: z.string().min(10, "Opis musi mieć min. 10 znaków"),
    // Okna zapisów (opcjonalne). Puste = rejestracja otwarta od razu.
    registrationOpensAt: z.string().optional(),
    presaveOpensAt: z.string().optional(),
  })
  .refine((d) => new Date(d.endDate) >= new Date(d.startDate), {
    message: "Koniec nie może być wcześniej niż start",
    path: ["endDate"],
  })
  .refine(
    (d) =>
      !d.registrationOpensAt ||
      new Date(d.registrationOpensAt) <= new Date(d.startDate),
    {
      message: "Rejestracja musi otwierać się najpóźniej w momencie startu",
      path: ["registrationOpensAt"],
    },
  )
  .refine(
    (d) =>
      !d.presaveOpensAt ||
      !d.registrationOpensAt ||
      new Date(d.presaveOpensAt) <= new Date(d.registrationOpensAt),
    {
      message: "Pre-rejestracja nie może być później niż otwarcie rejestracji",
      path: ["presaveOpensAt"],
    },
  );

type EditEventFormInputs = z.infer<typeof editEventSchema>;

const labelClass =
  "mb-1.5 block font-mono text-xs uppercase tracking-wider text-text-muted";
const inputClass =
  "w-full rounded-md border border-border-medium bg-bg-tertiary p-2 text-text-primary focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary";

// Backend ISO (UTC) → wartość dla `datetime-local` w czasie LOKALNYM.
const toLocalInput = (iso: string) => {
  const d = new Date(iso);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
};

// Lokalny czas z formularza → ISO w UTC (z „Z") wysyłane do backendu.
const toUtcIso = (v: string | null | undefined): string | null => {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
};

const EditEvent = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: event, isLoading } = useOrganizerEventDetails(id);
  const updateMutation = useUpdateEvent();
  const deleteMutation = useDeleteEvent();
  const uploadImageMutation = useUploadEventImage();
  const addToast = useToastStore((state) => state.addToast);
  const confirm = useConfirmStore((state) => state.confirm);
  const isAdmin = useAuthStore((state) => state.user?.role === "Admin");

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loc, setLoc] = useState<LocationValue>({
    location: "",
    locationName: "",
    lat: null,
    lng: null,
  });
  const [loadedId, setLoadedId] = useState<string | null>(null);
  const [locError, setLocError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<EditEventFormInputs>({
    resolver: zodResolver(editEventSchema),
  });

  useEffect(() => {
    if (event && !isDirty) {
      reset({
        title: event.title,
        description: event.description,
        startDate: toLocalInput(event.startDate ?? event.date),
        endDate: toLocalInput(event.endDate ?? event.date),
        maxCapacity: event.maxCapacity,
        registrationOpensAt: event.registrationOpensAt
          ? toLocalInput(event.registrationOpensAt)
          : "",
        presaveOpensAt: event.presaveOpensAt
          ? toLocalInput(event.presaveOpensAt)
          : "",
      });
    }
  }, [event, reset, isDirty]);

  // seed lokalizacji raz na wczytane wydarzenie (render-phase, bez efektu)
  if (event && loadedId !== id) {
    setLoc({
      location: event.location ?? "",
      locationName: event.locationName ?? "",
      lat: event.lat ?? null,
      lng: event.lng ?? null,
    });
    setLoadedId(id ?? null);
  }

  if (isLoading) return <div className="p-6">Ładowanie...</div>;

  const onSubmit = (data: EditEventFormInputs) => {
    if (loc.location.trim().length < 2) {
      setLocError("Podaj lokalizację");
      return;
    }
    setLocError(null);
    const cleanDescription = DOMPurify.sanitize(data.description);

    updateMutation.mutate(
      {
        id: id!,
        data: {
          ...data,
          location: loc.location,
          locationName: loc.locationName,
          lat: loc.lat,
          lng: loc.lng,
          // Czas z formularza (lokalny) → UTC z „Z". Backend traktuje drut jako
          // UTC, więc bez tego zapisany czas przesuwa się o offset przy odczycie.
          // startDate/endDate są wymagane przez schemat → zawsze poprawne.
          startDate: new Date(data.startDate).toISOString(),
          endDate: new Date(data.endDate).toISOString(),
          date: new Date(data.startDate).toISOString(), // kompatybilność ze starym backendem
          description: cleanDescription,
          registrationOpensAt: toUtcIso(data.registrationOpensAt),
          presaveOpensAt: toUtcIso(data.presaveOpensAt),
        },
      },
      {
        onSuccess: () => addToast("Zaktualizowano pomyślnie", "success"),
        onError: (err: unknown) =>
          addToast(err instanceof Error ? err.message : "Błąd", "error"),
      },
    );
  };

  const handleImageUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;
    uploadImageMutation.mutate(
      { id: id!, file: selectedFile },
      {
        onSuccess: () => {
          addToast("Zdjęcie wgrane pomyślnie!", "success");
          setSelectedFile(null);
        },
        onError: (err: unknown) =>
          addToast(err instanceof Error ? err.message : "Błąd", "error"),
      },
    );
  };

  const handleDelete = async () => {
    const ok = await confirm({
      title: "Usunąć wydarzenie?",
      message:
        "Wydarzenie zostanie trwale usunięte. Upewnij się, że nie ma zarejestrowanych osób.",
      confirmText: "Usuń wydarzenie",
      variant: "danger",
    });
    if (!ok) return;
    deleteMutation.mutate(id!, {
      onSuccess: () => {
        addToast("Usunięto wydarzenie", "success");
        navigate(isAdmin ? "/admin/events" : "/organizer/events");
      },
      onError: (err: unknown) =>
        addToast(err instanceof Error ? err.message : "Błąd", "error"),
    });
  };

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        to={`/organizer/events/${id}`}
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-accent-primary hover:underline"
      >
        <ArrowLeft size={15} />
        Wróć do szczegółów
      </Link>
      <h1 className="mb-6 text-3xl font-extrabold tracking-tight text-text-primary">
        Edytuj wydarzenie
      </h1>

      <section className="mb-6 rounded-xl border border-border-light bg-surface-raised p-6">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-text-primary">
          <ImagePlus size={18} className="text-accent-primary" />
          Baner wydarzenia
        </h2>
        <form onSubmit={handleImageUpload} className="flex items-center gap-4">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            className="flex-1 text-sm text-text-secondary file:mr-4 file:rounded-md file:border-0 file:bg-accent-subtle file:px-4 file:py-2 file:text-sm file:font-semibold file:text-accent-primary hover:file:bg-accent-hover"
          />
          <button
            type="submit"
            disabled={!selectedFile || uploadImageMutation.isPending}
            className="rounded-md bg-accent-primary px-4 py-2 text-text-on-accent transition hover:bg-accent-hover disabled:opacity-50"
          >
            Wgraj zdjęcie
          </button>
        </form>
      </section>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-5 rounded-xl border border-border-light bg-surface-raised p-6 shadow-sm"
      >
        <div>
          <label className={labelClass}>Tytuł</label>
          <input type="text" {...register("title")} className={inputClass} />
          {errors.title && (
            <p className="mt-1 text-sm text-status-error">
              {errors.title.message}
            </p>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Początek</label>
            <input
              type="datetime-local"
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
          <label className={labelClass}>Maks. pojemność</label>
          <input
            type="number"
            {...register("maxCapacity", { valueAsNumber: true })}
            className={inputClass}
          />
          {errors.maxCapacity && (
            <p className="mt-1 text-sm text-status-error">
              {errors.maxCapacity.message}
            </p>
          )}
        </div>
        <div>
          <label className={labelClass}>Otwarcie zapisów (opcjonalne)</label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="mb-1 block text-xs text-text-muted">
                Pre-rejestracja (presave)
              </span>
              <input
                type="datetime-local"
                {...register("presaveOpensAt")}
                className={inputClass}
              />
              {errors.presaveOpensAt && (
                <p className="mt-1 text-sm text-status-error">
                  {errors.presaveOpensAt.message}
                </p>
              )}
            </div>
            <div>
              <span className="mb-1 block text-xs text-text-muted">
                Otwarcie rejestracji
              </span>
              <input
                type="datetime-local"
                {...register("registrationOpensAt")}
                className={inputClass}
              />
              {errors.registrationOpensAt && (
                <p className="mt-1 text-sm text-status-error">
                  {errors.registrationOpensAt.message}
                </p>
              )}
            </div>
          </div>
          <p className="mt-1.5 text-xs text-text-muted">
            Puste = rejestracja otwarta od razu. „Presave" to wcześniejsze okno
            zapisów, zanim ruszy właściwa rejestracja.
          </p>
        </div>
        <div>
          <label className={labelClass}>Lokalizacja</label>
          <LocationPicker value={loc} onChange={setLoc} />
          {locError && (
            <p className="mt-1 text-sm text-status-error">{locError}</p>
          )}
        </div>
        <div>
          <label className={labelClass}>Opis (obsługuje HTML)</label>
          <textarea
            rows={5}
            {...register("description")}
            className={inputClass}
          ></textarea>
          {errors.description && (
            <p className="mt-1 text-sm text-status-error">
              {errors.description.message}
            </p>
          )}
        </div>
        <div className="flex items-center justify-between border-t border-border-light pt-4">
          <button
            type="button"
            onClick={handleDelete}
            className="flex items-center gap-1.5 font-bold text-status-error hover:underline"
          >
            <Trash2 size={16} />
            Usuń wydarzenie
          </button>
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="flex items-center gap-2 rounded-md bg-accent-primary px-6 py-2 text-text-on-accent transition hover:bg-accent-hover disabled:opacity-50"
          >
            <Save size={16} />
            {updateMutation.isPending ? "Zapisywanie..." : "Zapisz zmiany"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditEvent;
