import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Campaign, Template } from "@/types";
import { Plus, Search, MailCheck, Send, Clock, Calendar, LineChart, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getUserCampaigns, getUserTemplates, deleteCampaign } from "@/lib/firebaseService";
import { useLoading } from "@/hooks/use-loading";

const Campaigns = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { startLoading, stopLoading } = useLoading();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch campaigns and templates from Firestore
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        startLoading({
          message: "Loading campaigns...",
          spinnerType: "pulse"
        });
        
        // Fetch both campaigns and templates in parallel
        const [userCampaigns, userTemplates] = await Promise.all([
          getUserCampaigns(),
          getUserTemplates()
        ]);
        
        setCampaigns(userCampaigns);
        setTemplates(userTemplates);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Failed to load campaigns. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
        stopLoading();
      }
    };
    
    fetchData();
  }, [toast, startLoading, stopLoading]);
  
  // Filter campaigns based on search term and status filter
  useEffect(() => {
    let result = [...campaigns];
    
    // Filter by search term
    if (searchTerm) {
      result = result.filter(campaign => 
        campaign.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by status
    if (statusFilter !== "all") {
      result = result.filter(campaign => campaign.status === statusFilter);
    }
    
    setFilteredCampaigns(result);
    
    // Add animation classes to cards
    const cards = document.querySelectorAll('.campaign-card');
    cards.forEach((card, index) => {
      (card as HTMLElement).style.setProperty('--delay', index.toString());
    });
  }, [searchTerm, statusFilter, campaigns]);
  
  // Helper function to get template name
  const getTemplateName = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    return template ? template.name : "Unknown Template";
  };
  
  // Function to display the campaign status with appropriate styling
  const renderStatus = (status: string) => {
    switch (status) {
      case "draft":
        return <Badge variant="outline">Draft</Badge>;
      case "scheduled":
        return <Badge variant="secondary">Scheduled</Badge>;
      case "sending":
        return <Badge className="bg-brand-blue text-white">Sending</Badge>;
      case "sent":
        return <Badge className="bg-green-500 text-white">Sent</Badge>;
      case "paused":
        return <Badge variant="destructive">Paused</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  // Function to create a new campaign
  const handleCreateCampaign = () => {
    navigate("/campaign-new");
  };

  // Function to delete a campaign
  const handleDeleteCampaign = async (campaignId: string) => {
    try {
      startLoading({
        message: "Deleting campaign...",
        spinnerType: "pulse"
      });
      
      await deleteCampaign(campaignId);
      
      // Update the local state
      setCampaigns(prevCampaigns => prevCampaigns.filter(campaign => campaign.id !== campaignId));
      
      toast({
        title: "Campaign deleted",
        description: "The campaign has been successfully deleted."
      });
    } catch (error) {
      console.error("Error deleting campaign:", error);
      toast({
        title: "Error",
        description: "Failed to delete the campaign. Please try again.",
        variant: "destructive"
      });
    } finally {
      stopLoading();
    }
  };
  
  // Calculate campaign metrics
  const calculateMetrics = () => {
    const totalCampaigns = campaigns.length;
    const totalRecipients = campaigns.reduce((sum, campaign) => sum + campaign.recipients, 0);
    
    // Calculate average open rate (avoid division by zero)
    let averageOpenRate = 0;
    if (totalRecipients > 0) {
      const totalOpened = campaigns.reduce((sum, campaign) => sum + campaign.opened, 0);
      averageOpenRate = Math.round((totalOpened / totalRecipients) * 100);
    }
    
    return { totalCampaigns, totalRecipients, averageOpenRate };
  };
  
  const { totalCampaigns, totalRecipients, averageOpenRate } = calculateMetrics();
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Campaigns</h1>
        <p className="text-muted-foreground">Create and manage your email campaigns.</p>
      </div>
      
      {/* Campaign Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="animate-instruction" style={{"--delay": "0"} as React.CSSProperties}>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <MailCheck className="h-5 w-5 text-brand-purple" />
              Campaign Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-1">{totalCampaigns}</div>
            <p className="text-sm text-muted-foreground">Total Campaigns</p>
          </CardContent>
        </Card>
        
        <Card className="animate-instruction" style={{"--delay": "1"} as React.CSSProperties}>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Send className="h-5 w-5 text-brand-blue" />
              Emails Sent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-1">{totalRecipients}</div>
            <p className="text-sm text-muted-foreground">Total Recipients</p>
          </CardContent>
        </Card>
        
        <Card className="animate-instruction" style={{"--delay": "2"} as React.CSSProperties}>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <LineChart className="h-5 w-5 text-brand-teal" />
              Average Open Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-1">{averageOpenRate}%</div>
            <p className="text-sm text-muted-foreground">Industry avg: 21.5%</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Filters and actions */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search campaigns..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="sending">Sending</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button onClick={handleCreateCampaign} className="bg-brand-purple hover:bg-brand-purple/90">
          <Plus className="mr-2 h-4 w-4" />
          New Campaign
        </Button>
      </div>
      
      {/* Campaign List */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading campaigns...</p>
        </div>
      ) : filteredCampaigns.length > 0 ? (
        <div className="space-y-4">
          {filteredCampaigns.map((campaign, index) => (
            <Card key={campaign.id} className="campaign-card hover:shadow-md transition-shadow animate-instruction" style={{"--delay": (index + 3).toString()} as React.CSSProperties}>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between">
                  <div className="space-y-2 mb-4 md:mb-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-medium">{campaign.name}</h3>
                      {renderStatus(campaign.status)}
                    </div>
                    
                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <span className="font-medium">Template:</span> {getTemplateName(campaign.templateId)}
                      </div>
                      
                      {campaign.scheduled && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>Scheduled: {new Date(campaign.scheduled).toLocaleDateString()}</span>
                        </div>
                      )}
                      
                      {campaign.sentAt && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>Sent: {new Date(campaign.sentAt).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button variant="outline" size="sm" onClick={() => {
                      toast({
                        title: "View Campaign Stats",
                        description: "This feature will be available soon!"
                      });
                    }}>
                      View Stats
                    </Button>
                    
                    <Button variant="outline" size="sm" onClick={() => {
                      toast({
                        title: "Duplicate Campaign",
                        description: "This feature will be available soon!"
                      });
                    }}>
                      Duplicate
                    </Button>
                    
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteCampaign(campaign.id)}>
                      Delete
                    </Button>
                  </div>
                </div>
                
                {(campaign.status === "sending" || campaign.status === "sent") && (
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{campaign.opened} of {campaign.recipients} opened</span>
                    </div>
                    <Progress value={(campaign.opened / campaign.recipients) * 100} className="h-2" />
                    
                    <div className="grid grid-cols-3 gap-4 mt-4">
                      <div className="text-center">
                        <div className="text-sm font-medium">{Math.round((campaign.opened / campaign.recipients) * 100)}%</div>
                        <div className="text-xs text-muted-foreground">Open Rate</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-medium">{Math.round((campaign.clicked / campaign.recipients) * 100)}%</div>
                        <div className="text-xs text-muted-foreground">Click Rate</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-medium">{Math.round((campaign.replied / campaign.recipients) * 100)}%</div>
                        <div className="text-xs text-muted-foreground">Reply Rate</div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="border rounded-md p-8 text-center">
          <div className="flex flex-col items-center justify-center">
            <Send className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium mb-1">No campaigns found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || statusFilter !== "all" 
                ? "Try adjusting your filters to see more results." 
                : "Get started by creating your first email campaign."}
            </p>
            <Button onClick={handleCreateCampaign}>
              <Plus className="mr-2 h-4 w-4" />
              Create Campaign
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Campaigns;
