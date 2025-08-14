import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Eye, Edit, Trash2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { PromptLog } from "@shared/schema";

interface LogCardProps {
  log: PromptLog;
  onEdit: (log: PromptLog) => void;
}

export default function LogCard({ log, onEdit }: LogCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/logs/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/logs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/logs/recent"] });
      queryClient.invalidateQueries({ queryKey: ["/api/logs/search"] });
      toast({
        title: "Success",
        description: "Log deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete log",
        variant: "destructive",
      });
    },
  });

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this log?")) {
      setIsDeleting(true);
      await deleteMutation.mutateAsync(log.id);
      setIsDeleting(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h4 className="text-lg font-medium text-slate-900">{log.id}</h4>
            <p className="text-sm text-slate-500">Created on {formatDate(log.createdAt)}</p>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-primary hover:text-primary/80"
              title="View Log"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-600 hover:text-slate-700"
              onClick={() => onEdit(log)}
              title="Edit Log"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-red-600 hover:text-red-700"
              onClick={handleDelete}
              disabled={isDeleting}
              title="Delete Log"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <span className="text-sm font-medium text-slate-700">PR URL:</span>
            <a
              href={log.prUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-sm text-primary hover:text-primary/80 truncate group"
            >
              {log.prUrl}
              <ExternalLink className="h-3 w-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
          </div>
          {log.branch && (
            <div>
              <span className="text-sm font-medium text-slate-700">Branch:</span>
              <span className="block text-sm text-slate-600">{log.branch}</span>
            </div>
          )}
          <div>
            <span className="text-sm font-medium text-slate-700">Author:</span>
            <span className="block text-sm text-slate-600">{log.authorEmail}</span>
          </div>
          <div>
            <span className="text-sm font-medium text-slate-700">Orchestrator:</span>
            <span className="block text-sm text-slate-600">{log.orchestrator}</span>
          </div>
          <div>
            <span className="text-sm font-medium text-slate-700">LLM:</span>
            <span className="block text-sm text-slate-600">{log.llm}</span>
          </div>
          {log.tags && log.tags.length > 0 && (
            <div>
              <span className="text-sm font-medium text-slate-700">Tags:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {log.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="border-t border-slate-200 pt-4">
          <span className="text-sm font-medium text-slate-700">Content Preview:</span>
          <div className="mt-2 p-3 bg-slate-50 rounded-md border">
            <p className="text-sm text-slate-600 line-clamp-3">
              {log.content.substring(0, 200)}...
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}