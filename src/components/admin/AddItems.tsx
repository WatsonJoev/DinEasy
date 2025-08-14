import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

interface FormFieldsProps {
  formData: any;
  setFormData: (data: any) => void;
  currency: string;
}

const AddItems: React.FC<FormFieldsProps> = ({
  formData,
  setFormData,
  currency,
}) => {
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

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
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          placeholder="Enter item description"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="price">Price ({currency})</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            value={formData.price}
            onChange={(e) =>
              setFormData({ ...formData, price: e.target.value })
            }
            placeholder="0.00"
          />
        </div>

        <div>
          <Label htmlFor="category">Category</Label>
          <Input
            id="category"
            value={formData.category}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
            placeholder="e.g., Main Course, Desserts"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="foodType">Food Type</Label>
          <Select
            value={formData.foodType}
            onValueChange={(value: "veg" | "non-veg") =>
              setFormData({ ...formData, foodType: value })
            }
          >
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
          <Select
            value={formData.spiceLevel}
            onValueChange={(value: "mild" | "medium" | "hot") =>
              setFormData({ ...formData, spiceLevel: value })
            }
          >
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
          onChange={(e) =>
            setFormData({ ...formData, preparationTime: e.target.value })
          }
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
            onChange={(e) =>
              setFormData({ ...formData, availableFrom: e.target.value })
            }
          />
        </div>

        <div>
          <Label htmlFor="availableTo">Available To</Label>
          <Input
            id="availableTo"
            type="time"
            value={formData.availableTo}
            onChange={(e) =>
              setFormData({ ...formData, availableTo: e.target.value })
            }
          />
        </div>
      </div>

      <div>
        <Label htmlFor="image">Image Upload</Label>
        <Input
          id="image"
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
        />
        <p className="text-sm text-gray-500 mt-1">
          Upload an image for the item.
        </p>
        <Label htmlFor="image">Image URL</Label>
        <Input
          id="image"
          value={formData.image}
          onChange={(e) => setFormData({ ...formData, image: e.target.value })}
          placeholder="https://example.com/image.jpg"
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Switch
            id="inStock"
            checked={formData.inStock}
            onCheckedChange={(checked) =>
              setFormData({ ...formData, inStock: checked })
            }
          />
          <Label htmlFor="inStock">In Stock</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="recommended"
            checked={formData.recommended}
            onCheckedChange={(checked) =>
              setFormData({ ...formData, recommended: checked })
            }
          />
          <Label htmlFor="recommended">Recommended</Label>
        </div>
      </div>
    </div>
  );
};

export default AddItems;
