
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { campaigns, templates } from "@/data/mockData";
import { Campaign } from "@/types";
import { Plus, Search, MailCheck, Send, Clock, Calendar, LineChart } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Campaigns = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [filteredCampaigns, setFilteredCampaigns] = useState<Campaign[]>(campaigns);
  
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
  }, [searchTerm, statusFilter]);
  
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
    toast({
      title: "Creating New Campaign",
      description: "This feature will be available soon!"
    });
  };
  
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
            <div className="text-2xl font-bold mb-1">{campaigns.length}</div>
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
            <div className="text-2xl font-bold mb-1">
              {campaigns.reduce((sum, campaign) => sum + campaign.recipients, 0)}
            </div>
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
            <div className="text-2xl font-bold mb-1">
              {Math.round((campaigns.reduce((sum, campaign) => sum + campaign.opened, 0) / 
                campaigns.reduce((sum, campaign) => sum + campaign.recipients, 0)) * 100)}%
            </div>
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
                  
                  <Button size="sm" onClick={() => {
                    toast({
                      title: campaign.status === "draft" ? "Edit Campaign" : "Duplicate Campaign",
                      description: "This feature will be available soon!"
                    });
                  }}>
                    {campaign.status === "draft" ? "Edit" : "Duplicate"}
                  </Button>
                </div>
              </div>
              
              {/* Campaign Stats */}
              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Recipients</div>
                  <div className="font-medium">{campaign.recipients}</div>
                </div>
                
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Opened</div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{campaign.opened}</span>
                    <span className="text-xs text-muted-foreground">
                      ({campaign.recipients ? Math.round((campaign.opened / campaign.recipients) * 100) : 0}%)
                    </span>
                  </div>
                  <Progress value={campaign.recipients ? (campaign.opened / campaign.recipients) * 100 : 0} className="h-1 mt-1" />
                </div>
                
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Clicked</div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{campaign.clicked}</span>
                    <span className="text-xs text-muted-foreground">
                      ({campaign.recipients ? Math.round((campaign.clicked / campaign.recipients) * 100) : 0}%)
                    </span>
                  </div>
                  <Progress value={campaign.recipients ? (campaign.clicked / campaign.recipients) * 100 : 0} className="h-1 mt-1" />
                </div>
                
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Replied</div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{campaign.replied}</span>
                    <span className="text-xs text-muted-foreground">
                      ({campaign.recipients ? Math.round((campaign.replied / campaign.recipients) * 100) : 0}%)
                    </span>
                  </div>
                  <Progress value={campaign.recipients ? (campaign.replied / campaign.recipients) * 100 : 0} className="h-1 mt-1" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {filteredCampaigns.length === 0 && (
          <div className="text-center py-12 border rounded-lg bg-muted/20">
            <div className="bg-muted h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Send className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-medium mb-2">No campaigns found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || statusFilter !== "all" ? 
                "No campaigns match your search criteria." : 
                "You haven't created any campaigns yet."}
            </p>
            <Button onClick={handleCreateCampaign}>
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Campaign
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Campaigns;
