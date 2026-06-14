import QRCodeImport from "react-qr-code";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, CalendarDays, MapPin } from "lucide-react";
import { useMyTickets } from "./api/useStudentQueries";

// react-qr-code only publishes a CommonJS build; in the production bundle the
// default import can resolve to the module namespace object instead of the
// component itself, so unwrap the inner default export when present.
const QRCode = ((QRCodeImport as unknown as { default?: typeof QRCodeImport })
  .default ?? QRCodeImport) as typeof QRCodeImport;

const TicketQRView = () => {
  const { id } = useParams<{ id: string }>();
  const { data: tickets, isLoading } = useMyTickets();

  const ticket = tickets?.find((t) => String(t.id) === id);

  if (isLoading)
    return <div className="p-6 text-center">Ładowanie biletu...</div>;
  if (!ticket)
    return (
      <div className="p-6 text-center text-status-error">
        Nie znaleziono biletu.
      </div>
    );

  // A regular phone camera opens the public profile page; the organizer's
  // in-app scanner extracts the scan token (GUID) from the query string.
  const qrUrl = `${window.location.origin}/users/${ticket.studentId}?ticket=${ticket.qrCodeContent}`;

  return (
    <div className="mx-auto flex max-w-md flex-col items-center pt-2">
      <Link
        to="/student/tickets"
        className="mb-6 self-start inline-flex items-center gap-1.5 text-sm font-medium text-accent-primary hover:underline"
      >
        <ArrowLeft size={15} />
        Powrót do moich biletów
      </Link>

      {/* Bilet z wycięciami po bokach */}
      <div className="animate-rise relative w-full rounded-xl border border-border-light bg-surface-raised p-6 text-center shadow-lg sm:p-8">
        <span
          aria-hidden="true"
          className="absolute -left-3.25 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full border border-border-light bg-bg-primary"
        />
        <span
          aria-hidden="true"
          className="absolute -right-3.25 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full border border-border-light bg-bg-primary"
        />

        <h2 className="mb-1 text-2xl font-bold text-text-primary">
          {ticket.eventTitle}
        </h2>
        <p className="mb-6 flex flex-col items-center gap-1 font-mono text-xs text-text-secondary">
          <span className="flex items-center gap-1.5">
            <CalendarDays size={13} />
            {new Date(ticket.eventDate).toLocaleString()}
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin size={13} />
            {ticket.location}
          </span>
        </p>

        <div className="mx-auto mb-6 w-58 max-w-[78vw] rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <QRCode
            value={qrUrl}
            size={256}
            style={{ height: "auto", width: "100%" }}
            viewBox={`0 0 256 256`}
            level="H"
          />
        </div>

        <div>
          <span
            className={`inline-block rounded-full px-3 py-1 font-mono text-sm font-medium ${
              ticket.isScanned
                ? "bg-status-error-bg text-status-error"
                : "bg-status-success-bg text-status-success"
            }`}
          >
            {ticket.isScanned ? "UŻYTY" : "WAŻNY BILET"}
          </span>
          <p className="mt-4 break-all font-mono text-xs text-text-muted">
            {ticket.qrCodeContent}
          </p>
          <p className="mt-2 text-xs text-text-muted">
            Zeskanowanie kodu zwykłym aparatem otworzy Twój profil publiczny.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TicketQRView;
