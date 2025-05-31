
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useApp } from '@/contexts/AppContext';
import { Menu, Home, User, Clock } from 'lucide-react';

interface MobileHeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function MobileHeader({ activeTab, onTabChange }: MobileHeaderProps) {
  const { state, dispatch } = useApp();
  const [isOpen, setIsOpen] = useState(false);

  const handleTabChange = (tab: string) => {
    onTabChange(tab);
    setIsOpen(false);
  };

  const handleUserSwitch = () => {
    dispatch({ type: 'SET_USER_TYPE', payload: null });
    dispatch({ type: 'SET_AUTHENTICATED', payload: false });
    setIsOpen(false);
  };

  return (
    <div className="bg-gradient-to-r from-charcoal to-zomp p-4 text-white sticky top-0 z-50 shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h1 className="text-lg font-bold truncate">{state.restaurant.name}</h1>
          <p className="text-sm opacity-90">{state.restaurant.table}</p>
        </div>
        
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
              <Menu className="w-6 h-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-64">
            <div className="space-y-4 mt-8">
              <h2 className="text-lg font-semibold mb-4">Navigation</h2>
              
              {state.userType === 'customer' && (
                <>
                  <Button
                    variant={activeTab === 'menu' ? 'default' : 'ghost'}
                    onClick={() => handleTabChange('menu')}
                    className="w-full justify-start"
                  >
                    <Home className="w-4 h-4 mr-2" />
                    Menu
                  </Button>
                  <Button
                    variant={activeTab === 'cart' ? 'default' : 'ghost'}
                    onClick={() => handleTabChange('cart')}
                    className="w-full justify-start"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Cart
                  </Button>
                  <Button
                    variant={activeTab === 'orders' ? 'default' : 'ghost'}
                    onClick={() => handleTabChange('orders')}
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
                  onClick={handleUserSwitch}
                  className="w-full"
                >
                  Switch User
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
