
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/AppContext';
import { Clock, CheckCircle, ChefHat, Bell } from 'lucide-react';

export function OrderStatus() {
  const { state } = useApp();

  const activeOrders = state.orders.filter(order => 
    order.status !== 'completed' && order.tableNumber === state.restaurant.table
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new':
        return <Bell className="w-5 h-5" />;
      case 'preparing':
        return <ChefHat className="w-5 h-5" />;
      case 'ready':
        return <CheckCircle className="w-5 h-5" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-500';
      case 'preparing':
        return 'bg-warm-orange';
      case 'ready':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'new':
        return 'Order Received';
      case 'preparing':
        return 'Preparing';
      case 'ready':
        return 'Ready for Pickup';
      default:
        return status;
    }
  };

  if (activeOrders.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Order Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              No active orders. Place an order to track its status!
            </p>
            <div className="bg-sage-green/20 rounded-lg p-6">
              <h3 className="font-semibold text-earth-brown mb-2">
                Enjoy Our Ambiance
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                While you're here, why not explore our restaurant?
              </p>
              <div className="space-y-3">
                <Card className="p-3">
                  <h4 className="font-medium text-sm">Customer Testimonials</h4>
                  <div className="mt-2 space-y-2">
                    {state.youtubeVideos.map((videoId, index) => (
                      <div key={videoId} className="bg-muted rounded p-2 text-xs">
                        Video Testimonial #{index + 1}
                      </div>
                    ))}
                  </div>
                </Card>
                
                <Card className="p-3">
                  <h4 className="font-medium text-sm">Top 5 Delicious Dishes</h4>
                  <div className="mt-2 space-y-1">
                    {state.topDishes.slice(0, 5).map((dish, index) => (
                      <div key={dish} className="flex items-center gap-2 text-xs">
                        <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center">
                          {index + 1}
                        </Badge>
                        <span>{dish}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {activeOrders.map((order) => (
        <Card key={order.id}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Order #{order.id.slice(-6)}</span>
              <Badge variant="outline">
                {new Date(order.timestamp).toLocaleTimeString()}
              </Badge>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Status Progress */}
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-full ${getStatusColor(order.status)} flex items-center justify-center text-white`}>
                {getStatusIcon(order.status)}
              </div>
              <div>
                <h3 className="font-semibold">{getStatusText(order.status)}</h3>
                <p className="text-sm text-muted-foreground">
                  {order.status === 'preparing' && 'Usually takes 5-10 minutes'}
                  {order.status === 'new' && 'Your order has been received'}
                  {order.status === 'ready' && 'Your order is ready!'}
                </p>
              </div>
            </div>

            {/* Order Items */}
            <div className="space-y-2">
              <h4 className="font-medium">Order Items:</h4>
              {order.items.map((item) => (
                <div key={item.menuItem.id} className="flex justify-between text-sm bg-muted p-2 rounded">
                  <span>{item.quantity}x {item.menuItem.name}</span>
                  <span>${(item.menuItem.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="flex justify-between font-semibold pt-2 border-t">
                <span>Total:</span>
                <span>${order.total.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment Button */}
            {order.status === 'ready' && (
              <Button
                className="w-full bg-sage-green hover:bg-sage-green/90 text-earth-brown"
                size="lg"
              >
                Request Bill & Pay
              </Button>
            )}
          </CardContent>
        </Card>
      ))}

      {/* Ambiance Section */}
      {activeOrders.some(order => order.status === 'preparing') && (
        <Card className="bg-sage-green/20">
          <CardHeader>
            <CardTitle className="text-earth-brown">Enjoy Our Ambiance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              While your food is being prepared, take a moment to enjoy our restaurant atmosphere.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-4">
                <h4 className="font-medium mb-2">Customer Testimonials</h4>
                <div className="space-y-2">
                  {state.youtubeVideos.map((videoId, index) => (
                    <div key={videoId} className="bg-white/50 rounded p-2 text-sm">
                      📺 Customer Testimonial #{index + 1}
                    </div>
                  ))}
                </div>
              </Card>
              
              <Card className="p-4">
                <h4 className="font-medium mb-2">Top 5 Delicious Dishes</h4>
                <div className="space-y-2">
                  {state.topDishes.slice(0, 5).map((dish, index) => (
                    <div key={dish} className="flex items-center gap-2 text-sm">
                      <Badge variant="secondary" className="w-6 h-6 p-0 flex items-center justify-center text-xs">
                        {index + 1}
                      </Badge>
                      <span>{dish}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
