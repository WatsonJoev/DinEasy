
import React, { createContext, useContext, useReducer, ReactNode } from 'react';

// Types
export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  inStock: boolean;
  foodType: 'veg' | 'non-veg';
  recommended?: boolean;
  spiceLevel?: 'mild' | 'medium' | 'hot';
  preparationTime: number; // in minutes
  availableFrom?: string; // time in HH:mm format
  availableTo?: string; // time in HH:mm format
}

export interface OrderItem {
  menuItem: MenuItem;
  quantity: number;
  orderType: 'dine-in' | 'takeaway';
}

export interface Order {
  id: string;
  tableNumber: string;
  items: OrderItem[];
  status: 'new' | 'preparing' | 'ready' | 'completed';
  total: number;
  timestamp: Date;
  customerFeedback?: {
    rating: number;
    comment: string;
  };
}

export interface RestaurantSettings {
  name: string;
  table: string;
  currency: string;
  taxRate: number; // percentage
}

export interface AppState {
  // Demo data
  restaurant: RestaurantSettings;
  
  // Menu
  menuItems: MenuItem[];
  
  // Orders
  orders: Order[];
  currentOrder: OrderItem[];
  
  // User context
  userType: 'customer' | 'chef' | 'admin' | null;
  isAuthenticated: boolean;
  
  // Analytics
  analytics: {
    dailySales: number;
    weeklySales: number;
    monthlySales: number;
    completedToday: number;
    avgOrderValue: number;
    popularItems: { name: string; count: number }[];
  };
  
  // Content
  topDishes: string[];
  youtubeVideos: string[];
}

// Actions
type AppAction =
  | { type: 'SET_USER_TYPE'; payload: 'customer' | 'chef' | 'admin' | null }
  | { type: 'SET_AUTHENTICATED'; payload: boolean }
  | { type: 'ADD_TO_CART'; payload: { menuItem: MenuItem; quantity: number; orderType: 'dine-in' | 'takeaway' } }
  | { type: 'REMOVE_FROM_CART'; payload: string }
  | { type: 'CLEAR_CART' }
  | { type: 'PLACE_ORDER' }
  | { type: 'UPDATE_ORDER_STATUS'; payload: { orderId: string; status: Order['status'] } }
  | { type: 'MODIFY_ORDER'; payload: { orderId: string; items: OrderItem[] } }
  | { type: 'ADD_TO_EXISTING_ORDER'; payload: { orderId: string; items: OrderItem[] } }
  | { type: 'COMPLETE_ORDER_PAYMENT'; payload: string }
  | { type: 'ADD_MENU_ITEM'; payload: MenuItem }
  | { type: 'UPDATE_MENU_ITEM'; payload: MenuItem }
  | { type: 'DELETE_MENU_ITEM'; payload: string }
  | { type: 'TOGGLE_STOCK'; payload: string }
  | { type: 'UPDATE_RESTAURANT_SETTINGS'; payload: RestaurantSettings }
  | { type: 'ADD_FEEDBACK'; payload: { orderId: string; rating: number; comment: string } };

// Initial state with demo data
const initialState: AppState = {
  restaurant: {
    name: "South Indian Delight",
    table: "Table 5",
    currency: "₹",
    taxRate: 18
  },
  
  menuItems: [
    {
      id: '1',
      name: 'Masala Dosa',
      description: 'Crispy fermented crepe filled with spiced potato curry',
      price: 120,
      category: 'South Indian',
      image: 'https://images.unsplash.com/photo-1630383249896-424e482df921?w=400',
      inStock: true,
      foodType: 'veg',
      recommended: true,
      spiceLevel: 'medium',
      preparationTime: 15,
      availableFrom: '06:00',
      availableTo: '22:00'
    },
    {
      id: '2',
      name: 'Chicken Biryani',
      description: 'Aromatic basmati rice with tender chicken pieces and exotic spices',
      price: 280,
      category: 'Biryani',
      image: 'https://images.unsplash.com/photo-1563379091339-03246963d27c?w=400',
      inStock: true,
      foodType: 'non-veg',
      recommended: true,
      spiceLevel: 'hot',
      preparationTime: 25,
      availableFrom: '11:00',
      availableTo: '23:00'
    },
    {
      id: '3',
      name: 'Sambar Idli',
      description: 'Steamed rice cakes served with lentil curry and coconut chutney',
      price: 80,
      category: 'South Indian',
      image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400',
      inStock: true,
      foodType: 'veg',
      spiceLevel: 'mild',
      preparationTime: 10,
      availableFrom: '06:00',
      availableTo: '11:00'
    },
    {
      id: '4',
      name: 'Rava Kesari',
      description: 'Sweet semolina dessert garnished with nuts and raisins',
      price: 60,
      category: 'Desserts',
      image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400',
      inStock: false,
      foodType: 'veg',
      preparationTime: 8,
      availableFrom: '12:00',
      availableTo: '22:00'
    },
    {
      id: '5',
      name: 'Fish Curry',
      description: 'South Indian style fish curry with coconut and tamarind',
      price: 320,
      category: 'Main Course',
      image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400',
      inStock: true,
      foodType: 'non-veg',
      spiceLevel: 'hot',
      preparationTime: 20,
      availableFrom: '12:00',
      availableTo: '22:00'
    }
  ],
  
  orders: [],
  currentOrder: [],
  userType: null,
  isAuthenticated: false,
  
  analytics: {
    dailySales: 2450.50,
    weeklySales: 18205.75,
    monthlySales: 78490.25,
    completedToday: 12,
    avgOrderValue: 204.20,
    popularItems: [
      { name: 'Masala Dosa', count: 25 },
      { name: 'Chicken Biryani', count: 18 },
      { name: 'Fish Curry', count: 12 }
    ]
  },
  
  topDishes: [
    'Masala Dosa',
    'Chicken Biryani',
    'Fish Curry',
    'Sambar Idli',
    'Rava Kesari'
  ],
  
  youtubeVideos: [
    'dQw4w9WgXcQ',
    'kJQP7kiw5Fk'
  ]
};

