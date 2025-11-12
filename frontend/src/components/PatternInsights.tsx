/**
 * Pattern Insights Component
 * Shows all items with pattern data in a grid view
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import api from '@/lib/api';
import {
  TrendingUp,
  Calendar,
  Package,
  Activity,
  AlertCircle,
  BarChart3,
  ChevronRight,
  Sparkles
} from 'lucide-react';

interface PatternPrediction {
  item_name: string;
  category: string;
  avg_days_between_purchases: number | null;
  avg_quantity_per_purchase: number | null;
  avg_consumption_rate: number | null;
  predicted_depletion_date: string | null;
  suggested_quantity: number | null;
  confidence_level: string;
  urgency: string;
  current_stock: number | null;
  days_until_depletion: number | null;
  data_points_count: number;
}

const PatternInsights = () => {
  const [selectedItem, setSelectedItem] = useState<PatternPrediction | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Fetch all predictions
  const { data: predictions, isLoading, error } = useQuery<PatternPrediction[]>({
    queryKey: ['all-predictions'],
    queryFn: async () => {
      const response = await api.get('/api/shopping/predictions');
      return response.data;
    },
  });

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case 'urgent':
        return <Badge className="bg-secondary/10 text-secondary border-secondary/20 text-xs font-semibold">URGENT</Badge>;
      case 'this_week':
        return <Badge className="bg-accent/10 text-accent border-accent/20 text-xs font-semibold">THIS WEEK</Badge>;
      case 'later':
        return <Badge className="bg-primary/10 text-primary border-primary/20 text-xs font-semibold">GOOD</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">{urgency}</Badge>;
    }
  };

  const getConfidenceStars = (confidence: string) => {
    switch (confidence) {
      case 'high':
        return '⭐⭐⭐';
      case 'medium':
        return '⭐⭐';
      case 'low':
        return '⭐';
      default:
        return '';
    }
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-gray-600';
      default: return 'text-gray-400';
    }
  };

  const getConfidencePercentage = (confidence: string) => {
    switch (confidence) {
      case 'high': return 90;
      case 'medium': return 60;
      case 'low': return 30;
      default: return 0;
    }
  };

  const handleViewDetails = (item: PatternPrediction) => {
    setSelectedItem(item);
    setDetailsOpen(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-2">
            <BarChart3 className="w-8 h-8" />
            Pattern Insights
          </h2>
          <p className="text-muted-foreground mt-1">
            View detailed usage patterns for all tracked items
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load pattern insights. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  // Sort predictions by urgency (urgent first) and then by days until depletion
  const sortedPredictions = predictions?.sort((a, b) => {
    const urgencyOrder = { urgent: 0, this_week: 1, later: 2 };
    const urgencyA = urgencyOrder[a.urgency as keyof typeof urgencyOrder] ?? 3;
    const urgencyB = urgencyOrder[b.urgency as keyof typeof urgencyOrder] ?? 3;
    
    if (urgencyA !== urgencyB) return urgencyA - urgencyB;
    
    const daysA = a.days_until_depletion ?? Infinity;
    const daysB = b.days_until_depletion ?? Infinity;
    return daysA - daysB;
  });

  const itemsWithPatterns = sortedPredictions || [];
  const itemsNeedingMoreData = itemsWithPatterns.filter(p => p.data_points_count < 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold flex items-center gap-2">
          <BarChart3 className="w-8 h-8" />
          Pattern Insights
        </h2>
        <p className="text-muted-foreground mt-1">
          View detailed usage patterns for all tracked items ({itemsWithPatterns.length} items)
        </p>
      </div>

      {/* Empty State */}
      {itemsWithPatterns.length === 0 && (
        <Card className="border-dashed border-border/40 bg-card/50 backdrop-blur-sm">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 border border-primary/20">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Start Building Patterns!</h3>
            <p className="text-muted-foreground max-w-md mb-4">
              Track items for 2-3 cycles to unlock smart predictions and never run out again!
            </p>
            <div className="w-full max-w-xs">
              <Progress value={0} className="mb-2" />
              <p className="text-sm text-muted-foreground">
                Add and consume items to start building patterns
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Grid of Items */}
      {itemsWithPatterns.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {itemsWithPatterns.map((item) => (
            <Card 
              key={item.item_name} 
              className="hover:shadow-medium hover:-translate-y-1 transition-all duration-300 cursor-pointer group border-border/40 bg-card/80 backdrop-blur-sm shadow-soft"
              onClick={() => handleViewDetails(item)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <CardTitle className="text-lg capitalize flex items-center gap-2">
                      {item.item_name}
                    </CardTitle>
                    <CardDescription className="text-xs mt-1">
                      {item.category}
                    </CardDescription>
                  </div>
                  {getUrgencyBadge(item.urgency)}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                {/* Pattern Frequency */}
                <div className="text-sm">
                  <span className="text-muted-foreground">Pattern: </span>
                  <span className="font-medium">
                    {item.avg_days_between_purchases 
                      ? `Every ${Math.round(item.avg_days_between_purchases)} days`
                      : 'Building...'}
                  </span>
                </div>

                {/* Depletion Info */}
                {item.days_until_depletion !== null && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Runs out in: </span>
                    <span className={`font-medium ${
                      item.days_until_depletion <= 1 ? 'text-red-600' : 
                      item.days_until_depletion <= 7 ? 'text-orange-600' : 
                      'text-green-600'
                    }`}>
                      {Math.round(item.days_until_depletion)} day{Math.round(item.days_until_depletion) !== 1 ? 's' : ''}
                    </span>
                  </div>
                )}

                {/* Stock Level */}
                {item.current_stock !== null && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Stock: </span>
                    <span className="font-medium">{item.current_stock.toFixed(1)} units</span>
                  </div>
                )}

                {/* Confidence */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${getConfidenceColor(item.confidence_level)}`}>
                      {getConfidenceStars(item.confidence_level)}
                    </span>
                    <span className="text-xs text-muted-foreground capitalize">
                      {item.confidence_level}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Items Needing More Data */}
      {itemsNeedingMoreData.length > 0 && (
        <Card className="bg-accent/5 border-accent/20 border-border/40 shadow-soft bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-accent" />
              Building Pattern Confidence
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              {itemsNeedingMoreData.length} item{itemsNeedingMoreData.length !== 1 ? 's need' : ' needs'} more data to reach HIGH confidence:
            </p>
            <div className="flex flex-wrap gap-2">
              {itemsNeedingMoreData.map((item) => (
                <Badge key={item.item_name} variant="outline" className="text-xs border-border/50">
                  {item.item_name} ({item.data_points_count}/5 cycles)
                </Badge>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Track 2-3 more purchase cycles to unlock accurate predictions
            </p>
          </CardContent>
        </Card>
      )}

      {/* Detail Dialog */}
      {selectedItem && (
        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl capitalize flex items-center gap-2">
                {selectedItem.item_name}
                <Badge variant="outline">{selectedItem.category}</Badge>
              </DialogTitle>
              <DialogDescription>
                Pattern analysis based on {selectedItem.data_points_count} data points
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 mt-4">
              {/* Overview */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="border-border/40 bg-card/80 backdrop-blur-sm shadow-soft">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <Package className="w-4 h-4" />
                      Current Stock
                    </div>
                    <div className="text-3xl font-bold">
                      {selectedItem.current_stock?.toFixed(1) || 'N/A'} units
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/40 bg-card/80 backdrop-blur-sm shadow-soft">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <Calendar className="w-4 h-4" />
                      Predicted Depletion
                    </div>
                    <div className="text-xl font-semibold">
                      {selectedItem.predicted_depletion_date
                        ? new Date(selectedItem.predicted_depletion_date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })
                        : 'N/A'}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Confidence */}
              <Card className="border-border/40 bg-card/80 backdrop-blur-sm shadow-soft">
                <CardHeader>
                  <CardTitle className="text-sm">Prediction Confidence</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Confidence Level</span>
                    <span className="font-medium capitalize">{selectedItem.confidence_level} {getConfidenceStars(selectedItem.confidence_level)}</span>
                  </div>
                  <Progress value={getConfidencePercentage(selectedItem.confidence_level)} />
                  <p className="text-xs text-muted-foreground">
                    {selectedItem.data_points_count < 3 && 'Need more data for accurate predictions'}
                    {selectedItem.data_points_count >= 3 && selectedItem.data_points_count < 5 && 'Building pattern confidence'}
                    {selectedItem.data_points_count >= 5 && 'Strong pattern detected'}
                  </p>
                </CardContent>
              </Card>

              {/* Usage Patterns */}
              <Card className="border-border/40 bg-card/80 backdrop-blur-sm shadow-soft">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Usage Patterns
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between p-3 border border-border/40 rounded-lg bg-muted/30">
                    <div>
                      <p className="text-sm font-medium">Purchase Frequency</p>
                      <p className="text-xs text-muted-foreground">How often you buy</p>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold">
                        {selectedItem.avg_days_between_purchases 
                          ? Math.round(selectedItem.avg_days_between_purchases)
                          : 'N/A'}
                      </div>
                      <p className="text-xs text-muted-foreground">days</p>
                    </div>
                  </div>

                  <div className="flex justify-between p-3 border border-border/40 rounded-lg bg-muted/30">
                    <div>
                      <p className="text-sm font-medium">Avg Purchase Quantity</p>
                      <p className="text-xs text-muted-foreground">Typical amount</p>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold">
                        {selectedItem.avg_quantity_per_purchase?.toFixed(1) || 'N/A'}
                      </div>
                      <p className="text-xs text-muted-foreground">units</p>
                    </div>
                  </div>

                  <div className="flex justify-between p-3 border border-border/40 rounded-lg bg-muted/30">
                    <div>
                      <p className="text-sm font-medium">Daily Consumption</p>
                      <p className="text-xs text-muted-foreground">Usage per day</p>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold">
                        {selectedItem.avg_consumption_rate?.toFixed(2) || 'N/A'}
                      </div>
                      <p className="text-xs text-muted-foreground">units/day</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Smart Prediction */}
              <Card className="border-border/40 bg-card/80 backdrop-blur-sm shadow-soft">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Smart Prediction
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 border border-border/40 rounded-lg bg-muted/30">
                      <p className="text-sm text-muted-foreground mb-1">Suggested Purchase</p>
                      <p className="text-2xl font-bold">
                        {selectedItem.suggested_quantity?.toFixed(1) || 'N/A'} units
                      </p>
                    </div>
                    <div className="p-4 border border-border/40 rounded-lg bg-muted/30">
                      <p className="text-sm text-muted-foreground mb-1">Urgency Level</p>
                      <div className="mt-2">
                        {getUrgencyBadge(selectedItem.urgency)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default PatternInsights;
