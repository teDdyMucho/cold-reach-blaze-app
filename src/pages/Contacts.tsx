
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { contacts } from "@/data/mockData";
import { Contact, EmailHistory } from "@/types";
import { Plus, Search, Users, UserRound, Mail, Clock, Tag, ChevronDown, Upload, Download } from "lucide-react";

const Contacts = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>(contacts);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  
  useEffect(() => {
    let result = [...contacts];
    
    // Filter by search term
    if (searchTerm) {
      result = result.filter(contact => 
        contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.company?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by status
    if (statusFilter !== "all") {
      result = result.filter(contact => contact.status === statusFilter);
    }
    
    setFilteredContacts(result);
    
    // Animate contact cards
    const cards = document.querySelectorAll('.contact-card');
    cards.forEach((card, index) => {
      (card as HTMLElement).style.setProperty('--delay', index.toString());
    });
  }, [searchTerm, statusFilter]);
  
  // Function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  // Function to render status badge
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500 text-white">Active</Badge>;
      case "unsubscribed":
        return <Badge variant="secondary">Unsubscribed</Badge>;
      case "bounced":
        return <Badge variant="destructive">Bounced</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  // Function to render email history status
  const renderEmailStatus = (status: string) => {
    switch (status) {
      case "delivered":
        return <Badge variant="outline" className="text-muted-foreground">Delivered</Badge>;
      case "opened":
        return <Badge variant="secondary">Opened</Badge>;
      case "clicked":
        return <Badge className="bg-brand-blue text-white">Clicked</Badge>;
      case "replied":
        return <Badge className="bg-green-500 text-white">Replied</Badge>;
      case "bounced":
        return <Badge variant="destructive">Bounced</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  // Function to handle importing contacts
  const handleImportContacts = () => {
    toast({
      title: "Import Contacts",
      description: "This feature will be available soon!"
    });
  };
  
  // Function to handle exporting contacts
  const handleExportContacts = () => {
    toast({
      title: "Export Contacts",
      description: "This feature will be available soon!"
    });
  };
  
  // Function to handle adding a new contact
  const handleAddContact = () => {
    toast({
      title: "Add New Contact",
      description: "This feature will be available soon!"
    });
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Contacts</h1>
        <p className="text-muted-foreground">View and manage your contact lists.</p>
      </div>
      
      {/* Contact Analytics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="contact-card animate-instruction" style={{"--delay": "0"} as React.CSSProperties}>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5 text-brand-purple" />
              Total Contacts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contacts.length}</div>
          </CardContent>
        </Card>
        
        <Card className="contact-card animate-instruction" style={{"--delay": "1"} as React.CSSProperties}>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <UserRound className="h-5 w-5 text-brand-blue" />
              Active Contacts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {contacts.filter(contact => contact.status === "active").length}
            </div>
          </CardContent>
        </Card>
        
        <Card className="contact-card animate-instruction" style={{"--delay": "2"} as React.CSSProperties}>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Tag className="h-5 w-5 text-brand-teal" />
              Unique Companies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(contacts.map(contact => contact.company).filter(Boolean)).size}
            </div>
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
              placeholder="Search contacts..."
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
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="unsubscribed">Unsubscribed</SelectItem>
              <SelectItem value="bounced">Bounced</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex gap-2">
          <div className="flex">
            <Button variant="outline" className="rounded-r-none border-r-0" onClick={handleImportContacts}>
              <Upload className="mr-2 h-4 w-4" />
              Import
            </Button>
            <Button variant="outline" className="rounded-l-none" onClick={handleExportContacts}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
          
          <Button onClick={handleAddContact} className="bg-brand-purple hover:bg-brand-purple/90">
            <Plus className="mr-2 h-4 w-4" />
            Add Contact
          </Button>
        </div>
      </div>
      
      {/* Contact List and Details */}
      <div className="border rounded-lg">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Contacted</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContacts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Users className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-muted-foreground mb-2">No contacts found</p>
                      <Button variant="outline" size="sm" onClick={handleAddContact}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Contact
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredContacts.map((contact) => (
                  <TableRow 
                    key={contact.id} 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => setSelectedContact(selectedContact?.id === contact.id ? null : contact)}
                  >
                    <TableCell>
                      <div className="font-medium">
                        {contact.firstName} {contact.lastName}
                      </div>
                      {contact.position && (
                        <div className="text-sm text-muted-foreground">
                          {contact.position}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{contact.email}</TableCell>
                    <TableCell>{contact.company || "—"}</TableCell>
                    <TableCell>
                      {renderStatusBadge(contact.status)}
                    </TableCell>
                    <TableCell>
                      {contact.lastContacted ? formatDate(contact.lastContacted) : "—"}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <ChevronDown className={`h-4 w-4 transition-transform ${selectedContact?.id === contact.id ? "transform rotate-180" : ""}`} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        
        {selectedContact && (
          <div className="border-t p-4 animate-fade-in">
            <Tabs defaultValue="history">
              <TabsList className="mb-4">
                <TabsTrigger value="history" className="flex items-center">
                  <Clock className="mr-2 h-4 w-4" />
                  Email History
                </TabsTrigger>
                <TabsTrigger value="details" className="flex items-center">
                  <UserRound className="mr-2 h-4 w-4" />
                  Contact Details
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="history">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Email History for {selectedContact.firstName} {selectedContact.lastName}</h3>
                  
                  {selectedContact.history.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Mail className="h-8 w-8 mx-auto mb-2" />
                      <p>No email history found.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {selectedContact.history.map((entry: EmailHistory) => (
                        <Card key={entry.id} className="overflow-hidden">
                          <div className="h-1 bg-gradient-to-r from-brand-purple to-brand-blue" />
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h4 className="font-medium">{entry.subject}</h4>
                                <p className="text-sm text-muted-foreground">
                                  Campaign: {entry.campaignName}
                                </p>
                              </div>
                              {renderEmailStatus(entry.status)}
                            </div>
                            
                            <div className="text-sm text-muted-foreground mb-2">
                              {formatDate(entry.date)}
                            </div>
                            
                            {entry.reply && (
                              <div className="mt-2 p-3 bg-muted rounded-md text-sm">
                                <p className="font-medium mb-1">Reply:</p>
                                <p>{entry.reply}</p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="details">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Contact Details</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">First Name</p>
                      <p className="font-medium">{selectedContact.firstName || "—"}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Last Name</p>
                      <p className="font-medium">{selectedContact.lastName || "—"}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Email</p>
                      <p className="font-medium">{selectedContact.email}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Status</p>
                      <div>{renderStatusBadge(selectedContact.status)}</div>
                    </div>
                    
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Company</p>
                      <p className="font-medium">{selectedContact.company || "—"}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Position</p>
                      <p className="font-medium">{selectedContact.position || "—"}</p>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <p className="text-sm text-muted-foreground mb-1">Tags</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedContact.tags ? (
                        selectedContact.tags.map(tag => (
                          <Badge key={tag} variant="secondary">{tag}</Badge>
                        ))
                      ) : (
                        <span className="text-muted-foreground">No tags</span>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
};

export default Contacts;
