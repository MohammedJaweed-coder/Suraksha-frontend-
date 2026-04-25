import api from './api';
import type { ApiResponse, OfflinePayload } from '../types';

export async function syncOfflineQueue(payloads: OfflinePayload[]): Promise<{ syncedIds: string[] }> {
  const { data } = await api.post<ApiResponse<{ syncedIds: string[] }>>('/sync/offline-queue', { payloads });
  return data.data;
}
