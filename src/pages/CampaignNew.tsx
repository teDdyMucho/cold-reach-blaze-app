
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Template, Campaign } from "@/types";
import { v4 as uuidv4 } from "uuid";
import { Send, Users, Mail, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { saveCampaign, getUserTemplates } from "@/lib/firebaseService";
import { useLoading } from "@/hooks/use-loading";

const CampaignNew = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { startLoading, stopLoading } = useLoading();
  const [templateId, setTemplateId] = useState("");
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [recipients, setRecipients] = useState<string>("");
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(undefined);
  const [isSending, setIsSending] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch templates from Firestore
    const fetchTemplates = async () => {
      try {
        setIsLoading(true);
        const userTemplates = await getUserTemplates();
        setTemplates(userTemplates);
      } catch (error) {
        console.error("Error fetching templates:", error);
        toast({
          title: "Error",
          description: "Failed to load templates. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTemplates();
  }, [toast]);

  useEffect(() => {
    // Set subject from template when template is selected
    if (templateId) {
      const template = templates.find(t => t.id === templateId);
      if (template) {
        setSelectedTemplate(template);
        setSubject(template.subject || "");
      }
    } else {
      setSelectedTemplate(null);
    }
  }, [templateId, templates]);

  const handleCreateCampaign = async () => {
    if (!name) {
      toast({
        title: "Campaign name is required",
        description: "Please provide a name for your campaign",
        variant: "destructive",
      });
      return;
    }

    if (!templateId) {
      toast({
        title: "Template is required",
        description: "Please select an email template",
        variant: "destructive",
      });
      return;
    }

    if (!recipients || parseInt(recipients) <= 0) {
      toast({
        title: "Valid recipient count is required",
        description: "Please enter the number of recipients",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    startLoading({
      message: "Creating your campaign...",
      spinnerType: "wave"
    });

    try {
      // Create new campaign object
      const newCampaign: Campaign = {
        id: "", // Will be set by Firestore
        name,
        templateId,
        status: scheduledDate && scheduledDate > new Date() ? "scheduled" : "sending",
        recipients: parseInt(recipients),
        opened: 0,
        clicked: 0,
        replied: 0,
        createdAt: new Date().toISOString(),
        scheduled: scheduledDate ? scheduledDate.toISOString() : undefined,
      };

      // Save to Firestore
      await saveCampaign(newCampaign);

      toast({
        title: "Campaign created",
        description: scheduledDate && scheduledDate > new Date() 
          ? `Your campaign has been scheduled for ${format(scheduledDate, "PPP")}` 
          : "Your campaign is being processed and will be sent shortly",
      });

      // Redirect back to campaigns list
      setTimeout(() => {
        navigate("/campaigns");
      }, 1500);
    } catch (error) {
      console.error("Error creating campaign:", error);
      toast({
        title: "Error",
        description: "An error occurred while creating the campaign",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
      stopLoading();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create Campaign</h1>
        <p className="text-muted-foreground">
          Create a new email campaign using your templates and contacts.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-medium">Campaign Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Campaign Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Summer Promotion 2025"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="template">Email Template</Label>
                <Select value={templateId} onValueChange={setTemplateId}>
                  <SelectTrigger>
                    <SelectValue placeholder={isLoading ? "Loading templates..." : "Select a template"} />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.length > 0 ? (
                      templates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-templates" disabled>
                        {isLoading ? "Loading templates..." : "No templates available"}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Email Subject</Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Enter email subject line"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="recipients">Number of Recipients</Label>
                <Input
                  id="recipients"
                  type="number"
                  min="1"
                  value={recipients}
                  onChange={(e) => setRecipients(e.target.value)}
                  placeholder="Enter number of recipients"
                />
              </div>

              <div className="space-y-2">
                <Label>Schedule (Optional)</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !scheduledDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {scheduledDate ? format(scheduledDate, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={scheduledDate}
                      onSelect={setScheduledDate}
                      initialFocus
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </CardContent>
          </Card>

          <Button 
            onClick={handleCreateCampaign} 
            disabled={isSending}
            className="w-full"
          >
            {isSending ? (
              <>
                <span className="mr-2">Creating campaign...</span>
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Create Campaign
              </>
            )}
          </Button>
        </div>

        <div className="space-y-6">
          {selectedTemplate ? (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-medium">Template Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border rounded-md p-4 space-y-4">
                  <div className="font-medium">Subject: {subject}</div>
                  <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: selectedTemplate.html }} />
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-medium">Template Preview</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center h-80 text-muted-foreground">
                <Mail className="h-16 w-16 mb-4 text-muted-foreground/50" />
                <p>Select a template to preview</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default CampaignNew;
