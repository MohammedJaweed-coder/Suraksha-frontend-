import { v4 as uuidv4 } from 'uuid';

export enum IncidentType {
  SOS = 'SOS',
  TRAFFIC_VIOLATION = 'TRAFFIC_VIOLATION',
  PUBLIC_NUISANCE = 'PUBLIC_NUISANCE',
  DARK_SPOT = 'DARK_SPOT',
  THEFT = 'THEFT',
  OTHER = 'OTHER'
}

export enum IncidentStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED'
}

export enum MediaType {
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  AUDIO = 'AUDIO'
}

export interface User {
  id: string;
  email: string;
  phoneNumber?: string;
  firstName?: string;
  lastName?: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

export interface Incident {
  id: string;
  type: IncidentType;
  status: IncidentStatus;
  latitude: number;
  longitude: number;
  description?: string;
  batteryLevel?: number;
  reportedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  userId?: string;
}

export interface Media {
  id: string;
  fileName?: string;
  originalName?: string;
  mimeType?: string;
  fileSize?: number;
  mediaType: MediaType;
  s3Key: string;
  s3Bucket: string;
  s3Region?: string;
  fileHash: string;
  uploadedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  incidentId: string;
}

// Helper function to add random offset to coordinates
const addRandomOffset = (coord: number, range: number = 0.003): number => {
  return coord + (Math.random() - 0.5) * 2 * range;
};

// Helper function to generate dates within last 7 days
const getRandomRecentDate = (): Date => {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const randomTime = sevenDaysAgo.getTime() + Math.random() * (now.getTime() - sevenDaysAgo.getTime());
  return new Date(randomTime);
};

// Generate fake SHA-256 hash
const generateFakeHash = (): string => {
  return Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
};

// Mock Users
export const mockUsers: User[] = [
  {
    id: uuidv4(),
    email: 'john.doe@example.com',
    phoneNumber: '+919876543210',
    firstName: 'John',
    lastName: 'Doe',
    isVerified: true,
    createdAt: new Date('2024-01-15T10:30:00Z'),
    updatedAt: new Date('2024-01-15T10:30:00Z'),
    lastLoginAt: new Date('2024-01-20T14:22:00Z')
  },
  {
    id: uuidv4(),
    email: 'priya.sharma@example.com',
    phoneNumber: '+919876543211',
    firstName: 'Priya',
    lastName: 'Sharma',
    isVerified: true,
    createdAt: new Date('2024-01-16T09:15:00Z'),
    updatedAt: new Date('2024-01-16T09:15:00Z'),
    lastLoginAt: new Date('2024-01-21T11:45:00Z')
  },
  {
    id: uuidv4(),
    email: 'rajesh.kumar@example.com',
    phoneNumber: '+919876543212',
    firstName: 'Rajesh',
    lastName: 'Kumar',
    isVerified: false,
    createdAt: new Date('2024-01-17T16:20:00Z'),
    updatedAt: new Date('2024-01-17T16:20:00Z')
  }
];

// Mock Incidents with Bengaluru coordinates
export const mockIncidents: Incident[] = [
  // 4 DARK_SPOT around Koramangala (12.9352, 77.6245)
  {
    id: uuidv4(),
    type: IncidentType.DARK_SPOT,
    status: IncidentStatus.PENDING,
    latitude: addRandomOffset(12.9352),
    longitude: addRandomOffset(77.6245),
    description: 'Poor street lighting near Koramangala 5th Block',
    reportedAt: getRandomRecentDate(),
    createdAt: getRandomRecentDate(),
    updatedAt: getRandomRecentDate(),
    userId: mockUsers[0]?.id
  },
  {
    id: uuidv4(),
    type: IncidentType.DARK_SPOT,
    status: IncidentStatus.PENDING,
    latitude: addRandomOffset(12.9352),
    longitude: addRandomOffset(77.6245),
    description: 'Broken street lights on 80 Feet Road',
    reportedAt: getRandomRecentDate(),
    createdAt: getRandomRecentDate(),
    updatedAt: getRandomRecentDate(),
    userId: mockUsers[1]?.id
  },
  {
    id: uuidv4(),
    type: IncidentType.DARK_SPOT,
    status: IncidentStatus.IN_PROGRESS,
    latitude: addRandomOffset(12.9352),
    longitude: addRandomOffset(77.6245),
    description: 'Dark alley behind Forum Mall needs lighting',
    reportedAt: getRandomRecentDate(),
    createdAt: getRandomRecentDate(),
    updatedAt: getRandomRecentDate(),
    userId: mockUsers[0]?.id
  },
  {
    id: uuidv4(),
    type: IncidentType.DARK_SPOT,
    status: IncidentStatus.PENDING,
    latitude: addRandomOffset(12.9352),
    longitude: addRandomOffset(77.6245),
    description: 'Koramangala park area poorly lit at night',
    reportedAt: getRandomRecentDate(),
    createdAt: getRandomRecentDate(),
    updatedAt: getRandomRecentDate(),
    userId: mockUsers[2]?.id
  },

  // 4 TRAFFIC_VIOLATION around Silk Board (12.9176, 77.6237)
  {
    id: uuidv4(),
    type: IncidentType.TRAFFIC_VIOLATION,
    status: IncidentStatus.PENDING,
    latitude: addRandomOffset(12.9176),
    longitude: addRandomOffset(77.6237),
    description: 'Vehicle jumping red light at Silk Board junction',
    reportedAt: getRandomRecentDate(),
    createdAt: getRandomRecentDate(),
    updatedAt: getRandomRecentDate(),
    userId: mockUsers[1]?.id
  },
  {
    id: uuidv4(),
    type: IncidentType.TRAFFIC_VIOLATION,
    status: IncidentStatus.RESOLVED,
    latitude: addRandomOffset(12.9176),
    longitude: addRandomOffset(77.6237),
    description: 'Illegal parking blocking traffic flow',
    reportedAt: getRandomRecentDate(),
    createdAt: getRandomRecentDate(),
    updatedAt: getRandomRecentDate(),
    userId: mockUsers[0]?.id
  },
  {
    id: uuidv4(),
    type: IncidentType.TRAFFIC_VIOLATION,
    status: IncidentStatus.PENDING,
    latitude: addRandomOffset(12.9176),
    longitude: addRandomOffset(77.6237),
    description: 'Overspeeding on Hosur Road near Silk Board',
    reportedAt: getRandomRecentDate(),
    createdAt: getRandomRecentDate(),
    updatedAt: getRandomRecentDate(),
    userId: mockUsers[2]?.id
  },
  {
    id: uuidv4(),
    type: IncidentType.TRAFFIC_VIOLATION,
    status: IncidentStatus.PENDING,
    latitude: addRandomOffset(12.9176),
    longitude: addRandomOffset(77.6237),
    description: 'Wrong way driving on service road',
    reportedAt: getRandomRecentDate(),
    createdAt: getRandomRecentDate(),
    updatedAt: getRandomRecentDate(),
    userId: mockUsers[1]?.id
  },

  // 3 SOS around Indiranagar (12.9784, 77.6408)
  {
    id: uuidv4(),
    type: IncidentType.SOS,
    status: IncidentStatus.IN_PROGRESS,
    latitude: addRandomOffset(12.9784),
    longitude: addRandomOffset(77.6408),
    description: 'Emergency assistance needed near 100 Feet Road',
    batteryLevel: 25,
    reportedAt: getRandomRecentDate(),
    createdAt: getRandomRecentDate(),
    updatedAt: getRandomRecentDate(),
    userId: mockUsers[0]?.id
  },
  {
    id: uuidv4(),
    type: IncidentType.SOS,
    status: IncidentStatus.RESOLVED,
    latitude: addRandomOffset(12.9784),
    longitude: addRandomOffset(77.6408),
    description: 'Medical emergency at Indiranagar Metro Station',
    batteryLevel: 45,
    reportedAt: getRandomRecentDate(),
    createdAt: getRandomRecentDate(),
    updatedAt: getRandomRecentDate(),
    userId: mockUsers[2]?.id
  },
  {
    id: uuidv4(),
    type: IncidentType.SOS,
    status: IncidentStatus.PENDING,
    latitude: addRandomOffset(12.9784),
    longitude: addRandomOffset(77.6408),
    description: 'Safety concern in CMH Road area',
    batteryLevel: 78,
    reportedAt: getRandomRecentDate(),
    createdAt: getRandomRecentDate(),
    updatedAt: getRandomRecentDate(),
    userId: mockUsers[1]?.id
  },

  // 2 PUBLIC_NUISANCE around MG Road (12.9757, 77.6011)
  {
    id: uuidv4(),
    type: IncidentType.PUBLIC_NUISANCE,
    status: IncidentStatus.PENDING,
    latitude: addRandomOffset(12.9757),
    longitude: addRandomOffset(77.6011),
    description: 'Loud music disturbance near Brigade Road',
    reportedAt: getRandomRecentDate(),
    createdAt: getRandomRecentDate(),
    updatedAt: getRandomRecentDate(),
    userId: mockUsers[0]?.id
  },
  {
    id: uuidv4(),
    type: IncidentType.PUBLIC_NUISANCE,
    status: IncidentStatus.CLOSED,
    latitude: addRandomOffset(12.9757),
    longitude: addRandomOffset(77.6011),
    description: 'Illegal street vendors blocking walkway',
    reportedAt: getRandomRecentDate(),
    createdAt: getRandomRecentDate(),
    updatedAt: getRandomRecentDate(),
    userId: mockUsers[2]?.id
  },

  // 2 DARK_SPOT around Whitefield (12.9698, 77.7499)
  {
    id: uuidv4(),
    type: IncidentType.DARK_SPOT,
    status: IncidentStatus.PENDING,
    latitude: addRandomOffset(12.9698),
    longitude: addRandomOffset(77.7499),
    description: 'ITPL main road lacks proper street lighting',
    reportedAt: getRandomRecentDate(),
    createdAt: getRandomRecentDate(),
    updatedAt: getRandomRecentDate(),
    userId: mockUsers[1]?.id
  },
  {
    id: uuidv4(),
    type: IncidentType.DARK_SPOT,
    status: IncidentStatus.PENDING,
    latitude: addRandomOffset(12.9698),
    longitude: addRandomOffset(77.7499),
    description: 'Whitefield bus stop area poorly illuminated',
    reportedAt: getRandomRecentDate(),
    createdAt: getRandomRecentDate(),
    updatedAt: getRandomRecentDate(),
    userId: mockUsers[0]?.id
  }
];

// Mock Media files linked to incidents
export const mockMedia: Media[] = [
  {
    id: uuidv4(),
    fileName: 'dark_spot_koramangala.jpg',
    originalName: 'IMG_20240120_193045.jpg',
    mimeType: 'image/jpeg',
    fileSize: 2048576,
    mediaType: MediaType.IMAGE,
    s3Key: 'incidents/2024/01/dark_spot_koramangala.jpg',
    s3Bucket: 'suraksha-media',
    s3Region: 'auto',
    fileHash: generateFakeHash(),
    uploadedAt: getRandomRecentDate(),
    createdAt: getRandomRecentDate(),
    updatedAt: getRandomRecentDate(),
    incidentId: mockIncidents[0]?.id || ''
  },
  {
    id: uuidv4(),
    fileName: 'traffic_violation_silk_board.mp4',
    originalName: 'VID_20240119_174532.mp4',
    mimeType: 'video/mp4',
    fileSize: 15728640,
    mediaType: MediaType.VIDEO,
    s3Key: 'incidents/2024/01/traffic_violation_silk_board.mp4',
    s3Bucket: 'suraksha-media',
    s3Region: 'auto',
    fileHash: generateFakeHash(),
    uploadedAt: getRandomRecentDate(),
    createdAt: getRandomRecentDate(),
    updatedAt: getRandomRecentDate(),
    incidentId: mockIncidents[4]?.id || ''
  },
  {
    id: uuidv4(),
    fileName: 'sos_audio_indiranagar.wav',
    originalName: 'emergency_call_20240118.wav',
    mimeType: 'audio/wav',
    fileSize: 5242880,
    mediaType: MediaType.AUDIO,
    s3Key: 'incidents/2024/01/sos_audio_indiranagar.wav',
    s3Bucket: 'suraksha-media',
    s3Region: 'auto',
    fileHash: generateFakeHash(),
    uploadedAt: getRandomRecentDate(),
    createdAt: getRandomRecentDate(),
    updatedAt: getRandomRecentDate(),
    incidentId: mockIncidents[8]?.id || ''
  },
  {
    id: uuidv4(),
    fileName: 'nuisance_mg_road.jpg',
    originalName: 'noise_complaint_20240117.jpg',
    mimeType: 'image/jpeg',
    fileSize: 1572864,
    mediaType: MediaType.IMAGE,
    s3Key: 'incidents/2024/01/nuisance_mg_road.jpg',
    s3Bucket: 'suraksha-media',
    s3Region: 'auto',
    fileHash: generateFakeHash(),
    uploadedAt: getRandomRecentDate(),
    createdAt: getRandomRecentDate(),
    updatedAt: getRandomRecentDate(),
    incidentId: mockIncidents[12]?.id || ''
  },
  {
    id: uuidv4(),
    fileName: 'whitefield_lighting.jpg',
    originalName: 'street_light_issue_20240116.jpg',
    mimeType: 'image/jpeg',
    fileSize: 3145728,
    mediaType: MediaType.IMAGE,
    s3Key: 'incidents/2024/01/whitefield_lighting.jpg',
    s3Bucket: 'suraksha-media',
    s3Region: 'auto',
    fileHash: generateFakeHash(),
    uploadedAt: getRandomRecentDate(),
    createdAt: getRandomRecentDate(),
    updatedAt: getRandomRecentDate(),
    incidentId: mockIncidents[14]?.id || ''
  }
];