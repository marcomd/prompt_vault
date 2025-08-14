import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertPromptLogSchema, type PromptLog } from "@shared/schema";
import { z } from "zod";

const formSchema = insertPromptLogSchema.extend({
  tags: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface CreateLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingLog?: PromptLog | null;
}

export default function CreateLogModal({ isOpen, onClose, editingLog }: CreateLogModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: "",
      prUrl: "",
      branch: "",
      authorEmail: "",
      orchestrator: "",
      llm: "",
      tags: "",
      content: "",
    },
  });

  useEffect(() => {
    if (editingLog) {
      form.reset({
        id: editingLog.id,
        prUrl: editingLog.prUrl,
        branch: editingLog.branch || "",
        authorEmail: editingLog.authorEmail,
        orchestrator: editingLog.orchestrator,
        llm: editingLog.llm,
        tags: editingLog.tags?.join(", ") || "",
        content: editingLog.content,
      });
    } else {
      form.reset({
        id: "",
        prUrl: "",
        branch: "",
        authorEmail: "",
        orchestrator: "",
        llm: "",
        tags: "",
        content: "",
      });
    }
  }, [editingLog, form]);

  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const endpoint = editingLog ? `/api/logs/${editingLog.id}` : "/api/logs";
      const method = editingLog ? "PUT" : "POST";
      const response = await apiRequest(method, endpoint, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/logs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/logs/recent"] });
      queryClient.invalidateQueries({ queryKey: ["/api/logs/search"] });
      toast({
        title: "Success",
        description: editingLog ? "Log updated successfully" : "Log created successfully",
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || (editingLog ? "Failed to update log" : "Failed to create log"),
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    createMutation.mutate(data);
  };

  const generateId = () => {
    const year = new Date().getFullYear();
    const sequence = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
    return `LOG-${year}-${sequence}`;
  };

  const handleGenerateId = () => {
    if (!form.getValues("id")) {
      form.setValue("id", generateId());
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            {editingLog ? "Edit Log" : "Create New Log"}
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* ID Field */}
              <FormField
                control={form.control}
                name="id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      ID <span className="text-slate-400">(optional)</span>
                    </FormLabel>
                    <div className="flex space-x-2">
                      <FormControl>
                        <Input
                          placeholder="Auto-generated if empty"
                          {...field}
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleGenerateId}
                        disabled={!!editingLog}
                      >
                        Generate
                      </Button>
                    </div>
                    <FormDescription>
                      Leave empty for auto-generation (LOG-YYYY-XXX)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* PR URL Field */}
              <FormField
                control={form.control}
                name="prUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      PR URL <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="url"
                        placeholder="https://github.com/user/repo/pull/123"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Git Branch Field */}
              <FormField
                control={form.control}
                name="branch"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Git Branch <span className="text-slate-400">(optional)</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="feature/ai-integration"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Author Email Field */}
              <FormField
                control={form.control}
                name="authorEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Author Email <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="developer@company.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Orchestrator Field */}
              <FormField
                control={form.control}
                name="orchestrator"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Orchestrator <span className="text-red-500">*</span>
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select orchestrator..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="GitHub Copilot">GitHub Copilot</SelectItem>
                        <SelectItem value="Cursor">Cursor</SelectItem>
                        <SelectItem value="Codeium">Codeium</SelectItem>
                        <SelectItem value="Tabnine">Tabnine</SelectItem>
                        <SelectItem value="Amazon CodeWhisperer">Amazon CodeWhisperer</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* LLM Field */}
              <FormField
                control={form.control}
                name="llm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      LLM <span className="text-red-500">*</span>
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select LLM..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Claude Sonnet 3.5">Claude Sonnet 3.5</SelectItem>
                        <SelectItem value="Claude Sonnet 4">Claude Sonnet 4</SelectItem>
                        <SelectItem value="GPT-4">GPT-4</SelectItem>
                        <SelectItem value="GPT-4 Turbo">GPT-4 Turbo</SelectItem>
                        <SelectItem value="GPT-3.5 Turbo">GPT-3.5 Turbo</SelectItem>
                        <SelectItem value="Auto">Auto</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Tags Field */}
            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Tags <span className="text-slate-400">(comma-separated)</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="react, typescript, api, authentication"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Separate tags with commas for better organization
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Content Field */}
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Content <span className="text-red-500">*</span>
                    <span className="text-slate-400"> (Markdown format)</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      rows={15}
                      placeholder="# Initial Prompt&#10;&#10;Describe the initial prompt here...&#10;&#10;## AI Response&#10;&#10;Paste the AI response here...&#10;&#10;## Follow-up Interactions&#10;&#10;Document any follow-up conversations..."
                      className="font-mono text-sm resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Use Markdown format to structure your content. Include initial prompt, AI responses, and follow-up interactions.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-slate-200">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending}
                className="bg-primary hover:bg-primary/90"
              >
                <Save className="mr-2 h-4 w-4" />
                {createMutation.isPending
                  ? "Saving..."
                  : editingLog
                  ? "Update Log"
                  : "Save Log"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
