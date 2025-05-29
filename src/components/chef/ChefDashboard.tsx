
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useApp } from '@/contexts/AppContext';
import { toast } from '@/hooks/use-toast';
import { ChefHat, Clock, CheckCircle } from 'lucide-react';

export function ChefDashboard() {
  const { state, dispatch } = useApp();
  const [notification, setNotification] = useState<string | null>(null);

  const newOrders = state.orders.filter(order => order.status === 'new');
  const preparingOrders = state.orders.filter(order => order.status === 'preparing');
  const completedOrders = state.orders.filter(order => order.status === 'completed');

  // Sound notification for new orders
  useEffect(() => {
    if (newOrders.length > 0) {
      setNotification(`${newOrders.length} new order(s) received!`);
      // In a real app, you'd play a sound here
      console.log('🔔 New order notification sound');
    }
  }, [newOrders.length]);

  const handleStartPreparing = (orderId: string) => {
    dispatch({
      type: 'UPDATE_ORDER_STATUS',
      payload: { orderId, status: 'preparing' }
    });
    toast({
      title: "Order preparation started",
      description: "Order has been moved to preparing queue"
    });
  };

  const handleMarkReady = (orderId: string) => {
    dispatch({
      type: 'UPDATE_ORDER_STATUS',
      payload: { orderId, status: 'ready' }
    });
    toast({
      title: "Order ready!",
      description: "Customer has been notified"
    });
  };

  const handleCompleteOrder = (orderId: string) => {
    dispatch({
      type: 'UPDATE_ORDER_STATUS',
      payload: { orderId, status: 'completed' }
    });
    toast({
      title: "Order completed",
      description: "Order moved to history"
    });
  };

  const OrderCard = ({ order, showActions }: { order: any; showActions: boolean }) => (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg flex items-center gap-2">
            <ChefHat className="w-5 h-5" />
            Order #{order.id.slice(-4)}
          </CardTitle>
          <Badge variant={
            order.status === 'new' ? 'destructive' :
            order.status === 'preparing' ? 'default' : 'secondary'
          }>
            {order.status.toUpperCase()}
          </Badge>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>{order.tableNumber}</span>
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {new Date(order.timestamp).toLocaleTimeString()}
          </span>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-2 mb-4">
          {order.items.map((item: any, index: number) => (
            <div key={index} className="flex justify-between items-center py-2 border-b">
              <span className="font-medium">{item.menuItem.name}</span>
              <Badge variant="outline">x{item.quantity}</Badge>
            </div>
          ))}
        </div>
        
        <div className="flex justify-between items-center text-lg font-semibold mb-4">
          <span>Total: ${order.total.toFixed(2)}</span>
        </div>
        
        {showActions && (
          <div className="flex gap-2">
            {order.status === 'new' && (
              <Button
                onClick={() => handleStartPreparing(order.id)}
                className="flex-1 bg-warm-orange hover:bg-warm-orange/90 text-earth-brown"
              >
                Start Preparing
              </Button>
            )}
            {order.status === 'preparing' && (
              <Button
                onClick={() => handleMarkReady(order.id)}
                className="flex-1 bg-sage-green hover:bg-sage-green/90 text-earth-brown"
              >
                Mark Ready
              </Button>
            )}
            {order.status === 'ready' && (
              <Button
                onClick={() => handleCompleteOrder(order.id)}
                className="flex-1 bg-earth-brown hover:bg-earth-brown/90"
                variant="default"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Complete Order
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Notification Banner */}
      {notification && (
        <Card className="bg-warm-orange/20 border-warm-orange">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-earth-brown">{notification}</span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setNotification(null)}
              >
                Dismiss
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Kitchen Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-soft-red">New Orders</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-3xl font-bold text-soft-red">{newOrders.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-warm-orange">Preparing</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-3xl font-bold text-warm-orange">{preparingOrders.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-sage-green">Completed Today</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-3xl font-bold text-sage-green">{completedOrders.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Orders Management */}
      <Tabs defaultValue="queue">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="queue">Active Queue</TabsTrigger>
          <TabsTrigger value="history">Completed Orders</TabsTrigger>
        </TabsList>

        <TabsContent value="queue" className="space-y-4">
          <h3 className="text-xl font-semibold">Kitchen Queue</h3>
          
          {newOrders.length > 0 && (
            <div>
              <h4 className="text-lg font-medium text-soft-red mb-3">New Orders</h4>
              {newOrders.map(order => (
                <OrderCard key={order.id} order={order} showActions={true} />
              ))}
            </div>
          )}
          
          {preparingOrders.length > 0 && (
            <div>
              <h4 className="text-lg font-medium text-warm-orange mb-3">Currently Preparing</h4>
              {preparingOrders.map(order => (
                <OrderCard key={order.id} order={order} showActions={true} />
              ))}
            </div>
          )}
          
          {newOrders.length === 0 && preparingOrders.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <ChefHat className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No active orders. Kitchen is caught up!</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <h3 className="text-xl font-semibold">Completed Orders</h3>
          
          {completedOrders.length > 0 ? (
            completedOrders.map(order => (
              <OrderCard key={order.id} order={order} showActions={false} />
            ))
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-muted-foreground">No completed orders today.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
