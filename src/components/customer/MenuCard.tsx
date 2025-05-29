
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/contexts/AppContext';
import { toast } from '@/hooks/use-toast';
import { Plus, Minus } from 'lucide-react';

interface MenuCardProps {
  item: any;
}

export function MenuCard({ item }: MenuCardProps) {
  const { dispatch } = useApp();
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    if (!item.inStock) {
      toast({
        title: "Item unavailable",
        description: "This item is currently out of stock",
        variant: "destructive"
      });
      return;
    }

    dispatch({
      type: 'ADD_TO_CART',
      payload: { menuItem: item, quantity }
    });

    toast({
      title: "Added to cart!",
      description: `${quantity}x ${item.name} added to your order`
    });

    setQuantity(1);
  };

  return (
    <Card className="overflow-hidden shadow-sm border-sage-green/20 hover:shadow-md transition-shadow">
      <div className="flex">
        {/* Image */}
        <div className="w-24 h-24 flex-shrink-0">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Content */}
        <CardContent className="flex-1 p-3">
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1 pr-2">
              <h3 className="font-semibold text-sm leading-tight">{item.name}</h3>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {item.description}
              </p>
            </div>
            <div className="text-right">
              <div className="font-bold text-sage-green text-sm">
                ${item.price.toFixed(2)}
              </div>
              {!item.inStock && (
                <Badge variant="destructive" className="text-xs mt-1">
                  Out of Stock
                </Badge>
              )}
            </div>
          </div>
          
          {/* Quantity and Add Button */}
          {item.inStock && (
            <div className="flex items-center justify-between mt-3">
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
                className="bg-warm-orange hover:bg-warm-orange/90 text-earth-brown text-xs px-3 py-1 h-7"
              >
                Add
              </Button>
            </div>
          )}
        </CardContent>
      </div>
    </Card>
  );
}
