import { v4 as uuidv4 } from 'uuid';
import { 
  mockIncidents, 
  mockUsers, 
  mockMedia, 
  Incident, 
  User, 
  Media, 
  IncidentType, 
  IncidentStatus,
  MediaType 
} from './mockData';

// In-memory storage (simulates database)
let incidents: Incident[] = [...mockIncidents];
let users: User[] = [...mockUsers];
let media: Media[] = [...mockMedia];

// Haversine formula to calculate distance between two points
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Simulate database delay
const delay = (ms: number = 300): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export class MockDb {
  // Incident operations
  static async getAllIncidents(): Promise<Incident[]> {
    await delay();
    return [...incidents];
  }

  static async getIncidentById(id: string): Promise<Incident | null> {
    await delay();
    return incidents.find(incident => incident.id === id) || null;
  }

  static async getIncidentsByType(type: IncidentType): Promise<Incident[]> {
    await delay();
    return incidents.filter(incident => incident.type === type);
  }

  static async getIncidentsNearLocation(
    lat: number, 
    lng: number, 
    radiusKm: number
  ): Promise<Incident[]> {
    await delay();
    return incidents.filter(incident => {
      const distance = calculateDistance(lat, lng, incident.latitude, incident.longitude);
      return distance <= radiusKm;
    });
  }

  static async addIncident(payload: Partial<Incident>): Promise<Incident> {
    await delay();
    const newIncident: Incident = {
      id: uuidv4(),
      type: payload.type || IncidentType.OTHER,
      status: IncidentStatus.PENDING,
      latitude: payload.latitude || 0,
      longitude: payload.longitude || 0,
      description: payload.description || undefined,
      batteryLevel: payload.batteryLevel,
      reportedAt: payload.reportedAt || new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: payload.userId
    };
    
    incidents.push(newIncident);
    return newIncident;
  }

  static async getHeatmapGeoJSON(
    lat: number, 
    lng: number, 
    radiusKm: number, 
    type: string = 'all'
  ): Promise<any> {
    await delay();
    
    let filteredIncidents = incidents;
    
    // Filter by location
    filteredIncidents = filteredIncidents.filter(incident => {
      const distance = calculateDistance(lat, lng, incident.latitude, incident.longitude);
      return distance <= radiusKm;
    });
    
    // Filter by type if specified
    if (type !== 'all') {
      const typeMap: { [key: string]: IncidentType } = {
        'DARK_SPOT': IncidentType.DARK_SPOT,
        'TRAFFIC': IncidentType.TRAFFIC_VIOLATION,
        'SOS': IncidentType.SOS,
        'PUBLIC_NUISANCE': IncidentType.PUBLIC_NUISANCE,
        'THEFT': IncidentType.THEFT,
        'OTHER': IncidentType.OTHER
      };
      const mappedType = typeMap[type];
      if (mappedType) {
        filteredIncidents = filteredIncidents.filter(incident => incident.type === mappedType);
      }
    }

    // Convert to GeoJSON FeatureCollection
    const features = filteredIncidents.map(incident => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [incident.longitude, incident.latitude] // [lng, lat] for GeoJSON
      },
      properties: {
        incidentId: incident.id,
        type: incident.type,
        status: incident.status,
        reportedAt: incident.reportedAt,
        description: incident.description,
        distanceMeters: Math.round(calculateDistance(lat, lng, incident.latitude, incident.longitude) * 1000)
      }
    }));

    return {
      type: 'FeatureCollection',
      features,
      metadata: {
        center: { latitude: lat, longitude: lng },
        radiusKm,
        type,
        totalIncidents: features.length,
        query: {
          timestamp: new Date().toISOString(),
          userId: 'mock-user'
        }
      }
    };
  }

  static async bulkUpsertIncidents(payloads: any[]): Promise<{
    processed: number;
    failed: number;
    errors: Array<{ payloadId: string; error: string; code: string }>;
  }> {
    await delay(500); // Longer delay for bulk operations
    
    let processed = 0;
    let failed = 0;
    const errors: Array<{ payloadId: string; error: string; code: string }> = [];

    for (const payload of payloads) {
      try {
        // Check for duplicate (idempotency)
        const existingIncident = incidents.find(incident => 
          incident.description?.includes(`SYNC_ID:${payload.id}`)
        );

        if (existingIncident) {
          processed++;
          continue;
        }

        // Map payload to incident
        const incidentData = payload.payload;
        const incidentType = payload.type === 'sos' ? IncidentType.SOS : 
                           payload.type === 'violation' ? this.mapViolationType(incidentData.violationType) :
                           IncidentType.OTHER;

        const newIncident: Incident = {
          id: uuidv4(),
          type: incidentType,
          status: IncidentStatus.PENDING,
          latitude: incidentData.latitude,
          longitude: incidentData.longitude,
          description: `${incidentData.description || 'Synced incident'} [SYNC_ID:${payload.id}]`,
          batteryLevel: incidentData.batteryLevel,
          reportedAt: new Date(payload.timestamp),
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: 'sync-user'
        };

        incidents.push(newIncident);
        processed++;
      } catch (error) {
        failed++;
        errors.push({
          payloadId: payload.id,
          error: error instanceof Error ? error.message : 'Unknown error',
          code: 'PROCESSING_ERROR'
        });
      }
    }

    return { processed, failed, errors };
  }

  private static mapViolationType(violationType: string): IncidentType {
    const typeMap: { [key: string]: IncidentType } = {
      'TRAFFIC': IncidentType.TRAFFIC_VIOLATION,
      'PUBLIC_NUISANCE': IncidentType.PUBLIC_NUISANCE,
      'DARK_SPOT': IncidentType.DARK_SPOT,
      'THEFT': IncidentType.THEFT,
      'OTHER': IncidentType.OTHER
    };
    return typeMap[violationType] || IncidentType.OTHER;
  }

  // User operations
  static async getAllUsers(): Promise<User[]> {
    await delay();
    return [...users];
  }

  static async getUserById(id: string): Promise<User | null> {
    await delay();
    return users.find(user => user.id === id) || null;
  }

  static async getUserByEmail(email: string): Promise<User | null> {
    await delay();
    return users.find(user => user.email === email) || null;
  }

  static async createUser(userData: Partial<User>): Promise<User> {
    await delay();
    const newUser: User = {
      id: uuidv4(),
      email: userData.email || '',
      phoneNumber: userData.phoneNumber || undefined,
      firstName: userData.firstName || undefined,
      lastName: userData.lastName || undefined,
      isVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLoginAt: userData.lastLoginAt
    };
    
    users.push(newUser);
    return newUser;
  }

  // Media operations
  static async getAllMedia(): Promise<Media[]> {
    await delay();
    return [...media];
  }

  static async getMediaById(id: string): Promise<Media | null> {
    await delay();
    return media.find(m => m.id === id) || null;
  }

  static async getMediaByIncidentId(incidentId: string): Promise<Media[]> {
    await delay();
    return media.filter(m => m.incidentId === incidentId);
  }

  static async addMedia(mediaData: Partial<Media>): Promise<Media> {
    await delay();
    const newMedia: Media = {
      id: uuidv4(),
      fileName: mediaData.fileName,
      originalName: mediaData.originalName,
      mimeType: mediaData.mimeType,
      fileSize: mediaData.fileSize,
      mediaType: mediaData.mediaType || MediaType.IMAGE,
      s3Key: mediaData.s3Key || `mock/${Date.now()}.jpg`,
      s3Bucket: 'suraksha-media-mock',
      s3Region: 'auto',
      fileHash: mediaData.fileHash || this.generateFakeHash(),
      uploadedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      incidentId: mediaData.incidentId || ''
    };
    
    media.push(newMedia);
    return newMedia;
  }

  private static generateFakeHash(): string {
    return Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  }

  // Statistics operations
  static async getIncidentStats(lat: number, lng: number, radiusKm: number): Promise<any> {
    await delay();
    
    const nearbyIncidents = await this.getIncidentsNearLocation(lat, lng, radiusKm);
    
    // Group by type and status
    const typeStats: { [key: string]: { [key: string]: number } } = {};
    let totalIncidents = 0;

    nearbyIncidents.forEach(incident => {
      if (!typeStats[incident.type]) {
        typeStats[incident.type] = {};
      }
      if (!typeStats[incident.type][incident.status]) {
        typeStats[incident.type][incident.status] = 0;
      }
      typeStats[incident.type][incident.status]++;
      totalIncidents++;
    });

    // Generate time-based stats (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentIncidents = nearbyIncidents.filter(incident => 
      incident.reportedAt >= thirtyDaysAgo
    );

    const timeStats = this.groupIncidentsByDate(recentIncidents);

    return {
      region: {
        center: { latitude: lat, longitude: lng },
        radiusKm
      },
      statistics: {
        total: totalIncidents,
        byType: typeStats,
        last30Days: timeStats
      },
      generatedAt: new Date().toISOString()
    };
  }

  private static groupIncidentsByDate(incidents: Incident[]): Array<{ date: string; count: number }> {
    const dateGroups: { [key: string]: number } = {};
    
    incidents.forEach(incident => {
      const date = incident.reportedAt.toISOString().split('T')[0];
      dateGroups[date] = (dateGroups[date] || 0) + 1;
    });

    return Object.entries(dateGroups)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 30);
  }

  // Dark spots analysis
  static async getDarkSpots(lat: number, lng: number, radiusKm: number): Promise<any> {
    await delay();
    
    const nearbyIncidents = await this.getIncidentsNearLocation(lat, lng, radiusKm);
    
    // Simple clustering by proximity (0.01 degree ~ 1km)
    const clusters: { [key: string]: Incident[] } = {};
    const clusterRadius = 0.01; // degrees
    
    nearbyIncidents.forEach(incident => {
      const clusterKey = `${Math.round(incident.latitude / clusterRadius)}_${Math.round(incident.longitude / clusterRadius)}`;
      if (!clusters[clusterKey]) {
        clusters[clusterKey] = [];
      }
      clusters[clusterKey].push(incident);
    });

    // Filter clusters with 3+ incidents (dark spots)
    const darkSpots = Object.entries(clusters)
      .filter(([_, incidents]) => incidents.length >= 3)
      .map(([clusterId, clusterIncidents]) => {
        const avgLat = clusterIncidents.reduce((sum, inc) => sum + inc.latitude, 0) / clusterIncidents.length;
        const avgLng = clusterIncidents.reduce((sum, inc) => sum + inc.longitude, 0) / clusterIncidents.length;
        const incidentTypes = [...new Set(clusterIncidents.map(inc => inc.type))];
        
        return {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [avgLng, avgLat]
          },
          properties: {
            clusterId,
            incidentCount: clusterIncidents.length,
            riskLevel: clusterIncidents.length >= 10 ? 'HIGH' : 
                      clusterIncidents.length >= 5 ? 'MEDIUM' : 'LOW',
            incidentTypes,
            radius: Math.min(clusterIncidents.length * 50, 500)
          }
        };
      });

    return {
      type: 'FeatureCollection',
      features: darkSpots,
      metadata: {
        center: { latitude: lat, longitude: lng },
        radiusKm,
        totalDarkSpots: darkSpots.length,
        analysisWindow: '90 days',
        generatedAt: new Date().toISOString()
      }
    };
  }

  // Sync status
  static async getSyncStatus(): Promise<any> {
    await delay();
    
    const last24Hours = new Date();
    last24Hours.setHours(last24Hours.getHours() - 24);
    
    const recentSyncedIncidents = incidents.filter(incident => 
      incident.description?.includes('SYNC_ID:') && 
      incident.createdAt >= last24Hours
    );

    const byType = recentSyncedIncidents.reduce((acc: any, incident) => {
      acc[incident.type] = (acc[incident.type] || 0) + 1;
      return acc;
    }, {});

    return {
      status: 'operational',
      timestamp: new Date().toISOString(),
      statistics: {
        last24Hours: {
          totalSynced: recentSyncedIncidents.length,
          byType
        },
        systemStatus: {
          database: 'connected',
          storage: 'connected',
          lastSync: recentSyncedIncidents[0]?.createdAt || null
        },
        performance: {
          averageProcessingTime: '< 1s',
          successRate: '98.5%'
        }
      }
    };
  }
}