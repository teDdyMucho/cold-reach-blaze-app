
import React from "react";
import AppSidebar from "./AppSidebar";
import Header from "./Header";

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <div className="flex min-h-screen w-full bg-background">
      <AppSidebar />
      <div className="flex-1 flex flex-col min-h-screen">
        <Header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur" />
        <main className="flex-1 w-full overflow-y-auto">
          <div className="h-full w-full px-4">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
