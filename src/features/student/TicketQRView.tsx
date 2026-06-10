import QRCodeImport from "react-qr-code";
import { useParams, Link } from "react-router-dom";
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
      <div className="p-6 text-center text-status-error">Nie znaleziono biletu.</div>
    );

  // A regular phone camera opens the public profile page; the organizer's
  // in-app scanner extracts the scan token (GUID) from the query string.
  const qrUrl = `${window.location.origin}/users/${ticket.studentId}?ticket=${ticket.qrCodeContent}`;

  return (
    <div className="flex flex-col min-h-[80vh] items-center justify-center p-4">
      <Link
        to="/student/tickets"
        className="self-start mb-8 text-accent-primary font-medium hover:underline"
      >
        ← Powrót do moich biletów
      </Link>

      <div className="bg-surface-raised p-8 rounded-2xl shadow-xl border border-border-light max-w-sm w-full text-center">
        <h2 className="text-2xl font-bold text-text-primary mb-1">
          {ticket.eventTitle}
        </h2>
        <p className="text-sm text-text-secondary mb-6">
          {new Date(ticket.eventDate).toLocaleString()} <br />
          {ticket.location}
        </p>

        <div className="bg-white p-4 rounded-xl inline-block mb-6 shadow-sm border border-gray-100">
          <QRCode
            value={qrUrl}
            size={200}
            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
            viewBox={`0 0 256 256`}
            level="H"
          />
        </div>

        <div>
          <span
            className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
              ticket.isScanned
                ? "bg-status-error-bg text-status-error"
                : "bg-status-success-bg text-status-success"
            }`}
          >
            {ticket.isScanned ? "UŻYTY" : "WAŻNY BILET"}
          </span>
          <p className="text-xs text-text-muted mt-4 font-mono break-all">
            {ticket.qrCodeContent}
          </p>
          <p className="text-xs text-text-muted mt-2">
            Zeskanowanie kodu zwykłym aparatem otworzy Twój profil publiczny.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TicketQRView;
