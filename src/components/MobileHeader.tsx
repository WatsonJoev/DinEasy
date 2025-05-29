
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/contexts/AppContext';
import { Menu, User, ChefHat, Settings } from 'lucide-react';

export function MobileHeader() {
  const { state, dispatch } = useApp();
  const [isOpen, setIsOpen] = useState(false);

  const handleUserTypeChange = (userType: 'customer' | 'chef' | 'admin') => {
    dispatch({ type: 'SET_USER_TYPE', payload: userType });
    if (userType === 'admin') {
      dispatch({ type: 'SET_AUTHENTICATED', payload: false });
    } else {
      dispatch({ type: 'SET_AUTHENTICATED', payload: true });
    }
    setIsOpen(false);
  };

  return (
    <div className="bg-gradient-to-r from-charcoal to-zomp text-white sticky top-0 z-50 shadow-lg">
      <div className="flex items-center justify-between p-4">
        <div className="flex-1">
          <h1 className="text-lg font-bold">{state.restaurant.name}</h1>
          <p className="text-xs opacity-90">{state.restaurant.table}</p>
        </div>
        
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72">
            <div className="py-6">
              <h3 className="text-lg font-semibold mb-4">Switch View</h3>
              <div className="space-y-3">
                <Button
                  variant={state.userType === 'customer' ? 'default' : 'outline'}
                  onClick={() => handleUserTypeChange('customer')}
                  className="w-full justify-start"
                >
                  <User className="w-4 h-4 mr-2" />
                  Customer View
                  {state.userType === 'customer' && (
                    <Badge variant="secondary" className="ml-auto">Active</Badge>
                  )}
                </Button>
                
                <Button
                  variant={state.userType === 'chef' ? 'default' : 'outline'}
                  onClick={() => handleUserTypeChange('chef')}
                  className="w-full justify-start"
                >
                  <ChefHat className="w-4 h-4 mr-2" />
                  Chef View
                  {state.userType === 'chef' && (
                    <Badge variant="secondary" className="ml-auto">Active</Badge>
                  )}
                </Button>
                
                <Button
                  variant={state.userType === 'admin' ? 'default' : 'outline'}
                  onClick={() => handleUserTypeChange('admin')}
                  className="w-full justify-start"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Admin View
                  {state.userType === 'admin' && (
                    <Badge variant="secondary" className="ml-auto">Active</Badge>
                  )}
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
