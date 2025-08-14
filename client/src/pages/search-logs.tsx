import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import SearchBar from "@/components/search-bar";
import LogCard from "@/components/log-card";
import CreateLogModal from "@/components/create-log-modal";
import type { PromptLog } from "@shared/schema";

interface SearchLogsProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function SearchLogs({ searchQuery, onSearchChange }: SearchLogsProps) {
  const [editingLog, setEditingLog] = useState<PromptLog | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Search logs
  const { data: searchResults = [], isLoading: isSearching } = useQuery<PromptLog[]>({
    queryKey: ["/api/logs/search", searchQuery],
    enabled: !!searchQuery,
  });

  const handleEditLog = (log: PromptLog) => {
    setEditingLog(log);
    setIsModalOpen(true);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Search Logs</h1>
        <p className="text-slate-600">Search through your prompt logs by ID or content</p>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="pt-6">
          <SearchBar searchQuery={searchQuery} onSearchChange={onSearchChange} />
        </CardContent>
      </Card>

      {/* Search Results */}
      <div>
        {searchQuery ? (
          <div>
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
                <p className="text-slate-500">Try searching with a different term</p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <Search className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">Start searching</h3>
            <p className="text-slate-500">Enter a search term above to find your logs</p>
          </div>
        )}
      </div>

      {/* Edit Modal */}
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