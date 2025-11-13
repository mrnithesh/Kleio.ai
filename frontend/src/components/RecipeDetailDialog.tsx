/**
 * Recipe Detail Dialog
 * Full recipe view with instructions and mark as used
 */

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock, Users, ChefHat, Check, X, Lightbulb, Loader2, Flame, Heart, BookmarkPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';

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

interface RecipeDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipe: Recipe | null;
  onSave?: () => void;
}

const RecipeDetailDialog = ({ open, onOpenChange, recipe, onSave }: RecipeDetailDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [markingUsed, setMarkingUsed] = useState(false);
  const [saving, setSaving] = useState(false);

  // Mark items as used mutation
  const markItemsUsedMutation = useMutation({
    mutationFn: async (items: RecipeIngredient[]) => {
      // Get current inventory
      const inventoryResponse = await api.get('/api/inventory/list', {
        params: { status_filter: 'active' }
      });
      const inventory = inventoryResponse.data;

      // For each available ingredient, find matching inventory item and mark as used
      const promises = items
        .filter(i => i.available)
        .map(async (ingredient) => {
          // Find inventory item by name (case-insensitive)
          const inventoryItem = inventory.find(
            (item: any) => item.item_name.toLowerCase() === ingredient.item.toLowerCase()
          );

          if (inventoryItem) {
            try {
              // Mark the quantity from recipe as used
              await api.post(`/api/inventory/${inventoryItem.id}/mark-used`, {
                quantity_used: ingredient.quantity
              });
            } catch (error) {
              console.error(`Failed to mark ${ingredient.item} as used:`, error);
            }
          }
        });

      await Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toast({
        title: 'Ingredients Marked!',
        description: 'Items have been marked as used in your inventory.',
      });
      setMarkingUsed(false);
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to Mark Items',
        description: error.message || 'Please try again.',
        variant: 'destructive',
      });
      setMarkingUsed(false);
    },
  });

  const handleMarkAsUsed = () => {
    if (!recipe) return;
    const availableCount = recipe.ingredients.filter(i => i.available).length;
    if (confirm(`Mark ${availableCount} available ingredients as used in your inventory?`)) {
      setMarkingUsed(true);
      markItemsUsedMutation.mutate(recipe.ingredients);
    }
  };

  const handleSaveRecipe = async () => {
    if (!recipe) return;
    setSaving(true);
    try {
      await api.post('/api/recipes/save', {
        recipe_data: recipe
      });
      toast({
        title: 'Recipe Saved!',
        description: `"${recipe.recipe_name}" has been added to your collection.`,
      });
      if (onSave) onSave();
    } catch (error: any) {
      toast({
        title: 'Failed to Save',
        description: error.message || 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors: Record<string, string> = {
      'easy': 'bg-primary/10 text-primary border-primary/20',
      'medium': 'bg-accent/10 text-accent border-accent/20',
      'hard': 'bg-secondary/10 text-secondary border-secondary/20',
    };
    return colors[difficulty?.toLowerCase()] || 'bg-muted text-muted-foreground border-border/50';
  };

  if (!recipe) return null;

  const availableIngredients = recipe.ingredients.filter(i => i.available);
  const missingIngredients = recipe.ingredients.filter(i => !i.available);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-start justify-between gap-3">
            <div>
              <DialogTitle className="text-2xl">{recipe.recipe_name}</DialogTitle>
              <DialogDescription className="mt-1">{recipe.description}</DialogDescription>
            </div>
            <Badge className={`${getDifficultyColor(recipe.difficulty)} border rounded-lg px-2.5 py-1 text-xs font-medium`} variant="outline">
              {recipe.difficulty}
            </Badge>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6">
            {/* Meta Info */}
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-md">
                <Clock className="w-4 h-4 text-primary" />
                <span className="font-medium">{recipe.cooking_time_minutes} minutes</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-md">
                <Users className="w-4 h-4 text-primary" />
                <span className="font-medium">{recipe.servings} servings</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-md">
                <ChefHat className="w-4 h-4 text-primary" />
                <span className="font-medium">{recipe.cuisine}</span>
              </div>
            </div>

            {/* Nutrition */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-4 bg-muted rounded-lg">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-secondary mb-1">
                  <Flame className="w-4 h-4" />
                </div>
                <div className="text-lg font-bold text-foreground">{recipe.nutrition.calories}</div>
                <div className="text-xs text-muted-foreground">Calories</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold">{recipe.nutrition.protein}g</div>
                <div className="text-xs text-muted-foreground">Protein</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold">{recipe.nutrition.carbs}g</div>
                <div className="text-xs text-muted-foreground">Carbs</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold">{recipe.nutrition.fat}g</div>
                <div className="text-xs text-muted-foreground">Fat</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold">{recipe.nutrition.fiber}g</div>
                <div className="text-xs text-muted-foreground">Fiber</div>
              </div>
            </div>

            <Separator />

            {/* Ingredients */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Ingredients</h3>
              
              {/* Available Ingredients */}
              {availableIngredients.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    You have ({availableIngredients.length})
                  </p>
                  <ul className="space-y-2">
                    {availableIngredients.map((ingredient, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>
                          <span className="font-medium">{ingredient.item}</span>
                          {' - '}
                          <span className="text-muted-foreground">
                            {ingredient.quantity} {ingredient.unit}
                          </span>
                          {ingredient.note && (
                            <span className="text-xs text-muted-foreground italic ml-2">
                              ({ingredient.note})
                            </span>
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Missing Ingredients */}
              {missingIngredients.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                    <X className="w-4 h-4 text-secondary" />
                    You need to buy ({missingIngredients.length})
                  </p>
                  <ul className="space-y-2">
                    {missingIngredients.map((ingredient, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <X className="w-4 h-4 text-secondary mt-0.5 flex-shrink-0" />
                        <span>
                          <span className="font-medium">{ingredient.item}</span>
                          {' - '}
                          <span className="text-muted-foreground">
                            {ingredient.quantity} {ingredient.unit}
                          </span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <Separator />

            {/* Instructions */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Instructions</h3>
              <ol className="space-y-3">
                {recipe.instructions.map((instruction, idx) => (
                  <li key={idx} className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                      {idx + 1}
                    </span>
                    <span className="text-sm leading-relaxed pt-0.5">{instruction}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Tips */}
            {recipe.tips && recipe.tips.length > 0 && (
              <>
                <Separator />
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-accent" />
                    Tips
                  </h3>
                  <ul className="space-y-2">
                    {recipe.tips.map((tip, idx) => (
                      <li key={idx} className="flex gap-2 text-sm">
                        <span className="text-accent font-bold">•</span>
                        <span className="text-foreground">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <div className="flex gap-2 flex-1">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1 sm:flex-initial">
              Close
            </Button>
            <Button 
              variant="outline"
              onClick={handleSaveRecipe} 
              disabled={saving}
              className="flex-1 sm:flex-initial"
            >
              {saving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <BookmarkPlus className="mr-2 h-4 w-4" />
              )}
              Save Recipe
            </Button>
          </div>
          {availableIngredients.length > 0 && (
            <Button 
              onClick={handleMarkAsUsed} 
              disabled={markingUsed}
              className="w-full sm:w-auto"
            >
              {markingUsed ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Marking...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Mark Ingredients as Used
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RecipeDetailDialog;
