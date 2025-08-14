import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle,} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useApp } from "@/contexts/AppContext";
import { toast } from "@/hooks/use-toast";
import { Minus, X } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "@/lib/supabaseClient";
import { PARCEL_CHARGE } from "@/contexts/AppContext";

interface OrderModificationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: any;
  onOrderModified?: () => void;
}

interface ModifiedItem {
  lineItemId: string;
  menuItem: any;
  quantity: number;
  orderType: string;
}

export function OrderModificationModal({
  open,
  onOpenChange,
  order,
  onOrderModified,
}: OrderModificationModalProps) {
  const { state, dispatch } = useApp();
  const [modifiedItems, setModifiedItems] = useState<ModifiedItem[]>([]);

  useEffect(() => {
    if (order?.items) {
      const clonedItems = order.items.map((item: any) => ({
        lineItemId: uuidv4(),
        menuItem: { ...item.menuItem },
        quantity: item.quantity,
        orderType: item.orderType || order.orderType || "dine-in",
      }));
      setModifiedItems(clonedItems);
    }
  }, [order, open]);

  const updateQuantity = (lineItemId: string, newQuantity: number) => {
    setModifiedItems((prevItems) =>
      newQuantity <= 0
        ? prevItems.filter((item) => item.lineItemId !== lineItemId)
        : prevItems.map((item) =>
            item.lineItemId === lineItemId
              ? { ...item, quantity: newQuantity }
              : item
          )
    );
  };

  const removeItem = (lineItemId: string) => {
    setModifiedItems((prevItems) =>
      prevItems.filter((item) => item.lineItemId !== lineItemId)
    );
  };

  const handleSaveChanges = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: "Not Authenticated", description: "Please log in to modify your order.", variant: "destructive" });
      return;
    }

    console.log('Current user:', user);
    console.log('Order being modified:', order);

    // Recalculate totals based on the modified items
    const subtotal = modifiedItems.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0);
    const parcelCharges = modifiedItems.reduce((sum, item) => sum + (item.orderType === "takeaway" ? PARCEL_CHARGE * item.quantity : 0), 0);
    const taxRate = state.restaurant.taxRate;
    const taxAmount = (subtotal + parcelCharges) * (taxRate / 100);
    const newTotal = subtotal + parcelCharges + taxAmount;

    console.log('Calculation details:', {
      subtotal,
      parcelCharges,
      taxRate,
      taxAmount,
      newTotal,
      modifiedItems: modifiedItems.map(item => ({
        name: item.menuItem.name,
        price: item.menuItem.price,
        quantity: item.quantity,
        orderType: item.orderType
      }))
    });

    // 1. Delete all old items for this order
    const { error: deleteError } = await supabase.from('order_items').delete().eq('order_id', parseInt(order.id));
    if (deleteError) {
      toast({ title: "Modification Error", description: `Failed to remove old items: ${deleteError.message}`, variant: "destructive" });
      return;
    }

    // 2. If no items remain, delete the order itself and exit
    if (modifiedItems.length === 0) {
      const { error: deleteOrderError } = await supabase.from('orders').delete().eq('id', parseInt(order.id));
      if (deleteOrderError) {
        toast({ title: "Modification Error", description: `Failed to delete empty order: ${deleteOrderError.message}`, variant: "destructive" });
        return;
      }
      // Optionally update local state if you have a suitable action, otherwise skip dispatch
      toast({
        title: "Order deleted",
        description: "Your order was empty and has been deleted.",
      });
      onOpenChange(false);
      if (onOrderModified) onOrderModified();
      return;
    }

    // 3. Insert all the new items
    if (modifiedItems.length > 0) {
      const newOrderItems = modifiedItems.map(item => ({
        order_id: parseInt(order.id),
        user_id: user.id,
        menu_item_id: item.menuItem.id,
        menu_item_name: item.menuItem.name,
        quantity: item.quantity,
        price: item.menuItem.price,
        order_type: item.orderType,
        spice_level: item.menuItem.spiceLevel,
        parcel_charge: item.orderType === "takeaway" ? PARCEL_CHARGE : 0,
        added_at: new Date().toISOString()
      }));

      const { error: insertError } = await supabase.from('order_items').insert(newOrderItems);
      if (insertError) {
        toast({ title: "Modification Error", description: `Failed to add new items: ${insertError.message}`, variant: "destructive" });
        // Attempting a rollback or notifying user would be good here, but for now, we stop.
        return;
      }
    }

    // 4. Update the main order with the new total and payment details
    console.log('Updating order in Supabase:', {
      orderId: order.id,
      orderIdParsed: parseInt(order.id),
      newTotal: newTotal,
      subtotal: subtotal,
      taxAmount: taxAmount,
      parcelCharges: parcelCharges,
      originalOrder: order
    });

    // First, let's check if the order exists and get its current state
    const { data: existingOrder, error: fetchError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', parseInt(order.id))
      .single();

    if (fetchError) {
      console.error("Error fetching existing order:", fetchError);
      toast({ title: "Modification Error", description: `Failed to fetch order: ${fetchError.message}`, variant: "destructive" });
      return;
    }

    console.log('Existing order in database:', existingOrder);
    console.log('Order user_id:', existingOrder.user_id, 'Current user id:', user.id);

    // Check if the order belongs to the current user
    if (existingOrder.user_id !== user.id) {
      console.error("Order does not belong to current user");
      toast({ title: "Permission Error", description: "You can only modify your own orders.", variant: "destructive" });
      return;
    }

    const updatePayload = { 
      total: newTotal,
      payment_details: {
        ...(order.payment_details || {}),
        subtotal: subtotal,
        tax: taxAmount,
        total: newTotal,
        parcelCharges: parcelCharges,
      }
    };

    console.log('Update payload:', JSON.stringify(updatePayload, null, 2));
    console.log('Order ID type:', typeof parseInt(order.id), 'Value:', parseInt(order.id));

    // Try a simpler update approach
    console.log('Attempting to update order with ID:', parseInt(order.id));
    
    const { data: updateData, error: updateOrderError } = await supabase
      .from('orders')
      .update({ total: newTotal })
      .eq('id', parseInt(order.id))
      .select();

    if (updateOrderError) {
      console.error("Order update error:", updateOrderError);
      toast({ title: "Modification Error", description: `Failed to update order total: ${updateOrderError.message}`, variant: "destructive" });
      return;
    }

    console.log('Simple update result:', updateData);

    // Verify the update by fetching the order again
    const { data: verifyOrder, error: verifyError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', parseInt(order.id))
      .single();

    if (verifyError) {
      console.error("Error verifying update:", verifyError);
    } else {
      console.log('Order after update verification:', verifyOrder);
    }

    // 5. Update the local state to reflect the change immediately
    dispatch({
      type: "MODIFY_ORDER",
      payload: {
        orderId: order.id,
        items: modifiedItems.map(item => ({
            id: item.lineItemId,
            menuItem: item.menuItem,
            quantity: item.quantity,
            orderType: item.orderType,
            spiceLevel: item.menuItem.spiceLevel,
            timestamp: new Date().toISOString(),
        })),
        total: newTotal,
        paymentDetails: {
            ...order.paymentDetails,
            subtotal,
            tax: taxAmount,
            total: newTotal,
            parcelCharges,
        },
      },
    });

    toast({
      title: "Order updated!",
      description: "Your order has been successfully modified",
    });

    onOpenChange(false);
    if (onOrderModified) {
      onOrderModified();
    }
  };

  // Calculate totals for display (consistent with save logic)
  const subtotal = modifiedItems.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0);
  const parcelCharges = modifiedItems.reduce((sum, item) => sum + (item.orderType === "takeaway" ? PARCEL_CHARGE * item.quantity : 0), 0);
  const taxAmount = (subtotal + parcelCharges) * (state.restaurant.taxRate / 100);
  const totalWithTax = subtotal + parcelCharges + taxAmount;

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
                <Card key={item.lineItemId} className="overflow-hidden">
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      <img
                        src={item.menuItem.image}
                        alt={item.menuItem.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div className="flex-1 space-y-1">
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium text-sm">
                            {item.menuItem.name}
                          </h4>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full capitalize ${
                              item.orderType === "dine-in"
                              ? "bg-blue-50 text-blue-900"
                              :"bg-red-50 text-red-600"}`}
                          >
                            {item.orderType}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {state.restaurant.currency}
                          {item.menuItem.price.toFixed(2)} each
                        </p>

                        <div className="flex items-center gap-2 mt-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              updateQuantity(item.lineItemId, item.quantity - 1)
                            }
                            className="h-7 w-7 p-0"
                          >
                            <Minus className="w-3 h-3" />
                          </Button>

                          <span className="text-sm font-medium w-6 text-center">
                            {item.quantity}
                          </span>

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeItem(item.lineItemId)}
                            className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
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
                <span className="text-sage-green">
                  {state.restaurant.currency}
                  {totalWithTax.toFixed(2)}
                </span>
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
            >
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
