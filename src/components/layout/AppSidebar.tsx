
import { Link, useLocation } from "react-router-dom";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton
} from "@/components/ui/sidebar";
import { LayoutDashboard, Mail, Users, Settings, PenTool, Laptop } from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    path: "/"
  },
  {
    title: "Templates",
    icon: PenTool,
    path: "/templates"
  },
  {
    title: "Campaigns",
    icon: Mail,
    path: "/campaigns"
  },
  {
    title: "Contacts",
    icon: Users,
    path: "/contacts"
  },
  {
    title: "Integrations",
    icon: Laptop,
    path: "/integrations"
  },
  {
    title: "Settings",
    icon: Settings,
    path: "/settings"
  }
];

const AppSidebar = () => {
  const location = useLocation();
  
  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-gradient-to-r from-brand-purple to-brand-blue flex items-center justify-center text-white font-bold">
            CE
          </div>
          <span className="font-bold text-lg">ColdEmail</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive = 
                  location.pathname === item.path || 
                  (item.path !== "/" && location.pathname.startsWith(item.path));
                  
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild className={cn(
                      isActive && "bg-accent text-accent-foreground font-medium"
                    )}>
                      <Link to={item.path} className="flex items-center gap-3">
                        <item.icon className="h-5 w-5" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
            <span className="text-xs font-medium">JD</span>
          </div>
          <div className="text-sm">
            <p className="font-medium">John Doe</p>
            <p className="text-muted-foreground text-xs">john@example.com</p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
