
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/contexts/AppContext';
import { toast } from '@/hooks/use-toast';
import { Clock, ChefHat, CheckCircle, Bell } from 'lucide-react';

export function ChefDashboard() {
  const { state, dispatch } = useApp();
  const [lastOrderCount, setLastOrderCount] = useState(0);

  const newOrders = state.orders.filter(order => order.status === 'new');
  const preparingOrders = state.orders.filter(order => order.status === 'preparing');
  const readyOrders = state.orders.filter(order => order.status === 'ready');
  const completedTodayOrders = state.orders.filter(order => order.status === 'completed');

  // Notification for new orders
  useEffect(() => {
    if (newOrders.length > lastOrderCount) {
      // New order received
      toast({
        title: "🔔 New Order Received!",
        description: `Table ${newOrders[newOrders.length - 1]?.tableNumber} has placed an order`,
      });
      
      // Play notification sound (optional)
      if (typeof Audio !== 'undefined') {
        try {
          const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+LvzGomAiB+yOzdlUwHEGnA7+WVRQ==');
          audio.volume = 0.3;
          audio.play().catch(() => {});
        } catch (e) {}
      }
    }
    setLastOrderCount(newOrders.length);
  }, [newOrders.length, lastOrderCount]);

  const handleStatusUpdate = (orderId: string, newStatus: 'preparing' | 'ready') => {
    dispatch({
      type: 'UPDATE_ORDER_STATUS',
      payload: { orderId, status: newStatus }
    });

    const statusMessages = {
      preparing: "Order marked as preparing",
      ready: "Order marked as ready for pickup"
    };

    toast({
      title: statusMessages[newStatus],
      description: `Order #${orderId.slice(-4)} status updated`
    });
  };

  const getTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes === 1) return '1 minute ago';
    return `${minutes} minutes ago`;
  };

  return (
    <div className="space-y-6 p-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-red-700 text-sm">New Orders</CardTitle>
          </CardHeader>
          <CardContent className="text-center pt-0">
            <div className="text-2xl font-bold text-red-700">{newOrders.length}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-blue-700 text-sm">Preparing</CardTitle>
          </CardHeader>
          <CardContent className="text-center pt-0">
            <div className="text-2xl font-bold text-blue-700">{preparingOrders.length}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-green-700 text-sm">Ready</CardTitle>
          </CardHeader>
          <CardContent className="text-center pt-0">
            <div className="text-2xl font-bold text-green-700">{readyOrders.length}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-purple-700 text-sm">Completed Today</CardTitle>
          </CardHeader>
          <CardContent className="text-center pt-0">
            <div className="text-2xl font-bold text-purple-700">{completedTodayOrders.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Active Orders Queue */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <ChefHat className="w-5 h-5" />
          Kitchen Queue
        </h2>

        {/* New Orders */}
        {newOrders.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-medium text-red-700 flex items-center gap-2">
              <Bell className="w-4 h-4" />
              New Orders ({newOrders.length})
            </h3>
            {newOrders.map(order => (
              <Card key={order.id} className="border-red-200 bg-red-50/50">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="destructive">NEW</Badge>
                        <span className="font-semibold">Table {order.tableNumber}</span>
                        <span className="text-sm text-muted-foreground">#{order.id.slice(-4)}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {getTimeAgo(order.timestamp)}
                      </div>
                    </div>
                    <Button
                      onClick={() => handleStatusUpdate(order.id, 'preparing')}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Start Preparing
                    </Button>
                  </div>
                  
                  <div className="space-y-1">
                    {order.items.map((item: any, index: number) => (
                      <div key={index} className="text-sm flex justify-between">
                        <span>{item.quantity}x {item.menuItem.name}</span>
                        <span className="text-muted-foreground">${(item.menuItem.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Preparing Orders */}
        {preparingOrders.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-medium text-blue-700 flex items-center gap-2">
              <ChefHat className="w-4 h-4" />
              Currently Preparing ({preparingOrders.length})
            </h3>
            {preparingOrders.map(order => (
              <Card key={order.id} className="border-blue-200 bg-blue-50/50">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className="bg-blue-600">PREPARING</Badge>
                        <span className="font-semibold">Table {order.tableNumber}</span>
                        <span className="text-sm text-muted-foreground">#{order.id.slice(-4)}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Started {getTimeAgo(order.timestamp)}
                      </div>
                    </div>
                    <Button
                      onClick={() => handleStatusUpdate(order.id, 'ready')}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Mark Ready
                    </Button>
                  </div>
                  
                  <div className="space-y-1">
                    {order.items.map((item: any, index: number) => (
                      <div key={index} className="text-sm flex justify-between">
                        <span>{item.quantity}x {item.menuItem.name}</span>
                        <span className="text-muted-foreground">${(item.menuItem.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Ready Orders */}
        {readyOrders.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-medium text-green-700 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Ready for Pickup ({readyOrders.length})
            </h3>
            {readyOrders.map(order => (
              <Card key={order.id} className="border-green-200 bg-green-50/50">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className="bg-green-600">READY</Badge>
                        <span className="font-semibold">Table {order.tableNumber}</span>
                        <span className="text-sm text-muted-foreground">#{order.id.slice(-4)}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Ready since {getTimeAgo(order.timestamp)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    {order.items.map((item: any, index: number) => (
                      <div key={index} className="text-sm flex justify-between">
                        <span>{item.quantity}x {item.menuItem.name}</span>
                        <span className="text-muted-foreground">${(item.menuItem.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {newOrders.length === 0 && preparingOrders.length === 0 && readyOrders.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <ChefHat className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No active orders in the kitchen</p>
              <p className="text-sm text-muted-foreground mt-2">
                New orders will appear here automatically
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
