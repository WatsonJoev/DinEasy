
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useApp } from '@/contexts/AppContext';
import { MenuManagement } from './MenuManagement';
import { Analytics } from './Analytics';
import { FeedbackView } from './FeedbackView';
import { ContentManagement } from './ContentManagement';
import { OrderMonitoring } from './OrderMonitoring';
import { toast } from '@/hooks/use-toast';
import { 
  BarChart3, 
  Users, 
  Settings, 
  MessageSquare, 
  FileText, 
  ClipboardList 
} from 'lucide-react';

export function AdminDashboard() {
  const { state, dispatch } = useApp();
  const [activeView, setActiveView] = useState('orders');
  const [restaurantSettings, setRestaurantSettings] = useState(state.restaurant);

  const handleSettingsUpdate = () => {
    dispatch({ type: 'UPDATE_RESTAURANT_SETTINGS', payload: restaurantSettings });
    toast({
      title: "Settings updated",
      description: "Restaurant settings have been saved successfully"
    });
  };

  const adminViews = [
    { id: 'orders', label: 'Orders', icon: ClipboardList, component: <OrderMonitoring /> },
    { id: 'menu', label: 'Menu', icon: FileText, component: <MenuManagement /> },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, component: <Analytics /> },
    { id: 'feedback', label: 'Feedback', icon: MessageSquare, component: <FeedbackView /> },
    { id: 'content', label: 'Content', icon: Users, component: <ContentManagement /> },
    { id: 'settings', label: 'Settings', icon: Settings, component: (
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-charcoal">Restaurant Settings</h3>
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="restaurant-name">Restaurant Name</Label>
              <Input
                id="restaurant-name"
                value={restaurantSettings.name}
                onChange={(e) => setRestaurantSettings({...restaurantSettings, name: e.target.value})}
                placeholder="Enter restaurant name"
              />
            </div>
            <div>
              <Label htmlFor="currency">Currency Symbol</Label>
              <Input
                id="currency"
                value={restaurantSettings.currency}
                onChange={(e) => setRestaurantSettings({...restaurantSettings, currency: e.target.value})}
                placeholder="e.g., $, €, ₹"
              />
            </div>
            <div>
              <Label htmlFor="tax-rate">Tax Rate (%)</Label>
              <Input
                id="tax-rate"
                type="number"
                step="0.01"
                value={restaurantSettings.taxRate}
                onChange={(e) => setRestaurantSettings({...restaurantSettings, taxRate: parseFloat(e.target.value) || 0})}
                placeholder="e.g., 18"
              />
            </div>
            <Button onClick={handleSettingsUpdate} className="bg-charcoal hover:bg-charcoal/90">
              Save Settings
            </Button>
          </CardContent>
        </Card>
      </div>
    ) }
  ];

  return (
    <div className="space-y-6 pb-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-charcoal to-charcoal/80 text-white">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-sm">Menu Items</CardTitle>
          </CardHeader>
          <CardContent className="text-center pt-0">
            <div className="text-2xl font-bold">{state.menuItems.length}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-pumpkin to-pumpkin/80 text-white">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-sm">Active Orders</CardTitle>
          </CardHeader>
          <CardContent className="text-center pt-0">
            <div className="text-2xl font-bold">
              {state.orders.filter(o => o.status !== 'completed').length}
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-sunglow to-sunglow/80 text-charcoal">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-sm">Daily Sales</CardTitle>
          </CardHeader>
          <CardContent className="text-center pt-0">
            <div className="text-2xl font-bold">
              {state.restaurant.currency}{state.analytics.dailySales.toFixed(0)}
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-olivine to-olivine/80 text-white">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-sm">Completed Today</CardTitle>
          </CardHeader>
          <CardContent className="text-center pt-0">
            <div className="text-2xl font-bold">{state.analytics.completedToday}</div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {adminViews.map(view => {
          const Icon = view.icon;
          return (
            <Card 
              key={view.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                activeView === view.id 
                  ? 'border-charcoal bg-charcoal/5' 
                  : 'border-gray-200 hover:border-charcoal/30'
              }`}
              onClick={() => setActiveView(view.id)}
            >
              <CardContent className="flex flex-col items-center justify-center p-6">
                <Icon className={`w-8 h-8 mb-2 ${
                  activeView === view.id ? 'text-charcoal' : 'text-gray-600'
                }`} />
                <span className={`font-medium ${
                  activeView === view.id ? 'text-charcoal' : 'text-gray-700'
                }`}>
                  {view.label}
                </span>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Active View Content */}
      <div className="mt-6">
        {adminViews.find(view => view.id === activeView)?.component}
      </div>
    </div>
  );
}
