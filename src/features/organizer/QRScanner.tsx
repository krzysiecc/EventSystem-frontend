import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Html5Qrcode } from "html5-qrcode";
import { Loader2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { useToastStore } from "@/store/useToastStore";

const GUID_PATTERN =
  /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/;

const QRScanner = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const addToast = useToastStore((state) => state.addToast);

  const isScanningRef = useRef<boolean>(false);
  const lastScannedRef = useRef<string | null>(null);

  const [cameraError, setCameraError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>(
    "Nakieruj kamerę na kod QR",
  );

  const verifyMutation = useMutation({
    mutationFn: async (scanToken: string) => {
      const response = await apiClient(`/tickets/scan/${scanToken}`, {
        method: "POST",
      });
      return response.json();
    },
    onSuccess: (data) => {
      addToast(`${data.message || "Bilet WAŻNY! Wpuszczono."}`, "success");
      setStatusMessage("Wpuszczono!");
      setTimeout(() => {
        isScanningRef.current = false;
        lastScannedRef.current = null;
        setStatusMessage("Nakieruj kamerę na kod QR");
      }, 2000);
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : "Bilet NIEWAŻNY lub ZUŻYTY!";
      addToast(`${message}`, "error");
      setStatusMessage("Błąd weryfikacji");
      setTimeout(() => {
        isScanningRef.current = false;
        lastScannedRef.current = null;
        setStatusMessage("Nakieruj kamerę na kod QR");
      }, 2000);
    },
  });

  useEffect(() => {
    const html5QrCode = new Html5Qrcode("qr-reader");
    let isMounted = true;

    const onScanSuccess = (decodedText: string) => {
      if (isScanningRef.current || decodedText === lastScannedRef.current)
        return;

      isScanningRef.current = true;
      lastScannedRef.current = decodedText;

      // Ticket QRs carry a profile URL with the scan token in the query
      // string; older codes may be a bare GUID. Accept both.
      const token = decodedText.match(GUID_PATTERN)?.[0];
      if (!token) {
        addToast("To nie jest kod biletu.", "error");
        setTimeout(() => {
          isScanningRef.current = false;
          lastScannedRef.current = null;
        }, 2000);
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
        if (!isMounted) {
          html5QrCode
            .stop()
            .then(() => html5QrCode.clear())
            .catch(console.error);
        }
      })
      .catch((err) => {
        console.error("Camera start error:", err);
        if (isMounted)
          setCameraError(
            "Brak dostępu do kamery. Upewnij się, że nadałeś uprawnienia w przeglądarce.",
          );
      });

    return () => {
      isMounted = false;
      try {
        if (html5QrCode.getState() === 2) {
          html5QrCode
            .stop()
            .then(() => html5QrCode.clear())
            .catch(console.error);
        }
      } catch (error) {
        console.error("Błąd podczas czyszczenia skanera:", error);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  return (
    <div className="flex h-full flex-col items-center justify-center bg-black p-4">
      <div className="absolute top-20 z-10 w-full px-4 text-center">
        {verifyMutation.isPending ? (
          <div className="mx-auto inline-flex items-center gap-2 rounded-full bg-status-info px-4 py-2 text-sm font-bold text-white shadow-lg">
            <Loader2 size={15} className="animate-spin" />
            Weryfikacja biletu...
          </div>
        ) : (
          <div className="mx-auto inline-block rounded-full bg-black/60 px-4 py-2 text-sm font-bold text-white shadow-lg backdrop-blur-sm">
            {statusMessage}
          </div>
        )}
      </div>

      {cameraError ? (
        <div className="rounded-xl border border-status-error bg-status-error-bg p-6 text-center text-status-error">
          <p className="font-bold text-lg mb-2">Błąd Kamery</p>
          <p className="text-sm">{cameraError}</p>
        </div>
      ) : (
        <div
          id="qr-reader"
          className="w-full max-w-sm overflow-hidden rounded-2xl shadow-2xl border-4 border-surface-raised bg-black"
        ></div>
      )}

      <div className="absolute bottom-10 z-10 text-center w-full px-4 text-text-muted text-sm">
        Problemy ze skanowaniem? <br />
        Przejdź do listy uczestników i użyj ręcznego wpuszczania.
      </div>
    </div>
  );
};

export default QRScanner;
