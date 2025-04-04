import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Template, Campaign, EmailComponent } from "@/types";
import { v4 as uuidv4 } from "uuid";
import { Send, Users, Mail, CalendarIcon, Eye, Monitor, Smartphone, RefreshCw, UserPlus } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { saveCampaign, getUserTemplates, getTemplateById, getUserContactLists, getContactListById, getCampaign } from "@/lib/firebaseService";
import { createCampaign } from "@/lib/campaignService";
import { useLoading } from "@/hooks/use-loading";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PulseSpinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";

const CampaignNew = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const campaignId = searchParams.get('id');
  const { toast } = useToast();
  const { startLoading, stopLoading } = useLoading();
  const [templateId, setTemplateId] = useState("");
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [contactListId, setContactListId] = useState("");
  const [contactLists, setContactLists] = useState<{id: string, name: string, count: number}[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(undefined);
  const [isSending, setIsSending] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingContacts, setIsLoadingContacts] = useState(true);
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");
  const [previewTab, setPreviewTab] = useState<"preview" | "code">("preview");
  const [isLoadingTemplate, setIsLoadingTemplate] = useState(false);

  const styleToString = (styles: Record<string, any> = {}) => {
    const cssProperties: string[] = [];

    if (styles.paddingX !== undefined) {
      cssProperties.push(`padding-left: ${styles.paddingX}px`);
      cssProperties.push(`padding-right: ${styles.paddingX}px`);
    }

    if (styles.paddingY !== undefined) {
      cssProperties.push(`padding-top: ${styles.paddingY}px`);
      cssProperties.push(`padding-bottom: ${styles.paddingY}px`);
    }

    Object.entries(styles).forEach(([key, value]) => {
      if (key !== 'paddingX' && key !== 'paddingY') {
        const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();

        let cssValue = value;
        if (typeof value === 'number' && !['fontWeight', 'lineHeight', 'opacity', 'zIndex'].includes(key)) {
          cssValue = `${value}px`;
        }

        cssProperties.push(`${cssKey}: ${cssValue}`);
      }
    });

    return cssProperties.join('; ');
  };

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

  const generateHtml = () => {
    if (!selectedTemplate || !selectedTemplate.components) {
      return selectedTemplate?.html || '';
    }

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${selectedTemplate.name}</title>
  <style>
    body { 
      font-family: Arial, sans-serif; 
      line-height: 1.6; 
      margin: 0;
      padding: 0;
    }
    .email-background {
      background-color: ${selectedTemplate.styles?.backgroundColor || '#FFFFFF'};
      background-image: ${selectedTemplate.styles?.backgroundImage ? `url(${selectedTemplate.styles.backgroundImage})` : 'none'};
      background-size: ${selectedTemplate.styles?.backgroundSize || 'cover'};
      background-repeat: ${selectedTemplate.styles?.backgroundRepeat || 'no-repeat'};
      background-position: ${selectedTemplate.styles?.backgroundPosition || 'center center'};
      padding: 20px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 5px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    .content {
      padding: 20px;
    }
    .footer {
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #666;
      border-top: 1px solid #eee;
    }
    a {
      color: #007bff;
      text-decoration: none;
    }
    @media only screen and (max-width: 600px) {
      .container {
        width: 100% !important;
      }
    }
  </style>
</head>
<body>
  <div class="email-background">
    <div class="container">
      <div class="content">
        ${selectedTemplate.components.map(component => renderComponent(component)).join('\n      ')}
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

  const parsePlaceholders = (html: string): string => {
    const sampleData = {
      firstName: "John",
      lastName: "Doe",
      company: "Acme Inc.",
      position: "Marketing Manager",
      email: "john.doe@example.com"
    };

    let parsedHtml = html;
    Object.entries(sampleData).forEach(([key, value]) => {
      parsedHtml = parsedHtml.replace(new RegExp(`{{${key}}}`, 'g'), value);
    });

    return parsedHtml;
  };

  useEffect(() => {
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
    const fetchContactLists = async () => {
      try {
        setIsLoadingContacts(true);
        const lists = await getUserContactLists();
        setContactLists(lists);
      } catch (error) {
        console.error("Error fetching contact lists:", error);
        toast({
          title: "Error",
          description: "Failed to load contact lists. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingContacts(false);
      }
    };

    fetchContactLists();
  }, [toast]);

  useEffect(() => {
    if (templateId) {
      const fetchFullTemplate = async () => {
        try {
          setIsLoadingTemplate(true);
          const template = await getTemplateById(templateId);
          if (template) {
            setSelectedTemplate(template);
            setSubject(template.subject || "");
          }
        } catch (error) {
          console.error("Error fetching template details:", error);
          toast({
            title: "Error",
            description: "Failed to load template details.",
            variant: "destructive",
          });
        } finally {
          setIsLoadingTemplate(false);
        }
      };

      fetchFullTemplate();
    } else {
      setSelectedTemplate(null);
    }
  }, [templateId, toast]);

  useEffect(() => {
    if (campaignId) {
      const loadCampaign = async () => {
        try {
          startLoading({
            message: "Loading campaign...",
            spinnerType: "pulse"
          });
          
          // Fetch campaign data
          const campaign = await getCampaign(campaignId);
          if (campaign) {
            setName(campaign.name);
            setTemplateId(campaign.templateId);
            setContactListId(campaign.contactListId || "");
            setSubject(campaign.subject || "");
            if (campaign.scheduled) {
              setScheduledDate(new Date(campaign.scheduled));
            }
            
            // Load the template
            const template = await getTemplateById(campaign.templateId);
            if (template) {
              setSelectedTemplate(template);
            }
          }
        } catch (error) {
          console.error("Error loading campaign:", error);
          toast({
            title: "Error",
            description: "Failed to load campaign data.",
            variant: "destructive"
          });
        } finally {
          stopLoading();
        }
      };
      
      loadCampaign();
    }
  }, [campaignId, startLoading, stopLoading, toast]);

  const handleSaveCampaign = async (status: 'draft' | 'scheduled' | 'sending') => {
    if (!name.trim()) {
      toast({
        title: "Campaign name required",
        description: "Please enter a name for your campaign.",
        variant: "destructive"
      });
      return;
    }
    
    if (!templateId) {
      toast({
        title: "Template required",
        description: "Please select an email template.",
        variant: "destructive"
      });
      return;
    }
    
    if (!contactListId) {
      toast({
        title: "Contact list required",
        description: "Please select a contact list for your campaign.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      startLoading({
        message: status === 'sending' ? "Sending campaign..." : "Saving campaign...",
        spinnerType: "pulse"
      });
      
      setIsSending(true);
      
      // Get the number of recipients from the selected contact list
      const selectedList = contactLists.find(list => list.id === contactListId);
      const recipientCount = selectedList?.count || 0;
      
      // Create campaign object
      const campaign: Campaign = {
        id: campaignId || "",
        name,
        templateId,
        contactListId,
        status,
        recipients: recipientCount,
        opened: 0,
        clicked: 0,
        replied: 0,
        createdAt: new Date().toISOString(),
        subject: subject
      };
      
      // Add scheduled date if set
      if (scheduledDate && status === 'scheduled') {
        campaign.scheduled = scheduledDate.toISOString();
      }
      
      // If sending now, set the sentAt date
      if (status === 'sending') {
        campaign.sentAt = new Date().toISOString();
      }
      
      // Save the campaign
      const savedCampaignId = await createCampaign(campaign);
      
      toast({
        title: status === 'sending' ? "Campaign sent" : "Campaign saved",
        description: status === 'sending' 
          ? `Your campaign "${name}" has been sent to ${recipientCount} recipients.`
          : `Your campaign "${name}" has been saved as ${status}.`,
      });
      
      // Navigate back to campaigns list
      navigate("/campaigns");
    } catch (error) {
      console.error("Error saving campaign:", error);
      toast({
        title: "Error",
        description: `Failed to ${status === 'sending' ? 'send' : 'save'} campaign.`,
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
      stopLoading();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{campaignId ? "Edit Campaign" : "Create Campaign"}</h1>
          <p className="text-muted-foreground">Create and send email campaigns to your contacts.</p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => navigate("/campaigns")}
            disabled={isSending}
          >
            Cancel
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => handleSaveCampaign('draft')}
            disabled={isSending}
          >
            Save as Draft
          </Button>
          
          {scheduledDate && (
            <Button 
              variant="outline" 
              onClick={() => handleSaveCampaign('scheduled')}
              disabled={isSending}
              className="bg-brand-blue text-white hover:bg-brand-blue/90"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              Schedule
            </Button>
          )}
          
          <Button 
            onClick={() => handleSaveCampaign('sending')}
            disabled={isSending || !contactListId || !templateId}
            className="bg-brand-purple hover:bg-brand-purple/90"
          >
            {isSending ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send Campaign
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Card className="shadow-sm">
            <CardHeader className="p-3 pb-0">
              <CardTitle className="text-md font-medium">Campaign Details</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-2 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="name" className="text-xs">Campaign Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Summer Promotion 2025"
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="subject" className="text-xs">Email Subject</Label>
                  <Input
                    id="subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Enter email subject line"
                    className="h-8 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="template" className="text-xs">Email Template</Label>
                <Select value={templateId} onValueChange={setTemplateId}>
                  <SelectTrigger className="h-8 text-sm">
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

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="contactList" className="text-xs">Select Contacts</Label>
                  <Select value={contactListId} onValueChange={setContactListId}>
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue placeholder={isLoadingContacts ? "Loading contact lists..." : "Select a contact list"} />
                    </SelectTrigger>
                    <SelectContent>
                      {contactLists.length > 0 ? (
                        contactLists.map((list) => (
                          <SelectItem key={list.id} value={list.id} className="flex justify-between">
                            <div className="flex items-center justify-between w-full">
                              <span>{list.name}</span>
                              <Badge variant="secondary" className="ml-2 text-xs">
                                {list.count} {list.count === 1 ? 'contact' : 'contacts'}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-lists" disabled>
                          {isLoadingContacts ? "Loading contact lists..." : "No contact lists available"}
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  {contactLists.length === 0 && !isLoadingContacts && (
                    <div className="mt-1">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full h-7 text-xs" 
                        onClick={() => navigate("/contacts/new")}
                      >
                        <UserPlus className="h-3 w-3 mr-1" />
                        Create Contact List
                      </Button>
                    </div>
                  )}
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Schedule (Optional)</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal h-8 text-sm",
                          !scheduledDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-3 w-3" />
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
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          {selectedTemplate ? (
            <Card className="overflow-hidden shadow-sm h-full">
              <div className="flex items-center justify-between bg-muted/10 px-2 py-1 border-b">
                <Tabs value={previewTab} onValueChange={(value) => setPreviewTab(value as "preview" | "code")} className="w-full">
                  <div className="flex items-center justify-between w-full">
                    <TabsList className="h-7 bg-transparent p-0">
                      <TabsTrigger value="preview" className="flex items-center h-6 px-2 text-xs data-[state=active]:bg-background">
                        <Eye className="h-3 w-3 mr-1" /> Preview
                      </TabsTrigger>
                      <TabsTrigger value="code" className="flex items-center h-6 px-2 text-xs data-[state=active]:bg-background">
                        <span className="font-mono mr-1">&lt;/&gt;</span> HTML
                      </TabsTrigger>
                    </TabsList>
                    
                    <div className="flex items-center space-x-1">
                      {previewTab === "preview" && (
                        <>
                          <Button
                            variant={previewMode === "desktop" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setPreviewMode("desktop")}
                            className="h-6 w-6 p-0"
                          >
                            <Monitor className="h-3 w-3" />
                          </Button>
                          <Button
                            variant={previewMode === "mobile" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setPreviewMode("mobile")}
                            className="h-6 w-6 p-0"
                          >
                            <Smartphone className="h-3 w-3" />
                          </Button>
                        </>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (templateId) {
                            const fetchFullTemplate = async () => {
                              try {
                                setIsLoadingTemplate(true);
                                const template = await getTemplateById(templateId);
                                if (template) {
                                  setSelectedTemplate(template);
                                }
                              } catch (error) {
                                console.error("Error refreshing template:", error);
                              } finally {
                                setIsLoadingTemplate(false);
                              }
                            };
                            fetchFullTemplate();
                          }
                        }}
                        className="h-6 text-xs"
                      >
                        <RefreshCw className="h-3 w-3 mr-1" /> Refresh
                      </Button>
                    </div>
                  </div>
                  
                  <TabsContent value="preview" className="m-0 p-0 border-0">
                    {isLoadingTemplate ? (
                      <div className="flex items-center justify-center p-8">
                        <PulseSpinner />
                      </div>
                    ) : (
                      <div className={cn(
                        "border-0 overflow-auto",
                        previewMode === "desktop" ? "h-[calc(100vh-230px)]" : "h-[calc(100vh-230px)] max-w-[375px] mx-auto"
                      )}>
                        <div className="p-2 bg-gray-100 border-b text-sm">
                          <div className="font-medium text-sm">Subject: {subject || selectedTemplate.subject || "No subject"}</div>
                          <div className="text-xs text-muted-foreground">From: Your Name &lt;your.email@example.com&gt;</div>
                          <div className="text-xs text-muted-foreground">To: Recipient &lt;recipient@example.com&gt;</div>
                        </div>
                        <iframe 
                          srcDoc={parsePlaceholders(generateHtml())}
                          title="Email Preview"
                          className={cn(
                            "w-full border-0",
                            previewMode === "desktop" ? "h-[calc(100vh-270px)]" : "h-[calc(100vh-270px)]"
                          )}
                        />
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="code" className="m-0 p-0 border-0">
                    <div className="border-b bg-muted/20 px-2 py-1 text-xs text-muted-foreground">
                      HTML source code
                    </div>
                    <div className="h-[calc(100vh-230px)] overflow-auto p-2 bg-muted/10">
                      <pre className="text-xs font-mono whitespace-pre-wrap break-all">
                        {generateHtml()}
                      </pre>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </Card>
          ) : (
            <Card className="h-full flex flex-col justify-center items-center p-6 shadow-sm">
              <Mail className="h-12 w-12 mb-4 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground text-center">Select a template to preview your email</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default CampaignNew;
