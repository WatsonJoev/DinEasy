
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useApp } from '@/contexts/AppContext';
import { toast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2 } from 'lucide-react';

export function MenuManagement() {
  const { state, dispatch } = useApp();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image: '',
    inStock: true,
    foodType: 'veg' as 'veg' | 'non-veg',
    recommended: false,
    spiceLevel: 'medium' as 'mild' | 'medium' | 'hot',
    preparationTime: '15',
    availableFrom: '06:00',
    availableTo: '22:00'
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      image: '',
      inStock: true,
      foodType: 'veg',
      recommended: false,
      spiceLevel: 'medium',
      preparationTime: '15',
      availableFrom: '06:00',
      availableTo: '22:00'
    });
  };

  const handleAdd = () => {
    if (!formData.name || !formData.price) {
      toast({
        title: "Missing fields",
        description: "Please fill in name and price",
        variant: "destructive"
      });
      return;
    }

    const newItem = {
      id: Date.now().toString(),
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      category: formData.category || 'Main Course',
      image: formData.image || 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400',
      inStock: formData.inStock,
      foodType: formData.foodType,
      recommended: formData.recommended,
      spiceLevel: formData.spiceLevel,
      preparationTime: parseInt(formData.preparationTime),
      availableFrom: formData.availableFrom,
      availableTo: formData.availableTo
    };

    dispatch({ type: 'ADD_MENU_ITEM', payload: newItem });
    toast({
      title: "Menu item added",
      description: `${formData.name} has been added to the menu`
    });
    
    resetForm();
    setIsAddDialogOpen(false);
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      category: item.category,
      image: item.image,
      inStock: item.inStock,
      foodType: item.foodType || 'veg',
      recommended: item.recommended || false,
      spiceLevel: item.spiceLevel || 'medium',
      preparationTime: item.preparationTime?.toString() || '15',
      availableFrom: item.availableFrom || '06:00',
      availableTo: item.availableTo || '22:00'
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = () => {
    if (!formData.name || !formData.price) {
      toast({
        title: "Missing fields",
        description: "Please fill in name and price",
        variant: "destructive"
      });
      return;
    }

    const updatedItem = {
      ...editingItem,
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      category: formData.category,
      image: formData.image,
      inStock: formData.inStock,
      foodType: formData.foodType,
      recommended: formData.recommended,
      spiceLevel: formData.spiceLevel,
      preparationTime: parseInt(formData.preparationTime),
      availableFrom: formData.availableFrom,
      availableTo: formData.availableTo
    };

    dispatch({ type: 'UPDATE_MENU_ITEM', payload: updatedItem });
    toast({
      title: "Menu item updated",
      description: `${formData.name} has been updated`
    });
    
    resetForm();
    setIsEditDialogOpen(false);
    setEditingItem(null);
  };

  const handleDelete = (itemId: string, itemName: string) => {
    dispatch({ type: 'DELETE_MENU_ITEM', payload: itemId });
    toast({
      title: "Menu item deleted",
      description: `${itemName} has been removed from the menu`
    });
  };

  const handleToggleStock = (itemId: string) => {
    dispatch({ type: 'TOGGLE_STOCK', payload: itemId });
  };

  const FormFields = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="name">Item Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          placeholder="Enter item name"
        />
      </div>
      
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          placeholder="Enter item description"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="price">Price ({state.restaurant.currency})</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            value={formData.price}
            onChange={(e) => setFormData({...formData, price: e.target.value})}
            placeholder="0.00"
          />
        </div>
        
        <div>
          <Label htmlFor="category">Category</Label>
          <Input
            id="category"
            value={formData.category}
            onChange={(e) => setFormData({...formData, category: e.target.value})}
            placeholder="e.g., Main Course, Desserts"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="foodType">Food Type</Label>
          <Select value={formData.foodType} onValueChange={(value: 'veg' | 'non-veg') => setFormData({...formData, foodType: value})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="veg">Vegetarian</SelectItem>
              <SelectItem value="non-veg">Non-Vegetarian</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="spiceLevel">Spice Level</Label>
          <Select value={formData.spiceLevel} onValueChange={(value: 'mild' | 'medium' | 'hot') => setFormData({...formData, spiceLevel: value})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mild">Mild</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="hot">Hot</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="preparationTime">Preparation Time (minutes)</Label>
        <Input
          id="preparationTime"
          type="number"
          value={formData.preparationTime}
          onChange={(e) => setFormData({...formData, preparationTime: e.target.value})}
          placeholder="15"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="availableFrom">Available From</Label>
          <Input
            id="availableFrom"
            type="time"
            value={formData.availableFrom}
            onChange={(e) => setFormData({...formData, availableFrom: e.target.value})}
          />
        </div>

        <div>
          <Label htmlFor="availableTo">Available To</Label>
          <Input
            id="availableTo"
            type="time"
            value={formData.availableTo}
            onChange={(e) => setFormData({...formData, availableTo: e.target.value})}
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="image">Image URL</Label>
        <Input
          id="image"
          value={formData.image}
          onChange={(e) => setFormData({...formData, image: e.target.value})}
          placeholder="https://example.com/image.jpg"
        />
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Switch
            id="inStock"
            checked={formData.inStock}
            onCheckedChange={(checked) => setFormData({...formData, inStock: checked})}
          />
          <Label htmlFor="inStock">In Stock</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="recommended"
            checked={formData.recommended}
            onCheckedChange={(checked) => setFormData({...formData, recommended: checked})}
          />
          <Label htmlFor="recommended">Recommended</Label>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Menu Management</h3>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-pumpkin hover:bg-pumpkin/90 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Menu Item</DialogTitle>
            </DialogHeader>
            <FormFields />
            <div className="flex gap-2 mt-4">
              <Button onClick={handleAdd} className="flex-1">Add Item</Button>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {state.menuItems.map(item => (
          <Card key={item.id} className="relative">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{item.name}</CardTitle>
                <div className="flex gap-2">
                  <Badge variant={item.inStock ? "default" : "destructive"}>
                    {item.inStock ? "In Stock" : "Out of Stock"}
                  </Badge>
                  {item.recommended && (
                    <Badge variant="outline" className="bg-sunglow text-charcoal">
                      ⭐ Recommended
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-32 object-cover rounded mb-3"
              />
              
              <div className="flex items-center gap-2 mb-2">
                <Badge 
                  variant="outline" 
                  className={`${item.foodType === 'veg' ? 'bg-olivine text-white' : 'bg-pumpkin text-white'}`}
                >
                  {item.foodType === 'veg' ? '🌱 Veg' : '🍗 Non-Veg'}
                </Badge>
                {item.spiceLevel && (
                  <Badge variant="outline">
                    {item.spiceLevel === 'mild' ? '🟢' : item.spiceLevel === 'medium' ? '🟡' : '🔴'} {item.spiceLevel}
                  </Badge>
                )}
              </div>
              
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {item.description}
              </p>
              
              <div className="flex justify-between items-center mb-2">
                <span className="text-lg font-bold">{state.restaurant.currency}{item.price.toFixed(2)}</span>
                <Badge variant="outline">{item.category}</Badge>
              </div>

              <div className="text-xs text-muted-foreground mb-4">
                <div>Prep time: {item.preparationTime} mins</div>
                {item.availableFrom && item.availableTo && (
                  <div>Available: {item.availableFrom} - {item.availableTo}</div>
                )}
              </div>
              
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm">In Stock:</span>
                <Switch
                  checked={item.inStock}
                  onCheckedChange={() => handleToggleStock(item.id)}
                />
              </div>
              
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(item)}
                  className="flex-1"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(item.id, item.name)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Menu Item</DialogTitle>
          </DialogHeader>
          <FormFields />
          <div className="flex gap-2 mt-4">
            <Button onClick={handleUpdate} className="flex-1">Update Item</Button>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
