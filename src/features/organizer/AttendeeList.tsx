import { useParams, Link } from "react-router-dom";
import { ArrowLeft, UserCheck, Check, Clock } from "lucide-react";
import { useEventAttendees, useManualCheckIn } from "./api/useEvents";
import { useToastStore } from "@/store/useToastStore";
import PageHeader from "@/components/ui/PageHeader";

const AttendeeList = () => {
  const { id } = useParams<{ id: string }>();
  const { data: attendees, isLoading } = useEventAttendees(id);
  const checkInMutation = useManualCheckIn(id);
  const addToast = useToastStore((state) => state.addToast);

  const handleManualCheckIn = (scanToken: string) => {
    if (window.confirm("Czy na pewno chcesz ręcznie potwierdzić ten bilet?")) {
      checkInMutation.mutate(scanToken, {
        onSuccess: () => addToast("Bilet skasowany pomyślnie!", "success"),
        onError: () => addToast("Błąd podczas kasowania biletu.", "error"),
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
                  <td className="p-4 text-right">
                    {!attendee.isScanned && (
                      <button
                        onClick={() => handleManualCheckIn(attendee.scanToken)}
                        disabled={checkInMutation.isPending}
                        className="inline-flex items-center gap-1.5 rounded-md bg-accent-primary px-3 py-1.5 text-sm text-text-on-accent transition hover:bg-accent-hover disabled:opacity-50"
                      >
                        <UserCheck size={15} />
                        Wpuść
                      </button>
                    )}
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
