import { MapPinned, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useTranslation } from 'react-i18next';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { useGeolocation } from '../hooks/useGeolocation';
import { getHeatmap } from '../lib/map.api';
import { useIncidentStore } from '../store/incident.store';
import type { GeoJSONFeature } from '../types';
import 'leaflet/dist/leaflet.css';

const filters = [
  { key: 'all', label: 'map.all' },
  { key: 'SOS', label: 'map.sos' },
  { key: 'TRAFFIC', label: 'map.traffic' },
  { key: 'DARK_SPOT', label: 'map.dark_spots' },
  { key: 'PUBLIC_NUISANCE', label: 'map.nuisance' }
] as const;

function createIcon(color: string): L.DivIcon {
  return L.divIcon({
    html: `<div style="background:${color};width:18px;height:18px;border-radius:9999px;border:3px solid white;box-shadow:0 4px 12px rgba(0,0,0,.2)"></div>`,
    className: '',
    iconSize: [18, 18],
    iconAnchor: [9, 9]
  });
}

const markerIcons = {
  SOS: createIcon('#DC2626'),
  TRAFFIC: createIcon('#F59E0B'),
  DARK_SPOT: createIcon('#0A1F44'),
  PUBLIC_NUISANCE: createIcon('#7C3AED'),
  THEFT: createIcon('#E11D48'),
  OTHER: createIcon('#64748B')
};

function FlyToLocation({ lat, lng }: { lat: number; lng: number }): null {
  const map = useMap();

  useEffect(() => {
    map.flyTo([lat, lng], 14, { duration: 1.2 });
  }, [lat, lng, map]);

  return null;
}

export default function HeatmapPage(): JSX.Element {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { latitude, longitude } = useGeolocation();
  const recentReports = useIncidentStore((state) => state.recentReports);
  const [activeFilter, setActiveFilter] = useState('all');
  const [radius, setRadius] = useState(Number(import.meta.env.VITE_MAP_RADIUS_KM || 5));
  const [features, setFeatures] = useState<GeoJSONFeature[]>([]);
  const [flyToUser, setFlyToUser] = useState(false);

  useEffect(() => {
    const lat = latitude ?? Number(import.meta.env.VITE_DEFAULT_LAT);
    const lng = longitude ?? Number(import.meta.env.VITE_DEFAULT_LNG);

    const timer = window.setTimeout(async () => {
      try {
        const data = await getHeatmap(lat, lng, radius, activeFilter);
        setFeatures(data.features);
      } catch {
        const fallback = recentReports.map((incident) => ({
          type: 'Feature' as const,
          geometry: { type: 'Point' as const, coordinates: [incident.longitude, incident.latitude] as [number, number] },
          properties: {
            id: incident.id,
            type: incident.type,
            status: incident.status,
            title: incident.title,
            description: incident.description,
            createdAt: incident.createdAt
          }
        }));

        setFeatures(fallback.filter((feature) => activeFilter === 'all' || feature.properties.type === activeFilter));
      }
    }, 500);

    return () => window.clearTimeout(timer);
  }, [activeFilter, latitude, longitude, radius, recentReports]);

  const center = useMemo<[number, number]>(() => [latitude ?? 12.9716, longitude ?? 77.5946], [latitude, longitude]);

  return (
    <main className="relative h-[calc(100vh-4rem)] w-full">
      <MapContainer center={center} zoom={12} className="h-full w-full">
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
        {flyToUser && latitude != null && longitude != null ? <FlyToLocation lat={latitude} lng={longitude} /> : null}
        {features.map((feature) => (
          <Marker
            key={feature.properties.id}
            position={[feature.geometry.coordinates[1], feature.geometry.coordinates[0]]}
            icon={markerIcons[feature.properties.type]}
          >
            <Popup>
              <div className="min-w-44 space-y-2">
                <Badge status={feature.properties.status} />
                <p className="font-semibold">{feature.properties.title}</p>
                <p className="text-sm text-slate-600">{new Date(feature.properties.createdAt).toLocaleString()}</p>
                <p className="text-sm text-secondary">{t('common.view_details')}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* ── Home Button ── */}
      <div className="absolute top-4 left-4 z-[600]">
        <button
          onClick={() => navigate('/home')}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900/90 border border-white/10 text-white rounded-xl shadow-xl hover:bg-slate-800 transition-all group active:scale-95"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-bold text-sm">Home</span>
        </button>
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-0 z-[500] p-4 pt-16">
        <Card className="pointer-events-auto mx-auto max-w-4xl p-4">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {filters.map((filter) => (
              <button
                key={filter.key}
                type="button"
                onClick={() => setActiveFilter(filter.key)}
                className={[
                  'min-h-12 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary',
                  activeFilter === filter.key ? 'border-secondary bg-secondary text-white' : 'border-slate-200 bg-white text-foreground'
                ].join(' ')}
              >
                {t(filter.label)}
              </button>
            ))}
          </div>
          <div className="mt-4">
            <label className="text-sm font-semibold text-foreground">{t('map.within', { radius })}</label>
            <input
              type="range"
              min={1}
              max={20}
              value={radius}
              onChange={(event) => setRadius(Number(event.target.value))}
              className="mt-2 w-full accent-secondary"
            />
          </div>
        </Card>
      </div>

      <button
        type="button"
        onClick={() => setFlyToUser((value) => !value)}
        className="absolute bottom-24 right-4 z-[500] flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
      >
        <MapPinned className="h-6 w-6" />
      </button>
    </main>
  );
}
