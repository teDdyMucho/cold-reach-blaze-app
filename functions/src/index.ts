import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as nodemailer from "nodemailer";

// Initialize Firebase Admin
admin.initializeApp();

// Interface for SMTP configuration
interface SMTPConfig {
  host: string;
  port: string;
  username: string;
  password: string;
  secure: boolean;
  fromName: string;
  fromEmail: string;
}

// Interface for email data
interface EmailData {
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

// Interface for contact
interface Contact {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  position?: string;
}

// Interface for mail options
interface MailOptions {
  from: string;
  to: string;
  subject: string;
  text: string;
  html: string;
  replyTo: string;
  attachments: Array<{
    filename: string;
    content: string;
    encoding: string;
    contentType: string;
  }>;
  cc?: string;
  bcc?: string;
}

// Send email using SMTP configuration
export const sendEmail = functions.https.onCall(async (data: any, context: functions.https.CallableContext) => {
  try {
    // Check if user is authenticated
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "User must be authenticated to send emails."
      );
    }

    const userId = context.auth.uid;
    const emailData: EmailData = data.emailData;
    const useStoredConfig: boolean = data.useStoredConfig || true;
    let smtpConfig: SMTPConfig = data.smtpConfig;

    // If using stored config, fetch from Firestore
    if (useStoredConfig) {
      const userDoc = await admin.firestore().collection("users").doc(userId).get();
      
      if (!userDoc.exists) {
        throw new functions.https.HttpsError(
          "not-found",
          "User document not found."
        );
      }

      const userData = userDoc.data();
      if (!userData?.settings?.smtpConfig) {
        throw new functions.https.HttpsError(
          "failed-precondition",
          "SMTP configuration not found for this user."
        );
      }

      smtpConfig = userData.settings.smtpConfig as SMTPConfig;
    }

    // Validate SMTP configuration
    if (!smtpConfig?.host || !smtpConfig?.port || !smtpConfig?.username || !smtpConfig?.password) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Invalid SMTP configuration. Missing required fields."
      );
    }

    // Validate email data
    if (!emailData?.to || !emailData?.subject || !emailData?.html) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Invalid email data. Missing required fields."
      );
    }

    // Create Nodemailer transporter
    const transporter = nodemailer.createTransport({
      host: smtpConfig.host,
      port: parseInt(smtpConfig.port, 10),
      secure: smtpConfig.secure,
      auth: {
        user: smtpConfig.username,
        pass: smtpConfig.password,
      },
    });

    // Prepare email options
    const mailOptions: MailOptions = {
      from: emailData.from 
        ? `"${emailData.fromName || smtpConfig.fromName}" <${emailData.from}>`
        : `"${smtpConfig.fromName}" <${smtpConfig.fromEmail}>`,
      to: Array.isArray(emailData.to) ? emailData.to.join(", ") : emailData.to,
      subject: emailData.subject,
      text: emailData.text || "",
      html: emailData.html,
      replyTo: emailData.replyTo || smtpConfig.fromEmail,
      attachments: emailData.attachments || [],
    };

    // Add CC and BCC if provided
    if (emailData.cc) {
      mailOptions.cc = Array.isArray(emailData.cc) ? emailData.cc.join(", ") : emailData.cc;
    }
    
    if (emailData.bcc) {
      mailOptions.bcc = Array.isArray(emailData.bcc) ? emailData.bcc.join(", ") : emailData.bcc;
    }

    // Send email
    const info = await transporter.sendMail(mailOptions);

    // Log email sending in Firestore
    await admin.firestore().collection("users").doc(userId).collection("emailLogs").add({
      to: emailData.to,
      subject: emailData.subject,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      messageId: info.messageId,
      status: "sent",
    });

    return {
      success: true,
      messageId: info.messageId,
      message: "Email sent successfully",
    };
  } catch (error: unknown) {
    console.error("Error sending email:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    throw new functions.https.HttpsError(
      "internal",
      `Error sending email: ${errorMessage}`
    );
  }
});

