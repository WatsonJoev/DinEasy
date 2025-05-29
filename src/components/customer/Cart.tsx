
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/contexts/AppContext';
import { toast } from '@/hooks/use-toast';

export function Cart() {
  const { state, dispatch } = useApp();

  const total = state.currentOrder.reduce(
    (sum, item) => sum + (item.menuItem.price * item.quantity), 0
  );

  const handleRemoveItem = (itemId: string) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: itemId });
    toast({
      title: "Item removed",
      description: "Item has been removed from your cart"
    });
  };

  const handlePlaceOrder = () => {
    if (state.currentOrder.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Please add items to your cart before placing an order",
        variant: "destructive"
      });
      return;
    }

    dispatch({ type: 'PLACE_ORDER' });
    toast({
      title: "Order placed!",
      description: "Your order has been sent to the kitchen"
    });
  };

  if (state.currentOrder.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Order</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Your cart is empty. Add some delicious items!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Your Order
          <Badge variant="secondary">
            {state.restaurant.table}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {state.currentOrder.map((item) => (
          <div key={item.menuItem.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div className="flex-1">
              <h4 className="font-medium">{item.menuItem.name}</h4>
              <p className="text-sm text-muted-foreground">
                ${item.menuItem.price.toFixed(2)} x {item.quantity}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">
                ${(item.menuItem.price * item.quantity).toFixed(2)}
              </span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleRemoveItem(item.menuItem.id)}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                Remove
              </Button>
            </div>
          </div>
        ))}
        
        <Separator />
        
        <div className="flex justify-between items-center text-lg font-semibold">
          <span>Total:</span>
          <span>${total.toFixed(2)}</span>
        </div>
        
        <Button
          onClick={handlePlaceOrder}
          className="w-full bg-warm-orange hover:bg-warm-orange/90 text-earth-brown"
          size="lg"
        >
          Place Order
        </Button>
      </CardContent>
    </Card>
  );
}
