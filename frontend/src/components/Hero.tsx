import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, TrendingDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import heroImage from "@/assets/hero-kitchen.jpg";

export const Hero = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 texture-overlay opacity-30" />
      <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-transparent to-secondary/3" />
      
      {/* Subtle geometric patterns instead of blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/4 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-secondary/4 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-4 py-24 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-10 animate-fade-in">
            <h1 className="text-5xl lg:text-7xl font-bold text-foreground leading-[1.1] tracking-tight">
              Manage Your Home
              <br />
              <span className="text-primary">The Indian Way</span>
            </h1>

            <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed max-w-xl">
              From Diwali shopping lists to daily meal planning, Kleio understands how Indian families work. 
              Smart inventory tracking, festival reminders, and AI-powered suggestions tailored to your household.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              {user ? (
                <Button variant="hero" size="lg" className="group shadow-colored hover:shadow-medium" onClick={() => navigate('/app')}>
                  Go to Dashboard
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              ) : (
                <>
                  <Button variant="hero" size="lg" className="group shadow-colored hover:shadow-medium" onClick={() => navigate('/signup')}>
                    Get Started Free
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <Button variant="outline" size="lg" onClick={() => navigate('/login')}>
                    Sign In
                  </Button>
                </>
              )}
            </div>

            {/* Indian Languages Support */}
            <div className="flex flex-wrap items-center gap-3 pt-6">
              <span className="text-sm font-medium text-foreground">Available in:</span>
              <div className="flex flex-wrap gap-2">
                {["हिंदी", "தமிழ்", "తెలుగు", "ಕನ್ನಡ", "മലയാളം", "বাংলা", "ગુજરાતી", "मराठी"].map((lang) => (
                  <span key={lang} className="px-3 py-1.5 bg-muted text-foreground text-xs font-medium rounded-lg border border-border/50 hover:border-primary/30 transition-colors">
                    {lang}
                  </span>
                ))}
              </div>
            </div>

            {/* Stats - Redesigned as cards */}
            <div className="grid grid-cols-2 gap-4 pt-8">
              <div className="bg-card p-5 rounded-xl border border-border/50 shadow-soft hover:shadow-medium transition-all">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-2xl font-bold text-foreground">10+</div>
                </div>
                <div className="text-sm text-muted-foreground">Smart Features</div>
              </div>
              <div className="bg-card p-5 rounded-xl border border-border/50 shadow-soft hover:shadow-medium transition-all">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                    <TrendingDown className="w-5 h-5 text-secondary" />
                  </div>
                  <div className="text-2xl font-bold text-foreground">30%</div>
                </div>
                <div className="text-sm text-muted-foreground">Cost Savings</div>
              </div>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative animate-scale-in" style={{ animationDelay: "0.2s" }}>
            <div className="relative rounded-3xl overflow-hidden shadow-strong border border-border/20">
              <img 
                src={heroImage} 
                alt="AI-powered household management with Kleio.ai showing smart kitchen interface"
                className="w-full h-auto object-cover"
              />
              {/* Subtle overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-background/30 via-transparent to-transparent" />
            </div>
            
            {/* Floating notification card */}
            <div className="absolute -top-8 -right-8 bg-card p-5 rounded-2xl shadow-strong border border-border/50 animate-float max-w-[200px]">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <div className="font-semibold text-sm text-foreground">Festival Reminder</div>
                  <div className="text-xs text-muted-foreground mt-1">Diwali shopping list ready</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
