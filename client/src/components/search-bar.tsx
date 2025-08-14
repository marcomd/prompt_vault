import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function SearchBar({ searchQuery, onSearchChange }: SearchBarProps) {
  return (
    <div className="max-w-2xl">
      <Label htmlFor="search" className="block text-sm font-medium text-slate-700 mb-2">
        Search by ID or Content
      </Label>
      <div className="relative">
        <Input
          type="text"
          id="search"
          name="search"
          placeholder="Enter log ID (e.g., LOG-2024-001) or search content..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 pr-4 py-3 focus:ring-2 focus:ring-primary focus:border-primary"
        />
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-slate-400" />
        </div>
      </div>
      <p className="text-xs text-slate-500 mt-2">
        Search for logs by their ID, content, author, or other metadata
      </p>
    </div>
  );
}