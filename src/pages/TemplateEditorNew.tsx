import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PanelLeft, PanelRight, Save, Undo, Redo, AlignLeft, AlignCenter, AlignRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { v4 as uuidv4 } from "uuid";
import { Template, EmailComponent } from "@/types";
import ComponentSidebar from "@/components/templateEditor/ComponentSidebar";
import EmailCanvas from "@/components/templateEditor/EmailCanvas";
import ComponentSettings from "@/components/templateEditor/ComponentSettings";
import CodeView from "@/components/templateEditor/CodeView";
import { useToast } from "@/components/ui/use-toast";
import { saveTemplate, getTemplateById } from "@/lib/firebaseService";
import { useAuth } from "@/contexts/AuthContext";

interface EmailStyles {
  backgroundColor: string;
  backgroundImage: string;
  backgroundSize: string;
  backgroundRepeat: string;
  backgroundPosition: string;
}

const TemplateEditorNew = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState("design");
  const [previewMode, setPreviewMode] = useState(false);
  const [layoutType, setLayoutType] = useState<"desktop" | "mobile">("desktop");
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
  const [history, setHistory] = useState<Template[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // New state for email components
  const [emailComponents, setEmailComponents] = useState<EmailComponent[]>([]);
  const [emailStyles, setEmailStyles] = useState<EmailStyles>({
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
  
  // Empty template structure
  const emptyTemplate: Template = {
    id: uuidv4(),
    name: "Untitled Template",
    subject: "",
    content: "",
    html: "",
    elements: [],
    components: [],
    styles: {
      backgroundColor: "#FFFFFF",
      backgroundImage: "",
      backgroundSize: "cover",
      backgroundRepeat: "no-repeat",
      backgroundPosition: "center center"
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  const [template, setTemplate] = useState<Template>(emptyTemplate);
  
  useEffect(() => {
    const loadTemplate = async () => {
      if (id) {
        try {
          setIsLoading(true);
          const loadedTemplate = await getTemplateById(id);
          if (loadedTemplate) {
            setTemplate(loadedTemplate);
            setEmailComponents(loadedTemplate.components || []);
            setEmailStyles({
              backgroundColor: loadedTemplate.styles?.backgroundColor || "#FFFFFF",
              backgroundImage: loadedTemplate.styles?.backgroundImage || "",
              backgroundSize: loadedTemplate.styles?.backgroundSize || "cover",
              backgroundRepeat: loadedTemplate.styles?.backgroundRepeat || "no-repeat",
              backgroundPosition: loadedTemplate.styles?.backgroundPosition || "center center"
            });
            // Initialize history with the loaded template
            setHistory([loadedTemplate]);
            setHistoryIndex(0);
          }
        } catch (error) {
          console.error("Error loading template:", error);
          toast({
            title: "Error",
            description: "Failed to load template. Please try again.",
            variant: "destructive"
          });
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadTemplate();
  }, [id, toast]);

  // Save template to Firebase
  const handleSaveTemplate = async () => {
    try {
      setIsSaving(true);
      
      const templateToSave: Template = {
        ...template,
        components: emailComponents,
        styles: emailStyles,
        updatedAt: new Date().toISOString()
      };
      
      // If it's a new template, add createdAt
      if (!templateToSave.id) {
        templateToSave.createdAt = new Date().toISOString();
      }
      
      const savedId = await saveTemplate(templateToSave);
      
      // Update template ID if it's a new template
      if (!template.id) {
        setTemplate({ ...template, id: savedId });
      }
      
      toast({
        title: "Success",
        description: "Template saved successfully",
      });
      
    } catch (error) {
      console.error("Error saving template:", error);
      toast({
        title: "Error",
        description: "Failed to save template. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Add current state to history
  const addToHistory = (updatedTemplate: Template) => {
    // Truncate history if we're not at the latest state
    const newHistory = historyIndex < history.length - 1
      ? history.slice(0, historyIndex + 1)
      : history;
    
    // Add new state to history
    setHistory([...newHistory, updatedTemplate]);
    setHistoryIndex(newHistory.length);
  };

  // Undo function
  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      const previousState = history[historyIndex - 1];
      setTemplate(previousState);
      
      // Update components if they exist in the previous state
      if (previousState.components) {
        setEmailComponents(previousState.components);
      }
    }
  };

  // Redo function
  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      const nextState = history[historyIndex + 1];
      setTemplate(nextState);
      
      // Update components if they exist in the next state
      if (nextState.components) {
        setEmailComponents(nextState.components);
      }
    }
  };

  // Alignment functions
  const handleAlignComponents = (alignment: 'left' | 'center' | 'right') => {
    if (!selectedComponentId) return;
    
    const updatedComponents = emailComponents.map(component => {
      if (component.id === selectedComponentId) {
        return {
          ...component,
          styles: {
            ...component.styles,
            textAlign: alignment
          }
        };
      }
      return component;
    });
    
    setEmailComponents(updatedComponents);
    
    // Update template with new components
    const updatedTemplate = {
      ...template,
      components: updatedComponents
    };
    
    setTemplate(updatedTemplate);
    addToHistory(updatedTemplate);
  };
  
  // Parse placeholders in content
  const parsePlaceholders = (content: string | undefined): string => {
    if (!content) return '';
    
    return content.replace(/\{\{(\w+)\}\}/g, (match, placeholder) => {
      return previewData[placeholder as keyof typeof previewData] || match;
    });
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
  const handleEmailStylesChange = (styles: Partial<EmailStyles>) => {
    const updatedStyles: EmailStyles = {
      ...emailStyles,
      ...styles
    };
    setEmailStyles(updatedStyles);
    
    // Update template with new styles
    const updatedTemplate = { ...template, styles: updatedStyles };
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
    // Helper function to convert style object to CSS string
    const styleToString = (styles: Record<string, any> = {}) => {
      const cssProperties: string[] = [];
      
      // Handle special padding properties
      if (styles.paddingX !== undefined) {
        cssProperties.push(`padding-left: ${styles.paddingX}px`);
        cssProperties.push(`padding-right: ${styles.paddingX}px`);
      }
      
      if (styles.paddingY !== undefined) {
        cssProperties.push(`padding-top: ${styles.paddingY}px`);
        cssProperties.push(`padding-bottom: ${styles.paddingY}px`);
      }
      
      // Process all other styles
      Object.entries(styles).forEach(([key, value]) => {
        if (key !== 'paddingX' && key !== 'paddingY') {
          // Convert camelCase to kebab-case for CSS
          const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
          
          // Add px unit to numeric values if needed
          let cssValue = value;
          if (typeof value === 'number' && !['fontWeight', 'lineHeight', 'opacity', 'zIndex'].includes(key)) {
            cssValue = `${value}px`;
          }
          
          cssProperties.push(`${cssKey}: ${cssValue}`);
        }
      });
      
      return cssProperties.join('; ');
    };
    
    // Helper function to generate component HTML
    const renderComponent = (component: EmailComponent): string => {
      switch (component.type) {
        case 'text':
          return `<div style="${styleToString(component.styles)}">${component.content || ''}</div>`;
          
        case 'image':
          return `<img src="${component.src || 'https://placehold.co/600x200/e2e8f0/1e40af?text=Image'}" alt="${component.alt || ''}" style="${styleToString(component.styles)}" />`;
          
        case 'button':
          return `<div style="text-align: ${component.styles?.textAlign || 'center'}; width: 100%;">
  <a href="${component.url || '#'}" style="${styleToString(component.styles)}">${component.content || 'Button'}</a>
</div>`;
          
        case 'divider':
          return `<hr style="${styleToString(component.styles)}" />`;
          
        case 'spacer':
          return `<div style="${styleToString(component.styles)}"></div>`;
          
        case 'container':
          return `<div style="${styleToString(component.styles)}">${component.content || ''}</div>`;
          
        case 'columns':
          if (!component.columns) return '';
          
          return `<div style="${styleToString(component.styles)}">
  ${component.columns.map(column => 
    `<div style="${styleToString(column.styles)}">
      ${column.components?.map(comp => renderComponent(comp)).join('\n      ') || ''}
    </div>`
  ).join('\n  ')}
</div>`;
          
        case 'text-image':
          return `<div style="${styleToString(component.styles)}">
  <div style="${styleToString(component.textStyles)}">${component.content || ''}</div>
  <img src="${component.src || 'https://placehold.co/600x200/e2e8f0/1e40af?text=Image'}" alt="${component.alt || ''}" style="${styleToString(component.imageStyles)}" />
</div>`;
          
        default:
          return '';
      }
    };
    
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
    }
    .email-background {
      background-color: ${emailStyles.backgroundColor || '#FFFFFF'};
      ${emailStyles.backgroundImage ? `background-image: url(${emailStyles.backgroundImage});` : ''}
      ${emailStyles.backgroundSize ? `background-size: ${emailStyles.backgroundSize};` : ''}
      ${emailStyles.backgroundRepeat ? `background-repeat: ${emailStyles.backgroundRepeat};` : ''}
      ${emailStyles.backgroundPosition ? `background-position: ${emailStyles.backgroundPosition};` : ''}
      width: 100%;
      min-height: 100vh;
    }
    .container { 
      max-width: 600px; 
      margin: 0 auto; 
      padding: 20px;
      background-color: #ffffff;
    }
    .content { margin-bottom: 30px; }
    .footer { text-align: center; font-size: 12px; color: #666; }
    a { color: #0066cc; text-decoration: none; }
    a:hover { text-decoration: underline; }
    img { max-width: 100%; height: auto; }
  </style>
</head>
<body>
  <div class="email-background">
    <div class="container">
      <div class="content">
        ${emailComponents.map(component => renderComponent(component)).join('\n      ')}
      </div>
      <div class="footer">
        <p>Your Company | Address | <a href="mailto:info@company.com">info@company.com</a></p>
        <p><small>To unsubscribe, <a href="#unsubscribe">click here</a></small></p>
      </div>
    </div>
  </div>
</body>
</html>`;
  };

  return (
    <div className="flex h-full w-full overflow-hidden">
      {/* Left Sidebar */}
      <div className={cn(
        "h-full border-r bg-muted/30",
        "transition-all duration-200 ease-in-out",
        componentSidebarCollapsed ? "w-16" : "w-72"
      )}>
        <div className="h-full overflow-y-auto">
          <ComponentSidebar 
            collapsed={componentSidebarCollapsed}
            onToggle={() => setComponentSidebarCollapsed(!componentSidebarCollapsed)}
            onDragStart={handleComponentDragStart}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full">
        {/* Toolbar */}
        <div className="flex items-center justify-between border-b bg-muted/30 px-4 py-2">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setComponentSidebarCollapsed(!componentSidebarCollapsed)}
            >
              <PanelLeft className="h-4 w-4" />
            </Button>
            <Input
              className="w-60"
              placeholder="Template Name"
              value={template.name}
              onChange={(e) => setTemplate(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Undo/Redo buttons */}
            <Button
              variant="ghost"
              size="icon"
              disabled={historyIndex === 0}
              onClick={handleUndo}
            >
              <Undo className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              disabled={historyIndex >= history.length - 1}
              onClick={handleRedo}
            >
              <Redo className="h-4 w-4" />
            </Button>
            
            {/* Text alignment buttons - only show when a text component is selected */}
            {selectedComponentId && (
              <div className="flex items-center ml-4 border-l pl-4">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleAlignComponents('left')}
                  className="h-8 w-8"
                >
                  <AlignLeft className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleAlignComponents('center')}
                  className="h-8 w-8"
                >
                  <AlignCenter className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleAlignComponents('right')}
                  className="h-8 w-8"
                >
                  <AlignRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 flex">
          {!previewMode ? (
            activeTab !== "code" ? (
              <div className="flex-1 flex flex-col h-full">
                <div className="flex-1 overflow-auto bg-muted/30">
                  <div className="mx-4 my-4">
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
                  
                  <div className="mx-4 mb-4">
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
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-auto p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h3 className="font-medium">HTML Code</h3>
                    <CodeView 
                      html={template.html || generateHtml()}
                      onChange={(html) => {
                        const updatedTemplate = { ...template, html };
                        setTemplate(updatedTemplate);
                        addToHistory(updatedTemplate);
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-medium">Preview</h3>
                    <div className="border rounded-lg bg-white p-4 h-[500px] overflow-auto">
                      <iframe
                        srcDoc={template.html || generateHtml()}
                        title="Email Preview"
                        className="w-full h-full border-0"
                        sandbox="allow-same-origin"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )
          ) : (
            <div className="flex-1 overflow-auto bg-muted/30">
              <div className="border rounded-lg p-4 bg-white m-4">
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
                      backgroundImage: emailStyles.backgroundImage ? `url(${emailStyles.backgroundImage})` : 'none',
                      backgroundSize: emailStyles.backgroundSize,
                      backgroundRepeat: emailStyles.backgroundRepeat,
                      backgroundPosition: emailStyles.backgroundPosition
                    }}
                  >
                    <div dangerouslySetInnerHTML={{ __html: parsePlaceholders(generateHtml()) }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Right Sidebar */}
          <div className={cn(
            "h-full border-l bg-muted/30",
            "transition-all duration-200 ease-in-out",
            propertiesSidebarCollapsed ? "w-0" : "w-72"
          )}>
            <div className="h-full overflow-y-auto p-4">
              {selectedComponentId ? (
                <ComponentSettings 
                  collapsed={propertiesSidebarCollapsed}
                  onToggle={() => setPropertiesSidebarCollapsed(!propertiesSidebarCollapsed)}
                  selectedComponent={emailComponents.find(comp => comp.id === selectedComponentId) || null}
                  onComponentUpdate={handleComponentUpdate}
                />
              ) : (
                <div>
                  <h3 className="font-medium">Email Styles</h3>
                  <p className="text-sm text-muted-foreground">Customize the styles of your email</p>
                  <div className="mt-4">
                    <label className="block text-sm font-medium mb-1">Background Color</label>
                    <Input 
                      value={emailStyles.backgroundColor}
                      onChange={(e) => {
                        handleEmailStylesChange({ backgroundColor: e.target.value });
                      }}
                      placeholder="Enter background color..."
                      className="w-full"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateEditorNew;
