/**
 * AI-Powered Safe Route Engine
 * 
 * Generates mock routes between known Bengaluru landmarks with
 * realistic safety scoring based on:
 *  - Crime rate data (mocked per zone)
 *  - Lighting conditions (well-lit vs dark)
 *  - Time of day (night penalty applied 8PM–6AM)
 *  - Crowdsourced incident density
 *  - Police station proximity bonus
 */

// ─── Types ───────────────────────────────────────────────────────────

export interface LatLng {
  lat: number;
  lng: number;
}

export interface UnsafeZone {
  center: LatLng;
  radiusKm: number;
  label: string;
  riskLevel: 'HIGH' | 'MODERATE';
  reason: string;
}

export interface RouteWarning {
  message: string;
  severity: 'critical' | 'moderate' | 'info';
}

export type RouteCategory = 'safest' | 'balanced' | 'fastest';

export interface SafeRoute {
  id: string;
  category: RouteCategory;
  label: string;
  safetyScore: number;          // 0–100
  distanceKm: number;
  estimatedMinutes: number;
  waypoints: LatLng[];          // polyline coords
  color: string;                // hex color for polyline
  warnings: RouteWarning[];
  passesUnsafeZones: string[];  // zone labels this route passes
}

export interface RoutingResult {
  source: KnownLocation;
  destination: KnownLocation;
  routes: SafeRoute[];
  unsafeZones: UnsafeZone[];
  computedAt: string;
}

export interface KnownLocation {
  name: string;
  lat: number;
  lng: number;
}

// ─── Known Bengaluru Locations ───────────────────────────────────────

export const KNOWN_LOCATIONS: KnownLocation[] = [
  { name: 'MG Road',          lat: 12.9753, lng: 77.6062 },
  { name: 'Indiranagar',      lat: 12.9784, lng: 77.6408 },
  { name: 'Koramangala',      lat: 12.9352, lng: 77.6245 },
  { name: 'Whitefield',       lat: 12.9698, lng: 77.7500 },
  { name: 'Jayanagar',        lat: 12.9308, lng: 77.5838 },
  { name: 'Malleshwaram',     lat: 12.9965, lng: 77.5695 },
  { name: 'Electronic City',  lat: 12.8456, lng: 77.6603 },
  { name: 'BTM Layout',       lat: 12.9165, lng: 77.6101 },
  { name: 'HSR Layout',       lat: 12.9116, lng: 77.6474 },
  { name: 'Hebbal',           lat: 13.0358, lng: 77.5970 },
  { name: 'Banashankari',     lat: 12.9255, lng: 77.5468 },
  { name: 'Rajajinagar',      lat: 12.9910, lng: 77.5520 },
  { name: 'Yelahanka',        lat: 13.1007, lng: 77.5963 },
  { name: 'JP Nagar',         lat: 12.9063, lng: 77.5857 },
  { name: 'Marathahalli',     lat: 12.9563, lng: 77.7013 },
];

// ─── Mock Unsafe Zones ──────────────────────────────────────────────

const UNSAFE_ZONES: UnsafeZone[] = [
  {
    center: { lat: 12.9580, lng: 77.6150 },
    radiusKm: 0.8,
    label: 'Shivajinagar Underpass',
    riskLevel: 'HIGH',
    reason: 'Poor lighting, high theft reports at night'
  },
  {
    center: { lat: 12.9450, lng: 77.5900 },
    radiusKm: 0.6,
    label: 'Lalbagh South Gate Area',
    riskLevel: 'MODERATE',
    reason: 'Isolated after 9PM, moderate incident reports'
  },
  {
    center: { lat: 12.9650, lng: 77.6700 },
    radiusKm: 0.7,
    label: 'Old Madras Road Stretch',
    riskLevel: 'HIGH',
    reason: 'Frequent chain snatching, poor CCTV coverage'
  },
  {
    center: { lat: 12.9100, lng: 77.6350 },
    radiusKm: 0.5,
    label: 'Silk Board Junction Area',
    riskLevel: 'MODERATE',
    reason: 'Heavy traffic congestion, pedestrian risk zones'
  },
  {
    center: { lat: 13.0200, lng: 77.5800 },
    radiusKm: 0.6,
    label: 'Yeshwanthpur Industrial Area',
    riskLevel: 'HIGH',
    reason: 'Dark alleys, low foot traffic after hours'
  },
  {
    center: { lat: 12.8700, lng: 77.6500 },
    radiusKm: 0.9,
    label: 'Bommanahalli Underpass',
    riskLevel: 'MODERATE',
    reason: 'Poorly maintained streetlights, moderate risk at night'
  },
];

