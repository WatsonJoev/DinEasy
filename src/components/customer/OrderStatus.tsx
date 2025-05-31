
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useApp } from '@/contexts/AppContext';
import { PaymentModal } from './PaymentModal';
import { FeedbackModal } from './FeedbackModal';
import { OrderModificationModal } from './OrderModificationModal';
import { AddMoreModal } from './AddMoreModal';
import { Clock, ChefHat, CheckCircle, Star, CreditCard, Edit, Plus } from 'lucide-react';

export function OrderStatus() {
  const { state } = useApp();
  const [selectedOrderForPayment, setSelectedOrderForPayment] = useState<any>(null);
  const [selectedOrderForFeedback, setSelectedOrderForFeedback] = useState<string>('');
  const [selectedOrderForModification, setSelectedOrderForModification] = useState<any>(null);
  const [selectedOrderForAddMore, setSelectedOrderForAddMore] = useState<string>('');

  const userOrders = state.orders.filter(order => 
    order.tableNumber === state.restaurant.table
  );

  const handlePaymentComplete = (orderId: string) => {
    setSelectedOrderForFeedback(orderId);
  };

  const getStatusProgress = (status: string) => {
    switch (status) {
      case 'new': return 25;
      case 'preparing': return 50;
      case 'ready': return 75;
      case 'completed': return 100;
      default: return 0;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new': return <Clock className="w-5 h-5" />;
      case 'preparing': return <ChefHat className="w-5 h-5" />;
      case 'ready': return <CheckCircle className="w-5 h-5" />;
      case 'completed': return <Star className="w-5 h-5" />;
      default: return <Clock className="w-5 h-5" />;
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'new': return 'Order received! We\'ll start preparing it soon.';
      case 'preparing': return 'Your delicious meal is being prepared with care.';
      case 'ready': return 'Your order is ready! Please collect it.';
      case 'completed': return 'Order completed. Thank you for dining with us!';
      default: return 'Processing your order...';
    }
  };

  const getEstimatedTime = (status: string) => {
    switch (status) {
      case 'new': return '5-10 minutes';
      case 'preparing': return '3-8 minutes';
      case 'ready': return 'Ready now!';
      case 'completed': return 'Completed';
      default: return 'Processing...';
    }
  };

  if (userOrders.length === 0) {
    return (
      <div className="px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-charcoal">Order Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <ChefHat className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No orders placed yet.</p>
              <p className="text-sm text-muted-foreground mt-2">
                Place an order from our menu to track it here!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 px-4">
      <h3 className="text-xl font-semibold text-charcoal">Your Orders</h3>
      
      {userOrders.map(order => (
        <Card key={order.id} className="overflow-hidden shadow-sm border-charcoal/10">
          <CardHeader className="pb-3 bg-gradient-to-r from-charcoal/5 to-zomp/5">
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg text-charcoal">
                Order #{order.id.slice(-4)}
              </CardTitle>
              <Badge variant={
                order.status === 'new' ? 'destructive' :
                order.status === 'preparing' ? 'default' :
                order.status === 'ready' ? 'secondary' : 'outline'
              } className={
                order.status === 'new' ? 'bg-pumpkin' :
                order.status === 'preparing' ? 'bg-sunglow text-charcoal' :
                order.status === 'ready' ? 'bg-olivine text-white' : ''
              }>
                {order.status.toUpperCase()}
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground">
              Placed at {new Date(order.timestamp).toLocaleTimeString()}
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Status Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(order.status)}
                  <span className="font-medium text-sm">{getStatusMessage(order.status)}</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  ETA: {getEstimatedTime(order.status)}
                </span>
              </div>
              <Progress value={getStatusProgress(order.status)} className="w-full" />
            </div>

            {/* Order Items */}
            <div className="space-y-2">
              <h4 className="font-medium text-charcoal">Order Items:</h4>
              {order.items.map((item: any, index: number) => (
                <div key={index} className="flex justify-between items-center text-sm">
                  <span>{item.menuItem.name} x{item.quantity} ({item.orderType})</span>
                  <span>{state.restaurant.currency}{(item.menuItem.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t pt-2 flex justify-between font-semibold text-charcoal">
                <span>Total (incl. {state.restaurant.taxRate}% tax):</span>
                <span>{state.restaurant.currency}{(order.total * (1 + state.restaurant.taxRate / 100)).toFixed(2)}</span>
              </div>
            </div>

            {/* Action Buttons for new orders */}
            {order.status === 'new' && (
              <div className="flex gap-2">
                <Button
                  onClick={() => setSelectedOrderForModification(order)}
                  variant="outline"
                  className="flex-1"
                  size="sm"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Modify Order
                </Button>
                <Button
                  onClick={() => setSelectedOrderForAddMore(order.id)}
                  variant="outline"
                  className="flex-1"
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add More
                </Button>
              </div>
            )}

            {/* Ambiance Section for preparing/ready orders */}
            {(order.status === 'preparing' || order.status === 'ready') && (
              <Card className="bg-gradient-to-r from-sunglow/20 to-olivine/20 border-sunglow/30">
                <CardContent className="p-4">
                  <h4 className="font-medium mb-3 text-charcoal">Enjoy Our Ambiance</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    While you wait, enjoy these customer experiences:
                  </p>
                  <div className="space-y-2">
                    {state.youtubeVideos.map((videoId, index) => (
                      <a
                        key={index}
                        href={`https://youtube.com/watch?v=${videoId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-2 bg-white rounded border hover:bg-gray-50 transition-colors"
                      >
                        <div className="text-sm font-medium">Customer Experience Video {index + 1}</div>
                        <div className="text-xs text-muted-foreground">Click to watch on YouTube</div>
                      </a>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Payment Button for ready orders */}
            {order.status === 'ready' && (
              <Button
                onClick={() => setSelectedOrderForPayment(order)}
                className="w-full bg-pumpkin hover:bg-pumpkin/90 text-white"
                size="lg"
              >
                <CreditCard className="w-5 h-5 mr-2" />
                Request Bill & Pay
              </Button>
            )}

            {/* Feedback Display for completed orders */}
            {order.status === 'completed' && order.customerFeedback && (
              <Card className="bg-olivine/10 border-olivine/20">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium">Your Feedback:</span>
                    <div className="flex">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < order.customerFeedback.rating
                              ? 'text-sunglow fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  {order.customerFeedback.comment && (
                    <p className="text-sm text-muted-foreground italic">
                      "{order.customerFeedback.comment}"
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      ))}

      {/* Top Dishes Section */}
      <Card className="bg-gradient-to-r from-olivine/10 to-pumpkin/10 border-olivine/20">
        <CardHeader>
          <CardTitle className="text-charcoal">Our Top 5 Delicious Dishes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {state.topDishes.map((dish, index) => (
              <div key={index} className="flex items-center gap-2 p-2 bg-white/50 rounded">
                <span className="font-bold text-pumpkin">#{index + 1}</span>
                <span className="font-medium text-charcoal">{dish}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      {selectedOrderForPayment && (
        <PaymentModal
          open={!!selectedOrderForPayment}
          onOpenChange={(open) => !open && setSelectedOrderForPayment(null)}
          order={selectedOrderForPayment}
          onPaymentComplete={handlePaymentComplete}
        />
      )}

      {selectedOrderForFeedback && (
        <FeedbackModal
          open={!!selectedOrderForFeedback}
          onOpenChange={(open) => !open && setSelectedOrderForFeedback('')}
          orderId={selectedOrderForFeedback}
        />
      )}

      {selectedOrderForModification && (
        <OrderModificationModal
          open={!!selectedOrderForModification}
          onOpenChange={(open) => !open && setSelectedOrderForModification(null)}
          order={selectedOrderForModification}
        />
      )}

      {selectedOrderForAddMore && (
        <AddMoreModal
          open={!!selectedOrderForAddMore}
          onOpenChange={(open) => !open && setSelectedOrderForAddMore('')}
          orderId={selectedOrderForAddMore}
        />
      )}
    </div>
  );
}
