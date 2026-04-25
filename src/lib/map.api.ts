import api from './api';
import type { ApiResponse, GeoJSONFeatureCollection } from '../types';

export async function getHeatmap(lat: number, lng: number, radiusKm: number, type: string): Promise<GeoJSONFeatureCollection> {
  const { data } = await api.get<ApiResponse<GeoJSONFeatureCollection>>('/map/heatmap', {
    params: { lat, lng, radiusKm, type }
  });

  return data.data;
}
