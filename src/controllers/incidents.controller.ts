import { Request, Response } from 'express';
import { MockDb } from '../data/mockDb';
import { IncidentType } from '../data/mockData';
import { AppError } from '../middleware/error.middleware';
import { incidentCreateSchema } from '../validators/incident.validator';

export class IncidentsController {
  /**
   * Create new incident report
   * POST /api/v1/incidents
   */
  createIncident = async (req: Request, res: Response): Promise<void> => {
    try {
      // Validate request body
      const validatedData = incidentCreateSchema.parse(req.body);

      const incident = await MockDb.addIncident({
        type: validatedData.type as IncidentType,
        latitude: validatedData.latitude,
        longitude: validatedData.longitude,
        description: validatedData.description,
        batteryLevel: validatedData.batteryLevel,
        userId: req.userId
      });

      console.log('📝 NEW INCIDENT CREATED:', {
        incidentId: incident.id,
        type: incident.type,
        location: `${incident.latitude}, ${incident.longitude}`,
        userId: req.userId || 'anonymous',
        timestamp: new Date().toISOString(),
      });

      res.status(201).json({
        id: incident.id,
        type: incident.type,
        status: incident.status,
        latitude: incident.latitude,
        longitude: incident.longitude,
        description: incident.description,
        batteryLevel: incident.batteryLevel,
        reportedAt: incident.reportedAt,
        createdAt: incident.createdAt,
      });
    } catch (error) {
      throw error;
    }
  };

  /**
   * Get all incidents for the authenticated user
   * GET /api/v1/incidents
   */
  getUserIncidents = async (req: Request, res: Response): Promise<void> => {
    try {
      const page = parseInt(req.query['page'] as string) || 1;
      const limit = parseInt(req.query['limit'] as string) || 10;
      const type = req.query['type'] as string;

      let incidents = await MockDb.getAllIncidents();

      // Filter by user if authenticated
      if (req.userId) {
        incidents = incidents.filter(incident => incident.userId === req.userId);
      }

      // Filter by type if specified
      if (type && type !== 'all') {
        incidents = incidents.filter(incident => incident.type === type);
      }

      // Sort by most recent first
      incidents.sort((a, b) => b.reportedAt.getTime() - a.reportedAt.getTime());

      // Paginate
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedIncidents = incidents.slice(startIndex, endIndex);

      // Get media for each incident
      const incidentsWithMedia = await Promise.all(
        paginatedIncidents.map(async (incident) => {
          const mediaFiles = await MockDb.getMediaByIncidentId(incident.id);
          return {
            ...incident,
            media: mediaFiles.map(media => ({
              id: media.id,
              fileName: media.fileName,
              mediaType: media.mediaType,
              url: `https://mock.suraksha.ai/media/${media.s3Key}`,
              uploadedAt: media.uploadedAt,
            })),
          };
        })
      );

      res.status(200).json({
        incidents: incidentsWithMedia,
        pagination: {
          page,
          limit,
          total: incidents.length,
          totalPages: Math.ceil(incidents.length / limit),
          hasNext: endIndex < incidents.length,
          hasPrev: page > 1,
        },
      });
    } catch (error) {
      throw error;
    }
  };

  /**
   * Get incident by ID
   * GET /api/v1/incidents/:id
   */
  getIncidentById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const incident = await MockDb.getIncidentById(id);
      if (!incident) {
        throw new AppError('Incident not found', 404, 'INCIDENT_NOT_FOUND');
      }

      // Get associated media
      const mediaFiles = await MockDb.getMediaByIncidentId(incident.id);

      const response = {
        ...incident,
        media: mediaFiles.map(media => ({
          id: media.id,
          fileName: media.fileName,
          mediaType: media.mediaType,
          url: `https://mock.suraksha.ai/media/${media.s3Key}`,
          fileHash: media.fileHash,
          uploadedAt: media.uploadedAt,
        })),
      };

      res.status(200).json(response);
    } catch (error) {
      throw error;
    }
  };

  /**
   * Update incident status
   * PATCH /api/v1/incidents/:id/status
   */
  updateIncidentStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const incident = await MockDb.getIncidentById(id);
      if (!incident) {
        throw new AppError('Incident not found', 404, 'INCIDENT_NOT_FOUND');
      }

      // In a real implementation, you'd update the incident status
      // For mock, we'll just return the updated incident
      const updatedIncident = {
        ...incident,
        status,
        updatedAt: new Date(),
      };

      console.log('📊 INCIDENT STATUS UPDATED:', {
        incidentId: id,
        oldStatus: incident.status,
        newStatus: status,
        timestamp: new Date().toISOString(),
      });

      res.status(200).json(updatedIncident);
    } catch (error) {
      throw error;
    }
  };

  /**
   * Get nearby incidents
   * GET /api/v1/incidents/nearby
   */
  getNearbyIncidents = async (req: Request, res: Response): Promise<void> => {
    try {
      const lat = parseFloat(req.query['lat'] as string);
      const lng = parseFloat(req.query['lng'] as string);
      const radiusKm = parseInt(req.query['radiusKm'] as string) || 5;
      const type = req.query['type'] as string;

      if (isNaN(lat) || isNaN(lng)) {
        throw new AppError('Invalid latitude or longitude', 400, 'INVALID_COORDINATES');
      }

      let incidents = await MockDb.getIncidentsNearLocation(lat, lng, radiusKm);

      // Filter by type if specified
      if (type && type !== 'all') {
        incidents = incidents.filter(incident => incident.type === type);
      }

      // Sort by most recent first
      incidents.sort((a, b) => b.reportedAt.getTime() - a.reportedAt.getTime());

      // Limit to 50 results
      incidents = incidents.slice(0, 50);

      console.log('🗺️ NEARBY INCIDENTS QUERY:', {
        center: `${lat}, ${lng}`,
        radiusKm,
        type: type || 'all',
        resultsCount: incidents.length,
        timestamp: new Date().toISOString(),
        userId: req.userId || 'anonymous',
      });

      res.status(200).json({
        incidents,
        query: {
          center: { latitude: lat, longitude: lng },
          radiusKm,
          type: type || 'all',
        },
        totalResults: incidents.length,
      });
    } catch (error) {
      throw error;
    }
  };
}