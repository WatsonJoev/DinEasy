
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/contexts/AppContext';
import { toast } from '@/hooks/use-toast';
import { Plus, Minus, Clock, Star } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface MenuCardProps {
  item: any;
}

export function MenuCard({ item }: MenuCardProps) {
  const { state, dispatch } = useApp();
  const [quantity, setQuantity] = useState(1);
  const [orderType, setOrderType] = useState<'dine-in' | 'takeaway'>('dine-in');

  const getFoodTypeIcon = (type: string) => {
    switch (type) {
      case 'veg': return '🟢';
      case 'non-veg': return '🔴';
      case 'vegan': return '🌱';
      case 'jain': return '🟡';
      default: return '🍽️';
    }
  };

  const getSpiceLevelColor = (level: string) => {
    switch (level) {
      case 'mild': return 'bg-olivine-200 text-olivine-800';
      case 'medium': return 'bg-sunglow-200 text-sunglow-800';
      case 'spicy': return 'bg-pumpkin-200 text-pumpkin-800';
      case 'very-spicy': return 'bg-red-200 text-red-800';
      default: return 'bg-gray-200 text-gray-800';
    }
  };

  const isAvailable = () => {
    if (!item.availableFrom || !item.availableTo) return true;
    
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const [fromHour, fromMin] = item.availableFrom.split(':').map(Number);
    const [toHour, toMin] = item.availableTo.split(':').map(Number);
    
    const fromTime = fromHour * 60 + fromMin;
    const toTime = toHour * 60 + toMin;
    
    return currentTime >= fromTime && currentTime <= toTime;
  };

  const handleAddToCart = () => {
    if (!item.inStock) {
      toast({
        title: "Item unavailable",
        description: "This item is currently out of stock",
        variant: "destructive"
      });
      return;
    }

    if (!isAvailable()) {
      toast({
        title: "Item not available",
        description: `This item is only available from ${item.availableFrom} to ${item.availableTo}`,
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
          <div className="absolute top-1 left-1">
            <Badge variant="secondary" className="text-xs p-1">
              {getFoodTypeIcon(item.foodType)}
            </Badge>
          </div>
          {item.recommended && (
            <div className="absolute top-1 right-1">
              <Badge variant="default" className="text-xs p-1 bg-sunglow text-charcoal">
                <Star className="w-3 h-3" />
              </Badge>
            </div>
          )}
        </div>
        
        {/* Content */}
        <CardContent className="flex-1 p-3">
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1 pr-2">
              <h3 className="font-semibold text-sm leading-tight text-charcoal">{item.name}</h3>
              <p className="text-xs text-charcoal/70 mt-1 line-clamp-2">
                {item.description}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className={`text-xs ${getSpiceLevelColor(item.spiceLevel)}`}>
                  {item.spiceLevel}
                </Badge>
                <div className="flex items-center gap-1 text-xs text-charcoal/60">
                  <Clock className="w-3 h-3" />
                  {item.preparationTime}min
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold text-charcoal text-sm">
                {state.settings.currencySymbol}{item.price}
              </div>
              {!item.inStock && (
                <Badge variant="destructive" className="text-xs mt-1">
                  Out of Stock
                </Badge>
              )}
              {!isAvailable() && (
                <Badge variant="outline" className="text-xs mt-1">
                  Not Available
                </Badge>
              )}
            </div>
          </div>
          
          {/* Order Type, Quantity and Add Button */}
          {item.inStock && isAvailable() && (
            <div className="space-y-2 mt-3">
              {/* Order Type Selection */}
              <Select value={orderType} onValueChange={(value: 'dine-in' | 'takeaway') => setOrderType(value)}>
                <SelectTrigger className="h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dine-in">🍽️ Dine-in</SelectItem>
                  <SelectItem value="takeaway">📦 Takeaway</SelectItem>
                </SelectContent>
              </Select>

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
