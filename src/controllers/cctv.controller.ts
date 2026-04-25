import { Request, Response } from 'express';
import { MockDataService } from '../services/mockData.service';
import { CrowdDensity } from '../data/models';

export class CCTVController {
  /**
   * GET /api/cctv
   * Get all CCTV feeds with crowd monitoring data
   */
  getCCTVFeeds = async (_req: Request, res: Response): Promise<void> => {
    try {
      const feeds = MockDataService.getCCTVFeeds();

      res.status(200).json({
        success: true,
        feeds: feeds.map(feed => ({
          id: feed.id,
          location: feed.location,
          lat: feed.lat,
          lng: feed.lng,
          crowdDensity: feed.crowdDensity,
          riskLevel: feed.riskLevel,
          lastUpdated: feed.lastUpdated
        }))
      });

    } catch (error) {
      console.error('Get CCTV feeds error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  };

  /**
   * POST /api/cctv/:id/crowd
   * Update crowd density for a CCTV feed (simulated)
   */
  updateCrowdDensity = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { crowdDensity } = req.body;

      if (!crowdDensity || !Object.values(CrowdDensity).includes(crowdDensity)) {
        res.status(400).json({
          success: false,
          error: 'Valid crowdDensity is required (low, medium, high)'
        });
        return;
      }

      const updatedFeed = MockDataService.updateCCTVCrowdDensity(id, crowdDensity);

      if (!updatedFeed) {
        res.status(404).json({
          success: false,
          error: 'CCTV feed not found'
        });
        return;
      }

      console.log(`📊 CCTV ${id} crowd density updated to ${crowdDensity}`);
      
      if (crowdDensity === 'high') {
        console.log('📢 Notification sent to Police Control Room');
      }

      res.status(200).json({
        success: true,
        message: 'Crowd density updated successfully',
        feed: {
          id: updatedFeed.id,
          location: updatedFeed.location,
          crowdDensity: updatedFeed.crowdDensity,
          riskLevel: updatedFeed.riskLevel,
          lastUpdated: updatedFeed.lastUpdated
        }
      });

    } catch (error) {
      console.error('Update crowd density error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  };

  /**
   * GET /api/cctv/high-risk
   * Get high-risk CCTV feeds
   */
  getHighRiskFeeds = async (_req: Request, res: Response): Promise<void> => {
    try {
      const feeds = MockDataService.getCCTVFeeds();
      const highRiskFeeds = feeds.filter(feed => feed.riskLevel === 'high');

      res.status(200).json({
        success: true,
        feeds: highRiskFeeds.map(feed => ({
          id: feed.id,
          location: feed.location,
          lat: feed.lat,
          lng: feed.lng,
          crowdDensity: feed.crowdDensity,
          riskLevel: feed.riskLevel,
          lastUpdated: feed.lastUpdated
        })),
        count: highRiskFeeds.length
      });

    } catch (error) {
      console.error('Get high risk feeds error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  };
}