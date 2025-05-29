
import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MenuItem } from '@/contexts/AppContext';
import { useApp } from '@/contexts/AppContext';
import { toast } from '@/hooks/use-toast';

interface MenuCardProps {
  item: MenuItem;
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
      title: "Added to cart",
      description: `${quantity}x ${item.name} added to your order`
    });
  };

  return (
    <Card className="h-full flex flex-col overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-48 object-cover"
        />
        {!item.inStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Badge variant="destructive" className="text-lg px-3 py-1">
              Out of Stock
            </Badge>
          </div>
        )}
      </div>
      
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="text-lg line-clamp-2">{item.name}</CardTitle>
          <Badge variant="secondary" className="text-sm whitespace-nowrap">
            ${item.price.toFixed(2)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
          {item.description}
        </p>
        <Badge variant="outline" className="text-xs">
          {item.category}
        </Badge>
      </CardContent>
      
      <CardFooter className="pt-4 flex gap-2">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            disabled={!item.inStock}
            className="w-8 h-8 p-0"
          >
            -
          </Button>
          <span className="w-8 text-center font-medium">{quantity}</span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setQuantity(quantity + 1)}
            disabled={!item.inStock}
            className="w-8 h-8 p-0"
          >
            +
          </Button>
        </div>
        
        <Button
          onClick={handleAddToCart}
          disabled={!item.inStock}
          className="flex-1 bg-sage-green hover:bg-sage-green/90 text-earth-brown"
        >
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
}
