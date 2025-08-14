import { useState } from "react";
import { Settings as SettingsIcon, User, Database, Download, Upload, Trash2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const [userSettings, setUserSettings] = useState({
    defaultOrchestrator: "GitHub Copilot",
    defaultLlm: "Claude Sonnet 3.5",
    autoGenerateId: true,
    confirmDelete: true,
    theme: "light",
  });

  const { toast } = useToast();

  const handleSaveSettings = () => {
    // In a real app, this would save to localStorage or backend
    localStorage.setItem('iubrompt-settings', JSON.stringify(userSettings));
    toast({
      title: "Settings saved",
      description: "Your preferences have been updated successfully.",
    });
  };

  const handleExportData = () => {
    // In a real app, this would export all logs as JSON
    toast({
      title: "Export initiated",
      description: "Your data export will begin shortly.",
    });
  };

  const handleImportData = () => {
    // In a real app, this would handle file import
    toast({
      title: "Import feature",
      description: "This feature would allow you to import logs from a JSON file.",
    });
  };

  const handleClearAllData = () => {
    if (window.confirm("Are you sure you want to clear all data? This action cannot be undone.")) {
      toast({
        title: "Data cleared",
        description: "All logs have been removed from the system.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center">
          <SettingsIcon className="mr-3 h-6 w-6" />
          Settings
        </h1>
        <p className="text-slate-600">Customize your Iubrompt experience</p>
      </div>

      {/* User Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="mr-2 h-5 w-5" />
            User Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="defaultOrchestrator">Default Orchestrator</Label>
              <Select
                value={userSettings.defaultOrchestrator}
                onValueChange={(value) => setUserSettings({ ...userSettings, defaultOrchestrator: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GitHub Copilot">GitHub Copilot</SelectItem>
                  <SelectItem value="Cursor">Cursor</SelectItem>
                  <SelectItem value="Codeium">Codeium</SelectItem>
                  <SelectItem value="Tabnine">Tabnine</SelectItem>
                  <SelectItem value="Amazon CodeWhisperer">Amazon CodeWhisperer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="defaultLlm">Default LLM</Label>
              <Select
                value={userSettings.defaultLlm}
                onValueChange={(value) => setUserSettings({ ...userSettings, defaultLlm: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Claude Sonnet 3.5">Claude Sonnet 3.5</SelectItem>
                  <SelectItem value="Claude Sonnet 4">Claude Sonnet 4</SelectItem>
                  <SelectItem value="GPT-4">GPT-4</SelectItem>
                  <SelectItem value="GPT-4 Turbo">GPT-4 Turbo</SelectItem>
                  <SelectItem value="GPT-3.5 Turbo">GPT-3.5 Turbo</SelectItem>
                  <SelectItem value="Auto">Auto</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="theme">Theme</Label>
              <Select
                value={userSettings.theme}
                onValueChange={(value) => setUserSettings({ ...userSettings, theme: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Auto-generate IDs</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically generate log IDs when creating new entries
                </p>
              </div>
              <Switch
                checked={userSettings.autoGenerateId}
                onCheckedChange={(checked) => setUserSettings({ ...userSettings, autoGenerateId: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Confirm deletions</Label>
                <p className="text-sm text-muted-foreground">
                  Show confirmation dialog before deleting logs
                </p>
              </div>
              <Switch
                checked={userSettings.confirmDelete}
                onCheckedChange={(checked) => setUserSettings({ ...userSettings, confirmDelete: checked })}
              />
            </div>
          </div>

          <div className="pt-4">
            <Button onClick={handleSaveSettings} className="bg-primary hover:bg-primary/90">
              <Save className="mr-2 h-4 w-4" />
              Save Preferences
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="mr-2 h-5 w-5" />
            Data Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" onClick={handleExportData}>
              <Download className="mr-2 h-4 w-4" />
              Export All Data
            </Button>
            <Button variant="outline" onClick={handleImportData}>
              <Upload className="mr-2 h-4 w-4" />
              Import Data
            </Button>
          </div>
          
          <Separator />
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="font-medium text-red-900 mb-2">Danger Zone</h4>
            <p className="text-sm text-red-700 mb-4">
              This action will permanently delete all your logs and cannot be undone.
            </p>
            <Button 
              variant="destructive" 
              onClick={handleClearAllData}
              className="bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Clear All Data
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* About */}
      <Card>
        <CardHeader>
          <CardTitle>About Iubrompt</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-slate-600 space-y-2">
            <p>
              <strong>Version:</strong> 1.0.0
            </p>
            <p>
              <strong>Purpose:</strong> AI prompt logging and management tool for developers
            </p>
            <p>
              <strong>Features:</strong>
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Store complete AI interaction logs with metadata</li>
              <li>Track PR URLs, branches, and author information</li>
              <li>Organize logs with tags and orchestrator details</li>
              <li>Search and filter capabilities</li>
              <li>Export and import functionality</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}