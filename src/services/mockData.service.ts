import { v4 as uuidv4 } from 'uuid';
import {
  User,
  UserRole,
  Report,
  ReportStatus,
  MediaType,
  ActionType,
  SOSAlert,
  SOSStatus,
  CCTVFeed,
  CrowdDensity,
  RiskLevel,
  Notification,
  inMemoryStorage
} from '../data/models';

export class MockDataService {
  // Initialize mock data
  static initializeMockData(): void {
    console.log('📊 Initializing mock data for Suraksha.ai...');

    // Clear existing data
    inMemoryStorage.users = [];
    inMemoryStorage.reports = [];
    inMemoryStorage.sosAlerts = [];
    inMemoryStorage.cctvFeeds = [];
    inMemoryStorage.notifications = [];

    // Create admin user with fixed ID
    const adminUser: User = {
      id: 'admin-user-001',
      email: 'admin@suraksha.ai',
      password: '123456', // ✅ Admin password
      role: UserRole.ADMIN,
      name: 'Police Admin',
      phone: '+919876543210',
      createdAt: new Date(),
      lastLoginAt: new Date()
    };
    inMemoryStorage.users.push(adminUser);

    // Create citizen users with fixed IDs
    const citizenUsers: User[] = [
      {
        id: 'citizen-user-001',
        email: 'rajesh.kumar@example.com',
        password: '123456', // ✅ Test user password
        role: UserRole.CITIZEN,
        name: 'Rajesh Kumar',
        phone: '+919876543210',
        createdAt: new Date('2024-01-14T08:00:00Z'),
        lastLoginAt: new Date('2024-01-19T10:15:00Z')
      },
      {
        id: 'citizen-user-002',
        email: 'rahul.sharma@example.com',
        password: '123456', // ✅ Citizen password
        role: UserRole.CITIZEN,
        name: 'Rahul Sharma',
        phone: '+919876543211',
        createdAt: new Date('2024-01-15T10:30:00Z'),
        lastLoginAt: new Date('2024-01-20T14:22:00Z')
      },
      {
        id: 'citizen-user-003',
        email: 'priya.patel@example.com',
        password: '123456', // ✅ Citizen password
        role: UserRole.CITIZEN,
        name: 'Priya Patel',
        phone: '+919876543212',
        createdAt: new Date('2024-01-16T09:15:00Z'),
        lastLoginAt: new Date('2024-01-21T11:45:00Z')
      },
      {
        id: 'citizen-user-004',
        email: 'amit.kumar@example.com',
        password: '123456', // ✅ Citizen password
        role: UserRole.CITIZEN,
        name: 'Amit Kumar',
        phone: '+919876543213',
        createdAt: new Date('2024-01-17T16:20:00Z')
      }
    ];
    inMemoryStorage.users.push(...citizenUsers);

    // Create sample reports
    const sampleReports: Report[] = [
      {
        id: uuidv4(),
        userId: citizenUsers[0].id,
        title: 'Illegal Parking on MG Road',
        description: 'Multiple vehicles parked illegally blocking traffic flow on MG Road near Brigade Road junction',
        location: { lat: 12.9757, lng: 77.6011 },
        mediaType: MediaType.IMAGE,
        mediaUrl: 'https://mock.suraksha.ai/media/illegal_parking_mg_road.jpg',
        status: ReportStatus.VALID,
        aiValidationResult: 'VALID: Media exists and description length > 20',
        action: {
          type: ActionType.REWARD,
          value: '₹50 voucher'
        },
        createdAt: new Date('2024-01-20T09:30:00Z'),
        updatedAt: new Date('2024-01-20T09:35:00Z')
      },
      {
        id: uuidv4(),
        userId: citizenUsers[1].id,
        title: 'Traffic Violation',
        description: 'Red light jumping at Silk Board junction',
        location: { lat: 12.9176, lng: 77.6237 },
        mediaType: MediaType.VIDEO,
        mediaUrl: 'https://mock.suraksha.ai/media/red_light_violation.mp4',
        status: ReportStatus.VALID,
        aiValidationResult: 'VALID: Media exists and description length > 20',
        action: {
          type: ActionType.REWARD,
          value: '₹50 voucher'
        },
        createdAt: new Date('2024-01-19T17:45:00Z'),
        updatedAt: new Date('2024-01-19T17:50:00Z')
      },
      {
        id: uuidv4(),
        userId: citizenUsers[2].id,
        title: 'Suspicious Activity',
        description: 'Short desc',
        location: { lat: 12.9352, lng: 77.6245 },
        mediaType: MediaType.IMAGE,
        mediaUrl: 'https://mock.suraksha.ai/media/suspicious.jpg',
        status: ReportStatus.INVALID,
        aiValidationResult: 'INVALID: Description too short (< 20 chars)',
        action: {
          type: ActionType.PENALTY,
          value: '₹100 warning fine'
        },
        createdAt: new Date('2024-01-18T14:20:00Z'),
        updatedAt: new Date('2024-01-18T14:25:00Z')
      },
      {
        id: uuidv4(),
        userId: citizenUsers[0].id,
        title: 'Dark Spot - No Street Lights',
        description: 'Complete darkness in Koramangala 5th Block alley, posing safety risk for pedestrians at night',
        location: { lat: 12.9352, lng: 77.6245 },
        mediaType: MediaType.VIDEO,
        mediaUrl: 'https://mock.suraksha.ai/media/dark_spot_koramangala.mp4',
        status: ReportStatus.PENDING,
        createdAt: new Date('2024-01-22T20:15:00Z'),
        updatedAt: new Date('2024-01-22T20:15:00Z')
      }
    ];
    inMemoryStorage.reports.push(...sampleReports);

    // Create active SOS alerts
    const activeSOSAlerts: SOSAlert[] = [
      {
        id: uuidv4(),
        userId: citizenUsers[0].id,
        location: { lat: 12.9784, lng: 77.6408 },
        status: SOSStatus.ACTIVE,
        createdAt: new Date('2024-01-22T21:30:00Z')
      },
      {
        id: uuidv4(),
        userId: citizenUsers[1].id,
        location: { lat: 12.9698, lng: 77.7499 },
        status: SOSStatus.ACTIVE,
        createdAt: new Date('2024-01-22T20:45:00Z')
      }
    ];
    inMemoryStorage.sosAlerts.push(...activeSOSAlerts);

    // Create CCTV feeds
    const cctvFeeds: CCTVFeed[] = [
      {
        id: uuidv4(),
        location: 'MG Road',
        lat: 12.9757,
        lng: 77.6011,
        crowdDensity: CrowdDensity.HIGH,
        riskLevel: RiskLevel.HIGH,
        lastUpdated: new Date()
      },
      {
        id: uuidv4(),
        location: 'Indiranagar',
        lat: 12.9784,
        lng: 77.6408,
        crowdDensity: CrowdDensity.MEDIUM,
        riskLevel: RiskLevel.MEDIUM,
        lastUpdated: new Date()
      },
      {
        id: uuidv4(),
        location: 'Koramangala',
        lat: 12.9352,
        lng: 77.6245,
        crowdDensity: CrowdDensity.LOW,
        riskLevel: RiskLevel.LOW,
        lastUpdated: new Date()
      },
      {
        id: uuidv4(),
        location: 'Whitefield',
        lat: 12.9698,
        lng: 77.7499,
        crowdDensity: CrowdDensity.HIGH,
        riskLevel: RiskLevel.HIGH,
        lastUpdated: new Date()
      }
    ];
    inMemoryStorage.cctvFeeds.push(...cctvFeeds);

    // Create notifications
    const notifications: Notification[] = [
      {
        id: uuidv4(),
        userId: adminUser.id,
        type: 'sos',
        message: 'SOS triggered at MG Road (12.9757, 77.6011)',
        read: false,
        createdAt: new Date('2024-01-22T21:30:00Z')
      },
      {
        id: uuidv4(),
        userId: adminUser.id,
        type: 'report_valid',
        message: 'Report "Illegal Parking on MG Road" marked as VALID',
        read: true,
        createdAt: new Date('2024-01-20T09:35:00Z')
      },
      {
        id: uuidv4(),
        userId: adminUser.id,
        type: 'crowd_high',
        message: 'High crowd density detected at Whitefield',
        read: false,
        createdAt: new Date('2024-01-22T20:00:00Z')
      }
    ];
    inMemoryStorage.notifications.push(...notifications);

    console.log('✅ Mock data initialized:', {
      users: inMemoryStorage.users.length,
      reports: inMemoryStorage.reports.length,
      sosAlerts: inMemoryStorage.sosAlerts.length,
      cctvFeeds: inMemoryStorage.cctvFeeds.length,
      notifications: inMemoryStorage.notifications.length
    });
  }

