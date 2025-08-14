import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useApp } from "@/contexts/AppContext";
import { PaymentModal } from "./PaymentModal";
import { FeedbackModal } from "./FeedbackModal";
import { OrderModificationModal } from "./OrderModificationModal";
import { Clock, ChefHat, CheckCircle, Star, Edit, Plus } from "lucide-react";
import { PARCEL_CHARGE } from "@/contexts/AppContext";
import { supabase } from "@/lib/supabaseClient";

export function OrderStatus() {
  const navigate = useNavigate();
  const [hasPaid, setHasPaid] = useState(false);
  const { state, dispatch } = useApp();
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  const [selectedOrderForPayment, setSelectedOrderForPayment] = useState<any>(null);
  const [selectedOrderForFeedback, setSelectedOrderForFeedback] = useState<string>("");
  const [selectedOrderForModification, setSelectedOrderForModification] = useState<any>(null);

  // Get orders from the global state (these are fetched from Supabase)
  const userOrders = state.orders;
  
  console.log('Global state orders:', state.orders);
  console.log('User orders:', userOrders);

  useEffect(() => {
    async function fetchOrders() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Simplified query to fetch orders and their associated items
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching orders:", error.message);
        return;
      }
      
      console.log('Raw data from Supabase:', data);
      
      // Transform the snake_case data from Supabase to the camelCase format your app expects
      const transformedOrders = data.map(order => {
        console.log(`Order ${order.id} status:`, order.status);
        return {
          id: order.id,
          tableNumber: order.table_number,
          items: order.order_items.map((item: any) => ({
            id: item.id,
            menuItem: { // Construct the menuItem object from the item's properties
                id: item.menu_item_id, 
                name: item.menu_item_name,
                price: item.price,
                description: '',
                category: '',
                image: '',
                inStock: true,
                foodType: 'veg',
                recommended: false,
                spiceLevel: 'mild',
                preparationTime: 0,
            },
            quantity: item.quantity,
            orderType: item.order_type,
            spiceLevel: item.spice_level,
            timestamp: item.added_at || order.created_at,
          })),
          total: order.total,
          timestamp: order.created_at,
          status: order.status,
          phoneNumber: "", // Add placeholder to match the global Order type
          paymentDetails: order.payment_details
        };
      });
      
      console.log('Transformed orders:', transformedOrders);

      dispatch({ type: "CLEAR_ALL_ORDERS" });
      transformedOrders.forEach((order) => {
        dispatch({ type: "PLACE_ORDER", payload: order });
      });
    }
    
    fetchOrders();

    // Set up real-time subscription for order updates
    const subscription = supabase
      .channel('user_orders_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'orders' }, 
        () => {
          console.log('Orders table changed, refetching...');
          fetchOrders(); // Refetch when any order changes
        }
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'order_items' }, 
        () => {
          console.log('Order items table changed, refetching...');
          fetchOrders(); // Refetch when any order item changes
        }
      )
      .subscribe();

    // Set up polling as backup to ensure we catch all updates
    const pollInterval = setInterval(fetchOrders, 5000); // Poll every 5 seconds
    
    return () => {
      subscription.unsubscribe();
      clearInterval(pollInterval);
    };
  }, [dispatch, refetchTrigger]);

  const handlePaymentComplete = (paidOrderIds: string | string[]) => {
    setHasPaid(true); 

    const idsToProcess = Array.isArray(paidOrderIds) ? paidOrderIds : [paidOrderIds];

    idsToProcess.forEach(orderId => {
      dispatch({
        type: "UPDATE_ORDER_STATUS",
        payload: {
          orderId: orderId,
          status: "completed",
        },
      });
    });

    const feedbackOrderId = idsToProcess[0];
    if (feedbackOrderId) {
      setSelectedOrderForFeedback(feedbackOrderId);
    }
    setSelectedOrderForPayment(null);
  };

  const handleCombinedBill = () => {
    const ordersToBill = userOrders.filter((order) => order.status === "ready");
    if (ordersToBill.length > 0) {
      setSelectedOrderForPayment(ordersToBill);
    } else {
      console.log("No ready orders to bill");
    }
  };

  const setSelectedOrderForAddMore = () => {
    navigate("/customer/menu");
  };

  const getStatusProgress = (status: string) => {
    switch (status) {
      case "new": return 25;
      case "preparing": return 50;
      case "ready": return 75;
      case "completed": return 100;
      default: return 0;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "new": return <Clock className="w-5 h-5" />;
      case "preparing": return <ChefHat className="w-5 h-5" />;
      case "ready": return <CheckCircle className="w-5 h-5" />;
      case "completed": return <Star className="w-5 h-5" />;
      default: return <Clock className="w-5 h-5" />;
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case "new": return "Order received! We'll start preparing it soon.";
      case "preparing": return "Your delicious meal is being prepared with care.";
      case "ready": return "Your order is ready! Please collect it.";
      case "completed": return "Order completed. Thank you for dining with us!";
      default: return "Processing your order...";
    }
  };

  const getEstimatedTime = (status: string) => {
    switch (status) {
      case "new": return "5-10 min";
      case "preparing": return "3-8 min";
      case "ready": return "Ready!";
      case "completed": return "Completed";
      default: return "...";
    }
  };

  const calculateTotalWithParcelCharges = (items: any[]) => {
    return items.reduce((acc, item) => {
        const itemTotal = item.menuItem.price * item.quantity;
        const parcel = item.orderType === "takeaway" ? PARCEL_CHARGE * item.quantity : 0;
        return acc + itemTotal + parcel;
    }, 0);
  };

  // Function to trigger refetch
  const triggerRefetch = () => {
    console.log('Manual refetch triggered');
    setRefetchTrigger(prev => prev + 1);
  };

  // Function to manually refresh orders
  const refreshOrders = async () => {
    console.log('Manual refresh triggered');
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching orders:", error.message);
      return;
    }
    
    console.log('Manual refresh - Raw data:', data);
    
    const transformedOrders = data.map(order => ({
      id: order.id,
      tableNumber: order.table_number,
      items: order.order_items.map((item: any) => ({
        id: item.id,
        menuItem: {
            id: item.menu_item_id, 
            name: item.menu_item_name,
            price: item.price,
            description: '',
            category: '',
            image: '',
            inStock: true,
            foodType: 'veg',
            recommended: false,
            spiceLevel: 'mild',
            preparationTime: 0,
        },
        quantity: item.quantity,
        orderType: item.order_type,
        spiceLevel: item.spice_level,
        timestamp: item.added_at || order.created_at,
      })),
      total: order.total,
      timestamp: order.created_at,
      status: order.status,
      phoneNumber: "",
      paymentDetails: order.payment_details
    }));

    dispatch({ type: "CLEAR_ALL_ORDERS" });
    transformedOrders.forEach((order) => {
      dispatch({ type: "PLACE_ORDER", payload: order });
    });
  };

  if (userOrders.length === 0) {
    return (
      <div className="px-4 sm:px-6 md:px-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-charcoal text-lg sm:text-xl">
              Order Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <ChefHat className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground text-base">
                No orders placed yet.
              </p>
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
    <div className="space-y-4 px-4 sm:px-6 md:px-8">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-charcoal">Your Orders</h3>
        <Button
          onClick={refreshOrders}
          variant="outline"
          size="sm"
          className="text-sm"
        >
          Refresh Status
        </Button>
      </div>

      {userOrders.map((order) => (
        <Card
          key={order.id}
          className="overflow-hidden sm:w-full shadow-sm border-charcoal/10"
        >
          <CardHeader className="pb-3 bg-gradient-to-r from-charcoal/5 to-zomp/5">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
              <CardTitle className="text-base sm:text-lg text-charcoal">
                Order #{String(order.id).slice(-4)}
              </CardTitle>
              <Badge
                variant={
                  order.status === "new" ? "destructive"
                    : order.status === "preparing" ? "default"
                      : order.status === "ready" ? "secondary"
                        : "outline"
                }
                className={
                  order.status === "new" ? "bg-pumpkin"
                    : order.status === "preparing" ? "bg-sunglow text-charcoal"
                      : order.status === "ready" ? "bg-olivine text-white"
                        : ""
                }
              >
                {order.status.toUpperCase()}
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground">
              Placed at {new Date(order.timestamp).toLocaleTimeString()}
            </div>
          </CardHeader>

          <CardContent className="p-4 space-y-4">
            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-4">
                <div className="flex items-center gap-2 pt-2">
                  {getStatusIcon(order.status)}
                  <span className="font-medium text-sm">
                    {getStatusMessage(order.status)}
                  </span>
                </div>
                <span className="text-sm text-muted-foreground">
                  ETA: {getEstimatedTime(order.status)}
                </span>
              </div>
              <Progress
                value={getStatusProgress(order.status)}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-charcoal text-sm sm:text-base">
                Order Items:
              </h4>
              {order.items.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center text-sm"
                >
                  <span className="truncate">
                    {item.menuItem.name} x{item.quantity} ({item.orderType})
                  </span>
                  <span className="text-right">
                    {state.restaurant.currency}
                    {(item.menuItem.price * item.quantity + (item.orderType === "takeaway" ? PARCEL_CHARGE * item.quantity : 0)).toFixed(2)}
                  </span>
                </div>
              ))}

              {/* Subtotal */}
              <div className="flex justify-between text-sm font-semibold">
                <span>Subtotal:</span>
                <span>
                  {state.restaurant.currency}
                  {(
                    order.items.reduce((acc, item) => acc + item.menuItem.price * item.quantity, 0)
                  ).toFixed(2)}
                </span>
              </div>

              {/* Parcel Charges */}
              <div className="flex justify-between text-sm text-orange-500 font-semibold">
                <span>Takeaway Charges:</span>
                <span>
                  {state.restaurant.currency}
                  {(
                    order.items.reduce(
                      (acc, item) => acc + (item.orderType === "takeaway" ? PARCEL_CHARGE * item.quantity : 0),
                      0
                    )
                  ).toFixed(2)}
                </span>
              </div>

              {/* Tax */}
              <div className="flex justify-between text-sm font-semibold">
                <span>Tax ({state.restaurant.taxRate}%):</span>
                <span>
                  {state.restaurant.currency}
                  {(
                    (order.items.reduce((acc, item) => acc + item.menuItem.price * item.quantity, 0) +
                    order.items.reduce((acc, item) => acc + (item.orderType === "takeaway" ? PARCEL_CHARGE * item.quantity : 0), 0))
                    * (state.restaurant.taxRate / 100)
                  ).toFixed(2)}
                </span>
              </div>

              {/* Total */}
              <div className="border-t pt-2 flex justify-between font-semibold text-charcoal">
                <span>Total (incl. tax):</span>
                <span>
                  {state.restaurant.currency}
                  {(
                    (order.items.reduce((acc, item) => acc + item.menuItem.price * item.quantity, 0) +
                    order.items.reduce((acc, item) => acc + (item.orderType === "takeaway" ? PARCEL_CHARGE * item.quantity : 0), 0))
                    * (1 + state.restaurant.taxRate / 100)
                  ).toFixed(2)}
                </span>
              </div>
            </div>

            {(order.status === "new" || order.status === "preparing") && (
              <div className="flex flex-col sm:flex-row gap-2">
                {order.status === "new" && (
                  <Button
                    onClick={() => setSelectedOrderForModification(order)}
                    variant="outline"
                    className="flex-1 text-sm sm:text-xs px-4 py-2 sm:py-1.5 sm:px-3"
                    size="sm"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Modify
                  </Button>
                )}
                <Button
                  onClick={setSelectedOrderForAddMore}
                  variant="outline"
                  className="flex-1 text-sm sm:text-xs px-4 py-2 sm:py-1.5 sm:px-3"
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add More
                </Button>
              </div>
            )}

            {order.status === "completed" && order.customerFeedback && (
              <Card className="bg-olivine/10 border-olivine/20">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium">Your Feedback:</span>
                    <div className="flex">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i < order.customerFeedback!.rating
                              ? "text-sunglow fill-current"
                              : "text-gray-300"
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

      <Card className="bg-gradient-to-r from-olivine/10 to-pumpkin/10 border-olivine/20">
        <CardHeader>
          <CardTitle className="text-charcoal text-base sm:text-lg">
            Our Top 5 Delicious Dishes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {state.topDishes.map((dish: string, index: number) => (
              <div
                key={index}
                className="flex items-center gap-2 p-2 bg-white/50 rounded"
              >
                <span className="font-bold text-pumpkin">#{index + 1}</span>
                <span className="font-medium text-charcoal">{dish}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {!hasPaid &&
        userOrders.some((order) => order.status === "ready") && (
          <div className="mt-4">
            <Button
              onClick={handleCombinedBill}
              className="w-full h-14 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold text-lg shadow-lg"
            >
              Generate Total Bill
            </Button>
          </div>
        )}

      {selectedOrderForFeedback && (
        <FeedbackModal
          open={!!selectedOrderForFeedback}
          onOpenChange={(open) => !open && setSelectedOrderForFeedback("")}
          orderId={selectedOrderForFeedback}
        />
      )}

      {selectedOrderForModification && (
        <OrderModificationModal
          open={!!selectedOrderForModification}
          onOpenChange={(open) => {
            if (!open) {
              setSelectedOrderForModification(null);
              // Trigger refetch to get updated data from Supabase
              triggerRefetch();
            }
          }}
          order={selectedOrderForModification}
          onOrderModified={triggerRefetch}
        />
      )}

      {selectedOrderForPayment && (
        <PaymentModal
          open={!!selectedOrderForPayment}
          onOpenChange={(open) => !open && setSelectedOrderForPayment(null)}
          order={selectedOrderForPayment}
          onPaymentComplete={handlePaymentComplete}
        />
      )}
    </div>
  );
}
