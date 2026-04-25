import { AnimatePresence, motion } from 'framer-motion';
import L from 'leaflet';
import {
  AlertTriangle,
  ChevronDown,
  Clock,
  Navigation2,
  Route,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Zap,
  ArrowLeft
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { Circle, MapContainer, Polyline, TileLayer, Tooltip, useMap } from 'react-leaflet';
import {
  calculateRoutes,
  getSafetyGrade,
  KNOWN_LOCATIONS,
  resolveLocation
} from '../lib/routing';
import type { KnownLocation, RouteCategory, RoutingResult, SafeRoute } from '../lib/routing';
import 'leaflet/dist/leaflet.css';

// ─── Map Controller: fits bounds to show all routes ──────────────────

function FitBounds({ routes }: { routes: SafeRoute[] }): null {
  const map = useMap();

  useEffect(() => {
    if (routes.length === 0) return;
    const allPoints: L.LatLngExpression[] = routes.flatMap(r =>
      r.waypoints.map(wp => [wp.lat, wp.lng] as L.LatLngExpression)
    );
    if (allPoints.length > 0) {
      const bounds = L.latLngBounds(allPoints);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15, animate: true });
    }
  }, [routes, map]);

  return null;
}

// ─── Location Autocomplete Dropdown ──────────────────────────────────

function LocationDropdown({
  suggestions,
  onSelect,
  visible
}: {
  suggestions: any[];
  onSelect: (loc: any) => void;
  visible: boolean;
}): JSX.Element | null {
  if (!visible || suggestions.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      className="absolute left-0 right-0 top-full z-50 mt-1 max-h-48 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl"
    >
      {suggestions.map((loc, idx) => (
        <button
          key={`${loc.name}-${idx}`}
          type="button"
          onClick={() => onSelect(loc)}
          className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition hover:bg-slate-50 border-b border-slate-50 last:border-0"
        >
          <Navigation2 size={14} className="shrink-0 text-secondary" />
          <div className="flex flex-col">
            <span className="font-semibold text-slate-900">{loc.name}</span>
            <span className="text-[10px] text-slate-400 uppercase tracking-tight">Coordinates: {loc.lat.toFixed(4)}, {loc.lng.toFixed(4)}</span>
          </div>
        </button>
      ))}
    </motion.div>
  );
}

// ─── Route Info Card ─────────────────────────────────────────────────

