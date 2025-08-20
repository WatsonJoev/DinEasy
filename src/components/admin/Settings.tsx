import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useApp } from '@/contexts/AppContext';
import { toast } from '@/hooks/use-toast';

export function Settings() {
  const { state, dispatch } = useApp();
  const [restaurantSettings, setRestaurantSettings] = useState(state.restaurant);

  const handleSettingsUpdate = () => {
    dispatch({ type: 'UPDATE_RESTAURANT_SETTINGS', payload: restaurantSettings });
    toast({
      title: "Settings updated",
      description: "Restaurant settings have been saved successfully"
    });
  };

  return (
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
  );
}
