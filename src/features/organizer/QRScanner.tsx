import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Scanner } from "@yudiel/react-qr-scanner";
import { useManualCheckIn } from "./api/useEvents";
import { getQRCodeUrl } from "@/config/app"; 

const QRScannerView = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const scanMutation = useManualCheckIn(eventId);
  const [status, setStatus] = useState<{ type: 'ok' | 'err' | 'info', msg: string } | null>(null);
  const [locked, setLocked] = useState(false);

  const handleScan = (detectedCodes: any[]) => {
    console.debug("QRScanner.handleScan", { detectedCodes, locked, isPending: scanMutation.isPending });
    // Biblioteka zwraca tablicę wykrytych kodów
    if (detectedCodes.length === 0 || locked || scanMutation.isPending) {
      if (detectedCodes.length === 0) {
        // pokaż krótko, że nic nie wykryto (użyteczne przy debugowaniu na urządzeniu)
        setStatus({ type: 'info', msg: "Brak wykrytych kodów" });
        setTimeout(() => setStatus(null), 1000);
      }
      return;
    }

    // Obsługa różnych struktur zwracanych przez skanery (rawValue / text / data)
    const raw = detectedCodes[0]?.rawValue ?? detectedCodes[0]?.text ?? detectedCodes[0]?.data ?? detectedCodes[0];
    setLocked(true);

    try {
      console.debug("QR raw value:", raw);
      const text = typeof raw === 'string' ? raw : String(raw);
      const url = new URL(text);
      const ticketId = url.searchParams.get("ticketId");

      if (!ticketId) {
        setStatus({ type: 'err', msg: "Kod nie zawiera ID biletu." });
        setTimeout(() => setLocked(false), 2000);
        return;
      }

      setStatus({ type: 'info', msg: "Weryfikacja..." });
      scanMutation.mutate(ticketId, {
        onSuccess: () => {
          setStatus({ type: 'ok', msg: `Bilet #${ticketId} ODKODOWANY!` });
          setTimeout(() => { setStatus(null); setLocked(false); }, 3000);
        },
        onError: (err: any) => {
          setStatus({ type: 'err', msg: err.message || "Błąd bazy." });
          setTimeout(() => setLocked(false), 3000);
        }
      });
    } catch {
      setStatus({ type: 'err', msg: "To nie jest kod naszego systemu." });
      setTimeout(() => setLocked(false), 2000);
    }
  };

  return (
    <div className="h-screen bg-black flex flex-col text-white">
      <div className="p-4 bg-gray-900 flex items-center gap-4 z-10">
        <button onClick={() => navigate(-1)} className="text-sm bg-gray-700 px-4 py-2 rounded-lg">Wróć</button>
        <h2 className="font-bold">Skaner biletów</h2>
      </div>
      <div className="flex-1 relative">
        <Scanner 
          onScan={handleScan} 
          allowMultiple={true}
          styles={{ container: { height: '100%' } }}
        />
        <div className="absolute inset-0 border-[50px] border-black/40 pointer-events-none flex items-center justify-center">
            <div className="w-64 h-64 border-2 border-white border-dashed rounded-3xl"></div>
        </div>
      </div>
      <div className="p-10 bg-gray-900 text-center z-10">
        {status ? (
          <div className={`p-4 rounded-xl font-bold shadow-lg animate-pulse ${status.type === 'ok' ? 'bg-green-600' : status.type === 'err' ? 'bg-red-600' : 'bg-blue-600'}`}>
            {status.msg}
          </div>
        ) : (
          <p className="text-gray-400">Skieruj aparat na kod QR uczestnika</p>
        )}
        {import.meta.env.DEV && (
          <div className="mt-4">
            <button
              onClick={() => handleScan([{ rawValue: getQRCodeUrl('ticket-guid-111') }])}
              className="text-xs mt-2 px-3 py-2 bg-gray-700 rounded-lg"
            >
              Symuluj skan (dev)
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRScannerView;