import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/contexts/AppContext';
import { toast } from '@/hooks/use-toast';
import { Clock, ChefHat, CheckCircle, Bell } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

interface OrderItem {
  id: string;
  order_id: string;
  user_id: string;
  menu_item_id: string;
  menu_item_name: string;
  quantity: number;
  price: number;
  order_type: string;
  spice_level: string;
  parcel_charge: number;
  added_at: string;
  orders: {
    id: string;
    table_number: string;
    status: string;
    created_at: string;
    total: number;
  };
}

interface GroupedOrder {
  orderId: string;
  tableNumber: string;
  status: string;
  timestamp: string;
  total: number;
  items: OrderItem[];
}

export function ChefDashboard() {
  const { state, dispatch } = useApp();
  const [lastOrderCount, setLastOrderCount] = useState(0);
  const [now, setNow] = useState(new Date());
  const [groupedOrders, setGroupedOrders] = useState<GroupedOrder[]>([]);

  // Group orders by status
  const newOrders = groupedOrders.filter(order => order.status === 'new');
  const preparingOrders = groupedOrders.filter(order => order.status === 'preparing');
  const readyOrders = groupedOrders.filter(order => order.status === 'ready');
  const completedTodayOrders = groupedOrders.filter(order => order.status === 'completed');

  useEffect(() => {
    if (newOrders.length > lastOrderCount) {
      toast({
        title: "🔔 New Order Received!",
        description: `Table ${newOrders[newOrders.length - 1]?.tableNumber} has placed an order`,
      });
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

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    async function fetchOrderItems() {
      // Fetch from order_items table with order details
      const { data, error } = await supabase
        .from("order_items")
        .select(`
          *,
          orders (
            id,
            table_number,
            status,
            created_at,
            total
          )
        `)
        .order("added_at", { ascending: false });

      if (error) {
        console.error("Error fetching order items:", error.message);
        return;
      }

             console.log("Raw order items data from Supabase:", data);

              // Group order items by order_id - status is now only from orders table
       console.log("Starting to process", data.length, "items");
       const grouped = data.reduce((acc: { [key: string]: GroupedOrder }, item: OrderItem, index: number) => {
         console.log(`Processing item ${index + 1}/${data.length}:`, item);
         const orderId = item.order_id;
         console.log("Order ID:", orderId);
         
         if (!acc[orderId]) {
           console.log("Creating new group for order:", orderId);
           acc[orderId] = {
             orderId: orderId,
             tableNumber: item.orders.table_number,
             status: item.orders.status, // Status comes from orders table
             timestamp: item.orders.created_at,
             total: item.orders.total,
             items: []
           };
         }
         
         acc[orderId].items.push(item);
         console.log("Added item to group. Group now has", acc[orderId].items.length, "items");
         return acc;
       }, {});

             // Convert to array and sort by timestamp
       console.log("Grouped object before conversion:", grouped);
       console.log("Number of groups created:", Object.keys(grouped).length);
       console.log("Group keys:", Object.keys(grouped));
       
       const groupedArray = Object.values(grouped as { [key: string]: GroupedOrder }).sort((a, b) => 
         new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
       );

       console.log("Final grouped orders:", groupedArray);
       console.log("Number of orders in final array:", groupedArray.length);
       setGroupedOrders(groupedArray as GroupedOrder[]);
    }

    fetchOrderItems();

    // Set up real-time subscription for order_items updates
    const subscription = supabase
      .channel('order_items_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'order_items' }, 
        () => {
          fetchOrderItems(); // Refetch when any order item changes
        }
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'orders' }, 
        () => {
          fetchOrderItems(); // Refetch when order status changes
        }
      )
      .subscribe();

    // Poll for new orders every 10 seconds as backup
    const interval = setInterval(fetchOrderItems, 10000);
    
    return () => {
      clearInterval(interval);
      subscription.unsubscribe();
    };
  }, []);

  const handleStatusUpdate = async (orderId: string | number, newStatus: 'preparing' | 'ready') => {
    try {
      console.log(`Updating order ${orderId} to status: ${newStatus}`);
      
      // Update the main order status (order_items no longer has status)
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', Number(orderId))
        .select();

      if (orderError) {
        console.error('Error updating order:', orderError);
        toast({
          title: "Error",
          description: "Failed to update order status in Supabase",
          variant: "destructive",
        });
        return;
      }

      console.log('Order status updated successfully in Supabase:', orderData);

      // Update local state
      setGroupedOrders(prev =>
        prev.map(order =>
          order.orderId === orderId 
            ? { 
                ...order, 
                status: newStatus
              } 
            : order
        )
      );

      const statusMessages = {
        preparing: "Order marked as preparing",
        ready: "Order marked as ready for pickup"
      };

      toast({
        title: statusMessages[newStatus],
        description: `Order #${String(orderId).slice(-4)} status updated`
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      });
    }
  };

  const handleStartPreparing = async (orderId: string | number) => {
    try {
      console.log(`Starting preparation for order ${orderId}`);
      
      // Update the main order status to 'preparing' (order_items no longer has status)
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .update({ status: 'preparing' })
        .eq('id', Number(orderId))
        .select();

      if (orderError) {
        console.error('Error updating order to preparing:', orderError);
        toast({
          title: "Error",
          description: "Failed to update order status in Supabase",
          variant: "destructive",
        });
        return;
      }

      console.log('Order status updated to preparing successfully in Supabase:', orderData);

      // Update local state
      setGroupedOrders(prev =>
        prev.map(order =>
          order.orderId === orderId 
            ? { 
                ...order, 
                status: 'preparing'
              } 
            : order
        )
      );

      toast({
        title: "Order Preparing!",
        description: `Order #${String(orderId).slice(-4)} marked as preparing`
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      });
    }
  };



  const getTimeAgo = (timestamp: Date) => {
    const diff = now.getTime() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes === 1) return '1 minute ago';
    return `${minutes} minutes ago`;
  };

  // Test function to verify Supabase connection and permissions
  const testSupabaseConnection = async () => {
    try {
      console.log('Testing Supabase connection...');
      
      // Test reading from orders table
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .limit(1);
      
      if (ordersError) {
        console.error('Error reading from orders table:', ordersError);
      } else {
        console.log('Successfully read from orders table:', ordersData);
      }

      // Test reading from order_items table
      const { data: itemsData, error: itemsError } = await supabase
        .from('order_items')
        .select('*')
        .limit(1);
      
      if (itemsError) {
        console.error('Error reading from order_items table:', itemsError);
      } else {
        console.log('Successfully read from order_items table:', itemsData);
      }

      // Test updating a specific order (if we have one)
      if (groupedOrders.length > 0) {
        const testOrderId = groupedOrders[0].orderId;
        console.log(`Testing update on order ${testOrderId}...`);
        
        const { data: updateData, error: updateError } = await supabase
          .from('orders')
          .update({ status: 'new' }) // Reset to new for testing
          .eq('id', testOrderId)
          .select();
        
        if (updateError) {
          console.error('Error updating order:', updateError);
        } else {
          console.log('Successfully updated order status:', updateData);
        }
      }
    } catch (error) {
      console.error('Error testing Supabase connection:', error);
    }
  };

  // Test function to manually update an order to preparing status
  const testUpdateToPreparing = async () => {
    try {
      if (groupedOrders.length === 0) {
        console.log('No orders to test with');
        return;
      }

      const testOrder = groupedOrders[0];
      console.log(`Testing update to preparing for order ${testOrder.orderId}...`);

      // Test updating the main order (order_items no longer has status)
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .update({ status: 'preparing' })
        .eq('id', testOrder.orderId)
        .select();

      if (orderError) {
        console.error('Error updating order:', orderError);
        return;
      }

      console.log('Order updated to preparing successfully:', orderData);
      
      // Refresh the data
      setTimeout(() => {
        const fetchOrderItems = async () => {
          const { data, error } = await supabase
            .from("order_items")
            .select(`
              *,
              orders (
                id,
                table_number,
                status,
                created_at,
                total
              )
            `)
            .order("added_at", { ascending: false });

          if (error) {
            console.error("Error fetching order items:", error.message);
            return;
          }

          console.log("Updated data after test:", data);
        };
        fetchOrderItems();
      }, 1000);

    } catch (error) {
      console.error('Error in test update:', error);
    }
  };

  const renderItems = (items: OrderItem[] = []) =>
    items.map((item: OrderItem, index: number) => (
      <div key={index} className="text-sm flex justify-between items-center">
        <span>{item.quantity}x {item.menu_item_name}</span>
        <span className="text-xs text-muted-foreground">{item.order_type === 'takeaway' ? 'Takeaway' : 'Dine-in'}</span>
      </div>
    ));

  const renderTimeWithIcon = (timestamp: Date) => (
    <div className="text-sm text-muted-foreground flex items-center gap-1">
      <Clock className="w-4 h-4" />
      {getTimeAgo(timestamp)}
    </div>
  );

  return (
    <div className="space-y-6 p-4">
             {/* Test Buttons */}
       <div className="mb-4 flex gap-2">
         <Button
           onClick={testSupabaseConnection}
           variant="outline"
           size="sm"
           className="text-xs"
         >
           Test Connection
         </Button>
         <Button
           onClick={testUpdateToPreparing}
           variant="outline"
           size="sm"
           className="text-xs"
         >
           Test Update to Preparing
         </Button>
       </div>

       {/* Stats Cards */}
       <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "New Orders", color: "red", count: newOrders.length },
          { title: "Preparing", color: "blue", count: preparingOrders.length },
          { title: "Ready", color: "green", count: readyOrders.length },
          { title: "Completed Today", color: "purple", count: completedTodayOrders.length },
        ].map(({ title, color, count }) => (
          <Card key={title} className={`bg-${color}-50 border-${color}-200`}>
            <CardHeader className="text-center pb-2">
              <CardTitle className={`text-${color}-700 text-sm`}>{title}</CardTitle>
            </CardHeader>
            <CardContent className="text-center pt-0">
              <div className={`text-2xl font-bold text-${color}-700`}>{count}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Kitchen Queue */}
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
              <Card key={order.orderId} className="border-red-200 bg-red-50/50">
                <CardContent className="p-4 flex flex-col justify-between min-h-[180px]">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <Badge variant="destructive">NEW</Badge>
                      <span className="font-semibold">Table {order.tableNumber}</span>
                      <span className="text-sm text-muted-foreground">#{String(order.orderId).slice(-4)}</span>
                    </div>
                    {renderTimeWithIcon(new Date(order.timestamp))}
                    <div className="mt-2 space-y-1">{renderItems(order.items)}</div>
                  </div>
                  <div className="mt-4 flex justify-center">
                    <Button
                      onClick={() => handleStartPreparing(order.orderId)}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Start Preparing
                    </Button>
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
              <Card key={order.orderId} className="border-blue-200 bg-blue-50/50">
                <CardContent className="p-4 flex flex-col justify-between min-h-[180px]">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <Badge className="bg-blue-600">PREPARING</Badge>
                      <span className="font-semibold">Table {order.tableNumber}</span>
                      <span className="text-sm text-muted-foreground">#{String(order.orderId).slice(-4)}</span>
                    </div>
                    {renderTimeWithIcon(new Date(order.timestamp))}
                    <div className="mt-2 space-y-1">{renderItems(order.items)}</div>
                  </div>
                  <div className="mt-4 flex justify-center">
                    <Button
                      onClick={() => handleStatusUpdate(order.orderId, 'ready')}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Mark Ready
                    </Button>
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
              <Card key={order.orderId} className="border-green-200 bg-green-50/50">
                <CardContent className="p-4">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <Badge className="bg-green-600">READY</Badge>
                    <span className="font-semibold">Table {order.tableNumber}</span>
                    <span className="text-sm text-muted-foreground">#{String(order.orderId).slice(-4)}</span>
                  </div>
                  {renderTimeWithIcon(new Date(order.timestamp))}
                  <div className="mt-2 space-y-1">{renderItems(order.items)}</div>
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
