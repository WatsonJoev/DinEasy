import React, { createContext, useContext, useReducer, ReactNode, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

// Define the MenuItem interface
export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  inStock: boolean;
  foodType: "veg" | "non-veg" | "others";
  recommended: boolean;
  spiceLevel: "mild" | "medium" | "hot" | "none";
  preparationTime: number;
  availableFrom?: string;
  availableTo?: string;
  available_from?: string;
  available_to?: string;
}

// Define the OrderItem interface
export interface OrderItem {
  id: string;
  menuItem: MenuItem;
  quantity: number;
  orderType: "dine-in" | "takeaway";
  spiceLevel: "mild" | "medium" | "hot" | "none"; // Added "none" as a valid option
  specialInstructions?: string;
  customizations?: string[];
  timestamp: string;
}

// Define the Order interface
export type OrderStatus = "new" | "preparing" | "ready" | "completed" | "cancelled";

export interface Order {
  id: string;
  tableNumber: string;
  items: OrderItem[];
  total: number;
  timestamp: string;
  status: OrderStatus;
  customerFeedback?: {
    rating: number;
    comment: string;
  };
  paymentDetails?: {
    method: "cash" | "upi" | null;
    subtotal: number;
    tax: number;
    tip: number;
    total: number;
    serviceRating: number;
    parcelCharges?: number;
  };
}

// Extended interfaces for new features
export interface CustomerLoyalty {
  points: number;
  tier: "Bronze" | "Silver" | "Gold" | "Platinum";
  totalSpent: number;
  rewardsRedeemed: number;
}

export interface Analytics {
  dailySales: number;
  weeklySales: number;
  monthlySales: number;
  completedToday: number;
}

export interface AppState {
  hotelName: string | null; 
  userType: "customer" | "chef" | "admin" | null;
  isAuthenticated: boolean;
  restaurant: {
    name: string;
    table: string;
    currency: string;
    taxRate: number;
  };
  tableNumber: string | null;
  menuItems: MenuItem[];
  currentOrder: OrderItem[];
  orders: Order[];
  inventory: Record<
    string,
    { currentStock: number; minStock: number; unit: string; cost: number }
  >;
  customerLoyalty: CustomerLoyalty;
  youtubeVideos: string[];
  topDishes: string[];
  analytics: Analytics;
  activeOrderId?: string | null;
}

// Define action types
type Action =
  | { type: "SET_TABLE_NUMBER"; payload: string }
  | { type: "SET_USER_TYPE"; payload: "customer" | "chef" | "admin" | null }
  | { type: "SET_AUTHENTICATED"; payload: boolean }
  | { type: "UPDATE_RESTAURANT_SETTINGS"; payload: Partial<AppState["restaurant"]> }
  | { type: "ADD_TO_CART"; payload: OrderItem }
  | { type: "REMOVE_FROM_CART"; payload: string }
  | { type: "UPDATE_CART_ITEM"; payload: { id: string; quantity: number; spiceLevel?: "mild" | "medium" | "hot"; specialInstructions?: string; customizations?: string[] } }
  | { type: "CLEAR_CART" }
  | { type: "PLACE_ORDER"; payload: Order }
  | { type: "UPDATE_ORDER_STATUS"; payload: { orderId: string; status: OrderStatus } }
  | { type: "COMPLETE_ORDER_PAYMENT"; payload: Order }
  | { type: "SET_ORDERS"; payload: Order[] }
  | { type: "MODIFY_ORDER"; payload: { id: string; updatedItems: OrderItem[] } }
  | { type: "CLEAR_TABLE_ORDERS"; payload: string }
  | { type: "ADD_MENU_ITEM"; payload: MenuItem }
  | { type: "UPDATE_MENU_ITEM"; payload: MenuItem }
  | { type: "DELETE_MENU_ITEM"; payload: string }
  | { type: "UPDATE_INVENTORY"; payload: Record<string, { currentStock: number; minStock: number; unit: string; cost: number }> }
  | { type: "UPDATE_LOYALTY"; payload: CustomerLoyalty }
  | { type: "UPDATE_YOUTUBE_VIDEOS"; payload: string[] }
  | { type: "UPDATE_TOP_DISHES"; payload: string[] }
  | { type: "UPDATE_ANALYTICS"; payload: Analytics }
  | { type: "REDEEM_LOYALTY_REWARD"; payload: { points: number } }
  | { type: "ADD_LOYALTY_POINTS"; payload: { points: number } }
  | { type: "ADD_FEEDBACK"; payload: { orderId: string; rating: number; comment: string } }
  | { type: "SET_CART"; payload: OrderItem[] }
  | { type: "SET_ACTIVE_ORDER_ID"; payload: string | null }
  | { type: "RESTORE_ORDER"; payload: Order & { items: OrderItem[] } }
  | { type: "LOAD_CART"; payload: OrderItem[] };

// Add parcel charge constant
export const PARCEL_CHARGE = 10; // ₹10 per takeaway item

// Enhanced initial state
const initialState: AppState = {
  hotelName: null,
  tableNumber: null,
  userType: null,
  isAuthenticated: false,
  restaurant: {
    name: "Saravana Bhavan",
    table: "T-001",
    currency: "₹",
    taxRate: 18,
  },
  menuItems: [],
  currentOrder: [],
  orders: [],
  inventory: {
    Rice: { currentStock: 50, minStock: 10, unit: "kg", cost: 2.5 },
    Chicken: { currentStock: 25, minStock: 5, unit: "kg", cost: 8.0 },
    Paneer: { currentStock: 15, minStock: 3, unit: "kg", cost: 6.0 },
    Tomatoes: { currentStock: 30, minStock: 8, unit: "kg", cost: 1.5 },
    Onions: { currentStock: 40, minStock: 10, unit: "kg", cost: 1.0 },
  },
  customerLoyalty: {
    points: 250,
    tier: "Bronze",
    totalSpent: 1250,
    rewardsRedeemed: 2,
  },
  youtubeVideos: ["dQw4w9WgXcQ", "L_jWHffIx5E", "ZZ5LpwO-An4"],
  topDishes: [
    "Masala Dosa",
    "Butter Chicken",
    "Biryani",
    "Paneer Tikka",
    "Chole Bhature",
  ],
  analytics: {
    dailySales: 2850,
    weeklySales: 18240,
    monthlySales: 76500,
    completedToday: 12,
  },
  activeOrderId: null,
};