// Helper function to check if menu item is available at current time
const isMenuItemAvailable = (item: MenuItem): boolean => {
  if (!item.availableFrom || !item.availableTo) return true;
  
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();
  
  const [fromHours, fromMinutes] = item.availableFrom.split(':').map(Number);
  const [toHours, toMinutes] = item.availableTo.split(':').map(Number);
  
  const fromTime = fromHours * 60 + fromMinutes;
  const toTime = toHours * 60 + toMinutes;
  
  return currentTime >= fromTime && currentTime <= toTime;
};

// Reducer
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_USER_TYPE':
      return { ...state, userType: action.payload };
      
    case 'SET_AUTHENTICATED':
      return { ...state, isAuthenticated: action.payload };
      
    case 'ADD_TO_CART':
      const existingItemIndex = state.currentOrder.findIndex(
        item => item.menuItem.id === action.payload.menuItem.id && item.orderType === action.payload.orderType
      );
      
      if (existingItemIndex >= 0) {
        const updatedOrder = [...state.currentOrder];
        updatedOrder[existingItemIndex].quantity += action.payload.quantity;
        return { ...state, currentOrder: updatedOrder };
      } else {
        return {
          ...state,
          currentOrder: [...state.currentOrder, {
            menuItem: action.payload.menuItem,
            quantity: action.payload.quantity,
            orderType: action.payload.orderType
          }]
        };
      }
      
    case 'REMOVE_FROM_CART':
      return {
        ...state,
        currentOrder: state.currentOrder.filter(item => item.menuItem.id !== action.payload)
      };
      
    case 'CLEAR_CART':
      return { ...state, currentOrder: [] };
      
    case 'PLACE_ORDER':
      if (state.currentOrder.length === 0) return state;
      
      const newOrder: Order = {
        id: Date.now().toString(),
        tableNumber: state.restaurant.table,
        items: [...state.currentOrder],
        status: 'new',
        total: state.currentOrder.reduce((sum, item) => sum + (item.menuItem.price * item.quantity), 0),
        timestamp: new Date()
      };
      
      return {
        ...state,
        orders: [...state.orders, newOrder],
        currentOrder: []
      };
      
    case 'UPDATE_ORDER_STATUS':
      return {
        ...state,
        orders: state.orders.map(order =>
          order.id === action.payload.orderId
            ? { ...order, status: action.payload.status }
            : order
        )
      };
      
    case 'MODIFY_ORDER':
      return {
        ...state,
        orders: state.orders.map(order =>
          order.id === action.payload.orderId
            ? { 
                ...order, 
                items: action.payload.items,
                total: action.payload.items.reduce((sum, item) => sum + (item.menuItem.price * item.quantity), 0)
              }
            : order
        )
      };

    case 'ADD_TO_EXISTING_ORDER':
      return {
        ...state,
        orders: state.orders.map(order =>
          order.id === action.payload.orderId
            ? { 
                ...order, 
                items: [...order.items, ...action.payload.items],
                total: [...order.items, ...action.payload.items].reduce((sum, item) => sum + (item.menuItem.price * item.quantity), 0)
              }
            : order
        )
      };
      
    case 'COMPLETE_ORDER_PAYMENT':
      const updatedOrders = state.orders.map(order =>
        order.id === action.payload && order.status === 'ready'
          ? { ...order, status: 'completed' as const }
          : order
      );
      
      const completedOrder = state.orders.find(order => order.id === action.payload);
      const newDailySales = completedOrder 
        ? state.analytics.dailySales + completedOrder.total
        : state.analytics.dailySales;
      
      const newCompletedToday = completedOrder ? state.analytics.completedToday + 1 : state.analytics.completedToday;
      
      return {
        ...state,
        orders: updatedOrders,
        analytics: {
          ...state.analytics,
          dailySales: newDailySales,
          completedToday: newCompletedToday
        }
      };
      
    case 'ADD_MENU_ITEM':
      return {
        ...state,
        menuItems: [...state.menuItems, action.payload]
      };
      
    case 'UPDATE_MENU_ITEM':
      return {
        ...state,
        menuItems: state.menuItems.map(item =>
          item.id === action.payload.id ? action.payload : item
        )
      };
      
    case 'DELETE_MENU_ITEM':
      return {
        ...state,
        menuItems: state.menuItems.filter(item => item.id !== action.payload)
      };
      
    case 'TOGGLE_STOCK':
      return {
        ...state,
        menuItems: state.menuItems.map(item =>
          item.id === action.payload ? { ...item, inStock: !item.inStock } : item
        )
      };

    case 'UPDATE_RESTAURANT_SETTINGS':
      return {
        ...state,
        restaurant: action.payload
      };
      
    case 'ADD_FEEDBACK':
      return {
        ...state,
        orders: state.orders.map(order =>
          order.id === action.payload.orderId
            ? {
                ...order,
                customerFeedback: {
                  rating: action.payload.rating,
                  comment: action.payload.comment
                }
              }
            : order
        )
      };
      
    default:
      return state;
  }
}

// Context
const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  isMenuItemAvailable: (item: MenuItem) => boolean;
} | null>(null);

// Provider
export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  
  return (
    <AppContext.Provider value={{ state, dispatch, isMenuItemAvailable }}>
      {children}
    </AppContext.Provider>
  );
}

// Hook
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
