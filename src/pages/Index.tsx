
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto py-10 space-y-10">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Welcome to ColdEmail</h1>
        <p className="text-xl text-muted-foreground">
          Create, manage, and track your email campaigns with ease
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Email Templates</CardTitle>
            <CardDescription>Create beautiful email templates</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Design professional email templates with our drag and drop editor. Add images, text, buttons, and more.</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => navigate("/templates")} className="w-full">Get Started</Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Campaigns</CardTitle>
            <CardDescription>Launch email campaigns</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Send targeted email campaigns to your contacts. Schedule and track your campaigns in real-time.</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => navigate("/campaigns")} className="w-full">Get Started</Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contacts</CardTitle>
            <CardDescription>Manage your email contacts</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Import, organize, and segment your contacts. Create custom lists for targeted campaigns.</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => navigate("/contacts")} className="w-full">Get Started</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Index;