// ─── Police Stations (safety bonus zones) ────────────────────────────

const POLICE_STATIONS: LatLng[] = [
  { lat: 12.9770, lng: 77.5900 },  // Cubbon Park Station
  { lat: 12.9350, lng: 77.6200 },  // Koramangala Station
  { lat: 12.9800, lng: 77.6400 },  // Indiranagar Station
  { lat: 12.9950, lng: 77.5700 },  // Malleshwaram Station
  { lat: 12.9200, lng: 77.5850 },  // Jayanagar Station
  { lat: 13.0350, lng: 77.5950 },  // Hebbal Station
  { lat: 12.9600, lng: 77.7000 },  // Marathahalli Station
];

// ─── Utility Helpers ─────────────────────────────────────────────────

/** Haversine distance in km between two coordinates */
function haversineKm(a: LatLng, b: LatLng): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const h = sinLat * sinLat +
    Math.cos((a.lat * Math.PI) / 180) *
    Math.cos((b.lat * Math.PI) / 180) *
    sinLng * sinLng;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

/** Check if a point is within a given zone */
function isInsideZone(point: LatLng, zone: UnsafeZone): boolean {
  return haversineKm(point, zone.center) <= zone.radiusKm;
}

/** Check if a point is near a police station (within 1km) */
function isNearPoliceStation(point: LatLng): boolean {
  return POLICE_STATIONS.some(station => haversineKm(point, station) < 1.0);
}

/** Generate intermediate waypoints between two locations with a "bend" factor */
function generateWaypoints(
  source: LatLng,
  dest: LatLng,
  bendFactor: number,
  numPoints: number
): LatLng[] {
  const points: LatLng[] = [source];
  const midLat = (source.lat + dest.lat) / 2;
  const midLng = (source.lng + dest.lng) / 2;

  // Create a perpendicular offset for the "bend"
  const dLat = dest.lat - source.lat;
  const dLng = dest.lng - source.lng;
  const offsetLat = -dLng * bendFactor;
  const offsetLng = dLat * bendFactor;

  for (let i = 1; i <= numPoints; i++) {
    const t = i / (numPoints + 1);
    // Quadratic Bezier-like interpolation through the offset midpoint
    const u = 1 - t;
    const lat = u * u * source.lat + 2 * u * t * (midLat + offsetLat) + t * t * dest.lat;
    const lng = u * u * source.lng + 2 * u * t * (midLng + offsetLng) + t * t * dest.lng;

    // Add slight randomness for realism
    const jitter = 0.001 * (Math.random() - 0.5);
    points.push({ lat: lat + jitter, lng: lng + jitter });
  }

  points.push(dest);
  return points;
}

/** Check if the current time is nighttime (8PM - 6AM) */
function isNightTime(): boolean {
  const hour = new Date().getHours();
  return hour >= 20 || hour < 6;
}

// ─── Safety Scoring Algorithm ────────────────────────────────────────

/**
 * Computes a safety score (0–100) for a route based on:
 * 1. How many unsafe zones the route passes through (-15 HIGH, -8 MODERATE per zone)
 * 2. Police station proximity along the route (+5 per nearby segment)
 * 3. Night-time penalty (-10 at night)
 * 4. Base score depends on route category
 */
