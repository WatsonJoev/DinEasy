
import React, { createContext, useContext, useReducer, ReactNode } from 'react';

// Define the MenuItem interface
interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  inStock: boolean;
  foodType: 'veg' | 'non-veg';
  recommended: boolean;
	spiceLevel: 'mild' | 'medium' | 'hot';
  preparationTime: number;
  availableFrom?: string;
  availableTo?: string;
}

// Define the OrderItem interface
interface OrderItem {
  id: string;
  menuItem: MenuItem;
  quantity: number;
  orderType: 'dine-in' | 'takeaway';
  spiceLevel: 'mild' | 'medium' | 'hot';
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
  status: 'new' | 'preparing' | 'ready' | 'completed';
  customerFeedback?: {
    rating: number;
    comment: string;
  };
  paymentDetails?: {
    method: 'cash' | 'upi' | null;
    subtotal: number;
    tax: number;
    tip: number;
    total: number;
    serviceRating: number;
  };
}

// Extended interfaces for new features
interface CustomerLoyalty {
  points: number;
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
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
  userType: 'customer' | 'chef' | 'admin' | null;
  isAuthenticated: boolean;
  restaurant: {
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
}

// Define action types
type Action = 
  | { type: 'SET_USER_TYPE'; payload: 'customer' | 'chef' | 'admin' | null }
  | { type: 'SET_AUTHENTICATED'; payload: boolean }
  | { type: 'UPDATE_RESTAURANT_SETTINGS'; payload: Partial<AppState['restaurant']> }
  | { type: 'ADD_TO_CART'; payload: OrderItem }
  | { type: 'REMOVE_FROM_CART'; payload: string }
  | { type: 'UPDATE_CART_ITEM'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'PLACE_ORDER'; payload: Order }
  | { type: 'UPDATE_ORDER_STATUS'; payload: { orderId: string; status: string } }
  | { type: 'ADD_MENU_ITEM'; payload: MenuItem }
  | { type: 'UPDATE_MENU_ITEM'; payload: MenuItem }
  | { type: 'DELETE_MENU_ITEM'; payload: string }
  | { type: 'TOGGLE_STOCK'; payload: string }
  | { type: 'UPDATE_INVENTORY'; payload: Record<string, any> }
  | { type: 'REDEEM_LOYALTY_REWARD'; payload: { rewardId: number; pointsUsed: number } }
  | { type: 'ADD_LOYALTY_POINTS'; payload: number }
  | { type: 'COMPLETE_ORDER_PAYMENT'; payload: any }
  | { type: 'ADD_TO_EXISTING_ORDER'; payload: any }
  | { type: 'ADD_FEEDBACK'; payload: any }
  | { type: 'MODIFY_ORDER'; payload: any };

// Enhanced initial state
const initialState: AppState = {
  userType: null,
  isAuthenticated: false,
  restaurant: {
    name: "Saravana Bhavan",
    table: "T-001",
    currency: "₹",
    taxRate: 18
  },
  menuItems: [
    {
      id: '1',
      name: 'Masala Dosa',
      description: 'Crispy rice crepe filled with spiced potato curry, served with sambar and chutney',
      price: 120,
      category: 'South Indian',
      image: 'https://images.unsplash.com/photo-1630851846397-bfd13737f5a4?w=400',
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
      name: 'Butter Chicken',
      description: 'Tender chicken in rich, creamy tomato-based curry with aromatic spices',
      price: 280,
      category: 'North Indian',
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
      id: '3',
      name: 'Paneer Tikka',
      description: 'Marinated cottage cheese cubes grilled to perfection with bell peppers and onions',
      price: 240,
      category: 'Appetizers',
      image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400',
      inStock: true,
      foodType: 'veg',
      recommended: false,
      spiceLevel: 'mild',
      preparationTime: 20,
      availableFrom: '12:00',
      availableTo: '23:00'
    },
    {
      id: '4',
      name: 'Biryani',
      description: 'Fragrant basmati rice layered with tender meat/vegetables and aromatic spices',
      price: 320,
      category: 'Rice Dishes',
      image: 'https://images.unsplash.com/photo-1563379091339-03246963d51a?w=400',
      inStock: true,
      foodType: 'non-veg',
      recommended: true,
      spiceLevel: 'hot',
      preparationTime: 35,
      availableFrom: '12:00',
      availableTo: '22:00'
    },
    {
      id: '5',
      name: 'Gulab Jamun',
      description: 'Soft, spongy milk dumplings soaked in rose-flavored sugar syrup',
      price: 80,
      category: 'Desserts',
      image: 'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=400',
      inStock: true,
      foodType: 'veg',
      recommended: false,
      spiceLevel: 'mild',
      preparationTime: 5,
      availableFrom: '06:00',
      availableTo: '23:00'
    }
  ],
  currentOrder: [],
  orders: [],
  inventory: {
    'Rice': { currentStock: 50, minStock: 10, unit: 'kg', cost: 2.5 },
    'Chicken': { currentStock: 25, minStock: 5, unit: 'kg', cost: 8.0 },
    'Paneer': { currentStock: 15, minStock: 3, unit: 'kg', cost: 6.0 },
    'Tomatoes': { currentStock: 30, minStock: 8, unit: 'kg', cost: 1.5 },
    'Onions': { currentStock: 40, minStock: 10, unit: 'kg', cost: 1.0 }
  },
  customerLoyalty: {
    points: 250,
    tier: 'Bronze',
    totalSpent: 1250,
    rewardsRedeemed: 2
  },
  youtubeVideos: ['dQw4w9WgXcQ', 'L_jWHffIx5E', 'ZZ5LpwO-An4'],
  topDishes: ['Masala Dosa', 'Butter Chicken', 'Biryani', 'Paneer Tikka', 'Chole Bhature'],
  analytics: {
    dailySales: 2850,
    weeklySales: 18240,
    monthlySales: 76500,
    completedToday: 12
  }
};

// Enhanced reducer
function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_USER_TYPE':
      return { ...state, userType: action.payload };
    
