import { Request, Response } from 'express';
import { MockDataService } from '../services/mockData.service';
import { sendSOSEmail } from '../services/email.service';

export class SOSController {
  /**
   * POST /api/sos
   * Trigger SOS alert
   */
  triggerSOS = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId, location } = req.body;

      if (!userId || !location) {
        res.status(400).json({
          success: false,
          error: 'User ID and location are required'
        });
        return;
      }

      const { lat, lng } = location;
      if (typeof lat !== 'number' || typeof lng !== 'number') {
        res.status(400).json({
          success: false,
          error: 'Location must contain numeric lat and lng'
        });
        return;
      }

      // Create SOS alert
      const sosAlert = MockDataService.createSOSAlert(userId, { lat, lng });

      console.log(`🚨 SOS Alert triggered by user ${userId} at [${lat}, ${lng}]`);
      console.log('📢 Notification sent to Police Control Room');

      // Send email notification to admin (non-blocking)
      try {
        const user = MockDataService.getUserById(userId);
        await sendSOSEmail(sosAlert, user?.email, user?.name);
      } catch (emailError) {
        console.error('📧 SOS email notification failed:', emailError instanceof Error ? emailError.message : emailError);
      }

      res.status(201).json({
        success: true,
        message: 'SOS alert triggered successfully',
        alert: {
          id: sosAlert.id,
          location: sosAlert.location,
          status: sosAlert.status,
          createdAt: sosAlert.createdAt
        }
      });

    } catch (error) {
      console.error('Trigger SOS error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  };

  /**
   * GET /api/sos/active
   * Get active SOS alerts (for admin)
   */
  getActiveSOSAlerts = async (_req: Request, res: Response): Promise<void> => {
    try {
      const activeAlerts = MockDataService.getActiveSOSAlerts();

      res.status(200).json({
        success: true,
        alerts: activeAlerts.map(alert => ({
          id: alert.id,
          userId: alert.userId,
          location: alert.location,
          status: alert.status,
          createdAt: alert.createdAt
        }))
      });

    } catch (error) {
      console.error('Get active SOS alerts error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  };

  /**
   * POST /api/sos/:id/resolve
   * Resolve SOS alert (admin only)
   */
  resolveSOSAlert = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const resolvedAlert = MockDataService.resolveSOSAlert(id);

      if (!resolvedAlert) {
        res.status(404).json({
          success: false,
          error: 'SOS alert not found'
        });
        return;
      }

      console.log(`✅ SOS Alert ${id} resolved`);

      res.status(200).json({
        success: true,
        message: 'SOS alert resolved successfully',
        alert: {
          id: resolvedAlert.id,
          location: resolvedAlert.location,
          status: resolvedAlert.status,
          createdAt: resolvedAlert.createdAt,
          resolvedAt: resolvedAlert.resolvedAt
        }
      });

    } catch (error) {
      console.error('Resolve SOS alert error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  };
}