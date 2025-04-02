import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { EmailProvider } from "@/types";
import { Mail, MessageSquare, CreditCard, FileCheck, Github, Slack, Calendar, ArrowRight } from "lucide-react";

const Integrations = () => {
  const { toast } = useToast();
  const [emailProviders, setEmailProviders] = useState<EmailProvider[]>([
    {
      id: "1",
      name: "Gmail",
      type: "gmail",
      email: "user@gmail.com",
      connected: true,
      dailyLimit: 500,
      sent: 120
    },
    {
      id: "2",
      name: "Outlook",
      type: "outlook",
      email: "",
      connected: false,
      dailyLimit: 300,
      sent: 0
    }
  ]);

  const [zapierWebhookUrl, setZapierWebhookUrl] = useState("");
  
  // Available integrations with their connection status
  const [integrations, setIntegrations] = useState([
    { 
      id: "slack", 
      name: "Slack", 
      description: "Send notifications and alerts to Slack channels", 
      icon: Slack,
      connected: false,
      apiKey: ""
    },
    { 
      id: "calendly", 
      name: "Calendly", 
      description: "Schedule meetings directly from email campaigns", 
      icon: Calendar,
      connected: false,
      apiKey: ""
    },
    { 
      id: "github", 
      name: "GitHub", 
      description: "Connect your repositories for documentation", 
      icon: Github,
      connected: false,
      apiKey: ""
    },
    { 
      id: "stripe", 
      name: "Stripe", 
      description: "Process payments and subscriptions", 
      icon: CreditCard,
      connected: false,
      apiKey: ""
    }
  ]);

  const handleToggleEmailProvider = (id: string) => {
    setEmailProviders(providers => 
      providers.map(provider => {
        if (provider.id === id) {
          if (provider.connected) {
            // Disconnect
            toast({
              title: `${provider.name} Disconnected`,
              description: `Successfully disconnected from ${provider.name}`,
            });
            return { ...provider, connected: false };
          } else {
            // Connect (in a real app, this would show an OAuth flow)
            toast({
              title: `${provider.name} Connected`,
              description: `Successfully connected to ${provider.name}`,
            });
            return { 
              ...provider, 
              connected: true,
              email: provider.type === 'gmail' ? 'user@gmail.com' : 'user@outlook.com'
            };
          }
        }
        return provider;
      })
    );
  };

  const handleConnectIntegration = (id: string) => {
    setIntegrations(prevIntegrations => 
      prevIntegrations.map(integration => {
        if (integration.id === id) {
          const isConnecting = !integration.connected;
          toast({
            title: isConnecting ? `${integration.name} Connected` : `${integration.name} Disconnected`,
            description: isConnecting 
              ? `Successfully connected to ${integration.name}` 
              : `Successfully disconnected from ${integration.name}`,
          });
          return { 
            ...integration, 
            connected: isConnecting,
            apiKey: isConnecting ? "api-" + Math.random().toString(36).substring(2, 15) : ""
          };
        }
        return integration;
      })
    );
  };

  const handleSaveZapierWebhook = () => {
    if (!zapierWebhookUrl) {
      toast({
        title: "Error",
        description: "Please enter a valid Zapier webhook URL",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Zapier Webhook Saved",
      description: "Your Zapier webhook has been successfully configured"
    });
  };

  const handleTestZapierWebhook = () => {
    if (!zapierWebhookUrl) {
      toast({
        title: "Error",
        description: "Please enter a valid Zapier webhook URL first",
        variant: "destructive"
      });
      return;
    }

    fetch(zapierWebhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      mode: "no-cors", // Handle CORS for external calls
      body: JSON.stringify({
        timestamp: new Date().toISOString(),
        event: "test_trigger",
        source: "ColdEmail App"
      }),
    })
      .then(() => {
        toast({
          title: "Webhook Triggered",
          description: "Test event sent to Zapier successfully"
        });
      })
      .catch(error => {
        console.error("Error triggering webhook:", error);
        toast({
          title: "Error",
          description: "Failed to trigger Zapier webhook",
          variant: "destructive"
        });
      });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Integrations</h1>
        <p className="text-muted-foreground">Connect your email accounts and third-party services</p>
      </div>
      
      <div className="grid gap-6">
        {/* Email Providers */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Email Providers</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {emailProviders.map((provider) => (
              <Card key={provider.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <Mail className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle>{provider.name}</CardTitle>
                    </div>
                    <Switch 
                      checked={provider.connected} 
                      onCheckedChange={() => handleToggleEmailProvider(provider.id)}
                    />
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  {provider.connected ? (
                    <>
                      <div className="text-sm mb-2">
                        <span className="font-medium">Email:</span> {provider.email}
                      </div>
                      <div className="text-sm flex gap-2">
                        <span className="font-medium">Daily Limit:</span> {provider.dailyLimit}
                        <span className="font-medium ml-2">Sent:</span> {provider.sent}
                      </div>
                      <Badge variant="outline" className="mt-2 bg-primary/10 hover:bg-primary/20">
                        Connected
                      </Badge>
                    </>
                  ) : (
                    <CardDescription>
                      Connect your {provider.name} account to send emails
                    </CardDescription>
                  )}
                </CardContent>
                <CardFooter>
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={() => handleToggleEmailProvider(provider.id)}
                  >
                    {provider.connected ? "Disconnect" : "Connect"} {provider.name}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
        
        {/* Zapier Integration */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Zapier</h2>
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="bg-[#FF4A00]/10 p-2 rounded-full">
                    <ArrowRight className="h-5 w-5 text-[#FF4A00]" />
                  </div>
                  <CardTitle>Zapier Integration</CardTitle>
                </div>
              </div>
              <CardDescription>
                Automate your workflow by connecting ColdEmail to thousands of apps
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label htmlFor="zapier-webhook" className="block text-sm font-medium mb-1">Webhook URL</label>
                  <Input 
                    id="zapier-webhook"
                    placeholder="https://hooks.zapier.com/hooks/catch/..." 
                    value={zapierWebhookUrl}
                    onChange={(e) => setZapierWebhookUrl(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Create a Zapier webhook to receive events from your ColdEmail account
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button 
                variant="outline"
                className="flex-1"
                onClick={handleSaveZapierWebhook}
              >
                Save Webhook
              </Button>
              <Button 
                variant="default"
                className="flex-1"
                onClick={handleTestZapierWebhook}
              >
                Test Webhook
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        {/* Other Integrations */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Available Integrations</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {integrations.map((integration) => (
              <Card key={integration.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <integration.icon className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle>{integration.name}</CardTitle>
                    </div>
                    <Switch 
                      checked={integration.connected} 
                      onCheckedChange={() => handleConnectIntegration(integration.id)}
                    />
                  </div>
                  <CardDescription>
                    {integration.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  {integration.connected && (
                    <div className="text-sm mb-2">
                      <span className="font-medium">API Key:</span> 
                      <code className="ml-2 bg-muted p-1 rounded text-xs">{integration.apiKey}</code>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={() => handleConnectIntegration(integration.id)}
                  >
                    {integration.connected ? "Disconnect" : "Connect"} {integration.name}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Integrations;
