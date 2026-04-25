import { Request, Response } from 'express';
import { MockDataService } from '../services/mockData.service';

export class RouteController {
  /**
   * POST /api/routes
   * Calculate safe routes between source and destination
   */
  calculateRoutes = async (req: Request, res: Response): Promise<void> => {
    try {
      const { source, destination } = req.body;

      if (!source || !destination) {
        res.status(400).json({
          success: false,
          error: 'Source and destination are required'
        });
        return;
      }

      const { lat: sourceLat, lng: sourceLng } = source;
      const { lat: destLat, lng: destLng } = destination;

      if (typeof sourceLat !== 'number' || typeof sourceLng !== 'number' ||
          typeof destLat !== 'number' || typeof destLng !== 'number') {
        res.status(400).json({
          success: false,
          error: 'Source and destination must contain numeric lat and lng'
        });
        return;
      }

      // Calculate routes
      const routes = MockDataService.calculateRoute(
        { lat: sourceLat, lng: sourceLng },
        { lat: destLat, lng: destLng }
      );

      console.log(`🗺️ Route calculated from [${sourceLat}, ${sourceLng}] to [${destLat}, ${destLng}]`);

      res.status(200).json({
        success: true,
        source: { lat: sourceLat, lng: sourceLng },
        destination: { lat: destLat, lng: destLng },
        routes: routes.map(route => ({
          type: route.type,
          distance: parseFloat(route.distance.toFixed(2)),
          time: route.time,
          safetyScore: route.safetyScore,
          waypoints: route.waypoints
        })),
        recommendation: this.getRouteRecommendation(routes)
      });

    } catch (error) {
      console.error('Calculate routes error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  };

  /**
   * Get route recommendation based on safety score
   */
  private getRouteRecommendation(routes: any[]) {
    const safestRoute = routes.find(r => r.type === 'safest');
    const balancedRoute = routes.find(r => r.type === 'balanced');
    const fastestRoute = routes.find(r => r.type === 'fastest');

    if (!safestRoute || !balancedRoute || !fastestRoute) {
      return 'No recommendation available';
    }

    if (safestRoute.safetyScore >= 8) {
      return {
        recommended: 'safest',
        reason: 'Highest safety score (9/10)',
        warning: '20% longer distance but safest option'
      };
    } else if (balancedRoute.safetyScore >= 6) {
      return {
        recommended: 'balanced',
        reason: 'Good balance of safety (7/10) and time',
        warning: 'Moderate safety with optimal travel time'
      };
    } else {
      return {
        recommended: 'fastest',
        reason: 'Fastest route available',
        warning: 'Lower safety score (5/10) - use with caution'
      };
    }
  }

  /**
   * GET /api/routes/safe-locations
   * Get list of safe locations (mock data)
   */
  getSafeLocations = async (_req: Request, res: Response): Promise<void> => {
    try {
      const safeLocations = [
        {
          id: '1',
          name: 'MG Road Police Station',
          lat: 12.9757,
          lng: 77.6011,
          safetyScore: 9,
          type: 'police_station',
          distance: '0.5 km'
        },
        {
          id: '2',
          name: 'Indiranagar Safe Zone',
          lat: 12.9784,
          lng: 77.6408,
          safetyScore: 8,
          type: 'safe_zone',
          distance: '1.2 km'
        },
        {
          id: '3',
          name: 'Koramangala Help Center',
          lat: 12.9352,
          lng: 77.6245,
          safetyScore: 7,
          type: 'help_center',
          distance: '2.5 km'
        },
        {
          id: '4',
          name: 'Whitefield Emergency Post',
          lat: 12.9698,
          lng: 77.7499,
          safetyScore: 6,
          type: 'emergency_post',
          distance: '3.8 km'
        }
      ];

      res.status(200).json({
        success: true,
        locations: safeLocations
      });

    } catch (error) {
      console.error('Get safe locations error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  };
}