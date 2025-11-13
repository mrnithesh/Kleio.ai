/**
 * Receipt Scanner Component
 * Upload/capture receipt image and detect items with AI
 */

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Upload, Camera, Loader2, CheckCircle2, XCircle, Edit2, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';

interface DetectedItem {
  item_name: string;
  category: string;
  quantity: number;
  unit: string;
  price?: number;
  estimated_shelf_life_days?: number;
  expiry_date?: string;
}

interface ReceiptScannerProps {
  onSuccess?: () => void;
}

const ReceiptScanner = ({ onSuccess }: ReceiptScannerProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [detectedItems, setDetectedItems] = useState<DetectedItem[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [scanComplete, setScanComplete] = useState(false);

  // Parse receipt mutation
  const parseReceiptMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post('/api/ai/parse-receipt', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
    onSuccess: (data) => {
      const itemsWithExpiry = (data.items || []).map(item => {
        let expiry_date = undefined;
        if (item.estimated_shelf_life_days && item.estimated_shelf_life_days > 0) {
          const date = new Date();
          date.setDate(date.getDate() + item.estimated_shelf_life_days);
          expiry_date = date.toISOString().split('T')[0];
        }
        return { ...item, expiry_date };
      });
      setDetectedItems(itemsWithExpiry);
      setScanComplete(true);
      toast({
        title: 'Receipt Scanned Successfully!',
        description: `Found ${data.items?.length || 0} items. Review and confirm below.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Scan Failed',
        description: error.message || 'Failed to process receipt. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Confirm items mutation
  const confirmItemsMutation = useMutation({
    mutationFn: async (items: DetectedItem[]) => {
      const response = await api.post('/api/ai/confirm-receipt-items', {
        items: items,
      });
      return response.data;
    },
    onSuccess: (data) => {
      toast({
        title: 'Items Added!',
        description: `Successfully added ${data.items_processed} items to your inventory.`,
      });
      // Reset state
      setSelectedFile(null);
      setPreviewUrl(null);
      setDetectedItems([]);
      setScanComplete(false);
      // Invalidate inventory query to refresh
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      // Call success callback
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to Add Items',
        description: error.message || 'Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid File',
        description: 'Please upload an image file (JPG, PNG, etc.)',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'File Too Large',
        description: 'Please upload an image smaller than 10MB',
        variant: 'destructive',
      });
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setScanComplete(false);
    setDetectedItems([]);
  };

  const handleScan = () => {
    if (!selectedFile) return;
    parseReceiptMutation.mutate(selectedFile);
  };

  const handleRemoveItem = (index: number) => {
    setDetectedItems(items => items.filter((_, i) => i !== index));
  };

  const handleEditItem = (index: number, field: keyof DetectedItem, value: any) => {
    setDetectedItems(items =>
      items.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const handleConfirm = () => {
    if (detectedItems.length === 0) {
      toast({
        title: 'No Items',
        description: 'Please add at least one item before confirming.',
        variant: 'destructive',
      });
      return;
    }
    confirmItemsMutation.mutate(detectedItems);
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setDetectedItems([]);
    setScanComplete(false);
    setEditingIndex(null);
  };

  const isLoading = parseReceiptMutation.isPending || confirmItemsMutation.isPending;

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      {!scanComplete && (
        <Card className="border-border/40 shadow-medium bg-card/80 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* File Input */}
              <div className="space-y-2">
                <Label htmlFor="receipt-upload">Upload Receipt Image</Label>
                <Input
                  id="receipt-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  disabled={isLoading}
                  className="cursor-pointer"
                />
                <p className="text-sm text-muted-foreground">
                  Supported formats: JPG, PNG, WebP (max 10MB)
                </p>
              </div>

              {/* Preview */}
              {previewUrl && (
                <div className="space-y-3">
                  <Label>Preview</Label>
                  <div className="relative border rounded-lg overflow-hidden max-w-md mx-auto">
                    <img
                      src={previewUrl}
                      alt="Receipt preview"
                      className="w-full h-auto"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 justify-center">
                    <Button
                      onClick={handleScan}
                      disabled={isLoading}
                      size="lg"
                      className="min-w-[200px]"
                    >
                      {parseReceiptMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Scanning Receipt...
                        </>
                      ) : (
                        <>
                          <Camera className="mr-2 h-4 w-4" />
                          Scan Receipt
                        </>
                      )}
                    </Button>
                    <Button variant="outline" onClick={handleReset} disabled={isLoading}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* Upload Prompt */}
              {!previewUrl && (
                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                  <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg font-medium mb-2">Upload a receipt image</p>
                  <p className="text-sm text-muted-foreground">
                    Take a clear photo of your grocery receipt
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detected Items Section */}
      {scanComplete && detectedItems.length > 0 && (
        <Card className="border-border/40 shadow-medium bg-card/80 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                    Detected Items
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Review and edit before adding to inventory
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={handleReset}>
                  Scan Another
                </Button>
              </div>

              {/* Items Table */}
              <div className="border border-border/40 rounded-xl overflow-hidden shadow-soft bg-card/50">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40 border-b border-border/40">
                      <TableHead>Item Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead>Estimated Expiry Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {detectedItems.map((item, index) => (
                      <TableRow key={index} className="border-b border-border/20 hover:bg-muted/30 transition-colors">
                        <TableCell>
                          {editingIndex === index ? (
                            <Input
                              value={item.item_name}
                              onChange={(e) => handleEditItem(index, 'item_name', e.target.value)}
                              className="h-8"
                            />
                          ) : (
                            <span className="font-medium">{item.item_name}</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {editingIndex === index ? (
                            <Input
                              value={item.category}
                              onChange={(e) => handleEditItem(index, 'category', e.target.value)}
                              className="h-8"
                            />
                          ) : (
                            <Badge variant="secondary">{item.category}</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {editingIndex === index ? (
                            <Input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => handleEditItem(index, 'quantity', parseFloat(e.target.value))}
                              className="h-8 w-20 text-right"
                            />
                          ) : (
                            item.quantity
                          )}
                        </TableCell>
                        <TableCell>
                          {editingIndex === index ? (
                            <Input
                              value={item.unit}
                              onChange={(e) => handleEditItem(index, 'unit', e.target.value)}
                              className="h-8 w-20"
                            />
                          ) : (
                            item.unit
                          )}
                        </TableCell>
                        <TableCell>
                          {editingIndex === index ? (
                            <Input
                              type="date"
                              value={item.expiry_date || ''}
                              onChange={(e) => handleEditItem(index, 'expiry_date', e.target.value)}
                              className="h-8 w-32"
                            />
                          ) : (
                            item.expiry_date || 'N/A'
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {editingIndex === index ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingIndex(null)}
                              >
                                Done
                              </Button>
                            ) : (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingIndex(index)}
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveItem(index)}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Confirm Button */}
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={handleReset} disabled={isLoading}>
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirm}
                  disabled={isLoading}
                  size="lg"
                  className="min-w-[200px]"
                >
                  {confirmItemsMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding to Inventory...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Add {detectedItems.length} Items
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Items Found */}
      {scanComplete && detectedItems.length === 0 && (
        <Card className="border-border/40 shadow-medium bg-card/80 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <XCircle className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Items Detected</h3>
              <p className="text-sm text-muted-foreground mb-4">
                We couldn't detect any items from this receipt. Please try:
              </p>
              <ul className="text-sm text-muted-foreground space-y-1 mb-6">
                <li>• Ensure the image is clear and well-lit</li>
                <li>• Make sure all text is visible</li>
                <li>• Try uploading a different image</li>
              </ul>
              <Button onClick={handleReset}>
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ReceiptScanner;
