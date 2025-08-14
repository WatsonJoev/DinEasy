
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useApp } from '@/contexts/AppContext';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

export function Analytics() {
  const { state } = useApp();

  const salesData = [
    { period: 'Today', amount: state.analytics.dailySales, change: +12.5 },
    { period: 'This Week', amount: state.analytics.weeklySales, change: +8.2 },
    { period: 'This Month', amount: state.analytics.monthlySales, change: -2.1 }
  ];

  const orderStats = state.orders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">Sales Analytics</h3>
      
      {/* Sales Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {salesData.map((data, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{data.period}</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{state.restaurant.currency}{data.amount.toFixed(2)}</div>
              <div className={`text-xs flex items-center ${
                data.change > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {data.change > 0 ? (
                  <TrendingUp className="w-3 h-3 mr-1" />
                ) : (
                  <TrendingDown className="w-3 h-3 mr-1" />
                )}
                {Math.abs(data.change)}% from last period
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Order Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Order Status Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-soft-red">
                {orderStats.new || 0}
              </div>
              <div className="text-sm text-muted-foreground">New Orders</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-warm-orange">
                {orderStats.preparing || 0}
              </div>
              <div className="text-sm text-muted-foreground">Preparing</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-sage-green">
                {orderStats.ready || 0}
              </div>
              <div className="text-sm text-muted-foreground">Ready</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-earth-brown">
                {orderStats.completed || 0}
              </div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Popular Items */}
      <Card>
        <CardHeader>
          <CardTitle>Top Selling Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {state.topDishes.map((dish, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="font-medium">{dish}</span>
                <div className="flex items-center gap-2">
                  <div className="text-sm text-muted-foreground">#{index + 1}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Weekly Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Sales Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>This Week</span>
              <span className="font-bold">{state.restaurant.currency}{state.analytics.weeklySales.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Previous Week</span>
              <span className="font-bold">{state.restaurant.currency}{(state.analytics.weeklySales * 0.92).toFixed(2)}</span>
            </div>
            <div className="border-t pt-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">Difference</span>
                <span className="font-bold text-green-600">
                  +{state.restaurant.currency}{(state.analytics.weeklySales * 0.08).toFixed(2)} (+8.2%)
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
