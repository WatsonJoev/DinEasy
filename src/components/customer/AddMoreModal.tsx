
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/AppContext';
import { toast } from '@/hooks/use-toast';
import { MenuCard } from './MenuCard';
import { MenuFilters } from './MenuFilters';

interface AddMoreModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
}

export function AddMoreModal({ open, onOpenChange, orderId }: AddMoreModalProps) {
  const { state, dispatch } = useApp();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedFoodType, setSelectedFoodType] = useState('all');
  const [showRecommended, setShowRecommended] = useState(false);

  const categories = [...new Set(state.menuItems.map(item => item.category))];

  const filteredItems = state.menuItems.filter(item => {
    if (selectedCategory !== 'All' && item.category !== selectedCategory) {
      return false;
    }
    if (selectedFoodType !== 'all' && item.foodType !== selectedFoodType) {
      return false;
    }
    if (showRecommended && !item.recommended) {
      return false;
    }
    return true;
  });

  const handleAddToExistingOrder = (menuItem: any, quantity: number, orderType: 'dine-in' | 'takeaway') => {
    const newItems = [{
      menuItem,
      quantity,
      orderType
    }];

    dispatch({
      type: 'ADD_TO_ORDER',
      payload: { orderId, items: newItems }
    });

    toast({
      title: "Added to order!",
      description: `${quantity}x ${menuItem.name} added to your existing order`
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add More Items</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Add more items to your existing order
          </p>
        </DialogHeader>
        
        <div className="space-y-4">
          <MenuFilters
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            selectedFoodType={selectedFoodType}
            onFoodTypeChange={setSelectedFoodType}
            showRecommended={showRecommended}
            onRecommendedChange={setShowRecommended}
          />

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredItems.map(item => (
              <div key={item.id} className="transform scale-95">
                <MenuCard item={item} />
              </div>
            ))}
          </div>
          
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full"
          >
            Done Adding
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
