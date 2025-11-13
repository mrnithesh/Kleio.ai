import { Card, CardContent } from "@/components/ui/card";
import { IndianRupee, Leaf, Heart } from "lucide-react";

const benefits = [
  {
    icon: IndianRupee,
    title: "₹5,000+ Saved Monthly",
    description: "Smart shopping, bulk buying, and waste reduction translate to real savings",
    stat: "30% Cost Reduction",
    color: "text-primary",
    bgColor: "bg-primary/5",
    borderColor: "border-primary/20",
  },
  {
    icon: Leaf,
    title: "40% Less Food Waste",
    description: "Smart consumption tracking and recipe suggestions mean fresh food gets used",
    stat: "Eco-Friendly Living",
    color: "text-accent",
    bgColor: "bg-accent/5",
    borderColor: "border-accent/20",
  },
  {
    icon: Heart,
    title: "Peace of Mind",
    description: "Medicine tracking, emergency prep, and festival planning - all handled",
    stat: "Stress-Free Home",
    color: "text-secondary",
    bgColor: "bg-secondary/5",
    borderColor: "border-secondary/20",
  },
];

export const Benefits = () => {
  return (
    <section className="py-32 bg-gradient-subtle texture-overlay">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-5 animate-fade-in">
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground leading-tight">
            Real Impact,
            <span className="text-primary"> Measured Results</span>
          </h2>
          <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed">
            Join thousands of Indian families already transforming their households
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
          {benefits.map((benefit, index) => (
            <Card 
              key={index}
              className={`group hover:shadow-medium transition-all duration-300 border ${benefit.borderColor} bg-card hover:-translate-y-1 animate-scale-in overflow-hidden`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-6 lg:p-8 space-y-5">
                <div className={`w-16 h-16 rounded-xl ${benefit.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <benefit.icon className={`w-8 h-8 ${benefit.color}`} />
                </div>
                
                <div className="space-y-3">
                  <div className={`text-xs font-semibold uppercase tracking-wide ${benefit.color}`}>
                    {benefit.stat}
                  </div>
                  <h3 className="text-xl lg:text-2xl font-bold text-foreground leading-tight">{benefit.title}</h3>
                  <p className="text-sm lg:text-base text-muted-foreground leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
