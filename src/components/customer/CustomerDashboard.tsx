
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/contexts/AppContext';
import { MenuCard } from './MenuCard';
import { Cart } from './Cart';
import { OrderStatus } from './OrderStatus';
import { Home, ShoppingCart, Clock, Menu } from 'lucide-react';

export function CustomerDashboard() {
  const { state } = useApp();
  const [activeTab, setActiveTab] = useState('menu');

  const categories = [...new Set(state.menuItems.map(item => item.category))];
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredItems = selectedCategory === 'All'
    ? state.menuItems
    : state.menuItems.filter(item => item.category === selectedCategory);

  const activeOrders = state.orders.filter(order => 
    order.status !== 'completed' && order.tableNumber === state.restaurant.table
  );

  return (
    <div className="pb-20 min-h-screen bg-cream/30">
      {/* Header - Mobile Optimized */}
      <div className="bg-gradient-to-r from-sage-green to-warm-orange p-4 text-earth-brown sticky top-0 z-10 shadow-lg">
        <div className="text-center">
          <h1 className="text-xl font-bold">{state.restaurant.name}</h1>
          <p className="text-sm opacity-90">{state.restaurant.table}</p>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6">
        {activeTab === 'menu' && (
          <div className="space-y-4">
            {/* Category Filter - Top Fixed */}
            <div className="bg-white/80 backdrop-blur-sm sticky top-20 z-10 p-4 -mx-4 border-b border-sage-green/20">
              <h2 className="font-semibold mb-3">Browse Menu</h2>
              <div className="flex gap-2 overflow-x-auto pb-2">
                <Button
                  variant={selectedCategory === 'All' ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory('All')}
                  size="sm"
                  className="whitespace-nowrap"
                >
                  All
                </Button>
                {categories.map(category => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? 'default' : 'outline'}
                    onClick={() => setSelectedCategory(category)}
                    size="sm"
                    className="whitespace-nowrap"
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>

            {/* Menu Items Grid - Mobile Optimized */}
            <div className="grid grid-cols-1 gap-4 mt-4">
              {filteredItems.map(item => (
                <MenuCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'cart' && <Cart />}
        {activeTab === 'orders' && <OrderStatus />}
      </div>

      {/* Bottom Navigation - Mobile Style */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-sage-green/20 shadow-lg">
        <div className="flex justify-around items-center py-2">
          <button
            onClick={() => setActiveTab('menu')}
            className={`flex flex-col items-center py-2 px-4 rounded-lg transition-colors ${
              activeTab === 'menu' 
                ? 'text-sage-green bg-sage-green/10' 
                : 'text-gray-600'
            }`}
          >
            <Menu className="w-5 h-5" />
            <span className="text-xs mt-1">Menu</span>
          </button>
          
          <button
            onClick={() => setActiveTab('cart')}
            className={`flex flex-col items-center py-2 px-4 rounded-lg transition-colors relative ${
              activeTab === 'cart' 
                ? 'text-warm-orange bg-warm-orange/10' 
                : 'text-gray-600'
            }`}
          >
            <ShoppingCart className="w-5 h-5" />
            <span className="text-xs mt-1">Cart</span>
            {state.currentOrder.length > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
              >
                {state.currentOrder.length}
              </Badge>
            )}
          </button>
          
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex flex-col items-center py-2 px-4 rounded-lg transition-colors relative ${
              activeTab === 'orders' 
                ? 'text-earth-brown bg-earth-brown/10' 
                : 'text-gray-600'
            }`}
          >
            <Clock className="w-5 h-5" />
            <span className="text-xs mt-1">Orders</span>
            {activeOrders.length > 0 && (
              <Badge 
                variant="secondary" 
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
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
