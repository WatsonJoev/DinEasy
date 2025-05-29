
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
  foodType: 'veg' | 'non-veg' | 'vegan' | 'jain';
  recommended: boolean;
  spiceLevel: 'mild' | 'medium' | 'spicy' | 'very-spicy';
  preparationTime: number; // in minutes
  availableFrom?: string; // time format "HH:MM"
  availableTo?: string; // time format "HH:MM"
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
  orderType: 'dine-in' | 'takeaway' | 'mixed';
  customerFeedback?: {
    rating: number;
    comment: string;
  };
}

export interface RestaurantSettings {
  currency: string;
  currencySymbol: string;
  taxRate: number; // percentage
  serviceChargeRate: number; // percentage
}

export interface AppState {
  // Demo data
  restaurant: {
    name: string;
    table: string;
  };
  
  // Settings
  settings: RestaurantSettings;
  
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
    dailyOrders: number;
    weeklyOrders: number;
    monthlyOrders: number;
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
  | { type: 'ADD_TO_ORDER'; payload: { orderId: string; items: OrderItem[] } }
  | { type: 'COMPLETE_ORDER_PAYMENT'; payload: string }
  | { type: 'ADD_MENU_ITEM'; payload: MenuItem }
  | { type: 'UPDATE_MENU_ITEM'; payload: MenuItem }
  | { type: 'DELETE_MENU_ITEM'; payload: string }
  | { type: 'TOGGLE_STOCK'; payload: string }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<RestaurantSettings> }
  | { type: 'ADD_FEEDBACK'; payload: { orderId: string; rating: number; comment: string } };

// Initial state with Indian menu demo data
const initialState: AppState = {
  restaurant: {
    name: "Spice Garden",
    table: "Table 5"
  },
  
  settings: {
    currency: 'INR',
    currencySymbol: '₹',
    taxRate: 18, // GST
    serviceChargeRate: 10
  },
  
  menuItems: [
    {
      id: '1',
      name: 'Butter Chicken',
      description: 'Tender chicken pieces in rich tomato and butter gravy with aromatic spices',
      price: 320,
      category: 'Main Course',
      image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400',
      inStock: true,
      foodType: 'non-veg',
      recommended: true,
      spiceLevel: 'medium',
      preparationTime: 25,
      availableFrom: '11:00',
      availableTo: '23:00'
    },
    {
      id: '2',
      name: 'Masala Dosa',
      description: 'Crispy South Indian crepe filled with spiced potato curry, served with sambar and chutney',
      price: 180,
      category: 'South Indian',
      image: 'https://images.unsplash.com/photo-1567337712694-1d9212a9b9e5?w=400',
      inStock: true,
      foodType: 'veg',
      recommended: true,
      spiceLevel: 'mild',
      preparationTime: 15,
      availableFrom: '06:00',
      availableTo: '22:00'
    },
    {
      id: '3',
      name: 'Paneer Tikka Masala',
      description: 'Grilled cottage cheese cubes in creamy tomato-based curry with bell peppers',
      price: 280,
      category: 'Main Course',
      image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400',
      inStock: true,
      foodType: 'veg',
      recommended: false,
      spiceLevel: 'medium',
      preparationTime: 20,
      availableFrom: '11:00',
      availableTo: '23:00'
    },
    {
      id: '4',
      name: 'Biryani (Chicken)',
      description: 'Fragrant basmati rice layered with marinated chicken and aromatic spices',
      price: 350,
      category: 'Rice & Biryani',
      image: 'https://images.unsplash.com/photo-1563379091339-03246963d7d3?w=400',
      inStock: true,
      foodType: 'non-veg',
      recommended: true,
      spiceLevel: 'spicy',
      preparationTime: 45,
      availableFrom: '12:00',
      availableTo: '22:00'
    },
    {
      id: '5',
      name: 'Idli Sambar',
      description: 'Steamed rice cakes served with lentil curry and coconut chutney',
      price: 120,
      category: 'South Indian',
      image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400',
      inStock: true,
      foodType: 'veg',
      recommended: false,
      spiceLevel: 'mild',
      preparationTime: 10,
      availableFrom: '06:00',
      availableTo: '11:00'
    },
    {
      id: '6',
      name: 'Fish Curry (Kerala Style)',
      description: 'Fresh fish cooked in coconut milk with curry leaves and spices',
      price: 380,
      category: 'South Indian',
      image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400',
      inStock: true,
      foodType: 'non-veg',
      recommended: true,
      spiceLevel: 'spicy',
      preparationTime: 30,
      availableFrom: '12:00',
      availableTo: '21:00'
    },
    {
      id: '7',
      name: 'Chole Bhature',
      description: 'Spicy chickpea curry served with deep-fried bread',
      price: 200,
      category: 'North Indian',
      image: 'https://images.unsplash.com/photo-1606491956689-2ea866880dc8?w=400',
      inStock: true,
      foodType: 'veg',
      recommended: false,
      spiceLevel: 'medium',
      preparationTime: 20,
      availableFrom: '08:00',
      availableTo: '22:00'
    },
    {
      id: '8',
      name: 'Gulab Jamun',
      description: 'Soft milk dumplings soaked in sugar syrup with cardamom and rose water',
      price: 80,
      category: 'Desserts',
      image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400',
      inStock: true,
      foodType: 'veg',
      recommended: false,
      spiceLevel: 'mild',
      preparationTime: 5,
      availableFrom: '11:00',
      availableTo: '23:00'
    }
  ],
  
  orders: [],
  currentOrder: [],
  userType: null,
  isAuthenticated: false,
  
  analytics: {
    dailySales: 2845.50,
    weeklySales: 18205.75,
    monthlySales: 78490.25,
    dailyOrders: 24,
    weeklyOrders: 156,
    monthlyOrders: 654,
    avgOrderValue: 285.50,
    popularItems: [
      { name: 'Butter Chicken', count: 45 },
      { name: 'Masala Dosa', count: 38 },
      { name: 'Biryani (Chicken)', count: 32 },
      { name: 'Fish Curry (Kerala Style)', count: 28 },
      { name: 'Paneer Tikka Masala', count: 25 }
    ]
  },
  
  topDishes: [
    'Butter Chicken',
    'Masala Dosa',
    'Biryani (Chicken)',
    'Fish Curry (Kerala Style)',
    'Paneer Tikka Masala'
  ],
  
  youtubeVideos: [
    'dQw4w9WgXcQ',
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
        item => item.menuItem.id === action.payload.menuItem.id && 
                item.orderType === action.payload.orderType
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
      
      const orderTypes = [...new Set(state.currentOrder.map(item => item.orderType))];
      const orderType = orderTypes.length > 1 ? 'mixed' : orderTypes[0] as 'dine-in' | 'takeaway' | 'mixed';
      
      const subtotal = state.currentOrder.reduce((sum, item) => sum + (item.menuItem.price * item.quantity), 0);
      const tax = subtotal * (state.settings.taxRate / 100);
      const serviceCharge = subtotal * (state.settings.serviceChargeRate / 100);
      const total = subtotal + tax + serviceCharge;
      
      const newOrder: Order = {
        id: Date.now().toString(),
        tableNumber: state.restaurant.table,
        items: [...state.currentOrder],
        status: 'new',
        total: total,
        timestamp: new Date(),
        orderType: orderType
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

    case 'ADD_TO_ORDER':
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
      
      return {
        ...state,
        orders: updatedOrders,
        analytics: {
          ...state.analytics,
          dailySales: newDailySales,
          dailyOrders: state.analytics.dailyOrders + 1
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

    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: { ...state.settings, ...action.payload }
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
