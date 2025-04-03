import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { 
  Card, 
  CardContent 
} from "@/components/ui/card";
import { 
  ResizablePanelGroup, 
  ResizablePanel, 
  ResizableHandle 
} from "@/components/ui/resizable";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { templates } from "@/data/mockData";
import { Template, TemplateElement, EmailComponent } from "@/types";
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  Code, 
  MousePointer, 
} from "lucide-react";
import { v4 as uuidv4 } from "uuid";

// Import new template editor components
import ComponentSidebar from "@/components/templateEditor/ComponentSidebar";
import EmailCanvas from "@/components/templateEditor/EmailCanvas";
import PropertiesSidebar from "@/components/templateEditor/PropertiesSidebar";
import Header from "@/components/templateEditor/Header";
import CodeView from "@/components/templateEditor/CodeView";
import AIImageDialog from "@/components/templateEditor/AIImageDialog";

const TemplateEditorNew = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState("design");
  const [previewMode, setPreviewMode] = useState(false);
  const [layoutType, setLayoutType] = useState<"desktop" | "mobile">("desktop");
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
  const [historySteps, setHistorySteps] = useState<any[]>([]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(0);
  
  // New state for email components
  const [emailComponents, setEmailComponents] = useState<EmailComponent[]>([]);
  const [emailStyles, setEmailStyles] = useState({
    backgroundColor: "#FFFFFF",
    backgroundImage: "",
    backgroundSize: "cover",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center center"
  });
  
  // UI state for sidebars
  const [componentSidebarCollapsed, setComponentSidebarCollapsed] = useState(false);
  const [propertiesSidebarCollapsed, setPropertiesSidebarCollapsed] = useState(false);
  
  // Sample data for placeholders in preview mode
  const previewData = {
    firstName: "John",
    lastName: "Doe",
    company: "Acme Inc.",
    position: "Marketing Manager",
    email: "john.doe@example.com"
  };
  
  const emptyTemplate = {
    id: uuidv4(),
    name: "Untitled Template",
    subject: "",
    content: "",
    html: "",
    components: [],
    styles: emailStyles,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  const [template, setTemplate] = useState<any>(emptyTemplate);
  
  useEffect(() => {
    if (id) {
      const existingTemplate = templates.find(t => t.id === id);
      if (existingTemplate) {
        setTemplate(existingTemplate);
        
        // Convert old template elements to new email components if needed
        if (existingTemplate.elements && existingTemplate.elements.length > 0) {
          const convertedComponents = convertOldElementsToNewComponents(existingTemplate.elements);
          setEmailComponents(convertedComponents);
        } else if (existingTemplate.components) {
          setEmailComponents(existingTemplate.components);
        }
        
        // Set email styles if available
        if (existingTemplate.styles) {
          setEmailStyles(existingTemplate.styles);
        }
        
        // Initialize history with the loaded template
        setHistorySteps([existingTemplate]);
      }
    } else {
      // Initialize history with the empty template
      setHistorySteps([emptyTemplate]);
    }
  }, [id]);
  
  // Convert old template elements to new email components format
  const convertOldElementsToNewComponents = (elements: TemplateElement[]): EmailComponent[] => {
    return elements.map(element => {
      let component: EmailComponent = {
        id: element.id,
        type: element.type as EmailComponent['type'],
        content: element.content || '',
        styles: {
          width: element.width ? `${element.width}px` : '100%',
          height: element.height ? `${element.height}px` : 'auto',
        }
      };
      
      if (element.type === 'image' && element.src) {
        component.src = element.src;
        component.alt = "Image";
      }
      
      if (element.type === 'button' && element.link) {
        component.url = element.link;
        component.styles = {
          ...component.styles,
          backgroundColor: '#3B82F6',
          color: '#FFFFFF',
          paddingY: 10,
          paddingX: 20,
          borderRadius: 4,
          textAlign: 'center',
          cursor: 'pointer',
          fontWeight: 'bold',
        };
      }
      
      return component;
    });
  };
  
  // Add template change to history
  const addToHistory = (updatedTemplate: any) => {
    // If we're not at the end of history, truncate history
    const newHistory = historySteps.slice(0, currentHistoryIndex + 1);
    
    // Add new state to history
    newHistory.push({
      ...updatedTemplate,
      updatedAt: new Date().toISOString()
    });
    
    // Limit history to 50 steps
    if (newHistory.length > 50) {
      newHistory.shift();
    }
    
    setHistorySteps(newHistory);
    setCurrentHistoryIndex(newHistory.length - 1);
  };
  
  // Undo changes
  const undo = () => {
    if (currentHistoryIndex > 0) {
      setCurrentHistoryIndex(currentHistoryIndex - 1);
      const previousState = historySteps[currentHistoryIndex - 1];
      setTemplate(previousState);
      
      if (previousState.components) {
        setEmailComponents(previousState.components);
      }
      
      if (previousState.styles) {
        setEmailStyles(previousState.styles);
      }
    }
  };
  
  // Redo changes
  const redo = () => {
    if (currentHistoryIndex < historySteps.length - 1) {
      setCurrentHistoryIndex(currentHistoryIndex + 1);
      const nextState = historySteps[currentHistoryIndex + 1];
      setTemplate(nextState);
      
      if (nextState.components) {
        setEmailComponents(nextState.components);
      }
      
      if (nextState.styles) {
        setEmailStyles(nextState.styles);
      }
    }
  };
  
  // Parse placeholders in content
  const parsePlaceholders = (content: string | undefined): string => {
    if (!content) return '';
    
    return content.replace(/\{\{(\w+)\}\}/g, (match, placeholder) => {
      return previewData[placeholder as keyof typeof previewData] || match;
    });
  };
  
  // Handle saving the template
  const handleSaveTemplate = () => {
    const updatedTemplate = {
      ...template,
      components: emailComponents,
      styles: emailStyles,
      updatedAt: new Date().toISOString()
    };
    
    // Save logic would go here
    
    toast({
      title: "Template Saved",
      description: "Your template has been saved successfully!"
    });
    
    // Navigate back to templates page
    setTimeout(() => navigate("/templates"), 500);
  };
  
  // Handle component selection
  const handleSelectComponent = (id: string | null) => {
    setSelectedComponentId(id);
  };
  
  // Handle component updates
  const handleUpdateComponents = (updatedComponents: EmailComponent[]) => {
    setEmailComponents(updatedComponents);
    
    const updatedTemplate = {
      ...template,
      components: updatedComponents
    };
    
    setTemplate(updatedTemplate);
    addToHistory(updatedTemplate);
  };
  
  // Handle email styles changes
  const handleEmailStylesChange = (styles: any) => {
    setEmailStyles(styles);
    
    const updatedTemplate = {
      ...template,
      styles
    };
    
    setTemplate(updatedTemplate);
    addToHistory(updatedTemplate);
  };
  
  // Handle component drag start
  const handleComponentDragStart = (type: string, content?: string) => {
    // This function can be used for analytics or other side effects when dragging starts
    console.log(`Started dragging ${type} component`);
  };
  
  // Handle component update
  const handleComponentUpdate = (updatedComponent: EmailComponent) => {
    const updatedComponents = emailComponents.map(comp => 
      comp.id === updatedComponent.id ? updatedComponent : comp
    );
    
    handleUpdateComponents(updatedComponents);
  };
  
  // Generate HTML from components
  const generateHtml = () => {
    // This would be a more complex function to generate HTML from components
    // For now, we'll return a simple template
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${template.name}</title>
  <style>
    body { 
      font-family: Arial, sans-serif; 
      line-height: 1.6; 
      margin: 0;
      padding: 0;
      background-color: ${emailStyles.backgroundColor || '#FFFFFF'};
      ${emailStyles.backgroundImage ? `background-image: ${emailStyles.backgroundImage};` : ''}
      ${emailStyles.backgroundSize ? `background-size: ${emailStyles.backgroundSize};` : ''}
      ${emailStyles.backgroundRepeat ? `background-repeat: ${emailStyles.backgroundRepeat};` : ''}
      ${emailStyles.backgroundPosition ? `background-position: ${emailStyles.backgroundPosition};` : ''}
    }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .content { margin-bottom: 30px; }
    .footer { text-align: center; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="content">
      ${emailComponents.map(component => {
        if (component.type === 'text') {
          return `<div style="${Object.entries(component.styles || {}).map(([key, value]) => `${key}: ${value}`).join(';')}">${component.content}</div>`;
        } else if (component.type === 'image') {
          return `<img src="${component.src}" alt="${component.alt || ''}" style="${Object.entries(component.styles || {}).map(([key, value]) => `${key}: ${value}`).join(';')}" />`;
        } else if (component.type === 'button') {
          return `<a href="${component.url || '#'}" style="${Object.entries(component.styles || {}).map(([key, value]) => `${key}: ${value}`).join(';')}">${component.content}</a>`;
        } else if (component.type === 'divider') {
          return `<hr style="${Object.entries(component.styles || {}).map(([key, value]) => `${key}: ${value}`).join(';')}" />`;
        } else if (component.type === 'spacer') {
          return `<div style="height: ${component.styles?.height || '20px'}"></div>`;
        }
        return '';
      }).join('\n')}
    </div>
    <div class="footer">
      <p>Your Company | Address | <a href="mailto:info@company.com">info@company.com</a></p>
    </div>
  </div>
</body>
</html>`;
  };
  
  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="border-b">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigate("/templates")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <Input
                value={template.name}
                onChange={(e) => {
                  const updatedTemplate = { ...template, name: e.target.value };
                  setTemplate(updatedTemplate);
                  addToHistory(updatedTemplate);
                }}
                className="text-xl font-bold border-0 border-b border-dashed border-transparent hover:border-input focus-visible:border-input transition-all bg-transparent px-0 py-1"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setPreviewMode(!previewMode)}>
              <Eye className="mr-2 h-4 w-4" />
              {previewMode ? "Edit" : "Preview"}
            </Button>
            <Button onClick={handleSaveTemplate} className="bg-brand-purple hover:bg-brand-purple/90">
              <Save className="mr-2 h-4 w-4" />
              Save
            </Button>
          </div>
        </div>
        
        {!previewMode && (
          <Tabs defaultValue="design" value={activeTab} onValueChange={setActiveTab} className="px-4">
            <TabsList>
              <TabsTrigger value="design" className="flex items-center">
                <MousePointer className="mr-2 h-4 w-4" />
                Design
              </TabsTrigger>
              <TabsTrigger value="code" className="flex items-center">
                <Code className="mr-2 h-4 w-4" />
                HTML
              </TabsTrigger>
            </TabsList>
          </Tabs>
        )}
      </div>
      
      {/* Main Content */}
      {!previewMode ? (
        activeTab === "design" ? (
          <div className="flex-1 flex overflow-hidden">
            {/* Component Sidebar */}
            <ComponentSidebar 
              collapsed={componentSidebarCollapsed}
              onToggle={() => setComponentSidebarCollapsed(!componentSidebarCollapsed)}
              onDragStart={handleComponentDragStart}
            />
            
            {/* Email Canvas */}
            <div className="flex-1 overflow-auto p-6 bg-muted/30">
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Email Subject</label>
                <Input 
                  value={template.subject}
                  onChange={(e) => {
                    const updatedTemplate = { ...template, subject: e.target.value };
                    setTemplate(updatedTemplate);
                    addToHistory(updatedTemplate);
                  }}
                  placeholder="Enter subject line..."
                  className="w-full"
                />
              </div>
              
              <EmailCanvas 
                components={emailComponents}
                viewMode={layoutType}
                selectedComponentId={selectedComponentId}
                onSelectComponent={handleSelectComponent}
                onUpdateComponents={handleUpdateComponents}
                emailStyles={emailStyles}
                onEmailStylesChange={handleEmailStylesChange}
              />
            </div>
            
            {/* Properties Sidebar */}
            <PropertiesSidebar 
              collapsed={propertiesSidebarCollapsed}
              onToggle={() => setPropertiesSidebarCollapsed(!propertiesSidebarCollapsed)}
              selectedComponent={emailComponents.find(comp => comp.id === selectedComponentId) || null}
              onComponentUpdate={handleComponentUpdate}
            />
          </div>
        ) : (
          <div className="flex-1 p-6 overflow-auto">
            <CodeView 
              html={template.html || generateHtml()}
              onChange={(html) => {
                const updatedTemplate = { ...template, html };
                setTemplate(updatedTemplate);
                addToHistory(updatedTemplate);
              }}
            />
          </div>
        )
      ) : (
        <div className="flex-1 overflow-auto p-6 bg-muted/30">
          <div className="border rounded-lg p-4 bg-white">
            <div className="mb-4 pb-4 border-b flex justify-between items-center">
              <div>
                <h3 className="font-medium">Preview Mode</h3>
                <p className="text-sm text-muted-foreground">This is how your email will appear to recipients</p>
              </div>
              <Button variant="outline" onClick={() => setPreviewMode(false)}>
                Back to Editor
              </Button>
            </div>
            
            <div className="max-w-2xl mx-auto border rounded-lg p-6 bg-white shadow-sm">
              <div 
                className="email-preview"
                style={{
                  backgroundColor: emailStyles.backgroundColor,
                  backgroundImage: emailStyles.backgroundImage,
                  backgroundSize: emailStyles.backgroundSize,
                  backgroundRepeat: emailStyles.backgroundRepeat,
                  backgroundPosition: emailStyles.backgroundPosition,
                }}
              >
                <div dangerouslySetInnerHTML={{ __html: parsePlaceholders(generateHtml()) }} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateEditorNew;
