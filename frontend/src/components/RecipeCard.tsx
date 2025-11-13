/**
 * Recipe Card Component
 * Display recipe summary with available ingredients
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, ChefHat, Users, Check, X, Flame, Dumbbell, Wheat } from 'lucide-react';

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

interface RecipeCardProps {
  recipe: Recipe;
  onViewDetails: () => void;
  compact?: boolean;
}

const RecipeCard = ({ recipe, onViewDetails, compact = false }: RecipeCardProps) => {
  const availableCount = recipe.ingredients.filter(i => i.available).length;
  const totalCount = recipe.ingredients.length;
  const availabilityPercentage = Math.round((availableCount / totalCount) * 100);

  const getDifficultyColor = (difficulty: string) => {
    const colors: Record<string, string> = {
      'easy': 'bg-primary/10 text-primary border-primary/20',
      'medium': 'bg-accent/10 text-accent border-accent/20',
      'hard': 'bg-secondary/10 text-secondary border-secondary/20',
    };
    return colors[difficulty.toLowerCase()] || 'bg-muted text-muted-foreground border-border/50';
  };

  return (
    <Card className="hover:shadow-medium hover:-translate-y-1 transition-all duration-300 cursor-pointer border-border/40 bg-card/80 backdrop-blur-sm shadow-soft" onClick={onViewDetails}>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <CardTitle className="text-lg sm:text-xl">{recipe.recipe_name}</CardTitle>
            <CardDescription className="mt-1">{recipe.description}</CardDescription>
          </div>
          <Badge className={`${getDifficultyColor(recipe.difficulty)} border rounded-lg px-2.5 py-1 text-xs font-medium`} variant="outline">
            {recipe.difficulty}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Recipe Meta */}
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{recipe.cooking_time_minutes} mins</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{recipe.servings} servings</span>
          </div>
          <div className="flex items-center gap-1">
            <ChefHat className="w-4 h-4" />
            <span>{recipe.cuisine}</span>
          </div>
        </div>

        {/* Ingredient Availability */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-foreground">Ingredients</span>
            <span className={`font-semibold ${
              availabilityPercentage >= 80 ? 'text-primary' : 
              availabilityPercentage >= 50 ? 'text-accent' : 
              'text-secondary'
            }`}>
              {availableCount}/{totalCount} available
            </span>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div 
              className={`h-2 rounded-full transition-all ${
                availabilityPercentage >= 80 ? 'bg-primary' : 
                availabilityPercentage >= 50 ? 'bg-accent' : 
                'bg-secondary'
              }`}
              style={{ width: `${availabilityPercentage}%` }}
            />
          </div>

          {/* Ingredient Preview (compact) */}
          {!compact && (
            <div className="flex flex-wrap gap-2 mt-3">
              {recipe.ingredients.slice(0, 6).map((ingredient, idx) => (
                <Badge 
                  key={idx} 
                  variant="outline"
                  className={`text-xs border rounded-lg px-2 py-0.5 ${
                    ingredient.available 
                      ? 'bg-primary/10 text-primary border-primary/20' 
                      : 'bg-muted/50 text-muted-foreground border-border/50'
                  }`}
                >
                  {ingredient.available ? (
                    <Check className="w-3 h-3 mr-1" />
                  ) : (
                    <X className="w-3 h-3 mr-1" />
                  )}
                  {ingredient.item}
                </Badge>
              ))}
              {recipe.ingredients.length > 6 && (
                <Badge variant="secondary" className="text-xs">
                  +{recipe.ingredients.length - 6} more
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Nutrition */}
        {!compact && (
          <div className="flex gap-4 text-xs text-muted-foreground border-t border-border/30 pt-3">
            <span className="flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-secondary" />
              {recipe.nutrition.calories} cal
            </span>
            <span className="flex items-center gap-1.5">
              <Dumbbell className="w-3.5 h-3.5 text-primary" />
              {recipe.nutrition.protein}g protein
            </span>
            <span className="flex items-center gap-1.5">
              <Wheat className="w-3.5 h-3.5 text-accent" />
              {recipe.nutrition.carbs}g carbs
            </span>
          </div>
        )}

        {/* View Button */}
        <Button className="w-full" variant="outline" onClick={onViewDetails}>
          View Recipe
        </Button>
      </CardContent>
    </Card>
  );
};

export default RecipeCard;