function RouteCard({
  route,
  isSelected,
  onSelect
}: {
  route: SafeRoute;
  isSelected: boolean;
  onSelect: () => void;
}): JSX.Element {
  const grade = getSafetyGrade(route.safetyScore);
  const CategoryIcon = route.category === 'safest' ? ShieldCheck :
    route.category === 'balanced' ? Shield : Zap;

  return (
    <motion.button
      type="button"
      onClick={onSelect}
      whileTap={{ scale: 0.97 }}
      className={`
        w-full rounded-2xl border-2 p-4 text-left transition-all duration-200
        ${isSelected
          ? 'border-secondary bg-secondary/5 shadow-lg shadow-secondary/10'
          : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md'
        }
      `}
    >
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${
            route.category === 'safest' ? 'bg-green-100 text-green-600' :
            route.category === 'balanced' ? 'bg-amber-100 text-amber-600' :
            'bg-red-100 text-red-600'
          }`}>
            <CategoryIcon size={18} />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">{route.label}</p>
            <p className={`text-xs font-semibold ${grade.color}`}>{grade.label}</p>
          </div>
        </div>

        {/* Safety Score Pill */}
        <div className={`
          flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold
          ${route.safetyScore >= 80 ? 'bg-green-100 text-green-700' :
            route.safetyScore >= 60 ? 'bg-amber-100 text-amber-700' :
            'bg-red-100 text-red-700'
          }
        `}>
          <Shield size={14} />
          {route.safetyScore}
        </div>
      </div>

      {/* Metrics row */}
      <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <Route size={12} />
          {route.distanceKm} km
        </span>
        <span className="flex items-center gap-1">
          <Clock size={12} />
          {route.estimatedMinutes} min
        </span>
        {route.passesUnsafeZones.length > 0 && (
          <span className="flex items-center gap-1 text-red-500">
            <AlertTriangle size={12} />
            {route.passesUnsafeZones.length} risk zone{route.passesUnsafeZones.length > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Warnings (shown only when selected) */}
      <AnimatePresence>
        {isSelected && route.warnings.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-3 space-y-1.5 overflow-hidden"
          >
            {route.warnings.map((w, i) => (
              <div
                key={i}
                className={`rounded-lg px-3 py-2 text-xs font-medium ${
                  w.severity === 'critical' ? 'bg-red-50 text-red-700' :
                  w.severity === 'moderate' ? 'bg-amber-50 text-amber-700' :
                  'bg-blue-50 text-blue-700'
                }`}
              >
                {w.message}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

// ─── Main Page Component ─────────────────────────────────────────────

export default function SafeRoutePage(): JSX.Element {
  const navigate = useNavigate();
  const [sourceQuery, setSourceQuery] = useState('');
  const [destQuery, setDestQuery] = useState('');
  const [sourceSuggestions, setSourceSuggestions] = useState<any[]>([]);
  const [destSuggestions, setDestSuggestions] = useState<any[]>([]);
  const [sourceFocused, setSourceFocused] = useState(false);
  const [destFocused, setDestFocused] = useState(false);
  const [selectedSource, setSelectedSource] = useState<any | null>(null);
  const [selectedDest, setSelectedDest] = useState<any | null>(null);
  const [result, setResult] = useState<RoutingResult | null>(null);
  const [activeRoute, setActiveRoute] = useState<RouteCategory>('safest');
  const [panelExpanded, setPanelExpanded] = useState(true);
  const [isSearching, setIsSearching] = useState(false);

  // Debounced Search for Source
  useEffect(() => {
    if (sourceQuery.length < 2 || selectedSource) {
      setSourceSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsSearching(true);
        const { data } = await api.get(`/routes/search?query=${encodeURIComponent(sourceQuery)}`);
        setSourceSuggestions(data.length > 0 ? data : []);
      } catch (err) {
        console.error("Search failed", err);
        setSourceSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [sourceQuery, selectedSource]);

  // Debounced Search for Destination
  useEffect(() => {
    if (destQuery.length < 2 || selectedDest) {
      setDestSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsSearching(true);
        const { data } = await api.get(`/routes/search?query=${encodeURIComponent(destQuery)}`);
        setDestSuggestions(data.length > 0 ? data : []);
      } catch (err) {
        console.error("Search failed", err);
        setDestSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [destQuery, selectedDest]);

  const mapRef = useRef<L.Map | null>(null);

  const computeRoutes = useCallback(() => {
    if (!selectedSource || !selectedDest) return;
    if (selectedSource.name === selectedDest.name) return;
    const routing = calculateRoutes(selectedSource.name, selectedDest.name);
    if (routing) {
      setResult(routing);
      setActiveRoute('safest');
      setPanelExpanded(true);
    }
  }, [selectedSource, selectedDest]);

  const selectedRouteData = result?.routes.find(r => r.category === activeRoute);
  const defaultCenter: [number, number] = [12.9716, 77.5946]; // Bengaluru

  return (
    <main className="relative h-[calc(100vh-4rem)] w-full overflow-hidden">
      {/* ── Map Layer ── */}
      <MapContainer
        center={defaultCenter}
        zoom={12}
        className="h-full w-full"
        ref={mapRef}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com">CARTO</a>'
        />

        {/* Unsafe Zone Circles */}
        {result?.unsafeZones.map(zone => (
          <Circle
            key={zone.label}
            center={[zone.center.lat, zone.center.lng]}
            radius={zone.radiusKm * 1000}
            pathOptions={{
              color: zone.riskLevel === 'HIGH' ? '#EF4444' : '#F59E0B',
              fillColor: zone.riskLevel === 'HIGH' ? '#EF4444' : '#F59E0B',
              fillOpacity: 0.15,
              weight: 2,
              dashArray: zone.riskLevel === 'HIGH' ? '' : '6 4'
            }}
          >
            <Tooltip permanent direction="center" className="!bg-transparent !border-0 !shadow-none">
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                zone.riskLevel === 'HIGH'
                  ? 'bg-red-500/90 text-white'
                  : 'bg-amber-500/90 text-white'
              }`}>
                {zone.riskLevel === 'HIGH' ? '🔴' : '🟡'} {zone.label}
              </span>
            </Tooltip>
          </Circle>
        ))}

        {/* All route polylines */}
        {result?.routes.map(route => (
          <Polyline
            key={route.id}
            positions={route.waypoints.map(wp => [wp.lat, wp.lng])}
            pathOptions={{
              color: route.color,
              weight: route.category === activeRoute ? 6 : 3,
              opacity: route.category === activeRoute ? 1 : 0.35,
              lineCap: 'round',
              lineJoin: 'round'
            }}
            eventHandlers={{
              click: () => setActiveRoute(route.category)
            }}
          >
            <Tooltip sticky>
              <span className="text-xs font-semibold">{route.label} — Score: {route.safetyScore}</span>
            </Tooltip>
          </Polyline>
        ))}

        {/* Fit map to routes */}
        {result && <FitBounds routes={result.routes} />}
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

      {/* ── Floating Search + Route Panel ── */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-[500] flex flex-col items-center p-3 pt-16">
        <div className="pointer-events-auto w-full max-w-xl space-y-3">

          {/* Search Card */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="rounded-2xl border border-white/20 bg-slate-900/90 p-4 shadow-2xl backdrop-blur-xl"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary/20">
                <Navigation2 size={16} className="text-secondary" />
              </div>
              <h2 className="text-sm font-bold text-white">AI Safe Route Planner</h2>
            </div>

            {/* Source Input */}
            <div className="relative mb-2">
              <div className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2.5">
                <div className="h-3 w-3 rounded-full bg-green-500 ring-2 ring-green-500/30" />
                <input
                  type="text"
                  placeholder="Start location (e.g. MG Road)"
                  value={sourceQuery}
                  onChange={e => { setSourceQuery(e.target.value); setSelectedSource(null); }}
                  onFocus={() => setSourceFocused(true)}
                  onBlur={() => setTimeout(() => setSourceFocused(false), 250)}
                  className="flex-1 bg-transparent text-sm text-white placeholder-slate-400 outline-none"
                />
                {sourceQuery.length >= 2 && !selectedSource && (
                  <button 
                    onClick={() => {
                      // Trigger search immediately
                      const triggerSearch = async () => {
                        try {
                          setIsSearching(true);
                          const { data } = await api.get(`/routes/search?query=${encodeURIComponent(sourceQuery)}`);
                          setSourceSuggestions(data.length > 0 ? data : []);
                        } catch (err) {
                          console.error("Search failed", err);
                        } finally {
                          setIsSearching(false);
                        }
                      };
                      triggerSearch();
                    }}
                    className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"
                  >
                    <Search size={16} />
                  </button>
                )}
                {selectedSource && <ShieldCheck size={16} className="text-green-400" />}
              </div>
              <LocationDropdown
                suggestions={sourceSuggestions}
                visible={sourceFocused && !selectedSource}
                onSelect={loc => { setSelectedSource(loc); setSourceQuery(loc.name); setSourceFocused(false); }}
              />
            </div>

            {/* Destination Input */}
            <div className="relative">
              <div className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2.5">
                <div className="h-3 w-3 rounded-full bg-red-500 ring-2 ring-red-500/30" />
                <input
                  type="text"
                  placeholder="Destination (e.g. Koramangala)"
                  value={destQuery}
                  onChange={e => { setDestQuery(e.target.value); setSelectedDest(null); }}
                  onFocus={() => setDestFocused(true)}
                  onBlur={() => setTimeout(() => setDestFocused(false), 250)}
                  className="flex-1 bg-transparent text-sm text-white placeholder-slate-400 outline-none"
                />
                {destQuery.length >= 2 && !selectedDest && (
                  <button 
                    onClick={() => {
                      // Trigger search immediately
                      const triggerSearch = async () => {
                        try {
                          setIsSearching(true);
                          const { data } = await api.get(`/routes/search?query=${encodeURIComponent(destQuery)}`);
                          setDestSuggestions(data.length > 0 ? data : []);
                        } catch (err) {
                          console.error("Search failed", err);
                        } finally {
                          setIsSearching(false);
                        }
                      };
                      triggerSearch();
                    }}
                    className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"
                  >
                    <Search size={16} />
                  </button>
                )}
                {selectedDest && <ShieldCheck size={16} className="text-green-400" />}
              </div>
              <LocationDropdown
                suggestions={destSuggestions}
                visible={destFocused && !selectedDest}
                onSelect={loc => { setSelectedDest(loc); setDestQuery(loc.name); setDestFocused(false); }}
              />
            </div>

            {/* Quick suggestion chips */}
            {!result && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {['MG Road', 'Indiranagar', 'Koramangala', 'Whitefield', 'Jayanagar'].map(name => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => {
                      const loc = resolveLocation(name);
                      if (!loc) return;
                      if (!selectedSource) { setSelectedSource(loc); setSourceQuery(name); }
                      else if (!selectedDest) { setSelectedDest(loc); setDestQuery(name); }
                    }}
                    className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-slate-300 transition hover:bg-white/20 hover:text-white"
                  >
                    {name}
                  </button>
                ))}
              </div>
            )}

            {/* ACTION BUTTON: Get Routes */}
            {selectedSource && selectedDest && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-4"
              >
                <button
                  type="button"
                  onClick={computeRoutes}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-secondary py-3 text-sm font-bold text-white shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all hover:bg-secondary/90 active:scale-95"
                >
                  <Route size={18} />
                  GET SAFE ROUTES
                </button>
              </motion.div>
            )}
          </motion.div>

          {/* Route Results Panel */}
          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -10, opacity: 0 }}
                className="rounded-2xl border border-white/10 bg-white/95 shadow-2xl backdrop-blur-xl"
              >
                {/* Panel header (collapsible) */}
                <button
                  type="button"
                  onClick={() => setPanelExpanded(prev => !prev)}
                  className="flex w-full items-center justify-between px-4 py-3 text-left"
                >
                  <div className="flex items-center gap-2">
                    <ShieldAlert size={18} className="text-secondary" />
                    <span className="text-sm font-bold text-foreground">
                      {result.source.name} → {result.destination.name}
                    </span>
                  </div>
                  <ChevronDown
                    size={18}
                    className={`text-slate-400 transition-transform ${panelExpanded ? 'rotate-180' : ''}`}
                  />
                </button>

                {/* Route toggle bar */}
                <div className="flex gap-1 px-4 pb-2">
                  {(['safest', 'balanced', 'fastest'] as RouteCategory[]).map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setActiveRoute(cat)}
                      className={`
                        flex-1 rounded-xl py-2 text-xs font-bold uppercase tracking-wider transition-all
                        ${activeRoute === cat
                          ? cat === 'safest' ? 'bg-green-500 text-white shadow-lg shadow-green-500/30' :
                            cat === 'balanced' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30' :
                            'bg-red-500 text-white shadow-lg shadow-red-500/30'
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }
                      `}
                    >
                      {cat === 'safest' ? '🛡️ Safest' : cat === 'balanced' ? '⚖️ Balanced' : '⚡ Fastest'}
                    </button>
                  ))}
                </div>

                {/* Expanded route cards */}
                <AnimatePresence>
                  {panelExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="max-h-[40vh] space-y-2 overflow-y-auto px-4 pb-4">
                        {result.routes.map(route => (
                          <RouteCard
                            key={route.id}
                            route={route}
                            isSelected={route.category === activeRoute}
                            onSelect={() => setActiveRoute(route.category)}
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Legend (bottom-left) ── */}
      <div className="absolute bottom-20 left-4 z-[500] rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3 backdrop-blur-md">
        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-300">Zone Legend</p>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <span className="inline-block h-3 w-3 rounded-full bg-red-500" /> High Risk
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <span className="inline-block h-3 w-3 rounded-full bg-amber-500" /> Moderate
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <span className="inline-block h-3 w-3 rounded-full bg-green-500" /> Safe
          </div>
        </div>
      </div>
    </main>
  );
}
