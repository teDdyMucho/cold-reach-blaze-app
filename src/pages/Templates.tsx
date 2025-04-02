
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { PenTool, Plus, Search, Eye, Copy, Trash } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { templates } from "@/data/mockData";

const Templates = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [filteredTemplates, setFilteredTemplates] = useState(templates);
  
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
    result.sort((a, b) => {
      if (sortBy === "recent") {
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      } else if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      }
      return 0;
    });
    
    setFilteredTemplates(result);
  }, [searchTerm, sortBy]);
  
  // Function to handle template duplication
  const handleDuplicate = (templateId: string) => {
    toast({
      title: "Template Duplicated",
      description: "The template has been duplicated successfully."
    });
  };
  
  // Function to handle template deletion
  const handleDelete = (templateId: string) => {
    toast({
      title: "Template Deleted",
      description: "The template has been deleted successfully."
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Email Templates</h1>
        <p className="text-muted-foreground">Create and manage your email templates.</p>
      </div>
      
      {/* Filters and actions */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search templates..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="name">Name</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button onClick={() => navigate("/templates/editor")} className="animate-pulse-opacity bg-gradient-to-r from-brand-purple to-brand-blue hover:from-brand-purple hover:to-brand-blue">
          <Plus className="mr-2 h-4 w-4" />
          Create Template
        </Button>
      </div>
      
      {/* Template Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.map((template, index) => (
          <Card key={template.id} className="card-hover overflow-hidden animate-instruction" style={{"--delay": index.toString()} as React.CSSProperties}>
            <div className="h-2 bg-gradient-to-r from-brand-purple to-brand-blue" />
            <CardHeader className="pb-2">
              <CardTitle className="flex justify-between items-center">
                <span className="truncate">{template.name}</span>
                <PenTool className="h-5 w-5 text-brand-purple" />
              </CardTitle>
              <CardDescription className="truncate">{template.subject}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-28 overflow-hidden text-muted-foreground text-sm">
                {template.content}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-4">
              <Button variant="outline" size="sm" onClick={() => navigate(`/templates/editor/${template.id}`)}>
                <Eye className="mr-1 h-4 w-4" />
                Edit
              </Button>
              
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" onClick={() => handleDuplicate(template.id)}>
                  <Copy className="h-4 w-4" />
                  <span className="sr-only">Duplicate</span>
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(template.id)}>
                  <Trash className="h-4 w-4" />
                  <span className="sr-only">Delete</span>
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <div className="bg-muted h-32 w-32 rounded-full flex items-center justify-center mx-auto mb-4">
            <PenTool className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-medium mb-2">No templates found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm ? "No templates match your search criteria." : "You haven't created any templates yet."}
          </p>
          <Button onClick={() => navigate("/templates/editor")}>
            <Plus className="mr-2 h-4 w-4" />
            Create Your First Template
          </Button>
        </div>
      )}
    </div>
  );
};

export default Templates;
