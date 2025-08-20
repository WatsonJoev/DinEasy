
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/contexts/AppContext';
import { Star } from 'lucide-react';

export function FeedbackView() {
  const { state } = useApp();
  
  // Get orders with feedback
  const ordersWithFeedback = state.orders.filter(order => order.customerFeedback);
  
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const averageRating = ordersWithFeedback.length > 0
    ? ordersWithFeedback.reduce((sum, order) => sum + order.customerFeedback!.rating, 0) / ordersWithFeedback.length
    : 0;

  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: ordersWithFeedback.filter(order => order.customerFeedback!.rating === rating).length
  }));

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">Customer Feedback</h3>
      
      {/* Feedback Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Average Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold">{averageRating.toFixed(1)}</span>
              <div className="flex">
                {renderStars(Math.round(averageRating))}
              </div>
            </div>
            <div className="text-sm text-muted-foreground mt-2">
              Based on {ordersWithFeedback.length} reviews
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rating Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {ratingDistribution.map(({ rating, count }) => (
                <div key={rating} className="flex items-center gap-2">
                  <span className="w-4 text-sm">{rating}</span>
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full"
                      style={{
                        width: `${ordersWithFeedback.length > 0 ? (count / ordersWithFeedback.length) * 100 : 0}%`
                      }}
                    />
                  </div>
                  <span className="w-8 text-sm text-right">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Individual Feedback */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Feedback</CardTitle>
        </CardHeader>
        <CardContent>
          {ordersWithFeedback.length > 0 ? (
            <div className="space-y-4">
              {ordersWithFeedback.slice(-10).reverse().map(order => (
                <div key={order.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Order #{order.id.slice(-4)}</Badge>
                      <Badge variant="secondary">{order.tableNumber}</Badge>
                    </div>
                    <div className="flex items-center gap-1">
                      {renderStars(order.customerFeedback!.rating)}
                    </div>
                  </div>
                  
                  {order.customerFeedback!.comment && (
                    <p className="text-sm text-muted-foreground italic">
                      "{order.customerFeedback!.comment}"
                    </p>
                  )}
                  
                  <div className="text-xs text-muted-foreground mt-2">
                    {new Date(order.timestamp).toLocaleDateString()} - 
                    Total: ${order.total.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No customer feedback yet.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
