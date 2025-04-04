import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { PenTool, Plus, Search, Eye, Copy, Trash, Globe, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getUserTemplates, saveTemplate, deleteTemplate, getPublicTemplates } from "@/lib/firebaseService";
import { Template } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { PulseSpinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

const Templates = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { authState } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [templates, setTemplates] = useState<Template[]>([]);
  const [publicTemplates, setPublicTemplates] = useState<Template[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>([]);
  const [filteredPublicTemplates, setFilteredPublicTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPublicLoading, setIsPublicLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("my-templates");
  
  // Fetch user's templates from Firestore
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setIsLoading(true);
        const fetchedTemplates = await getUserTemplates();
        setTemplates(fetchedTemplates);
      } catch (error) {
        console.error("Error fetching templates:", error);
        toast({
          title: "Error",
          description: "Failed to load templates. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (authState.user) {
      fetchTemplates();
    }
  }, [authState.user, toast]);
  
  // Fetch public templates from Firestore
  useEffect(() => {
    const fetchPublicTemplates = async () => {
      try {
        setIsPublicLoading(true);
        const fetchedPublicTemplates = await getPublicTemplates();
        setPublicTemplates(fetchedPublicTemplates);
      } catch (error) {
        console.error("Error fetching public templates:", error);
        toast({
          title: "Error",
          description: "Failed to load public templates. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsPublicLoading(false);
      }
    };

    if (authState.user && activeTab === "public-templates") {
      fetchPublicTemplates();
    }
  }, [authState.user, toast, activeTab]);
  
  // Filter and sort user's templates
  useEffect(() => {
    let result = [...templates];
    
    // Filter by search term
    if (searchTerm) {
      result = result.filter(template => 
        template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.subject.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Sort templates
    if (sortBy === "recent") {
      result.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    } else if (sortBy === "name") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }
    
    setFilteredTemplates(result);
  }, [templates, searchTerm, sortBy]);
  
  // Filter and sort public templates
  useEffect(() => {
    let result = [...publicTemplates];
    
    // Filter by search term
    if (searchTerm) {
      result = result.filter(template => 
        template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.subject.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Sort templates
    if (sortBy === "recent") {
      result.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    } else if (sortBy === "name") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }
    
    setFilteredPublicTemplates(result);
  }, [publicTemplates, searchTerm, sortBy]);
  
  // Handle creating a new template
  const handleCreateTemplate = () => {
    navigate("/template-editor");
  };
  
  // Handle editing a template
  const handleEditTemplate = (templateId: string) => {
    navigate(`/template-editor/${templateId}`);
  };
  
  // Handle duplicating a template
  const handleDuplicateTemplate = async (template: Template) => {
    try {
      // Create a duplicate with a new ID and updated name
      const duplicateTemplate: Partial<Template> = {
        ...template,
        id: undefined, // Remove ID so a new one is generated
        name: `${template.name} (Copy)`,
        updatedAt: new Date().toISOString(),
      };
      
      await saveTemplate(duplicateTemplate);
      
      toast({
        title: "Success",
        description: "Template duplicated successfully",
      });
      
      // Refresh templates
      const updatedTemplates = await getUserTemplates();
      setTemplates(updatedTemplates);
    } catch (error) {
      console.error("Error duplicating template:", error);
      toast({
        title: "Error",
        description: "Failed to duplicate template. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // Handle duplicating a public template to user's templates
  const handleUsePublicTemplate = async (template: Template) => {
    try {
      // Create a copy in user's templates
      const duplicateTemplate: Partial<Template> = {
        ...template,
        id: undefined, // Remove ID so a new one is generated
        name: `${template.name} (from ${template.creatorName || 'Unknown'})`,
        updatedAt: new Date().toISOString(),
        isPublic: false, // Make it private by default
      };
      
      await saveTemplate(duplicateTemplate);
      
      toast({
        title: "Success",
        description: "Template added to your collection",
      });
      
      // Refresh templates and switch to My Templates tab
      const updatedTemplates = await getUserTemplates();
      setTemplates(updatedTemplates);
      setActiveTab("my-templates");
    } catch (error) {
      console.error("Error using public template:", error);
      toast({
        title: "Error",
        description: "Failed to add template to your collection. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // Handle deleting a template
  const handleDeleteTemplate = async (templateId: string) => {
    if (window.confirm("Are you sure you want to delete this template?")) {
      try {
        await deleteTemplate(templateId);
        
        toast({
          title: "Success",
          description: "Template deleted successfully",
        });
        
        // Update local state to remove the deleted template
        setTemplates(templates.filter(template => template.id !== templateId));
      } catch (error) {
        console.error("Error deleting template:", error);
        toast({
          title: "Error",
          description: "Failed to delete template. Please try again.",
          variant: "destructive"
        });
      }
    }
  };
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold">Email Templates</h1>
        <p className="text-muted-foreground">
          Create and manage your email templates
        </p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="my-templates" className="flex items-center">
              <Lock className="h-4 w-4 mr-2" />
              My Templates
            </TabsTrigger>
            <TabsTrigger value="public-templates" className="flex items-center">
              <Globe className="h-4 w-4 mr-2" />
              Public Templates
            </TabsTrigger>
          </TabsList>
          
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search templates..."
                className="pl-8 w-[250px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="name">Name</SelectItem>
              </SelectContent>
            </Select>
            
            {activeTab === "my-templates" && (
              <Button onClick={handleCreateTemplate}>
                <Plus className="h-4 w-4 mr-2" />
                New Template
              </Button>
            )}
          </div>
        </div>
        
        <TabsContent value="my-templates" className="mt-6">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <PulseSpinner />
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No templates found</p>
              <Button onClick={handleCreateTemplate}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Template
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map((template) => (
                <Card key={template.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between">
                      <span className="truncate">{template.name}</span>
                      {template.isPublic && (
                        <Badge variant="outline" className="ml-2 flex items-center">
                          <Globe className="h-3 w-3 mr-1" />
                          Public
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="truncate">
                      {template.subject || "No subject"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="h-32 overflow-hidden relative">
                    <div 
                      className="absolute inset-0 p-4 bg-muted/30 flex items-center justify-center text-center"
                      style={{ 
                        backgroundImage: template.styles?.backgroundImage ? `url(${template.styles.backgroundImage})` : undefined,
                        backgroundColor: template.styles?.backgroundColor || "#FFFFFF",
                        backgroundSize: template.styles?.backgroundSize || "cover",
                        backgroundRepeat: template.styles?.backgroundRepeat || "no-repeat",
                        backgroundPosition: template.styles?.backgroundPosition || "center center"
                      }}
                    >
                      <div className="bg-background/80 p-2 rounded">
                        <PenTool className="h-6 w-6 mx-auto mb-2" />
                        <p className="text-sm font-medium">Click to edit</p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between bg-muted/30 p-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEditTemplate(template.id)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDuplicateTemplate(template)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteTemplate(template.id)}>
                      <Trash className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="public-templates" className="mt-6">
          {isPublicLoading ? (
            <div className="flex justify-center items-center py-12">
              <PulseSpinner />
            </div>
          ) : filteredPublicTemplates.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No public templates found</p>
              <p className="text-sm">Make your templates public to share them with others</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPublicTemplates.map((template) => (
                <Card key={template.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <CardTitle className="truncate">{template.name}</CardTitle>
                    <CardDescription className="flex justify-between">
                      <span className="truncate">{template.subject || "No subject"}</span>
                      <span className="text-xs text-muted-foreground">
                        By: {template.creatorName || "Unknown"}
                      </span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="h-32 overflow-hidden relative">
                    <div 
                      className="absolute inset-0 p-4 bg-muted/30 flex items-center justify-center text-center"
                      style={{ 
                        backgroundImage: template.styles?.backgroundImage ? `url(${template.styles.backgroundImage})` : undefined,
                        backgroundColor: template.styles?.backgroundColor || "#FFFFFF",
                        backgroundSize: template.styles?.backgroundSize || "cover",
                        backgroundRepeat: template.styles?.backgroundRepeat || "no-repeat",
                        backgroundPosition: template.styles?.backgroundPosition || "center center"
                      }}
                    >
                      <div className="bg-background/80 p-2 rounded">
                        <Globe className="h-6 w-6 mx-auto mb-2" />
                        <p className="text-sm font-medium">Public Template</p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-center bg-muted/30 p-2">
                    <Button variant="default" size="sm" onClick={() => handleUsePublicTemplate(template)}>
                      <Copy className="h-4 w-4 mr-2" />
                      Use This Template
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Templates;
