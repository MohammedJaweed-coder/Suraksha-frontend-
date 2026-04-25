/**
 * CCTVPage — Crowd Monitoring Dashboard (Frontend Simulation)
 *
 * Displays mock CCTV locations across Bengaluru with
 * real-time crowd density indicators that refresh periodically.
 */

import { motion } from 'framer-motion';
import {
  Activity,
  AlertTriangle,
  Camera,
  ChevronRight,
  Eye,
  MapPin,
  RefreshCw,
  Shield,
  Users
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

// ─── Types ───────────────────────────────────────────────────────────

type CrowdDensity = 'LOW' | 'MEDIUM' | 'HIGH';

interface CCTVLocation {
  id: string;
  name: string;
  area: string;
  lat: number;
  lng: number;
  density: CrowdDensity;
  personCount: number;
  status: 'ONLINE' | 'OFFLINE';
  lastUpdated: string;
}

// ─── Mock Data Generator ─────────────────────────────────────────────

const BASE_LOCATIONS = [
  { id: 'cctv-001', name: 'MG Road Junction Cam-1',      area: 'MG Road',          lat: 12.9753, lng: 77.6062 },
  { id: 'cctv-002', name: 'Brigade Road Entry',           area: 'Brigade Road',     lat: 12.9723, lng: 77.6071 },
  { id: 'cctv-003', name: 'Indiranagar 100ft Road',       area: 'Indiranagar',      lat: 12.9784, lng: 77.6408 },
  { id: 'cctv-004', name: 'Koramangala Forum Mall',       area: 'Koramangala',       lat: 12.9352, lng: 77.6245 },
  { id: 'cctv-005', name: 'Majestic Bus Station',         area: 'Majestic',         lat: 12.9770, lng: 77.5720 },
  { id: 'cctv-006', name: 'Silk Board Junction',          area: 'Silk Board',       lat: 12.9177, lng: 77.6233 },
  { id: 'cctv-007', name: 'Whitefield ITPL Gate',         area: 'Whitefield',       lat: 12.9698, lng: 77.7500 },
  { id: 'cctv-008', name: 'Hebbal Flyover North',         area: 'Hebbal',           lat: 13.0358, lng: 77.5970 },
  { id: 'cctv-009', name: 'Electronic City Phase-1',      area: 'Electronic City',  lat: 12.8456, lng: 77.6603 },
  { id: 'cctv-010', name: 'Jayanagar 4th Block',          area: 'Jayanagar',        lat: 12.9308, lng: 77.5838 },
  { id: 'cctv-011', name: 'Malleshwaram Circle',          area: 'Malleshwaram',     lat: 12.9965, lng: 77.5695 },
  { id: 'cctv-012', name: 'KR Puram Railway Bridge',      area: 'KR Puram',         lat: 13.0050, lng: 77.6920 },
];

function randomDensity(): CrowdDensity {
  const r = Math.random();
  if (r < 0.3) return 'LOW';
  if (r < 0.7) return 'MEDIUM';
  return 'HIGH';
}

function generateCCTVData(): CCTVLocation[] {
  return BASE_LOCATIONS.map(loc => {
    const density = randomDensity();
    const personCount = density === 'LOW'
      ? 10 + Math.floor(Math.random() * 40)
      : density === 'MEDIUM'
        ? 50 + Math.floor(Math.random() * 100)
        : 150 + Math.floor(Math.random() * 200);

    return {
      ...loc,
      density,
      personCount,
      status: Math.random() > 0.08 ? 'ONLINE' : 'OFFLINE',
      lastUpdated: new Date().toISOString()
    };
  });
}

// ─── Density Styling ─────────────────────────────────────────────────

const densityConfig = {
  LOW:    { color: 'text-green-400',  bg: 'bg-green-500/15', border: 'border-green-500/30', dot: 'bg-green-500', label: '🟢 Low Crowd' },
  MEDIUM: { color: 'text-amber-400',  bg: 'bg-amber-500/15', border: 'border-amber-500/30', dot: 'bg-amber-500', label: '🟡 Moderate' },
  HIGH:   { color: 'text-red-400',    bg: 'bg-red-500/15',   border: 'border-red-500/30',   dot: 'bg-red-500',   label: '🔴 High Density' },
};

// ─── CCTV Card Component ─────────────────────────────────────────────

function CCTVCard({ camera }: { camera: CCTVLocation }): JSX.Element {
  const cfg = densityConfig[camera.density];
  const isOffline = camera.status === 'OFFLINE';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className={`
        relative overflow-hidden rounded-2xl border p-5 transition-all duration-300
        ${isOffline
          ? 'border-slate-700 bg-slate-800/50 opacity-60'
          : `${cfg.border} bg-slate-900/80 hover:shadow-lg`
        }
      `}
    >
      {/* Status indicator */}
      <div className="absolute right-4 top-4 flex items-center gap-1.5">
        <span className={`h-2 w-2 rounded-full ${isOffline ? 'bg-slate-500' : `${cfg.dot} animate-pulse`}`} />
        <span className={`text-xs font-medium ${isOffline ? 'text-slate-500' : cfg.color}`}>
          {isOffline ? 'OFFLINE' : 'LIVE'}
        </span>
      </div>

      {/* Camera icon + name */}
      <div className="flex items-start gap-3">
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${isOffline ? 'bg-slate-700 text-slate-500' : `${cfg.bg} ${cfg.color}`}`}>
          <Camera size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-white truncate">{camera.name}</p>
          <p className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
            <MapPin size={10} /> {camera.area}
          </p>
        </div>
      </div>

      {/* Metrics */}
      {!isOffline && (
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className={`rounded-xl ${cfg.bg} px-3 py-2`}>
            <div className="flex items-center gap-1.5">
              <Users size={14} className={cfg.color} />
              <span className={`text-lg font-black ${cfg.color}`}>{camera.personCount}</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">People detected</p>
          </div>
          <div className={`rounded-xl ${cfg.bg} px-3 py-2`}>
            <p className={`text-sm font-bold ${cfg.color}`}>{cfg.label}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Crowd density</p>
          </div>
        </div>
      )}

      {/* Alert for high density */}
      {camera.density === 'HIGH' && !isOffline && (
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-xs font-medium text-red-400">
          <AlertTriangle size={14} />
          High crowd density — potential risk zone
        </div>
      )}
    </motion.div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────

export default function CCTVPage(): JSX.Element {
  const [cameras, setCameras] = useState<CCTVLocation[]>(generateCCTVData());
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);

  // Auto-refresh every 10 seconds for "live" feel
  useEffect(() => {
    const interval = setInterval(() => {
      setCameras(generateCCTVData());
      setLastRefresh(new Date());
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const manualRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setCameras(generateCCTVData());
      setLastRefresh(new Date());
      setRefreshing(false);
    }, 800);
  }, []);

  const highCount = cameras.filter(c => c.density === 'HIGH' && c.status === 'ONLINE').length;
  const onlineCount = cameras.filter(c => c.status === 'ONLINE').length;
  const totalPeople = cameras.filter(c => c.status === 'ONLINE').reduce((sum, c) => sum + c.personCount, 0);

  return (
    <main className="min-h-screen bg-slate-950 px-4 pb-24 pt-6">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/20 text-secondary">
              <Eye size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">CCTV Crowd Monitor</h1>
              <p className="text-xs text-slate-400">AI-powered real-time surveillance analytics</p>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
              <Camera size={12} /> Total Cameras
            </div>
            <p className="text-2xl font-black text-white">{cameras.length}</p>
          </div>
          <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-4">
            <div className="flex items-center gap-2 text-green-400 text-xs mb-1">
              <Activity size={12} /> Online
            </div>
            <p className="text-2xl font-black text-green-400">{onlineCount}</p>
          </div>
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
            <div className="flex items-center gap-2 text-red-400 text-xs mb-1">
              <AlertTriangle size={12} /> High Density
            </div>
            <p className="text-2xl font-black text-red-400">{highCount}</p>
          </div>
          <div className="rounded-xl border border-secondary/20 bg-secondary/5 p-4">
            <div className="flex items-center gap-2 text-secondary text-xs mb-1">
              <Users size={12} /> Total People
            </div>
            <p className="text-2xl font-black text-secondary">{totalPeople.toLocaleString()}</p>
          </div>
        </div>

        {/* Refresh bar */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            Last updated: {lastRefresh.toLocaleTimeString()} • Auto-refreshes every 10s
          </p>
          <button
            type="button"
            onClick={manualRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:bg-white/10 disabled:opacity-50"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {/* Camera Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cameras.map(camera => (
            <CCTVCard key={camera.id} camera={camera} />
          ))}
        </div>
      </div>
    </main>
  );
}
