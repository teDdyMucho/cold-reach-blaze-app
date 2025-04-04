
import { EmailComponent } from './index';

export interface ComponentSettingsProps {
  collapsed: boolean;
  onToggle: () => void;
  selectedComponent: EmailComponent;
  onComponentUpdate: (updatedComponent: EmailComponent) => void;
}
