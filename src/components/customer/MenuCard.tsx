import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useApp } from "@/contexts/AppContext";
import { toast } from "@/hooks/use-toast";
import { Plus, Minus, Clock, Star } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

interface MenuCardProps {
  item: any;
  mode?: "cart" | "edit-order";
  onSelect?: (quantity: number, orderType: string) => void;
}

export function MenuCard({ item, mode = "cart", onSelect }: MenuCardProps) {
  const { state, dispatch, isMenuItemAvailable } = useApp();
  const [orderType, setOrderType] = useState<"dine-in" | "takeaway">(
    mode === "edit-order" ? "takeaway" : "dine-in"
  );
  const [quantity, setQuantity] = useState(0);

  const isAvailable = isMenuItemAvailable(item);
  const isInStock = item.in_stock === true || item.in_stock === "true";

  const getCartItemForType = (type: "dine-in" | "takeaway") =>
    state.currentOrder.find(
      (cartItem) =>
        cartItem.menuItem.id === item.id && cartItem.orderType === type
    );

  const existingCartItem = mode === "cart" ? getCartItemForType(orderType) : null;

  useEffect(() => {
    if (mode === "cart") {
      const matchedItem = getCartItemForType(orderType);
      setQuantity(matchedItem ? matchedItem.quantity : 0);
    } else {
      setQuantity(0);
    }
  }, [orderType, state.currentOrder, mode]);

  const handleQuantityChange = async (newQty: number) => {
    if (mode === "edit-order") {
      setQuantity(newQty);
      onSelect?.(newQty, orderType);
      return;
    }
    const user = await supabase.auth.getUser();
    const userId = user?.data?.user?.id;
    const existingCartItem = getCartItemForType(orderType);
    if (!existingCartItem || !userId) return;
    if (newQty < 1) {
      await supabase
        .from("cart_items")
        .delete()
        .eq("user_id", userId)
        .eq("menu_item_id", item.id)
        .eq("order_type", orderType);
      dispatch({ type: "REMOVE_FROM_CART", payload: existingCartItem.id });
      toast({
        title: "Item removed",
        description: `${item.name} (${orderType}) removed from cart.`,
      });
    } else {
      await supabase
        .from("cart_items")
        .update({ quantity: newQty })
        .eq("user_id", userId)
        .eq("menu_item_id", item.id)
        .eq("order_type", orderType);
      dispatch({
        type: "UPDATE_CART_ITEM",
        payload: { id: existingCartItem.id, quantity: newQty },
      });
    }
  };

  const handleAddToCart = async () => {
    if (!isInStock || !isAvailable) {
      toast({
        title: "Item unavailable",
        description: !isAvailable
          ? "This item is not available at this time"
          : "This item is currently out of stock",
        variant: "destructive",
      });
      return;
    }
    if (mode === "edit-order") {
      setQuantity(1);
      onSelect?.(1, orderType);
      return;
    }
    const user = await supabase.auth.getUser();
    const userId = user?.data?.user?.id;
    if (!userId) return;
    const existingCartItem = getCartItemForType(orderType);
    await supabase.from("cart_items").upsert([
      {
        user_id: userId,
        menu_item_id: item.id,
        quantity: 1,
        order_type: orderType,
        price: item.price,
        updated_at: new Date().toISOString(),
      },
    ], {
      onConflict: "user_id,menu_item_id,order_type"
    });
    if (existingCartItem) {
      dispatch({
        type: "UPDATE_CART_ITEM",
        payload: {
          id: existingCartItem.id,
          quantity: existingCartItem.quantity + 1,
        },
      });
    } else {
      dispatch({
        type: "ADD_TO_CART",
        payload: {
          id: crypto.randomUUID(),
          menuItem: item,
          quantity: 1,
          orderType,
          spiceLevel: item.spiceLevel || "mild",
          timestamp: new Date().toISOString(),
        },
      });
    }
    toast({
      title: "Added to cart!",
      description: `1x ${item.name} (${orderType}) added to your order`,
    });
  };

  const getFoodTypeSticker = () => (
    <div
      className={`w-4 h-4 border-2 ${item.foodType === "non-veg" ? "border-pumpkin" : "border-olivine"} flex items-center justify-center`}
    >
      <div
        className={`w-2 h-2 rounded-full ${item.foodType === "non-veg" ? "bg-pumpkin" : "bg-olivine"}`}
      ></div>
    </div>
  );

  const getSpiceLevelBadge = () => {
    const spice = item.spiceLevel || item.spice_level;
    if (!spice) return null;
    const colors = {
      mild: "bg-olivine text-white",
      medium: "bg-sunglow text-charcoal",
      hot: "bg-pumpkin text-white",
    };
    const emojis = {
      mild: "🌶️",
      medium: "🌶️🌶️",
      hot: "🌶️🌶️🌶️",
    };
    return (
      <Badge className={`${colors[spice]} text-xs`}>
        {emojis[spice]} {spice}
      </Badge>
    );
  };

  const formatAvailableTime = (from?: string, to?: string) => {
    if (!from || !to) return "";
    const format = (timeStr: string) => {
      const [hourStr, minuteStr] = timeStr.split(":");
      let hour = parseInt(hourStr, 10);
      const minute = parseInt(minuteStr, 10);
      const ampm = hour >= 12 ? "PM" : "AM";
      hour = hour % 12 || 12;
      return `${hour}:${minute.toString().padStart(2, "0")} ${ampm}`;
    };
    return `${format(from)} – ${format(to)}`;
  };

  return (
    <Card className="overflow-hidden shadow-sm border-charcoal/10 hover:shadow-md transition-shadow">
      <div className="flex flex-col sm:flex-row">
        <div className="w-full sm:w-32 h-32 sm:h-auto flex-shrink-0 relative">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover sm:rounded-none border border-white"
            draggable={false}
          />
          {!isAvailable && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center pointer-events-none">
              <Clock className="w-4 h-4 text-white" />
            </div>
          )}
        </div>

        <CardContent className="flex-1 p-3">
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1 pr-2">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                {getFoodTypeSticker()}
                <h3 className="font-semibold text-sm leading-tight text-charcoal">
                  {item.name}
                </h3>
                {item.recommended && (
                  <Star className="w-3 h-3 text-sunglow fill-current" />
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {item.description}
              </p>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                {getSpiceLevelBadge()}
                <Badge variant="outline" className="text-xs">
                  {item.preparationTime || item.preparation_time} min
                </Badge>
              </div>
            </div>
            <div className="text-right mt-2 sm:mt-0">
              <div className="font-bold text-charcoal text-sm">
                {state.restaurant.currency}
                {item.price.toFixed(2)}
              </div>
              {!isInStock || !isAvailable ? (
                <Badge variant="destructive" className="text-xs mt-1">
                  {!isAvailable ? "Not Available" : "Out of Stock"}
                </Badge>
              ) : null}
            </div>
          </div>

          {isInStock && isAvailable ? (
            <div className="space-y-3">
              <RadioGroup
                value={orderType}
                onValueChange={(value: "dine-in" | "takeaway") =>
                  setOrderType(value)
                }
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="dine-in" id={`dine-in-${item.id}`} />
                  <Label
                    htmlFor={`dine-in-${item.id}`}
                    className="text-xs cursor-pointer text-blue-900"
                  >
                    Dine-in
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem
                    value="takeaway"
                    id={`takeaway-${item.id}`}
                    className="text-red-500"
                  />
                  <Label
                    htmlFor={`takeaway-${item.id}`}
                    className="text-xs cursor-pointer"
                  >
                    Takeaway
                  </Label>
                </div>
              </RadioGroup>

              <div className="flex items-center justify-end space-x-2">
                {(mode === "cart" && !existingCartItem) ||
                (mode === "edit-order" && quantity === 0) ? (
                  <Button
                    onClick={handleAddToCart}
                    className="bg-pumpkin hover:bg-pumpkin/90 text-white text-xs px-3 py-1 h-7 min-w-[90px]"
                    type="button"
                  >
                    {mode === "edit-order" ? "Add to Order" : "Add to Cart"}
                  </Button>
                ) : (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleQuantityChange(quantity - 1)}
                      className="h-7 w-7 p-0"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span className="text-sm font-medium w-6 text-center select-none">
                      {quantity}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleQuantityChange(quantity + 1)}
                      className="h-7 w-7 p-0"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Available Tomorrow
              </span>
              <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                {formatAvailableTime(
                  item.availableFrom || item.available_from,
                  item.availableTo || item.available_to
                )}
              </Badge>
            </div>
          )}
        </CardContent>
      </div>
    </Card>
  );
}