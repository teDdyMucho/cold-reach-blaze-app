import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bell, Search, User, LogOut, Settings, UserCircle } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useToast } from "@/components/ui/use-toast";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { logoutUser } from "@/lib/firebaseService";
import { useAuth } from "@/contexts/AuthContext";

interface HeaderProps {
  className?: string;
}

const Header = ({ className }: HeaderProps) => {
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const [showNewEditor, setShowNewEditor] = useState(false);
  const { authState } = useAuth();
  
  useEffect(() => {
    const isTemplateEditor = location.pathname.includes("/templates/editor");
    setShowNewEditor(isTemplateEditor);
  }, [location]);
  
  const handleToggleEditor = () => {
    if (showNewEditor) {
      toast({
        title: "Using Original Editor",
        description: "Switched back to the original template editor",
      });
      setShowNewEditor(false);
    } else {
      const currentPath = location.pathname;
      
      if (currentPath.includes("/templates/editor")) {
        navigate(currentPath);
        toast({
          title: "Using Enhanced Editor",
          description: "Now using the enhanced template editor with animation support",
        });
        setShowNewEditor(true);
      }
    }
  };
  
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
    <header className={[className, "border-b p-4 flex items-center justify-between"].join(" ")}>
      <div className="flex items-center gap-2">
        <SidebarTrigger className="h-5 w-5 text-muted-foreground mr-2" />
        <div className="relative max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            type="search" 
            placeholder="Search..." 
            className="pl-9 w-[300px] bg-muted/50" 
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        {location.pathname.includes("/templates/editor") && (
          <Button 
            variant="outline" 
            size="sm"
            className="bg-gradient-to-r from-brand-purple to-brand-blue text-white hover:opacity-90 border-0"
            onClick={handleToggleEditor}
          >
            {showNewEditor ? "Original Editor" : "Enhanced Editor"}
          </Button>
        )}
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => {
            toast({
              title: "Pro Tip!",
              description: "You can create email templates from scratch or use our templates gallery",
            });
          }}
        >
          Upgrade to Pro
        </Button>
        
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => {
            toast({
              title: "No new notifications",
              description: "You're all caught up!",
            });
          }}
        >
          <Bell className="h-5 w-5" />
          <span className="sr-only">Notifications</span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="h-9 w-9 cursor-pointer">
              <AvatarFallback className="bg-primary/10 text-primary text-sm">
                {authState.user?.displayName ? authState.user.displayName.substring(0, 2).toUpperCase() : 'U'}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer">
              <UserCircle className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer text-red-600" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;
