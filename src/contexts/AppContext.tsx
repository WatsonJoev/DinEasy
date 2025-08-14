import React, { createContext, useContext, useReducer, ReactNode, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { fetchCartItems } from "../lib/utils";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  inStock: boolean;
  foodType: "veg" | "non-veg" | "others";
  recommended: boolean;
  spiceLevel: "mild" | "medium" | "hot";
  preparationTime: number;
  availableFrom?: string;
  availableTo?: string;
}

// Define the OrderItem interface
interface OrderItem {
  id: string;
  menuItem: MenuItem;
  quantity: number;
  orderType: "dine-in" | "takeaway";
  spiceLevel: "mild" | "medium" | "hot";
  specialInstructions?: string;
  customizations?: string[];
  timestamp: string;
}

// Define the Order interface
interface Order {
  id: string;
  tableNumber: string;
  items: OrderItem[];
  total: number;
  timestamp: string;
  status: "new" | "preparing" | "ready" | "completed";
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
  };
  phoneNumber: string;
}

// Extended interfaces for new features
interface CustomerLoyalty {
  points: number;
  tier: "Bronze" | "Silver" | "Gold" | "Platinum";
  totalSpent: number;
  rewardsRedeemed: number;
}

interface Analytics {
  dailySales: number;
  weeklySales: number;
  monthlySales: number;
  completedToday: number;
}

interface AppState {
  userType: "customer" | "chef" | "admin" | null;
  isAuthenticated: boolean;
  phoneNumber: string;
  restaurant: {
    takeawayCharge: any;
    name: string;
    table: string;
    currency: string;
    taxRate: number;
  };
  menuItems: MenuItem[];
  currentOrder: OrderItem[];
  orders: Order[];
  inventory: Record<string, any>;
  customerLoyalty: CustomerLoyalty;
  youtubeVideos: string[];
  topDishes: string[];
  analytics: Analytics;
  tableNumber: string | null;
}

// Define action types
type Action =
  | { type: "SET_USER_TYPE"; payload: "customer" | "chef" | "admin" | null }
  | { type: "SET_AUTHENTICATED"; payload: boolean }
  | { type: "SET_TABLE_NUMBER"; payload: string | null }
  | {
    type: "UPDATE_RESTAURANT_SETTINGS";
    payload: Partial<AppState["restaurant"]>;
  }
  | { type: "INCREASE_QUANTITY"; payload: string }
  | { type: "DECREASE_QUANTITY"; payload: string }
  | { type: "SET_USER_TYPE"; payload: string | null }
  | { type: "SET_PHONE_NUMBER"; payload: string }
  | { type: "SET_AUTHENTICATED"; payload: boolean }
  | { type: "ADD_TO_CART"; payload: OrderItem }
  | { type: "REMOVE_FROM_CART"; payload: string }
  | { type: "UPDATE_CART_ITEM"; payload: { id: string; quantity: number } }
  | { type: "CLEAR_CART" }
  | { type: "PLACE_ORDER"; payload: Order }
  | {
    type: "UPDATE_ORDER_STATUS";
    payload: { orderId: string; status: string };
  }
  | { type: "ADD_MENU_ITEM"; payload: MenuItem }
  | { type: "UPDATE_MENU_ITEM"; payload: MenuItem }
  | { type: "DELETE_MENU_ITEM"; payload: string }
  | { type: "TOGGLE_STOCK"; payload: string }
  | { type: "UPDATE_INVENTORY"; payload: Record<string, any> }
  | {
    type: "REDEEM_LOYALTY_REWARD";
    payload: { rewardId: number; pointsUsed: number };
  }
  | { type: "ADD_LOYALTY_POINTS"; payload: number }
  | { type: "COMPLETE_ORDER_PAYMENT"; payload: any }
  | {
    type: "ADD_TO_EXISTING_ORDER";
    payload: {
      orderId: string;
      items: OrderItem[];
    };
  }
  | { type: "ADD_FEEDBACK"; payload: any }
  | { type: "MODIFY_ORDER"; payload: any }
  | { type: "CLEAR_ALL_ORDERS" }
  | { type: "SET_CART"; payload: OrderItem[] };

export const PARCEL_CHARGE = 10; // ₹10 per takeaway item
// Enhanced initial state
const initialState: AppState = {
  userType: null,
  isAuthenticated: false,
  phoneNumber: "",
  restaurant: {
    takeawayCharge: 0,
    name: "Saravana Bhavan",
    table: "T-001",
    currency: "₹",
    taxRate: 18,
  },
  tableNumber: null,
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
};

