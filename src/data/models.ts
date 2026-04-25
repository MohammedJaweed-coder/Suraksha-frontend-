// uuidv4 is used in mockData.service.ts

// User Roles
export enum UserRole {
  CITIZEN = 'citizen',
  ADMIN = 'admin'
}

// Report Status
export enum ReportStatus {
  PENDING = 'pending',
  VALID = 'valid',
  INVALID = 'invalid',
  RESOLVED = 'resolved',
  PROCESSED = 'processed'
}

// Media Types
export enum MediaType {
  IMAGE = 'image',
  VIDEO = 'video'
}

// Reward/Penalty Types
export enum ActionType {
  REWARD = 'reward',
  PENALTY = 'penalty'
}

// SOS Status
export enum SOSStatus {
  ACTIVE = 'active',
  RESOLVED = 'resolved'
}

// Crowd Density Levels
export enum CrowdDensity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

// Risk Levels
export enum RiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

// Route Types
export enum RouteType {
  SAFEST = 'safest',
  BALANCED = 'balanced',
  FASTEST = 'fastest'
}

// User Model
export interface User {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
  phone?: string;
  password?: string; // ✅ Added for dummy backend authentication
  createdAt: Date;
  lastLoginAt?: Date;
}

// Report Model
export interface Report {
  id: string;
  userId: string;
  title: string;
  description: string;
  location: {
    lat: number;
    lng: number;
  };
  mediaType: MediaType;
  mediaUrl: string;
  status: ReportStatus;
  aiValidationResult?: string;
  action?: {
    type: ActionType;
    value: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

// SOS Alert Model
export interface SOSAlert {
  id: string;
  userId: string;
  location: {
    lat: number;
    lng: number;
  };
  status: SOSStatus;
  createdAt: Date;
  resolvedAt?: Date;
}

// CCTV Feed Model
export interface CCTVFeed {
  id: string;
  location: string;
  lat: number;
  lng: number;
  crowdDensity: CrowdDensity;
  riskLevel: RiskLevel;
  lastUpdated: Date;
}

// Route Model
export interface Route {
  type: RouteType;
  distance: number; // in km
  time: number; // in minutes
  safetyScore: number; // 1-10
  waypoints: Array<{
    lat: number;
    lng: number;
  }>;
}

// Notification Model
export interface Notification {
  id: string;
  userId: string;
  type: 'sos' | 'report_valid' | 'crowd_high';
  message: string;
  read: boolean;
  createdAt: Date;
}

// In-memory storage
export const inMemoryStorage = {
  users: [] as User[],
  reports: [] as Report[],
  sosAlerts: [] as SOSAlert[],
  cctvFeeds: [] as CCTVFeed[],
  notifications: [] as Notification[]
};