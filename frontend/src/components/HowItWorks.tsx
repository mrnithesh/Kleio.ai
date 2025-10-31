import { Smartphone, Brain, ShoppingBag, CheckCircle } from "lucide-react";

const steps = [
  {
    icon: Smartphone,
    title: "Connect Your Way",
    description: "WhatsApp, voice in Hindi/Tamil/Bengali, photos, or manual entry. Choose what works for you.",
    color: "text-primary",
    bgColor: "bg-primary/5",
    borderColor: "border-primary/20",
  },
  {
    icon: Brain,
    title: "AI Learns Your Family",
    description: "Understands preferences, festivals, dietary needs, and shopping patterns automatically.",
    color: "text-secondary",
    bgColor: "bg-secondary/5",
    borderColor: "border-secondary/20",
  },
  {
    icon: ShoppingBag,
    title: "Smart Suggestions",
    description: "Get personalized shopping lists, recipe ideas, and price alerts tailored to your household.",
    color: "text-accent",
    bgColor: "bg-accent/5",
    borderColor: "border-accent/20",
  },
  {
    icon: CheckCircle,
    title: "Live Smarter",
    description: "Save time, reduce waste, cut costs. More time for what matters - your family.",
    color: "text-primary",
    bgColor: "bg-primary/5",
    borderColor: "border-primary/20",
  },
];

export const HowItWorks = () => {
  return (
    <section className="py-32 relative overflow-hidden bg-background">
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-5 animate-fade-in">
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground leading-tight">
            Simple Steps to
            <span className="text-primary"> Smarter Living</span>
          </h2>
          <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed">
            Get started in minutes. No complex setup, no learning curve.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 max-w-7xl mx-auto relative">
          {/* Connecting line - desktop only */}
          <div className="hidden lg:block absolute top-20 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/20 via-secondary/20 via-accent/20 to-primary/20" />
          
          {steps.map((step, index) => (
            <div 
              key={index} 
              className="relative animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Step number badge */}
              <div className="absolute -top-3 left-6 w-8 h-8 rounded-full bg-foreground text-background flex items-center justify-center text-sm font-bold z-10 border-2 border-background">
                {index + 1}
              </div>

              <div className={`bg-card rounded-2xl p-6 lg:p-8 shadow-soft border ${step.borderColor} h-full space-y-4 hover:shadow-medium hover:-translate-y-1 transition-all duration-300`}>
                <div className={`w-14 h-14 rounded-xl ${step.bgColor} flex items-center justify-center`}>
                  <step.icon className={`w-7 h-7 ${step.color}`} />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-lg lg:text-xl font-semibold text-foreground">{step.title}</h3>
                  <p className="text-sm lg:text-base text-muted-foreground leading-relaxed">{step.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
