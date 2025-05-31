
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/contexts/AppContext';
import { MenuCard } from './MenuCard';
import { Cart } from './Cart';
import { OrderStatus } from './OrderStatus';
import { MenuFilters } from './MenuFilters';
import { MobileHeader } from '../MobileHeader';
import { Home, ShoppingCart, Clock, Menu } from 'lucide-react';

export function CustomerDashboard() {
  const { state, isMenuItemAvailable } = useApp();
  const [activeTab, setActiveTab] = useState('menu');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedFoodType, setSelectedFoodType] = useState('all');
  const [showRecommended, setShowRecommended] = useState(false);

  const categories = [...new Set(state.menuItems.map(item => item.category))];
  
  const filteredItems = state.menuItems.filter(item => {
    // Check if item is available during current time
    if (!isMenuItemAvailable(item)) return false;
    
    // Category filter
    if (selectedCategory !== 'All' && item.category !== selectedCategory) return false;
    
    // Food type filter
    if (selectedFoodType !== 'all' && item.foodType !== selectedFoodType) return false;
    
    // Recommended filter
    if (showRecommended && !item.recommended) return false;
    
    return true;
  });

  const activeOrders = state.orders.filter(order => 
    order.status !== 'completed' && order.tableNumber === state.restaurant.table
  );

  return (
    <div className="pb-20 min-h-screen bg-gradient-to-br from-sunglow/10 to-olivine/10">
      {/* Mobile Header */}
      <MobileHeader activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Content */}
      <div className="px-4 py-6">
        {activeTab === 'menu' && (
          <div className="space-y-4">
            {/* Filters */}
            <MenuFilters
              selectedCategory={selectedCategory}
              selectedFoodType={selectedFoodType}
              showRecommended={showRecommended}
              categories={categories}
              onCategoryChange={setSelectedCategory}
              onFoodTypeChange={setSelectedFoodType}
              onRecommendedToggle={() => setShowRecommended(!showRecommended)}
            />

            {/* Menu Items Grid */}
            <div className="grid grid-cols-1 gap-4 mt-4">
              {filteredItems.map(item => (
                <MenuCard key={item.id} item={item} />
              ))}
              {filteredItems.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No items match your current filters.
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'cart' && <Cart />}
        {activeTab === 'orders' && <OrderStatus />}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-charcoal/10 shadow-lg">
        <div className="flex justify-around items-center py-2">
          <button
            onClick={() => setActiveTab('menu')}
            className={`flex flex-col items-center py-2 px-4 rounded-lg transition-colors ${
              activeTab === 'menu' 
                ? 'text-charcoal bg-charcoal/10' 
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
                ? 'text-pumpkin bg-pumpkin/10' 
                : 'text-gray-600'
            }`}
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
            onClick={() => setActiveTab('orders')}
            className={`flex flex-col items-center py-2 px-4 rounded-lg transition-colors relative ${
              activeTab === 'orders' 
                ? 'text-zomp bg-zomp/10' 
                : 'text-gray-600'
            }`}
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
