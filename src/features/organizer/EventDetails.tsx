import { useParams, Link } from "react-router-dom";
import { useOrganizerEventDetails, useEventAttendees, useManualCheckIn } from "./api/useEvents";

const EventDetailsOrganizer = () => {
  const { id: eventId } = useParams<{ id: string }>();

  const { data: event, isLoading: isEventLoading, isError: isEventError } = useOrganizerEventDetails(eventId);
  const { data: attendees, isLoading: isAttendeesLoading } = useEventAttendees(eventId);
  const checkInMutation = useManualCheckIn(eventId);

  if (isEventLoading) return <div className="p-10 text-center text-text-primary">Wczytywanie szczegółów...</div>;
  
  if (isEventError || !event) {
    return (
      <div className="p-10 text-center text-status-error">
        <h2 className="text-2xl font-bold">Błąd wczytywania strony</h2>
        <p className="mt-2 text-text-muted">Upewnij się, że jesteś zalogowany jako organizator tego wydarzenia.</p>
        <Link to="/organizer/dashboard" className="underline mt-4 inline-block text-accent-primary">Wróć do panelu</Link>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto bg-bg-primary text-text-primary min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <Link to="/organizer/dashboard" className="text-accent-primary hover:underline text-sm mb-2 block">← Wróć do listy</Link>
          <h1 className="text-3xl font-bold">{event.title}</h1>
          <p className="text-text-muted">{event.location} | {new Date(event.date).toLocaleString("pl-PL")}</p>
        </div>
        <Link 
          to={`/organizer/scanner/${eventId}`}
          className="bg-accent-primary text-text-on-accent px-6 py-3 rounded-xl font-bold shadow-lg hover:scale-105 transition-transform"
        >
          📸 Otwórz Skaner QR
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Statystyki */}
        <div className="md:col-span-1 bg-surface-raised p-6 rounded-2xl border border-border-light shadow-sm">
          <h3 className="text-sm font-bold text-text-muted uppercase mb-2">Sprzedane bilety</h3>
          <p className="text-3xl font-bold text-text-primary">
            {event.enrolledCount} / {event.maxCapacity}
          </p>
          <div className="w-full bg-bg-secondary h-2 rounded-full mt-4 overflow-hidden">
            <div 
              className="bg-accent-primary h-full transition-all" 
              style={{ width: `${Math.min((event.enrolledCount / event.maxCapacity) * 100, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Lista uczestników */}
        <div className="md:col-span-2 bg-surface-raised border border-border-light rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-border-light font-bold bg-bg-secondary">
            Lista obecności
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-bg-secondary text-text-muted text-xs uppercase">
                <tr>
                  <th className="p-4">Student (Email)</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Akcja</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light">
                {isAttendeesLoading ? (
                  <tr><td colSpan={3} className="p-10 text-center">Wczytywanie listy...</td></tr>
                ) : attendees?.length === 0 ? (
                  <tr><td colSpan={3} className="p-10 text-center text-text-muted">Brak zapisanych osób.</td></tr>
                ) : (
                  attendees?.map((a) => (
                    <tr key={a.id} className="hover:bg-bg-secondary/50 transition-colors">
                      <td className="p-4 text-sm font-medium">{a.studentEmail}</td>
                      <td className="p-4">
                        {a.isUsed ? (
                          <span className="bg-status-success/20 text-status-success px-3 py-1 rounded-full text-xs font-bold">
                            OBECNY
                          </span>
                        ) : (
                          <span className="bg-bg-secondary text-text-muted px-3 py-1 rounded-full text-xs font-bold">
                            OCZEKUJE
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        {!a.isUsed && (
                          <button 
                            onClick={() => checkInMutation.mutate(a.id)}
                            disabled={checkInMutation.isPending}
                            className="text-accent-primary font-bold text-xs hover:underline disabled:opacity-50"
                          >
                            {checkInMutation.isPending ? "..." : "Odbij ręcznie"}
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
      </div>
    </div>
  );
};

export default EventDetailsOrganizer;