
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
import { templates } from "@/data/mockData";
import { v4 as uuidv4 } from "uuid";
import { Send, Users, Mail, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const CampaignNew = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [templateId, setTemplateId] = useState("");
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [recipients, setRecipients] = useState<string>("");
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(undefined);
  const [isSending, setIsSending] = useState(false);

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
  }, [templateId]);

  const handleCreateCampaign = () => {
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

    try {
      // Create new campaign object
      const newCampaign: Campaign = {
        id: uuidv4(),
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

      // In a real app, this would be saved to a database
      console.log("New campaign created:", newCampaign);

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
      setIsSending(false);
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
                    <SelectValue placeholder="Select a template" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
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

          <div className="flex gap-4 justify-end">
            <Button
              variant="outline"
              onClick={() => navigate("/campaigns")}
              disabled={isSending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateCampaign}
              className="bg-brand-purple hover:bg-brand-purple/90"
              disabled={isSending}
            >
              {isSending ? (
                <>Creating Campaign...</>
              ) : scheduledDate && scheduledDate > new Date() ? (
                <>Schedule Campaign</>
              ) : (
                <>Create Campaign</>
              )}
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="h-fit">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-medium">Template Preview</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedTemplate ? (
                <div className="border rounded-md p-4 bg-muted/20 min-h-[200px] flex items-center justify-center">
                  <div className="text-center space-y-2">
                    <div className="font-medium">
                      {selectedTemplate.name}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Subject: {subject || selectedTemplate.subject || "No subject"}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/template-editor/${selectedTemplate.id}`)}
                      className="mt-4"
                    >
                      Preview full template
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="border rounded-md p-4 bg-muted/20 min-h-[200px] flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <Mail className="mx-auto h-12 w-12 mb-2 opacity-50" />
                    <p>Select a template to preview</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="h-fit">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-medium">Campaign Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="border rounded-md p-3">
                    <div className="text-2xl font-bold text-brand-blue">0%</div>
                    <div className="text-xs text-muted-foreground mt-1">Open Rate</div>
                  </div>
                  <div className="border rounded-md p-3">
                    <div className="text-2xl font-bold text-brand-purple">0%</div>
                    <div className="text-xs text-muted-foreground mt-1">Click Rate</div>
                  </div>
                  <div className="border rounded-md p-3">
                    <div className="text-2xl font-bold text-brand-teal">0%</div>
                    <div className="text-xs text-muted-foreground mt-1">Reply Rate</div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Analytics will be available after your campaign is sent
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CampaignNew;
