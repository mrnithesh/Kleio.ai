/**
 * Saved Recipes Component
 * View and manage user's saved recipes with current ingredient availability
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { BookOpen, Heart, Trash2, AlertCircle, Check, X, ChefHat } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';
import RecipeCard from './RecipeCard';
import RecipeDetailDialog from './RecipeDetailDialog';

interface SavedRecipe {
  id: number;
  recipe_name: string;
  description: string;
  cooking_time_minutes: number;
  difficulty: string;
  cuisine: string;
  servings: number;
  recipe_data: any;
  created_at: string;
  last_cooked: string | null;
  times_cooked: number;
  is_favorite: boolean;
}

const SavedRecipes = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedRecipe, setSelectedRecipe] = useState<any | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  // Fetch saved recipes
  const { data: savedRecipes, isLoading, error } = useQuery<SavedRecipe[]>({
    queryKey: ['savedRecipes'],
    queryFn: async () => {
      const response = await api.get('/api/recipes/list');
      return response.data;
    },
  });

  // Fetch current inventory
  const { data: inventory } = useQuery({
    queryKey: ['inventory'],
    queryFn: async () => {
      const response = await api.get('/api/inventory/list', {
        params: { status_filter: 'active' }
      });
      return response.data;
    },
  });

  // Delete recipe mutation
  const deleteRecipeMutation = useMutation({
    mutationFn: async (recipeId: number) => {
      await api.delete(`/api/recipes/${recipeId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savedRecipes'] });
      toast({
        title: 'Recipe Deleted',
        description: 'Recipe has been removed from your collection.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Delete Failed',
        description: error.message || 'Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Toggle favorite mutation
  const toggleFavoriteMutation = useMutation({
    mutationFn: async (recipeId: number) => {
      await api.post(`/api/recipes/${recipeId}/toggle-favorite`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savedRecipes'] });
    },
  });

  // Mark as cooked mutation
  const markCookedMutation = useMutation({
    mutationFn: async (recipeId: number) => {
      await api.post(`/api/recipes/${recipeId}/mark-cooked`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savedRecipes'] });
      toast({
        title: 'Recipe Marked!',
        description: 'Cooking count has been updated.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to Mark',
        description: error.message || 'Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleDelete = (recipeId: number, recipeName: string) => {
    if (confirm(`Delete "${recipeName}" from your saved recipes?`)) {
      deleteRecipeMutation.mutate(recipeId);
    }
  };

  const handleViewRecipe = (recipe: SavedRecipe) => {
    // Update ingredient availability based on current inventory
    const updatedRecipe = {
      ...recipe.recipe_data,
      ingredients: recipe.recipe_data.ingredients.map((ingredient: any) => {
        const inventoryItem = inventory?.find(
          (item: any) => item.item_name.toLowerCase() === ingredient.item.toLowerCase()
        );
        return {
          ...ingredient,
          available: !!inventoryItem && inventoryItem.quantity >= ingredient.quantity
        };
      })
    };

    setSelectedRecipe(updatedRecipe);
    setDetailDialogOpen(true);
  };

  const getAvailabilityStatus = (recipe: SavedRecipe) => {
    if (!inventory) return { available: 0, total: 0, percentage: 0 };

    const ingredients = recipe.recipe_data.ingredients;
    const available = ingredients.filter((ingredient: any) => {
      const inventoryItem = inventory.find(
        (item: any) => item.item_name.toLowerCase() === ingredient.item.toLowerCase()
      );
      return inventoryItem && inventoryItem.quantity >= ingredient.quantity;
    }).length;

    return {
      available,
      total: ingredients.length,
      percentage: Math.round((available / ingredients.length) * 100)
    };
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-48 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-border/40 shadow-medium bg-card/80 backdrop-blur-sm">
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center border border-destructive/20">
              <AlertCircle className="w-8 h-8 text-destructive" />
            </div>
            <h3 className="text-lg lg:text-xl font-semibold text-foreground mb-2">Failed to Load Recipes</h3>
            <p className="text-sm text-muted-foreground">
              {(error as any).message || 'Please try again later.'}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!savedRecipes || savedRecipes.length === 0) {
    return (
      <Card className="border-border/40 shadow-medium bg-card/80 backdrop-blur-sm">
        <CardContent className="pt-6">
          <div className="text-center py-12 lg:py-16">
            <div className="w-20 h-20 mx-auto mb-6 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
              <BookOpen className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-xl lg:text-2xl font-bold text-foreground mb-2">No Saved Recipes Yet</h3>
            <p className="text-base text-muted-foreground mb-8 max-w-md mx-auto">
              Generate recipes and click "Save Recipe" to build your collection
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold">Your Recipe Collection</h3>
            <p className="text-sm text-muted-foreground">
              {savedRecipes.length} {savedRecipes.length === 1 ? 'recipe' : 'recipes'} saved
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {savedRecipes.map((recipe) => {
            const availability = getAvailabilityStatus(recipe);
            const canCook = availability.percentage >= 80;

            return (
              <Card key={recipe.id} className="hover:shadow-medium hover:-translate-y-1 transition-all duration-300 border-border/40 bg-card/80 backdrop-blur-sm shadow-soft">
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {recipe.recipe_name}
                        {recipe.is_favorite && (
                          <Heart className="w-4 h-4 fill-destructive text-destructive" />
                        )}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {recipe.description}
                      </p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Recipe Meta */}
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span>{recipe.cooking_time_minutes} mins</span>
                    <span>•</span>
                    <span>{recipe.servings} servings</span>
                    <span>•</span>
                    <span>{recipe.difficulty}</span>
                    {recipe.times_cooked > 0 && (
                      <>
                        <span>•</span>
                        <span>Cooked {recipe.times_cooked}x</span>
                      </>
                    )}
                  </div>

                  {/* Ingredient Availability */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-foreground">Ingredients</span>
                      <span className={`font-semibold flex items-center gap-1.5 ${
                        canCook ? 'text-primary' : 'text-secondary'
                      }`}>
                        {canCook ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                        {availability.available}/{availability.total} available
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                      <div 
                        className={`h-2 rounded-full transition-all ${
                          canCook ? 'bg-primary' : 'bg-secondary'
                        }`}
                        style={{ width: `${availability.percentage}%` }}
                      />
                    </div>

                    {canCook ? (
                      <p className="text-xs text-primary font-semibold flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5" />
                        You can cook this now!
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        Missing {availability.total - availability.available} ingredients
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => handleViewRecipe(recipe)}
                    >
                      View Recipe
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => markCookedMutation.mutate(recipe.id)}
                      title="Mark as cooked"
                    >
                      <ChefHat className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleFavoriteMutation.mutate(recipe.id)}
                      title={recipe.is_favorite ? "Remove from favorites" : "Add to favorites"}
                      className={recipe.is_favorite ? 'hover:bg-destructive/10 hover:text-destructive' : ''}
                    >
                      <Heart className={`w-4 h-4 transition-colors ${recipe.is_favorite ? 'fill-destructive text-destructive' : ''}`} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(recipe.id, recipe.recipe_name)}
                      title="Delete recipe"
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Recipe Detail Dialog */}
      <RecipeDetailDialog 
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        recipe={selectedRecipe}
      />
    </>
  );
};

export default SavedRecipes;
