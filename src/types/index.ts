import { ReactNode } from 'react';

export interface Template {
  id: string;
  name: string;
  subject: string;
  content: string;
  html: string;
  elements: TemplateElement[];
  components?: EmailComponent[];
  styles?: {
    backgroundColor?: string;
    backgroundImage?: string;
    backgroundSize?: string;
    backgroundRepeat?: string;
    backgroundPosition?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface TemplateElement {
  id: string;
  type: 'text' | 'image' | 'button' | 'divider' | 'spacer' | 'animation';
  content?: string;
  src?: string;
  width?: number;
  height?: number;
  style?: Record<string, any>;
  position?: { x: number; y: number };
  link?: string;
  animation?: {
    preset: string;
    duration: number;
    delay: number;
    repeat: number;
    easing: string;
  };
}

export interface EmailComponent {
  id: string;
  type: 'text' | 'image' | 'button' | 'divider' | 'spacer' | 'container' | 'columns' | 'text-image';
  content?: string;
  src?: string;
  alt?: string;
  url?: string;
  styles?: Record<string, any>;
  textStyles?: Record<string, any>;
  imageStyles?: Record<string, any>;
  columns?: {
    id: string;
    components: EmailComponent[];
    styles: Record<string, any>;
  }[];
  imagePosition?: 'left' | 'right';
  imageWidth?: string;
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
  createdAt: string;
  updatedAt?: string;
  userId?: string;
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

export interface UserSettings {
  theme: string;
  emailSignature: string;
  defaultFromName: string;
  defaultFromEmail: string;
}

export interface User {
  id: string;
  email: string;
  displayName: string;
  settings?: UserSettings;
  createdAt?: any;
  updatedAt?: any;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}
