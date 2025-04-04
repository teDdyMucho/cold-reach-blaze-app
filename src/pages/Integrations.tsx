import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { EmailProvider } from "@/types";
import { Mail, MessageSquare, CreditCard, FileCheck, Github, Slack, Calendar, ArrowRight, Server, Key, Lock, RefreshCw, CheckCircle, AlertCircle } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { saveSmtpConfig, getSmtpConfig, testSmtpConnection } from "@/lib/firebaseService";
import { useLoading } from "@/hooks/use-loading";

const Integrations = () => {
  const { toast } = useToast();
  const { startLoading, stopLoading } = useLoading();
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
    },
    {
      id: "3",
      name: "SMTP Server",
      type: "smtp",
      email: "",
      connected: false,
      dailyLimit: 1000,
      sent: 0
    }
  ]);

  // SMTP Configuration
  const [smtpConfig, setSmtpConfig] = useState({
    host: "",
    port: "587",
    username: "",
    password: "",
    secure: false,
    fromName: "",
    fromEmail: ""
  });

  const [smtpTestStatus, setSmtpTestStatus] = useState<"idle" | "testing" | "success" | "error">("idle");

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
            // For SMTP, we'll handle this differently
            if (provider.type === 'smtp') {
              return provider; // Don't change status yet, we'll handle this in saveSMTPConfig
            }
            
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

  // Load saved SMTP configuration on component mount
  useEffect(() => {
    const loadSmtpConfig = async () => {
      try {
        const savedConfig = await getSmtpConfig();
        if (savedConfig) {
          setSmtpConfig({
            host: savedConfig.host || "",
            port: savedConfig.port || "587",
            username: savedConfig.username || "",
            password: savedConfig.password || "",
            secure: savedConfig.secure || false,
            fromName: savedConfig.fromName || "",
            fromEmail: savedConfig.fromEmail || ""
          });
          
          // Update the SMTP provider in the list if it's connected
          if (savedConfig.host && savedConfig.username && savedConfig.password) {
            setEmailProviders(providers => 
              providers.map(provider => {
                if (provider.type === 'smtp') {
                  return { 
                    ...provider, 
                    connected: true,
                    email: savedConfig.fromEmail
                  };
                }
                return provider;
              })
            );
          }
        }
      } catch (error) {
        console.error("Error loading SMTP configuration:", error);
      }
    };
    
    loadSmtpConfig();
  }, []);

  const handleSaveSMTPConfig = async () => {
    // Validate SMTP configuration
    if (!smtpConfig.host || !smtpConfig.port || !smtpConfig.username || !smtpConfig.password) {
      toast({
        title: "Missing SMTP Configuration",
        description: "Please fill in all required SMTP server details",
        variant: "destructive"
      });
      return;
    }

    if (!smtpConfig.fromEmail || !smtpConfig.fromName) {
      toast({
        title: "Missing Sender Information",
        description: "Please provide a sender name and email address",
        variant: "destructive"
      });
      return;
    }

    try {
      startLoading({
        message: "Saving SMTP configuration...",
        spinnerType: "pulse"
      });
      
      // Save the SMTP configuration to Firestore
      const success = await saveSmtpConfig(smtpConfig);
      
      if (success) {
        // Update the SMTP provider in the list
        setEmailProviders(providers => 
          providers.map(provider => {
            if (provider.type === 'smtp') {
              return { 
                ...provider, 
                connected: true,
                email: smtpConfig.fromEmail
              };
            }
            return provider;
          })
        );
        
        toast({
          title: "SMTP Server Connected",
          description: `Successfully configured SMTP server: ${smtpConfig.host}`,
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to save SMTP configuration. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error saving SMTP configuration:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      stopLoading();
    }
  };

  const handleTestSMTPConnection = async () => {
    // Validate SMTP configuration
    if (!smtpConfig.host || !smtpConfig.port || !smtpConfig.username || !smtpConfig.password) {
      toast({
        title: "Missing SMTP Configuration",
        description: "Please fill in all required SMTP server details",
        variant: "destructive"
      });
      return;
    }

    setSmtpTestStatus("testing");
    
    try {
      // Test the SMTP connection
      const success = await testSmtpConnection(smtpConfig);
      
      if (success) {
        setSmtpTestStatus("success");
        toast({
          title: "SMTP Connection Successful",
          description: "Your SMTP server is correctly configured",
        });
      } else {
        setSmtpTestStatus("error");
        toast({
          title: "SMTP Connection Failed",
          description: "Could not connect to the SMTP server. Please check your settings.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error testing SMTP connection:", error);
      setSmtpTestStatus("error");
      toast({
        title: "Error",
        description: "An unexpected error occurred while testing the connection.",
        variant: "destructive"
      });
    }
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
                      disabled={provider.type === 'smtp'} // Disable toggle for SMTP, use the form instead
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
                  {provider.type === 'smtp' ? (
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      onClick={() => {
                        const smtpConfigDialog = document.getElementById('smtp-config-dialog');
                        if (smtpConfigDialog) {
                          smtpConfigDialog.scrollIntoView({ behavior: 'smooth' });
                        }
                      }}
                    >
                      Configure SMTP Server
                    </Button>
                  ) : (
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      onClick={() => handleToggleEmailProvider(provider.id)}
                    >
                      {provider.connected ? "Disconnect" : "Connect"} {provider.name}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
        
        {/* SMTP Configuration */}
        <div id="smtp-config-dialog">
          <h2 className="text-xl font-semibold mb-4">SMTP Server Configuration</h2>
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <Server className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle>SMTP Email Server</CardTitle>
                </div>
                <Badge variant={
                  emailProviders.find(p => p.type === 'smtp')?.connected
                    ? "outline" 
                    : "secondary"
                } className={
                  emailProviders.find(p => p.type === 'smtp')?.connected
                    ? "bg-green-100 text-green-800 hover:bg-green-200"
                    : ""
                }>
                  {emailProviders.find(p => p.type === 'smtp')?.connected
                    ? "Connected" 
                    : "Not Connected"}
                </Badge>
              </div>
              <CardDescription>
                Configure your own SMTP server to send emails from your domain
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="server" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="server">Server Settings</TabsTrigger>
                  <TabsTrigger value="sender">Sender Information</TabsTrigger>
                </TabsList>
                <TabsContent value="server" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="smtp-host">SMTP Host</Label>
                      <Input
                        id="smtp-host"
                        placeholder="smtp.example.com"
                        value={smtpConfig.host}
                        onChange={(e) => setSmtpConfig({...smtpConfig, host: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="smtp-port">SMTP Port</Label>
                      <Select 
                        value={smtpConfig.port} 
                        onValueChange={(value) => setSmtpConfig({...smtpConfig, port: value})}
                      >
                        <SelectTrigger id="smtp-port">
                          <SelectValue placeholder="Select port" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="25">25 (SMTP)</SelectItem>
                          <SelectItem value="465">465 (SMTPS)</SelectItem>
                          <SelectItem value="587">587 (SMTP with STARTTLS)</SelectItem>
                          <SelectItem value="2525">2525 (Alternative)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="smtp-username">Username</Label>
                    <Input
                      id="smtp-username"
                      placeholder="username@example.com"
                      value={smtpConfig.username}
                      onChange={(e) => setSmtpConfig({...smtpConfig, username: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="smtp-password">Password</Label>
                    <Input
                      id="smtp-password"
                      type="password"
                      placeholder="••••••••••••"
                      value={smtpConfig.password}
                      onChange={(e) => setSmtpConfig({...smtpConfig, password: e.target.value})}
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="smtp-secure"
                      checked={smtpConfig.secure}
                      onCheckedChange={(checked) => setSmtpConfig({...smtpConfig, secure: checked})}
                    />
                    <Label htmlFor="smtp-secure" className="cursor-pointer">Use SSL/TLS</Label>
                  </div>
                </TabsContent>
                
                <TabsContent value="sender" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="from-name">From Name</Label>
                    <Input
                      id="from-name"
                      placeholder="Your Name or Company"
                      value={smtpConfig.fromName}
                      onChange={(e) => setSmtpConfig({...smtpConfig, fromName: e.target.value})}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      This name will appear as the sender of your emails
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="from-email">From Email</Label>
                    <Input
                      id="from-email"
                      placeholder="noreply@yourdomain.com"
                      value={smtpConfig.fromEmail}
                      onChange={(e) => setSmtpConfig({...smtpConfig, fromEmail: e.target.value})}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      This email address will be used as the sender address
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button 
                variant="outline"
                className="flex-1"
                onClick={handleTestSMTPConnection}
                disabled={smtpTestStatus === "testing"}
              >
                {smtpTestStatus === "testing" ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Testing...
                  </>
                ) : smtpTestStatus === "success" ? (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    Test Connection
                  </>
                ) : smtpTestStatus === "error" ? (
                  <>
                    <AlertCircle className="mr-2 h-4 w-4 text-red-500" />
                    Test Connection
                  </>
                ) : (
                  <>
                    <Key className="mr-2 h-4 w-4" />
                    Test Connection
                  </>
                )}
              </Button>
              <Button 
                variant="default"
                className="flex-1 bg-brand-purple hover:bg-brand-purple/90"
                onClick={handleSaveSMTPConfig}
              >
                <Lock className="mr-2 h-4 w-4" />
                Save Configuration
              </Button>
            </CardFooter>
          </Card>
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
