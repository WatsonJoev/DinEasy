
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/AppContext';
import { MenuCard } from './MenuCard';
import { MenuFilters } from './MenuFilters';
import { toast } from '@/hooks/use-toast';

interface AddMoreModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
}

export function AddMoreModal({ open, onOpenChange, orderId }: AddMoreModalProps) {
  const { state, dispatch, isMenuItemAvailable } = useApp();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedFoodType, setSelectedFoodType] = useState('all');
  const [showRecommended, setShowRecommended] = useState(false);
  const [selectedItems, setSelectedItems] = useState<any[]>([]);

  const categories = [...new Set(state.menuItems.map(item => item.category))];
  
  const filteredItems = state.menuItems.filter(item => {
    if (!isMenuItemAvailable(item)) return false;
    if (selectedCategory !== 'All' && item.category !== selectedCategory) return false;
    if (selectedFoodType !== 'all' && item.foodType !== selectedFoodType) return false;
    if (showRecommended && !item.recommended) return false;
    return true;
  });

  const handleAddMore = () => {
    if (selectedItems.length === 0) {
      toast({
        title: "No items selected",
        description: "Please add items to your cart first",
        variant: "destructive"
      });
      return;
    }

    dispatch({
      type: 'ADD_TO_EXISTING_ORDER',
      payload: { orderId, items: selectedItems }
    });

    toast({
      title: "Items added!",
      description: `${selectedItems.length} items added to your order`
    });

    setSelectedItems([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Add More Items</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto space-y-4">
          <MenuFilters
            selectedCategory={selectedCategory}
            selectedFoodType={selectedFoodType}
            showRecommended={showRecommended}
            categories={categories}
            onCategoryChange={setSelectedCategory}
            onFoodTypeChange={setSelectedFoodType}
            onRecommendedToggle={() => setShowRecommended(!showRecommended)}
          />

          <div className="space-y-3">
            {filteredItems.map(item => (
              <MenuCard key={item.id} item={item} />
            ))}
          </div>
        </div>

        <div className="flex gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleAddMore} className="flex-1 bg-pumpkin hover:bg-pumpkin/90">
            Add to Order
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
