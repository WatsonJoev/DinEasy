
import { useEffect, useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { toast } from '@/hooks/use-toast';
import { Bell, Clock, CheckCircle, ChefHat } from 'lucide-react';

export function NotificationSystem() {
  const { state } = useApp();
  const [lastOrderUpdate, setLastOrderUpdate] = useState<string>('');

  useEffect(() => {
    // Check for order status updates
    const userOrders = state.orders.filter(order => 
      order.tableNumber === state.restaurant.table
    );

    const latestOrder = userOrders
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

    if (latestOrder && latestOrder.id !== lastOrderUpdate) {
      setLastOrderUpdate(latestOrder.id);
      
      // Show notification based on order status
      if (state.userType === 'customer') {
        switch (latestOrder.status) {
          case 'preparing':
            toast({
              title: "Order Update",
              description: `Your order #${latestOrder.id.slice(-4)} is now being prepared!`,
              duration: 5000,
            });
            break;
          case 'ready':
            toast({
              title: "Order Ready! 🍽️",
              description: `Your order #${latestOrder.id.slice(-4)} is ready for pickup!`,
              duration: 10000,
            });
            break;
          case 'completed':
            toast({
              title: "Order Completed",
              description: `Thank you for dining with us! Order #${latestOrder.id.slice(-4)} completed.`,
              duration: 5000,
            });
            break;
        }
      }
    }
  }, [state.orders, state.userType, state.restaurant.table, lastOrderUpdate]);

  // Show low stock alerts for admin/chef
  useEffect(() => {
    if ((state.userType === 'admin' || state.userType === 'chef') && state.inventory) {
      const lowStockItems = Object.entries(state.inventory)
        .filter(([_, quantity]) => quantity < 10)
        .map(([itemName]) => itemName);

      if (lowStockItems.length > 0) {
        toast({
          title: "Low Stock Alert",
          description: `Running low on: ${lowStockItems.join(', ')}`,
          duration: 8000,
        });
      }
    }
  }, [state.inventory, state.userType]);

  return null; // This component only handles notifications
}
