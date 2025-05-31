
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useApp } from '@/contexts/AppContext';
import { toast } from '@/hooks/use-toast';
import { Plus, Minus, Clock, Star } from 'lucide-react';

interface MenuCardProps {
  item: any;
}

export function MenuCard({ item }: MenuCardProps) {
  const { state, dispatch, isMenuItemAvailable } = useApp();
  const [quantity, setQuantity] = useState(1);
  const [orderType, setOrderType] = useState<'dine-in' | 'takeaway'>('dine-in');

  const isAvailable = isMenuItemAvailable(item);

  const handleAddToCart = () => {
    if (!item.inStock || !isAvailable) {
      toast({
        title: "Item unavailable",
        description: !isAvailable ? "This item is not available at this time" : "This item is currently out of stock",
        variant: "destructive"
      });
      return;
    }

    dispatch({
      type: 'ADD_TO_CART',
      payload: { menuItem: item, quantity, orderType }
    });

    toast({
      title: "Added to cart!",
      description: `${quantity}x ${item.name} (${orderType}) added to your order`
    });

    setQuantity(1);
  };

  const getFoodTypeSticker = () => {
    if (item.foodType === 'veg') {
      return <div className="w-4 h-4 border-2 border-olivine flex items-center justify-center">
        <div className="w-2 h-2 bg-olivine rounded-full"></div>
      </div>;
    } else {
      return <div className="w-4 h-4 border-2 border-pumpkin flex items-center justify-center">
        <div className="w-2 h-2 bg-pumpkin rounded-full"></div>
      </div>;
    }
  };

  const getSpiceLevelBadge = () => {
    if (!item.spiceLevel) return null;
    const colors = {
      mild: 'bg-olivine text-white',
      medium: 'bg-sunglow text-charcoal',
      hot: 'bg-pumpkin text-white'
    };
    return (
      <Badge className={`${colors[item.spiceLevel]} text-xs`}>
        {item.spiceLevel === 'hot' ? '🌶️🌶️🌶️' : item.spiceLevel === 'medium' ? '🌶️🌶️' : '🌶️'} {item.spiceLevel}
      </Badge>
    );
  };

  return (
    <Card className="overflow-hidden shadow-sm border-charcoal/10 hover:shadow-md transition-shadow">
      <div className="flex">
        {/* Image */}
        <div className="w-24 h-24 flex-shrink-0 relative">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover"
          />
          {!isAvailable && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Clock className="w-4 h-4 text-white" />
            </div>
          )}
        </div>
        
        {/* Content */}
        <CardContent className="flex-1 p-3">
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1 pr-2">
              <div className="flex items-center gap-2 mb-1">
                {getFoodTypeSticker()}
                <h3 className="font-semibold text-sm leading-tight text-charcoal">{item.name}</h3>
                {item.recommended && <Star className="w-3 h-3 text-sunglow fill-current" />}
              </div>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {item.description}
              </p>
              <div className="flex items-center gap-2 mt-1">
                {getSpiceLevelBadge()}
                <Badge variant="outline" className="text-xs">
                  {item.preparationTime} min
                </Badge>
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold text-charcoal text-sm">
                {state.restaurant.currency}{item.price.toFixed(2)}
              </div>
              {(!item.inStock || !isAvailable) && (
                <Badge variant="destructive" className="text-xs mt-1">
                  {!isAvailable ? 'Not Available' : 'Out of Stock'}
                </Badge>
              )}
            </div>
          </div>
          
          {/* Order Type Selection */}
          {(item.inStock && isAvailable) && (
            <div className="space-y-3">
              <RadioGroup value={orderType} onValueChange={(value: 'dine-in' | 'takeaway') => setOrderType(value)} className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="dine-in" id={`dine-in-${item.id}`} />
                  <Label htmlFor={`dine-in-${item.id}`} className="text-xs">Dine-in</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="takeaway" id={`takeaway-${item.id}`} />
                  <Label htmlFor={`takeaway-${item.id}`} className="text-xs">Takeaway</Label>
                </div>
              </RadioGroup>
              
              {/* Quantity and Add Button */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="h-7 w-7 p-0"
                  >
                    <Minus className="w-3 h-3" />
                  </Button>
                  <span className="text-sm font-medium w-6 text-center">{quantity}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setQuantity(quantity + 1)}
                    className="h-7 w-7 p-0"
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
                
                <Button
                  onClick={handleAddToCart}
                  className="bg-pumpkin hover:bg-pumpkin/90 text-white text-xs px-3 py-1 h-7"
                >
                  Add
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </div>
    </Card>
  );
}
