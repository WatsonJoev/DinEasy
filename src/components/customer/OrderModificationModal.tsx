import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useApp } from "@/contexts/AppContext";
import { toast } from "@/hooks/use-toast";
import { Minus, X, Plus } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "@/lib/supabaseClient";
import { PARCEL_CHARGE } from "@/contexts/AppContext";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface OrderModificationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: any;
  onOrderModified?: () => void;
}

interface ModifiedItem {
  id?: string;
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
        id: item.id,
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

  const removeItem = async (lineItemId: string) => {
    const itemToRemove = modifiedItems.find((item) => item.lineItemId === lineItemId);

    if (itemToRemove) {
      const { error } = await supabase
        .from("order_items")
        .delete()
        .match({
          order_id: order.id,
          menu_item_id: itemToRemove.menuItem.id,
          order_type: itemToRemove.orderType,
        });
      if (error) {
        toast({
          title: "Delete Error",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
    }

    setModifiedItems((prevItems) =>
      prevItems.filter((item) => item.lineItemId !== lineItemId)
    );
  };

  const handleOrderTypeChange = (lineItemId: string, newOrderType: string) => {
    setModifiedItems((prevItems) =>
      prevItems.map((item) =>
        item.lineItemId === lineItemId ? { ...item, orderType: newOrderType } : item
      )
    );
  };

  const handleSaveChanges = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Not Authenticated",
        description: "Please log in to modify your order.",
        variant: "destructive",
      });
      return;
    }

    const originalIds = order.items.map(item => item.id);
    const modifiedIds = modifiedItems.map(item => item.id).filter(Boolean);

    const toDelete = originalIds.filter(id => !modifiedIds.includes(id));
    console.log("Attempting to delete these IDs:", toDelete);
    for (const id of toDelete) {
      if (id) {
        console.log("Deleting order_item", id);
        const { error } = await supabase.from("order_items").delete().eq("id", id);
        if (error) {
          toast({
            title: "Delete Error",
            description: error.message,
            variant: "destructive",
          });
          console.error("Delete error:", error);
        }
      }
    }

    const toUpdate = modifiedItems.filter(item => item.id);
    const toInsert = modifiedItems.filter(item => !item.id);

    for (const item of toUpdate) {
      if (item.id) {
        const updatePayload = {
          quantity: item.quantity,
          price: item.menuItem.price,
          order_type: item.orderType,
          spice_level: item.menuItem.spiceLevel,
          parcel_charge: item.orderType === "takeaway" ? PARCEL_CHARGE : 0,
        };
        console.log("Updating order_item", item.id, updatePayload);
        const { error } = await supabase.from("order_items").update(updatePayload).eq("id", item.id);
        if (error) {
          toast({
            title: "Update Error",
            description: error.message,
            variant: "destructive",
          });
          console.error("Update error:", error);
        }
      }
    }

    if (toInsert.length > 0) {
      const newOrderItems = toInsert.map(item => ({
        order_id: order.id,
        menu_item_id: item.menuItem.id,
        menu_item_name: item.menuItem.name,
        quantity: item.quantity,
        price: item.menuItem.price,
        order_type: item.orderType,
        spice_level: item.menuItem.spiceLevel,
        parcel_charge: item.orderType === "takeaway" ? PARCEL_CHARGE : 0,
        added_at: new Date().toISOString(),
      }));
      const { error } = await supabase.from("order_items").insert(newOrderItems);
      if (error) console.error("Insert error:", error);
    }

    const subtotal = modifiedItems.reduce(
      (sum, item) => sum + item.menuItem.price * item.quantity,
      0
    );

    const parcelCharges = modifiedItems.reduce(
      (sum, item) =>
        sum +
        (item.orderType === "takeaway"
          ? PARCEL_CHARGE * item.quantity
          : 0),
      0
    );
    const taxRate = state.restaurant.taxRate;
    const taxAmount = (subtotal + parcelCharges) * (taxRate / 100);
    const newTotal = subtotal + parcelCharges + taxAmount;

    const paymentDetails = {
      ...order.payment_details,
      subtotal,
      tax: taxAmount,
      total: newTotal,
      parcelCharges,
    };

    const { error: updateOrderError } = await supabase
      .from("orders")
      .update({
        total: newTotal,
        payment_details: paymentDetails,
      })
      .eq("id", order.id);

    if (updateOrderError) {
      toast({
        title: "Modification Error",
        description: `Failed to update order total: ${updateOrderError.message}`,
        variant: "destructive",
      });
      return;
    }

    dispatch({
      type: "MODIFY_ORDER",
      payload: {
        id: order.id,
        updatedItems: modifiedItems.map((item) => ({
          id: item.lineItemId,
          menuItem: item.menuItem,
          quantity: item.quantity,
          orderType: item.orderType as 'dine-in' | 'takeaway',
          spiceLevel: item.menuItem.spiceLevel,
          timestamp: new Date().toISOString(),
        })),
      },
    });

    toast({
      title: "Order updated!",
      description: "Your order has been successfully modified.",
    });

    onOpenChange(false);
    if (onOrderModified) {
      onOrderModified();
    }
  };

  const total = modifiedItems.reduce((sum, item) => {
    const lineTotal = item.menuItem.price * item.quantity;
    const parcelCharge =
      item.orderType === "takeaway"
        ? PARCEL_CHARGE * item.quantity
        : 0;
    return sum + lineTotal + parcelCharge;
  }, 0);

  const taxAmount = total * (state.restaurant.taxRate / 100);
  const totalWithTax = total + taxAmount;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modify Your Order</DialogTitle>
          <p className="text-sm text-muted-foreground">
            You can modify this order before the chef starts preparing it.
          </p>
        </DialogHeader>

        <div className="space-y-4">
          {modifiedItems.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">
                  No items in your order
                </p>
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
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeItem(item.lineItemId)}
                            className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                            aria-label="Remove item"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {state.restaurant.currency}
                          {item.menuItem.price.toFixed(2)} each
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateQuantity(item.lineItemId, item.quantity - 1)}
                              className="h-7 w-7 p-0"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="text-sm font-medium w-6 text-center">
                              {item.quantity}
                            </span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateQuantity(item.lineItemId, item.quantity + 1)}
                              className="h-7 w-7 p-0"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                          <RadioGroup
                            value={item.orderType}
                            onValueChange={(value) => handleOrderTypeChange(item.lineItemId, value)}
                            className="flex gap-4 ml-4"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="dine-in" id={`dine-in-${item.lineItemId}`} className="accent-blue-900" />
                              <Label htmlFor={`dine-in-${item.lineItemId}`} className="text-xs cursor-pointer">
                                Dine-in
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="takeaway" id={`takeaway-${item.lineItemId}`} className="text-red-500" />
                              <Label htmlFor={`takeaway-${item.lineItemId}`} className="text-xs cursor-pointer ">
                                Takeaway
                              </Label>
                            </div>
                          </RadioGroup>
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
