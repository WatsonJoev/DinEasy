
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2 } from 'lucide-react';
import AddItems from './AddItems';
import { supabase } from '@/lib/supabaseClient';

type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  inStock: boolean;
  foodType: 'veg' | 'non-veg' | 'others';
  recommended: boolean;
  spiceLevel: 'mild' | 'medium' | 'hot';
  preparationTime: number;
  availableFrom?: string;
  availableTo?: string;
};

export function MenuManagement() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const currency = '₹';
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

  const mapDbToMenuItem = (item: any) => ({
    id: item.id?.toString?.() ?? String(item.id),
    name: item.name,
    description: item.description,
    price: Number(item.price ?? 0),
    category: item.category,
    image: item.image,
    inStock: item.in_stock === true || item.in_stock === 'true',
    foodType: (item.food_type === 'non-veg' ? 'non-veg' : 'veg') as 'veg' | 'non-veg' | 'others',
    recommended: Boolean(item.recommended),
    spiceLevel: (item.spice_level ?? 'medium') as 'mild' | 'medium' | 'hot',
    preparationTime: Number(item.preparation_time ?? 15),
    availableFrom: item.available_from ?? undefined,
    availableTo: item.available_to ?? undefined,
  });

  const mapFormToDbPayload = (form: typeof formData) => ({
    name: form.name,
    description: form.description,
    price: Number(form.price),
    category: form.category || 'Main Course',
    image: form.image || 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400',
    in_stock: !!form.inStock,
    food_type: form.foodType,
    recommended: !!form.recommended,
    spice_level: form.spiceLevel,
    preparation_time: Number(form.preparationTime),
    available_from: form.availableFrom,
    available_to: form.availableTo,
  });

  const fetchMenu = async () => {
    const { data, error } = await supabase.from('menu_items').select('*');
    if (error) {
      console.error('Failed to fetch menu items for admin view:', error.message);
      return;
    }
    const mapped = (data ?? []).map(mapDbToMenuItem);
    setMenuItems(mapped as any);
  };

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

  const handleAdd = async () => {
    if (!formData.name || !formData.price) {
      toast({
        title: "Missing fields",
        description: "Please fill in name and price",
        variant: "destructive"
      });
      return;
    }
    const payload = mapFormToDbPayload(formData);
    const { data, error } = await supabase
      .from('menu_items')
      .insert(payload)
      .select('*')
      .single();
    if (error) {
      toast({ title: 'Failed to add item', description: error.message, variant: 'destructive' });
      return;
    }
    await fetchMenu();
    toast({ title: 'Menu item added', description: `${data?.name} has been added to the menu` });
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

  const handleUpdate = async () => {
    if (!formData.name || !formData.price) {
      toast({
        title: "Missing fields",
        description: "Please fill in name and price",
        variant: "destructive"
      });
      return;
    }
    const payload = mapFormToDbPayload(formData);
    const { error } = await supabase
      .from('menu_items')
      .update(payload)
      .eq('id', editingItem.id)
      .select('*')
      .single();
    if (error) {
      toast({ title: 'Failed to update item', description: error.message, variant: 'destructive' });
      return;
    }
    await fetchMenu();
    toast({ title: 'Menu item updated', description: `${formData.name} has been updated` });
    resetForm();
    setIsEditDialogOpen(false);
    setEditingItem(null);
  };

  const handleDelete = async (itemId: string, itemName: string) => {
    const { error } = await supabase
      .from('menu_items')
      .delete()
      .eq('id', itemId);
    if (error) {
      toast({ title: 'Failed to delete item', description: error.message, variant: 'destructive' });
      return;
    }
    await fetchMenu();
    toast({ title: 'Menu item deleted', description: `${itemName} has been removed from the menu` });
  };

  const handleToggleStock = async (item: any) => {
    const newInStock = !item.inStock;
    // Optimistic update
    setMenuItems(prev => prev.map(mi => mi.id === item.id ? { ...mi, inStock: newInStock } : mi));
    const { error } = await supabase
      .from('menu_items')
      .update({ in_stock: newInStock })
      .eq('id', item.id);
    if (error) {
      // Revert if failed
      setMenuItems(prev => prev.map(mi => mi.id === item.id ? { ...mi, inStock: item.inStock } : mi));
      toast({ title: 'Failed to update stock', description: error.message, variant: 'destructive' });
      return;
    }
    await fetchMenu();
  };

  useEffect(() => {
    fetchMenu();
  }, []);

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
            <AddItems formData={formData} setFormData={setFormData} currency={currency}/>
            <div className="flex gap-2 mt-4">
              <Button onClick={handleAdd} className="flex-1">Add Item</Button>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menuItems.map(item => (
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
                <span className="text-lg font-bold">{currency}{item.price.toFixed(2)}</span>
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
                  onCheckedChange={() => handleToggleStock(item)}
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
          <AddItems formData={formData} setFormData={setFormData} currency={currency} />
          <div className="flex gap-2 mt-4">
            <Button onClick={handleUpdate} className="flex-1">Update Item</Button>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}