    case 'SET_AUTHENTICATED':
      return { ...state, isAuthenticated: action.payload };
    
    case 'UPDATE_RESTAURANT_SETTINGS':
      return {
        ...state,
        restaurant: { ...state.restaurant, ...action.payload }
      };
    
    case 'ADD_TO_CART':
      return {
        ...state,
        currentOrder: [...state.currentOrder, action.payload]
      };
    
    case 'REMOVE_FROM_CART':
      return {
        ...state,
        currentOrder: state.currentOrder.filter(item => item.id !== action.payload)
      };
    
    case 'UPDATE_CART_ITEM':
      return {
        ...state,
        currentOrder: state.currentOrder.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        )
      };
    
    case 'CLEAR_CART':
      return { ...state, currentOrder: [] };
    
    case 'PLACE_ORDER':
      const orderTotal = action.payload.total;
      const pointsEarned = Math.floor(orderTotal * (state.customerLoyalty.tier === 'Bronze' ? 1 : state.customerLoyalty.tier === 'Silver' ? 1.2 : state.customerLoyalty.tier === 'Gold' ? 1.5 : 2));
      
      return {
        ...state,
        orders: [...state.orders, action.payload],
        currentOrder: [],
        customerLoyalty: {
          ...state.customerLoyalty,
          points: state.customerLoyalty.points + pointsEarned,
          totalSpent: state.customerLoyalty.totalSpent + orderTotal
        }
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
          item.id === action.payload
            ? { ...item, inStock: !item.inStock }
            : item
        )
      };
    
    case 'UPDATE_INVENTORY':
      return {
        ...state,
        inventory: { ...state.inventory, ...action.payload }
      };
    
    case 'REDEEM_LOYALTY_REWARD':
      return {
        ...state,
        customerLoyalty: {
          ...state.customerLoyalty,
          points: state.customerLoyalty.points - action.payload.pointsUsed,
          rewardsRedeemed: state.customerLoyalty.rewardsRedeemed + 1
        }
      };
    
    case 'ADD_LOYALTY_POINTS':
      let newTier = state.customerLoyalty.tier;
      const newPoints = state.customerLoyalty.points + action.payload;
      
      if (newPoints >= 2000) newTier = 'Platinum';
      else if (newPoints >= 1000) newTier = 'Gold';
      else if (newPoints >= 500) newTier = 'Silver';
      else newTier = 'Bronze';
      
      return {
        ...state,
        customerLoyalty: {
          ...state.customerLoyalty,
          points: newPoints,
          tier: newTier
        }
      };
    
    case 'COMPLETE_ORDER_PAYMENT':
      return {
        ...state,
        orders: state.orders.map(order =>
          order.id === action.payload.orderId || order.id === action.payload
            ? { ...order, status: 'completed', paymentDetails: action.payload.paymentDetails }
            : order
        )
      };

    case 'ADD_TO_EXISTING_ORDER':
    case 'ADD_FEEDBACK':
    case 'MODIFY_ORDER':
      // Placeholder implementations for missing actions
      return state;
    
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
  const [state, dispatch] = useReducer(appReducer, initialState);

  const isMenuItemAvailable = (item: MenuItem) => {
    if (!item.availableFrom || !item.availableTo) return true;
    
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const [fromHour, fromMinute] = item.availableFrom.split(':').map(Number);
    const [toHour, toMinute] = item.availableTo.split(':').map(Number);
    
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
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
