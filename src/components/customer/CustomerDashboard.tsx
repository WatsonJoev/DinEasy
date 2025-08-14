import { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/contexts/AppContext";
import { MenuCard } from "./MenuCard";
import { Cart } from "./Cart";
import { OrderStatus } from "./OrderStatus";
import { MenuFilters } from "./MenuFilters";
import { ShoppingCart, Clock, Menu } from "lucide-react";
import { supabase } from '../../lib/supabaseClient'; 
import { fetchCartItems } from "@/lib/utils";

type MenuItemType = {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  food_type: string;
  recommended?: boolean;
  spiceLevel?: "mild" | "medium" | "hot";
  preparationTime?: number;
};

export default function CustomerDashboard() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedFoodType, setSelectedFoodType] = useState("all");
  const [showRecommended, setShowRecommended] = useState(false);
  const [searchTerm, setSearchTerm] = useState(""); // State for search term
  const { state, isMenuItemAvailable, dispatch } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState<MenuItemType[]>([]);
  const [loading, setLoading] = useState(true);

  // Determine active tab from URL path
  const getTabFromPath = (path: string) => {
    if (path.includes("/cart")) return "cart";
    if (path.includes("/orders")) return "orders";
    return "menu";
  };

  const [activeTab, setActiveTab] = useState(getTabFromPath(location.pathname));


  useEffect(() => {
    const currentPath = location.pathname;
    const targetPath = `/customer/${activeTab}`;
    if (currentPath !== targetPath) {
      navigate(targetPath, { replace: true });
    }
  }, [activeTab]);

  // Sync activeTab if user navigates externally
  useEffect(() => {
    const tab = getTabFromPath(location.pathname);
    if (tab !== activeTab) {
      setActiveTab(tab);
    }
  }, [location.pathname]);

  const categories = useMemo(() => {
    const unique = new Set((menuItems ?? []).map((item) => item.category));
    return Array.from(unique);
  }, [menuItems]);

  const filteredItems = menuItems.filter((item) => {
    // Fix: Cast item to MenuItem to satisfy isMenuItemAvailable type
    if (!isMenuItemAvailable(item as any)) return false;
    if (selectedCategory !== "All" && item.category !== selectedCategory)
      return false;
    if (selectedFoodType !== "all" && item.food_type !== selectedFoodType)
      return false;
    if (showRecommended && !item.recommended) return false;
    if (searchTerm && !item.name.toLowerCase().includes(searchTerm.toLowerCase())) // Search functionality
      return false;
    return true;
  });

  const activeOrders = state.orders.filter(
    (order) =>
      order.status !== "completed" &&
      order.tableNumber === state.restaurant.table
  );

  useEffect(() => {
    async function fetchMenu() {
      const { data, error } = await supabase.from('menu_items').select('*');
      console.log("Fetched data:", data, "Error:", error);
      if (error) {
        setMenuItems([]);
      } else {
        const mappedData = (data ?? []).map(item => ({
          ...item,
          spiceLevel: item.spice_level,
          preparationTime: item.preparation_time
        }));
        setMenuItems(mappedData);
      }
      setLoading(false);
    }
    fetchMenu();
  }, []);

  useEffect(() => {
    async function fetchAndSyncCart() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const items = await fetchCartItems(user.id);
        const orderItems = items.map(item => ({
          id: item.id,
          menuItem: item.menu_items,
          quantity: item.quantity,
          orderType: item.order_type,
          spiceLevel: item.spice_level,
          timestamp: item.timestamp || new Date().toISOString(),
        }));
        dispatch({ type: "SET_CART", payload: orderItems });
      }
    }
    fetchAndSyncCart();
  }, [dispatch]);

  if (loading) {
    return (
      <div className="px-4 mt-4 grid grid-cols-1 gap-4 animate-pulse">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-32 bg-gray-200 rounded-lg shadow-sm"
            style={{ opacity: 0.7 }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className="pb-20 min-h-screen bg-gradient-to-br from-sunglow/10 to-olivine/10 transition-opacity duration-500"
      style={{ opacity: loading ? 0 : 1 }}
    >
      <div className="px-4">
        {activeTab === "menu" && (
          <div className="space-y-4">
            <MenuFilters
              selectedCategory={selectedCategory}
              selectedFoodType={selectedFoodType}
              showRecommended={showRecommended}
              categories={categories}
              onCategoryChange={setSelectedCategory}
              onFoodTypeChange={setSelectedFoodType}
              onRecommendedToggle={() => setShowRecommended(!showRecommended)}
              onSearchChange={setSearchTerm} // Pass the search handler
            />
            <div className="grid grid-cols-1 gap-4 mt-4">
              {filteredItems.map(item => (
                <MenuCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        )}

        {activeTab === "cart" && <Cart />}
        {activeTab === "orders" && <OrderStatus />}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-charcoal/10 shadow-lg">
        <div className="flex justify-around items-center py-2">
          <button
            onClick={() => setActiveTab("menu")}
            className={`flex flex-col items-center py-2 px-4 rounded-lg transition-colors ${
              activeTab === "menu"
                ? "text-charcoal bg-charcoal/10"
                : "text-gray-600"
            }`}
            aria-label="Menu Tab"
          >
            <Menu className="w-5 h-5" />
            <span className="text-xs mt-1">Menu</span>
          </button>

          <button
            onClick={() => setActiveTab("cart")}
            className={`flex flex-col items-center py-2 px-4 rounded-lg transition-colors relative ${
              activeTab === "cart"
                ? "text-pumpkin bg-pumpkin/10"
                : "text-gray-600"
            }`}
            aria-label="Cart Tab"
          >
            <ShoppingCart className="w-5 h-5" />
            <span className="text-xs mt-1">Cart</span>
            {state.currentOrder.length > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-pumpkin"
              >
                {state.currentOrder.length}
              </Badge>
            )}
          </button>

          <button
            onClick={() => setActiveTab("orders")}
            className={`flex flex-col items-center py-2 px-4 rounded-lg transition-colors relative ${
              activeTab === "orders"
                ? "text-zomp bg-zomp/10"
                : "text-gray-600"
            }`}
            aria-label="Orders Tab"
          >
            <Clock className="w-5 h-5" />
            <span className="text-xs mt-1">Orders</span>
            {activeOrders.length > 0 && (
              <Badge
                variant="secondary"
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-zomp text-white"
              >
                {activeOrders.length}
              </Badge>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
