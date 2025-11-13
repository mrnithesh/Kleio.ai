import { Calendar, Users, MessageCircle, Brain, ShoppingBag, Pill, Leaf } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: Calendar,
    title: "Festival Intelligence",
    description: "Automatic shopping lists for Diwali, Holi, Eid, Christmas. Knows your traditions.",
    color: "text-primary",
    bgColor: "bg-primary/5",
    borderColor: "border-primary/20",
    featured: false,
  },
  {
    icon: Users,
    title: "Multi-Gen Family Care",
    description: "Track dietary needs from diabetic grandparents to school-going kids.",
    color: "text-secondary",
    bgColor: "bg-secondary/5",
    borderColor: "border-secondary/20",
    featured: true,
  },
  {
    icon: MessageCircle,
    title: "WhatsApp Integration",
    description: "Simply text 'bought 2kg tomatoes' - inventory updated instantly.",
    color: "text-accent",
    bgColor: "bg-accent/5",
    borderColor: "border-accent/20",
    featured: false,
  },
  {
    icon: Brain,
    title: "AI Meal Planning",
    description: "Generate recipes from what's in your kitchen. Zero waste, maximum taste.",
    color: "text-primary",
    bgColor: "bg-primary/5",
    borderColor: "border-primary/20",
    featured: false,
  },
  {
    icon: ShoppingBag,
    title: "Smart Shopping",
    description: "Predict needs based on school calendar, cook's schedule, and weather.",
    color: "text-secondary",
    bgColor: "bg-secondary/5",
    borderColor: "border-secondary/20",
    featured: false,
  },
  {
    icon: Pill,
    title: "Medicine Management",
    description: "Never run out of critical medications. Doctor prescription integration.",
    color: "text-accent",
    bgColor: "bg-accent/5",
    borderColor: "border-accent/20",
    featured: false,
  },
  {
    icon: Leaf,
    title: "Sustainability First",
    description: "Track plastic footprint. Promote local, seasonal, organic choices.",
    color: "text-primary",
    bgColor: "bg-primary/5",
    borderColor: "border-primary/20",
    featured: false,
  },
];

export const Features = () => {
  return (
    <section className="py-32 bg-gradient-subtle texture-overlay">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-5 animate-fade-in">
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground leading-tight">
            Everything Your Household Needs
          </h2>
          <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed">
            From festival prep to daily meals, Kleio brings smart home management tailored for Indian families
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className={`group hover:shadow-medium transition-all duration-300 border ${feature.borderColor} hover:border-opacity-50 bg-card animate-fade-in-up hover:-translate-y-1 ${
                feature.featured ? 'lg:col-span-2 lg:row-span-1' : ''
              }`}
              style={{ animationDelay: `${index * 0.08}s` }}
            >
              <CardContent className={`p-6 lg:p-7 space-y-4 ${feature.featured ? 'lg:flex lg:items-center lg:gap-6' : ''}`}>
                <div className={`w-14 h-14 rounded-xl ${feature.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}>
                  <feature.icon className={`w-7 h-7 ${feature.color}`} />
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg lg:text-xl leading-tight text-foreground">{feature.title}</h3>
                  <p className="text-sm lg:text-base text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
