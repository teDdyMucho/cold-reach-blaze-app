import { getFunctions, httpsCallable } from "firebase/functions";
import { SMTPConfig } from "@/types";

// Interface for email data
export interface EmailData {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  fromName?: string;
  replyTo?: string;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: Array<{
    filename: string;
    content: string; // Base64 encoded data
    encoding: string;
    contentType: string;
  }>;
}

// Get Firebase Functions instance
const functions = getFunctions();

// Test SMTP connection
export const testSmtpConnection = async (smtpConfig: SMTPConfig): Promise<{ success: boolean; message: string }> => {
  try {
    const testSmtpConnectionFn = httpsCallable(functions, 'testSmtpConnection');
    const result = await testSmtpConnectionFn({ smtpConfig });
    return result.data as { success: boolean; message: string };
  } catch (error) {
    console.error("Error testing SMTP connection:", error);
    return {
      success: false,
      message: error.message || "Failed to test SMTP connection",
    };
  }
};

// Send a test email
export const sendTestEmail = async (
  smtpConfig: SMTPConfig,
  testEmailRecipient?: string
): Promise<{ success: boolean; message: string; messageId?: string }> => {
  try {
    const sendTestEmailFn = httpsCallable(functions, 'sendTestEmail');
    const result = await sendTestEmailFn({ 
      smtpConfig,
      testEmailRecipient
    });
    return result.data as { success: boolean; message: string; messageId?: string };
  } catch (error) {
    console.error("Error sending test email:", error);
    return {
      success: false,
      message: error.message || "Failed to send test email",
    };
  }
};

// Send an email
export const sendEmail = async (
  emailData: EmailData,
  smtpConfig?: SMTPConfig,
  useStoredConfig: boolean = true
): Promise<{ success: boolean; message: string; messageId?: string }> => {
  try {
    const sendEmailFn = httpsCallable(functions, 'sendEmail');
    const result = await sendEmailFn({ 
      emailData,
      smtpConfig,
      useStoredConfig
    });
    return result.data as { success: boolean; message: string; messageId?: string };
  } catch (error) {
    console.error("Error sending email:", error);
    return {
      success: false,
      message: error.message || "Failed to send email",
    };
  }
};

// Send campaign emails
export const sendCampaignEmails = async (
  campaignId: string,
  smtpConfig?: SMTPConfig,
  useStoredConfig: boolean = true
): Promise<{ 
  success: boolean; 
  totalContacts?: number;
  successfulSends?: number;
  failedSends?: number;
  results?: Array<{
    contactId: string;
    success: boolean;
    messageId?: string;
    message?: string;
  }>;
}> => {
  try {
    const sendCampaignEmailsFn = httpsCallable(functions, 'sendCampaignEmails');
    const result = await sendCampaignEmailsFn({ 
      campaignId,
      smtpConfig,
      useStoredConfig
    });
    return result.data as { 
      success: boolean; 
      totalContacts: number;
      successfulSends: number;
      failedSends: number;
      results: Array<{
        contactId: string;
        success: boolean;
        messageId?: string;
        message?: string;
      }>;
    };
  } catch (error) {
    console.error("Error sending campaign emails:", error);
    return {
      success: false,
      totalContacts: 0,
      successfulSends: 0,
      failedSends: 0,
      results: [],
    };
  }
};
