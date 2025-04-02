
export interface Template {
  id: string;
  name: string;
  subject: string;
  content: string;
  html: string;
  elements: TemplateElement[];
  createdAt: string;
  updatedAt: string;
}

export interface TemplateElement {
  id: string;
  type: 'text' | 'image' | 'button' | 'divider' | 'spacer';
  content?: string;
  src?: string;
  width?: number;
  height?: number;
  style?: Record<string, any>;
  position?: { x: number; y: number };
  link?: string;
}

export interface Campaign {
  id: string;
  name: string;
  templateId: string;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused';
  recipients: number;
  opened: number;
  clicked: number;
  replied: number;
  scheduled?: string;
  sentAt?: string;
  createdAt: string;
}

export interface Contact {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  position?: string;
  tags?: string[];
  status: 'active' | 'unsubscribed' | 'bounced';
  lastContacted?: string;
  history: EmailHistory[];
}

export interface EmailHistory {
  id: string;
  campaignId: string;
  campaignName: string;
  date: string;
  subject: string;
  status: 'delivered' | 'opened' | 'clicked' | 'replied' | 'bounced';
  reply?: string;
}

export interface EmailProvider {
  id: string;
  name: string;
  type: 'gmail' | 'outlook' | 'smtp' | 'api';
  email: string;
  connected: boolean;
  dailyLimit: number;
  sent: number;
}

export interface StatsCard {
  title: string;
  value: number | string;
  change?: number;
  icon: React.ComponentType<any>;
}

export interface ChartData {
  name: string;
  delivered: number;
  opened: number;
  clicked: number;
  replied: number;
}
