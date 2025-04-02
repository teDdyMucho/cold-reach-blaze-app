
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bell, Search, User } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useToast } from "@/components/ui/use-toast";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const Header = () => {
  const { toast } = useToast();
  
  return (
    <header className="border-b p-4 flex items-center justify-between">
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

        <Avatar className="h-9 w-9 cursor-pointer">
          <AvatarFallback className="bg-primary/10 text-primary text-sm">JD</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
};

export default Header;
