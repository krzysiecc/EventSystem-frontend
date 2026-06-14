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

const editEventSchema = z.object({
  title: z
    .string()
    .min(3, "Tytuł musi mieć min. 3 znaki")
    .max(100, "Tytuł jest za długi"),
  date: z.string().min(1, "Data jest wymagana"),
  location: z.string().min(2, "Lokalizacja musi mieć min. 2 znaki"),
  maxCapacity: z.number().min(1, "Pojemność musi wynosić minimum 1"),
  description: z.string().min(10, "Opis musi mieć min. 10 znaków"),
});

type EditEventFormInputs = z.infer<typeof editEventSchema>;

const labelClass =
  "mb-1.5 block font-mono text-xs uppercase tracking-wider text-text-muted";
const inputClass =
  "w-full rounded-md border border-border-medium bg-bg-tertiary p-2 text-text-primary focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary";

const EditEvent = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: event, isLoading } = useOrganizerEventDetails(id);
  const updateMutation = useUpdateEvent();
  const deleteMutation = useDeleteEvent();
  const uploadImageMutation = useUploadEventImage();
  const addToast = useToastStore((state) => state.addToast);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

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
        date: new Date(event.date).toISOString().slice(0, 16),
        location: event.location,
        maxCapacity: event.maxCapacity,
      });
    }
  }, [event, reset, isDirty]);

  if (isLoading) return <div className="p-6">Ładowanie...</div>;

  const onSubmit = (data: EditEventFormInputs) => {
    const cleanDescription = DOMPurify.sanitize(data.description);

    updateMutation.mutate(
      { id: id!, data: { ...data, description: cleanDescription } },
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

  const handleDelete = () => {
    if (
      window.confirm(
        "Czy na pewno chcesz usunąć to wydarzenie? Upewnij się, że nie ma zarejestrowanych osób.",
      )
    ) {
      deleteMutation.mutate(id!, {
        onSuccess: () => {
          addToast("Usunięto wydarzenie", "success");
          navigate("/organizer/events");
        },
        onError: (err: unknown) =>
          addToast(err instanceof Error ? err.message : "Błąd", "error"),
      });
    }
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
            <label className={labelClass}>Data</label>
            <input
              type="datetime-local"
              {...register("date")}
              className={inputClass}
            />
            {errors.date && (
              <p className="mt-1 text-sm text-status-error">
                {errors.date.message}
              </p>
            )}
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
        </div>
        <div>
          <label className={labelClass}>Lokalizacja</label>
          <input type="text" {...register("location")} className={inputClass} />
          {errors.location && (
            <p className="mt-1 text-sm text-status-error">
              {errors.location.message}
            </p>
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
