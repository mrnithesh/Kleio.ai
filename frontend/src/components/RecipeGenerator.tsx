/**
 * Recipe Generator Component
 * Generate AI recipes based on inventory
 */

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { ChefHat, Sparkles, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';
import RecipeCard from './RecipeCard';
import RecipeDetailDialog from './RecipeDetailDialog';

interface RecipeIngredient {
  item: string;
  quantity: number;
  unit: string;
  available: boolean;
  note?: string;
}

interface Recipe {
  recipe_name: string;
  description: string;
  cooking_time_minutes: number;
  difficulty: string;
  cuisine: string;
  servings: number;
  ingredients: RecipeIngredient[];
  instructions: string[];
  tips: string[];
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
}

interface InventoryItem {
  id: number;
  item_name: string;
  quantity: number;
  unit: string;
}

const RecipeGenerator = () => {
  const { toast } = useToast();
  
  const [cookingTime, setCookingTime] = useState<string>('45');
  const [mealType, setMealType] = useState<string>('any');
  const [cuisine, setCuisine] = useState<string>('Indian');
  const [mustUseItems, setMustUseItems] = useState<string[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [generatedRecipe, setGeneratedRecipe] = useState<Recipe | null>(null);

  // Fetch inventory
  const { data: inventory, isLoading: inventoryLoading } = useQuery<InventoryItem[]>({
    queryKey: ['inventory'],
    queryFn: async () => {
      const response = await api.get('/api/inventory/list', {
        params: { status_filter: 'active' }
      });
      return response.data;
    },
  });

  // Generate recipe mutation
  const generateRecipeMutation = useMutation({
    mutationFn: async (filters: { 
      cooking_time: number; 
      meal_type: string; 
      cuisine: string;
      must_use_items?: string[];
    }) => {
      const response = await api.post('/api/ai/generate-recipe', filters);
      return response.data;
    },
    onSuccess: (data: Recipe) => {
      setGeneratedRecipe(data);
      toast({
        title: 'Recipe Generated!',
        description: `Check out "${data.recipe_name}" below.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to Generate Recipe',
        description: error.message || 'Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleGenerateRecipe = () => {
    if (!inventory || inventory.length === 0) {
      toast({
        title: 'No Inventory Items',
        description: 'Please add items to your inventory first.',
        variant: 'destructive',
      });
      return;
    }

    const filters: any = {
      cooking_time: parseInt(cookingTime),
      meal_type: mealType,
      cuisine: cuisine,
    };

    // Add must_use_items only if not empty
    if (mustUseItems.length > 0) {
      filters.must_use_items = mustUseItems;
    }

    generateRecipeMutation.mutate(filters);
  };

  const handleToggleMustUseItem = (itemName: string) => {
    setMustUseItems(prev => 
      prev.includes(itemName) 
        ? prev.filter(i => i !== itemName)
        : [...prev, itemName]
    );
  };

  const handleViewRecipe = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setDetailDialogOpen(true);
  };

  if (inventoryLoading) {
    return (
      <Card className="border-border/40 shadow-medium bg-card/80 backdrop-blur-sm">
        <CardContent className="pt-6">
          <div className="space-y-3">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!inventory || inventory.length === 0) {
    return (
      <Card className="border-border/40 shadow-medium bg-card/80 backdrop-blur-sm">
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <ChefHat className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Inventory Items</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Add items to your inventory first, then generate delicious recipes!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Recipe Filters */}
        <Card className="border-border/40 shadow-medium bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Generate AI Recipe
            </CardTitle>
            <CardDescription>
              Get personalized recipe suggestions based on your {inventory.length} available items
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Cooking Time */}
              <div className="space-y-2">
                <Label htmlFor="cooking-time">Cooking Time</Label>
                <Select value={cookingTime} onValueChange={setCookingTime}>
                  <SelectTrigger id="cooking-time">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="90">1.5 hours</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Meal Type */}
              <div className="space-y-2">
                <Label htmlFor="meal-type">Meal Type</Label>
                <Select value={mealType} onValueChange={setMealType}>
                  <SelectTrigger id="meal-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any</SelectItem>
                    <SelectItem value="breakfast">Breakfast</SelectItem>
                    <SelectItem value="lunch">Lunch</SelectItem>
                    <SelectItem value="dinner">Dinner</SelectItem>
                    <SelectItem value="snack">Snack</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Cuisine */}
              <div className="space-y-2">
                <Label htmlFor="cuisine">Cuisine</Label>
                <Select value={cuisine} onValueChange={setCuisine}>
                  <SelectTrigger id="cuisine">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Indian">Indian</SelectItem>
                    <SelectItem value="North Indian">North Indian</SelectItem>
                    <SelectItem value="South Indian">South Indian</SelectItem>
                    <SelectItem value="Chinese">Chinese</SelectItem>
                    <SelectItem value="Continental">Continental</SelectItem>
                    <SelectItem value="Italian">Italian</SelectItem>
                    <SelectItem value="Mexican">Mexican</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Must Use Items (Optional) */}
            <div className="space-y-2 mt-6">
              <Label>Must-Use Ingredients (Optional)</Label>
              <p className="text-xs text-muted-foreground mb-2">
                Select specific items you want to use in the recipe
              </p>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 border rounded-md">
                {inventory && inventory.length > 0 ? (
                  inventory.slice(0, 30).map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleToggleMustUseItem(item.item_name)}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        mustUseItems.includes(item.item_name)
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted hover:bg-muted/80'
                      }`}
                    >
                      {item.item_name}
                    </button>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">No items available</span>
                )}
              </div>
              {mustUseItems.length > 0 && (
                <p className="text-xs text-primary font-medium">
                  {mustUseItems.length} item{mustUseItems.length > 1 ? 's' : ''} selected
                </p>
              )}
            </div>

            <Button 
              onClick={handleGenerateRecipe} 
              disabled={generateRecipeMutation.isPending}
              className="w-full mt-6"
              size="lg"
            >
              {generateRecipeMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generating Recipe...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Generate Recipe
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Generated Recipe */}
        {generatedRecipe && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">Your Recipe</h3>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleGenerateRecipe}
                disabled={generateRecipeMutation.isPending}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Generate Another
              </Button>
            </div>
            <RecipeCard 
              recipe={generatedRecipe} 
              onViewDetails={() => handleViewRecipe(generatedRecipe)}
            />
          </div>
        )}

        {/* Help Text */}
        {!generatedRecipe && !generateRecipeMutation.isPending && (
          <Card className="border-dashed border-border/40 bg-card/50 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="text-center py-8 text-muted-foreground">
                <ChefHat className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">
                  Click "Generate Recipe" to get AI-powered cooking suggestions
                </p>
                <p className="text-xs mt-1">
                  Recipes are personalized based on your available ingredients
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Inventory Summary */}
        <Card className="border-border/40 shadow-medium bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-base">Your Current Inventory</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {inventory.slice(0, 20).map((item) => (
                <span 
                  key={item.id} 
                  className="px-3 py-1 bg-muted rounded-full text-sm"
                >
                  {item.item_name} ({item.quantity} {item.unit})
                </span>
              ))}
              {inventory.length > 20 && (
                <span className="px-3 py-1 bg-muted rounded-full text-sm font-medium">
                  +{inventory.length - 20} more items
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recipe Detail Dialog */}
      <RecipeDetailDialog 
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        recipe={selectedRecipe}
        onSave={() => {
          toast({
            title: 'Recipe Saved!',
            description: 'You can find it in your saved recipes.',
          });
        }}
      />
    </>
  );
};

export default RecipeGenerator;
