
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useApp } from '@/contexts/AppContext';
import { toast } from '@/hooks/use-toast';
import { Plus, Edit, AlertTriangle, Package } from 'lucide-react';

export function InventoryManagement() {
  const { state, dispatch } = useApp();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<string>('');
  const [formData, setFormData] = useState({
    itemName: '',
    currentStock: '',
    minStock: '',
    unit: '',
    cost: ''
  });

  const inventory = state.inventory || {};

  const handleAddItem = () => {
    if (!formData.itemName || !formData.currentStock) {
      toast({
        title: "Missing fields",
        description: "Please fill in item name and current stock",
        variant: "destructive"
      });
      return;
    }

    dispatch({
      type: 'UPDATE_INVENTORY',
      payload: {
        [formData.itemName]: {
          currentStock: parseInt(formData.currentStock),
          minStock: parseInt(formData.minStock) || 10,
          unit: formData.unit || 'units',
          cost: parseFloat(formData.cost) || 0
        }
      }
    });

    toast({
      title: "Inventory item added",
      description: `${formData.itemName} has been added to inventory`
    });

    setFormData({ itemName: '', currentStock: '', minStock: '', unit: '', cost: '' });
    setIsAddDialogOpen(false);
  };

  const handleUpdateStock = (itemName: string, newStock: number) => {
    dispatch({
      type: 'UPDATE_INVENTORY',
      payload: {
        [itemName]: {
          ...inventory[itemName],
          currentStock: newStock
        }
      }
    });

    toast({
      title: "Stock updated",
      description: `${itemName} stock updated to ${newStock}`
    });
  };

  const getStockStatus = (item: any) => {
    if (item.currentStock <= item.minStock) return 'critical';
    if (item.currentStock <= item.minStock * 2) return 'low';
    return 'good';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'destructive';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Inventory Management</h3>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-pumpkin hover:bg-pumpkin/90 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Inventory Item</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="itemName">Item Name</Label>
                <Input
                  id="itemName"
                  value={formData.itemName}
                  onChange={(e) => setFormData({...formData, itemName: e.target.value})}
                  placeholder="Enter item name"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="currentStock">Current Stock</Label>
                  <Input
                    id="currentStock"
                    type="number"
                    value={formData.currentStock}
                    onChange={(e) => setFormData({...formData, currentStock: e.target.value})}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label htmlFor="minStock">Minimum Stock</Label>
                  <Input
                    id="minStock"
                    type="number"
                    value={formData.minStock}
                    onChange={(e) => setFormData({...formData, minStock: e.target.value})}
                    placeholder="10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="unit">Unit</Label>
                  <Input
                    id="unit"
                    value={formData.unit}
                    onChange={(e) => setFormData({...formData, unit: e.target.value})}
                    placeholder="kg, pieces, etc."
                  />
                </div>
                <div>
                  <Label htmlFor="cost">Cost per unit</Label>
                  <Input
                    id="cost"
                    type="number"
                    step="0.01"
                    value={formData.cost}
                    onChange={(e) => setFormData({...formData, cost: e.target.value})}
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={handleAddItem} className="flex-1">Add Item</Button>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(inventory).map(([itemName, item]: [string, any]) => {
          const status = getStockStatus(item);
          return (
            <Card key={itemName} className="relative">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    {itemName}
                  </CardTitle>
                  <Badge variant={getStatusColor(status)}>
                    {status === 'critical' && <AlertTriangle className="w-3 h-3 mr-1" />}
                    {status.toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Current Stock:</span>
                    <span className="font-semibold">{item.currentStock} {item.unit}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Minimum Stock:</span>
                    <span className="text-sm">{item.minStock} {item.unit}</span>
                  </div>
                  
                  {item.cost > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Cost per unit:</span>
                      <span className="text-sm">{state.restaurant.currency}{item.cost.toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUpdateStock(itemName, item.currentStock - 1)}
                      disabled={item.currentStock <= 0}
                      className="flex-1"
                    >
                      -1
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUpdateStock(itemName, item.currentStock + 10)}
                      className="flex-1"
                    >
                      +10
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {Object.keys(inventory).length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No inventory items found.</p>
            <p className="text-sm text-muted-foreground mt-2">
              Add your first inventory item to get started!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
