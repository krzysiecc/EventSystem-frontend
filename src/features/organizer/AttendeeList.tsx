import { useParams, Link } from "react-router-dom";
import { useEventAttendees, useManualCheckIn } from "./api/useEvents";
import { useToastStore } from "@/store/useToastStore";

const AttendeeList = () => {
  const { id } = useParams<{ id: string }>();
  const { data: attendees, isLoading } = useEventAttendees(id);
  const checkInMutation = useManualCheckIn(id);
  const addToast = useToastStore((state) => state.addToast);

  const handleManualCheckIn = (ticketId: string) => {
    if (window.confirm("Czy na pewno chcesz ręcznie potwierdzić ten bilet?")) {
      checkInMutation.mutate(ticketId, {
        onSuccess: () => addToast("Bilet skasowany pomyślnie!", "success"),
        onError: () => addToast("Błąd podczas kasowania biletu.", "error"),
      });
    }
  };

  if (isLoading) return <div className="p-6">Ładowanie uczestników...</div>;

  return (
    <div className="layout-container py-6">
      <Link
        to={`/organizer/events/${id}`}
        className="text-accent-primary hover:underline mb-6 inline-block"
      >
        ← Wróć do wydarzenia
      </Link>

      <h1 className="text-2xl font-bold text-text-primary mb-6">
        Lista uczestników
      </h1>

      <div className="bg-surface-raised border border-border-light rounded-xl overflow-hidden shadow-sm overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-bg-secondary text-text-secondary text-sm border-b border-border-light">
              <th className="p-4 font-semibold">E-mail studenta</th>
              <th className="p-4 font-semibold">Data zarejestrowania</th>
              <th className="p-4 font-semibold">Status biletu</th>
              <th className="p-4 font-semibold text-right">Akcja</th>
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
                  className="hover:bg-bg-secondary transition-colors"
                >
                  <td className="p-4 font-medium text-text-primary">
                    {attendee.studentEmail}
                  </td>
                  <td className="p-4 text-text-secondary">
                    {new Date(attendee.registrationDate).toLocaleString()}
                  </td>
                  <td className="p-4">
                    {attendee.isUsed ? (
                      <span className="px-2 py-1 text-xs rounded-full bg-status-error-bg text-status-error font-medium">
                        ZUŻYTY (Obecny)
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs rounded-full bg-status-info-bg text-status-info font-medium">
                        OCZEKUJE
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    {!attendee.isUsed && (
                      <button
                        onClick={() => handleManualCheckIn(attendee.id)}
                        disabled={checkInMutation.isPending}
                        className="text-sm bg-accent-primary text-text-on-accent px-3 py-1 rounded hover:bg-accent-hover disabled:opacity-50"
                      >
                        Wpuść (check-in)
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
