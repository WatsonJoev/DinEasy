  import { useState, useRef, useEffect } from 'react';
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
  import { Plus, Edit, Trash2, Upload, X } from 'lucide-react';
  import { Separator } from '@/components/ui/separator';
  import { supabase } from "@/lib/supabaseClient"; // adjust path as needed
  import { motion, AnimatePresence } from "framer-motion";

  interface FormFieldsProps {
    formData: any;
    setFormData: React.Dispatch<React.SetStateAction<any>>;
    fileInputRef: React.RefObject<HTMLInputElement>;
    state: any;
  }

  const FormFields = ({ formData, setFormData, fileInputRef, state }: FormFieldsProps) => {
    return (
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Item Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter item name"
          />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              placeholder="0.00"
            />
          </div>

          <div>
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              placeholder="e.g., Main Course, Desserts"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="foodType">Food Type</Label>
            <Select value={formData.foodType} onValueChange={(value: 'veg' | 'non-veg') => setFormData({ ...formData, foodType: value })}>
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
            <Select value={formData.spiceLevel} onValueChange={(value: 'mild' | 'medium' | 'hot') => setFormData({ ...formData, spiceLevel: value })}>
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
            onChange={(e) => setFormData({ ...formData, preparationTime: e.target.value })}
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
              onChange={(e) => setFormData({ ...formData, availableFrom: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="availableTo">Available To</Label>
            <Input
              id="availableTo"
              type="time"
              value={formData.availableTo}
              onChange={(e) => setFormData({ ...formData, availableTo: e.target.value })}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="image">Image Source</Label>
          <div className="space-y-2">
            {/* Option 1: Image URL */}
            <div className="flex gap-2 items-center">
              <Input
                id="image"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value, selectedFileName: '' })}
                placeholder="Paste image URL (e.g., https://example.com/image.jpg)"
                className="flex-1"
              />
              {formData.image && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setFormData({ ...formData, image: '' })}
                  className="h-8 w-8"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>

            {/* OR separator */}
            <div className="relative flex justify-center text-xs uppercase">
              <Separator className="absolute inset-0 h-px bg-border my-auto" />
              <span className="relative z-10 bg-background px-2 text-muted-foreground">Or</span>
            </div>

            {/* Option 2: File Upload */}
            <div className="flex gap-2 items-center">
              <Input
                id="imageUploadDisplay"
                value={formData.selectedFileName || 'No file selected'}
                readOnly
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-4 h-4 mr-2" />
                Select File
              </Button>
              <input
                id="imageUpload"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setFormData({
                      ...formData,
                      image: '',
                      selectedFileName: file.name,
                      selectedFile: file,
                    });
                    toast({
                      title: "File Selected",
                      description: `File: ${file.name}.`,
                    });
                  } else {
                    setFormData({
                      ...formData,
                      selectedFileName: '',
                      selectedFile: undefined,
                    });
                  }
                }}
                className="hidden"
                ref={fileInputRef}
              />
              {formData.selectedFileName && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setFormData({ ...formData, selectedFileName: '', image: '', selectedFile: undefined })}
                  className="h-8 w-8"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Switch
              id="inStock"
              checked={formData.inStock}
              onCheckedChange={(checked) => setFormData({ ...formData, inStock: checked })}
            />
            <Label htmlFor="inStock">In Stock</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="recommended"
              checked={formData.recommended}
              onCheckedChange={(checked) => setFormData({ ...formData, recommended: checked })}
            />
            <Label htmlFor="recommended">Recommended</Label>
          </div>
        </div>
      </div>
    );
  };

  async function addMenuItemToSupabase(newItem) {
    const { data, error } = await supabase
      .from("menu_items")
      .insert([newItem])
      .select(); // .select() returns the inserted row(s)
    if (error) throw error;
    return data[0]; // return the inserted item
  }

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
      availableTo: '22:00',
      selectedFileName: '',
      selectedFile: undefined,
    });
    const [menuItems, setMenuItems] = useState<any[]>([]);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // Fetch menu items from Supabase
    const fetchMenuItems = async () => {
      const { data, error } = await supabase.from("menu_items").select("*");
      if (error) {
        toast({ title: "Error", description: "Failed to fetch menu items", variant: "destructive" });
        return;
      }
      // Map snake_case to camelCase
      const mapped = (data || []).map(item => ({
        ...item,
        inStock: item.in_stock,
        foodType: item.food_type,
        recommended: item.recommended,
        spiceLevel: item.spice_level,
        preparationTime: item.preparation_time,
        availableFrom: item.available_from,
        availableTo: item.available_to,
      }));
      setMenuItems(mapped);
    };

    // Fetch on mount
    useEffect(() => { fetchMenuItems(); }, []);

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
        availableTo: '22:00',
        selectedFileName: '',
        selectedFile: undefined,
      });
    };

    const handleAdd = async () => {
      if (!formData.name || !formData.price) {
        toast({ title: "Missing fields", description: "Please fill in name and price", variant: "destructive" });
        return;
      }
      if (!formData.image && !formData.selectedFile && !formData.selectedFileName) {
        toast({ title: "Missing Image", description: "Please provide an Image URL or select a file.", variant: "destructive" });
        return;
      }
      let imageUrl = formData.image;

      // --- File upload logic for both handleAdd and handleUpdate ---
      if (formData.selectedFile) {
        const file = formData.selectedFile;
        if (!file || file.size === 0) {
          toast({ title: "Error", description: "Selected file is empty or invalid.", variant: "destructive" });
          return;
        }
        const fileExt = file.name.split('.').pop();
        // Sanitize file name
        const safeName = file.name.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9.-]/g, '');
        const fileName = `menu-item-${Date.now()}-${safeName}`;
        // Upload with contentType and upsert
        const { error: uploadError } = await supabase.storage
          .from('menu-images')
          .upload(fileName, file, {
            contentType: file.type,
            upsert: true,
          });
        if (uploadError) {
          toast({ title: "Error", description: `Failed to upload image: ${uploadError.message}` , variant: "destructive" });
          return;
        }
        // Get public URL
        const { data: publicUrlData } = supabase
          .storage
          .from('menu-images')
          .getPublicUrl(fileName);
        imageUrl = publicUrlData.publicUrl;
      }

      // Now use imageUrl for the menu item
      if (!imageUrl) {
        toast({ title: "Missing Image", description: "Please provide an Image URL or select a file.", variant: "destructive" });
        return;
      }

      const newItem = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category || 'Main Course',
        image: imageUrl,
        in_stock: formData.inStock,
        food_type: formData.foodType,
        recommended: formData.recommended,
        spice_level: formData.spiceLevel,
        preparation_time: parseInt(formData.preparationTime),
        available_from: formData.availableFrom,
        available_to: formData.availableTo
      };

      const { error } = await supabase.from("menu_items").insert([newItem]);
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
        return;
      }
      toast({ title: "Menu item added", description: `${formData.name} has been added to the menu` });
      resetForm();
      setIsAddDialogOpen(false);
      await fetchMenuItems();
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
        availableTo: item.availableTo || '22:00',
        selectedFileName: '',
        selectedFile: undefined,
      });
      setIsEditDialogOpen(true);
    };

    const handleUpdate = async () => {
      if (!formData.name || !formData.price) {
        toast({ title: "Missing fields", description: "Please fill in name and price", variant: "destructive" });
        return;
      }
      if (!formData.image && !formData.selectedFile && !formData.selectedFileName) {
        toast({ title: "Missing Image", description: "Please provide an Image URL or select a file.", variant: "destructive" });
        return;
      }
      let imageUrl = formData.image;

      // --- File upload logic for both handleAdd and handleUpdate ---
      if (formData.selectedFile) {
        const file = formData.selectedFile;
        if (!file || file.size === 0) {
          toast({ title: "Error", description: "Selected file is empty or invalid.", variant: "destructive" });
          return;
        }
        const fileExt = file.name.split('.').pop();
        // Sanitize file name
        const safeName = file.name.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9.-]/g, '');
        const fileName = `menu-item-${Date.now()}-${safeName}`;
        // Upload with contentType and upsert
        const { error: uploadError } = await supabase.storage
          .from('menu-images')
          .upload(fileName, file, {
            contentType: file.type,
            upsert: true,
          });
        if (uploadError) {
          toast({ title: "Error", description: `Failed to upload image: ${uploadError.message}` , variant: "destructive" });
          return;
        }
        // Get public URL
        const { data: publicUrlData } = supabase
          .storage
          .from('menu-images')
          .getPublicUrl(fileName);
        imageUrl = publicUrlData.publicUrl;
      }

      // Now use imageUrl for the menu item
      if (!imageUrl) {
        toast({ title: "Missing Image", description: "Please provide an Image URL or select a file.", variant: "destructive" });
        return;
      }

      const updatedItem = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        image: imageUrl,
        in_stock: formData.inStock,
        food_type: formData.foodType,
        recommended: formData.recommended,
        spice_level: formData.spiceLevel,
        preparation_time: parseInt(formData.preparationTime),
        available_from: formData.availableFrom,
        available_to: formData.availableTo
      };
      const { error } = await supabase.from("menu_items").update(updatedItem).eq("id", editingItem.id);
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
        return;
      }
      toast({ title: "Menu item updated", description: `${formData.name} has been updated` });
      resetForm();
      setIsEditDialogOpen(false);
      setEditingItem(null);
      await fetchMenuItems();
    };

    const handleDeleteClick = (itemId: string) => {
      setDeletingId(itemId);
      setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
      if (!deletingId) return;
      const item = menuItems.find(i => i.id === deletingId);
      const { error } = await supabase.from("menu_items").delete().eq("id", deletingId);
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Menu item deleted", description: `${item?.name || "Item"} has been removed from the menu` });
        await fetchMenuItems();
      }
      setDeleteDialogOpen(false);
      setDeletingId(null);
    };

    const handleToggleStock = async (item) => {
      const { error } = await supabase
        .from("menu_items")
        .update({ in_stock: !item.inStock })
        .eq("id", item.id);
      if (!error) await fetchMenuItems();
    };

    const fileInputRef = useRef<HTMLInputElement>(null);

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
              <FormFields
                formData={formData}
                setFormData={setFormData}
                fileInputRef={fileInputRef}
                state={state}
              />
              <div className="flex gap-2 mt-4">
                <Button onClick={handleAdd} className="flex-1">Add Item</Button>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {menuItems.map(item => (
              <motion.div
                key={item.id}
                initial={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="relative">
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
                        onClick={() => handleDeleteClick(item.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Menu Item</DialogTitle>
            </DialogHeader>
            <FormFields
              formData={formData}
              setFormData={setFormData}
              fileInputRef={fileInputRef}
              state={state}
            />
            <div className="flex gap-2 mt-4">
              <Button onClick={handleUpdate} className="flex-1">Save Changes</Button>
              <Button variant="outline" onClick={() => {
                setIsEditDialogOpen(false);
                setEditingItem(null);
                resetForm();
              }}>Cancel</Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Menu Item?</DialogTitle>
            </DialogHeader>
            <p>Are you sure you want to delete this item? This action cannot be undone.</p>
            <div className="flex gap-2 mt-4">
              <Button variant="destructive" onClick={confirmDelete}>
                Delete
              </Button>
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                Cancel
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );  
  }
