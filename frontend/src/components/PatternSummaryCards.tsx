/**
 * Pattern Summary Cards
 * Displays AI pattern intelligence summary on dashboard
 */

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, Calendar, CheckCircle, TrendingUp } from 'lucide-react';
import api from '@/lib/api';

interface ShoppingPrediction {
  item_name: string;
  category: string;
  urgency: string;
  confidence_level: string;
  data_points_count: number;
}

const PatternSummaryCards = () => {
  // Fetch all predictions
  const { data: predictions, isLoading } = useQuery<ShoppingPrediction[]>({
    queryKey: ['all-predictions'],
    queryFn: async () => {
      const response = await api.get('/api/shopping/predictions');
      return response.data;
    },
  });

  // Calculate counts
  const urgentCount = predictions?.filter(p => p.urgency === 'urgent').length || 0;
  const thisWeekCount = predictions?.filter(p => p.urgency === 'this_week').length || 0;
  const goodCount = predictions?.filter(p => p.urgency === 'later').length || 0;
  const totalTracked = predictions?.length || 0;
  
  // Calculate pattern health (percentage of items with high confidence)
  const highConfidenceCount = predictions?.filter(p => p.confidence_level === 'high').length || 0;
  const patternHealth = totalTracked > 0 ? Math.round((highConfidenceCount / totalTracked) * 100) : 0;

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-36 rounded-xl" />
        ))}
      </div>
    );
  }

  // Don't show if no pattern data yet
  if (totalTracked === 0) {
    return null;
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <TrendingUp className="w-4 h-4 text-primary" />
        </div>
        <h3 className="text-lg lg:text-xl font-semibold text-foreground">Consumption Insights</h3>
      </div>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {/* Urgent */}
        <Card className="group hover:shadow-medium hover:-translate-y-1 transition-all duration-300 border-border/40 bg-card/80 backdrop-blur-sm overflow-hidden border-l-4 border-l-secondary shadow-soft">
          <CardContent className="p-5 lg:p-6">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <AlertTriangle className="w-5 h-5 text-secondary" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">URGENT</span>
            </div>
            <div className="text-3xl lg:text-4xl font-bold text-foreground mb-1">{urgentCount}</div>
            <p className="text-sm text-muted-foreground">Buy Today</p>
          </CardContent>
        </Card>

        {/* This Week */}
        <Card className="group hover:shadow-medium hover:-translate-y-1 transition-all duration-300 border-border/40 bg-card/80 backdrop-blur-sm overflow-hidden border-l-4 border-l-accent shadow-soft">
          <CardContent className="p-5 lg:p-6">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Calendar className="w-5 h-5 text-accent" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">THIS WEEK</span>
            </div>
            <div className="text-3xl lg:text-4xl font-bold text-foreground mb-1">{thisWeekCount}</div>
            <p className="text-sm text-muted-foreground">Buy Soon</p>
          </CardContent>
        </Card>

        {/* Good Stock */}
        <Card className="group hover:shadow-medium hover:-translate-y-1 transition-all duration-300 border-border/40 bg-card/80 backdrop-blur-sm overflow-hidden border-l-4 border-l-primary shadow-soft">
          <CardContent className="p-5 lg:p-6">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <CheckCircle className="w-5 h-5 text-primary" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">GOOD</span>
            </div>
            <div className="text-3xl lg:text-4xl font-bold text-foreground mb-1">{goodCount}</div>
            <p className="text-sm text-muted-foreground">Stock OK</p>
          </CardContent>
        </Card>

        {/* Pattern Health */}
        <Card className="group hover:shadow-medium hover:-translate-y-1 transition-all duration-300 border-border/40 bg-card/80 backdrop-blur-sm overflow-hidden border-l-4 border-l-accent shadow-soft">
          <CardContent className="p-5 lg:p-6">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="w-5 h-5 text-accent" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">TRACKED</span>
            </div>
            <div className="text-3xl lg:text-4xl font-bold text-foreground mb-1">{totalTracked}</div>
            <p className="text-sm text-muted-foreground">{patternHealth}% Health</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PatternSummaryCards;

