import { LogIn, LogOut, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/hooks/useAuth";
import type { User } from "@shared/schema";

export default function UserAuth() {
  const { user, isAuthenticated, isLoading } = useAuth();

  // Type guard to ensure user is properly typed when authenticated
  if (isAuthenticated && !user) {
    return null; // Should not happen, but provides type safety
  }

  const handleLogin = () => {
    window.location.href = "/api/auth/google";
  };

  const handleLogout = () => {
    window.location.href = "/api/auth/logout";
  };

  if (isLoading) {
    return (
      <div className="flex items-center text-sm text-slate-500">
        <div className="animate-pulse flex items-center">
          <div className="w-8 h-8 bg-slate-200 rounded-full mr-2"></div>
          <div className="w-20 h-4 bg-slate-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You're viewing in read-only mode. Sign in to create and edit logs.
          </AlertDescription>
        </Alert>
        <Button 
          onClick={handleLogin}
          variant="outline"
          className="w-full"
        >
          <LogIn className="mr-2 h-4 w-4" />
          Sign in with Google
        </Button>
      </div>
    );
  }

  const getInitials = (user: User) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user.firstName) {
      return user.firstName[0].toUpperCase();
    }
    return user.email?.[0]?.toUpperCase() || "U";
  };

  // This is only rendered when authenticated, so user is guaranteed to exist
  const authenticatedUser = user as User;

  return (
    <div className="flex items-center">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center space-x-2 p-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={authenticatedUser.profileImageUrl || undefined} />
              <AvatarFallback>
                {getInitials(authenticatedUser)}
              </AvatarFallback>
            </Avatar>
            <div className="text-left">
              <div className="text-sm font-medium">
                {authenticatedUser.firstName && authenticatedUser.lastName 
                  ? `${authenticatedUser.firstName} ${authenticatedUser.lastName}` 
                  : authenticatedUser.email?.split('@')[0] || 'User'
                }
              </div>
              <div className="text-xs text-slate-500">
                {authenticatedUser.email}
              </div>
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <div className="px-2 py-1.5">
            <div className="flex items-center space-x-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={authenticatedUser.profileImageUrl || undefined} />
                <AvatarFallback>
                  {getInitials(authenticatedUser)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="text-sm font-medium">
                  {authenticatedUser.firstName && authenticatedUser.lastName 
                    ? `${authenticatedUser.firstName} ${authenticatedUser.lastName}` 
                    : authenticatedUser.email?.split('@')[0] || 'User'
                  }
                </div>
                <div className="text-xs text-slate-500">
                  {authenticatedUser.email}
                </div>
              </div>
            </div>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}