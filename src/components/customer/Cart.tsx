  import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
  import { Button } from "@/components/ui/button";
  import { Separator } from "@/components/ui/separator";
  import { Badge } from "@/components/ui/badge";
  import { useApp } from "@/contexts/AppContext";
  import { toast } from "@/hooks/use-toast";
  import { useNavigate } from "react-router-dom";
  import { Plus, Minus, X } from "lucide-react";
  import { PARCEL_CHARGE } from "@/contexts/AppContext";
  import { supabase } from "@/lib/supabaseClient";
  import { useEffect, useState } from "react";

  // --- Cart clearing helpers ---
  const clearCartCompletely = async (sessionId) => {
    try {
      const { error } = await supabase
        .from("cart_items")
        .delete()
        .eq("session_id", sessionId);
      if (error) {
        console.error("Delete error:", error);
        return false;
      }
      return true;
    } catch (e) {
      console.error("Unexpected error clearing cart:", e);
      return false;
    }
  };

  const deleteCartCompletely = async (sessionId) => {
    // ... (function code as you wrote)
  };
  // --- End helpers ---

  const fetchOrders = async (sessionId) => {
    const { data, error } = await supabase
      .from("orders")
      .select(`
        *,
        order_items:order_items(*)
      `)
      .eq("session_id", sessionId);
    if (error) {
      console.error("Error fetching orders:", error);
      return [];
    }
    return (data || []).map(order => ({
      ...order,
      tableNumber: order.table_number,
      items: (order.order_items || []).map(item => ({
        id: item.id,
        quantity: item.quantity,
        orderType: item.order_type,
        menuItem: {
          id: item.menu_item_id,
          name: item.menu_item_name,
          price: item.price,
        }
      }))
    }));
  };

  export function Cart() {
    const { state, dispatch } = useApp();
    const navigate = useNavigate();
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);

    const sessionId = localStorage.getItem("session_id") || (() => {
      const newId = crypto.randomUUID();
      localStorage.setItem("session_id", newId);
      return newId;
    })();

    const subtotal = state.currentOrder.reduce(
      (sum, item) => sum + item.menuItem.price * item.quantity,
      0
    );

    const parcelCharges = state.currentOrder.reduce(
      (sum, item) =>
        sum + (item.orderType === "takeaway" ? PARCEL_CHARGE * item.quantity : 0),
      0
    );

    const taxRate = state.restaurant.taxRate;
    const taxAmount = (subtotal + parcelCharges) * (taxRate / 100);
    const totalWithTax = subtotal + parcelCharges + taxAmount;

    useEffect(() => {
      if (state.currentOrder.length > 0) {
        syncCartToSupabase(state.currentOrder);
      }
    }, [state.currentOrder]);

    const syncCartToSupabase = async (cartItems) => {
      const { data: { user } } = await supabase.auth.getUser();

      for (const item of cartItems) {
        const cartItemData = {
          session_id: sessionId,
          user_id: user ? user.id : null,
          menu_item_id: item.menuItem.id,
          quantity: item.quantity,
          order_type: item.orderType,
          spice_level: item.spiceLevel,
          table_number: state.tableNumber,
          price: item.menuItem.price,
          status: "active",
          updated_at: new Date().toISOString(),
          added_at: new Date().toISOString()
        };

        const { error } = await supabase
          .from("cart_items")
          .upsert([
            cartItemData
          ], {
            onConflict: "session_id,menu_item_id,order_type"
          });

        if (error) {
          console.error("Cart item sync failed:", error.message);
          toast({
            title: "Error syncing cart",
            description: error.message,
            variant: "destructive",
          });
        }
      }
    };

    const handleRemoveItem = async (itemId: string) => {
      const item = state.currentOrder.find(i => i.id === itemId);
      if (!item) return;
    
      // ✅ Delete the matching cart_item row from Supabase using session + menu_item + order_type
      const { error } = await supabase
        .from("cart_items")
        .delete()
        .match({
          session_id: sessionId,
          menu_item_id: item.menuItem.id,
          order_type: item.orderType,
        });
    
      if (error) {
        console.error("Failed to delete cart item from Supabase:", error.message);
        toast({
          title: "Delete Error",
          description: "Could not remove item from server",
          variant: "destructive",
        });
        return;
      }
    
      // ✅ Remove from local state
      dispatch({ type: "REMOVE_FROM_CART", payload: itemId });
    
      toast({
        title: "Item Removed",
        description: "Item removed from your cart",
      });
    };
    
    const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
      const item = state.currentOrder.find(i => i.id === itemId);
      if (!item) return;

      if (newQuantity < 1) {
        await handleRemoveItem(itemId);
        return;
      }

      // Update in local state
      dispatch({
        type: "UPDATE_CART_ITEM",
        payload: { id: itemId, quantity: newQuantity },
      });

      // Update in Supabase
      const { error } = await supabase
        .from("cart_items")
        .update({ quantity: newQuantity, updated_at: new Date().toISOString() })
        .match({
          session_id: sessionId,
          menu_item_id: item.menuItem.id,
          order_type: item.orderType,
        });

      if (error) {
        console.error("Failed to update quantity in Supabase:", error.message);
        toast({
          title: "Update Error",
          description: "Could not update item quantity on server",
          variant: "destructive",
        });
      }
    };

    const handlePlaceOrder = async () => {
      if (state.currentOrder.length === 0) {
        toast({
          title: "Cart is empty",
          description: "Add items before placing an order",
          variant: "destructive",
        });
        return;
      }
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error("Authentication error:", authError);
        toast({
          title: "Authentication Error",
          description: "Please log in again to place your order",
          variant: "destructive",
        });
        return;
      }
      const tableNumber = state.tableNumber || state.restaurant.table;
      if (!tableNumber) {
        toast({
          title: "Table Number Required",
          description: "Please set a table number before placing your order",
          variant: "destructive",
        });
        return;
      }
      setIsPlacingOrder(true);
      try {
        // Step 1: Create the main order record
        const { data: order, error: orderError } = await supabase
          .from("orders")
          .insert([
            {
              session_id: sessionId,
              user_id: user.id,
              table_number: tableNumber,
              total: totalWithTax,
              status: "new",
              timestamp: new Date().toISOString(),
              payment_details: {
                method: null,
                subtotal,
                tax: taxAmount,
                tip: 0,
                total: totalWithTax,
                serviceRating: 0,
                parcelCharges,
              },
            }
          ])
          .select()
          .single();
        if (orderError) {
          setIsPlacingOrder(false);
          console.error("Order creation error:", orderError);
          toast({
            title: "Order Error",
            description: orderError.message,
            variant: "destructive",
          });
          return;
        }
        // Step 2: Fetch all active cart items from Supabase
        const { data: cartItems, error: fetchCartError } = await supabase
          .from("cart_items")
          .select("*, menu_items(*)")
          .eq("session_id", sessionId)
          .eq("status", "active");
        if (fetchCartError) {
          setIsPlacingOrder(false);
          console.error("Error fetching cart items:", fetchCartError);
          toast({
            title: "Cart Sync Error",
            description: "Failed to retrieve cart items from server",
            variant: "destructive",
          });
          return;
        }
        if (!cartItems || cartItems.length === 0) {
          setIsPlacingOrder(false);
          dispatch({ type: "CLEAR_CART" });
          return;
        }
        // Step 3: Insert cart items into order_items using real menu_item_id
        const orderItems = cartItems.map(item => ({
          order_id: order.id,
          menu_item_id: item.menu_item_id,
          menu_item_name: item.menu_item_name || (item.menu_items && item.menu_items.name) || "",
          quantity: item.quantity,
          price: Number(item.price) * Number(item.quantity),
          order_type: item.order_type,
          spice_level: item.spice_level,
          special_instructions: item.special_instructions || "",
          customizations: item.customizations || [],
          parcel_charge: item.order_type === "takeaway" ? PARCEL_CHARGE : 0,
          added_at: new Date().toISOString()
        }));
        const { error: orderItemsError } = await supabase
          .from("order_items")
          .insert(orderItems);
        if (orderItemsError) {
          setIsPlacingOrder(false);
          console.error("Order items creation error:", orderItemsError);
          await supabase.from("orders").update({ status: "failed" }).eq("id", order.id);
          toast({
            title: "Order Error",
            description: "Order saved, but failed to add order items: " + orderItemsError.message,
            variant: "destructive",
          });
          return;
        }
        // Step 4: Clear cart items from Supabase BEFORE updating local state
        await clearCartCompletely(sessionId);
        // Step 5: Clear local cart state
        dispatch({ type: "CLEAR_CART" });
        // Step 6: Fetch latest orders from Supabase and update context
        const fetchedOrders = await fetchOrders(sessionId);
        console.log("Fetched orders after placing:", fetchedOrders);
        dispatch({ type: "SET_ORDERS", payload: fetchedOrders });
        // Step 7: Set active order and navigate
        localStorage.setItem("activeOrderId", order.id);
        setIsPlacingOrder(false);
        navigate("/customer/orders");
        toast({
          title: "Order Placed!",
          description: "Sent to kitchen successfully",
        });
      } catch (error) {
        setIsPlacingOrder(false);
        console.error("Unexpected error during order placement:", error);
        toast({
          title: "Order Error",
          description: "An unexpected error occurred while placing your order",
          variant: "destructive",
        });
      }
    };

    useEffect(() => {
      if (!state.activeOrderId && state.orders.length > 0) {
        dispatch({ type: "SET_ACTIVE_ORDER_ID", payload: state.orders[0].id });
      }
    }, [state.activeOrderId, state.orders, dispatch]);

    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Your Cart</CardTitle>
        </CardHeader>
        <CardContent>
          {state.currentOrder.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">Your cart is empty</p>
          ) : (
            <div className="space-y-2">
              {state.currentOrder.map((item) => (
                <div key={item.id} className="flex flex-col p-0.5 bg-muted rounded-lg">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-sm sm:text-base truncate">
                        {item.menuItem.name}
                      </h4>
                      <Badge variant="outline" className="capitalize text-xs px-1.5 py-0.5">
                        {item.orderType || "dine-in"}
                      </Badge>
                    </div>
                    <span className="font-semibold text-slate-800 text-sm ml-auto">
                      {state.restaurant.currency}
                      {((item.menuItem.price * item.quantity) +
                        (item.orderType === "takeaway" ? PARCEL_CHARGE * item.quantity : 0)).toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center text-xs text-muted-foreground">
                    <span>
                      {state.restaurant.currency}
                      {item.menuItem.price.toFixed(2)} x {item.quantity}
                    </span>
                    {item.orderType === "takeaway" && (
                      <span className="text-amber-600 font-medium ml-1">
                        (+{state.restaurant.currency}
                        {PARCEL_CHARGE.toFixed(2)} parcel charge)
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-1">
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={async () => await handleUpdateQuantity(item.id, item.quantity - 1)}
                      className="h-6 w-6 p-0"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </Button>
                    <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={async () => await handleUpdateQuantity(item.id, item.quantity + 1)}
                      className="h-6 w-6 p-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={async () => await handleRemoveItem(item.id)}
                      className="h-6 w-6 text-red-500 hover:bg-red-50 hover:text-red-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}

              <Separator className="my-2" />

              <div className="space-y-1 px-1">
                <div className="flex justify-between items-center text-sm">
                  <span>Subtotal:</span>
                  <span>{state.restaurant.currency}{subtotal.toFixed(2)}</span>
                </div>
                {parcelCharges > 0 && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-amber-600">Parcel Charges:</span>
                    <span className="text-amber-600">{state.restaurant.currency}{parcelCharges.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-sm">
                  <span>Tax ({taxRate}%):</span>
                  <span>{state.restaurant.currency}{taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-base font-semibold pt-2 border-t">
                  <span>Total:</span>
                  <span>{state.restaurant.currency}{totalWithTax.toFixed(2)}</span>
                </div>
              </div>

              <Button
                onClick={handlePlaceOrder}
                className="w-full bg-charcoal text-white hover:bg-charcoal/90 mt-3 h-10"
                disabled={isPlacingOrder}
              >
                {isPlacingOrder ? "Placing Order..." : "Place Order"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }
