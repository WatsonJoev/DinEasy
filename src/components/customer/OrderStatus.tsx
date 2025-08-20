import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useApp } from "@/contexts/AppContext";
import { PaymentModal } from "./PaymentModal";
import { FeedbackModal } from "./FeedbackModal";
import { OrderModificationModal } from "./OrderModificationModal";
import { Checkbox } from "@/components/ui/checkbox"; // Import Checkbox
import type { OrderStatus } from "@/contexts/AppContext"; // Import OrderStatus type
import {
  Clock,
  ChefHat,
  CheckCircle,
  Star,
  CreditCard,
  Edit,
  Plus,
  Loader2,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface OrderStatusProps {
  orderId?: string;
}

export function OrderStatus({ orderId }: OrderStatusProps) {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const { activeTab } = useParams<{ activeTab?: string }>();
  const [selectedOrderForPayment, setSelectedOrderForPayment] = useState<any | null>(null);
  const [selectedOrderForFeedback, setSelectedOrderForFeedback] = useState<string | null>(null);
  const [selectedOrderForModification, setSelectedOrderForModification] = useState<any | null>(null);
  const [showCombinedBillModal, setShowCombinedBillModal] = useState(false);

  const userOrders = (state.orders || []).filter(
    (order) => order.tableNumber === state.restaurant?.table
  );

  const displayedOrders = orderId
    ? userOrders.filter((order) => order.id === orderId)
    : userOrders;

  // Check if there are any orders that are 'ready' or 'completed'
  const hasReadyOrCompletedOrders = displayedOrders.some(
    (order) => order.status === "ready" || order.status === "completed"
  );

  const handlePaymentComplete = (orderId: string) => {
    setSelectedOrderForPayment(null);
    const updatedOrders = state.orders.map(order =>
      order.id === orderId ? { ...order, status: "completed" as OrderStatus } : order
    );
    dispatch({ type: "SET_ORDERS", payload: updatedOrders });

    // Instead of navigating, open the feedback modal
    setSelectedOrderForFeedback(orderId);

    // The navigation to /customer/orders will happen after feedback is given/closed.
  };

  const handleCombinedBill = () => {
    const combinedOrders = state.orders.filter(
      (order) =>
        order.tableNumber === state.restaurant.table &&
        (order.status === "ready" || order.status === "completed")
    );
    if (combinedOrders.length > 0) {
      setSelectedOrderForPayment(combinedOrders);
      setShowCombinedBillModal(true);
    } else {
      toast({
        title: "No orders to combine",
        description: "There are no ready or completed orders to generate a combined bill for.",
        variant: "destructive"
      });
    }
  };

  const getStatusProgress = (status: string) => {
    switch (status) {
      case "new":
        return 25;
      case "preparing":
        return 50;
      case "ready":
        return 75;
      case "completed":
        return 100;
      default:
        return 0;
    }
  };

  const getStatusIcon = (status: string) => {
    const iconClass = "w-5 h-5";
    switch (status) {
      case "new":
        return <Clock className={`${iconClass} text-amber-600`} />;
      case "preparing":
        return <ChefHat className={`${iconClass} text-blue-600`} />;
      case "ready":
        return <CheckCircle className={`${iconClass} text-green-600`} />;
      case "completed":
        return <Star className={`${iconClass} text-purple-600`} />;
      default:
        return <Clock className={`${iconClass} text-gray-500`} />;
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case "new":
        return "Order confirmed! Chef is reviewing your request.";
      case "preparing":
        return "Your meal is being crafted with care by our chef.";
      case "ready":
        return "Your order is ready for pickup! Please collect it.";
      case "completed":
        return "Order completed. Thank you for dining with us!";
      default:
        return "Processing your order...";
    }
  };

  const getEstimatedTime = (status: string) => {
    switch (status) {
      case "new":
        return "5-10 min";
      case "preparing":
        return "3-8 min";
      case "ready":
        return "Ready now!";
      case "completed":
        return "Completed";
      default:
        return "Processing...";
    }
  };

  

  if (userOrders.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-bold text-slate-800">
              Order Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center">
                <ChefHat className="w-10 h-10 text-slate-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-700 mb-2">
                {orderId ? "Order not found" : "No orders yet"}
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed max-w-sm mx-auto">
                {orderId
                  ? "The order you are looking for does not exist or is not associated with your table."
                  : "Place an order from our delicious menu to start tracking your culinary journey!"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 pb-6">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-slate-200 px-4 py-5 mb-5">
        <h1 className="text-xl font-bold text-slate-800 text-center">
          Your Orders
        </h1>
        <p className="text-sm text-slate-600 text-center mt-1">
          Track your delicious journey
        </p>
      </div>

      <div className="space-y-4 px-4">
        {displayedOrders.map((order) => (
          <Card
            key={order.id}
            className="overflow-hidden shadow-md bg-white" // Changed shadow to md
          >
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <CardTitle className="text-lg font-bold text-slate-800 mb-1">
                    Order #{order.id.slice(-4)}
                  </CardTitle>
                  <p className="text-xs text-slate-600">
                    {new Date(order.timestamp).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    className={`px-2 py-0.5 text-xs font-semibold uppercase tracking-wide ${
                      order.status === "new"
                        ? "bg-amber-100 text-amber-800 border-amber-300"
                        : order.status === "preparing"
                        ? "bg-blue-100 text-blue-800 border-blue-300"
                        : order.status === "ready"
                        ? "bg-green-100 text-green-800 border-green-300"
                        : "bg-purple-100 text-purple-800 border-purple-300"
                    }`}
                  >
                    {order.status}
                  </Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Status Progress */}
              <div className="bg-white/70 rounded-xl p-3 space-y-2">
                <div className="flex items-center gap-2">
                  {getStatusIcon(order.status)}
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">
                      {getStatusMessage(order.status)}
                    </p>
                    <p className="text-xs text-slate-600 mt-0.5">
                      ETA: {getEstimatedTime(order.status)}
                    </p>
                  </div>
                </div>
                <Progress
                  value={getStatusProgress(order.status)}
                  className="w-full h-1.5 bg-slate-200"
                />
              </div>

              {/* Order Items and Total */}
              <div className="bg-white/70 rounded-xl p-3">
                <h4 className="font-semibold text-slate-800 mb-2 flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-slate-600 rounded-full"></div>
                  Order Items
                </h4>
                <div className="space-y-2">
                  {(order.items || []).map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center py-1.5 border-b border-slate-200 last:border-b-0"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-slate-800 text-sm">
                          {item.menuItem?.name || "Item"}
                        </p>
                        <p className="text-xs text-slate-600">
                          Qty: {item.quantity} • {item.orderType}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-slate-800 text-sm">
                          {state.restaurant?.currency || "₹"}
                          {(item.menuItem?.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div className="pt-2 border-t-2 border-slate-300 flex justify-between items-center">
                    <span className="font-bold text-slate-800 text-sm">
                      Total (incl. {state.restaurant?.taxRate || 0}% tax):
                    </span>
                    <span className="font-bold text-base text-slate-800">
                      {(() => {
                        const currency = state.restaurant?.currency || "₹";
                        const taxRate = state.restaurant?.taxRate || 0;
                        const itemsTotal =
                          order.items?.reduce((sum, item) => {
                            const price = item.menuItem?.price ?? 0;
                            return sum + price * item.quantity;
                          }, 0) ?? 0;
                        const taxAmount = (itemsTotal * taxRate) / 100;
                        return `${currency}${(itemsTotal + taxAmount).toFixed(
                          2
                        )}`;
                      })()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {order.status === "new" && (
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={() => setSelectedOrderForModification(order)}
                    variant="outline"
                    className="h-10 bg-white/90 border-2 border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-sm"
                  >
                    <Edit className="w-4 h-4 mr-1.5" />
                    Modify
                  </Button>
                  <Button
                    onClick={() => navigate("/customer")}
                    variant="outline"
                    className="h-10 bg-white/90 border-2 border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-sm"
                  >
                    <Plus className="w-4 h-4 mr-1.5" />
                    Add More
                  </Button>
                </div>
              )}

              {order.status === "preparing" && (
                <div>
                  <Button
                    onClick={() => navigate("/customer")}
                    variant="outline"
                    className="w-full h-10 bg-white/90 border-2 border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-sm"
                  >
                    <Plus className="w-4 h-4 mr-1.5" />
                    Add More
                  </Button>
                </div>
              )}

              {/* Payment */}
              {/* The individual "Request Bill" button is removed as per user's request */}

              {/* Feedback */}
              {order.status === "completed" && order.customerFeedback && (
                <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-slate-800 text-sm">
                        Your Feedback
                      </span>
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }, (_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < order.customerFeedback.rating
                                ? "text-yellow-500 fill-current"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    {order.customerFeedback.comment && (
                      <div className="bg-white/80 rounded-lg p-2 border border-purple-200">
                        <p className="text-xs text-slate-700 italic leading-relaxed">
                          "{order.customerFeedback.comment}"
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      {/* Conditionally render the Generate Combined Bill button */}
      {hasReadyOrCompletedOrders && (
        <div className="px-4 mt-5">
          <Button
            onClick={handleCombinedBill}
            className="w-full h-12 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold text-base shadow-lg"
          >
            Generate Combined Bill
          </Button>
        </div>
      )}
      <div className="h-6" /> {/* Adjusted gap for mobile */}
      <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200 shadow-md">
        <CardHeader className="text-center pb-3">
          <CardTitle className="text-lg font-bold text-slate-800 flex items-center justify-center gap-1.5">
            <Star className="w-5 h-5 text-orange-600" />
            Our Top 5 Signature Dishes
          </CardTitle>
          <p className="text-sm text-slate-600 mt-1">
            Loved by our customers
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {(state.topDishes || []).map((dish, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 bg-white/80 rounded-xl border border-orange-200 shadow-sm"
              >
                <div className="w-7 h-7 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="font-bold text-white text-xs">
                    #{index + 1}
                  </span>
                </div>
                <span className="font-semibold text-slate-800 text-sm flex-1">
                  {dish}
                </span>
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star
                      key={i}
                      className="w-3 h-3 text-yellow-500 fill-current"
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      {selectedOrderForModification && (
        <OrderModificationModal
          open={!!selectedOrderForModification}
          onOpenChange={(open) =>
            !open && setSelectedOrderForModification(null)
          }
          order={selectedOrderForModification}
        />
      )}

      {showCombinedBillModal && (
        <PaymentModal
          open={showCombinedBillModal}
          onOpenChange={setShowCombinedBillModal}
          order={selectedOrderForPayment}
          onPaymentComplete={handlePaymentComplete}
        />
      )}

      {selectedOrderForFeedback && (
        <FeedbackModal
          open={!!selectedOrderForFeedback}
          onClose={(skipped) => {
            setSelectedOrderForFeedback(null);
            
            // Clear the current order after feedback
            dispatch({ type: "CLEAR_CART" });
            
            // Wait for feedback to be stored before clearing orders
            setTimeout(() => {
              // Clear orders for the current table
              dispatch({ type: "CLEAR_TABLE_ORDERS", payload: state.restaurant.table });
              
              if (skipped) {
                navigate("/"); // Navigate to the very first page (scanning page)
              } else {
                // As per your last instruction, always navigate to the first page after feedback (submitted or not skipped)
                if (activeTab !== "orders") {
                  navigate("/");
                }
              }
            }, 200);
          }}
          orderId={selectedOrderForFeedback}
        />
      )}
    </div>
  );
}