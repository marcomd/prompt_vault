import { useState } from "react";
import { Route, Switch, useLocation } from "wouter";
import { Terminal, Home, Search, List, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import UserAuth from "@/components/user-auth";
import DashboardHome from "@/pages/dashboard-home";
import SearchLogs from "@/pages/search-logs";
import AllLogs from "@/pages/all-logs";
import SettingsPage from "@/pages/settings";

export default function Dashboard() {
  const [location, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/', component: DashboardHome },
    { id: 'search', label: 'Search', icon: Search, path: '/search', component: SearchLogs },
    { id: 'all-logs', label: 'All Logs', icon: List, path: '/all-logs', component: AllLogs },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/settings', component: SettingsPage },
  ];

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-sm border-r border-slate-200 flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-primary flex items-center">
            <Terminal className="mr-3 h-6 w-6" />
            Iubrompt
          </h1>
          <p className="text-sm text-slate-500 mt-2">AI Prompt Log Manager</p>
        </div>
        
        <nav className="flex-1 px-4 pb-4">
          <ul className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.path;
              
              return (
                <li key={item.id}>
                  <Button
                    variant="ghost"
                    className={`w-full justify-start ${
                      isActive 
                        ? "text-primary bg-primary/10" 
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                    onClick={() => setLocation(item.path)}
                  >
                    <Icon className="mr-3 h-4 w-4" />
                    {item.label}
                  </Button>
                </li>
              );
            })}
          </ul>
        </nav>
        
        <div className="p-4 border-t border-slate-200">
          <UserAuth />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-white">
        <Switch>
          <Route 
            path="/" 
            component={() => (
              <DashboardHome 
                searchQuery={searchQuery} 
                onSearchChange={setSearchQuery} 
              />
            )} 
          />
          <Route 
            path="/search" 
            component={() => (
              <SearchLogs 
                searchQuery={searchQuery} 
                onSearchChange={setSearchQuery} 
              />
            )} 
          />
          <Route path="/all-logs" component={AllLogs} />
          <Route path="/settings" component={SettingsPage} />
        </Switch>
      </div>
    </div>
  );
}
