import { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/contexts/AppContext";
import { MenuCard } from "./MenuCard";
import { Cart } from "./Cart";
import { OrderStatus } from "./OrderStatus";
import { MenuFilters } from "./MenuFilters";
import { ShoppingCart, Clock, Menu as MenuIcon, Search, X } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetchMenuItems } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface CustomerDashboardProps {
  activeTab: string;
}

export function CustomerDashboard({ activeTab }: CustomerDashboardProps) {
  const { state } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const { orderId } = useParams<{ orderId?: string }>(); // Extract orderId from URL

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedFoodType, setSelectedFoodType] = useState("all");
  const [showRecommended, setShowRecommended] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false); // New state for menu open status
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function isMenuItemAvailable(item: any) {
    return true;
  }

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  useEffect(() => {
    setLoading(true);
    fetchMenuItems()
      .then((items) => {
        setMenuItems(items || []);
        console.log("Fetched menu items:", items);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const categories = useMemo(
    () => ["All", ...new Set(menuItems.map((item) => item.category))],
    [menuItems]
  );

  const filteredItems = menuItems.filter((item) => {
    if (!isMenuItemAvailable(item)) return false;
    if (selectedCategory !== "All" && item.category !== selectedCategory) return false;
    if (
      selectedFoodType !== "all" &&
      (item.foodType !== selectedFoodType && item.food_type !== selectedFoodType)
    ) return false;
    if (showRecommended && !item.recommended) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return item.name.toLowerCase().includes(query);
    }
    return true;
  });

  const activeOrders = state.orders.filter(
    (order) => order.status !== "completed" && order.tableNumber === state.restaurant.table
  );

  return (
    <div className="pb-16 min-h-screen bg-gradient-to-br from-sunglow/10 to-olivine/10">
      
      <div className="px-3 py-4">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="p-3 rounded-lg bg-white shadow">
                <Skeleton className="w-full h-32 mb-3 rounded" />
                <Skeleton className="h-5 w-2/3 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-1" />
                <Skeleton className="h-4 w-1/3 mb-2" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16 rounded" />
                  <Skeleton className="h-6 w-16 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : activeTab === "menu" && (
          <div className="space-y-3" key="menu-container">
            <div className="flex gap-2 items-center">
              <div className="flex-1 relative">
                <Input
                  type="text"
                  placeholder="Search in Saravana Bhavan"
                  className="pl-9 bg-gray-100 border-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
              <DropdownMenu onOpenChange={setIsMenuOpen}> {/* Add onOpenChange handler */}
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline"
                    size="icon"
                    className="shrink-0"
                    aria-label="Menu filters"
                  >
                    {isMenuOpen ? (
                      <X className="w-4 h-4 transition-transform duration-300 rotate-90" /> // X icon with rotation
                    ) : (
                      <MenuIcon className="w-4 h-4 transition-transform duration-300" /> // Hamburger icon
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="end" 
                  className="w-64 p-2"
                >
                  <MenuFilters
                    selectedCategory={selectedCategory}
                    selectedFoodType={selectedFoodType}
                    showRecommended={showRecommended}
                    categories={categories}
                    onCategoryChange={setSelectedCategory}
                    onFoodTypeChange={setSelectedFoodType}
                    onRecommendedToggle={() => setShowRecommended((prev) => !prev)}
                    menuItems={menuItems}
                  />
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            <div className="grid grid-cols-1 gap-4 mt-4">
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => (
                  <MenuCard key={item.id} item={item} />
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No items match your current filters.
                </div>
              )}
            </div>
          </div>
        )}
        {activeTab === "cart" && <Cart key="cart-component" />} 
        {activeTab === "orders" && <OrderStatus key="orders-component" orderId={orderId} />} 
      </div>
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-charcoal/10 shadow-lg z-10">
        <div className="flex justify-around items-center py-1.5">
          <button
            onClick={() => navigate("/customer")}
            className={`flex flex-col items-center py-1.5 px-3 rounded-lg transition-colors ${
              activeTab === "menu" ? "text-charcoal bg-charcoal/10" : "text-gray-600"
            }`}
            aria-label="Menu Tab"
          >
            <MenuIcon className="w-4 h-4" />
            <span className="text-xs mt-0.5">Menu</span>
          </button>
          <button
            onClick={() => navigate("/customer/cart")}
            className={`flex flex-col items-center py-1.5 px-3 rounded-lg transition-colors relative ${
              activeTab === "cart" ? "text-pumpkin bg-pumpkin/10" : "text-gray-600"
            }`}
            aria-label="Cart Tab"
          >
            <ShoppingCart className="w-4 h-4" />
            <span className="text-xs mt-0.5">Cart</span>
            {state.currentOrder.length > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-0.5 -right-0.5 h-4 w-4 flex items-center justify-center p-0 text-xs bg-pumpkin"
              >
                {state.currentOrder.length}
              </Badge>
            )}
          </button>
          <button
            onClick={() => navigate("/customer/orders")}
            className={`flex flex-col items-center py-1.5 px-3 rounded-lg transition-colors relative ${
              activeTab === "orders" ? "text-zomp bg-zomp/10" : "text-gray-600"
            }`}
            aria-label="Orders Tab"
          >
            <Clock className="w-4 h-4" />
            <span className="text-xs mt-0.5">Orders</span>
            {activeOrders.length > 0 && (
              <Badge
                variant="secondary"
                className="absolute -top-0.5 -right-0.5 h-4 w-4 flex items-center justify-center p-0 text-xs bg-zomp text-white"
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
