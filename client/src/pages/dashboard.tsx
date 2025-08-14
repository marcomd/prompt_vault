import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Terminal, Search, List, Settings, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import CreateLogModal from "@/components/create-log-modal";
import LogCard from "@/components/log-card";
import SearchBar from "@/components/search-bar";
import type { PromptLog } from "@shared/schema";

export default function Dashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingLog, setEditingLog] = useState<PromptLog | null>(null);

  // Fetch recent logs
  const { data: recentLogs = [], isLoading: isLoadingRecent } = useQuery({
    queryKey: ["/api/logs/recent"],
    enabled: !searchQuery,
  });

  // Search logs
  const { data: searchResults = [], isLoading: isSearching } = useQuery({
    queryKey: ["/api/logs/search", searchQuery],
    enabled: !!searchQuery,
  });

  const handleOpenCreateModal = () => {
    setEditingLog(null);
    setIsModalOpen(true);
  };

  const handleEditLog = (log: PromptLog) => {
    setEditingLog(log);
    setIsModalOpen(true);
  };

  const isLoading = isLoadingRecent || isSearching;

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
            <li>
              <Button
                variant="ghost"
                className="w-full justify-start text-primary bg-primary/10"
              >
                <Search className="mr-3 h-4 w-4" />
                Search Logs
              </Button>
            </li>
            <li>
              <Button
                variant="ghost"
                className="w-full justify-start text-slate-600 hover:text-slate-900"
              >
                <List className="mr-3 h-4 w-4" />
                All Logs
              </Button>
            </li>
            <li>
              <Button
                variant="ghost"
                className="w-full justify-start text-slate-600 hover:text-slate-900"
              >
                <Settings className="mr-3 h-4 w-4" />
                Settings
              </Button>
            </li>
          </ul>
        </nav>
        
        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center text-sm text-slate-500">
            <UserCircle className="mr-2 h-4 w-4" />
            <span>developer@company.com</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-slate-200 px-6 py-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-slate-900">Prompt Log Management</h2>
            <Button onClick={handleOpenCreateModal} className="bg-primary hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              New Log
            </Button>
          </div>
        </header>

        {/* Search Section */}
        <div className="p-6 bg-white border-b border-slate-200">
          <SearchBar searchQuery={searchQuery} onSearchChange={setSearchQuery} />
        </div>

        {/* Results/Content Area */}
        <div className="flex-1 p-6 overflow-auto">
          {searchQuery ? (
            // Search Results
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                Search Results
                {searchResults.length > 0 && (
                  <span className="text-sm text-slate-500 font-normal ml-2">
                    ({searchResults.length} found)
                  </span>
                )}
              </h3>
              
              {isSearching ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-6">
                        <div className="h-4 bg-slate-200 rounded w-1/4 mb-2"></div>
                        <div className="h-3 bg-slate-200 rounded w-3/4 mb-4"></div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="h-3 bg-slate-200 rounded"></div>
                          <div className="h-3 bg-slate-200 rounded"></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : searchResults.length > 0 ? (
                <div className="space-y-4">
                  {searchResults.map((log) => (
                    <LogCard
                      key={log.id}
                      log={log}
                      onEdit={handleEditLog}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="mx-auto w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <Search className="h-8 w-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-900 mb-2">No logs found</h3>
                  <p className="text-slate-500 mb-6">Try searching with a different ID or create a new log entry</p>
                  <Button onClick={handleOpenCreateModal}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create New Log
                  </Button>
                </div>
              )}
            </div>
          ) : (
            // Recent Logs
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-slate-900">Recent Logs</h3>
                <Button variant="link" className="text-primary hover:text-primary/80 p-0">
                  View all logs
                </Button>
              </div>
              
              {isLoadingRecent ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {[1, 2, 3, 4].map((i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-5">
                        <div className="h-4 bg-slate-200 rounded w-1/3 mb-3"></div>
                        <div className="h-3 bg-slate-200 rounded w-full mb-3"></div>
                        <div className="flex justify-between">
                          <div className="h-3 bg-slate-200 rounded w-1/4"></div>
                          <div className="h-3 bg-slate-200 rounded w-1/4"></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : recentLogs.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {recentLogs.map((log) => (
                    <Card key={log.id} className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-5">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-medium text-slate-900">{log.id}</h4>
                          <span className="text-xs text-slate-500">
                            {new Date(log.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                          {log.content.substring(0, 100)}...
                        </p>
                        <div className="flex justify-between items-center text-xs text-slate-500">
                          <span>{log.orchestrator}</span>
                          <span>{log.llm}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="mx-auto w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <Terminal className="h-8 w-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-900 mb-2">No logs yet</h3>
                  <p className="text-slate-500 mb-6">Create your first prompt log to get started</p>
                  <Button onClick={handleOpenCreateModal}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create New Log
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      <CreateLogModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingLog={editingLog}
      />
    </div>
  );
}
