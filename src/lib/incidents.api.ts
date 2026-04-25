import api from './api';
import type { ApiResponse, Incident, SOSPayload, ViolationPayload } from '../types';

function appendIfPresent(formData: FormData, key: string, value: string | number | undefined): void {
  if (value !== undefined && value !== '') {
    formData.append(key, String(value));
  }
}

export async function postSOS(payload: SOSPayload): Promise<Incident> {
  const formData = new FormData();
  formData.append('audioClip', payload.audioClip, 'sos-audio.webm');
  formData.append('latitude', String(payload.latitude));
  formData.append('longitude', String(payload.longitude));
  formData.append('batteryLevel', String(payload.batteryLevel));
  formData.append('deviceId', payload.deviceId);

  const { data } = await api.post<ApiResponse<Incident> | any>('/incidents/sos', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

  const response = (data as any).data || data;

  return {
    ...response,
    id: response.id || response.incidentId || crypto.randomUUID(),
    type: response.type || 'SOS',
    title: response.title || 'Emergency SOS',
    latitude: payload.latitude,
    longitude: payload.longitude,
    status: response.status || 'PENDING',
    createdAt: new Date().toISOString(),
    timeline: response.timeline || [{ status: response.status || 'PENDING', timestamp: new Date().toISOString(), label: 'SOS Alert Triggered' }]
  } as Incident;
}

export async function postViolation(payload: ViolationPayload): Promise<Incident> {
  const formData = new FormData();
  formData.append('media', payload.media, 'incident-capture.jpg');
  formData.append('type', payload.type);
  formData.append('deviceId', payload.deviceId);
  formData.append('latitude', String(payload.latitude));
  formData.append('longitude', String(payload.longitude));
  formData.append('capturedAt', payload.capturedAt);
  appendIfPresent(formData, 'description', payload.description);
  appendIfPresent(formData, 'address', payload.address);

  const { data } = await api.post<ApiResponse<Incident> | any>('/incidents/violation', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

  const response = (data as any).data || data;

  return {
    ...response,
    id: response.id || response.incidentId || crypto.randomUUID(),
    type: response.type || payload.type,
    title: response.title || `${payload.type} Report`,
    latitude: payload.latitude,
    longitude: payload.longitude,
    status: response.status || 'PENDING',
    createdAt: new Date().toISOString(),
    timeline: response.timeline || [{ status: response.status || 'PENDING', timestamp: new Date().toISOString(), label: 'Report Submitted' }]
  } as Incident;
}

export async function postReport(payload: any): Promise<any> {
  const { data } = await api.post('/report', payload);
  return data;
}

export async function resolveIncident(id: string): Promise<any> {
  const { data } = await api.patch(`/report/${id}/resolve`);
  return data;
}

export async function getIncidentById(id: string): Promise<Incident> {
  const { data } = await api.get<ApiResponse<Incident> | Incident>(`/incidents/${id}`);
  return (data as any).data || data;
}
