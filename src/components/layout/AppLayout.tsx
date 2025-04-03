import { Outlet } from "react-router-dom";
import AppSidebar from "./AppSidebar";
import Header from "./Header";

const AppLayout = () => {
  return (
    <div className="flex min-h-screen w-full bg-background">
      <AppSidebar />
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <Header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur" />
        <main className="flex-1 overflow-auto w-full">
          <div className="h-full w-full px-4">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
