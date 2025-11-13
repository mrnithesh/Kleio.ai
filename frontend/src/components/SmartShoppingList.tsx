import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';
import {
  ShoppingCart,
  AlertCircle,
  Calendar,
  Clock,
  RefreshCw,
  TrendingUp,
  CheckCircle2,
  Info
} from 'lucide-react';

interface ShoppingItem {
  item_name: string;
  category: string;
  suggested_quantity: number;
  unit: string;
  current_stock: number;
  predicted_depletion_date: string | null;
  confidence: string;
  reason: string;
}

interface ShoppingListData {
  urgent: ShoppingItem[];
  this_week: ShoppingItem[];
  later: ShoppingItem[];
  generated_at: string;
  total_items: number;
}

const SmartShoppingList = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);

  // Fetch shopping list
  const { data: shoppingList, isLoading, error } = useQuery<ShoppingListData>({
    queryKey: ['shopping-list', selectedFilter],
    queryFn: async () => {
      const params = selectedFilter ? { urgency_filter: selectedFilter } : {};
      const response = await api.get('/api/shopping/list', { params });
      return response.data;
    },
  });

  // Trigger manual analysis
  const analyzePatternsMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post('/api/shopping/analyze', {
        force_refresh: true
      });
      return response.data;
    },
    onSuccess: (data) => {
      toast({
        title: 'Pattern Analysis Complete',
        description: `Analyzed ${data.items_analyzed} items and saved ${data.predictions_saved} predictions.`,
      });
      queryClient.invalidateQueries({ queryKey: ['shopping-list'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Analysis Failed',
        description: error.response?.data?.detail || 'Failed to analyze patterns',
        variant: 'destructive',
      });
    },
  });

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'urgent': return 'destructive';
      case 'this_week': return 'default';
      case 'later': return 'secondary';
      default: return 'outline';
    }
  };

  const getConfidenceBadge = (confidence: string) => {
    const colors = {
      high: 'bg-primary',
      medium: 'bg-accent',
      low: 'bg-muted-foreground'
    };
    return colors[confidence as keyof typeof colors] || 'bg-muted-foreground';
  };

  const ShoppingItemCard = ({ item }: { item: ShoppingItem }) => (
    <div className="flex items-start justify-between p-4 border border-border/40 rounded-xl bg-card/50 backdrop-blur-sm hover:bg-card/70 transition-all duration-200 group">
      <div className="flex-1">
        <div className="flex items-center gap-2.5 mb-2">
          <h4 className="font-semibold capitalize text-foreground">{item.item_name}</h4>
          <Badge variant="outline" className="text-xs border-border/50">
            {item.category}
          </Badge>
          <div className={`w-2 h-2 rounded-full ${getConfidenceBadge(item.confidence)}`} 
               title={`${item.confidence} confidence`} />
        </div>
        
        <div className="flex items-center gap-4 text-sm mb-2.5">
          <span className="font-semibold text-foreground">
            {item.suggested_quantity} {item.unit}
          </span>
          {item.current_stock > 0 && (
            <span className="text-xs text-muted-foreground">
              Current: {item.current_stock} {item.unit}
            </span>
          )}
        </div>

        <p className="text-sm text-muted-foreground flex items-center gap-1.5 mb-2">
          <Info className="w-3.5 h-3.5" />
          {item.reason}
        </p>

        {item.predicted_depletion_date && (
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            Expected depletion: {new Date(item.predicted_depletion_date).toLocaleDateString()}
          </p>
        )}
      </div>
    </div>
  );

  if (error) {
    return (
      <Card className="border-border/40 shadow-medium bg-card/80 backdrop-blur-sm">
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center border border-destructive/20">
              <AlertCircle className="w-8 h-8 text-destructive" />
            </div>
            <h3 className="text-lg lg:text-xl font-semibold text-foreground mb-2">Failed to Load Shopping List</h3>
            <p className="text-sm text-muted-foreground">
              Please try again later.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
              <ShoppingCart className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl lg:text-3xl font-bold text-foreground">Smart Shopping List</h2>
              <p className="text-sm lg:text-base text-muted-foreground mt-0.5">
                AI-powered predictions based on your usage patterns
              </p>
            </div>
          </div>

          <Button
            onClick={() => analyzePatternsMutation.mutate()}
            disabled={analyzePatternsMutation.isPending}
            variant="outline"
            className="border-border/50 hover:border-primary/30 hover:bg-primary/5"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${analyzePatternsMutation.isPending ? 'animate-spin' : ''}`} />
            Refresh Analysis
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedFilter === null ? 'default' : 'outline'}
          onClick={() => setSelectedFilter(null)}
          size="sm"
          className={selectedFilter === null ? '' : 'border-border/50 hover:border-primary/30 hover:bg-primary/5'}
        >
          All Items
        </Button>
        <Button
          variant={selectedFilter === 'urgent' ? 'default' : 'outline'}
          onClick={() => setSelectedFilter('urgent')}
          size="sm"
          className={selectedFilter === 'urgent' ? '' : 'border-border/50 hover:border-primary/30 hover:bg-primary/5'}
        >
          <AlertCircle className="w-4 h-4 mr-1" />
          Urgent
        </Button>
        <Button
          variant={selectedFilter === 'this_week' ? 'default' : 'outline'}
          onClick={() => setSelectedFilter('this_week')}
          size="sm"
          className={selectedFilter === 'this_week' ? '' : 'border-border/50 hover:border-primary/30 hover:bg-primary/5'}
        >
          <Calendar className="w-4 h-4 mr-1" />
          This Week
        </Button>
        <Button
          variant={selectedFilter === 'later' ? 'default' : 'outline'}
          onClick={() => setSelectedFilter('later')}
          size="sm"
          className={selectedFilter === 'later' ? '' : 'border-border/50 hover:border-primary/30 hover:bg-primary/5'}
        >
          <Clock className="w-4 h-4 mr-1" />
          Later
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : shoppingList ? (
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border-border/40 shadow-soft bg-card/80 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Items
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{shoppingList.total_items}</div>
              </CardContent>
            </Card>

            <Card className="border-border/40 shadow-soft bg-card/80 backdrop-blur-sm border-l-4 border-l-secondary">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <AlertCircle className="w-4 h-4 text-secondary" />
                  Urgent
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-secondary">
                  {shoppingList.urgent.length}
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/40 shadow-soft bg-card/80 backdrop-blur-sm border-l-4 border-l-accent">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-accent" />
                  This Week
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-accent">
                  {shoppingList.this_week.length}
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/40 shadow-soft bg-card/80 backdrop-blur-sm border-l-4 border-l-primary">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  Later
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  {shoppingList.later.length}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Urgent Items */}
          {shoppingList.urgent.length > 0 && (
            <Card className="border-border/40 shadow-medium bg-card/80 backdrop-blur-sm border-l-4 border-l-secondary">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-secondary">
                  <AlertCircle className="w-5 h-5" />
                  Urgent - Buy Today/Tomorrow
                </CardTitle>
                <CardDescription>
                  These items are running out soon or already out of stock
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {shoppingList.urgent.map((item, idx) => (
                  <ShoppingItemCard key={idx} item={item} />
                ))}
              </CardContent>
            </Card>
          )}

          {/* This Week Items */}
          {shoppingList.this_week.length > 0 && (
            <Card className="border-border/40 shadow-medium bg-card/80 backdrop-blur-sm border-l-4 border-l-accent">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-accent">
                  <Calendar className="w-5 h-5" />
                  This Week - Buy Within 7 Days
                </CardTitle>
                <CardDescription>
                  Stock up on these items this week
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {shoppingList.this_week.map((item, idx) => (
                  <ShoppingItemCard key={idx} item={item} />
                ))}
              </CardContent>
            </Card>
          )}

          {/* Later Items */}
          {shoppingList.later.length > 0 && (
            <Card className="border-border/40 shadow-medium bg-card/80 backdrop-blur-sm border-l-4 border-l-primary">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Clock className="w-5 h-5" />
                  Later - No Immediate Rush
                </CardTitle>
                <CardDescription>
                  You have sufficient stock for now
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {shoppingList.later.map((item, idx) => (
                  <ShoppingItemCard key={idx} item={item} />
                ))}
              </CardContent>
            </Card>
          )}

          {/* Empty State */}
          {shoppingList.total_items === 0 && (
            <Card className="border-border/40 shadow-medium bg-card/80 backdrop-blur-sm">
              <CardContent className="py-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                  <TrendingUp className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-foreground">No Shopping Predictions Yet</h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                  Add items to your inventory and mark them as used to build usage patterns.
                  After 2-3 cycles, we'll generate smart shopping predictions for you!
                </p>
                <Button onClick={() => analyzePatternsMutation.mutate()} variant="hero" className="shadow-colored">
                  Analyze Patterns Now
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Footer Info */}
          <div className="text-xs text-muted-foreground text-center">
            Last updated: {new Date(shoppingList.generated_at).toLocaleString()}
            <Separator className="my-2" />
            <p className="flex items-center justify-center gap-1">
              <Info className="w-3 h-3" />
              Predictions are based on your purchase and consumption patterns
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default SmartShoppingList;
