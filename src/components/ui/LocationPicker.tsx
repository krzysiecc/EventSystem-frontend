import { useEffect, useMemo, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { MapPin, Loader2, Tag } from "lucide-react";

const pinIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export interface LocationValue {
  /** Adres skrócony: ulica, numer, kod pocztowy, miasto. */
  location: string;
  /** Nazwa własna miejsca (opcjonalna), np. „Budynek A-1, wejście od ul. Hoene". */
  locationName: string;
  lat: number | null;
  lng: number | null;
}

interface NominatimAddress {
  road?: string;
  house_number?: string;
  postcode?: string;
  city?: string;
  town?: string;
  village?: string;
  municipality?: string;
}

interface NominatimResult {
  display_name: string;
  lat: string;
  lon: string;
  address?: NominatimAddress;
}

const DEFAULT_CENTER: [number, number] = [52.2297, 21.0122]; // Warszawa

const inputClass =
  "w-full rounded-md border border-border-medium bg-bg-tertiary p-2 text-text-primary focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary";

/**
 * @description Składa skrócony adres z pól OSM: „ulica numer, kod, miasto".
 * Gdy brak danych szczegółowych — używa pełnej nazwy jako fallback.
 */
const formatAddress = (a?: NominatimAddress, fallback = ""): string => {
  if (!a) return fallback;
  const street = [a.road, a.house_number].filter(Boolean).join(" ");
  const city = a.city || a.town || a.village || a.municipality || "";
  const parts = [street, a.postcode, city]
    .map((p) => (p ?? "").trim())
    .filter(Boolean);
  return parts.join(", ") || fallback;
};

function Recenter({ lat, lng }: { lat: number | null; lng: number | null }) {
  const map = useMap();
  useEffect(() => {
    if (lat != null && lng != null)
      map.setView([lat, lng], Math.max(map.getZoom(), 14));
  }, [lat, lng, map]);
  return null;
}

function ClickHandler({
  onPick,
}: {
  onPick: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

/**
 * @description Wybór lokalizacji przez OpenStreetMap: autouzupełnianie adresu
 * (Nominatim, skrócone do ulica/numer/kod/miasto) + mapa Leaflet z markerem,
 * plus opcjonalna nazwa własna miejsca. Zwraca adres, nazwę własną i lat/lng.
 */
const LocationPicker = ({
  value,
  onChange,
}: {
  value: LocationValue;
  onChange: (v: LocationValue) => void;
}) => {
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  const search = (q: string) => {
    window.clearTimeout(timer.current);
    if (q.trim().length < 3) {
      setResults([]);
      return;
    }
    timer.current = window.setTimeout(async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&addressdetails=1&q=${encodeURIComponent(q)}`,
          { headers: { "Accept-Language": "pl" } },
        );
        const data = (await res.json()) as NominatimResult[];
        setResults(data);
        setOpen(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 500);
  };

  const pickResult = (r: NominatimResult) => {
    const lat = parseFloat(r.lat);
    const lng = parseFloat(r.lon);
    setOpen(false);
    onChange({
      ...value,
      location: formatAddress(r.address, r.display_name),
      lat,
      lng,
    });
  };

  const pickMap = async (lat: number, lng: number) => {
    onChange({ ...value, lat, lng });
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&addressdetails=1&lat=${lat}&lon=${lng}`,
        { headers: { "Accept-Language": "pl" } },
      );
      const data = await res.json();
      const concise = formatAddress(data.address, data.display_name);
      if (concise) onChange({ ...value, location: concise, lat, lng });
    } catch {
      /* ignorujemy błąd reverse-geocode */
    }
  };

  // tylko początkowy środek mapy; aktualizacje obsługuje <Recenter />
  const center = useMemo<[number, number]>(
    () =>
      value.lat != null && value.lng != null
        ? [value.lat, value.lng]
        : DEFAULT_CENTER,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return (
    <div className="space-y-2">
      {/* Nazwa własna (opcjonalna) */}
      <div className="relative">
        <Tag
          size={15}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
        />
        <input
          type="text"
          value={value.locationName}
          onChange={(e) => onChange({ ...value, locationName: e.target.value })}
          placeholder="Nazwa własna (opcjonalnie, np. Budynek A-1, wejście od ul. Hoene)"
          className={`${inputClass} pl-9`}
        />
      </div>

      {/* Adres z autouzupełnianiem */}
      <div className="relative">
        <input
          type="text"
          value={value.location}
          onChange={(e) => {
            onChange({ ...value, location: e.target.value });
            search(e.target.value);
          }}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="Adres: ulica i numer, kod, miasto"
          className={inputClass}
        />
        {loading && (
          <Loader2
            size={16}
            className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-text-muted"
          />
        )}
        {open && results.length > 0 && (
          <ul className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-md border border-border-medium bg-surface-raised shadow-lg">
            {results.map((r, i) => (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => pickResult(r)}
                  className="flex w-full items-start gap-2 px-3 py-2 text-left text-sm hover:bg-bg-secondary"
                >
                  <MapPin
                    size={14}
                    className="mt-0.5 shrink-0 text-accent-primary"
                  />
                  <span className="text-text-secondary">
                    {formatAddress(r.address, r.display_name)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="h-56 overflow-hidden rounded-md border border-border-light">
        <MapContainer
          center={center}
          zoom={value.lat != null ? 14 : 11}
          scrollWheelZoom
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution="&copy; OpenStreetMap"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickHandler onPick={pickMap} />
          <Recenter lat={value.lat} lng={value.lng} />
          {value.lat != null && value.lng != null && (
            <Marker position={[value.lat, value.lng]} icon={pinIcon} />
          )}
        </MapContainer>
      </div>
      <p className="text-xs text-text-muted">
        Podpowiedzi z OpenStreetMap • kliknij mapę, aby ustawić punkt
      </p>
    </div>
  );
};

export default LocationPicker;
