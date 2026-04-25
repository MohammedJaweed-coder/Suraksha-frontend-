import { Request, Response } from 'express';
import { MockDb } from '../data/mockDb';
import { AppError } from '../middleware/error.middleware';
import { syncRequestSchema } from '../validators/incident.validator';

export class SyncController {
  /**
   * Bulk process offline incident payloads
   * POST /api/v1/sync
   */
  syncOfflinePayloads = async (req: Request, res: Response): Promise<void> => {
    try {
      // Validate request body
      const { payloads } = syncRequestSchema.parse(req.body);

      console.log('🔄 SYNC OPERATION STARTED:', {
        totalPayloads: payloads.length,
        userId: req.userId || 'anonymous',
        timestamp: new Date().toISOString(),
      });

      // Process payloads using mock database
      const result = await MockDb.bulkUpsertIncidents(payloads);

      console.log('✅ SYNC OPERATION COMPLETED:', {
        processed: result.processed,
        failed: result.failed,
        totalPayloads: payloads.length,
        successRate: `${Math.round((result.processed / payloads.length) * 100)}%`,
        timestamp: new Date().toISOString(),
      });

      res.status(200).json({
        processed: result.processed,
        failed: result.failed,
        errors: result.errors.slice(0, 10), // Limit error details to prevent large responses
      });
    } catch (error) {
      throw error;
    }
  };

  /**
   * Get sync status and statistics
   * GET /api/v1/sync/status
   */
  getSyncStatus = async (_req: Request, res: Response): Promise<void> => {
    try {
      // Get sync status from mock database
      const response = await MockDb.getSyncStatus();

      res.status(200).json(response);
    } catch (error) {
      throw error;
    }
  };
}