
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, Check, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Contact } from "@/types";
import { saveContact } from "@/lib/firebaseService";

interface ImportContactsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const ImportContactsDialog = ({ open, onOpenChange, onSuccess }: ImportContactsDialogProps) => {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [results, setResults] = useState<{
    success: number;
    errors: number;
    total: number;
  } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const parseCSV = (text: string): any[] => {
    const lines = text.split("\n");
    const headers = lines[0].split(",").map(header => header.trim().replace(/"/g, ""));
    
    return lines.slice(1)
      .filter(line => line.trim() !== "")
      .map(line => {
        const values = line.split(",").map(value => value.trim().replace(/"/g, ""));
        const entry: any = {};
        
        headers.forEach((header, index) => {
          entry[header] = values[index] || "";
        });
        
        return entry;
      });
  };

  const importContacts = async () => {
    if (!file) return;
    
    setImporting(true);
    setResults(null);
    
    try {
      const text = await file.text();
      const contacts = parseCSV(text);
      
      let successCount = 0;
      let errorCount = 0;
      
      for (const contactData of contacts) {
        if (!contactData.email) {
          errorCount++;
          continue;
        }
        
        try {
          const contact: Contact = {
            id: "",
            email: contactData.email,
            firstName: contactData.firstName || contactData.first_name || "",
            lastName: contactData.lastName || contactData.last_name || "",
            company: contactData.company || contactData.organization || "",
            position: contactData.position || contactData.title || "",
            status: "active",
            tags: [],
            history: []
          };
          
          await saveContact(contact);
          successCount++;
        } catch (error) {
          console.error("Error importing contact:", error);
          errorCount++;
        }
      }
      
      setResults({
        success: successCount,
        errors: errorCount,
        total: contacts.length
      });
      
      if (successCount > 0) {
        onSuccess();
      }
      
      toast({
        title: "Import Complete",
        description: `Successfully imported ${successCount} contacts. ${errorCount} failed.`,
      });
    } catch (error) {
      console.error("Error importing contacts:", error);
      toast({
        title: "Import Failed",
        description: "There was an error processing your CSV file. Please check the format and try again.",
        variant: "destructive",
      });
    } finally {
      setImporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Import Contacts</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="text-sm text-muted-foreground">
            <p>Upload a CSV file with your contacts.</p>
            <p>The CSV should include columns for: email, firstName, lastName, company, position.</p>
          </div>
          
          {!results ? (
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
                id="csv-upload"
              />
              <div className="space-y-2">
                <div className="flex justify-center">
                  <Upload className="h-10 w-10 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium">
                  {file ? file.name : "Drop your CSV file here or click to browse"}
                </p>
                {file && (
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                )}
              </div>
              <label
                htmlFor="csv-upload"
                className="mt-4 inline-block cursor-pointer text-sm text-brand-purple hover:underline"
              >
                Select a file
              </label>
            </div>
          ) : (
            <div className="bg-muted p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                {results.errors === 0 ? (
                  <Check className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-amber-500" />
                )}
                <h3 className="font-medium">Import Results</h3>
              </div>
              <div className="text-sm space-y-1">
                <p>Total contacts: {results.total}</p>
                <p className="text-green-600">Successfully imported: {results.success}</p>
                {results.errors > 0 && (
                  <p className="text-red-500">Failed to import: {results.errors}</p>
                )}
              </div>
            </div>
          )}
        </div>
        
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {results ? "Close" : "Cancel"}
          </Button>
          {!results && (
            <Button 
              onClick={importContacts} 
              disabled={!file || importing}
              className="bg-brand-purple hover:bg-brand-purple/90"
            >
              {importing ? "Importing..." : "Import Contacts"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImportContactsDialog;
