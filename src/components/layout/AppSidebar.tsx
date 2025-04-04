import { Link, useLocation, useNavigate } from "react-router-dom";
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
import { LayoutDashboard, Mail, Users, Settings, PenTool, Laptop, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { logoutUser } from "@/lib/firebaseService";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";

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
  const navigate = useNavigate();
  const { authState } = useAuth();
  const { toast } = useToast();
  
  const handleLogout = async () => {
    try {
      await logoutUser();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive"
      });
    }
  };
  
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
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
              <span className="text-xs font-medium">
                {authState.user?.displayName ? authState.user.displayName.substring(0, 2).toUpperCase() : 'U'}
              </span>
            </div>
            <div className="text-sm">
              <p className="font-medium">{authState.user?.displayName || "User"}</p>
              <p className="text-muted-foreground text-xs">{authState.user?.email || ""}</p>
            </div>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-100/50 -ml-2 pl-2"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Logout</span>
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
