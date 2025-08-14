import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useApp } from "@/contexts/AppContext";
import { MenuCard } from "./MenuCard";
import { MenuFilters } from "./MenuFilters";
import { toast } from "@/hooks/use-toast";

interface AddMoreModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: any;
}

export function AddMoreModal({ open, onOpenChange, order }: AddMoreModalProps) {
  const { state, dispatch, isMenuItemAvailable } = useApp();

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedFoodType, setSelectedFoodType] = useState("all");
  const [showRecommended, setShowRecommended] = useState(false);
  const [selectedItems, setSelectedItems] = useState<
    { menuItem: any; quantity: number; orderType: string }[]
  >([]);

  const categories = [...new Set(state.menuItems.map((item) => item.category))];

  const filteredItems = state.menuItems.filter((item) => {
    if (!isMenuItemAvailable(item)) return false;
    if (selectedCategory !== "All" && item.category !== selectedCategory)
      return false;
    if (selectedFoodType !== "all" && item.foodType !== selectedFoodType)
      return false;
    if (showRecommended && !item.recommended) return false;
    return true;
  });

  const handleItemSelect = (
    menuItem: any,
    quantity: number,
    orderType: string
  ) => {
    if (quantity <= 0) {
      // Remove from selectedItems if quantity is zero
      setSelectedItems((prev) =>
        prev.filter(
          (i) => !(i.menuItem.id === menuItem.id && i.orderType === orderType)
        )
      );
      return;
    }

    setSelectedItems((prev) => {
      const existing = prev.find(
        (i) => i.menuItem.id === menuItem.id && i.orderType === orderType
      );
      if (existing) {
        return prev.map((i) =>
          i.menuItem.id === menuItem.id && i.orderType === orderType
            ? { ...i, quantity }
            : i
        );
      }
      return [...prev, { menuItem, quantity, orderType }];
    });
  };

  const handleAddMore = () => {
    console.log("Order prop:", order);
    console.log("Order ID:", order?.id);

    if (selectedItems.length === 0) {
      toast({
        title: "No items selected",
        description: "Please add items to your order first",
        variant: "destructive",
      });
      return;
    }

    if (!order?.id) {
      toast({
        title: "Order ID Missing",
        description: "Cannot update order without a valid ID",
        variant: "destructive",
      });
      return;
    }

    // Restrict dine-in items during 'preparing' status
    if (order.status === "preparing" && selectedItems.some(item => item.orderType === "dine-in")) {
      toast({
        title: "Cannot Add Dine-In Items",
        description: "Only takeaway items can be added while your order is being prepared.",
        variant: "destructive",
      });
      return;
    }

    dispatch({
      type: "ADD_TO_EXISTING_ORDER",
      payload: {
        orderId: order.id,
        items: selectedItems.map((item) => ({
          id: item.menuItem.id,
          menuItem: item.menuItem,
          quantity: item.quantity,
          orderType: item.orderType,
          spiceLevel: 'medium', // Default spice level
          timestamp: new Date().toISOString()
        })),
      },
    });

    toast({
      title: "Items added!",
      description: `${selectedItems.length} items added to your order`,
    });

    setSelectedItems([]);
    onOpenChange(false);
  };   

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-lg text-charcoal">
            Add More Items
          </DialogTitle>
        </DialogHeader>

        {/* Filters */}
        <MenuFilters
          onSearchChange={() => {}}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          categories={categories}
          selectedFoodType={selectedFoodType}
          onFoodTypeChange={setSelectedFoodType}
          showRecommended={showRecommended}
          onRecommendedToggle={() => setShowRecommended((prev) => !prev)}
        />

        <div className="flex-1 overflow-y-auto space-y-3 mt-2 px-1">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <MenuCard
                key={item.id}
                item={item}
                mode="edit-order"
                onSelect={(qty, type) => handleItemSelect(item, qty, type)}
              />
            ))
          ) : (
            <p className="text-center text-muted-foreground text-sm py-10">
              No items found based on the selected filters.
            </p>
          )}
        </div>

        <div className="flex gap-2 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleAddMore}
            className="flex-1 bg-pumpkin hover:bg-pumpkin/90 text-white"
          >
            Add to Order
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
