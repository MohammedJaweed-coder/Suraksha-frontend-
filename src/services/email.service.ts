import nodemailer from 'nodemailer';
import { Report } from '../data/models';

// Email configuration from environment variables
const EMAIL_ENABLED = process.env.EMAIL_ENABLED === 'true';
const EMAIL_USER = process.env.EMAIL_USER || 'your-email@gmail.com';
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD || 'your-app-password';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@suraksha.ai';

// Create transporter (only if email is enabled)
let transporter: nodemailer.Transporter | null = null;

if (EMAIL_ENABLED) {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASSWORD
    }
  });
}

/**
 * Send email notification for new report submission
 */
export const sendReportEmail = async (report: Report, userEmail?: string): Promise<void> => {
  // If email is disabled, just log and return
  if (!EMAIL_ENABLED) {
    console.log('📧 Email disabled - Would have sent report notification to admin');
    return;
  }

  // If transporter is not configured, log warning and return
  if (!transporter) {
    console.warn('⚠️ Email transporter not configured');
    return;
  }

  try {
    const mailOptions = {
      from: EMAIL_USER,
      to: ADMIN_EMAIL,
      subject: '🚨 New Incident Report Submitted - Suraksha.ai',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #d32f2f;">🚨 New Incident Report Alert</h2>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Report Details</h3>
            
            <p><strong>Report ID:</strong> ${report.id}</p>
            <p><strong>Title:</strong> ${report.title}</p>
            <p><strong>Description:</strong> ${report.description}</p>
            <p><strong>Status:</strong> <span style="color: ${report.status === 'valid' ? '#4caf50' : report.status === 'invalid' ? '#f44336' : '#ff9800'};">${report.status.toUpperCase()}</span></p>
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 15px 0;">
            
            <p><strong>Location:</strong> Lat ${report.location.lat}, Lng ${report.location.lng}</p>
            <p><strong>Media Type:</strong> ${report.mediaType}</p>
            ${report.mediaUrl ? `<p><strong>Media URL:</strong> <a href="${report.mediaUrl}">${report.mediaUrl}</a></p>` : ''}
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 15px 0;">
            
            <p><strong>Submitted By:</strong> ${userEmail || 'Unknown'}</p>
            <p><strong>User ID:</strong> ${report.userId}</p>
            <p><strong>Submitted At:</strong> ${report.createdAt.toLocaleString()}</p>
          </div>
          
          ${report.aiValidationResult ? `
          <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4 style="margin-top: 0;">AI Validation Result</h4>
            <p>${report.aiValidationResult}</p>
          </div>
          ` : ''}
          
          ${report.action ? `
          <div style="background-color: ${report.action.type === 'reward' ? '#d4edda' : '#f8d7da'}; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4 style="margin-top: 0;">Action Taken</h4>
            <p><strong>Type:</strong> ${report.action.type.toUpperCase()}</p>
            <p><strong>Value:</strong> ${report.action.value}</p>
          </div>
          ` : ''}
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px;">
            <p>This is an automated notification from Suraksha.ai Police/Safety Platform.</p>
            <p>Please review the report in the admin dashboard.</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`📧 Email sent to admin for report: ${report.id}`);
  } catch (error) {
    // Email failure should not block the API
    console.error('❌ Failed to send email notification:', error instanceof Error ? error.message : error);
  }
};

/**
 * Send email notification for SOS alert
 */
export const sendSOSEmail = async (sosAlert: any, userEmail?: string, userName?: string): Promise<void> => {
  if (!EMAIL_ENABLED || !transporter) {
    console.log('📧 Email disabled - Would have sent SOS alert to admin');
    return;
  }

  try {
    const mailOptions = {
      from: EMAIL_USER,
      to: ADMIN_EMAIL,
      subject: '🚨🚨 URGENT: SOS Alert Triggered - Suraksha.ai',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #d32f2f; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
            <h2 style="margin: 0;">🚨🚨 URGENT SOS ALERT 🚨🚨</h2>
          </div>
          
          <div style="background-color: #ffebee; padding: 20px; border-radius: 0 0 8px 8px;">
            <h3 style="color: #d32f2f; margin-top: 0;">Emergency Alert Details</h3>
            
            <p><strong>Alert ID:</strong> ${sosAlert.id}</p>
            <p><strong>Status:</strong> <span style="color: #d32f2f; font-weight: bold;">${sosAlert.status.toUpperCase()}</span></p>
            
            <hr style="border: none; border-top: 2px solid #d32f2f; margin: 15px 0;">
            
            <p><strong>Location:</strong> Lat ${sosAlert.location.lat}, Lng ${sosAlert.location.lng}</p>
            <p><strong>Google Maps:</strong> <a href="https://www.google.com/maps?q=${sosAlert.location.lat},${sosAlert.location.lng}" target="_blank">View on Map</a></p>
            
            <hr style="border: none; border-top: 2px solid #d32f2f; margin: 15px 0;">
            
            <p><strong>User:</strong> ${userName || 'Unknown'}</p>
            <p><strong>Email:</strong> ${userEmail || 'Unknown'}</p>
            <p><strong>User ID:</strong> ${sosAlert.userId}</p>
            <p><strong>Triggered At:</strong> ${sosAlert.createdAt.toLocaleString()}</p>
          </div>
          
          <div style="margin-top: 20px; padding: 20px; background-color: #fff3cd; border-radius: 8px;">
            <p style="margin: 0; font-weight: bold; color: #856404;">⚠️ IMMEDIATE ACTION REQUIRED</p>
            <p style="margin: 10px 0 0 0;">Please dispatch emergency response team to the location immediately.</p>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px;">
            <p>This is an automated emergency notification from Suraksha.ai Police/Safety Platform.</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`📧 SOS email sent to admin for alert: ${sosAlert.id}`);
  } catch (error) {
    console.error('❌ Failed to send SOS email notification:', error instanceof Error ? error.message : error);
  }
};

/**
 * Test email configuration
 */
export const testEmailConfiguration = async (): Promise<boolean> => {
  if (!EMAIL_ENABLED) {
    console.log('📧 Email is disabled in configuration');
    return false;
  }

  if (!transporter) {
    console.error('❌ Email transporter not configured');
    return false;
  }

  try {
    await transporter.verify();
    console.log('✅ Email configuration is valid');
    return true;
  } catch (error) {
    console.error('❌ Email configuration test failed:', error instanceof Error ? error.message : error);
    return false;
  }
};
