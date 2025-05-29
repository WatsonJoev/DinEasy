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
}

export interface OrderItem {
  menuItem: MenuItem;
  quantity: number;
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

export interface AppState {
  // Demo data
  restaurant: {
    name: string;
    table: string;
  };
  
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
  };
  
  // Content
  topDishes: string[];
  youtubeVideos: string[];
}

// Actions
type AppAction =
  | { type: 'SET_USER_TYPE'; payload: 'customer' | 'chef' | 'admin' | null }
  | { type: 'SET_AUTHENTICATED'; payload: boolean }
  | { type: 'ADD_TO_CART'; payload: { menuItem: MenuItem; quantity: number } }
  | { type: 'REMOVE_FROM_CART'; payload: string }
  | { type: 'CLEAR_CART' }
  | { type: 'PLACE_ORDER' }
  | { type: 'UPDATE_ORDER_STATUS'; payload: { orderId: string; status: Order['status'] } }
  | { type: 'MODIFY_ORDER'; payload: { orderId: string; items: OrderItem[] } }
  | { type: 'COMPLETE_ORDER_PAYMENT'; payload: string }
  | { type: 'ADD_MENU_ITEM'; payload: MenuItem }
  | { type: 'UPDATE_MENU_ITEM'; payload: MenuItem }
  | { type: 'DELETE_MENU_ITEM'; payload: string }
  | { type: 'TOGGLE_STOCK'; payload: string }
  | { type: 'ADD_FEEDBACK'; payload: { orderId: string; rating: number; comment: string } };

// Initial state with demo data
const initialState: AppState = {
  restaurant: {
    name: "Demo Restaurant",
    table: "Table 5"
  },
  
  menuItems: [
    {
      id: '1',
      name: 'Margherita Pizza',
      description: 'Fresh tomatoes, mozzarella cheese, and basil on a crispy crust',
      price: 16.99,
      category: 'Pizza',
      image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400',
      inStock: true
    },
    {
      id: '2',
      name: 'Caesar Salad',
      description: 'Crisp romaine lettuce with parmesan cheese and croutons',
      price: 12.99,
      category: 'Salads',
      image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400',
      inStock: true
    },
    {
      id: '3',
      name: 'Grilled Salmon',
      description: 'Fresh Atlantic salmon with seasonal vegetables',
      price: 24.99,
      category: 'Main Course',
      image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400',
      inStock: true
    },
    {
      id: '4',
      name: 'Chocolate Lava Cake',
      description: 'Warm chocolate cake with molten center and vanilla ice cream',
      price: 8.99,
      category: 'Desserts',
      image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400',
      inStock: false
    },
    {
      id: '5',
      name: 'Pasta Carbonara',
      description: 'Creamy pasta with bacon, eggs, and parmesan cheese',
      price: 18.99,
      category: 'Pasta',
      image: 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400',
      inStock: true
    }
  ],
  
  orders: [],
  currentOrder: [],
  userType: null,
  isAuthenticated: false,
  
  analytics: {
    dailySales: 145.50,
    weeklySales: 1205.75,
    monthlySales: 4890.25
  },
  
  topDishes: [
    'Margherita Pizza',
    'Grilled Salmon',
    'Pasta Carbonara',
    'Caesar Salad',
    'Chocolate Lava Cake'
  ],
  
  youtubeVideos: [
    'dQw4w9WgXcQ', // Demo video IDs
    'kJQP7kiw5Fk'
  ]
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
        item => item.menuItem.id === action.payload.menuItem.id
      );
      
      if (existingItemIndex >= 0) {
        const updatedOrder = [...state.currentOrder];
        updatedOrder[existingItemIndex].quantity += action.payload.quantity;
        return { ...state, currentOrder: updatedOrder };
      } else {
        return {
          ...state,
          currentOrder: [...state.currentOrder, action.payload]
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
      
    case 'COMPLETE_ORDER_PAYMENT':
      const updatedOrders = state.orders.map(order =>
        order.id === action.payload && order.status === 'ready'
          ? { ...order, status: 'completed' as const }
          : order
      );
      
      // Update daily sales when order is completed
      const completedOrder = state.orders.find(order => order.id === action.payload);
      const newDailySales = completedOrder 
        ? state.analytics.dailySales + completedOrder.total
        : state.analytics.dailySales;
      
      return {
        ...state,
        orders: updatedOrders,
        analytics: {
          ...state.analytics,
          dailySales: newDailySales
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
} | null>(null);

// Provider
export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  
  return (
    <AppContext.Provider value={{ state, dispatch }}>
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
