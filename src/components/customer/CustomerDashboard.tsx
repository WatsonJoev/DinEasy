
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useApp } from '@/contexts/AppContext';
import { MenuCard } from './MenuCard';
import { Cart } from './Cart';
import { OrderStatus } from './OrderStatus';

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
    <div className="space-y-6">
      {/* Welcome Section */}
      <Card className="bg-gradient-to-r from-sage-green to-warm-orange text-earth-brown">
        <CardHeader>
          <CardTitle className="text-2xl">
            Welcome to {state.restaurant.name}
          </CardTitle>
          <p className="text-lg opacity-90">
            You're seated at {state.restaurant.table}
          </p>
        </CardHeader>
      </Card>

      {/* Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="menu">Menu</TabsTrigger>
          <TabsTrigger value="order">
            Your Order
            {state.currentOrder.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {state.currentOrder.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="status">
            Order Status
            {activeOrders.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeOrders.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="menu" className="space-y-6">
          {/* Category Filter */}
          <Card>
            <CardHeader>
              <CardTitle>Browse Our Menu</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedCategory === 'All' ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory('All')}
                  size="sm"
                >
                  All
                </Button>
                {categories.map(category => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? 'default' : 'outline'}
                    onClick={() => setSelectedCategory(category)}
                    size="sm"
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Menu Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map(item => (
              <MenuCard key={item.id} item={item} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="order">
          <Cart />
        </TabsContent>

        <TabsContent value="status">
          <OrderStatus />
        </TabsContent>
      </Tabs>
    </div>
  );
}
