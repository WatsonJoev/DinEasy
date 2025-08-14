import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useApp } from "@/contexts/AppContext";
import { Menu, Home, User, Clock, LogOut } from "lucide-react";

interface MobileHeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function MobileHeader({ activeTab, onTabChange }: MobileHeaderProps) {
  const { state, dispatch } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleTabChange = (tab: string) => {
    onTabChange(tab);
    setIsOpen(false);
  };

  const handleLogout = () => {
    dispatch({ type: "SET_USER_TYPE", payload: null });
    dispatch({ type: "SET_AUTHENTICATED", payload: false });
    setIsOpen(false);
    navigate("/"); // Redirect to home
  };

  const tabLabelMap: Record<string, string> = {
    menu: "Menu",
    cart: "Cart",
    orders: "Orders",
  };

  return (
    <div className="text-black sticky top-0 z-50">
      <div className="flex items-center justify-between">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-black hover:bg-white/20"
            >
              <Menu className="w-6 h-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-64">
            <div className="space-y-4 mt-8">
              <div>
                <h2 className="text-lg font-semibold">
                  {state.tableNumber
                    ? `Table Number: ${state.tableNumber}`
                    : "Navigation"}
                </h2>
                {activeTab && (
                  <p className="text-sm text-muted-foreground mt-1">
                    You are on: <span className="font-semibold">{tabLabelMap[activeTab]}</span>
                  </p>
                )}
              </div>

              {state.userType === "customer" && (
                <>
                  <Button
                    variant={activeTab === "menu" ? "default" : "ghost"}
                    onClick={() => handleTabChange("menu")}
                    className="w-full justify-start"
                  >
                    <Home className="w-4 h-4 mr-2" />
                    Menu
                  </Button>
                  <Button
                    variant={activeTab === "cart" ? "default" : "ghost"}
                    onClick={() => handleTabChange("cart")}
                    className="w-full justify-start"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Cart
                  </Button>
                  <Button
                    variant={activeTab === "orders" ? "default" : "ghost"}
                    onClick={() => handleTabChange("orders")}
                    className="w-full justify-start"
                  >
                    <Clock className="w-4 h-4 mr-2" />
                    Orders
                  </Button>
                </>
              )}

              <div className="border-t pt-4 mt-6">
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="w-full justify-start"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
