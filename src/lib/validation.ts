/**
 * AI Validation Engine (Frontend Simulation)
 *
 * Simulates AI-powered report validation by checking:
 *  - Media presence (image/video/audio)
 *  - Description quality (length, keywords)
 *  - Location data availability
 *
 * Returns a validation result with confidence score.
 */

export type ValidationStatus = 'VALID' | 'INVALID' | 'PENDING';

export interface ValidationResult {
  status: ValidationStatus;
  confidence: number;        // 0–100
  reason: string;
  processingTimeMs: number;  // simulated processing time
}

export interface RewardInfo {
  type: 'coupon' | 'badge' | 'points';
  label: string;
  value: string;
  description: string;
}

export interface PenaltyInfo {
  severity: 'warning' | 'fine';
  label: string;
  description: string;
  amount?: string;
}

/**
 * Simulate AI validation of a submitted report.
 * Returns a promise that resolves after a fake processing delay.
 */
export async function simulateAIValidation(params: {
  hasMedia: boolean;
  mediaType?: 'image' | 'video' | 'audio';
  descriptionLength: number;
  hasLocation: boolean;
  incidentType: string;
}): Promise<ValidationResult> {
  // Simulate AI processing time (1.5–3s)
  const processingTime = 1500 + Math.random() * 1500;
  await new Promise(resolve => setTimeout(resolve, processingTime));

  let score = 0;

  // Media check (40 points)
  if (params.hasMedia) {
    score += 30;
    if (params.mediaType === 'video') score += 10;  // video evidence is stronger
    else if (params.mediaType === 'image') score += 8;
    else score += 5; // audio only
  }

  // Description quality (30 points)
  if (params.descriptionLength > 50) score += 30;
  else if (params.descriptionLength > 20) score += 20;
  else if (params.descriptionLength > 5) score += 10;

  // Location data (20 points)
  if (params.hasLocation) score += 20;

  // Incident type validity (10 points)
  if (params.incidentType && params.incidentType !== '') score += 10;

  // Add slight randomness for realism
  score += Math.floor(Math.random() * 8) - 4;
  score = Math.max(0, Math.min(100, score));

  const status: ValidationStatus = score >= 60 ? 'VALID' : 'INVALID';
  const reason = score >= 60
    ? `AI analysis confirms this report with ${score}% confidence. Evidence quality meets verification threshold.`
    : `Insufficient evidence detected (${score}% confidence). Report requires additional media or description.`;

  return {
    status,
    confidence: score,
    reason,
    processingTimeMs: Math.round(processingTime)
  };
}

/**
 * Generate a mock reward for a verified report.
 */
export function generateReward(incidentType: string): RewardInfo {
  const rewards: RewardInfo[] = [
    {
      type: 'coupon',
      label: '₹50 Safety Reward',
      value: 'SAFE50',
      description: 'Redeemable at partnered stores for your civic contribution'
    },
    {
      type: 'coupon',
      label: '₹100 Metro Credit',
      value: 'METRO100',
      description: 'Free metro rides for helping keep the city safe'
    },
    {
      type: 'badge',
      label: 'Vigilant Citizen',
      value: '🏅',
      description: 'You earned the Vigilant Citizen badge!'
    },
    {
      type: 'points',
      label: '+25 Safety Points',
      value: '25',
      description: 'Points added to your civic safety score'
    }
  ];

  // Deterministic selection based on incident type
  const index = incidentType.length % rewards.length;
  return rewards[index];
}

/**
 * Generate a mock penalty warning for an invalid report.
 */
export function generatePenalty(): PenaltyInfo {
  return {
    severity: 'warning',
    label: 'False Report Warning',
    description: 'Repeated false reports may result in account suspension and legal penalties under Section 182 IPC.',
    amount: '₹500'
  };
}
