import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export const CTA = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  return (
    <section className="py-32 relative overflow-hidden bg-gradient-hero">
      {/* Subtle overlay for better text contrast */}
      <div className="absolute inset-0 bg-foreground/5" />
      
      {/* Subtle pattern */}
      <div className="absolute inset-0 texture-overlay opacity-20" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-10 animate-fade-in">
          <h2 className="text-4xl lg:text-6xl font-bold text-foreground leading-tight">
            Ready to Transform
            <br />
            <span className="text-primary">Your Home Management?</span>
          </h2>

          <p className="text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Join thousands of Indian families already using Kleio to save time, reduce waste, and bring peace of mind to their households.
          </p>

          {/* CTA Button - Show different based on auth status */}
          {user ? (
            <div className="flex justify-center">
              <Button 
                size="lg" 
                variant="hero"
                className="h-12 lg:h-14 px-8 font-semibold shadow-colored hover:shadow-medium group"
                onClick={() => navigate('/app')}
              >
                Go to Dashboard
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
              <Input 
                type="email" 
                placeholder="Enter your email address"
                className="bg-background border-border h-12 lg:h-14 text-base shadow-soft focus:shadow-medium transition-all"
              />
              <Button 
                size="lg" 
                variant="hero"
                className="h-12 lg:h-14 px-8 font-semibold shadow-colored hover:shadow-medium group"
                onClick={() => navigate('/signup')}
              >
                Get Started Free
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          )}

          {/* Trust indicators */}
          <div className="flex flex-wrap items-center justify-center gap-6 lg:gap-8 pt-6">
            <div className="flex items-center gap-2 text-muted-foreground">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              <span className="text-sm">No credit card required</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              <span className="text-sm">Free forever plan available</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              <span className="text-sm">Cancel anytime</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