// Test SMTP configuration
export const testSmtpConnection = functions.https.onCall(async (data: any, context: functions.https.CallableContext) => {
  try {
    // Check if user is authenticated
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "User must be authenticated to test SMTP connection."
      );
    }

    const smtpConfig: SMTPConfig = data.smtpConfig;
    
    // Log the SMTP configuration (without password)
    console.log("Testing SMTP connection with config:", {
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: smtpConfig.secure,
      username: smtpConfig.username,
      // Don't log the password
      fromName: smtpConfig.fromName,
      fromEmail: smtpConfig.fromEmail,
    });

    // Validate SMTP configuration
    if (!smtpConfig?.host || !smtpConfig?.port || !smtpConfig?.username || !smtpConfig?.password) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Invalid SMTP configuration. Missing required fields."
      );
    }

    // Create Nodemailer transporter with debug option
    const transporter = nodemailer.createTransport({
      host: smtpConfig.host,
      port: parseInt(smtpConfig.port, 10),
      secure: smtpConfig.secure,
      auth: {
        user: smtpConfig.username,
        pass: smtpConfig.password,
      },
      debug: true, // Enable debug logs
      logger: true, // Log to console
    });

    console.log("Transporter created, attempting to verify connection...");
    
    // Verify connection 
    await transporter.verify();

    console.log("SMTP connection verified successfully");
    
    return {
      success: true,
      message: "SMTP connection successful",
    };
  } catch (error: unknown) {
    console.error("Error testing SMTP connection:", error);
    
    // Extract more detailed error information
    let errorMessage = "Unknown error";
    let errorCode = "unknown";
    
    if (error instanceof Error) {
      errorMessage = error.message;
      
      // Try to extract more specific error information
      const errorString = error.toString();
      console.error("Full error details:", errorString);
      
      if (errorString.includes("ECONNREFUSED")) {
        errorCode = "connection_refused";
        errorMessage = "Connection refused. The SMTP server is not accepting connections on the specified host and port.";
      } else if (errorString.includes("ETIMEDOUT")) {
        errorCode = "connection_timeout";
        errorMessage = "Connection timed out. The SMTP server did not respond in time.";
      } else if (errorString.includes("ENOTFOUND")) {
        errorCode = "host_not_found";
        errorMessage = "Host not found. The SMTP server hostname could not be resolved.";
      } else if (errorString.includes("Greeting never received")) {
        errorCode = "no_greeting";
        errorMessage = "The SMTP server did not send a greeting. This could be due to incorrect port, SSL/TLS settings, or the server blocking the connection.";
      } else if (errorString.includes("Invalid login")) {
        errorCode = "auth_failed";
        errorMessage = "Authentication failed. The username or password is incorrect.";
      }
    }
    
    throw new functions.https.HttpsError(
      "internal",
      `Error testing SMTP connection: ${errorMessage}`,
      { errorCode }
    );
  }
});