// Enhanced reducer
function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "SET_TABLE_NUMBER":
      return { ...state, tableNumber: action.payload };
    case "SET_USER_TYPE":
      if (typeof window !== 'undefined' && window.localStorage) {
        if (action.payload) {
          localStorage.setItem("userType", action.payload);
        } else {
          localStorage.removeItem("userType");
        }
      }
      return { ...state, userType: action.payload };
    case "SET_AUTHENTICATED":
      if (typeof window !== 'undefined' && window.localStorage) {
        if (action.payload) {
          localStorage.setItem("authenticated", "true");
        } else {
          localStorage.removeItem("authenticated");
        }
      }
      return { ...state, isAuthenticated: action.payload };
    case "UPDATE_RESTAURANT_SETTINGS":
      return {
        ...state,
        restaurant: { ...state.restaurant, ...action.payload },
      };

    case "ADD_TO_CART":
      const existingCartItem = state.currentOrder.find(
        (item) =>
          item.menuItem.id === action.payload.menuItem.id &&
          item.orderType === action.payload.orderType
      );
      if (existingCartItem) {
        return {
          ...state,
          currentOrder: state.currentOrder.map((item) =>
            item.menuItem.id === action.payload.menuItem.id &&
            item.orderType === action.payload.orderType
              ? { ...item, quantity: item.quantity + action.payload.quantity }
              : item
          ),
        };
      } else {
        return {
          ...state,
          currentOrder: [...state.currentOrder, action.payload],
        };
      }

    case "REMOVE_FROM_CART":
      return {
        ...state,
        currentOrder: state.currentOrder.filter(
          (item) => item.id !== action.payload
        ),
      };

    case "UPDATE_CART_ITEM":
      return {
        ...state,
        currentOrder: state.currentOrder.map((item) =>
          item.id === action.payload.id
            ? {
                ...item,
                quantity:
                  action.payload.quantity !== undefined
                    ? action.payload.quantity
                    : item.quantity,
                spiceLevel:
                  action.payload.spiceLevel || item.spiceLevel,
                specialInstructions:
                  action.payload.specialInstructions ?? item.specialInstructions,
                customizations:
                  action.payload.customizations ?? item.customizations,
              }
            : item
        ),
      };
    case "CLEAR_CART":
      return { ...state, currentOrder: [] };

    case "PLACE_ORDER": {
      const orderTotal = action.payload.total;
      const tierMultiplier =
        state.customerLoyalty.tier === "Bronze"
          ? 1
          : state.customerLoyalty.tier === "Silver"
          ? 1.2
          : state.customerLoyalty.tier === "Gold"
          ? 1.5
          : 2;
      const pointsEarned = Math.floor(orderTotal * tierMultiplier);

      return {
        ...state,
        orders: [...state.orders, action.payload],
        currentOrder: [],
        customerLoyalty: {
          ...state.customerLoyalty,
          points: state.customerLoyalty.points + pointsEarned,
          totalSpent: state.customerLoyalty.totalSpent + orderTotal,
        },
      };
    }

    case "UPDATE_ORDER_STATUS":
      return {
        ...state,
        orders: state.orders.map(order =>
          order.id === action.payload.orderId
            ? { ...order, status: action.payload.status }
            : order
        ),
      };
    case "COMPLETE_ORDER_PAYMENT":
      return {
        ...state,
        orders: state.orders.map((order) =>
          order.id === action.payload.id
            ? {
                ...order,
                status: "completed",
                paymentDetails: action.payload.paymentDetails,
              }
            : order
        ),
      };
    case "SET_ORDERS":
      return {
        ...state,
        orders: action.payload,
      };

    case "MODIFY_ORDER":
      return {
        ...state,
        orders: state.orders.map(order =>
          order.id === action.payload.id
            ? { ...order, items: action.payload.updatedItems }
            : order
        )
      };
    case "CLEAR_TABLE_ORDERS":
      return {
        ...state,
        orders: state.orders.filter(order => order.tableNumber !== action.payload)
      };
    case "ADD_MENU_ITEM":
      return { ...state, menuItems: [...state.menuItems, action.payload] };
    case "UPDATE_MENU_ITEM":
      return {
        ...state,
        menuItems: state.menuItems.map((item) =>
          item.id === action.payload.id ? action.payload : item
        ),
      };
    case "DELETE_MENU_ITEM":
      return {
        ...state,
        menuItems: state.menuItems.filter((item) => item.id !== action.payload),
      };
    case "UPDATE_INVENTORY":
      return { ...state, inventory: action.payload };
    case "UPDATE_LOYALTY":
      return { ...state, customerLoyalty: action.payload };
    case "UPDATE_YOUTUBE_VIDEOS":
      return { ...state, youtubeVideos: action.payload };
    case "UPDATE_TOP_DISHES":
      return { ...state, topDishes: action.payload };
    case "UPDATE_ANALYTICS":
      return { ...state, analytics: action.payload };
    case "REDEEM_LOYALTY_REWARD":
      return {
        ...state,
        customerLoyalty: {
          ...state.customerLoyalty,
          points: state.customerLoyalty.points - action.payload.points
        }
      };
    case "ADD_LOYALTY_POINTS":
      return {
        ...state,
        customerLoyalty: {
          ...state.customerLoyalty,
          points: state.customerLoyalty.points + action.payload.points
        }
      };
    case "ADD_FEEDBACK":
      return {
        ...state,
        orders: state.orders.map(order =>
          order.id === action.payload.orderId
            ? { ...order, customerFeedback: { rating: action.payload.rating, comment: action.payload.comment } }
            : order
        )
      };
    case "SET_CART":
      return { ...state, currentOrder: action.payload };
    case "SET_ACTIVE_ORDER_ID":
      return { ...state, activeOrderId: action.payload };
    case "RESTORE_ORDER":
      return {
        ...state,
        activeOrderId: action.payload.id,
        currentOrder: action.payload.items,
        orders: [...state.orders.filter(o => o.id !== action.payload.id), action.payload],
      };
    case "LOAD_CART":
      return { ...state, currentOrder: action.payload };
    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  isMenuItemAvailable: (item: MenuItem) => boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const getInitialState = () => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const storedUserType = localStorage.getItem("userType") as AppState["userType"] | null;
        const storedAuth = localStorage.getItem("authenticated");
        return {
          ...initialState,
          userType: storedUserType || initialState.userType,
          isAuthenticated: storedAuth === "true" ? true : initialState.isAuthenticated,
        };
      }
    } catch (error) {
      console.warn("localStorage not available:", error);
    }
    return initialState;
  };

  const [state, dispatch] = useReducer(appReducer, getInitialState());

  useEffect(() => {
    const sessionId = localStorage.getItem("session_id");
    if (!sessionId) return;
    
    const fetchCart = async () => {
      try {
        // Only fetch active cart items
      const { data, error } = await supabase
        .from("cart_items")
        .select("*, menu_items(*)")
        .eq("session_id", sessionId)
          .eq("status", "active");

        if (error) {
          console.error("Error fetching cart:", error);
          dispatch({ type: "CLEAR_CART" });
          return;
        }

        if (data && data.length > 0) {
          // Filter out any items that might have incomplete menu_items data
          const validItems = data.filter(item => 
            item.menu_items && 
            item.menu_items.id && 
            item.menu_items.name && 
            typeof item.menu_items.price === 'number'
          );

          if (validItems.length > 0) {
            const hydratedCartItems = validItems.map((item) => ({
              id: crypto.randomUUID(),
              menuItem: {
                id: item.menu_items.id,
                name: item.menu_items.name,
                description: item.menu_items.description || "",
                price: parseFloat(item.menu_items.price),
                category: item.menu_items.category || "",
                image: item.menu_items.image || "",
                inStock: item.menu_items.inStock ?? true,
                foodType: item.menu_items.foodType || "veg",
                recommended: item.menu_items.recommended ?? false,
                spiceLevel: item.menu_items.spiceLevel || "medium",
                preparationTime: item.menu_items.preparationTime || 0,
                availableFrom: item.menu_items.availableFrom || item.menu_items.available_from,
                availableTo: item.menu_items.availableTo || item.menu_items.available_to,
                available_from: item.menu_items.available_from,
                available_to: item.menu_items.available_to,
              },
              quantity: parseInt(item.quantity) || 1,
              orderType: item.order_type || "dine-in",
              spiceLevel: item.spice_level || "medium",
              timestamp: item.added_at ?? new Date().toISOString(),
              specialInstructions: item.special_instructions,
              customizations: item.customizations || [],
            }));
            
            dispatch({ type: "LOAD_CART", payload: hydratedCartItems });
          } else {
            // No valid items found, clear cart
            dispatch({ type: "CLEAR_CART" });
          }
        } else {
          // No items found, ensure cart is empty
          dispatch({ type: "CLEAR_CART" });
        }
      } catch (error) {
        console.error("Unexpected error fetching cart:", error);
        dispatch({ type: "CLEAR_CART" });
      }
    };

    // Only fetch cart if user is authenticated
    if (state.isAuthenticated) {
    fetchCart();
    } else {
      // Clear cart if not authenticated
      dispatch({ type: "CLEAR_CART" });
    }
  }, [state.isAuthenticated]); // Remove dispatch from dependencies to avoid infinite loops

  useEffect(() => {
    const fetchActiveOrder = async () => {
      const activeOrderId = localStorage.getItem("activeOrderId");
      if (!activeOrderId) return;

      const { data: order, error: orderError } = await supabase
        .from("orders")
        .select("*")
        .eq("id", activeOrderId)
        .maybeSingle();

      const { data: items, error: itemsError } = await supabase
        .from("order_items")
        .select("*, menu_item:menu_item_id(*)")
        .eq("order_id", activeOrderId);

      if (order && items) {
        dispatch({
          type: "RESTORE_ORDER",
          payload: {
            id: order.id,
            tableNumber: order.table_number,
            items: items.map(i => ({
              id: i.id,
              menuItem: {
                id: i.menu_item_id,
                name: i.menu_item_name || i.menu_item?.name || "Unknown",
                price: i.price,
                description: i.menu_item?.description || "",
                category: i.menu_item?.category || "",
                image: i.menu_item?.image || "",
                inStock: i.menu_item?.inStock ?? true,
                foodType: i.menu_item?.foodType || "veg",
                recommended: i.menu_item?.recommended ?? false,
                spiceLevel: i.menu_item?.spiceLevel || "medium",
                preparationTime: i.menu_item?.preparationTime || 0,
                availableFrom: i.menu_item?.availableFrom || undefined,
                availableTo: i.menu_item?.availableTo || undefined,
                available_from: i.menu_item?.available_from || undefined,
                available_to: i.menu_item?.available_to || undefined,
              },
              quantity: i.quantity,
              orderType: i.order_type,
              spiceLevel: i.spice_level,
              timestamp: i.added_at || i.timestamp || new Date().toISOString(),
              specialInstructions: i.special_instructions,
              customizations: i.customizations || [],
            })),
            total: order.total,
            status: order.status,
            timestamp: order.timestamp,
            paymentDetails: order.payment_details,
          }
        });
      }

      if (orderError || itemsError) {
        console.error("Restore error:", orderError || itemsError);
      }
    };

    fetchActiveOrder();
  }, []);

  useEffect(() => {
    const sessionId = localStorage.getItem("session_id");
    if (!sessionId) return;
    const fetchOrders = async () => {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          order_items:order_items(*)
        `)
        .eq("session_id", sessionId);
      if (error) {
        console.error("Error fetching orders:", error);
        return;
      }
      dispatch({ type: "SET_ORDERS", payload: (data || []).map(order => ({
        ...order,
        items: (order.order_items || []).map(item => ({
          id: item.id,
          quantity: item.quantity,
          orderType: item.order_type,
          menuItem: {
            id: item.menu_item_id,
            name: item.menu_item_name,
            price: item.price,
          }
        }))
      })) });
    };
    fetchOrders();
  }, []);

  // Checks if a menu item is available currently by time window
  const isMenuItemAvailable = (item: MenuItem): boolean => {
    // Support both camelCase and snake_case keys from Supabase
    const availableFrom = item.availableFrom || item.available_from;
    const availableTo = item.availableTo || item.available_to;

    if (!availableFrom || !availableTo) return false;

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    // Defensive: ensure split works
    if (!availableFrom.includes(":") || !availableTo.includes(":")) return false;

    const [fromHour, fromMinute] = availableFrom.split(":").map(Number);
    const [toHour, toMinute] = availableTo.split(":").map(Number);

    if (isNaN(fromHour) || isNaN(fromMinute) || isNaN(toHour) || isNaN(toMinute)) return false;

    const fromTime = fromHour * 60 + fromMinute;
    const toTime = toHour * 60 + toMinute;

    // Handle overnight availability like 22:00 - 06:00
    if (toTime < fromTime) {
      return currentTime >= fromTime || currentTime <= toTime;
    }

    return currentTime >= fromTime && currentTime <= toTime;
  };

  if (!state.orders) {
    return <div>Loading...</div>;
  }

  return (
    <AppContext.Provider value={{ state, dispatch, isMenuItemAvailable }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextType {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
