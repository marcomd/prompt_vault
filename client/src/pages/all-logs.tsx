import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { List, Filter, Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import LogCard from "@/components/log-card";
import CreateLogModal from "@/components/create-log-modal";
import type { PromptLog } from "@shared/schema";

export default function AllLogs() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<PromptLog | null>(null);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterValue, setFilterValue] = useState<string>("");

  // Fetch all logs
  const { data: allLogs = [], isLoading } = useQuery<PromptLog[]>({
    queryKey: ["/api/logs"],
  });

  // Filter logs based on selected criteria
  const filteredLogs = allLogs.filter((log) => {
    if (!filterValue) return true;
    
    const searchTerm = filterValue.toLowerCase();
    switch (filterType) {
      case "id":
        return log.id.toLowerCase().includes(searchTerm);
      case "author":
        return log.authorEmail.toLowerCase().includes(searchTerm);
      case "pr":
        return log.prUrl.toLowerCase().includes(searchTerm);
      case "tags":
        return log.tags?.some(tag => tag.toLowerCase().includes(searchTerm));
      case "all":
      default:
        return (
          log.id.toLowerCase().includes(searchTerm) ||
          log.authorEmail.toLowerCase().includes(searchTerm) ||
          log.prUrl.toLowerCase().includes(searchTerm) ||
          log.orchestrator.toLowerCase().includes(searchTerm) ||
          log.llm.toLowerCase().includes(searchTerm) ||
          log.content.toLowerCase().includes(searchTerm) ||
          (log.tags && log.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
        );
    }
  });

  const handleEditLog = (log: PromptLog) => {
    setEditingLog(log);
    setIsModalOpen(true);
  };

  const handleCreateNew = () => {
    setEditingLog(null);
    setIsModalOpen(true);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">All Logs</h1>
          <p className="text-slate-600">Manage and filter all your prompt logs</p>
        </div>
        <Button onClick={handleCreateNew} className="bg-primary hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" />
          New Log
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-slate-500" />
              <span className="text-sm font-medium text-slate-700">Filter by:</span>
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Fields</SelectItem>
                <SelectItem value="id">ID</SelectItem>
                <SelectItem value="author">Author Email</SelectItem>
                <SelectItem value="pr">PR URL</SelectItem>
                <SelectItem value="tags">Tags</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder={`Search ${filterType === "all" ? "all fields" : filterType}...`}
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-slate-900">
            Logs
            <span className="text-sm text-slate-500 font-normal ml-2">
              ({filteredLogs.length} of {allLogs.length})
            </span>
          </h3>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
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
        ) : filteredLogs.length > 0 ? (
          <div className="space-y-4">
            {filteredLogs.map((log) => (
              <LogCard
                key={log.id}
                log={log}
                onEdit={handleEditLog}
              />
            ))}
          </div>
        ) : allLogs.length > 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <Search className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">No logs match your filter</h3>
            <p className="text-slate-500 mb-4">Try adjusting your search criteria</p>
            <Button variant="outline" onClick={() => setFilterValue("")}>
              Clear filters
            </Button>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <List className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">No logs yet</h3>
            <p className="text-slate-500 mb-6">Create your first prompt log to get started</p>
            <Button onClick={handleCreateNew}>
              <Plus className="mr-2 h-4 w-4" />
              Create New Log
            </Button>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <CreateLogModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingLog(null);
        }}
        editingLog={editingLog}
      />
    </div>
  );
}