import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Mail, Users, MousePointer, MessageSquare, Send, CheckCircle } from "lucide-react";
import { performanceData, campaigns } from "@/data/mockData";
import { StatsCard } from "@/types";

const Dashboard = () => {
  const statsCards: StatsCard[] = [
    {
      title: "Total Sent",
      value: campaigns.reduce((acc, campaign) => acc + campaign.recipients, 0),
      change: 12.5,
      icon: Send,
    },
    {
      title: "Open Rate",
      value: "61.8%",
      change: 4.3,
      icon: Mail,
    },
    {
      title: "Click Rate",
      value: "28.4%",
      change: -2.1,
      icon: MousePointer,
    },
    {
      title: "Reply Rate",
      value: "12.3%",
      change: 1.8,
      icon: MessageSquare,
    },
  ];

  useEffect(() => {
    // Animation for stats cards
    const cards = document.querySelectorAll('.stats-card');
    cards.forEach((card, index) => {
      (card as HTMLElement).style.setProperty('--delay', index.toString());
    });
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Your email campaign performance overview.</p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((card, index) => (
          <Card key={card.title} className="stats-card animate-instruction">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <card.icon className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <div className={`text-xs ${card.change && card.change > 0 ? 'text-green-500' : 'text-red-500'} flex items-center`}>
                {card.change && card.change > 0 ? 
                  <CheckCircle className="mr-1 h-3 w-3" /> : 
                  <span className="mr-1">↓</span>
                }
                {card.change}% from last week
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Performance Chart */}
      <Card className="animate-instruction" style={{"--delay": "4"} as React.CSSProperties}>
        <CardHeader>
          <CardTitle>Email Performance</CardTitle>
        </CardHeader>
        <CardContent className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={performanceData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="delivered" stroke="#8884d8" activeDot={{ r: 8 }} />
              <Line type="monotone" dataKey="opened" stroke="#4A7BF7" />
              <Line type="monotone" dataKey="clicked" stroke="#38B2AC" />
              <Line type="monotone" dataKey="replied" stroke="#6C63FF" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      {/* Recent Campaigns */}
      <div className="animate-instruction" style={{"--delay": "5"} as React.CSSProperties}>
        <h2 className="text-xl font-bold mb-4">Recent Campaigns</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {campaigns.slice(0, 3).map((campaign) => (
            <Card key={campaign.id} className="card-hover overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-brand-purple to-brand-blue" />
              <CardHeader>
                <CardTitle>{campaign.name}</CardTitle>
                <span className="text-sm text-muted-foreground">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs ${
                    campaign.status === 'sent' ? 'bg-green-100 text-green-800' : 
                    campaign.status === 'sending' ? 'bg-blue-100 text-blue-800' :
                    campaign.status === 'scheduled' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                  </span>
                </span>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex flex-col">
                    <span className="text-muted-foreground">Recipients</span>
                    <span className="font-medium">{campaign.recipients}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-muted-foreground">Opened</span>
                    <span className="font-medium">
                      {campaign.opened} ({campaign.recipients ? Math.round((campaign.opened / campaign.recipients) * 100) : 0}%)
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-muted-foreground">Clicked</span>
                    <span className="font-medium">
                      {campaign.clicked} ({campaign.recipients ? Math.round((campaign.clicked / campaign.recipients) * 100) : 0}%)
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-muted-foreground">Replied</span>
                    <span className="font-medium">
                      {campaign.replied} ({campaign.recipients ? Math.round((campaign.replied / campaign.recipients) * 100) : 0}%)
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
