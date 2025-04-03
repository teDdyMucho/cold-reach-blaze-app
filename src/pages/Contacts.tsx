
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Contact, EmailHistory } from "@/types";
import { getUserContacts, deleteContact } from "@/lib/firebaseService";
import { Plus, Search, Users, UserRound, Mail, Clock, Tag, ChevronDown, Upload, Download, Trash2 } from "lucide-react";
import ContactForm from "@/components/contacts/ContactForm";
import ImportContactsDialog from "@/components/contacts/ImportContactsDialog";
import ContactsExport from "@/components/contacts/ContactsExport";
import AddToNewCampaign from "@/components/contacts/AddToNewCampaign";

const Contacts = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [contactFormOpen, setContactFormOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>([]);
  const [bulkActionMenuOpen, setBulkActionMenuOpen] = useState(false);
  const [campaignDialogOpen, setCampaignDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | undefined>(undefined);
  
  useEffect(() => {
    fetchContacts();
  }, []);
  
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
  }, [searchTerm, statusFilter, contacts]);
  
  const fetchContacts = async () => {
    setLoadingContacts(true);
    try {
      const fetchedContacts = await getUserContacts();
      setContacts(fetchedContacts);
    } catch (error) {
      console.error("Error fetching contacts:", error);
      toast({
        title: "Error Loading Contacts",
        description: "There was a problem loading your contacts.",
        variant: "destructive",
      });
    } finally {
      setLoadingContacts(false);
    }
  };
  
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
  
  // Toggle contact selection for bulk actions
  const toggleContactSelection = (contactId: string) => {
    setSelectedContactIds(prev => {
      if (prev.includes(contactId)) {
        return prev.filter(id => id !== contactId);
      } else {
        return [...prev, contactId];
      }
    });
  };
  
  // Toggle selection for all contacts
  const toggleSelectAll = () => {
    if (selectedContactIds.length === filteredContacts.length) {
      setSelectedContactIds([]);
    } else {
      setSelectedContactIds(filteredContacts.map(contact => contact.id));
    }
  };
  
  // Handle bulk delete action
  const handleBulkDelete = async () => {
    if (window.confirm(`Delete ${selectedContactIds.length} contacts? This action cannot be undone.`)) {
      try {
        for (const id of selectedContactIds) {
          await deleteContact(id);
        }
        
        toast({
          title: "Contacts Deleted",
          description: `${selectedContactIds.length} contacts have been deleted.`,
        });
        
        // Refresh contacts and reset selection
        fetchContacts();
        setSelectedContactIds([]);
      } catch (error) {
        console.error("Error deleting contacts:", error);
        toast({
          title: "Error",
          description: "Failed to delete contacts.",
          variant: "destructive",
        });
      }
    }
  };
  
  // Get selected contacts
  const getSelectedContacts = (): Contact[] => {
    return contacts.filter(contact => selectedContactIds.includes(contact.id));
  };
  
  // Handle adding a new contact
  const handleAddContact = () => {
    setEditingContact(undefined);
    setContactFormOpen(true);
  };
  
  // Handle editing a contact
  const handleEditContact = (contact: Contact) => {
    setEditingContact(contact);
    setContactFormOpen(true);
  };
  
  // Handle saving a contact
  const handleSaveContact = (contact: Contact) => {
    fetchContacts();
    setContactFormOpen(false);
  };
  
  // Handle deleting a contact
  const handleDeleteContact = async (contactId: string) => {
    if (window.confirm("Are you sure you want to delete this contact? This action cannot be undone.")) {
      try {
        await deleteContact(contactId);
        
        toast({
          title: "Contact Deleted",
          description: "The contact has been successfully deleted.",
        });
        
        fetchContacts();
        
        // If the deleted contact was selected, deselect it
        if (selectedContact?.id === contactId) {
          setSelectedContact(null);
        }
      } catch (error) {
        console.error("Error deleting contact:", error);
        toast({
          title: "Error",
          description: "Failed to delete the contact.",
          variant: "destructive",
        });
      }
    }
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
            <Button variant="outline" className="rounded-r-none border-r-0" onClick={() => setImportDialogOpen(true)}>
              <Upload className="mr-2 h-4 w-4" />
              Import
            </Button>
            <ContactsExport contacts={filteredContacts} />
          </div>
          
          <Button onClick={handleAddContact} className="bg-brand-purple hover:bg-brand-purple/90">
            <Plus className="mr-2 h-4 w-4" />
            Add Contact
          </Button>
        </div>
      </div>
      
      {/* Bulk Actions */}
      {selectedContactIds.length > 0 && (
        <div className="bg-muted p-2 rounded-md flex items-center justify-between">
          <span className="text-sm font-medium ml-2">
            {selectedContactIds.length} contact{selectedContactIds.length !== 1 ? 's' : ''} selected
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCampaignDialogOpen(true)}
            >
              Create Campaign
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkDelete}
            >
              <Trash2 className="mr-1 h-4 w-4" /> Delete
            </Button>
          </div>
        </div>
      )}
      
      {/* Contact List and Details */}
      <div className="border rounded-lg">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px]">
                  <Checkbox
                    checked={filteredContacts.length > 0 && selectedContactIds.length === filteredContacts.length}
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Contacted</TableHead>
                <TableHead className="w-[40px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingContacts ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-purple mb-2"></div>
                      <p className="text-muted-foreground">Loading contacts...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredContacts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center">
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
                    className={`hover:bg-muted/50 ${selectedContact?.id === contact.id ? 'bg-muted/50' : ''}`}
                  >
                    <TableCell>
                      <Checkbox
                        checked={selectedContactIds.includes(contact.id)}
                        onCheckedChange={() => toggleContactSelection(contact.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </TableCell>
                    <TableCell
                      className="cursor-pointer"
                      onClick={() => setSelectedContact(selectedContact?.id === contact.id ? null : contact)}
                    >
                      <div className="font-medium">
                        {contact.firstName} {contact.lastName}
                      </div>
                      {contact.position && (
                        <div className="text-sm text-muted-foreground">
                          {contact.position}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="cursor-pointer" onClick={() => setSelectedContact(selectedContact?.id === contact.id ? null : contact)}>
                      {contact.email}
                    </TableCell>
                    <TableCell className="cursor-pointer" onClick={() => setSelectedContact(selectedContact?.id === contact.id ? null : contact)}>
                      {contact.company || "—"}
                    </TableCell>
                    <TableCell className="cursor-pointer" onClick={() => setSelectedContact(selectedContact?.id === contact.id ? null : contact)}>
                      {renderStatusBadge(contact.status)}
                    </TableCell>
                    <TableCell className="cursor-pointer" onClick={() => setSelectedContact(selectedContact?.id === contact.id ? null : contact)}>
                      {contact.lastContacted ? formatDate(contact.lastContacted) : "—"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0"
                          onClick={() => setSelectedContact(selectedContact?.id === contact.id ? null : contact)}
                        >
                          <ChevronDown className={`h-4 w-4 transition-transform ${selectedContact?.id === contact.id ? "transform rotate-180" : ""}`} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        
        {selectedContact && (
          <div className="border-t p-4 animate-fade-in">
            <div className="flex justify-between items-center mb-4">
              <Tabs defaultValue="history">
                <TabsList>
                  <TabsTrigger value="history" className="flex items-center">
                    <Clock className="mr-2 h-4 w-4" />
                    Email History
                  </TabsTrigger>
                  <TabsTrigger value="details" className="flex items-center">
                    <UserRound className="mr-2 h-4 w-4" />
                    Contact Details
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleEditContact(selectedContact)}
                >
                  Edit
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-red-500 hover:text-red-600"
                  onClick={() => handleDeleteContact(selectedContact.id)}
                >
                  Delete
                </Button>
              </div>
            </div>
            
            <TabsContent value="history">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Email History for {selectedContact.firstName} {selectedContact.lastName}</h3>
                
                {!selectedContact.history || selectedContact.history.length === 0 ? (
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
                    {selectedContact.tags && selectedContact.tags.length > 0 ? (
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
          </div>
        )}
      </div>
      
      {/* Add/Edit Contact Dialog */}
      <Dialog open={contactFormOpen} onOpenChange={setContactFormOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingContact ? "Edit Contact" : "Add New Contact"}</DialogTitle>
          </DialogHeader>
          <ContactForm
            onSubmit={handleSaveContact}
            onCancel={() => setContactFormOpen(false)}
            existingContact={editingContact}
          />
        </DialogContent>
      </Dialog>
      
      {/* Import Contacts Dialog */}
      <ImportContactsDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        onSuccess={fetchContacts}
      />
      
      {/* Add to Campaign Dialog */}
      <AddToNewCampaign
        open={campaignDialogOpen}
        onOpenChange={setCampaignDialogOpen}
        selectedContacts={getSelectedContacts()}
      />
    </div>
  );
};

export default Contacts;
