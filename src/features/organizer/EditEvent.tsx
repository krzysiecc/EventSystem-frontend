import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
    <div className="layout-container py-6 max-w-2xl">
      <Link
        to={`/organizer/events/${id}`}
        className="text-accent-primary hover:underline mb-6 inline-block"
      >
        ← Wróć do szczegółów
      </Link>
      <h1 className="text-2xl font-bold text-text-primary mb-6">
        Edytuj wydarzenie
      </h1>

      <section className="bg-surface-raised p-6 border border-border-light rounded-xl mb-6">
        <h2 className="text-lg font-semibold mb-4 text-text-primary">
          Baner wydarzenia
        </h2>
        <form onSubmit={handleImageUpload} className="flex gap-4 items-center">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            className="flex-1 text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-accent-subtle file:text-accent-primary hover:file:bg-accent-hover"
          />
          <button
            type="submit"
            disabled={!selectedFile || uploadImageMutation.isPending}
            className="bg-accent-primary text-text-on-accent px-4 py-2 rounded-md disabled:opacity-50"
          >
            Wgraj zdjęcie
          </button>
        </form>
      </section>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-surface-raised p-6 rounded-xl border border-border-light shadow-sm space-y-5"
      >
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">
            Tytuł
          </label>
          <input
            type="text"
            {...register("title")}
            className="w-full rounded-md border border-border-medium bg-bg-tertiary p-2 text-text-primary"
          />
          {errors.title && (
            <p className="text-sm text-status-error mt-1">
              {errors.title.message}
            </p>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Data
            </label>
            <input
              type="datetime-local"
              {...register("date")}
              className="w-full rounded-md border border-border-medium bg-bg-tertiary p-2 text-text-primary"
            />
            {errors.date && (
              <p className="text-sm text-status-error mt-1">
                {errors.date.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Maks. pojemność
            </label>
            <input
              type="number"
              {...register("maxCapacity", { valueAsNumber: true })}
              className="w-full rounded-md border border-border-medium bg-bg-tertiary p-2 text-text-primary"
            />
            {errors.maxCapacity && (
              <p className="text-sm text-status-error mt-1">
                {errors.maxCapacity.message}
              </p>
            )}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">
            Lokalizacja
          </label>
          <input
            type="text"
            {...register("location")}
            className="w-full rounded-md border border-border-medium bg-bg-tertiary p-2 text-text-primary"
          />
          {errors.location && (
            <p className="text-sm text-status-error mt-1">
              {errors.location.message}
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">
            Opis (obsługuje HTML)
          </label>
          <textarea
            rows={5}
            {...register("description")}
            className="w-full rounded-md border border-border-medium bg-bg-tertiary p-2 text-text-primary"
          ></textarea>
          {errors.description && (
            <p className="text-sm text-status-error mt-1">
              {errors.description.message}
            </p>
          )}
        </div>
        <div className="pt-4 border-t border-border-light flex justify-between">
          <button
            type="button"
            onClick={handleDelete}
            className="text-status-error font-bold hover:underline"
          >
            Usuń wydarzenie
          </button>
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="bg-accent-primary text-text-on-accent px-6 py-2 rounded-md hover:bg-accent-hover transition disabled:opacity-50"
          >
            {updateMutation.isPending ? "Zapisywanie..." : "Zapisz zmiany"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditEvent;
