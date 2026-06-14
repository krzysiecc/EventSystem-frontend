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
import { MapPin, Loader2 } from "lucide-react";

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
  location: string;
  lat: number | null;
  lng: number | null;
}

interface NominatimResult {
  display_name: string;
  lat: string;
  lon: string;
}

const DEFAULT_CENTER: [number, number] = [52.2297, 21.0122]; // Warszawa

const inputClass =
  "w-full rounded-md border border-border-medium bg-bg-tertiary p-2 text-text-primary focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary";

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
 * (Nominatim) + mapa Leaflet z markerem. Zwraca adres tekstowy oraz lat/lng.
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
    onChange({ location: r.display_name, lat, lng });
  };

  const pickMap = async (lat: number, lng: number) => {
    onChange({ location: value.location, lat, lng });
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
        { headers: { "Accept-Language": "pl" } },
      );
      const data = await res.json();
      const name = data.display_name as string | undefined;
      if (name) {
        onChange({ location: name, lat, lng });
      }
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
      <div className="relative">
        <input
          type="text"
          value={value.location}
          onChange={(e) => {
            onChange({ ...value, location: e.target.value });
            search(e.target.value);
          }}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="Wpisz adres albo wybierz punkt na mapie"
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
                  <span className="text-text-secondary">{r.display_name}</span>
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
