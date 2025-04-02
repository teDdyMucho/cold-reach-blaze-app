
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { templates } from "@/data/mockData";
import { Template, TemplateElement } from "@/types";
import { ArrowLeft, Save, Eye, Code, Image, Type, Square, MousePointer } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

const TemplateEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("design");
  const [previewMode, setPreviewMode] = useState(false);
  
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
  const [draggingElement, setDraggingElement] = useState<string | null>(null);
  
  useEffect(() => {
    if (id) {
      const existingTemplate = templates.find(t => t.id === id);
      if (existingTemplate) {
        setTemplate(existingTemplate);
      }
    }
    
    // Add animation classes to instruction cards
    const cards = document.querySelectorAll('.instruction-card');
    cards.forEach((card, index) => {
      (card as HTMLElement).style.setProperty('--delay', index.toString());
    });
  }, [id]);
  
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
    
    setTemplate(prev => ({
      ...prev,
      elements: [...prev.elements, newElement],
      updatedAt: new Date().toISOString()
    }));
    
    toast({
      title: "Element Added",
      description: `New ${type} element added to your template.`
    });
  };
  
  // Handle element drag start
  const handleDragStart = (type: string) => {
    setDraggingElement(type);
  };
  
  // Handle element drag end
  const handleDragEnd = () => {
    setDraggingElement(null);
  };
  
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
              onChange={(e) => setTemplate({...template, name: e.target.value})}
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
                      className="p-3 border rounded-lg flex items-center gap-2 cursor-move bg-card hover:bg-accent transition-colors"
                      draggable
                      onDragStart={() => handleDragStart("text")}
                      onDragEnd={handleDragEnd}
                      onClick={() => handleAddElement("text")}
                    >
                      <Type className="h-5 w-5 text-muted-foreground" />
                      <span>Text</span>
                    </div>
                    
                    <div 
                      className="p-3 border rounded-lg flex items-center gap-2 cursor-move bg-card hover:bg-accent transition-colors"
                      draggable
                      onDragStart={() => handleDragStart("image")}
                      onDragEnd={handleDragEnd}
                      onClick={() => handleAddElement("image")}
                    >
                      <Image className="h-5 w-5 text-muted-foreground" />
                      <span>Image</span>
                    </div>
                    
                    <div 
                      className="p-3 border rounded-lg flex items-center gap-2 cursor-move bg-card hover:bg-accent transition-colors"
                      draggable
                      onDragStart={() => handleDragStart("button")}
                      onDragEnd={handleDragEnd}
                      onClick={() => handleAddElement("button")}
                    >
                      <Square className="h-5 w-5 text-muted-foreground" />
                      <span>Button</span>
                    </div>
                    
                    <div 
                      className="p-3 border rounded-lg flex items-center gap-2 cursor-move bg-card hover:bg-accent transition-colors"
                      draggable
                      onDragStart={() => handleDragStart("divider")}
                      onDragEnd={handleDragEnd}
                      onClick={() => handleAddElement("divider")}
                    >
                      <Separator className="w-5" />
                      <span>Divider</span>
                    </div>
                    
                    <div 
                      className="p-3 border rounded-lg flex items-center gap-2 cursor-move bg-card hover:bg-accent transition-colors"
                      draggable
                      onDragStart={() => handleDragStart("spacer")}
                      onDragEnd={handleDragEnd}
                      onClick={() => handleAddElement("spacer")}
                    >
                      <div className="h-4 w-5 flex items-center justify-center">
                        <div className="h-1 w-3 bg-muted-foreground"></div>
                      </div>
                      <span>Spacer</span>
                    </div>
                  </div>
                  
                  {/* Instruction cards */}
                  <div className="mt-6 space-y-3">
                    <Card className="instruction-card animate-instruction bg-accent/50">
                      <CardContent className="p-3 text-xs">
                        <p className="font-medium mb-1">Quick Tip</p>
                        <p>Drag elements to the canvas or click to add them.</p>
                      </CardContent>
                    </Card>
                    
                    <Card className="instruction-card animate-instruction bg-accent/50">
                      <CardContent className="p-3 text-xs">
                        <p className="font-medium mb-1">Personalization</p>
                        <p>Use {{firstName}}, {{company}}, etc. for dynamic content.</p>
                      </CardContent>
                    </Card>
                    
                    <Card className="instruction-card animate-instruction bg-accent/50">
                      <CardContent className="p-3 text-xs">
                        <p className="font-medium mb-1">Mobile Preview</p>
                        <p>Check how your email looks on mobile devices with the preview button.</p>
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
                        onChange={(e) => setTemplate({...template, subject: e.target.value})}
                        placeholder="Enter subject line..."
                        className="w-full"
                      />
                    </div>
                    
                    <div className="border rounded-lg p-4 min-h-[500px]" style={{ background: '#f9f9f9' }}>
                      {template.elements.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-96 text-center text-muted-foreground">
                          <div className="mb-4 bg-accent rounded-full p-3">
                            <MousePointer className="h-8 w-8" />
                          </div>
                          <h3 className="text-lg font-medium mb-2">Start Building Your Template</h3>
                          <p className="max-w-md mb-4">
                            Drag and drop elements from the sidebar or click on them to add to your email template.
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
                              className="border border-dashed p-3 rounded-lg hover:border-primary cursor-pointer transition-all"
                            >
                              {element.type === "text" && (
                                <Textarea 
                                  value={element.content}
                                  onChange={(e) => {
                                    setTemplate({
                                      ...template,
                                      elements: template.elements.map(el => 
                                        el.id === element.id ? { ...el, content: e.target.value } : el
                                      )
                                    });
                                  }}
                                  placeholder="Enter text here..."
                                  className="min-h-[100px]"
                                />
                              )}
                              
                              {element.type === "image" && (
                                <div className="flex flex-col items-center gap-2">
                                  <img 
                                    src={element.src} 
                                    alt="Template" 
                                    className="max-w-full h-auto border rounded"
                                  />
                                  <Input 
                                    value={element.src}
                                    onChange={(e) => {
                                      setTemplate({
                                        ...template,
                                        elements: template.elements.map(el => 
                                          el.id === element.id ? { ...el, src: e.target.value } : el
                                        )
                                      });
                                    }}
                                    placeholder="Image URL"
                                    className="max-w-sm"
                                  />
                                </div>
                              )}
                              
                              {element.type === "button" && (
                                <div className="flex flex-col items-center gap-2">
                                  <Button className="w-auto">
                                    {element.content}
                                  </Button>
                                  <div className="flex gap-2 w-full max-w-sm">
                                    <Input 
                                      value={element.content}
                                      onChange={(e) => {
                                        setTemplate({
                                          ...template,
                                          elements: template.elements.map(el => 
                                            el.id === element.id ? { ...el, content: e.target.value } : el
                                          )
                                        });
                                      }}
                                      placeholder="Button Text"
                                    />
                                    <Input 
                                      value={element.link}
                                      onChange={(e) => {
                                        setTemplate({
                                          ...template,
                                          elements: template.elements.map(el => 
                                            el.id === element.id ? { ...el, link: e.target.value } : el
                                          )
                                        });
                                      }}
                                      placeholder="Link URL"
                                    />
                                  </div>
                                </div>
                              )}
                              
                              {element.type === "divider" && (
                                <Separator className="my-4" />
                              )}
                              
                              {element.type === "spacer" && (
                                <div className="h-8" />
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Textarea 
                      value={template.html || `<!DOCTYPE html>
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
</html>`} 
                      onChange={(e) => setTemplate({...template, html: e.target.value})}
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
                    <div dangerouslySetInnerHTML={{ __html: element.content?.replace(/\n/g, '<br>') || '' }} />
                  )}
                  
                  {element.type === "image" && (
                    <img 
                      src={element.src} 
                      alt="Template" 
                      className="max-w-full h-auto"
                    />
                  )}
                  
                  {element.type === "button" && (
                    <a 
                      href={element.link || "#"} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-block py-2 px-4 bg-primary text-primary-foreground rounded text-center"
                    >
                      {element.content}
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
    </div>
  );
};

export default TemplateEditor;
