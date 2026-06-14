import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Html5Qrcode } from "html5-qrcode";
import { Loader2, CheckCircle2, XCircle, RotateCcw, ArrowLeft } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";

const GUID_PATTERN =
  /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/;

type ScanResult = { ok: boolean; message: string };

const QRScanner = () => {
  const { eventId } = useParams<{ eventId: string }>();

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const handledRef = useRef(false);

  const [cameraError, setCameraError] = useState<string | null>(null);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [sessionId, setSessionId] = useState(0);

  const verifyMutation = useMutation({
    mutationFn: async (scanToken: string) => {
      const response = await apiClient(`/tickets/scan/${scanToken}`, {
        method: "POST",
      });
      return response.json();
    },
    onSuccess: (data) =>
      setResult({
        ok: true,
        message: data?.message || "Bilet ważny — wpuszczono.",
      }),
    onError: (error: unknown) =>
      setResult({
        ok: false,
        message:
          error instanceof Error
            ? error.message
            : "Bilet nieważny lub już zużyty.",
      }),
  });

  const stopScanner = async () => {
    const scanner = scannerRef.current;
    if (!scanner) return;
    try {
      if (scanner.getState() === 2) await scanner.stop();
    } catch {
      /* już zatrzymany */
    }
    try {
      await scanner.clear();
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    handledRef.current = false;
    const html5QrCode = new Html5Qrcode("qr-reader");
    scannerRef.current = html5QrCode;
    let active = true;

    const onScanSuccess = (decodedText: string) => {
      // obsługujemy TYLKO pierwszy odczyt, potem zatrzymujemy kamerę
      if (handledRef.current) return;
      handledRef.current = true;
      stopScanner();

      // Ticket QR carries a profile URL with the scan token; older codes may be
      // a bare GUID. Accept both by extracting the first GUID.
      const token = decodedText.match(GUID_PATTERN)?.[0];
      if (!token) {
        setResult({ ok: false, message: "To nie jest kod biletu." });
        return;
      }
      verifyMutation.mutate(token);
    };

    html5QrCode
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 },
        onScanSuccess,
        () => {},
      )
      .then(() => {
        if (!active) stopScanner();
      })
      .catch((err) => {
        console.error("Camera start error:", err);
        if (active)
          setCameraError(
            "Brak dostępu do kamery. Upewnij się, że nadałeś uprawnienia w przeglądarce.",
          );
      });

    return () => {
      active = false;
      stopScanner();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId, sessionId]);

  const scanAgain = () => {
    setResult(null);
    setSessionId((n) => n + 1);
  };

  return (
    <div className="relative flex h-full flex-col items-center justify-center bg-black p-4">
      {/* status góra */}
      {!result && !cameraError && (
        <div className="absolute top-20 z-10 w-full px-4 text-center">
          {verifyMutation.isPending ? (
            <div className="mx-auto inline-flex items-center gap-2 rounded-full bg-status-info px-4 py-2 text-sm font-bold text-white shadow-lg">
              <Loader2 size={15} className="animate-spin" />
              Weryfikacja biletu...
            </div>
          ) : (
            <div className="mx-auto inline-block rounded-full bg-black/60 px-4 py-2 text-sm font-bold text-white shadow-lg backdrop-blur-sm">
              Nakieruj kamerę na kod QR
            </div>
          )}
        </div>
      )}

      {/* podgląd kamery (zawsze w DOM, by można było wznowić skan) */}
      <div
        id="qr-reader"
        className="w-full max-w-sm overflow-hidden rounded-2xl border-4 border-surface-raised bg-black shadow-2xl"
      ></div>

      {/* błąd kamery */}
      {cameraError && (
        <div className="absolute inset-0 z-20 flex items-center justify-center p-4">
          <div className="rounded-xl border border-status-error bg-status-error-bg p-6 text-center text-status-error">
            <p className="mb-2 text-lg font-bold">Błąd kamery</p>
            <p className="text-sm">{cameraError}</p>
          </div>
        </div>
      )}

      {/* wynik skanu — kamera zatrzymana */}
      {result && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-5 bg-black/92 p-6 text-center backdrop-blur-sm">
          {verifyMutation.isPending ? (
            <Loader2 size={48} className="animate-spin text-white" />
          ) : result.ok ? (
            <CheckCircle2 size={64} className="text-status-success" />
          ) : (
            <XCircle size={64} className="text-status-error" />
          )}
          <p
            className={`max-w-xs text-xl font-bold ${
              result.ok ? "text-status-success" : "text-status-error"
            }`}
          >
            {result.message}
          </p>

          <div className="mt-2 flex flex-col items-center gap-3">
            <button
              onClick={scanAgain}
              className="inline-flex items-center gap-2 rounded-md bg-accent-primary px-5 py-2.5 font-medium text-text-on-accent transition hover:bg-accent-hover"
            >
              <RotateCcw size={16} />
              Skanuj następny
            </button>
            <Link
              to="/organizer"
              className="inline-flex items-center gap-1.5 text-sm text-white/70 hover:text-white"
            >
              <ArrowLeft size={14} />
              Zakończ skanowanie
            </Link>
          </div>
        </div>
      )}

      <div className="absolute bottom-10 z-10 w-full px-4 text-center text-sm text-white/60">
        Problemy ze skanowaniem? <br />
        Przejdź do listy uczestników i użyj ręcznego wpuszczania.
      </div>
    </div>
  );
};

export default QRScanner;
