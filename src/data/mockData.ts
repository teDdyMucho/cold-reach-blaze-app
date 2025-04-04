import { Campaign, Contact, EmailHistory, EmailProvider, Template, ChartData } from "@/types";
import { v4 as uuidv4 } from "uuid";

// Sample HTML content for templates
const sampleHTML = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; margin-bottom: 20px; }
    .content { margin-bottom: 30px; }
    .footer { text-align: center; font-size: 12px; color: #666; }
    .button { display: inline-block; padding: 10px 20px; background-color: #4A7BF7; color: white; text-decoration: none; border-radius: 4px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>Hello {{firstName}}!</h2>
    </div>
    <div class="content">
      <p>I noticed you're the {{position}} at {{company}} and I thought you might be interested in our solution that helps businesses like yours improve email deliverability.</p>
      <p>Would you be open to a quick 15-minute call to discuss how we could help {{company}} reach more inboxes?</p>
      <p>Best regards,<br>John Doe</p>
    </div>
    <div class="footer">
      <p>Company Inc. | 123 Street, City | <a href="mailto:info@company.com">info@company.com</a></p>
    </div>
  </div>
</body>
</html>
`;

// Templates
export const templates: Template[] = [
  {
    id: uuidv4(),
    name: "Initial Outreach",
    subject: "Quick question about {{company}}",
    content: "Hello {{firstName}}, I noticed you're the {{position}} at {{company}}...",
    html: sampleHTML,
    elements: [
      {
        id: uuidv4(),
        type: "text",
        content: "Hello {{firstName}}!",
        style: { fontSize: "24px", fontWeight: "bold", textAlign: "center" }
      },
      {
        id: uuidv4(),
        type: "text",
        content: "I noticed you're the {{position}} at {{company}} and I thought you might be interested in our solution that helps businesses like yours improve email deliverability.",
      },
      {
        id: uuidv4(),
        type: "button",
        content: "Schedule a Call",
        link: "https://calendly.com/example",
        style: { backgroundColor: "#4A7BF7", color: "white", padding: "10px 20px", borderRadius: "4px" }
      }
    ],
    createdAt: "2023-08-15T10:30:00Z",
    updatedAt: "2023-08-15T10:30:00Z"
  },
  {
    id: uuidv4(),
    name: "Follow-up",
    subject: "Following up on my previous email",
    content: "Hi {{firstName}}, I just wanted to follow up on my previous email...",
    html: sampleHTML.replace("Hello {{firstName}}!", "Following up, {{firstName}}").replace("I noticed you're", "Just checking if you saw my previous email. I noticed you're"),
    elements: [
      {
        id: uuidv4(),
        type: "text",
        content: "Following up, {{firstName}}!",
        style: { fontSize: "24px", fontWeight: "bold", textAlign: "center" }
      },
      {
        id: uuidv4(),
        type: "text",
        content: "Just checking if you saw my previous email. I noticed you're the {{position}} at {{company}}...",
      }
    ],
    createdAt: "2023-08-20T14:15:00Z",
    updatedAt: "2023-08-20T14:15:00Z"
  },
  {
    id: uuidv4(),
    name: "Case Study Share",
    subject: "How {{company}} could achieve similar results",
    content: "Hello {{firstName}}, I thought you might be interested in this case study...",
    html: sampleHTML.replace("Hello {{firstName}}!", "Case Study for {{firstName}}").replace("I noticed you're", "I wanted to share a case study about how a company similar to {{company}} achieved 40% higher open rates."),
    elements: [
      {
        id: uuidv4(),
        type: "text",
        content: "Case Study for {{firstName}}",
        style: { fontSize: "24px", fontWeight: "bold", textAlign: "center" }
      },
      {
        id: uuidv4(),
        type: "image",
        src: "https://placehold.co/600x300/e2e8f0/1e40af",
        width: 600,
        height: 300
      },
      {
        id: uuidv4(),
        type: "text",
        content: "I wanted to share a case study about how a company similar to {{company}} achieved 40% higher open rates.",
      }
    ],
    createdAt: "2023-09-05T09:45:00Z",
    updatedAt: "2023-09-05T09:45:00Z"
  },
];

// Campaigns
export const campaigns: Campaign[] = [
  {
    id: uuidv4(),
    name: "Tech Startups Outreach",
    templateId: templates[0].id,
    status: "sent",
    recipients: 150,
    opened: 93,
    clicked: 42,
    replied: 18,
    sentAt: "2023-08-18T09:00:00Z",
    createdAt: "2023-08-15T14:30:00Z"
  },
  {
    id: uuidv4(),
    name: "SaaS Companies Follow-up",
    templateId: templates[1].id,
    status: "sending",
    recipients: 200,
    opened: 78,
    clicked: 31,
    replied: 12,
    createdAt: "2023-09-01T11:20:00Z"
  },
  {
    id: uuidv4(),
    name: "E-commerce Case Study",
    templateId: templates[2].id,
    status: "scheduled",
    recipients: 120,
    opened: 0,
    clicked: 0,
    replied: 0,
    scheduled: "2023-10-15T08:00:00Z",
    createdAt: "2023-10-01T16:45:00Z"
  },
  {
    id: uuidv4(),
    name: "Agency Outreach",
    templateId: templates[0].id,
    status: "draft",
    recipients: 0,
    opened: 0,
    clicked: 0,
    replied: 0,
    createdAt: "2023-10-05T13:10:00Z"
  },
];

// Contacts
export const contacts: Contact[] = [
  {
    id: uuidv4(),
    email: "sarah.johnson@techstartup.com",
    firstName: "Sarah",
    lastName: "Johnson",
    company: "TechStartup Inc.",
    position: "Marketing Director",
    tags: ["tech", "startup", "marketing"],
    status: "active",
    lastContacted: "2023-08-18T09:00:00Z",
    history: [
      {
        id: uuidv4(),
        campaignId: campaigns[0].id,
        campaignName: campaigns[0].name,
        date: "2023-08-18T09:00:00Z",
        subject: "Quick question about TechStartup Inc.",
        status: "opened",
      },
      {
        id: uuidv4(),
        campaignId: campaigns[1].id,
        campaignName: campaigns[1].name,
        date: "2023-09-01T11:20:00Z",
        subject: "Following up on my previous email",
        status: "replied",
        reply: "Thanks for reaching out. Let's schedule a call next week."
      }
    ]
  },
  {
    id: uuidv4(),
    email: "michael.smith@saascompany.io",
    firstName: "Michael",
    lastName: "Smith",
    company: "SaaS Company",
    position: "CEO",
    tags: ["saas", "decision maker"],
    status: "active",
    lastContacted: "2023-09-01T11:20:00Z",
    history: [
      {
        id: uuidv4(),
        campaignId: campaigns[0].id,
        campaignName: campaigns[0].name,
        date: "2023-08-18T09:00:00Z",
        subject: "Quick question about SaaS Company",
        status: "clicked",
      }
    ]
  },
  {
    id: uuidv4(),
    email: "jennifer.lee@ecomstore.com",
    firstName: "Jennifer",
    lastName: "Lee",
    company: "EcomStore",
    position: "Growth Manager",
    tags: ["ecommerce", "growth"],
    status: "unsubscribed",
    lastContacted: "2023-08-18T09:00:00Z",
    history: [
      {
        id: uuidv4(),
        campaignId: campaigns[0].id,
        campaignName: campaigns[0].name,
        date: "2023-08-18T09:00:00Z",
        subject: "Quick question about EcomStore",
        status: "delivered",
      }
    ]
  }
];

// Email Providers
export const emailProviders: EmailProvider[] = [
  {
    id: uuidv4(),
    name: "Work Gmail",
    type: "gmail",
    email: "john.doe@company.com",
    connected: true,
    dailyLimit: 500,
    sent: 325
  },
  {
    id: uuidv4(),
    name: "Outlook Account",
    type: "outlook",
    email: "john.doe@outlook.com",
    connected: false,
    dailyLimit: 300,
    sent: 0
  },
  {
    id: uuidv4(),
    name: "SMTP Server",
    type: "smtp",
    email: "sales@company.com",
    connected: true,
    dailyLimit: 2000,
    sent: 857
  }
];

// Chart data for analytics
export const performanceData: ChartData[] = [
  {
    name: "Mon",
    delivered: 145,
    opened: 95,
    clicked: 40,
    replied: 18
  },
  {
    name: "Tue",
    delivered: 132,
    opened: 92,
    clicked: 38,
    replied: 15
  },
  {
    name: "Wed",
    delivered: 164,
    opened: 108,
    clicked: 48,
    replied: 22
  },
  {
    name: "Thu",
    delivered: 187,
    opened: 125,
    clicked: 52,
    replied: 24
  },
  {
    name: "Fri",
    delivered: 156,
    opened: 95,
    clicked: 43,
    replied: 19
  },
  {
    name: "Sat",
    delivered: 80,
    opened: 48,
    clicked: 20,
    replied: 8
  },
  {
    name: "Sun",
    delivered: 67,
    opened: 35,
    clicked: 15,
    replied: 5
  }
];