// Send a test email
export const sendTestEmail = functions.https.onCall(async (data: any, context: functions.https.CallableContext) => {
  try {
    // Check if user is authenticated
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "User must be authenticated to send test email."
      );
    }

    const userId = context.auth.uid;
    const smtpConfig: SMTPConfig = data.smtpConfig;
    const testEmailRecipient = data.testEmailRecipient || smtpConfig.fromEmail;

    // Validate SMTP configuration
    if (!smtpConfig?.host || !smtpConfig?.port || !smtpConfig?.username || !smtpConfig?.password) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Invalid SMTP configuration. Missing required fields."
      );
    }

    // Create Nodemailer transporter
    const transporter = nodemailer.createTransport({
      host: smtpConfig.host,
      port: parseInt(smtpConfig.port, 10),
      secure: smtpConfig.secure,
      auth: {
        user: smtpConfig.username,
        pass: smtpConfig.password,
      },
    });

    // Prepare test email
    const mailOptions: MailOptions = {
      from: `"${smtpConfig.fromName}" <${smtpConfig.fromEmail}>`,
      to: testEmailRecipient,
      subject: "SMTP Configuration Test",
      text: "This is a test email to verify your SMTP configuration.",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 5px;">
          <h2 style="color: #4f46e5;">SMTP Configuration Test</h2>
          <p>This is a test email to verify that your SMTP server is correctly configured.</p>
          <p>If you're receiving this email, it means your configuration is working properly!</p>
          <div style="margin-top: 20px; padding: 15px; background-color: #f9fafb; border-radius: 5px;">
            <h3 style="margin-top: 0;">Configuration Details:</h3>
            <p><strong>SMTP Host:</strong> ${smtpConfig.host}</p>
            <p><strong>SMTP Port:</strong> ${smtpConfig.port}</p>
            <p><strong>Secure Connection:</strong> ${smtpConfig.secure ? "Yes" : "No"}</p>
            <p><strong>From Name:</strong> ${smtpConfig.fromName}</p>
            <p><strong>From Email:</strong> ${smtpConfig.fromEmail}</p>
          </div>
          <p style="margin-top: 20px; color: #6b7280; font-size: 14px;">
            Sent from Cold Reach Blaze App at ${new Date().toLocaleString()}
          </p>
        </div>
      `,
      replyTo: smtpConfig.fromEmail,
      attachments: [],
    };

    // Send test email
    const info = await transporter.sendMail(mailOptions);

    // Log test email in Firestore
    await admin.firestore().collection("users").doc(userId).collection("emailLogs").add({
      to: testEmailRecipient,
      subject: "SMTP Configuration Test",
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      messageId: info.messageId,
      status: "sent",
      type: "test",
    });

    return {
      success: true,
      messageId: info.messageId,
      message: "Test email sent successfully",
    };
  } catch (error: unknown) {
    console.error("Error sending test email:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    throw new functions.https.HttpsError(
      "internal",
      `Error sending test email: ${errorMessage}`
    );
  }
});

// Send campaign emails
export const sendCampaignEmails = functions.https.onCall(async (data: any, context: functions.https.CallableContext) => {
  try {
    // Check if user is authenticated
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "User must be authenticated to send campaign emails."
      );
    }

    const userId = context.auth.uid;
    const campaignId = data.campaignId;
    const useStoredConfig = data.useStoredConfig || true;
    let smtpConfig: SMTPConfig = data.smtpConfig;

    // Validate campaign ID
    if (!campaignId) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Campaign ID is required."
      );
    }

    // Get campaign data
    const campaignDoc = await admin
      .firestore()
      .collection("users")
      .doc(userId)
      .collection("campaigns")
      .doc(campaignId)
      .get();

    if (!campaignDoc.exists) {
      throw new functions.https.HttpsError(
        "not-found",
        "Campaign not found."
      );
    }

    const campaign = campaignDoc.data();
    if (!campaign) {
      throw new functions.https.HttpsError(
        "not-found",
        "Campaign data not found."
      );
    }

    // If using stored config, fetch from Firestore
    if (useStoredConfig) {
      const userDoc = await admin.firestore().collection("users").doc(userId).get();
      
      if (!userDoc.exists) {
        throw new functions.https.HttpsError(
          "not-found",
          "User document not found."
        );
      }

      const userData = userDoc.data();
      if (!userData?.settings?.smtpConfig) {
        throw new functions.https.HttpsError(
          "failed-precondition",
          "SMTP configuration not found for this user."
        );
      }

      smtpConfig = userData.settings.smtpConfig as SMTPConfig;
    }

    // Validate SMTP configuration
    if (!smtpConfig?.host || !smtpConfig?.port || !smtpConfig?.username || !smtpConfig?.password) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Invalid SMTP configuration. Missing required fields."
      );
    }

    // Get contact list
    const contactListId = campaign.contactListId;
    if (!contactListId) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Contact list ID is required."
      );
    }

    const contactListDoc = await admin
      .firestore()
      .collection("users")
      .doc(userId)
      .collection("contactLists")
      .doc(contactListId)
      .get();

    if (!contactListDoc.exists) {
      throw new functions.https.HttpsError(
        "not-found",
        "Contact list not found."
      );
    }

    const contactList = contactListDoc.data();
    if (!contactList || !contactList.contactIds || !contactList.contactIds.length) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "Contact list is empty."
      );
    }

    // Get contacts
    const contactIds = contactList.contactIds;
    const contacts: Contact[] = [];

    for (const contactId of contactIds) {
      const contactDoc = await admin
        .firestore()
        .collection("users")
        .doc(userId)
        .collection("contacts")
        .doc(contactId)
        .get();

      if (contactDoc.exists) {
        contacts.push({ id: contactDoc.id, ...contactDoc.data() } as Contact);
      }
    }

    if (!contacts.length) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "No valid contacts found in the contact list."
      );
    }

    // Create Nodemailer transporter
    const transporter = nodemailer.createTransport({
      host: smtpConfig.host,
      port: parseInt(smtpConfig.port, 10),
      secure: smtpConfig.secure,
      auth: {
        user: smtpConfig.username,
        pass: smtpConfig.password,
      },
    });

    // Send emails to all contacts
    const results = [];
    const batchSize = 10; // Process in batches to avoid overloading
    
    // Update campaign status to sending
    await admin
      .firestore()
      .collection("users")
      .doc(userId)
      .collection("campaigns")
      .doc(campaignId)
      .update({
        status: "sending",
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

    for (let i = 0; i < contacts.length; i += batchSize) {
      const batch = contacts.slice(i, i + batchSize);
      const promises = batch.map(async (contact) => {
        try {
          // Skip contacts without email
          if (!contact.email) {
            return {
              contactId: contact.id,
              success: false,
              message: "Contact has no email address",
            };
          }

          // Personalize email content
          let personalizedHtml = campaign.html || "";
          let personalizedSubject = campaign.subject || "";

          // Replace placeholders with contact data
          const placeholders = {
            firstName: contact.firstName || "",
            lastName: contact.lastName || "",
            email: contact.email || "",
            company: contact.company || "",
            position: contact.position || "",
          };

          Object.entries(placeholders).forEach(([key, value]) => {
            const regex = new RegExp(`{{${key}}}`, "g");
            personalizedHtml = personalizedHtml.replace(regex, value);
            personalizedSubject = personalizedSubject.replace(regex, value);
          });

          // Prepare email options
          const mailOptions: MailOptions = {
            from: `"${smtpConfig.fromName}" <${smtpConfig.fromEmail}>`,
            to: contact.email,
            subject: personalizedSubject,
            text: "",
            html: personalizedHtml,
            replyTo: smtpConfig.fromEmail,
            attachments: [],
          };

          // Send email
          const info = await transporter.sendMail(mailOptions);

          // Log email in Firestore
          await admin
            .firestore()
            .collection("users")
            .doc(userId)
            .collection("emailLogs")
            .add({
              campaignId,
              contactId: contact.id,
              to: contact.email,
              subject: personalizedSubject,
              timestamp: admin.firestore.FieldValue.serverTimestamp(),
              messageId: info.messageId,
              status: "sent",
            });

          return {
            contactId: contact.id,
            success: true,
            messageId: info.messageId,
          };
        } catch (error: unknown) {
          console.error(`Error sending email to ${contact.email}:`, error);
          const errorMessage = error instanceof Error ? error.message : "Unknown error";
          
          // Log failed email
          await admin
            .firestore()
            .collection("users")
            .doc(userId)
            .collection("emailLogs")
            .add({
              campaignId,
              contactId: contact.id,
              to: contact.email,
              subject: campaign.subject,
              timestamp: admin.firestore.FieldValue.serverTimestamp(),
              status: "failed",
              error: errorMessage,
            });

          return {
            contactId: contact.id,
            success: false,
            message: errorMessage,
          };
        }
      });

      const batchResults = await Promise.all(promises);
      results.push(...batchResults);

      // Small delay between batches to avoid rate limiting
      if (i + batchSize < contacts.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    // Update campaign status to sent
    const successCount = results.filter((r) => r.success).length;
    await admin
      .firestore()
      .collection("users")
      .doc(userId)
      .collection("campaigns")
      .doc(campaignId)
      .update({
        status: "sent",
        sentAt: admin.firestore.FieldValue.serverTimestamp(),
        recipients: contacts.length,
        sent: successCount,
        failed: contacts.length - successCount,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

    return {
      success: true,
      totalContacts: contacts.length,
      successfulSends: successCount,
      failedSends: contacts.length - successCount,
      results,
    };
  } catch (error: unknown) {
    console.error("Error sending campaign emails:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    throw new functions.https.HttpsError(
      "internal",
      `Error sending campaign emails: ${errorMessage}`
    );
  }
});
