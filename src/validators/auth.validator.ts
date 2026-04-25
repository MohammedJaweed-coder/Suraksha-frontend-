import { z } from 'zod';

// =============================================================================
// DEVICE VALIDATION
// =============================================================================

export const deviceIdSchema = z
  .string()
  .min(1, 'Device ID is required')
  .max(255, 'Device ID too long')
  .regex(/^[a-zA-Z0-9_-]+$/, 'Device ID can only contain letters, numbers, underscores, and hyphens');

// =============================================================================
// WEBAUTHN CREDENTIAL VALIDATION
// =============================================================================

export const webAuthnCredentialSchema = z.object({
  id: z.string().min(1, 'Credential ID is required'),
  rawId: z.string().min(1, 'Raw credential ID is required'),
  type: z.literal('public-key', {
    errorMap: () => ({ message: 'Credential type must be "public-key"' }),
  }),
});

export const webAuthnRegistrationCredentialSchema = webAuthnCredentialSchema.extend({
  response: z.object({
    attestationObject: z.string().min(1, 'Attestation object is required'),
    clientDataJSON: z.string().min(1, 'Client data JSON is required'),
  }),
});

export const webAuthnAuthenticationCredentialSchema = webAuthnCredentialSchema.extend({
  response: z.object({
    authenticatorData: z.string().min(1, 'Authenticator data is required'),
    clientDataJSON: z.string().min(1, 'Client data JSON is required'),
    signature: z.string().min(1, 'Signature is required'),
    userHandle: z.string().optional(),
  }),
});

// =============================================================================
// CHALLENGE VALIDATION
// =============================================================================

export const challengeSchema = z
  .string()
  .min(1, 'Challenge is required')
  .max(1024, 'Challenge too long');

// =============================================================================
// REGISTRATION REQUEST VALIDATION
// =============================================================================

export const generateRegistrationOptionsSchema = z.object({
  deviceId: deviceIdSchema,
});

export const verifyRegistrationSchema = z.object({
  deviceId: deviceIdSchema,
  credential: webAuthnRegistrationCredentialSchema,
  expectedChallenge: challengeSchema,
});

// =============================================================================
// AUTHENTICATION REQUEST VALIDATION
// =============================================================================

export const generateAuthenticationOptionsSchema = z.object({
  deviceId: deviceIdSchema,
});

export const verifyAuthenticationSchema = z.object({
  deviceId: deviceIdSchema,
  credential: webAuthnAuthenticationCredentialSchema,
  expectedChallenge: challengeSchema,
});

// =============================================================================
// JWT TOKEN VALIDATION
// =============================================================================

export const jwtPayloadSchema = z.object({
  userId: z.string().uuid('Invalid user ID format'),
  iat: z.number().positive('Invalid issued at timestamp'),
  exp: z.number().positive('Invalid expiration timestamp'),
});

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Validate device ID format
 */
export function isValidDeviceId(deviceId: string): boolean {
  try {
    deviceIdSchema.parse(deviceId);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate WebAuthn credential structure
 */
export function isValidWebAuthnCredential(credential: any, type: 'registration' | 'authentication'): boolean {
  try {
    if (type === 'registration') {
      webAuthnRegistrationCredentialSchema.parse(credential);
    } else {
      webAuthnAuthenticationCredentialSchema.parse(credential);
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Sanitize device ID by removing invalid characters
 */
export function sanitizeDeviceId(deviceId: string): string {
  return deviceId.replace(/[^a-zA-Z0-9_-]/g, '').substring(0, 255);
}