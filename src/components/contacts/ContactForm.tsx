import React, { useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { Contact, ContactGroup } from "@/types";
import { saveContact, getContactGroups } from "@/lib/firebaseService";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const contactFormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  company: z.string().optional(),
  position: z.string().optional(),
  groupId: z.string().optional(),
});

type ContactFormValues = z.infer<typeof contactFormSchema> & { tags?: string[] };

interface ContactFormProps {
  onSubmit: (contact: Contact) => void;
  onCancel: () => void;
  existingContact?: Contact;
}

const ContactForm = ({ onSubmit, onCancel, existingContact }: ContactFormProps) => {
  const { toast } = useToast();
  const [tags, setTags] = React.useState<string[]>(existingContact?.tags || []);
  const [tagInput, setTagInput] = React.useState<string>("");
  const [contactGroups, setContactGroups] = React.useState<ContactGroup[]>([]);
  const [isLoadingGroups, setIsLoadingGroups] = React.useState(false);
  
  useEffect(() => {
    const fetchContactGroups = async () => {
      setIsLoadingGroups(true);
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
        setIsLoadingGroups(false);
      }
    };
    
    fetchContactGroups();
  }, [toast]);
  
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      email: existingContact?.email || "",
      firstName: existingContact?.firstName || "",
      lastName: existingContact?.lastName || "",
      company: existingContact?.company || "",
      position: existingContact?.position || "",
      groupId: existingContact?.groupId || "",
    },
  });
  
  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };
  
  const handleFormSubmit = async (values: ContactFormValues) => {
    try {
      const contactData: Partial<Contact> = {
        id: existingContact?.id || "",
        email: values.email,
        firstName: values.firstName || "",
        lastName: values.lastName || "",
        company: values.company || "",
        position: values.position || "",
        tags: tags,
        groupId: values.groupId || undefined,
        status: existingContact?.status || "active",
        history: existingContact?.history || [],
        createdAt: existingContact?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      const contactId = await saveContact(contactData);
      
      const newContact: Contact = {
        ...contactData,
        id: existingContact?.id || contactId,
        userId: existingContact?.userId || "",
      } as Contact;
      
      onSubmit(newContact);
      
      toast({
        title: "Success",
        description: `Contact ${existingContact ? "updated" : "created"} successfully.`,
      });
    } catch (error) {
      console.error("Error saving contact:", error);
      toast({
        title: "Error",
        description: `Failed to ${existingContact ? "update" : "create"} contact.`,
        variant: "destructive",
      });
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email address <span className="text-red-500">*</span></FormLabel>
              <FormControl>
                <Input placeholder="name@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input placeholder="John" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input placeholder="Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="company"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company</FormLabel>
                <FormControl>
                  <Input placeholder="Acme Inc." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="position"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Position</FormLabel>
                <FormControl>
                  <Input placeholder="Marketing Manager" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="groupId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contact Group</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
                disabled={isLoadingGroups}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a group" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {contactGroups.map((group) => (
                    <SelectItem key={group.id} value={group.id}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="space-y-2">
          <FormLabel>Tags</FormLabel>
          <Input
            placeholder="Add tags (press Enter)"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleAddTag}
          />
          
          <div className="flex flex-wrap gap-2 mt-2">
            {tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                {tag}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => handleRemoveTag(tag)}
                />
              </Badge>
            ))}
          </div>
        </div>
        
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {existingContact ? "Update" : "Add"} Contact
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ContactForm;
