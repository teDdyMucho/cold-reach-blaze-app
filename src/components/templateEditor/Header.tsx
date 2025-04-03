import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Download, 
  Mail, 
  Eye, 
  Code, 
  Smartphone, 
  Laptop, 
  Undo2, 
  Redo2
} from "lucide-react";

interface HeaderProps {
  viewMode: 'desktop' | 'mobile';
  codeView: boolean;
  onViewModeChange: (mode: 'desktop' | 'mobile') => void;
  onCodeViewToggle: () => void;
  onExportHtml: () => void;
}

const Header = ({ 
  viewMode, 
  codeView, 
  onViewModeChange, 
  onCodeViewToggle,
  onExportHtml
}: HeaderProps) => {
  const { toast } = useToast();

  const handleSave = () => {
    toast({
      title: "Template saved",
      description: "Your email template has been saved successfully.",
    });
  };

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white border-b shadow-sm">
      <div className="flex items-center gap-2">
        <Mail className="h-6 w-6 text-primary" />
        <h1 className="text-xl font-bold">MailCanvas Studio</h1>
      </div>
      
      <div className="flex items-center space-x-1">
        <Button variant="ghost" size="icon" disabled>
          <Undo2 className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" disabled>
          <Redo2 className="h-5 w-5" />
        </Button>
        <Separator orientation="vertical" className="h-6 mx-2" />
        <Button 
          variant={viewMode === 'desktop' ? "default" : "ghost"} 
          size="icon"
          onClick={() => onViewModeChange('desktop')}
        >
          <Laptop className="h-5 w-5" />
        </Button>
        <Button 
          variant={viewMode === 'mobile' ? "default" : "ghost"} 
          size="icon"
          onClick={() => onViewModeChange('mobile')}
        >
          <Smartphone className="h-5 w-5" />
        </Button>
        <Separator orientation="vertical" className="h-6 mx-2" />
        <Button 
          variant={codeView ? "default" : "ghost"}
          onClick={onCodeViewToggle}
        >
          {codeView ? <Eye className="h-5 w-5 mr-2" /> : <Code className="h-5 w-5 mr-2" />}
          {codeView ? "Preview" : "HTML"}
        </Button>
        <Button
          variant="outline"
          onClick={handleSave}
        >
          Save
        </Button>
        <Button 
          onClick={onExportHtml}
        >
          <Download className="h-5 w-5 mr-2" />
          Export
        </Button>
      </div>
    </header>
  );
};

export default Header;