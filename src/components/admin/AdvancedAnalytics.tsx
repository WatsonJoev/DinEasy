import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useApp } from '@/contexts/AppContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Users, Clock, Star } from 'lucide-react';

export function AdvancedAnalytics() {
  const { state } = useApp();

  const analytics = useMemo(() => {
    const orders = state.orders;
    const completedOrders = orders.filter(order => order.status === 'completed');
    
    // Revenue analytics
    const totalRevenue = completedOrders.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = completedOrders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    // Time-based analytics
    const today = new Date().toDateString();
    const todaysOrders = completedOrders.filter(order => 
      new Date(order.timestamp).toDateString() === today
    );
    const todaysRevenue = todaysOrders.reduce((sum, order) => sum + order.total, 0);
    
    // Popular items
    const itemFrequency: Record<string, { count: number; revenue: number }> = {};
    completedOrders.forEach(order => {
      order.items.forEach((item: any) => {
        const name = item.menuItem.name;
        if (!itemFrequency[name]) {
          itemFrequency[name] = { count: 0, revenue: 0 };
        }
        itemFrequency[name].count += item.quantity;
        itemFrequency[name].revenue += item.menuItem.price * item.quantity;
      });
    });
    
    const popularItems = Object.entries(itemFrequency)
      .sort(([, a], [, b]) => b.count - a.count)
      .slice(0, 5)
      .map(([name, data]) => ({ name, ...data }));
    
    // Hourly analytics
    const hourlyData = Array.from({ length: 24 }, (_, hour) => {
      const ordersInHour = completedOrders.filter(order => {
        const orderHour = new Date(order.timestamp).getHours();
        return orderHour === hour;
      });
      return {
        hour: `${hour}:00`,
        orders: ordersInHour.length,
        revenue: ordersInHour.reduce((sum, order) => sum + order.total, 0)
      };
    });
    
    // Profit margin calculation (assuming 30% cost)
    const totalCost = totalRevenue * 0.3;
    const totalProfit = totalRevenue - totalCost;
    const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
    
    // Order type distribution
    const orderTypeData = [
      { name: 'Dine-in', value: 0, color: '#619b8a' },
      { name: 'Takeaway', value: 0, color: '#fe7f2d' }
    ];
    
    completedOrders.forEach(order => {
      order.items.forEach((item: any) => {
        if (item.orderType === 'dine-in') {
          orderTypeData[0].value++;
        } else {
          orderTypeData[1].value++;
        }
      });
    });
    
    return {
      totalRevenue,
      totalOrders,
      averageOrderValue,
      todaysRevenue,
      todaysOrders: todaysOrders.length,
      popularItems,
      hourlyData,
      profitMargin,
      totalProfit,
      orderTypeData
    };
  }, [state.orders]);

  const MetricCard = ({ title, value, change, icon: Icon, color }: any) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 text-${color}-500`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && (
          <p className="text-xs text-muted-foreground">
            <span className={`inline-flex items-center ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
              {Math.abs(change)}%
            </span>
            {" from last week"}
          </p>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">Advanced Analytics</h3>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Revenue"
          value={`${state.restaurant.currency}${analytics.totalRevenue.toFixed(2)}`}
          change={12.5}
          icon={DollarSign}
          color="green"
        />
        <MetricCard
          title="Total Orders"
          value={analytics.totalOrders}
          change={8.2}
          icon={Users}
          color="blue"
        />
        <MetricCard
          title="Avg Order Value"
          value={`${state.restaurant.currency}${analytics.averageOrderValue.toFixed(2)}`}
          change={-2.1}
          icon={TrendingUp}
          color="purple"
        />
        <MetricCard
          title="Profit Margin"
          value={`${analytics.profitMargin.toFixed(1)}%`}
          change={5.4}
          icon={Star}
          color="yellow"
        />
      </div>

      {/* Today's Performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Today's Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>Orders Today:</span>
                <span className="font-semibold">{analytics.todaysOrders}</span>
              </div>
              <div className="flex justify-between">
                <span>Revenue Today:</span>
                <span className="font-semibold">{state.restaurant.currency}{analytics.todaysRevenue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Profit:</span>
                <span className="font-semibold text-green-600">{state.restaurant.currency}{analytics.totalProfit.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Order Type Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={analytics.orderTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  dataKey="value"
                >
                  {analytics.orderTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Hourly Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Hourly Revenue Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.hourlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip formatter={(value) => [`${state.restaurant.currency}${Number(value).toFixed(2)}`, 'Revenue']} />
              <Line type="monotone" dataKey="revenue" stroke="#fe7f2d" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Popular Items */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Items</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.popularItems}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#a1c181" name="Orders" />
              <Bar dataKey="revenue" fill="#619b8a" name="Revenue" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
