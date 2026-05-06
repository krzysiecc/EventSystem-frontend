import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Html5Qrcode } from "html5-qrcode";
import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { useToastStore } from "@/store/useToastStore";

const QRScanner = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const addToast = useToastStore((state) => state.addToast);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isScanningRef = useRef<boolean>(false);

  const [cameraError, setCameraError] = useState<string | null>(null);
  const [lastScanned, setLastScanned] = useState<string | null>(null);

  // TODO: verify ticket mutation from backend
  const verifyMutation = useMutation({
    mutationFn: async (ticketId: string) => {
      const response = await apiClient("/tickets/verify", {
        method: "POST",
        body: JSON.stringify({ ticketId, eventId }),
      });
      return response.json();
    },
    onSuccess: () => {
      // TODO: backend should return e.g. { status: "success", message: "Bilet ważny" }
      addToast("✅ Bilet WAŻNY! Wpuszczono.", "success");

      setTimeout(() => {
        isScanningRef.current = false;
        setLastScanned(null);
      }, 2000);
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : "Bilet NIEWAŻNY lub ZUŻYTY!";
      addToast(`❌ ${message}`, "error");

      setTimeout(() => {
        isScanningRef.current = false;
        setLastScanned(null);
      }, 2000);
    },
  });

  useEffect(() => {
    const html5QrCode = new Html5Qrcode("qr-reader");
    scannerRef.current = html5QrCode;

    const onScanSuccess = (decodedText: string) => {
      if (isScanningRef.current || decodedText === lastScanned) return;

      isScanningRef.current = true;
      setLastScanned(decodedText);

      verifyMutation.mutate(decodedText);
    };

    html5QrCode
      .start(
        { facingMode: "environment" },
        {
          fps: 20,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        onScanSuccess,
        () => {},
      )
      .catch((err) => {
        console.error("Camera start error: ", err);
        setCameraError(
          "Brak dostępu do kamery. Upewnij się, że nadałeś uprawnienia w przeglądarce.",
        );
      });

    return () => {
      if (scannerRef.current) {
        scannerRef.current
          .stop()
          .catch((err) => console.error("Error stopping scanner:", err));
      }
      scannerRef.current?.clear();
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  return (
    <div className="flex h-full flex-col items-center justify-center bg-black p-4">
      <div className="absolute top-20 z-10 w-full px-4 text-center">
        {verifyMutation.isPending ? (
          <div className="mx-auto inline-block rounded-full bg-status-info px-4 py-2 text-sm font-bold text-white shadow-lg">
            ⏳ Weryfikacja biletu...
          </div>
        ) : lastScanned ? (
          <div className="mx-auto inline-block rounded-full bg-bg-secondary/80 px-4 py-2 text-sm font-bold text-text-primary shadow-lg backdrop-blur-sm">
            Przetworzono kod, czekaj...
          </div>
        ) : (
          <div className="mx-auto inline-block rounded-full bg-black/60 px-4 py-2 text-sm font-bold text-white shadow-lg backdrop-blur-sm">
            Nakieruj kamerę na kod QR
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
