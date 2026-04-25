import { Report } from './models';

/**
 * Admin Inbox - Stores all reports for admin to view like messages
 * Reports are stored in reverse chronological order (newest first)
 */
export const adminInbox: Report[] = [];

/**
 * Add report to admin inbox
 */
export const addToAdminInbox = (report: Report): void => {
  // Add to beginning of array (newest first)
  adminInbox.unshift(report);
  console.log(`📥 Report added to admin inbox: ${report.id}`);
};

/**
 * Get all reports from admin inbox
 */
export const getAdminInbox = (): Report[] => {
  return adminInbox;
};

/**
 * Get inbox count
 */
export const getInboxCount = (): number => {
  return adminInbox.length;
};

/**
 * Clear admin inbox (for testing)
 */
export const clearAdminInbox = (): void => {
  adminInbox.length = 0;
  console.log('🗑️ Admin inbox cleared');
};
