import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Menu, User, LogOut, Settings } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Header = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      console.log('Sign out initiated - User Agent:', navigator.userAgent);
      console.log('Sign out initiated - Touch support:', 'ontouchstart' in window);
      
      await signOut();
      console.log('Sign out successful, navigating to home');
      navigate("/");
    } catch (error) {
      console.error('Sign out failed:', error);
      // Still try to navigate even if sign out fails
      navigate("/");
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border/50 shadow-sm animate-slide-down">
      <nav className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div 
            className="flex items-center gap-2 sm:gap-3 cursor-pointer group touch-target" 
            onClick={() => navigate("/")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                navigate("/");
              }
            }}
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center shadow-lg shadow-primary/25 group-hover:shadow-primary/40 transition-all duration-300 group-hover:scale-105">
              <BookOpen className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold gradient-text">Quizly Prep</h1>
              <Badge variant="secondary" className="text-xs hidden sm:inline-flex bg-primary/10 text-primary border-primary/20">
                Beta
              </Badge>
            </div>
          </div>

          {/* Navigation - Removed non-functioning links */}
          <div className="hidden md:flex items-center gap-8">
            {/* Navigation links removed as requested */}
          </div>

          {/* CTA Buttons */}
          <div className="flex items-center gap-1 sm:gap-3">
            <ThemeToggle />
            {user ? (
              <>
                <Button 
                  variant="ghost" 
                  className="hidden md:inline-flex text-sm hover:bg-primary/10 hover:text-primary transition-all duration-200 animate-slide-left hover-lift touch-target"
                  onClick={() => navigate("/dashboard")}
                >
                  Dashboard
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="w-10 h-10 sm:w-11 sm:h-11 animate-scale-in hover-glow touch-target"
                      aria-label="User menu"
                    >
                      <User className="w-4 h-4 sm:w-5 sm:h-5 animate-bounce-subtle" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem 
                      onClick={() => navigate("/dashboard")}
                      className="md:hidden cursor-pointer touch-target"
                    >
                      <User className="mr-2 h-4 w-4" />
                      Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => navigate("/settings")}
                      className="cursor-pointer touch-target"
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={handleSignOut}
                      className="cursor-pointer touch-target"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button 
                  variant="ghost" 
                  className="hidden md:inline-flex text-sm hover:bg-primary/10 hover:text-primary transition-all duration-200 animate-slide-left hover-lift touch-target"
                  onClick={() => navigate("/auth")}
                >
                  Sign In
                </Button>
                <Button 
                  className="modern-button text-sm px-3 py-2 sm:px-6 sm:py-2.5 button-ripple animate-scale-in touch-target"
                  onClick={() => navigate("/auth")}
                >
                  <span className="hidden sm:inline">Get Started</span>
                  <span className="sm:hidden">Start</span>
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};