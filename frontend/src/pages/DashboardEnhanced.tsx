/**
 * Enhanced Dashboard Page
 * Central hub with real-time stats, inventory overview, and quick actions
 */

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Home, Package, Receipt, ChefHat, LogOut, TrendingUp, AlertTriangle, ShoppingCart, Calendar, Settings } from 'lucide-react';

import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import ReceiptScanner from '@/components/ReceiptScanner';
import InventoryListEnhanced from '@/components/InventoryListEnhanced';
import RecipeGenerator from '@/components/RecipeGenerator';
import SavedRecipes from '@/components/SavedRecipes';
import SmartShoppingList from '@/components/SmartShoppingList';
import PatternInsights from '@/components/PatternInsights';
import PatternSummaryCards from '@/components/PatternSummaryCards';
import api from '@/lib/api';

interface InventoryItem {
  id: number;
  item_name: string;
  category: string;
  quantity: number;
  unit: string;
  status: string;
  added_date: string;
  expiry_date?: string;
}

const DashboardEnhanced = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('inventory');

  // Fetch inventory for stats (only active items)
  const { data: items } = useQuery<InventoryItem[]>({
    queryKey: ['inventory'],
    queryFn: async () => {
      const response = await api.get('/api/inventory/list', {
        params: { status_filter: 'active' }
      });
      return response.data;
    },
  });

  // Calculate stats
  const stats = useMemo(() => {
    if (!items) return { total: 0, lowStock: 0, expiringSoon: 0, categories: 0 };

    const total = items.length;
    
    // Low stock: items with quantity <= 1 or less than 100g/ml
    const lowStock = items.filter(item => {
      if (item.unit === 'kg' || item.unit === 'liters') {
        return item.quantity <= 0.5;
      } else if (item.unit === 'grams' || item.unit === 'ml') {
        return item.quantity <= 100;
      } else {
        return item.quantity <= 1;
      }
    }).length;

    // Expiring soon: items expiring within 7 days
    const expiringSoon = items.filter(item => {
      if (!item.expiry_date) return false;
      const daysUntilExpiry = Math.ceil(
        (new Date(item.expiry_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );
      return daysUntilExpiry >= 0 && daysUntilExpiry <= 7;
    }).length;

    // Unique categories
    const categories = new Set(items.map(item => item.category)).size;

    return { total, lowStock, expiringSoon, categories };
  }, [items]);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: 'Signed Out',
        description: 'You have been successfully signed out.',
      });
      navigate('/');
    } catch (error) {
      toast({
        title: 'Sign Out Failed',
        description: 'An error occurred while signing out.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-page texture-overlay bg-gradient-orbs">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur-md sticky top-0 z-40 shadow-soft">
        <div className="container mx-auto px-4 py-4 lg:py-5">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                <Home className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground tracking-tight">Kleio.ai</h1>
                <p className="text-xs text-muted-foreground">Smart Inventory</p>
              </div>
            </div>

            {/* User Info & Actions */}
            <div className="flex items-center gap-3">
              <div className="text-right hidden md:block">
                <p className="text-sm font-medium text-foreground">{user?.email}</p>
                <p className="text-xs text-muted-foreground">Welcome back!</p>
              </div>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => navigate('/settings')}
                className="border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all"
              >
                <Settings className="w-4 h-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSignOut}
                className="border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all"
              >
                <LogOut className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 lg:py-12 max-w-7xl">
        {/* Pattern Summary - Always Visible */}
        <div className="mb-8 lg:mb-12">
          <PatternSummaryCards />
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8 lg:mb-12">
          <Card className="group hover:shadow-medium hover:-translate-y-1 transition-all duration-300 border-border/40 bg-card/80 backdrop-blur-sm overflow-hidden shadow-soft">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between mb-3">
                <CardDescription className="text-xs sm:text-sm font-medium text-muted-foreground">Total Items</CardDescription>
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Package className="w-5 h-5 text-primary" />
                </div>
              </div>
              <CardTitle className="text-3xl lg:text-4xl font-bold text-foreground">{stats.total}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground">
                {stats.categories} {stats.categories === 1 ? 'category' : 'categories'}
              </p>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-medium hover:-translate-y-1 transition-all duration-300 border-border/40 bg-card/80 backdrop-blur-sm overflow-hidden border-l-4 border-l-secondary shadow-soft">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between mb-3">
                <CardDescription className="text-xs sm:text-sm font-medium text-muted-foreground">Low Stock</CardDescription>
                <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <AlertTriangle className="w-5 h-5 text-secondary" />
                </div>
              </div>
              <CardTitle className="text-3xl lg:text-4xl font-bold text-foreground">{stats.lowStock}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground">
                {stats.lowStock > 0 ? 'Need restocking' : 'All good!'}
              </p>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-medium hover:-translate-y-1 transition-all duration-300 border-border/40 bg-card/80 backdrop-blur-sm overflow-hidden border-l-4 border-l-accent shadow-soft">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between mb-3">
                <CardDescription className="text-xs sm:text-sm font-medium text-muted-foreground">Expiring Soon</CardDescription>
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Calendar className="w-5 h-5 text-accent" />
                </div>
              </div>
              <CardTitle className="text-3xl lg:text-4xl font-bold text-foreground">{stats.expiringSoon}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground">
                {stats.expiringSoon > 0 ? 'Within 7 days' : 'None expiring'}
              </p>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-medium hover:-translate-y-1 transition-all duration-300 border-border/40 bg-card/80 backdrop-blur-sm overflow-hidden border-l-4 border-l-primary shadow-soft">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between mb-3">
                <CardDescription className="text-xs sm:text-sm font-medium text-muted-foreground">Recipes</CardDescription>
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <ChefHat className="w-5 h-5 text-primary" />
                </div>
              </div>
              <CardTitle className="text-3xl lg:text-4xl font-bold text-foreground">
                {stats.total > 0 ? '∞' : '0'}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground">
                {stats.total > 0 ? 'AI-generated' : 'Add items first'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6 lg:space-y-8">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-flex gap-2 bg-muted/40 backdrop-blur-sm p-1.5 rounded-xl border border-border/40 shadow-soft">
            <TabsTrigger 
              value="inventory" 
              className="text-xs sm:text-sm data-[state=active]:bg-background data-[state=active]:shadow-soft data-[state=active]:text-primary transition-all duration-200 rounded-lg"
            >
              <Package className="w-4 h-4 mr-1.5 sm:mr-2" />
              <span className="hidden sm:inline">Inventory</span>
            </TabsTrigger>
            <TabsTrigger 
              value="scan-receipt" 
              className="text-xs sm:text-sm data-[state=active]:bg-background data-[state=active]:shadow-soft data-[state=active]:text-primary transition-all duration-200 rounded-lg"
            >
              <Receipt className="w-4 h-4 mr-1.5 sm:mr-2" />
              <span className="hidden sm:inline">Scan</span>
            </TabsTrigger>
            <TabsTrigger 
              value="recipes" 
              className="text-xs sm:text-sm data-[state=active]:bg-background data-[state=active]:shadow-soft data-[state=active]:text-primary transition-all duration-200 rounded-lg"
            >
              <ChefHat className="w-4 h-4 mr-1.5 sm:mr-2" />
              <span className="hidden sm:inline">Recipes</span>
            </TabsTrigger>
            <TabsTrigger 
              value="shopping" 
              className="text-xs sm:text-sm data-[state=active]:bg-background data-[state=active]:shadow-soft data-[state=active]:text-primary transition-all duration-200 rounded-lg"
            >
              <ShoppingCart className="w-4 h-4 mr-1.5 sm:mr-2" />
              <span className="hidden sm:inline">Shopping</span>
            </TabsTrigger>
            <TabsTrigger 
              value="insights" 
              className="text-xs sm:text-sm data-[state=active]:bg-background data-[state=active]:shadow-soft data-[state=active]:text-primary transition-all duration-200 rounded-lg"
            >
              <TrendingUp className="w-4 h-4 mr-1.5 sm:mr-2" />
              <span className="hidden sm:inline">Insights</span>
            </TabsTrigger>
          </TabsList>

          {/* Inventory Tab */}
          <TabsContent value="inventory" className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl lg:text-3xl font-bold text-foreground leading-tight">Your Inventory</h2>
              <p className="text-base text-muted-foreground">Manage your household items</p>
            </div>
            <InventoryListEnhanced />
          </TabsContent>

          {/* Scan Receipt Tab */}
          <TabsContent value="scan-receipt" className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl lg:text-3xl font-bold text-foreground leading-tight">Scan Receipt</h2>
              <p className="text-base text-muted-foreground">Upload a photo to extract items automatically</p>
            </div>
            <ReceiptScanner onSuccess={() => setActiveTab('inventory')} />
          </TabsContent>

          {/* Recipes Tab with Sub-tabs */}
          <TabsContent value="recipes" className="space-y-6">
            <Tabs defaultValue="generate" className="space-y-6">
              <div className="border-b border-border/50">
                <TabsList className="bg-transparent border-0 gap-2">
                  <TabsTrigger 
                    value="generate" 
                    className="data-[state=active]:bg-background data-[state=active]:shadow-soft data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-lg transition-all duration-200"
                  >
                    Generate Recipe
                  </TabsTrigger>
                  <TabsTrigger 
                    value="saved"
                    className="data-[state=active]:bg-background data-[state=active]:shadow-soft data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-lg transition-all duration-200"
                  >
                    Saved Recipes
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="generate" className="space-y-6">
                <div className="space-y-2">
                  <h2 className="text-2xl lg:text-3xl font-bold text-foreground leading-tight">Generate Recipe</h2>
                  <p className="text-base text-muted-foreground">AI-powered recipes based on your inventory</p>
                </div>
                <RecipeGenerator />
              </TabsContent>

              <TabsContent value="saved" className="space-y-6">
                <div className="space-y-2">
                  <h2 className="text-2xl lg:text-3xl font-bold text-foreground leading-tight">Saved Recipes</h2>
                  <p className="text-base text-muted-foreground">Your personal recipe collection</p>
                </div>
                <SavedRecipes />
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* Shopping Tab */}
          <TabsContent value="shopping" className="space-y-6">
            {/* <div className="space-y-2">
              <h2 className="text-2xl lg:text-3xl font-bold text-foreground leading-tight">Smart Shopping List</h2>
              <p className="text-base text-muted-foreground">AI-powered suggestions based on your needs</p>
            </div> */}
            <SmartShoppingList />
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights" className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl lg:text-3xl font-bold text-foreground leading-tight">Consumption Patterns</h2>
              <p className="text-base text-muted-foreground">Analyze your household's consumption habits</p>
            </div>
            <PatternInsights />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default DashboardEnhanced;
