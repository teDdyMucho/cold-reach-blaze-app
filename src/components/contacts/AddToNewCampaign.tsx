import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Contact, ContactGroup } from "@/types";
import { createContactList, getContactGroups, getContactsByGroup } from "@/lib/firebaseService";
import { Badge } from "@/components/ui/badge";
import { Users, Users2, Plus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";

interface CreateContactListProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedContacts: Contact[];
}

const CreateContactList = ({ open, onOpenChange, selectedContacts }: CreateContactListProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [listName, setListName] = useState("");
  const [contactGroups, setContactGroups] = useState<ContactGroup[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [contactSource, setContactSource] = useState<"selection" | "group">("selection");
  
  useEffect(() => {
    if (open) {
      fetchContactGroups();
    }
  }, [open]);
  
  const fetchContactGroups = async () => {
    setLoadingGroups(true);
    try {
      const groups = await getContactGroups();
      setContactGroups(groups);
    } catch (error) {
      console.error("Error fetching contact groups:", error);
      toast({
        title: "Error",
        description: "Failed to load contact groups.",
        variant: "destructive",
      });
    } finally {
      setLoadingGroups(false);
    }
  };
  
  const handleCreateList = async () => {
    if (!listName.trim()) {
      toast({
        title: "List Name Required",
        description: "Please enter a name for your contact list.",
        variant: "destructive",
      });
      return;
    }
    
    let contactsToAdd: Contact[] = [];
    
    if (contactSource === "selection") {
      if (selectedContacts.length === 0) {
        toast({
          title: "No Contacts Selected",
          description: "Please select at least one contact to add to the list.",
          variant: "destructive",
        });
        return;
      }
      contactsToAdd = selectedContacts;
    } else if (contactSource === "group") {
      if (!selectedGroupId) {
        toast({
          title: "No Group Selected",
          description: "Please select a contact group.",
          variant: "destructive",
        });
        return;
      }
      
      // Get contacts from the selected group
      try {
        setLoading(true);
        contactsToAdd = await getContactsByGroup(selectedGroupId);
        
        if (contactsToAdd.length === 0) {
          toast({
            title: "Empty Group",
            description: "The selected group has no contacts.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }
      } catch (error) {
        console.error("Error fetching contacts from group:", error);
        toast({
          title: "Error",
          description: "Failed to fetch contacts from the selected group.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }
    }

    // Check if all selected contacts have email addresses
    const contactsWithoutEmail = contactsToAdd.filter(contact => !contact.email);
    if (contactsWithoutEmail.length > 0) {
      toast({
        title: "Missing Email Addresses",
        description: `${contactsWithoutEmail.length} contact(s) don't have email addresses and will be excluded from the list.`,
        variant: "default",
      });
    }
    
    setLoading(true);
    
    try {
      // Extract contact IDs from the contacts to add
      const contactIds = contactsToAdd.map(contact => contact.id);
      console.log("Contact IDs to be added:", contactIds);
      
      // Create the contact list
      console.log("Calling createContactList with name:", listName);
      const listId = await createContactList(listName, contactIds);
      console.log("Contact list created with ID:", listId);
      
      // Calculate how many contacts were actually added (those with valid emails)
      const validContactsCount = contactsToAdd.filter(contact => contact.email).length;
      
      toast({
        title: "Contact List Created",
        description: `Created list "${listName}" with ${validContactsCount} contacts with valid email addresses.`,
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating contact list:", error);
      
      // More detailed error message for document reference errors
      let errorMessage = "Failed to create contact list.";
      if (error instanceof Error) {
        if (error.message.includes("Invalid document reference")) {
          errorMessage = "Database reference error. Please try again or contact support.";
          console.error("Document reference error details:", error.message);
        } else {
          errorMessage = `Error: ${error.message}`;
        }
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Contact List</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="list-name" className="text-sm font-medium">
              List Name
            </label>
            <Input
              id="list-name"
              value={listName}
              onChange={(e) => setListName(e.target.value)}
              placeholder="Enter a name for your contact list"
            />
          </div>
          
          <Tabs defaultValue="selection" onValueChange={(value) => setContactSource(value as "selection" | "group")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="selection" className="flex items-center">
                <Users className="mr-2 h-4 w-4" />
                Selected Contacts
              </TabsTrigger>
              <TabsTrigger value="group" className="flex items-center">
                <Users2 className="mr-2 h-4 w-4" />
                Contact Group
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="selection" className="space-y-4 mt-4">
              <div className="border rounded-md p-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium">Selected Contacts</h3>
                  <Badge variant="secondary">{selectedContacts.length}</Badge>
                </div>
                
                {selectedContacts.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    <Users className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm">No contacts selected</p>
                  </div>
                ) : (
                  <div className="max-h-[200px] overflow-y-auto space-y-2">
                    {selectedContacts.map((contact) => (
                      <div key={contact.id} className="flex items-center justify-between border-b pb-2">
                        <div>
                          <p className="font-medium">
                            {contact.firstName} {contact.lastName}
                          </p>
                          <p className="text-sm text-muted-foreground">{contact.email}</p>
                        </div>
                        {!contact.email && (
                          <Badge variant="destructive" className="text-xs">No Email</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="group" className="space-y-4 mt-4">
              {loadingGroups ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-purple mx-auto mb-2"></div>
                  <p className="text-sm text-muted-foreground">Loading groups...</p>
                </div>
              ) : contactGroups.length === 0 ? (
                <div className="text-center py-4 border rounded-md p-4">
                  <Users2 className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm mb-2">No contact groups found</p>
                  <Button size="sm" variant="outline" onClick={() => onOpenChange(false)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Group
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select a Contact Group</label>
                  <div className="grid grid-cols-1 gap-2 max-h-[250px] overflow-y-auto">
                    {contactGroups.map((group) => (
                      <Card 
                        key={group.id} 
                        className={`cursor-pointer transition-colors ${selectedGroupId === group.id ? 'border-brand-purple bg-muted/50' : ''}`}
                        onClick={() => setSelectedGroupId(group.id)}
                      >
                        <CardContent className="p-3 flex justify-between items-center">
                          <div>
                            <h4 className="font-medium">{group.name}</h4>
                            <p className="text-sm text-muted-foreground">{group.contactCount} contacts</p>
                          </div>
                          {selectedGroupId === group.id && (
                            <Badge className="bg-brand-purple">Selected</Badge>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreateList} disabled={loading}>
            {loading ? "Creating..." : "Create List"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateContactList;
