import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Edit, Trash2, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ContactGroup } from "@/types";
import { getContactGroups, createContactGroup, updateContactGroup, deleteContactGroup } from "@/lib/firebaseService";

interface ContactGroupsManagerProps {
  onGroupSelect?: (groupId: string) => void;
}

const ContactGroupsManager: React.FC<ContactGroupsManagerProps> = ({ onGroupSelect }) => {
  const { toast } = useToast();
  const [groups, setGroups] = useState<ContactGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<ContactGroup | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  
  useEffect(() => {
    fetchGroups();
  }, []);
  
  const fetchGroups = async () => {
    setLoading(true);
    try {
      const fetchedGroups = await getContactGroups();
      setGroups(fetchedGroups);
    } catch (error) {
      console.error("Error fetching groups:", error);
      toast({
        title: "Error Loading Groups",
        description: "There was a problem loading your contact groups.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleOpenForm = (group?: ContactGroup) => {
    if (group) {
      setEditingGroup(group);
      setName(group.name);
      setDescription(group.description || "");
    } else {
      setEditingGroup(null);
      setName("");
      setDescription("");
    }
    setFormOpen(true);
  };
  
  const handleCloseForm = () => {
    setFormOpen(false);
    setEditingGroup(null);
    setName("");
    setDescription("");
  };
  
  const handleSaveGroup = async () => {
    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Group name is required.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      if (editingGroup) {
        await updateContactGroup(editingGroup.id, {
          name,
          description,
          updatedAt: new Date().toISOString()
        });
        toast({
          title: "Group Updated",
          description: "Contact group has been updated successfully."
        });
      } else {
        await createContactGroup(name, description);
        toast({
          title: "Group Created",
          description: "New contact group has been created successfully."
        });
      }
      
      handleCloseForm();
      fetchGroups();
    } catch (error) {
      console.error("Error saving group:", error);
      toast({
        title: "Error",
        description: `Failed to ${editingGroup ? "update" : "create"} contact group.`,
        variant: "destructive",
      });
    }
  };
  
  const handleDeleteGroup = async (groupId: string) => {
    if (window.confirm("Are you sure you want to delete this group? This will not delete the contacts in the group.")) {
      try {
        await deleteContactGroup(groupId);
        toast({
          title: "Group Deleted",
          description: "Contact group has been deleted successfully."
        });
        fetchGroups();
      } catch (error) {
        console.error("Error deleting group:", error);
        toast({
          title: "Error",
          description: "Failed to delete contact group.",
          variant: "destructive",
        });
      }
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Contact Groups</h2>
        <Button onClick={() => handleOpenForm()} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Group
        </Button>
      </div>
      
      {loading ? (
        <div className="text-center py-8">Loading groups...</div>
      ) : groups.length === 0 ? (
        <Card className="border-dashed border-2 border-muted">
          <CardContent className="p-6 text-center">
            <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No Contact Groups</h3>
            <p className="text-muted-foreground mb-4">
              Create groups to organize your contacts and send targeted campaigns.
            </p>
            <Button onClick={() => handleOpenForm()}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Group
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map((group) => (
            <Card key={group.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{group.name}</CardTitle>
                <CardDescription>{group.contactCount} contacts</CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {group.description || "No description"}
                </p>
              </CardContent>
              <CardFooter className="flex justify-between pt-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onGroupSelect && onGroupSelect(group.id)}
                >
                  Select
                </Button>
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleOpenForm(group)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-red-500 hover:text-red-600"
                    onClick={() => handleDeleteGroup(group.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingGroup ? "Edit Group" : "Create Group"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Group Name <span className="text-red-500">*</span></Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter group name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter group description"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseForm}>Cancel</Button>
            <Button onClick={handleSaveGroup}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContactGroupsManager;
