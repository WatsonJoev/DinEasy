
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/contexts/AppContext';
import { Clock, User } from 'lucide-react';

export function OrderMonitoring() {
  const { state } = useApp();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'destructive';
      case 'preparing': return 'default';
      case 'ready': return 'secondary';
      case 'completed': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">Order Monitoring</h3>
      
      {state.orders.length > 0 ? (
        <div className="space-y-4">
          {state.orders.map(order => (
            <Card key={order.id}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">
                    Order #{order.id.slice(-4)}
                  </CardTitle>
                  <Badge variant={getStatusColor(order.status)}>
                    {order.status.toUpperCase()}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {order.tableNumber}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {new Date(order.timestamp).toLocaleString()}
                  </span>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-2 mb-4">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span>{item.menuItem.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          x{item.quantity}
                        </span>
                        <span className="font-medium">
                        {state.restaurant.currency}{(item.menuItem.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="border-t pt-2">
                  <div className="flex justify-between items-center font-semibold">
                    <span>Total:</span>
                    <span>{state.restaurant.currency}{order.total.toFixed(2)}</span>
                  </div>
                </div>
                
                {order.customerFeedback && (
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">Customer Feedback:</span>
                      <span className="text-yellow-600">
                        {'★'.repeat(order.customerFeedback.rating)}
                      </span>
                    </div>
                    {order.customerFeedback.comment && (
                      <p className="text-sm text-muted-foreground italic">
                        "{order.customerFeedback.comment}"
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">No orders placed yet.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
