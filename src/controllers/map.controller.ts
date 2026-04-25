import { Request, Response } from 'express';
import { MockDb } from '../data/mockDb';
import { heatmapQuerySchema } from '../validators/incident.validator';

export class MapController {
  /**
   * Get incident heatmap data
   * GET /api/v1/map/heatmap
   */
  getHeatmap = async (req: Request, res: Response): Promise<void> => {
    try {
      // Validate query parameters
      const validatedQuery = heatmapQuerySchema.parse({
        lat: parseFloat(req.query['lat'] as string),
        lng: parseFloat(req.query['lng'] as string),
        radiusKm: req.query['radiusKm'] ? parseInt(req.query['radiusKm'] as string) : 5,
        type: req.query['type'] as string || 'all',
      });

      const { lat, lng, radiusKm, type } = validatedQuery;

      // Get GeoJSON data from mock database
      const geoJsonResponse = await MockDb.getHeatmapGeoJSON(lat, lng, radiusKm, type);

      console.log('🗺️ HEATMAP QUERY:', {
        center: `${lat}, ${lng}`,
        radiusKm,
        type,
        resultsCount: geoJsonResponse.features.length,
        timestamp: new Date().toISOString(),
        userId: req.userId || 'anonymous',
      });

      res.status(200).json(geoJsonResponse);
    } catch (error) {
      throw error;
    }
  };

  /**
   * Get incident statistics for a region
   * GET /api/v1/map/stats
   */
  getRegionStats = async (req: Request, res: Response): Promise<void> => {
    try {
      // Validate query parameters
      const validatedQuery = heatmapQuerySchema.parse({
        lat: parseFloat(req.query['lat'] as string),
        lng: parseFloat(req.query['lng'] as string),
        radiusKm: req.query['radiusKm'] ? parseInt(req.query['radiusKm'] as string) : 5,
        type: 'all',
      });

      const { lat, lng, radiusKm } = validatedQuery;

      // Get statistics from mock database
      const response = await MockDb.getIncidentStats(lat, lng, radiusKm);

      res.status(200).json(response);
    } catch (error) {
      throw error;
    }
  };

  /**
   * Get dark spots (high incident density areas)
   * GET /api/v1/map/darkspots
   */
  getDarkSpots = async (req: Request, res: Response): Promise<void> => {
    try {
      // Validate query parameters
      const validatedQuery = heatmapQuerySchema.parse({
        lat: parseFloat(req.query['lat'] as string),
        lng: parseFloat(req.query['lng'] as string),
        radiusKm: req.query['radiusKm'] ? parseInt(req.query['radiusKm'] as string) : 10,
        type: 'all',
      });

      const { lat, lng, radiusKm } = validatedQuery;

      // Get dark spots analysis from mock database
      const response = await MockDb.getDarkSpots(lat, lng, radiusKm);

      console.log('🌑 DARK SPOTS ANALYSIS:', {
        center: `${lat}, ${lng}`,
        radiusKm,
        darkSpotsFound: response.features.length,
        timestamp: new Date().toISOString(),
        userId: req.userId || 'anonymous',
      });

      res.status(200).json(response);
    } catch (error) {
      throw error;
    }
  };
}