  // Get user by email
  static getUserByEmail(email: string): User | undefined {
    return inMemoryStorage.users.find(user => user.email === email);
  }

  // Get user by ID
  static getUserById(id: string): User | undefined {
    return inMemoryStorage.users.find(user => user.id === id);
  }

  // Create new user (citizen)
  static createCitizenUser(email: string, password?: string, name?: string, phone?: string): User {
    const newUser: User = {
      id: uuidv4(),
      email,
      password: password || '123456', // ✅ Default password for new citizens
      role: UserRole.CITIZEN,
      name,
      phone,
      createdAt: new Date(),
      lastLoginAt: new Date()
    };
    inMemoryStorage.users.push(newUser);
    return newUser;
  }

  // Create new report
  static createReport(
    userId: string,
    title: string,
    description: string,
    location: { lat: number; lng: number },
    mediaType: MediaType,
    mediaUrl: string
  ): Report {
    // AI Validation Logic
    let status: ReportStatus = ReportStatus.PENDING;
    let aiValidationResult = '';
    let action: { type: ActionType; value: string } | undefined;

    if (mediaUrl && description.length > 20) {
      status = ReportStatus.VALID;
      aiValidationResult = 'VALID: Media exists and description length > 20';
      action = {
        type: ActionType.REWARD,
        value: '₹50 voucher'
      };
      
      // Create notification for admin
      const adminUser = inMemoryStorage.users.find(u => u.role === UserRole.ADMIN);
      if (adminUser) {
        const notification: Notification = {
          id: uuidv4(),
          userId: adminUser.id,
          type: 'report_valid',
          message: `Report "${title}" marked as VALID`,
          read: false,
          createdAt: new Date()
        };
        inMemoryStorage.notifications.push(notification);
      }
    } else {
      status = ReportStatus.INVALID;
      aiValidationResult = 'INVALID: ' + 
        (!mediaUrl ? 'No media provided' : '') +
        (description.length <= 20 ? 'Description too short (< 20 chars)' : '');
      action = {
        type: ActionType.PENALTY,
        value: '₹100 warning fine'
      };
    }

    const newReport: Report = {
      id: uuidv4(),
      userId,
      title,
      description,
      location,
      mediaType,
      mediaUrl,
      status,
      aiValidationResult,
      action,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    inMemoryStorage.reports.push(newReport);
    return newReport;
  }

  // Get reports by user ID
  static getReportsByUserId(userId: string): Report[] {
    return inMemoryStorage.reports.filter(report => report.userId === userId);
  }

  // Get all reports
  static getAllReports(): Report[] {
    return [...inMemoryStorage.reports];
  }

  // Create SOS alert
  static createSOSAlert(userId: string, location: { lat: number; lng: number }): SOSAlert {
    const newSOS: SOSAlert = {
      id: uuidv4(),
      userId,
      location,
      status: SOSStatus.ACTIVE,
      createdAt: new Date()
    };

    inMemoryStorage.sosAlerts.push(newSOS);

    // Create notification for admin
    const adminUser = inMemoryStorage.users.find(u => u.role === UserRole.ADMIN);
    if (adminUser) {
      const notification: Notification = {
        id: uuidv4(),
        userId: adminUser.id,
        type: 'sos',
        message: `SOS triggered at ${location.lat}, ${location.lng}`,
        read: false,
        createdAt: new Date()
      };
      inMemoryStorage.notifications.push(notification);
    }

    // Log SOS alert
    console.log(`🚨 ALERT: SOS triggered at [${location.lat}, ${location.lng}]`);

    return newSOS;
  }

  // Get active SOS alerts
  static getActiveSOSAlerts(): SOSAlert[] {
    return inMemoryStorage.sosAlerts.filter(alert => alert.status === SOSStatus.ACTIVE);
  }

  // Resolve SOS alert
  static resolveSOSAlert(sosId: string): SOSAlert | null {
    const sosAlert = inMemoryStorage.sosAlerts.find(alert => alert.id === sosId);
    if (sosAlert) {
      sosAlert.status = SOSStatus.RESOLVED;
      sosAlert.resolvedAt = new Date();
      return sosAlert;
    }
    return null;
  }

  // Get CCTV feeds
  static getCCTVFeeds(): CCTVFeed[] {
    return [...inMemoryStorage.cctvFeeds];
  }

  // Update CCTV feed crowd density
  static updateCCTVCrowdDensity(feedId: string, crowdDensity: CrowdDensity): CCTVFeed | null {
    const feed = inMemoryStorage.cctvFeeds.find(f => f.id === feedId);
    if (feed) {
      feed.crowdDensity = crowdDensity;
      feed.riskLevel = this.calculateRiskLevel(crowdDensity);
      feed.lastUpdated = new Date();

      // Create notification if crowd density is high
      if (crowdDensity === CrowdDensity.HIGH) {
        const adminUser = inMemoryStorage.users.find(u => u.role === UserRole.ADMIN);
        if (adminUser) {
          const notification: Notification = {
            id: uuidv4(),
            userId: adminUser.id,
            type: 'crowd_high',
            message: `High crowd density detected at ${feed.location}`,
            read: false,
            createdAt: new Date()
          };
          inMemoryStorage.notifications.push(notification);
          console.log(`📢 Notification sent to Police Control Room: High crowd at ${feed.location}`);
        }
      }

      return feed;
    }
    return null;
  }

  // Calculate risk level based on crowd density
  private static calculateRiskLevel(crowdDensity: CrowdDensity): RiskLevel {
    switch (crowdDensity) {
      case CrowdDensity.HIGH:
        return RiskLevel.HIGH;
      case CrowdDensity.MEDIUM:
        return RiskLevel.MEDIUM;
      case CrowdDensity.LOW:
        return RiskLevel.LOW;
    }
  }

  // Get dashboard statistics
  static getDashboardStats() {
    const totalReports = inMemoryStorage.reports.length;
    const validReports = inMemoryStorage.reports.filter(r => r.status === ReportStatus.VALID).length;
    const invalidReports = inMemoryStorage.reports.filter(r => r.status === ReportStatus.INVALID).length;
    const activeSOSAlerts = inMemoryStorage.sosAlerts.filter(a => a.status === SOSStatus.ACTIVE).length;

    return {
      totalReports,
      validReports,
      invalidReports,
      activeSOSAlerts,
      totalUsers: inMemoryStorage.users.length,
      totalCCTVFeeds: inMemoryStorage.cctvFeeds.length
    };
  }

  // Calculate safe route
  static calculateRoute(
    source: { lat: number; lng: number },
    destination: { lat: number; lng: number }
  ) {
    // Mock route calculation
    const baseDistance = this.calculateDistance(source, destination);
    
    const routes = [
      {
        type: 'safest' as const,
        distance: baseDistance * 1.2, // 20% longer but safer
        time: Math.round(baseDistance * 1.2 * 3), // 3 min per km
        safetyScore: 9,
        waypoints: [
          source,
          { lat: (source.lat + destination.lat) / 2, lng: (source.lng + destination.lng) / 2 },
          destination
        ]
      },
      {
        type: 'balanced' as const,
        distance: baseDistance,
        time: Math.round(baseDistance * 2.5), // 2.5 min per km
        safetyScore: 7,
        waypoints: [source, destination]
      },
      {
        type: 'fastest' as const,
        distance: baseDistance * 0.9, // 10% shorter
        time: Math.round(baseDistance * 0.9 * 2), // 2 min per km
        safetyScore: 5,
        waypoints: [source, destination]
      }
    ];

    return routes;
  }

  // Calculate distance between two points (Haversine formula simplified)
  private static calculateDistance(
    point1: { lat: number; lng: number },
    point2: { lat: number; lng: number }
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = (point2.lat - point1.lat) * Math.PI / 180;
    const dLng = (point2.lng - point1.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  // Get notifications for user
  static getNotificationsByUserId(userId: string): Notification[] {
    return inMemoryStorage.notifications.filter(n => n.userId === userId);
  }

  // Mark notification as read
  static markNotificationAsRead(notificationId: string): Notification | null {
    const notification = inMemoryStorage.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      return notification;
    }
    return null;
  }

  // Get report by ID
  static getReportById(reportId: string): Report | null {
    return inMemoryStorage.reports.find(r => r.id === reportId) || null;
  }

  // Mark report as resolved (admin only)
  static resolveReport(reportId: string): Report | null {
    const report = inMemoryStorage.reports.find(r => r.id === reportId);
    if (report) {
      report.status = ReportStatus.RESOLVED;
      report.updatedAt = new Date();
      
      console.log(`✅ Report ${reportId} marked as resolved`);
      
      return report;
    }
    return null;
  }
}