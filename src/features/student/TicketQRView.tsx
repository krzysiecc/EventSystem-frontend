import QRCodeImport from "react-qr-code";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, CalendarDays, MapPin } from "lucide-react";
import {
  useMyTickets,
  useEventForTicket,
  ticketDateLike,
} from "./api/useStudentQueries";
import { formatEventDate } from "@/lib/eventDate";
import EventLiveBar from "@/components/ui/EventLiveBar";

// react-qr-code only publishes a CommonJS build; in the production bundle the
// default import can resolve to the module namespace object instead of the
// component itself, so unwrap the inner default export when present.
const QRCode = ((QRCodeImport as unknown as { default?: typeof QRCodeImport })
  .default ?? QRCodeImport) as typeof QRCodeImport;

const TicketQRView = () => {
  const { id } = useParams<{ id: string }>();
  const { data: tickets, isLoading } = useMyTickets();
  const eventForTicket = useEventForTicket();

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
  // Zakres od→do (godziny bez sekund) — łączymy bilet z danymi wydarzenia.
  const dateLike = ticketDateLike(ticket, eventForTicket(ticket));

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center pt-2">
      <Link
        to="/student/tickets"
        className="mb-6 self-start inline-flex items-center gap-1.5 text-sm font-medium text-accent-primary hover:underline"
      >
        <ArrowLeft size={15} />
        Powrót do moich biletów
      </Link>

      {/* Poziomy bilet: QR po lewej, opis po prawej (na mobile — pionowo). */}
      <div className="animate-rise relative w-full overflow-hidden rounded-xl border border-border-light bg-surface-raised shadow-lg">
        {/* Pasek statusu — pojawia się dopiero gdy wydarzenie trwa. */}
        <EventLiveBar evt={dateLike} />

        {/* Wycięcia po bokach — sylwetka biletu. */}
        <span
          aria-hidden="true"
          className="absolute -left-3 top-1/2 z-10 h-6 w-6 -translate-y-1/2 rounded-full border border-border-light bg-bg-primary"
        />
        <span
          aria-hidden="true"
          className="absolute -right-3 top-1/2 z-10 h-6 w-6 -translate-y-1/2 rounded-full border border-border-light bg-bg-primary"
        />

        <div className="flex flex-col sm:flex-row">
          {/* QR — lewa strona, oddzielona perforacją */}
          <div className="flex items-center justify-center border-b border-dashed border-border-medium p-6 sm:w-[42%] sm:shrink-0 sm:border-b-0 sm:border-r">
            <div className="w-44 max-w-[58vw] rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
              <QRCode
                value={qrUrl}
                size={256}
                style={{ height: "auto", width: "100%" }}
                viewBox={`0 0 256 256`}
                level="H"
              />
            </div>
          </div>

          {/* Opis — prawa strona */}
          <div className="flex flex-1 flex-col justify-center gap-3 p-6">
            <h2 className="text-xl font-bold leading-tight text-text-primary sm:text-2xl">
              {ticket.eventTitle}
            </h2>

            <div className="space-y-1.5 text-sm text-text-secondary">
              <p className="flex items-center gap-2">
                <CalendarDays size={15} className="shrink-0 text-accent-primary" />
                <span className="font-mono text-xs sm:text-sm">
                  {formatEventDate(dateLike, { time: true })}
                </span>
              </p>
              <p className="flex items-center gap-2">
                <MapPin size={15} className="shrink-0 text-accent-primary" />
                {ticket.location}
              </p>
            </div>

            <div className="pt-1">
              <span
                className={`inline-block rounded-full px-3 py-1 font-mono text-sm font-medium ${
                  ticket.isScanned
                    ? "bg-status-error-bg text-status-error"
                    : "bg-status-success-bg text-status-success"
                }`}
              >
                {ticket.isScanned ? "UŻYTY" : "WAŻNY BILET"}
              </span>
            </div>

            <p className="break-all border-t border-border-light pt-3 font-mono text-xs text-text-muted">
              {ticket.qrCodeContent}
            </p>
            <p className="text-xs text-text-muted">
              Zeskanowanie kodu zwykłym aparatem otworzy Twój profil publiczny.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketQRView;
