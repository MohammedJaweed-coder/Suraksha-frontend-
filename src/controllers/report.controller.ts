import { Request, Response } from 'express';
import { MockDataService } from '../services/mockData.service';
import { MediaType } from '../data/models';
import { sendReportEmail } from '../services/email.service';
import { addToAdminInbox } from '../data/adminInbox';

export class ReportController {
  /**
   * POST /api/report
   * Submit a new report with image/video
   */
  submitReport = async (req: Request, res: Response): Promise<void> => {
    try {
      const { title, description, location, mediaType, mediaUrl, userId } = req.body;

      // Validate required fields
      if (!title || !description || !location || !mediaType || !mediaUrl || !userId) {
        res.status(400).json({
          success: false,
          error: 'All fields are required: title, description, location, mediaType, mediaUrl, userId'
        });
        return;
      }

      // Validate media type
      if (!Object.values(MediaType).includes(mediaType)) {
        res.status(400).json({
          success: false,
          error: 'Invalid media type. Must be "image" or "video"'
        });
        return;
      }

      // Validate location
      const { lat, lng } = location;
      if (typeof lat !== 'number' || typeof lng !== 'number') {
        res.status(400).json({
          success: false,
          error: 'Location must contain numeric lat and lng'
        });
        return;
      }

      // Create report with AI validation
      const report = MockDataService.createReport(
        userId,
        title,
        description,
        { lat, lng },
        mediaType,
        mediaUrl
      );

      console.log(`📝 New report submitted: ${title} by user ${userId}`);
      console.log(`🤖 AI Validation Result: ${report.aiValidationResult}`);

      // Log notification
      if (report.status === 'valid') {
        console.log('💰 Reward assigned: ₹50 voucher');
      } else if (report.status === 'invalid') {
        console.log('⚠️ Penalty assigned: ₹100 warning fine');
      }

      // Add report to admin inbox
      addToAdminInbox(report);

      // Send email notification to admin (non-blocking)
      // Email failure will not block the API response
      try {
        // Get user email for notification
        const user = MockDataService.getUserById(userId);
        await sendReportEmail(report, user?.email);
      } catch (emailError) {
        // Log email error but don't fail the request
        console.error('📧 Email notification failed:', emailError instanceof Error ? emailError.message : emailError);
      }

      res.status(201).json({
        success: true,
        message: 'Report submitted successfully',
        report: {
          id: report.id,
          title: report.title,
          status: report.status,
          aiValidationResult: report.aiValidationResult,
          action: report.action,
          createdAt: report.createdAt
        }
      });

    } catch (error) {
      console.error('Submit report error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  };

  /**
   * GET /api/my-reports
   * Get all reports for the current user
   */
  getMyReports = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.query;

      if (!userId) {
        res.status(400).json({
          success: false,
          error: 'User ID is required'
        });
        return;
      }

      const reports = MockDataService.getReportsByUserId(userId as string);

      res.status(200).json({
        success: true,
        reports: reports.map(report => ({
          id: report.id,
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
        }))
      });

    } catch (error) {
      console.error('Get my reports error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  };

  /**
   * GET /api/reports/:id
   * Get specific report by ID
   */
  getReportById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { userId } = req.query;

      if (!userId) {
        res.status(400).json({
          success: false,
          error: 'User ID is required'
        });
        return;
      }

      const reports = MockDataService.getReportsByUserId(userId as string);
      const report = reports.find(r => r.id === id);

      if (!report) {
        res.status(404).json({
          success: false,
          error: 'Report not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        report: {
          id: report.id,
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
        }
      });

    } catch (error) {
      console.error('Get report by ID error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  };

  /**
   * PATCH /api/report/:id/resolve
   * Mark report as resolved (Admin only)
   */
  resolveReport = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      // Check if user is admin
      const userRole = req.headers['role'] as string;
      
      if (userRole !== 'admin') {
        res.status(403).json({
          success: false,
          error: 'Only admin can resolve reports'
        });
        return;
      }

      // Find and resolve report
      const report = MockDataService.resolveReport(id);

      if (!report) {
        res.status(404).json({
          success: false,
          error: 'Report not found'
        });
        return;
      }

      console.log(`✅ Admin resolved report: ${report.title} (${id})`);

      res.status(200).json({
        success: true,
        message: 'Report marked as resolved',
        report: {
          id: report.id,
          title: report.title,
          status: report.status,
          updatedAt: report.updatedAt
        }
      });

    } catch (error) {
      console.error('Resolve report error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  };
}