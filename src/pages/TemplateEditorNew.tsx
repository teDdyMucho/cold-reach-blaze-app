
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
import { Template, TemplateElement } from "@/types";
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  Code, 
  Image as ImageIcon, 
  Type, 
  Square, 
  MousePointer, 
  Plus, 
  Trash2, 
  Layout, 
  MoveHorizontal, 
  AlignCenter, 
  AlignLeft, 
  AlignRight, 
  ChevronDown, 
  Copy, 
  RotateCcw,
  Video,
  Sparkles
} from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import TemplateElementEditor from "@/components/templates/TemplateElementEditor";
import AnimationEditor from "@/components/canvas/AnimationEditor";

const TemplateEditorNew = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState("design");
  const [previewMode, setPreviewMode] = useState(false);
  const [showAnimationEditor, setShowAnimationEditor] = useState(false);
  const [layoutType, setLayoutType] = useState<"desktop" | "mobile">("desktop");
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [historySteps, setHistorySteps] = useState<Template[]>([]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(0);
  const [showGifSelectorDialog, setShowGifSelectorDialog] = useState(false);
  const [createdGifs, setCreatedGifs] = useState<string[]>([]);
  
  // Sample data for placeholders in preview mode
  const previewData = {
    firstName: "John",
    lastName: "Doe",
    company: "Acme Inc.",
    position: "Marketing Manager",
    email: "john.doe@example.com"
  };
  
  const emptyTemplate: Template = {
    id: uuidv4(),
    name: "Untitled Template",
    subject: "",
    content: "",
    html: "",
    elements: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  const [template, setTemplate] = useState<Template>(emptyTemplate);
  
  useEffect(() => {
    if (id) {
      const existingTemplate = templates.find(t => t.id === id);
      if (existingTemplate) {
        setTemplate(existingTemplate);
        // Initialize history with the loaded template
        setHistorySteps([existingTemplate]);
      }
    } else {
      // Initialize history with the empty template
      setHistorySteps([emptyTemplate]);
    }
  }, [id]);
  
  // Add template change to history
  const addToHistory = (updatedTemplate: Template) => {
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
      setTemplate(historySteps[currentHistoryIndex - 1]);
    }
  };
  
  // Redo changes
  const redo = () => {
    if (currentHistoryIndex < historySteps.length - 1) {
      setCurrentHistoryIndex(currentHistoryIndex + 1);
      setTemplate(historySteps[currentHistoryIndex + 1]);
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
    toast({
      title: "Template Saved",
      description: "Your template has been saved successfully!"
    });
    
    // Navigate back to templates page
    setTimeout(() => navigate("/templates"), 500);
  };
  
  // Handle adding new elements
  const handleAddElement = (type: string) => {
    const newElement: TemplateElement = {
      id: uuidv4(),
      type: type as 'text' | 'image' | 'button' | 'divider' | 'spacer',
      content: type === 'text' ? 'Edit this text' : type === 'button' ? 'Click Here' : undefined,
      src: type === 'image' ? 'https://via.placeholder.com/600x200' : undefined,
      width: type === 'image' ? 600 : undefined,
      height: type === 'image' ? 200 : undefined,
    };
    
    const updatedTemplate = {
      ...template,
      elements: [...template.elements, newElement]
    };
    
    setTemplate(updatedTemplate);
    addToHistory(updatedTemplate);
    setSelectedElement(newElement.id);
    
    toast({
      title: "Element Added",
      description: `New ${type} element added to your template.`
    });
  };
  
  // Handle updating elements
  const handleUpdateElement = (id: string, updatedElement: TemplateElement) => {
    const updatedTemplate = {
      ...template,
      elements: template.elements.map(el => 
        el.id === id ? { ...updatedElement } : el
      )
    };
    
    setTemplate(updatedTemplate);
    addToHistory(updatedTemplate);
  };
  
  // Handle duplicating elements
  const handleDuplicateElement = (id: string) => {
    const elementToDuplicate = template.elements.find(el => el.id === id);
    
    if (elementToDuplicate) {
      const duplicatedElement = {
        ...elementToDuplicate,
        id: uuidv4()
      };
      
      const updatedTemplate = {
        ...template,
        elements: [...template.elements, duplicatedElement]
      };
      
      setTemplate(updatedTemplate);
      addToHistory(updatedTemplate);
      setSelectedElement(duplicatedElement.id);
      
      toast({
        title: "Element Duplicated",
        description: `Element has been duplicated successfully.`
      });
    }
  };
  
  // Handle deleting elements
  const handleDeleteElement = (id: string) => {
    const updatedTemplate = {
      ...template,
      elements: template.elements.filter(el => el.id !== id)
    };
    
    setTemplate(updatedTemplate);
    addToHistory(updatedTemplate);
    setSelectedElement(null);
    
    toast({
      title: "Element Deleted",
      description: "The element has been removed from your template."
    });
  };
  
  // Default HTML template with sanitized placeholders
  const defaultHtmlTemplate = `<!DOCTYPE html>
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
      <p>Edit your HTML content here...</p>
    </div>
    <div class="footer">
      <p>Your Company | Address | <a href="mailto:info@company.com">info@company.com</a></p>
    </div>
  </div>
</body>
</html>`;

  // Handle saving animated GIF
  const handleSaveAnimatedGif = (gifUrl: string) => {
    setCreatedGifs([...createdGifs, gifUrl]);
    setShowAnimationEditor(false);
    
    toast({
      title: "GIF Created",
      description: "Your animated GIF has been created and is ready to use in your template."
    });
  };
  
  // Add GIF to template
  const handleAddGifToTemplate = (gifUrl: string) => {
    handleAddElement("image");
    
    // Find the last added element (which should be the image we just added)
    const newImageElement = template.elements[template.elements.length - 1];
    
    // Update this element with the GIF URL
    handleUpdateElement(newImageElement.id, {
      ...newImageElement,
      src: gifUrl
    });
    
    setShowGifSelectorDialog(false);
    
    toast({
      title: "GIF Added",
      description: "Your animated GIF has been added to the template."
    });
  };
  
  // Render element design panel with resizable components
  const renderElementDesignPanel = () => (
    <div className="border rounded-lg p-4 min-h-[500px] relative bg-background">
      <div className="mb-4 flex justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant={layoutType === "desktop" ? "default" : "outline"}
            size="sm"
            onClick={() => setLayoutType("desktop")}
            className="h-8"
          >
            <Layout className="h-4 w-4 mr-2" />
            Desktop
          </Button>
          <Button
            variant={layoutType === "mobile" ? "default" : "outline"}
            size="sm"
            onClick={() => setLayoutType("mobile")}
            className="h-8"
          >
            <MoveHorizontal className="h-4 w-4 mr-2" />
            Mobile
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={undo}
            disabled={currentHistoryIndex <= 0}
            className="h-8"
          >
            <RotateCcw className="h-4 w-4" />
            <span className="sr-only">Undo</span>
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                <AlignLeft className="h-4 w-4 mr-2" />
                Align
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>
                <AlignLeft className="h-4 w-4 mr-2" />
                Align Left
              </DropdownMenuItem>
              <DropdownMenuItem>
                <AlignCenter className="h-4 w-4 mr-2" />
                Center
              </DropdownMenuItem>
              <DropdownMenuItem>
                <AlignRight className="h-4 w-4 mr-2" />
                Align Right
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <div className={`mx-auto transition-all ${layoutType === "mobile" ? "max-w-sm" : "max-w-2xl"}`}>
        {template.elements.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96 text-center text-muted-foreground">
            <div className="mb-4 bg-accent rounded-full p-3">
              <MousePointer className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-medium mb-2">Start Building Your Template</h3>
            <p className="max-w-md mb-4">
              Add elements from the sidebar to build your email template or choose from our templates gallery.
            </p>
            <div className="flex gap-2">
              <Button onClick={() => handleAddElement("text")}>Add Text</Button>
              <Button variant="outline" onClick={() => handleAddElement("image")}>Add Image</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {template.elements.map((element) => (
              <div
                key={element.id}
                className={`relative transition-all ${
                  selectedElement === element.id
                    ? "ring-2 ring-primary ring-offset-2"
                    : "hover:ring-1 hover:ring-primary/50"
                }`}
                onClick={() => setSelectedElement(element.id)}
              >
                <TemplateElementEditor 
                  element={element}
                  onUpdate={(updatedElement) => handleUpdateElement(element.id, updatedElement)}
                  onDelete={() => handleDeleteElement(element.id)}
                />
                
                {selectedElement === element.id && (
                  <div className="absolute top-0 right-0 -m-2 bg-background border rounded shadow-sm flex">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDuplicateElement(element.id);
                      }}
                    >
                      <Copy className="h-4 w-4" />
                      <span className="sr-only">Duplicate</span>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteElement(element.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                )}
              </div>
            ))}
            
            <div className="flex justify-center py-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAddElement("text")}
                className="mr-2"
              >
                <Plus className="w-4 h-4 mr-1" /> Add Text
              </Button>
              <Button
                variant="outline" 
                size="sm"
                onClick={() => handleAddElement("image")}
                className="mr-2"
              >
                <Plus className="w-4 h-4 mr-1" /> Add Image
              </Button>
              <Button
                variant="outline"
                size="sm" 
                onClick={() => handleAddElement("button")}
                className="mr-2"
              >
                <Plus className="w-4 h-4 mr-1" /> Add Button
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowGifSelectorDialog(true)}
              >
                <Sparkles className="w-4 h-4 mr-1" /> Add Animation
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
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
          <Button 
            variant="outline" 
            onClick={() => setShowAnimationEditor(true)}
            className="bg-gradient-to-r from-pink-500 to-violet-500 text-white hover:from-pink-600 hover:to-violet-600 border-0"
          >
            <Video className="mr-2 h-4 w-4" />
            Animation Creator
          </Button>
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
      
      {!previewMode ? (
        <Tabs defaultValue="design" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
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
          
          <div className="grid grid-cols-12 gap-4">
            {/* Left sidebar with elements (only shown in design tab) */}
            {activeTab === "design" && (
              <div className="col-span-3">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-3">Elements</h3>
                  <div className="space-y-2">
                    <div 
                      className="p-3 border rounded-lg flex items-center gap-2 cursor-pointer bg-card hover:bg-accent transition-colors"
                      onClick={() => handleAddElement("text")}
                    >
                      <Type className="h-5 w-5 text-muted-foreground" />
                      <span>Text</span>
                    </div>
                    
                    <div 
                      className="p-3 border rounded-lg flex items-center gap-2 cursor-pointer bg-card hover:bg-accent transition-colors"
                      onClick={() => handleAddElement("image")}
                    >
                      <ImageIcon className="h-5 w-5 text-muted-foreground" />
                      <span>Image</span>
                    </div>
                    
                    <div 
                      className="p-3 border rounded-lg flex items-center gap-2 cursor-pointer bg-card hover:bg-accent transition-colors"
                      onClick={() => handleAddElement("button")}
                    >
                      <Square className="h-5 w-5 text-muted-foreground" />
                      <span>Button</span>
                    </div>
                    
                    <div 
                      className="p-3 border rounded-lg flex items-center gap-2 cursor-pointer bg-card hover:bg-accent transition-colors"
                      onClick={() => handleAddElement("divider")}
                    >
                      <div className="h-0.5 w-5 bg-muted-foreground" />
                      <span>Divider</span>
                    </div>
                    
                    <div 
                      className="p-3 border rounded-lg flex items-center gap-2 cursor-pointer bg-card hover:bg-accent transition-colors"
                      onClick={() => handleAddElement("spacer")}
                    >
                      <div className="h-4 w-5 flex items-center justify-center">
                        <div className="h-1 w-3 bg-muted-foreground"></div>
                      </div>
                      <span>Spacer</span>
                    </div>
                    
                    <div 
                      className="p-3 border rounded-lg flex items-center gap-2 cursor-pointer bg-gradient-to-r from-pink-500/20 to-violet-500/20 hover:from-pink-500/30 hover:to-violet-500/30 transition-colors"
                      onClick={() => setShowAnimationEditor(true)}
                    >
                      <Sparkles className="h-5 w-5 text-violet-500" />
                      <span>Animated GIF</span>
                    </div>
                  </div>
                  
                  {/* Template libraries and presets */}
                  <div className="mt-6">
                    <h3 className="font-medium mb-3">Templates</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <Card className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow">
                        <div className="h-1 bg-blue-500" />
                        <CardContent className="p-2">
                          <div className="aspect-[4/3] bg-slate-100 flex items-center justify-center text-xs text-muted-foreground">
                            Welcome
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow">
                        <div className="h-1 bg-green-500" />
                        <CardContent className="p-2">
                          <div className="aspect-[4/3] bg-slate-100 flex items-center justify-center text-xs text-muted-foreground">
                            Newsletter
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow">
                        <div className="h-1 bg-amber-500" />
                        <CardContent className="p-2">
                          <div className="aspect-[4/3] bg-slate-100 flex items-center justify-center text-xs text-muted-foreground">
                            Promotion
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow">
                        <div className="h-1 bg-rose-500" />
                        <CardContent className="p-2">
                          <div className="aspect-[4/3] bg-slate-100 flex items-center justify-center text-xs text-muted-foreground">
                            Event
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                  
                  {/* Instruction cards */}
                  <div className="mt-6 space-y-3">
                    <Card className="instruction-card animate-instruction bg-accent/50">
                      <CardContent className="p-3 text-xs">
                        <p className="font-medium mb-1">Quick Tip</p>
                        <p>Click on elements to add them to your template.</p>
                      </CardContent>
                    </Card>
                    
                    <Card className="instruction-card animate-instruction bg-accent/50">
                      <CardContent className="p-3 text-xs">
                        <p className="font-medium mb-1">Personalization</p>
                        <p>Use {`{{firstName}}`}, {`{{company}}`}, etc. for dynamic content.</p>
                      </CardContent>
                    </Card>
                    
                    <Card className="instruction-card animate-instruction bg-accent/50">
                      <CardContent className="p-3 text-xs">
                        <p className="font-medium mb-1">Animation Creator</p>
                        <p>Create animated GIFs and add them to your email template.</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            )}
            
            {/* Main content area */}
            <div className={activeTab === "design" ? "col-span-9" : "col-span-12"}>
              <div className="border rounded-lg bg-white p-4">
                {activeTab === "design" ? (
                  <div className="space-y-4">
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
                    
                    {renderElementDesignPanel()}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Textarea 
                      value={template.html || defaultHtmlTemplate} 
                      onChange={(e) => {
                        const updatedTemplate = { ...template, html: e.target.value };
                        setTemplate(updatedTemplate);
                        addToHistory(updatedTemplate);
                      }}
                      className="min-h-[500px] font-mono text-sm"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </Tabs>
      ) : (
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
            <div className="space-y-4">
              {template.elements.map((element) => (
                <div key={element.id}>
                  {element.type === "text" && (
                    <div dangerouslySetInnerHTML={{ __html: parsePlaceholders(element.content?.replace(/\n/g, '<br>') || '') }} />
                  )}
                  
                  {element.type === "image" && (
                    <img 
                      src={element.src} 
                      alt="Template" 
                      className="max-w-full h-auto"
                      style={{
                        width: element.width ? `${element.width}px` : '100%',
                        maxWidth: '100%',
                        height: element.height ? `${element.height}px` : 'auto',
                      }}
                    />
                  )}
                  
                  {element.type === "button" && (
                    <a 
                      href={element.link || "#"} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-block py-2 px-4 bg-primary text-primary-foreground rounded text-center"
                    >
                      {parsePlaceholders(element.content)}
                    </a>
                  )}
                  
                  {element.type === "divider" && (
                    <hr className="my-4" />
                  )}
                  
                  {element.type === "spacer" && (
                    <div className="h-8" />
                  )}
                </div>
              ))}
              
              {template.elements.length === 0 && (
                <div className="text-center text-muted-foreground py-12">
                  <p>No content in this template yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Animation Editor Dialog */}
      <Dialog open={showAnimationEditor} onOpenChange={setShowAnimationEditor}>
        <DialogContent className="max-w-7xl h-[90vh]">
          <AnimationEditor 
            onSave={handleSaveAnimatedGif}
            onCancel={() => setShowAnimationEditor(false)}
          />
        </DialogContent>
      </Dialog>
      
      {/* Created GIFs Dialog */}
      <Dialog open={showGifSelectorDialog} onOpenChange={setShowGifSelectorDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Animation</DialogTitle>
            <DialogDescription>
              Choose an animation to add to your template or create a new one.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-4 py-4">
            {createdGifs.length > 0 ? (
              createdGifs.map((gif, index) => (
                <div 
                  key={index}
                  className="border rounded cursor-pointer hover:border-primary overflow-hidden"
                  onClick={() => handleAddGifToTemplate(gif)}
                >
                  <img 
                    src={gif} 
                    alt={`Animation ${index + 1}`} 
                    className="w-full h-auto"
                  />
                </div>
              ))
            ) : (
              <div className="col-span-2 py-8 text-center text-muted-foreground">
                <p>No animations created yet.</p>
                <p className="text-sm">Create your first animation using the Animation Creator.</p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button onClick={() => {
              setShowGifSelectorDialog(false);
              setShowAnimationEditor(true);
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Create New Animation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TemplateEditorNew;
