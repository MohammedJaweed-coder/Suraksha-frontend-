import { Request, Response } from 'express';
import { MockDataService } from '../services/mockData.service';
import { getAdminInbox } from '../data/adminInbox';

export class AdminController {
  /**
   * GET /api/admin/overview
   * Get dashboard overview statistics
   */
  getDashboardOverview = async (_req: Request, res: Response): Promise<void> => {
    try {
      const stats = MockDataService.getDashboardStats();

      res.status(200).json({
        success: true,
        overview: {
          totalReports: stats.totalReports,
          validReports: stats.validReports,
          invalidReports: stats.invalidReports,
          activeSOSAlerts: stats.activeSOSAlerts,
          totalUsers: stats.totalUsers,
          totalCCTVFeeds: stats.totalCCTVFeeds,
          updatedAt: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('Get dashboard overview error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  };

  /**
   * GET /api/admin/reports
   * Get all reports (admin view)
   */
  getAllReports = async (req: Request, res: Response): Promise<void> => {
    try {
      const { status, page = '1', limit = '10' } = req.query;
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const skip = (pageNum - 1) * limitNum;

      let reports = MockDataService.getAllReports();

      // Filter by status if provided
      if (status) {
        reports = reports.filter(report => report.status === status);
      }

      // Sort by creation date (newest first)
      reports.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      // Pagination
      const total = reports.length;
      const paginatedReports = reports.slice(skip, skip + limitNum);

      res.status(200).json({
        success: true,
        reports: paginatedReports.map(report => ({
          id: report.id,
          userId: report.userId,
          title: report.title,
          description: report.description,
          location: report.location,
          mediaType: report.mediaType,
          mediaUrl: report.mediaUrl,
          status: report.status,
          aiValidationResult: report.aiValidationResult,
          action: report.action,
          createdAt: report.createdAt,
          updatedAt: report.updatedAt
        })),
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
          hasNext: skip + limitNum < total,
          hasPrev: pageNum > 1
        }
      });

    } catch (error) {
      console.error('Get all reports error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  };

  /**
   * GET /api/admin/sos
   * Get all SOS alerts (admin view)
   */
  getAllSOSAlerts = async (req: Request, res: Response): Promise<void> => {
    try {
      const { status } = req.query;
      
      let sosAlerts = MockDataService.getActiveSOSAlerts();

      // If status is provided, get all alerts filtered by status
      if (status) {
        const allAlerts = MockDataService.getActiveSOSAlerts(); // This only returns active
        sosAlerts = allAlerts.filter(alert => alert.status === status);
      }

      // Sort by creation date (newest first)
      sosAlerts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      res.status(200).json({
        success: true,
        alerts: sosAlerts.map(alert => ({
          id: alert.id,
          userId: alert.userId,
          location: alert.location,
          status: alert.status,
          createdAt: alert.createdAt,
          resolvedAt: alert.resolvedAt
        }))
      });

    } catch (error) {
      console.error('Get all SOS alerts error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  };

  /**
   * GET /api/admin/notifications
   * Get all notifications (admin view)
   */
  getNotifications = async (req: Request, res: Response): Promise<void> => {
    try {
      const { read, type } = req.query;
      
      // Get admin user ID
      const adminUser = MockDataService.getUserById('admin-user-001'); // Fixed admin ID
      if (!adminUser) {
        res.status(404).json({
          success: false,
          error: 'Admin user not found'
        });
        return;
      }

      let notifications = MockDataService.getNotificationsByUserId(adminUser.id);

      // Filter by read status if provided
      if (read !== undefined) {
        const isRead = read === 'true';
        notifications = notifications.filter(n => n.read === isRead);
      }

      // Filter by type if provided
      if (type) {
        notifications = notifications.filter(n => n.type === type);
      }

      // Sort by creation date (newest first)
      notifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      res.status(200).json({
        success: true,
        notifications: notifications.map(notification => ({
          id: notification.id,
          type: notification.type,
          message: notification.message,
          read: notification.read,
          createdAt: notification.createdAt
        }))
      });

    } catch (error) {
      console.error('Get notifications error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  };

  /**
   * POST /api/admin/notifications/:id/read
   * Mark notification as read
   */
  markNotificationAsRead = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const notification = MockDataService.markNotificationAsRead(id);

      if (!notification) {
        res.status(404).json({
          success: false,
          error: 'Notification not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Notification marked as read',
        notification: {
          id: notification.id,
          type: notification.type,
          message: notification.message,
          read: notification.read,
          createdAt: notification.createdAt
        }
      });

    } catch (error) {
      console.error('Mark notification as read error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  };

  /**
   * GET /api/admin/inbox
   * Get all reports in admin inbox (like messages)
   */
  getInbox = async (req: Request, res: Response): Promise<void> => {
    try {
      const { page = '1', limit = '20', status } = req.query;
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const skip = (pageNum - 1) * limitNum;

      let inbox = getAdminInbox();

      // Filter by status if provided
      if (status) {
        inbox = inbox.filter(report => report.status === status);
      }

      // Pagination
      const total = inbox.length;
      const paginatedInbox = inbox.slice(skip, skip + limitNum);

      console.log(`📬 Admin inbox accessed: ${total} reports total, showing ${paginatedInbox.length}`);

      res.status(200).json({
        success: true,
        inbox: paginatedInbox.map(report => {
          // Get reporter's email
          const reporter = MockDataService.getUserById(report.userId);
          
          return {
            id: report.id,
            userId: report.userId,
            reporterEmail: reporter?.email || 'Unknown',
            reporterName: reporter?.name || 'Unknown',
            reporterPhone: reporter?.phone || 'Unknown',
            title: report.title,
            description: report.description,
            location: report.location,
            mediaType: report.mediaType,
            mediaUrl: report.mediaUrl,
            status: report.status,
            aiValidationResult: report.aiValidationResult,
            action: report.action,
            createdAt: report.createdAt,
            updatedAt: report.updatedAt
          };
        }),
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
          hasNext: skip + limitNum < total,
          hasPrev: pageNum > 1
        },
        unreadCount: total // For now, all reports are "unread"
      });

    } catch (error) {
      console.error('Get admin inbox error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  };

  /**
   * POST /api/admin/inbox/:id/acknowledge
   * Acknowledge a report (mark as processed)
   */
  acknowledgeReport = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      // Check if user is admin
      const userRole = req.headers['role'] as string;
      
      if (userRole !== 'admin') {
        res.status(403).json({
          success: false,
          error: 'Only admin can acknowledge reports'
        });
        return;
      }

      // Find report
      const report = MockDataService.getReportById(id);

      if (!report) {
        res.status(404).json({
          success: false,
          error: 'Report not found'
        });
        return;
      }

      // Update report status to processed
      report.status = 'processed' as any;
      report.updatedAt = new Date();

      // Get reporter info
      const reporter = MockDataService.getUserById(report.userId);

      console.log(`✅ Admin acknowledged report: ${report.title} (${id}) from ${reporter?.email}`);

      res.status(200).json({
        success: true,
        message: 'Report acknowledged successfully',
        report: {
          id: report.id,
          title: report.title,
          status: report.status,
          reporterEmail: reporter?.email || 'Unknown',
          reporterName: reporter?.name || 'Unknown',
          updatedAt: report.updatedAt
        }
      });

    } catch (error) {
      console.error('Acknowledge report error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  };
}
