/**
 * Add Item Dialog
 * Manual form to add inventory items
 */

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Package, Tag, Scale, Calendar as CalendarIcon, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';

interface AddItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CATEGORIES = [
  'Vegetables', 'Fruits', 'Dairy', 'Grains', 'Pulses', 'Spices', 
  'Oils', 'Snacks', 'Beverages', 'Meat', 'Seafood', 'Bakery', 
  'Frozen', 'Condiments', 'Others'
];

const UNITS = [
  'kg', 'grams', 'liters', 'ml', 'pieces', 'packets', 
  'dozens', 'bunches', 'cans', 'bottles'
];

const AddItemDialog = ({ open, onOpenChange }: AddItemDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    item_name: '',
    category: '',
    quantity: '',
    unit: '',
    expiry_date: '',
  });

  const addItemMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/api/inventory/add', {
        ...data,
        quantity: parseFloat(data.quantity),
        expiry_date: data.expiry_date || null,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toast({
        title: 'Item Added!',
        description: 'Item has been added to your inventory.',
      });
      resetForm();
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to Add Item',
        description: error.message || 'Please try again.',
        variant: 'destructive',
      });
    },
  });

  const resetForm = () => {
    setFormData({
      item_name: '',
      category: '',
      quantity: '',
      unit: '',
      expiry_date: '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.item_name || !formData.category || !formData.quantity || !formData.unit) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    addItemMutation.mutate(formData);
  };

  const handleCancel = () => {
    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
              <Plus className="w-4 h-4 text-primary" />
            </div>
            Add New Item
          </DialogTitle>
          <DialogDescription>
            Add an item to your inventory manually
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Item Name */}
          <div className="space-y-2.5">
            <Label htmlFor="item_name" className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Package className="w-4 h-4 text-primary" />
              Item Name *
            </Label>
            <Input
              id="item_name"
              placeholder="e.g., Tomatoes, Rice, Milk"
              value={formData.item_name}
              onChange={(e) => setFormData({ ...formData, item_name: e.target.value })}
              disabled={addItemMutation.isPending}
              className="border-border/50 focus:border-primary/50"
            />
          </div>

          {/* Category */}
          <div className="space-y-2.5">
            <Label htmlFor="category" className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Tag className="w-4 h-4 text-primary" />
              Category *
            </Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
              disabled={addItemMutation.isPending}
            >
              <SelectTrigger className="border-border/50 focus:border-primary/50">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat.toLowerCase()}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Quantity & Unit */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2.5">
              <Label htmlFor="quantity" className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Scale className="w-4 h-4 text-primary" />
                Quantity *
              </Label>
              <Input
                id="quantity"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="1.5"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                disabled={addItemMutation.isPending}
                className="border-border/50 focus:border-primary/50"
              />
            </div>
            <div className="space-y-2.5">
              <Label htmlFor="unit" className="text-sm font-medium text-foreground">Unit *</Label>
              <Select
                value={formData.unit}
                onValueChange={(value) => setFormData({ ...formData, unit: value })}
                disabled={addItemMutation.isPending}
              >
                <SelectTrigger className="border-border/50 focus:border-primary/50">
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  {UNITS.map((unit) => (
                    <SelectItem key={unit} value={unit}>
                      {unit}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Expiry Date */}
          <div className="space-y-2.5">
            <Label htmlFor="expiry_date" className="flex items-center gap-2 text-sm font-medium text-foreground">
              <CalendarIcon className="w-4 h-4 text-primary" />
              Expiry Date (Optional)
            </Label>
            <Input
              id="expiry_date"
              type="date"
              value={formData.expiry_date}
              onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
              disabled={addItemMutation.isPending}
              className="border-border/50 focus:border-primary/50"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={addItemMutation.isPending}
              className="border-border/50 hover:border-primary/30 hover:bg-primary/5"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={addItemMutation.isPending}
              variant="hero"
              className="shadow-colored"
            >
              {addItemMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Item
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddItemDialog;
