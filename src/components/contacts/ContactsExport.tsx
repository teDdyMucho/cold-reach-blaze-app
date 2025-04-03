
import React from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { Contact } from "@/types";

interface ContactsExportProps {
  contacts: Contact[];
}

const ContactsExport = ({ contacts }: ContactsExportProps) => {
  const exportToCSV = () => {
    // Define the headers for the CSV file
    const headers = ["email", "firstName", "lastName", "company", "position", "status"];
    
    // Convert contacts to CSV rows
    const csvRows = contacts.map((contact) => {
      return [
        contact.email,
        contact.firstName || "",
        contact.lastName || "",
        contact.company || "",
        contact.position || "",
        contact.status || "",
      ].map(value => `"${value}"`).join(",");
    });
    
    // Combine headers and rows
    const csvContent = [
      headers.join(","),
      ...csvRows
    ].join("\n");
    
    // Create a Blob from the CSV content
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    
    // Create a download link
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    // Set up the download link
    link.setAttribute("href", url);
    link.setAttribute("download", `contacts_export_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    
    // Add to the DOM and click
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    document.body.removeChild(link);
  };
  
  return (
    <Button variant="outline" onClick={exportToCSV}>
      <Download className="mr-2 h-4 w-4" />
      Export CSV
    </Button>
  );
};

export default ContactsExport;
