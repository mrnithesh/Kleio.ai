/**
 * Edit Item Dialog
 * Edit existing inventory item
 */

import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Package, Scale, Calendar as CalendarIcon, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';

interface EditItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: {
    id: number;
    item_name: string;
    category: string;
    quantity: number;
    unit: string;
    expiry_date?: string;
  } | null;
}

const EditItemDialog = ({ open, onOpenChange, item }: EditItemDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    quantity: '',
    expiry_date: '',
  });

  useEffect(() => {
    if (item) {
      setFormData({
        quantity: item.quantity.toString(),
        expiry_date: item.expiry_date ? item.expiry_date.split('T')[0] : '',
      });
    }
  }, [item]);

  const updateItemMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.patch(`/api/inventory/${item?.id}/update`, {
        quantity: parseFloat(data.quantity),
        expiry_date: data.expiry_date || null,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toast({
        title: 'Item Updated!',
        description: 'Item has been updated successfully.',
      });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to Update Item',
        description: error.message || 'Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.quantity) {
      toast({
        title: 'Missing Information',
        description: 'Please enter a quantity.',
        variant: 'destructive',
      });
      return;
    }

    updateItemMutation.mutate(formData);
  };

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
              <Package className="w-4 h-4 text-primary" />
            </div>
            Edit Item
          </DialogTitle>
          <DialogDescription>
            Update quantity and expiry date for {item.item_name}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Item Info (Read-only) */}
          <div className="space-y-2.5">
            <Label className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Package className="w-4 h-4 text-primary" />
              Item Information
            </Label>
            <div className="px-4 py-3 bg-muted/50 border border-border/40 rounded-lg">
              <p className="font-semibold text-foreground capitalize">{item.item_name}</p>
              <p className="text-sm text-muted-foreground mt-1">
                Category: <span className="capitalize">{item.category}</span> • Unit: {item.unit}
              </p>
            </div>
          </div>

          {/* Quantity */}
          <div className="space-y-2.5">
            <Label htmlFor="edit-quantity" className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Scale className="w-4 h-4 text-primary" />
              Quantity *
            </Label>
            <Input
              id="edit-quantity"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="1.5"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              disabled={updateItemMutation.isPending}
              className="border-border/50 focus:border-primary/50"
            />
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              Current: <span className="font-medium text-foreground">{item.quantity} {item.unit}</span>
            </p>
          </div>

          {/* Expiry Date */}
          <div className="space-y-2.5">
            <Label htmlFor="edit-expiry" className="flex items-center gap-2 text-sm font-medium text-foreground">
              <CalendarIcon className="w-4 h-4 text-primary" />
              Expiry Date (Optional)
            </Label>
            <Input
              id="edit-expiry"
              type="date"
              value={formData.expiry_date}
              onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
              disabled={updateItemMutation.isPending}
              className="border-border/50 focus:border-primary/50"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updateItemMutation.isPending}
              className="border-border/50 hover:border-primary/30 hover:bg-primary/5"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={updateItemMutation.isPending}
              variant="hero"
              className="shadow-colored"
            >
              {updateItemMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Update Item
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditItemDialog;
