# Firebase Functions for Email Sending

This directory contains Firebase Cloud Functions that enable sending emails through SMTP using Nodemailer. These functions allow the Cold Reach Blaze App to send marketing emails using the user's own SMTP server configuration.

## Features

- **SMTP Email Sending**: Send emails using the user's SMTP configuration
- **Campaign Emails**: Send personalized emails to multiple contacts in a campaign
- **Test Functionality**: Test SMTP connection and send test emails
- **Secure**: Keeps SMTP credentials secure by handling them server-side

## Functions

1. **sendEmail**: Sends a single email using the user's SMTP configuration
2. **testSmtpConnection**: Tests the connection to the SMTP server
3. **sendTestEmail**: Sends a test email to verify the SMTP configuration
4. **sendCampaignEmails**: Sends personalized emails to all contacts in a campaign

## Deployment

To deploy these functions to Firebase, follow these steps:

1. Install Firebase CLI:
```
npm install -g firebase-tools
```

2. Login to Firebase:
```
firebase login
```

3. Initialize Firebase in your project (if not already done):
```
firebase init
```

4. Build the functions:
```
cd functions
npm run build
```

5. Deploy the functions:
```
firebase deploy --only functions
```

## Local Development

To run the functions locally for testing:

1. Install dependencies:
```
cd functions
npm install
```

2. Start the Firebase emulator:
```
npm run serve
```

## Usage from Client

The client-side code can call these functions using the Firebase Functions SDK. Example:

```typescript
import { getFunctions, httpsCallable } from "firebase/functions";

const functions = getFunctions();
const sendEmailFn = httpsCallable(functions, 'sendEmail');

// Call the function
const result = await sendEmailFn({ 
  emailData: {
    to: "recipient@example.com",
    subject: "Test Email",
    html: "<p>This is a test email</p>"
  },
  useStoredConfig: true
});
```

## Security

These functions include security checks to ensure:
- Only authenticated users can send emails
- Users can only access their own SMTP configurations
- Email sending is rate-limited to prevent abuse

## Dependencies

- firebase-admin
- firebase-functions
- nodemailer
- cors
