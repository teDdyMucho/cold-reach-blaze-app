
import React from "react";
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
import { Contact } from "@/types";
import { saveContact } from "@/lib/firebaseService";
import { useToast } from "@/hooks/use-toast";

const contactFormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  company: z.string().optional(),
  position: z.string().optional(),
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
  
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      email: existingContact?.email || "",
      firstName: existingContact?.firstName || "",
      lastName: existingContact?.lastName || "",
      company: existingContact?.company || "",
      position: existingContact?.position || "",
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
      const newContact: Contact = {
        id: existingContact?.id || "",
        email: values.email,
        firstName: values.firstName || "",
        lastName: values.lastName || "",
        company: values.company || "",
        position: values.position || "",
        tags: tags,
        status: existingContact?.status || "active",
        history: existingContact?.history || [],
      };
      
      const contactId = await saveContact(newContact);
      
      if (!existingContact) {
        newContact.id = contactId;
      }
      
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
