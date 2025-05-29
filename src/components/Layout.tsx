
import { ReactNode } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface LayoutProps {
  children: ReactNode;
  title?: string;
  showUserSwitch?: boolean;
}

export function Layout({ children, title, showUserSwitch = true }: LayoutProps) {
  const { state, dispatch } = useApp();

  const handleUserTypeChange = (userType: 'customer' | 'chef' | 'admin') => {
    dispatch({ type: 'SET_USER_TYPE', payload: userType });
    if (userType === 'admin') {
      dispatch({ type: 'SET_AUTHENTICATED', payload: false });
    } else {
      dispatch({ type: 'SET_AUTHENTICATED', payload: true });
    }
  };

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="bg-earth-brown text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">{state.restaurant.name}</h1>
              {title && <p className="text-sm opacity-90">{title}</p>}
            </div>
            
            {showUserSwitch && (
              <Card className="p-3 bg-white/10 border-white/20">
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={state.userType === 'customer' ? 'secondary' : 'ghost'}
                    onClick={() => handleUserTypeChange('customer')}
                    className="text-xs"
                  >
                    Customer
                  </Button>
                  <Button
                    size="sm"
                    variant={state.userType === 'chef' ? 'secondary' : 'ghost'}
                    onClick={() => handleUserTypeChange('chef')}
                    className="text-xs"
                  >
                    Chef
                  </Button>
                  <Button
                    size="sm"
                    variant={state.userType === 'admin' ? 'secondary' : 'ghost'}
                    onClick={() => handleUserTypeChange('admin')}
                    className="text-xs"
                  >
                    Admin
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}
