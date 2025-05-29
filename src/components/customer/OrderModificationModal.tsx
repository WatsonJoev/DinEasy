
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useApp } from '@/contexts/AppContext';
import { toast } from '@/hooks/use-toast';
import { Plus, Minus, X } from 'lucide-react';

interface OrderModificationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: any;
}

export function OrderModificationModal({ open, onOpenChange, order }: OrderModificationModalProps) {
  const { dispatch } = useApp();
  const [modifiedItems, setModifiedItems] = useState(order?.items || []);

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setModifiedItems(modifiedItems.filter(item => item.menuItem.id !== itemId));
    } else {
      setModifiedItems(modifiedItems.map(item =>
        item.menuItem.id === itemId
          ? { ...item, quantity: newQuantity }
          : item
      ));
    }
  };

  const removeItem = (itemId: string) => {
    setModifiedItems(modifiedItems.filter(item => item.menuItem.id !== itemId));
  };

  const handleSaveChanges = () => {
    if (modifiedItems.length === 0) {
      toast({
        title: "Cannot save empty order",
        description: "Please add at least one item to your order",
        variant: "destructive"
      });
      return;
    }

    dispatch({
      type: 'MODIFY_ORDER',
      payload: { orderId: order.id, items: modifiedItems }
    });

    toast({
      title: "Order updated!",
      description: "Your order has been successfully modified"
    });

    onOpenChange(false);
  };

  const total = modifiedItems.reduce(
    (sum, item) => sum + (item.menuItem.price * item.quantity), 0
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modify Your Order</DialogTitle>
          <p className="text-sm text-muted-foreground">
            You can modify this order before the chef starts preparing it
          </p>
        </DialogHeader>
        
        <div className="space-y-4">
          {modifiedItems.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">No items in your order</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {modifiedItems.map((item) => (
                <Card key={item.menuItem.id} className="overflow-hidden">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.menuItem.image}
                        alt={item.menuItem.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                      
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{item.menuItem.name}</h4>
                        <p className="text-xs text-muted-foreground">
                          ${item.menuItem.price.toFixed(2)} each
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateQuantity(item.menuItem.id, item.quantity - 1)}
                          className="h-7 w-7 p-0"
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        
                        <span className="text-sm font-medium w-6 text-center">
                          {item.quantity}
                        </span>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateQuantity(item.menuItem.id, item.quantity + 1)}
                          className="h-7 w-7 p-0"
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeItem(item.menuItem.id)}
                          className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          
          <Card className="bg-sage-green/10">
            <CardContent className="p-4">
              <div className="flex justify-between items-center font-semibold">
                <span>New Total:</span>
                <span className="text-sage-green">${total.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>
          
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveChanges}
              className="flex-1 bg-sage-green hover:bg-sage-green/90 text-earth-brown"
              disabled={modifiedItems.length === 0}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
