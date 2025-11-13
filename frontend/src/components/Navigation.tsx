import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export const Navigation = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate('/')}>
            <img 
              src="/logo.png" 
              alt="Kleio.ai Logo" 
              className="w-14 h-14 object-contain"
            />
            <span className="text-xl font-bold text-foreground tracking-tight">
              Kleio.ai
            </span>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200 relative group">
              Features
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-200"></span>
            </a>
            <a href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200 relative group">
              How It Works
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-200"></span>
            </a>
            <a href="#benefits" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200 relative group">
              Benefits
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-200"></span>
            </a>
          </div>

          {/* CTA Button - Show different button based on auth status */}
          {user ? (
            <Button 
              variant="hero" 
              size="sm" 
              className="shadow-colored hover:shadow-medium" 
              onClick={() => navigate('/app')}
            >
              Go to Dashboard
            </Button>
          ) : (
            <Button 
              variant="hero" 
              size="sm" 
              className="shadow-colored hover:shadow-medium" 
              onClick={() => navigate('/signup')}
            >
              Get Early Access
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
};