// Enhanced reducer
function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "SET_TABLE_NUMBER":
      return { ...state, tableNumber: action.payload };
    case "SET_USER_TYPE":
      return {
        ...state,
        userType: action.payload as "customer" | "chef" | "admin" | null,
      };
    case "SET_PHONE_NUMBER":
      return { ...state, phoneNumber: action.payload };
    case "SET_AUTHENTICATED":
      return { ...state, isAuthenticated: action.payload };

    case "UPDATE_RESTAURANT_SETTINGS":
      return {
        ...state,
        restaurant: { ...state.restaurant, ...action.payload },
      };

    case "ADD_TO_CART":
      return {
        ...state,
        currentOrder: [...state.currentOrder, action.payload],
      };

    case "REMOVE_FROM_CART":
      console.log("Removing from cart:", action.payload);
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
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
      };

    case "CLEAR_CART":
      return { ...state, currentOrder: [] };

    case "PLACE_ORDER":
      const orderTotal = action.payload.total;
      const pointsEarned = Math.floor(
        orderTotal *
        (state.customerLoyalty.tier === "Bronze"
          ? 1
          : state.customerLoyalty.tier === "Silver"
            ? 1.2
            : state.customerLoyalty.tier === "Gold"
              ? 1.5
              : 2)
      );
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

    case "UPDATE_ORDER_STATUS":
      return {
        ...state,
        orders: state.orders.map((order) =>
          order.id === action.payload.orderId
            ? { 
                ...order, 
                status: action.payload.status as "new" | "preparing" | "ready" | "completed" 
              }
            : order
        ),
      };

    case "ADD_MENU_ITEM":
      return {
        ...state,
        menuItems: [...state.menuItems, action.payload],
      };

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

    case "TOGGLE_STOCK":
      return {
        ...state,
        menuItems: state.menuItems.map((item) =>
          item.id === action.payload
            ? { ...item, inStock: !item.inStock }
            : item
        ),
      };

    case "UPDATE_INVENTORY":
      return {
        ...state,
        inventory: { ...state.inventory, ...action.payload },
      };

    case "REDEEM_LOYALTY_REWARD":
      return {
        ...state,
        customerLoyalty: {
          ...state.customerLoyalty,
          points: state.customerLoyalty.points - action.payload.pointsUsed,
          rewardsRedeemed: state.customerLoyalty.rewardsRedeemed + 1,
        },
      };

    case "ADD_LOYALTY_POINTS":
      let newTier = state.customerLoyalty.tier;
      const newPoints = state.customerLoyalty.points + action.payload;

      if (newPoints >= 2000) newTier = "Platinum";
      else if (newPoints >= 1000) newTier = "Gold";
      else if (newPoints >= 500) newTier = "Silver";
      else newTier = "Bronze";

      return {
        ...state,
        customerLoyalty: {
          ...state.customerLoyalty,
          points: newPoints,
          tier: newTier,
        },
      };

    case "COMPLETE_ORDER_PAYMENT":
      return {
        ...state,
        orders: state.orders.map((order) =>
          order.id === action.payload.orderId || order.id === action.payload
            ? {
              ...order,
              status: "completed",
              paymentDetails: action.payload.paymentDetails,
            }
            : order
        ),
      };
    case "INCREASE_QUANTITY":
      return {
        ...state,
        currentOrder: state.currentOrder.map((item) =>
          item.menuItem.id === action.payload
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ),
      };

    case "DECREASE_QUANTITY":
      return {
        ...state,
        currentOrder: state.currentOrder.map((item) =>
          item.menuItem.id === action.payload && item.quantity > 1
            ? { ...item, quantity: item.quantity - 1 }
            : item
        ),
      };
    case "ADD_TO_EXISTING_ORDER": {
      const { orderId, items } = action.payload;

      return {
        ...state,
        orders: state.orders.map((order) => {
          if (order.id !== orderId) return order;

          // Merge logic (could be more complex)
          const updatedItems = [...order.items];
          for (const newItem of items) {
            const existingIndex = updatedItems.findIndex(
              (i) =>
                i.menuItem.id === newItem.menuItem.id &&
                i.orderType === newItem.orderType
            );
            if (existingIndex >= 0) {
              updatedItems[existingIndex].quantity += newItem.quantity;
            } else {
              updatedItems.push(newItem);
            }
          }

          return {
            ...order,
            items: updatedItems,
          };
        }),
      };
    }

    case "ADD_FEEDBACK":
      return { ...state, orders: [...state.orders, action.payload] };

    case "MODIFY_ORDER":
      return {
        ...state,
        orders: state.orders.map((order) =>
          order.id === action.payload.orderId
            ? {
                ...order,
                items: action.payload.items,
                total: action.payload.total,
                paymentDetails: action.payload.paymentDetails,
              }
            : order
        ),
      };

    case "CLEAR_ALL_ORDERS":
      return { ...state, orders: [] };

    // inside AppContext reducer:
    case "SET_CART":
      return {
        ...state,
        currentOrder: action.payload,
      };


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
  // Hydrate from localStorage
  const persistedUserType = localStorage.getItem("userType");
  const validUserType = ["customer", "chef", "admin"].includes(persistedUserType)
    ? persistedUserType
    : null;
  const persistedAuth = localStorage.getItem("isAuthenticated") === "true";
  const [state, dispatch] = useReducer(appReducer, {
    ...initialState,
    userType: validUserType as "customer" | "chef" | "admin" | null,
    isAuthenticated: persistedAuth || initialState.isAuthenticated,
  });

  // Persist to localStorage on change
  useEffect(() => {
    localStorage.setItem("userType", state.userType ?? "");
    localStorage.setItem("isAuthenticated", state.isAuthenticated ? "true" : "false");
  }, [state.userType, state.isAuthenticated]);

  const isMenuItemAvailable = (item: MenuItem) => {
    if (!item.availableFrom || !item.availableTo) return true;

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    const [fromHour, fromMinute] = item.availableFrom.split(":").map(Number);
    const [toHour, toMinute] = item.availableTo.split(":").map(Number);

    const fromTime = fromHour * 60 + fromMinute;
    const toTime = toHour * 60 + toMinute;

    return currentTime >= fromTime && currentTime <= toTime;
  };

  return (
    <AppContext.Provider value={{ state, dispatch, isMenuItemAvailable }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}

export async function syncCartFromSupabase(userId, dispatch) {
  const items = await fetchCartItems(userId);
  const orderItems = items.map(item => ({
    id: item.id,
    menuItem: item.menu_items,
    quantity: item.quantity,
    orderType: item.order_type,
    spiceLevel: item.spice_level,
    timestamp: item.timestamp || new Date().toISOString(),
  }));
  dispatch({ type: "SET_CART", payload: orderItems });
}

