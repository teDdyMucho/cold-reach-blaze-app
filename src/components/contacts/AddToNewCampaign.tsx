import React, { useState } from "react";
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
import { Contact } from "@/types";
import { createContactList } from "@/lib/firebaseService";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";

interface CreateContactListProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedContacts: Contact[];
}

const CreateContactList = ({ open, onOpenChange, selectedContacts }: CreateContactListProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [listName, setListName] = useState("");
  
  const handleCreateList = async () => {
    if (!listName.trim()) {
      toast({
        title: "List Name Required",
        description: "Please enter a name for your contact list.",
        variant: "destructive",
      });
      return;
    }
    
    if (selectedContacts.length === 0) {
      toast({
        title: "No Contacts Selected",
        description: "Please select at least one contact to add to the list.",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      // Extract contact IDs from the selected contacts
      const contactIds = selectedContacts.map(contact => contact.id);
      
      // Create the contact list
      const listId = await createContactList(listName, contactIds);
      
      toast({
        title: "Contact List Created",
        description: `Created list "${listName}" with ${selectedContacts.length} contacts.`,
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating contact list:", error);
      toast({
        title: "Error",
        description: "Failed to create contact list.",
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
              placeholder="Enter list name"
              value={listName}
              onChange={(e) => setListName(e.target.value)}
            />
          </div>
          
          <div className="bg-muted p-3 rounded-md">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-medium">Selected Contacts</p>
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              {selectedContacts.length} contact{selectedContacts.length !== 1 ? "s" : ""} selected
            </p>
            
            {selectedContacts.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {selectedContacts.slice(0, 5).map(contact => (
                  <Badge key={contact.id} variant="secondary" className="text-xs">
                    {contact.firstName || contact.email}
                  </Badge>
                ))}
                {selectedContacts.length > 5 && (
                  <Badge variant="outline" className="text-xs">
                    +{selectedContacts.length - 5} more
                  </Badge>
                )}
              </div>
            )}
          </div>
          
          <div className="text-sm text-muted-foreground">
            <p>This contact list will be available when creating new campaigns.</p>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleCreateList}
            disabled={!listName.trim() || selectedContacts.length === 0 || loading}
            className="bg-brand-purple hover:bg-brand-purple/90"
          >
            {loading ? "Creating..." : "Create Contact List"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateContactList;
