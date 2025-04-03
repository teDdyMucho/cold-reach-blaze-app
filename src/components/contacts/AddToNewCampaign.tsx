
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Template, Contact } from "@/types";
import { getUserTemplates } from "@/lib/firebaseService";
import { createCampaign } from "@/lib/campaignService";

interface AddToNewCampaignProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedContacts: Contact[];
}

const AddToNewCampaign = ({ open, onOpenChange, selectedContacts }: AddToNewCampaignProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);
  const [campaignName, setCampaignName] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const fetchedTemplates = await getUserTemplates();
        setTemplates(fetchedTemplates);
        
        // If we have templates, select the first one by default
        if (fetchedTemplates.length > 0) {
          setSelectedTemplateId(fetchedTemplates[0].id);
        }
      } catch (error) {
        console.error("Error fetching templates:", error);
        toast({
          title: "Error",
          description: "Failed to load email templates.",
          variant: "destructive",
        });
      }
    };
    
    fetchTemplates();
  }, [toast]);
  
  const handleCreateCampaign = async () => {
    if (!campaignName.trim()) {
      toast({
        title: "Campaign Name Required",
        description: "Please enter a name for your campaign.",
        variant: "destructive",
      });
      return;
    }
    
    if (!selectedTemplateId) {
      toast({
        title: "Template Required",
        description: "Please select an email template for your campaign.",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const campaignId = await createCampaign({
        id: "",
        name: campaignName,
        templateId: selectedTemplateId,
        status: "draft",
        recipients: selectedContacts.length,
        opened: 0,
        clicked: 0,
        replied: 0,
        createdAt: new Date().toISOString(),
      });
      
      toast({
        title: "Campaign Created",
        description: `Created campaign "${campaignName}" with ${selectedContacts.length} contacts.`,
      });
      
      onOpenChange(false);
      navigate(`/campaign-new?id=${campaignId}`);
    } catch (error) {
      console.error("Error creating campaign:", error);
      toast({
        title: "Error",
        description: "Failed to create campaign.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Campaign</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="campaign-name" className="text-sm font-medium">
              Campaign Name
            </label>
            <Input
              id="campaign-name"
              placeholder="Enter campaign name"
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Email Template
            </label>
            <Select
              value={selectedTemplateId}
              onValueChange={setSelectedTemplateId}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a template" />
              </SelectTrigger>
              <SelectContent>
                {templates.map(template => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
                {templates.length === 0 && (
                  <SelectItem value="no-templates" disabled>
                    No templates available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          
          <div className="bg-muted p-3 rounded-md">
            <p className="text-sm font-medium mb-1">Selected Contacts</p>
            <p className="text-sm text-muted-foreground">
              {selectedContacts.length} contact{selectedContacts.length !== 1 ? "s" : ""} selected
            </p>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleCreateCampaign}
            disabled={!campaignName.trim() || !selectedTemplateId || loading}
            className="bg-brand-purple hover:bg-brand-purple/90"
          >
            {loading ? "Creating..." : "Create Campaign"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddToNewCampaign;
