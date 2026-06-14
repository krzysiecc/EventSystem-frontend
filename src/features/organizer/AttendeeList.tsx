import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  UserCheck,
  Check,
  Clock,
  RotateCcw,
  Trash2,
} from "lucide-react";
import {
  useEventAttendees,
  useManualCheckIn,
  useResetTicketScan,
  useDeleteTicket,
} from "./api/useEvents";
import { useToastStore } from "@/store/useToastStore";
import { useAuthStore } from "@/store/useAuthStore";
import PageHeader from "@/components/ui/PageHeader";

const AttendeeList = () => {
  const { id } = useParams<{ id: string }>();
  const { data: attendees, isLoading } = useEventAttendees(id);
  const checkInMutation = useManualCheckIn(id);
  const resetMutation = useResetTicketScan(id);
  const deleteTicketMutation = useDeleteTicket(id);
  const addToast = useToastStore((state) => state.addToast);
  const isAdmin = useAuthStore((state) => state.user?.role === "Admin");

  const handleManualCheckIn = (scanToken: string) => {
    if (window.confirm("Czy na pewno chcesz ręcznie potwierdzić ten bilet?")) {
      checkInMutation.mutate(scanToken, {
        onSuccess: () => addToast("Bilet skasowany pomyślnie!", "success"),
        onError: () => addToast("Błąd podczas kasowania biletu.", "error"),
      });
    }
  };

  // (ADMIN) cofnięcie błędnego skanu — przywraca bilet do stanu „oczekuje"
  const handleResetScan = (scanToken: string) => {
    if (window.confirm("Cofnąć wejście (reset skanu) dla tego biletu?")) {
      resetMutation.mutate(scanToken, {
        onSuccess: () => addToast("Skan cofnięty.", "success"),
        onError: () => addToast("Nie udało się cofnąć skanu.", "error"),
      });
    }
  };

  // (ADMIN) usunięcie biletu — np. przypadkowy zapis na wydarzenie
  const handleDeleteTicket = (ticketId: number) => {
    if (window.confirm("Usunąć bilet tego uczestnika? Zwolni to miejsce.")) {
      deleteTicketMutation.mutate(ticketId, {
        onSuccess: () => addToast("Bilet usunięty.", "success"),
        onError: () => addToast("Nie udało się usunąć biletu.", "error"),
      });
    }
  };

  if (isLoading) return <div className="p-6">Ładowanie uczestników...</div>;

  return (
    <div className="mx-auto max-w-6xl">
      <Link
        to={`/organizer/events/${id}`}
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-accent-primary hover:underline"
      >
        <ArrowLeft size={15} />
        Wróć do wydarzenia
      </Link>

      <PageHeader kicker="Organizator" title="Lista uczestników" />

      <div className="overflow-x-auto rounded-xl border border-border-light bg-surface-raised shadow-sm">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-border-light font-mono text-xs uppercase tracking-wider text-text-muted">
              <th className="p-4 font-medium">Student</th>
              <th className="p-4 font-medium">E-mail</th>
              <th className="p-4 font-medium">Status biletu</th>
              <th className="p-4 text-right font-medium">Akcja</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-light">
            {attendees?.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-text-muted">
                  Brak zapisanych studentów.
                </td>
              </tr>
            ) : (
              attendees?.map((attendee) => (
                <tr
                  key={attendee.id}
                  className="transition-colors hover:bg-bg-secondary"
                >
                  <td className="p-4 font-medium text-text-primary">
                    {attendee.firstName} {attendee.lastName}
                  </td>
                  <td className="p-4 font-mono text-sm text-text-secondary">
                    {attendee.studentEmail}
                  </td>
                  <td className="p-4">
                    {attendee.isScanned ? (
                      <span className="inline-flex items-center gap-1.5 rounded bg-status-error-bg px-2 py-1 font-mono text-xs font-medium text-status-error">
                        <Check size={13} />
                        ZUŻYTY (Obecny)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded bg-status-info-bg px-2 py-1 font-mono text-xs font-medium text-status-info">
                        <Clock size={13} />
                        OCZEKUJE
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex flex-wrap items-center justify-end gap-2">
                      {!attendee.isScanned && (
                        <button
                          onClick={() =>
                            handleManualCheckIn(attendee.scanToken)
                          }
                          disabled={checkInMutation.isPending}
                          className="inline-flex items-center gap-1.5 rounded-md bg-accent-primary px-3 py-1.5 text-sm text-text-on-accent transition hover:bg-accent-hover disabled:opacity-50"
                        >
                          <UserCheck size={15} />
                          Wpuść
                        </button>
                      )}
                      {isAdmin && attendee.isScanned && (
                        <button
                          onClick={() => handleResetScan(attendee.scanToken)}
                          disabled={resetMutation.isPending}
                          className="inline-flex items-center gap-1.5 rounded-md border border-border-medium px-3 py-1.5 text-sm text-text-secondary transition hover:border-accent-primary hover:text-text-primary disabled:opacity-50"
                        >
                          <RotateCcw size={15} />
                          Cofnij wejście
                        </button>
                      )}
                      {isAdmin && (
                        <button
                          onClick={() => handleDeleteTicket(attendee.id)}
                          disabled={deleteTicketMutation.isPending}
                          className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-status-error transition hover:bg-status-error-bg disabled:opacity-50"
                        >
                          <Trash2 size={15} />
                          Usuń
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttendeeList;
