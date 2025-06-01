
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useApp } from '@/contexts/AppContext';
import { toast } from '@/hooks/use-toast';

interface OrderCustomizationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  menuItem: any;
  onAddToCart: (customization: any) => void;
}

export function OrderCustomizationModal({ open, onOpenChange, menuItem, onAddToCart }: OrderCustomizationModalProps) {
  const { state } = useApp();
  const [quantity, setQuantity] = useState(1);
  const [orderType, setOrderType] = useState<'dine-in' | 'takeaway'>('dine-in');
  const [spiceLevel, setSpiceLevel] = useState(menuItem?.spiceLevel || 'medium');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [selectedCustomizations, setSelectedCustomizations] = useState<string[]>([]);

  const customizationOptions = [
    'Extra Spicy', 'Less Oil', 'No Onions', 'Extra Cheese', 
    'No Dairy', 'Gluten Free', 'Extra Sauce', 'Less Salt'
  ];

  const handleCustomizationToggle = (option: string) => {
    setSelectedCustomizations(prev => 
      prev.includes(option) 
        ? prev.filter(item => item !== option)
        : [...prev, option]
    );
  };

  const handleAddToCart = () => {
    const customization = {
      menuItem,
      quantity,
      orderType,
      spiceLevel,
      specialInstructions,
      customizations: selectedCustomizations,
      timestamp: new Date().toISOString()
    };

    onAddToCart(customization);
    
    toast({
      title: "Added to Cart",
      description: `${quantity}x ${menuItem.name} added for ${orderType}`
    });

    onOpenChange(false);
    
    // Reset form
    setQuantity(1);
    setOrderType('dine-in');
    setSpiceLevel(menuItem?.spiceLevel || 'medium');
    setSpecialInstructions('');
    setSelectedCustomizations([]);
  };

  if (!menuItem) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Customize Your Order</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Item Details */}
          <div className="space-y-2">
            <img
              src={menuItem.image}
              alt={menuItem.name}
              className="w-full h-32 object-cover rounded-lg"
            />
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg">{menuItem.name}</h3>
                <p className="text-sm text-muted-foreground">{menuItem.description}</p>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-pumpkin">
                  {state.restaurant.currency}{menuItem.price.toFixed(2)}
                </div>
                <Badge variant="outline" className={menuItem.foodType === 'veg' ? 'bg-olivine text-white' : 'bg-pumpkin text-white'}>
                  {menuItem.foodType === 'veg' ? '🌱 Veg' : '🍗 Non-Veg'}
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Quantity Selection */}
          <div>
            <Label className="text-sm font-medium">Quantity</Label>
            <div className="flex items-center gap-2 mt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                -
              </Button>
              <span className="w-12 text-center font-medium">{quantity}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuantity(quantity + 1)}
              >
                +
              </Button>
            </div>
          </div>

          {/* Order Type */}
          <div>
            <Label className="text-sm font-medium">Order Type</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <Button
                variant={orderType === 'dine-in' ? 'default' : 'outline'}
                onClick={() => setOrderType('dine-in')}
                className="w-full"
              >
                Dine-in
              </Button>
              <Button
                variant={orderType === 'takeaway' ? 'default' : 'outline'}
                onClick={() => setOrderType('takeaway')}
                className="w-full"
              >
                Takeaway
              </Button>
            </div>
          </div>

          {/* Spice Level */}
          <div>
            <Label className="text-sm font-medium">Spice Level</Label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {['mild', 'medium', 'hot'].map((level) => (
                <Button
                  key={level}
                  variant={spiceLevel === level ? 'default' : 'outline'}
                  onClick={() => setSpiceLevel(level)}
                  className="w-full text-xs"
                >
                  {level === 'mild' ? '🟢 Mild' : level === 'medium' ? '🟡 Medium' : '🔴 Hot'}
                </Button>
              ))}
            </div>
          </div>

          {/* Customizations */}
          <div>
            <Label className="text-sm font-medium">Customizations (Optional)</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {customizationOptions.map((option) => (
                <Button
                  key={option}
                  variant={selectedCustomizations.includes(option) ? 'default' : 'outline'}
                  onClick={() => handleCustomizationToggle(option)}
                  className="w-full text-xs h-auto py-2"
                  size="sm"
                >
                  {option}
                </Button>
              ))}
            </div>
          </div>

          {/* Special Instructions */}
          <div>
            <Label className="text-sm font-medium">Special Instructions</Label>
            <Textarea
              placeholder="Any special requests or dietary requirements..."
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              className="mt-2"
              rows={3}
            />
          </div>

          <Separator />

          {/* Total and Add to Cart */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-medium">Total:</span>
              <span className="text-xl font-bold text-pumpkin">
                {state.restaurant.currency}{(menuItem.price * quantity).toFixed(2)}
              </span>
            </div>
            
            <Button
              onClick={handleAddToCart}
              className="w-full bg-pumpkin hover:bg-pumpkin/90 text-white"
              size="lg"
            >
              Add to Cart
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
