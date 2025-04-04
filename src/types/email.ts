
import { EmailComponent } from './index';

export type { EmailComponent };

export interface ComponentSettingsProps {
  collapsed: boolean;
  onToggle: () => void;
  selectedComponent: EmailComponent | null;
  onComponentUpdate: (updatedComponent: EmailComponent) => void;
}
