export type IncidentStatus = 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'CRITICAL';

export type IncidentType =
  | 'SOS'
  | 'TRAFFIC'
  | 'PUBLIC_NUISANCE'
  | 'DARK_SPOT'
  | 'THEFT'
  | 'OTHER';

export type CameraMode = 'photo' | 'video' | 'audio';

export interface ApiResponse<T> {
  data: T;
  message?: string;
  offline?: boolean;
}

export interface AuthSession {
  token: string;
  deviceId: string;
}

export interface MediaAsset {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  url?: string;
  blob?: Blob;
  sha256?: string;
}

export interface IncidentTimelineEntry {
  status: IncidentStatus;
  timestamp: string;
  label: string;
}

export interface Incident {
  id: string;
  type: IncidentType;
  title: string;
  description?: string;
  status: IncidentStatus;
  latitude: number;
  longitude: number;
  createdAt: string;
  updatedAt: string;
  relativeTime?: string;
  source: 'remote' | 'offline';
  media?: MediaAsset[];
  batteryLevel?: number;
  sha256?: string;
  timeline: IncidentTimelineEntry[];
  // AI Validation fields (Step 3 & 6)
  validationStatus?: 'VALID' | 'INVALID' | 'PENDING';
  validationConfidence?: number;
  validationReason?: string;
  rewardCode?: string;
  rewardLabel?: string;
}

export interface SOSPayload {
  audioClip: Blob;
  latitude: number;
  longitude: number;
  batteryLevel: number;
  deviceId: string;
}

export interface ViolationPayload {
  type: Exclude<IncidentType, 'SOS'>;
  description?: string;
  latitude: number;
  longitude: number;
  media: Blob;
  deviceId: string;
  address?: string;
  capturedAt: string;
}

export interface ReportPayload {
  email: string | null;
  location: string;
  description: string;
  mediaUrl?: string; // For the URL if already uploaded, or we might send the file
}

export interface HeatmapQuery {
  lat: number;
  lng: number;
  radiusKm: number;
  type: string;
}

export interface HeatmapFeatureProperties {
  id: string;
  type: IncidentType;
  status: IncidentStatus;
  title: string;
  description?: string;
  createdAt: string;
}

export interface GeoJSONFeature {
  type: 'Feature';
  geometry: {
    type: 'Point';
    coordinates: [number, number];
  };
  properties: HeatmapFeatureProperties;
}

export interface GeoJSONFeatureCollection {
  type: 'FeatureCollection';
  features: GeoJSONFeature[];
}

export interface OfflinePayload {
  id: string;
  kind: 'SOS' | 'VIOLATION';
  endpoint: string;
  method: 'POST';
  createdAt: string;
  data: {
    audioClip?: Blob;
    media?: Blob;
    latitude: number;
    longitude: number;
    batteryLevel?: number;
    type?: Exclude<IncidentType, 'SOS'>;
    description?: string;
    address?: string;
    deviceId: string;
    capturedAt?: string;
  };
}

export interface ToastItem {
  id: string;
  title?: string;
  message: string;
  variant: 'success' | 'error' | 'offline' | 'info';
}

export interface RegistrationOptionsResponse {
  challenge: string;
  rp: { name: string; id?: string };
  user: { id: string; name: string; displayName: string };
  pubKeyCredParams: Array<{ alg: number; type: 'public-key' }>;
  timeout?: number;
  attestation?: AttestationConveyancePreference;
  excludeCredentials?: Array<{
    id: string;
    type: PublicKeyCredentialType;
    transports?: AuthenticatorTransport[];
  }>;
  authenticatorSelection?: AuthenticatorSelectionCriteria;
}

export interface AuthenticationOptionsResponse {
  challenge: string;
  timeout?: number;
  rpId?: string;
  allowCredentials?: Array<{
    id: string;
    type: PublicKeyCredentialType;
    transports?: AuthenticatorTransport[];
  }>;
  userVerification?: UserVerificationRequirement;
}

export interface WebAuthnCredential {
  id: string;
  rawId: string;
  response: {
    clientDataJSON: string;
    attestationObject: string;
    transports?: string[];
  };
  type: PublicKeyCredentialType;
  clientExtensionResults?: AuthenticationExtensionsClientOutputs;
}

export interface WebAuthnAssertion {
  id: string;
  rawId: string;
  response: {
    clientDataJSON: string;
    authenticatorData: string;
    signature: string;
    userHandle: string | null;
  };
  type: PublicKeyCredentialType;
  clientExtensionResults?: AuthenticationExtensionsClientOutputs;
}

export interface BatteryManagerLike extends EventTarget {
  level: number;
  addEventListener(type: 'levelchange', listener: EventListenerOrEventListenerObject): void;
  removeEventListener(type: 'levelchange', listener: EventListenerOrEventListenerObject): void;
}

declare global {
  interface Navigator {
    getBattery?: () => Promise<BatteryManagerLike>;
  }
}
