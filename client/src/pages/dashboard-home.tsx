import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Plus, Terminal, TrendingUp, Calendar, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SearchBar from "@/components/search-bar";
import CreateLogModal from "@/components/create-log-modal";
import type { PromptLog } from "@shared/schema";

interface DashboardHomeProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function DashboardHome({ searchQuery, onSearchChange }: DashboardHomeProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [, setLocation] = useLocation();

  // Fetch recent logs
  const { data: recentLogs = [], isLoading: isLoadingRecent } = useQuery<PromptLog[]>({
    queryKey: ["/api/logs/recent", 5],
  });

  // Get stats for dashboard overview
  const { data: allLogs = [] } = useQuery<PromptLog[]>({
    queryKey: ["/api/logs"],
  });

  const stats = {
    totalLogs: allLogs.length,
    thisMonth: allLogs.filter(log => {
      const logDate = new Date(log.createdAt);
      const now = new Date();
      return logDate.getMonth() === now.getMonth() && logDate.getFullYear() === now.getFullYear();
    }).length,
    uniqueAuthors: new Set(allLogs.map(log => log.authorEmail)).size,
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-600">Overview of your AI prompt logs and activity</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="bg-primary hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" />
          New Log
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Logs</CardTitle>
            <Terminal className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLogs}</div>
            <p className="text-xs text-muted-foreground">All time logs created</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.thisMonth}</div>
            <p className="text-xs text-muted-foreground">New logs this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Authors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.uniqueAuthors}</div>
            <p className="text-xs text-muted-foreground">Unique contributors</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Search */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Search</CardTitle>
        </CardHeader>
        <CardContent>
          <SearchBar searchQuery={searchQuery} onSearchChange={onSearchChange} />
        </CardContent>
      </Card>

      {/* Recent Logs */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Logs</CardTitle>
          <Button 
            variant="link" 
            className="text-primary hover:text-primary/80 p-0"
            onClick={() => setLocation("/all-logs")}
          >
            View all logs
          </Button>
        </CardHeader>
        <CardContent>
          {isLoadingRecent ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse border rounded-lg p-4">
                  <div className="h-4 bg-slate-200 rounded w-1/4 mb-2"></div>
                  <div className="h-3 bg-slate-200 rounded w-3/4 mb-4"></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-3 bg-slate-200 rounded"></div>
                    <div className="h-3 bg-slate-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : recentLogs.length > 0 ? (
            <div className="space-y-4">
              {recentLogs.map((log) => (
                <div key={log.id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-slate-900">{log.id}</h4>
                    <span className="text-xs text-slate-500">
                      {new Date(log.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mb-2 line-clamp-2">
                    {log.content.substring(0, 150)}...
                  </p>
                  <div className="flex justify-between items-center text-xs text-slate-500">
                    <span>{log.authorEmail}</span>
                    <span>{log.orchestrator} • {log.llm}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Terminal className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No logs yet</h3>
              <p className="text-slate-500 mb-4">Create your first prompt log to get started</p>
              <Button onClick={() => setIsModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create New Log
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recommendations Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="mr-2 h-5 w-5" />
            Logs That Might Interest You
          </CardTitle>
        </CardHeader>
        <CardContent>
          {allLogs.length > 0 ? (
            <div className="space-y-4">
              {allLogs
                .filter(log => log.tags && log.tags.length > 0)
                .slice(0, 3)
                .map((log) => (
                  <div key={log.id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-slate-900">{log.id}</h4>
                      <div className="flex flex-wrap gap-1">
                        {log.tags?.slice(0, 2).map((tag, index) => (
                          <span key={index} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 mb-2">
                      {log.content.substring(0, 100)}...
                    </p>
                    <div className="text-xs text-slate-500">
                      {log.orchestrator} • {log.authorEmail}
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-slate-500 text-center py-4">
              Create some logs with tags to see personalized recommendations
            </p>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Modal */}
      <CreateLogModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingLog={null}
      />
    </div>
  );
}