
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { emailProviders } from "@/data/mockData";
import { EmailProvider } from "@/types";
import { 
  MailCheck, 
  Mail, 
  Globe, 
  ServerCog, 
  CircleCheck, 
  AlertCircle, 
  Zap,
  BarChart3,
  Clock,
  RefreshCw
} from "lucide-react";

const Integrations = () => {
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState("providers");
  
  useEffect(() => {
    // Animation for provider cards
    const cards = document.querySelectorAll('.provider-card');
    cards.forEach((card, index) => {
      (card as HTMLElement).style.setProperty('--delay', index.toString());
    });
    
    // Animation for feature cards
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach((card, index) => {
      (card as HTMLElement).style.setProperty('--delay', (index + 3).toString());
    });
  }, []);
  
  // Function to render provider icon based on type
  const renderProviderIcon = (type: string) => {
    switch (type) {
      case "gmail":
        return <Mail className="h-8 w-8 text-red-500" />;
      case "outlook":
        return <Mail className="h-8 w-8 text-blue-500" />;
      case "smtp":
        return <ServerCog className="h-8 w-8 text-purple-500" />;
      case "api":
        return <Globe className="h-8 w-8 text-green-500" />;
      default:
        return <Mail className="h-8 w-8" />;
    }
  };
  
  // Function to connect or disconnect an email provider
  const toggleProviderConnection = (provider: EmailProvider) => {
    toast({
      title: provider.connected ? "Disconnecting..." : "Connecting...",
      description: `This would ${provider.connected ? "disconnect" : "connect"} your ${provider.name} account.`
    });
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Integrations</h1>
        <p className="text-muted-foreground">Connect your email accounts and external services.</p>
      </div>
      
      {/* Tabs for different sections */}
      <div className="flex border-b space-x-8">
        <button
          className={`pb-2 px-1 font-medium text-sm transition-colors ${
            activeSection === "providers" 
              ? "border-b-2 border-brand-purple text-foreground" 
              : "text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setActiveSection("providers")}
        >
          Email Providers
        </button>
        
        <button
          className={`pb-2 px-1 font-medium text-sm transition-colors ${
            activeSection === "automations" 
              ? "border-b-2 border-brand-purple text-foreground" 
              : "text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setActiveSection("automations")}
        >
          Automations
        </button>
        
        <button
          className={`pb-2 px-1 font-medium text-sm transition-colors ${
            activeSection === "zapier" 
              ? "border-b-2 border-brand-purple text-foreground" 
              : "text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setActiveSection("zapier")}
        >
          Zapier
        </button>
      </div>
      
      {activeSection === "providers" && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold mb-4">Email Provider Accounts</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {emailProviders.map((provider, index) => (
              <Card 
                key={provider.id} 
                className={`provider-card animate-instruction overflow-hidden ${
                  provider.connected ? "border-green-200" : ""
                }`}
                style={{"--delay": index.toString()} as React.CSSProperties}
              >
                <div className={`h-1 ${provider.connected ? "bg-green-500" : "bg-muted"}`} />
                <CardHeader className="pb-2">
                  <div className="flex justify-between">
                    <div className="p-2 rounded-md bg-muted">
                      {renderProviderIcon(provider.type)}
                    </div>
                    
                    {provider.connected && (
                      <div className="flex items-center text-sm text-green-600">
                        <CircleCheck className="h-4 w-4 mr-1" />
                        Connected
                      </div>
                    )}
                  </div>
                  
                  <CardTitle className="mt-3 text-lg">
                    {provider.name}
                    <CardDescription className="mt-1">
                      {provider.email}
                    </CardDescription>
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="pb-2">
                  {provider.connected && (
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Usage</span>
                        <span>
                          {provider.sent} / {provider.dailyLimit}
                        </span>
                      </div>
                      <Progress 
                        value={(provider.sent / provider.dailyLimit) * 100} 
                        className={`h-1 ${
                          (provider.sent / provider.dailyLimit) > 0.8 
                            ? "bg-red-200" 
                            : "bg-blue-200"
                        }`} 
                      />
                    </div>
                  )}
                </CardContent>
                
                <CardFooter>
                  <Button 
                    variant={provider.connected ? "outline" : "default"}
                    className={provider.connected ? "" : "bg-brand-purple hover:bg-brand-purple/90"}
                    onClick={() => toggleProviderConnection(provider)}
                    fullWidth
                  >
                    {provider.connected ? "Disconnect" : "Connect"}
                  </Button>
                </CardFooter>
              </Card>
            ))}
            
            {/* Add New Provider Card */}
            <Card className="border-dashed provider-card animate-instruction cursor-pointer hover:border-primary hover:bg-muted/50 transition-colors" 
                onClick={() => {
                  toast({
                    title: "Add Email Provider",
                    description: "This feature will be available soon!"
                  });
                }}
                style={{"--delay": emailProviders.length.toString()} as React.CSSProperties}
            >
              <CardContent className="flex flex-col items-center justify-center h-full py-8">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Mail className="h-6 w-6 text-brand-purple" />
                </div>
                <h3 className="font-medium mb-1">Connect New Provider</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Gmail, Outlook, SMTP, or API
                </p>
              </CardContent>
            </Card>
          </div>
          
          {/* Email Provider Tips */}
          <Card className="bg-muted/50 border-none mt-8">
            <CardHeader>
              <div className="flex items-center gap-2">
                <MailCheck className="h-5 w-5 text-brand-purple" />
                <CardTitle className="text-lg">Email Deliverability Tips</CardTitle>
              </div>
              <CardDescription>
                Maximize your email reach with these proven techniques
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2 flex items-center">
                  <CircleCheck className="h-4 w-4 mr-2 text-green-500" />
                  Warm Up Your Email Accounts
                </h4>
                <p className="text-sm text-muted-foreground">
                  Gradually increase sending volume and engage in natural email activities to build reputation.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2 flex items-center">
                  <CircleCheck className="h-4 w-4 mr-2 text-green-500" />
                  Authenticate Your Domain
                </h4>
                <p className="text-sm text-muted-foreground">
                  Set up SPF, DKIM and DMARC records to verify your identity to email providers.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2 text-amber-500" />
                  Avoid Spam Triggers
                </h4>
                <p className="text-sm text-muted-foreground">
                  Don't use excessive punctuation, all caps, or spam-triggering words in your emails.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2 text-amber-500" />
                  Respect Sending Limits
                </h4>
                <p className="text-sm text-muted-foreground">
                  Stay within your provider's sending limits and gradually increase volume over time.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {activeSection === "automations" && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold mb-4">Email Automation Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="feature-card animate-instruction">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-md bg-blue-100">
                    <RefreshCw className="h-6 w-6 text-brand-blue" />
                  </div>
                  <div>
                    <CardTitle>Follow-Up Sequences</CardTitle>
                    <CardDescription>
                      Automate email follow-ups based on recipient actions
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p>Send automated follow-up emails to recipients who haven't responded to your initial outreach. Schedule multiple stages of follow-up with custom time delays.</p>
              </CardContent>
              <CardFooter>
                <Button className="w-full bg-brand-blue hover:bg-brand-blue/90" onClick={() => {
                  toast({
                    title: "Follow-Up Sequences",
                    description: "This feature will be available soon!"
                  });
                }}>
                  Set Up Sequences
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="feature-card animate-instruction">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-md bg-purple-100">
                    <Clock className="h-6 w-6 text-brand-purple" />
                  </div>
                  <div>
                    <CardTitle>Send Time Optimization</CardTitle>
                    <CardDescription>
                      Schedule emails for optimal delivery times
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p>Analyze recipient engagement patterns to determine the best time to deliver your emails. Personalize sending times for each recipient based on their previous interactions.</p>
              </CardContent>
              <CardFooter>
                <Button className="w-full bg-brand-purple hover:bg-brand-purple/90" onClick={() => {
                  toast({
                    title: "Send Time Optimization",
                    description: "This feature will be available soon!"
                  });
                }}>
                  Enable Smart Timing
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="feature-card animate-instruction">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-md bg-green-100">
                    <Zap className="h-6 w-6 text-brand-teal" />
                  </div>
                  <div>
                    <CardTitle>AI Reply Detection</CardTitle>
                    <CardDescription>
                      Automatically detect and categorize email replies
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p>Our AI system automatically detects positive, neutral, and negative replies to your emails. Get notifications for important responses and auto-categorize replies for better follow-up.</p>
              </CardContent>
              <CardFooter>
                <Button className="w-full bg-brand-teal hover:bg-brand-teal/90" onClick={() => {
                  toast({
                    title: "AI Reply Detection",
                    description: "This feature will be available soon!"
                  });
                }}>
                  Configure Reply Rules
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="feature-card animate-instruction">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-md bg-amber-100">
                    <BarChart3 className="h-6 w-6 text-amber-600" />
                  </div>
                  <div>
                    <CardTitle>Campaign Analytics</CardTitle>
                    <CardDescription>
                      Detailed metrics and performance insights
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p>Get comprehensive analytics on your email campaigns including open rates, click-through rates, reply rates, and more. Use A/B testing to optimize your subject lines and content.</p>
              </CardContent>
              <CardFooter>
                <Button className="w-full bg-amber-600 hover:bg-amber-700" onClick={() => {
                  toast({
                    title: "Campaign Analytics",
                    description: "This feature will be available soon!"
                  });
                }}>
                  View Analytics
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      )}
      
      {activeSection === "zapier" && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold mb-4">Zapier Integration</h2>
          
          <Card className="border p-6">
            <div className="flex flex-col md:flex-row gap-6 items-center">
              <div className="h-16 w-16 flex items-center justify-center rounded-full bg-[#FF4A00] text-white text-2xl font-bold">
                Z
              </div>
              
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-xl font-semibold mb-2">Connect with 5,000+ apps via Zapier</h3>
                <p className="text-muted-foreground mb-4">
                  Integrate your cold email campaigns with CRMs, spreadsheets, calendars, and thousands of other applications through Zapier.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button className="bg-[#FF4A00] hover:bg-[#FF4A00]/90" onClick={() => {
                    toast({
                      title: "Connect to Zapier",
                      description: "This feature will be available soon!"
                    });
                  }}>
                    Connect Zapier
                  </Button>
                  
                  <Button variant="outline" onClick={() => {
                    toast({
                      title: "Learn More",
                      description: "This would open the Zapier documentation."
                    });
                  }}>
                    Learn More
                  </Button>
                </div>
              </div>
            </div>
            
            <Separator className="my-8" />
            
            <div className="space-y-6">
              <h4 className="font-medium text-lg">Popular Zapier Integrations</h4>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                {["Salesforce", "Google Sheets", "HubSpot", "Slack", "Calendly", "Notion"].map((app, index) => (
                  <Card key={app} className="p-4 text-center hover:border-brand-purple cursor-pointer transition-colors">
                    <div className="h-12 w-12 mx-auto bg-muted rounded-md mb-2 flex items-center justify-center">
                      {app.charAt(0)}
                    </div>
                    <p className="text-sm">{app}</p>
                  </Card>
                ))}
              </div>
              
              <div className="space-y-4 mt-8">
                <h4 className="font-medium">Example Zap Workflows</h4>
                
                <div className="space-y-3">
                  <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                    <p className="font-medium">Add new recipients to a campaign when they fill out a form</p>
                    <p className="text-sm text-muted-foreground">Form apps → ColdEmail</p>
                  </div>
                  
                  <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                    <p className="font-medium">Create CRM records when recipients reply to your emails</p>
                    <p className="text-sm text-muted-foreground">ColdEmail → CRM apps</p>
                  </div>
                  
                  <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                    <p className="font-medium">Send Slack notifications for important email replies</p>
                    <p className="text-sm text-muted-foreground">ColdEmail → Slack</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Integrations;
