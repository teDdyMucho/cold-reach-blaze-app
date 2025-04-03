
import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SidebarProvider } from "@/components/ui/sidebar";
import AppLayout from "@/components/layout/AppLayout";
import Index from "@/pages/Index";
import Dashboard from "@/pages/Dashboard";
import Templates from "@/pages/Templates";
import TemplateEditorNew from "@/pages/TemplateEditorNew";
import Campaigns from "@/pages/Campaigns";
import CampaignNew from "@/pages/CampaignNew";
import Contacts from "@/pages/Contacts";
import Integrations from "@/pages/Integrations";
import Landing from "@/pages/Landing";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from '@/hooks/use-toast';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import NotFound from "@/pages/NotFound";
import "./App.css";

// Create a client
const queryClient = new QueryClient();

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { authState } = useAuth();
  
  if (authState.loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  if (!authState.user) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

// App content with auth context
function AppContent() {
  const { authState } = useAuth();
  const { toast } = useToast();
  
  useEffect(() => {
    if (authState.error) {
      toast({
        title: "Authentication Error",
        description: authState.error,
        variant: "destructive"
      });
    }
  }, [authState.error, toast]);
  
  return (
    <QueryClientProvider client={queryClient}>
      <SidebarProvider className="flex min-h-svh w-full" style={{ margin: 0, padding: 0 }}>
        <Routes>
          <Route path="/" element={<ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>} />
          <Route path="/index" element={<Index />} />
          <Route path="/templates" element={<ProtectedRoute><AppLayout><Templates /></AppLayout></ProtectedRoute>} />
          <Route path="/template-editor/:id?" element={<ProtectedRoute><AppLayout><TemplateEditorNew /></AppLayout></ProtectedRoute>} />
          <Route path="/campaigns" element={<ProtectedRoute><AppLayout><Campaigns /></AppLayout></ProtectedRoute>} />
          <Route path="/campaign-new" element={<ProtectedRoute><AppLayout><CampaignNew /></AppLayout></ProtectedRoute>} />
          <Route path="/contacts" element={<ProtectedRoute><AppLayout><Contacts /></AppLayout></ProtectedRoute>} />
          <Route path="/integrations" element={<ProtectedRoute><AppLayout><Integrations /></AppLayout></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </SidebarProvider>
    </QueryClientProvider>
  );
}

// Main App component that provides auth context
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
