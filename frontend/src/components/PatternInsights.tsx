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
  Sparkles,
  ShoppingCart
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
  
  // Calculate summary stats
  const urgentCount = itemsWithPatterns.filter(p => p.urgency === 'urgent').length;
  const thisWeekCount = itemsWithPatterns.filter(p => p.urgency === 'this_week').length;
  const highConfidenceCount = itemsWithPatterns.filter(p => p.confidence_level === 'high').length;
  const totalTracked = itemsWithPatterns.length;

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
            <BarChart3 className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground">Pattern Insights</h2>
            <p className="text-sm lg:text-base text-muted-foreground mt-0.5">
              Detailed usage patterns and predictions for {totalTracked} tracked {totalTracked === 1 ? 'item' : 'items'}
            </p>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      {itemsWithPatterns.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <Card className="border-border/40 bg-card/80 backdrop-blur-sm shadow-soft border-l-4 border-l-secondary">
            <CardContent className="p-4 lg:p-5">
              <div className="flex items-center justify-between mb-2">
                <div className="w-9 h-9 rounded-lg bg-secondary/10 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-secondary" />
                </div>
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">URGENT</span>
              </div>
              <div className="text-2xl lg:text-3xl font-bold text-foreground">{urgentCount}</div>
              <p className="text-xs text-muted-foreground mt-1">Need immediate attention</p>
            </CardContent>
          </Card>

          <Card className="border-border/40 bg-card/80 backdrop-blur-sm shadow-soft border-l-4 border-l-accent">
            <CardContent className="p-4 lg:p-5">
              <div className="flex items-center justify-between mb-2">
                <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-accent" />
                </div>
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">THIS WEEK</span>
              </div>
              <div className="text-2xl lg:text-3xl font-bold text-foreground">{thisWeekCount}</div>
              <p className="text-xs text-muted-foreground mt-1">Buy within 7 days</p>
            </CardContent>
          </Card>

          <Card className="border-border/40 bg-card/80 backdrop-blur-sm shadow-soft border-l-4 border-l-primary">
            <CardContent className="p-4 lg:p-5">
              <div className="flex items-center justify-between mb-2">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">HIGH CONF</span>
              </div>
              <div className="text-2xl lg:text-3xl font-bold text-foreground">{highConfidenceCount}</div>
              <p className="text-xs text-muted-foreground mt-1">Reliable predictions</p>
            </CardContent>
          </Card>

          <Card className="border-border/40 bg-card/80 backdrop-blur-sm shadow-soft border-l-4 border-l-accent">
            <CardContent className="p-4 lg:p-5">
              <div className="flex items-center justify-between mb-2">
                <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Package className="w-5 h-5 text-accent" />
                </div>
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">TRACKED</span>
              </div>
              <div className="text-2xl lg:text-3xl font-bold text-foreground">{totalTracked}</div>
              <p className="text-xs text-muted-foreground mt-1">Total items analyzed</p>
            </CardContent>
          </Card>
        </div>
      )}

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
              
              <CardContent className="space-y-4">
                {/* Days Until Depletion - Visual Indicator */}
                {item.days_until_depletion !== null && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground font-medium">Days Remaining</span>
                      <span className={`font-bold ${
                        item.days_until_depletion <= 1 ? 'text-secondary' : 
                        item.days_until_depletion <= 7 ? 'text-accent' : 
                        'text-primary'
                      }`}>
                        {Math.round(item.days_until_depletion)}d
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all rounded-full ${
                          item.days_until_depletion <= 1 ? 'bg-secondary' : 
                          item.days_until_depletion <= 7 ? 'bg-accent' : 
                          'bg-primary'
                        }`}
                        style={{ 
                          width: `${Math.min(100, Math.max(5, (item.days_until_depletion / 30) * 100))}%` 
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Pattern Info Grid */}
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border/30">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Activity className="w-3.5 h-3.5" />
                      <span>Frequency</span>
                    </div>
                    <p className="text-sm font-semibold text-foreground">
                      {item.avg_days_between_purchases 
                        ? `${Math.round(item.avg_days_between_purchases)}d`
                        : 'Building...'}
                    </p>
                  </div>
                  
                  {item.current_stock !== null && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Package className="w-3.5 h-3.5" />
                        <span>Stock</span>
                      </div>
                      <p className="text-sm font-semibold text-foreground">
                        {item.current_stock.toFixed(1)}
                      </p>
                    </div>
                  )}
                </div>

                {/* Confidence */}
                <div className="flex items-center justify-between pt-2 border-t border-border/30">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      item.confidence_level === 'high' ? 'bg-primary' :
                      item.confidence_level === 'medium' ? 'bg-accent' :
                      'bg-muted-foreground'
                    }`} />
                    <span className="text-xs font-medium text-muted-foreground capitalize">
                      {item.confidence_level} confidence
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
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <DialogTitle className="text-2xl capitalize flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                      <Package className="w-5 h-5 text-primary" />
                    </div>
                    <span>{selectedItem.item_name}</span>
                  </DialogTitle>
                  <DialogDescription className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="border-border/50">{selectedItem.category}</Badge>
                    <span className="text-xs text-muted-foreground">
                      Based on {selectedItem.data_points_count} data {selectedItem.data_points_count === 1 ? 'point' : 'points'}
                    </span>
                  </DialogDescription>
                </div>
                {getUrgencyBadge(selectedItem.urgency)}
              </div>
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
                  <CardTitle className="text-sm flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    Prediction Confidence
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold capitalize text-foreground">{selectedItem.confidence_level}</span>
                      <span className="text-sm text-muted-foreground">{getConfidenceStars(selectedItem.confidence_level)}</span>
                    </div>
                    <span className="text-sm font-bold text-foreground">{getConfidencePercentage(selectedItem.confidence_level)}%</span>
                  </div>
                  <Progress 
                    value={getConfidencePercentage(selectedItem.confidence_level)} 
                    className="h-2"
                  />
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className={`w-1.5 h-1.5 rounded-full ${
                      selectedItem.data_points_count >= 5 ? 'bg-primary' :
                      selectedItem.data_points_count >= 3 ? 'bg-accent' :
                      'bg-muted-foreground'
                    }`} />
                    <span>
                      {selectedItem.data_points_count < 3 && 'Need more data for accurate predictions'}
                      {selectedItem.data_points_count >= 3 && selectedItem.data_points_count < 5 && 'Building pattern confidence'}
                      {selectedItem.data_points_count >= 5 && 'Strong pattern detected'}
                    </span>
                  </div>
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
                  <div className="flex justify-between items-center p-4 border border-border/40 rounded-xl bg-muted/30 hover:bg-muted/40 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                        <Calendar className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">Purchase Frequency</p>
                        <p className="text-xs text-muted-foreground">How often you buy this item</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-foreground">
                        {selectedItem.avg_days_between_purchases 
                          ? Math.round(selectedItem.avg_days_between_purchases)
                          : 'N/A'}
                      </div>
                      <p className="text-xs text-muted-foreground font-medium">days</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-4 border border-border/40 rounded-xl bg-muted/30 hover:bg-muted/40 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center border border-accent/20">
                        <Package className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">Avg Purchase Quantity</p>
                        <p className="text-xs text-muted-foreground">Typical amount per purchase</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-foreground">
                        {selectedItem.avg_quantity_per_purchase?.toFixed(1) || 'N/A'}
                      </div>
                      <p className="text-xs text-muted-foreground font-medium">units</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-4 border border-border/40 rounded-xl bg-muted/30 hover:bg-muted/40 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center border border-secondary/20">
                        <Activity className="w-5 h-5 text-secondary" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">Daily Consumption</p>
                        <p className="text-xs text-muted-foreground">Average usage per day</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-foreground">
                        {selectedItem.avg_consumption_rate?.toFixed(2) || 'N/A'}
                      </div>
                      <p className="text-xs text-muted-foreground font-medium">units/day</p>
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
                    <div className="p-5 border border-border/40 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 hover:from-primary/10 hover:to-primary/15 transition-all">
                      <div className="flex items-center gap-2 mb-2">
                        <ShoppingCart className="w-4 h-4 text-primary" />
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Suggested Purchase</p>
                      </div>
                      <p className="text-3xl font-bold text-foreground">
                        {selectedItem.suggested_quantity?.toFixed(1) || 'N/A'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">units</p>
                    </div>
                    <div className="p-5 border border-border/40 rounded-xl bg-gradient-to-br from-accent/5 to-accent/10 hover:from-accent/10 hover:to-accent/15 transition-all">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="w-4 h-4 text-accent" />
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Urgency</p>
                      </div>
                      <div className="mt-3">
                        {getUrgencyBadge(selectedItem.urgency)}
                      </div>
                      {selectedItem.days_until_depletion !== null && (
                        <p className="text-xs text-muted-foreground mt-2">
                          {Math.round(selectedItem.days_until_depletion)} day{Math.round(selectedItem.days_until_depletion) !== 1 ? 's' : ''} remaining
                        </p>
                      )}
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
