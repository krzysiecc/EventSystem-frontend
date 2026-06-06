import { useParams, Link } from "react-router-dom";
// BEZPIECZNY IMPORT Z NOWEJ PACZKI:
import { QRCodeSVG } from "qrcode.react"; 
import { useMyTickets } from "./api/useStudentQueries";

const TicketDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { data: tickets, isLoading } = useMyTickets();

  if (isLoading)
    return <div className="p-6 text-text-muted text-center">Ładowanie biletu...</div>;

  const ticket = tickets?.find((t) => String(t.id) === String(id));

  if (!ticket)
    return (
      <div className="layout-container py-6">
        <Link to="/student/tickets" className="text-accent-primary hover:underline mb-4 inline-block">
          ← Wróć do biletów
        </Link>
        <p className="text-status-error font-bold text-xl">Nie znaleziono biletu.</p>
      </div>
    );

  const safeFallback = `${window.location.origin}/public/profile/unknown?ticketId=${ticket.id}`;
  const qrValue = ticket.qrCodeContent
    ? ticket.qrCodeContent.replace(/^https?:\/\/[^/]+/, window.location.origin)
    : safeFallback;

  return (
    <div className="layout-container py-6 max-w-md mx-auto">
      <Link to="/student/tickets" className="text-accent-primary hover:underline mb-6 inline-block">
        ← Wróć do listy biletów
      </Link>

      <div className={`bg-surface-raised border p-8 rounded-2xl shadow-lg flex flex-col items-center text-center ${ticket.isUsed ? "border-status-error opacity-75" : "border-accent-primary"}`}>
        
        {ticket.isUsed && (
          <div className="bg-status-error text-status-error-bg font-bold px-4 py-1 rounded-full mb-4 uppercase text-sm">
            Bilet wykorzystany
          </div>
        )}

        <h1 className="text-2xl font-bold text-text-primary mb-1">
          {ticket.eventTitle}
        </h1>
        <p className="text-text-secondary mb-8">
          📅 {new Date(ticket.eventDate).toLocaleDateString("pl-PL")}
        </p>

        <div className="bg-white p-4 rounded-xl shadow-inner mb-6 relative">
          {/* NOWY KOMPONENT QR */}
          <QRCodeSVG
            value={qrValue}
            size={200}
            fgColor={ticket.isUsed ? "#9CA3AF" : "#000000"} 
          />
          
          {/* Przekreślenie wizualne jeśli zużyty */}
          {ticket.isUsed && (
             <div className="absolute inset-0 flex items-center justify-center">
               <div className="w-full h-2 bg-status-error transform -rotate-45 opacity-80"></div>
             </div>
          )}
        </div>

        <div className="w-full border-t border-border-light pt-4 mt-2">
          <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Lokalizacja</p>
          <p className="font-medium text-text-primary">{ticket.eventLocation}</p>
        </div>
        
        <div className="w-full mt-4 pt-4 border-t border-border-light border-dashed">
          <p className="text-xs text-text-muted">ID Biletu: <span className="font-mono">{ticket.id}</span></p>
        </div>

      </div>
    </div>
  );
};

export default TicketDetails;