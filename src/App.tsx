
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "./components/ui/sidebar";
import Dashboard from "./pages/Dashboard";
import Templates from "./pages/Templates";
import Campaigns from "./pages/Campaigns";
import Contacts from "./pages/Contacts";
import Integrations from "./pages/Integrations";
import TemplateEditor from "./pages/TemplateEditor";
import NotFound from "./pages/NotFound";
import AppLayout from "./components/layout/AppLayout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <SidebarProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<AppLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="templates" element={<Templates />} />
              <Route path="templates/editor/:id?" element={<TemplateEditor />} />
              <Route path="campaigns" element={<Campaigns />} />
              <Route path="contacts" element={<Contacts />} />
              <Route path="integrations" element={<Integrations />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </SidebarProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