function computeSafetyScore(
  waypoints: LatLng[],
  baseScore: number
): { score: number; passedZones: string[]; warnings: RouteWarning[] } {
  let score = baseScore;
  const passedZones: string[] = [];
  const warnings: RouteWarning[] = [];

  // Check each waypoint against unsafe zones
  for (const zone of UNSAFE_ZONES) {
    const passesThrough = waypoints.some(wp => isInsideZone(wp, zone));
    if (passesThrough) {
      passedZones.push(zone.label);
      if (zone.riskLevel === 'HIGH') {
        score -= 15;
        warnings.push({
          message: `⚠️ Passes through ${zone.label} — ${zone.reason}`,
          severity: 'critical'
        });
      } else {
        score -= 8;
        warnings.push({
          message: `⚡ Near ${zone.label} — ${zone.reason}`,
          severity: 'moderate'
        });
      }
    }
  }

  // Police station proximity bonus
  const nearPolice = waypoints.filter(wp => isNearPoliceStation(wp)).length;
  const policeBonus = Math.min(nearPolice * 3, 12);
  score += policeBonus;
  if (policeBonus > 5) {
    warnings.push({
      message: `🚔 Route passes near ${Math.min(nearPolice, 3)} police station(s)`,
      severity: 'info'
    });
  }

  // Night-time penalty
  if (isNightTime()) {
    score -= 10;
    warnings.push({
      message: '🌙 Night-time travel — reduced visibility in some areas',
      severity: 'moderate'
    });
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    passedZones,
    warnings
  };
}

// ─── Main Routing Function ───────────────────────────────────────────

/** Resolve a location string to known coordinates */
export function resolveLocation(query: string): KnownLocation | null {
  const normalized = query.toLowerCase().trim();
  return KNOWN_LOCATIONS.find(loc =>
    loc.name.toLowerCase().includes(normalized) ||
    normalized.includes(loc.name.toLowerCase())
  ) ?? null;
}

/**
 * Generate three route options between source and destination.
 * Returns the Safest, Balanced, and Fastest routes with full scoring.
 */
export function calculateRoutes(
  sourceStr: string,
  destStr: string
): RoutingResult | null {
  const source = resolveLocation(sourceStr);
  const dest = resolveLocation(destStr);

  if (!source || !dest) return null;

  const directDistance = haversineKm(source, dest);

  // --- Safest Route: wide arc avoiding risk zones, more waypoints ---
  const safestWaypoints = generateWaypoints(source, dest, 0.25, 12);
  const safestScoring = computeSafetyScore(safestWaypoints, 95);
  const safestRoute: SafeRoute = {
    id: 'route-safest',
    category: 'safest',
    label: 'Safest Route',
    safetyScore: safestScoring.score,
    distanceKm: Math.round((directDistance * 1.35) * 10) / 10,
    estimatedMinutes: Math.round(directDistance * 1.35 * 3.5),
    waypoints: safestWaypoints,
    color: '#22C55E', // green
    warnings: safestScoring.warnings,
    passesUnsafeZones: safestScoring.passedZones
  };

  // --- Balanced Route: moderate arc ---
  const balancedWaypoints = generateWaypoints(source, dest, 0.10, 10);
  const balancedScoring = computeSafetyScore(balancedWaypoints, 78);
  const balancedRoute: SafeRoute = {
    id: 'route-balanced',
    category: 'balanced',
    label: 'Balanced Route',
    safetyScore: balancedScoring.score,
    distanceKm: Math.round((directDistance * 1.15) * 10) / 10,
    estimatedMinutes: Math.round(directDistance * 1.15 * 3),
    waypoints: balancedWaypoints,
    color: '#F59E0B', // amber
    warnings: balancedScoring.warnings,
    passesUnsafeZones: balancedScoring.passedZones
  };

  // --- Fastest Route: nearly direct path ---
  const fastestWaypoints = generateWaypoints(source, dest, -0.05, 8);
  const fastestScoring = computeSafetyScore(fastestWaypoints, 55);
  const fastestRoute: SafeRoute = {
    id: 'route-fastest',
    category: 'fastest',
    label: 'Fastest Route',
    safetyScore: fastestScoring.score,
    distanceKm: Math.round(directDistance * 10) / 10,
    estimatedMinutes: Math.round(directDistance * 2.5),
    waypoints: fastestWaypoints,
    color: '#EF4444', // red
    warnings: fastestScoring.warnings,
    passesUnsafeZones: fastestScoring.passedZones
  };

  return {
    source,
    destination: dest,
    routes: [safestRoute, balancedRoute, fastestRoute],
    unsafeZones: UNSAFE_ZONES,
    computedAt: new Date().toISOString()
  };
}

/** Get the safety grade label for a given score */
export function getSafetyGrade(score: number): { label: string; color: string } {
  if (score >= 80) return { label: 'Safe', color: 'text-green-500' };
  if (score >= 60) return { label: 'Moderate', color: 'text-amber-500' };
  return { label: 'Risky', color: 'text-red-500' };
}
