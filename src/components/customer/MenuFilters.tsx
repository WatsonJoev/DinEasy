import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/AppContext';

interface MenuFiltersProps {
  selectedCategory: string;
  selectedFoodType: string;
  showRecommended: boolean;
  categories: string[];
  onCategoryChange: (category: string) => void;
  onFoodTypeChange: (type: string) => void;
  onRecommendedToggle: () => void;
  menuItems: any[];
}

export function MenuFilters({
  selectedCategory,
  selectedFoodType,
  showRecommended,
  categories,
  onCategoryChange,
  onFoodTypeChange,
  onRecommendedToggle,
  menuItems,
}: MenuFiltersProps) {
  const filteredCategories = categories.filter((cat) => cat !== 'All');

  return (
    <div className="flex flex-col h-[400px]">
      <div className="space-y-4 py-2 flex-none">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold px-2 text-zomp">Recommended for you</h2>
          <Button
            variant="ghost"
            className={`w-full flex justify-between items-center px-4 py-3 text-base font-normal ${showRecommended ? 'bg-zomp/10 text-zomp' : 'hover:bg-gray-50'}`}
            onClick={onRecommendedToggle}
          >
            <span>⭐ Recommended</span>
            <span className={`${showRecommended ? 'text-zomp' : 'text-gray-500'}`}>{menuItems.filter(item => item.recommended).length}</span>
          </Button>
        </div>

        <div className="space-y-1">
          <h2 className="text-lg font-semibold px-2">Veg/Non-veg</h2>
          <Button
            variant="ghost"
            className={`w-full flex justify-between items-center px-4 py-3 text-base font-normal ${selectedFoodType === 'veg' ? 'bg-zomp/10 text-zomp' : 'hover:bg-gray-50'}`}
            onClick={() => onFoodTypeChange(selectedFoodType === 'veg' ? 'all' : 'veg')}
          >
            <span>🌱 Veg</span>
            <span className={`${selectedFoodType === 'veg' ? 'text-zomp' : 'text-gray-500'}`}>{menuItems.filter(item => item.foodType === 'veg' || item.food_type === 'veg').length}</span>
          </Button>
          <Button
            variant="ghost"
            className={`w-full flex justify-between items-center px-4 py-3 text-base font-normal ${selectedFoodType === 'non-veg' ? 'bg-zomp/10 text-zomp' : 'hover:bg-gray-50'}`}
            onClick={() => onFoodTypeChange(selectedFoodType === 'non-veg' ? 'all' : 'non-veg')}
          >
            <span>🍗 Non-Veg</span>
            <span className={`${selectedFoodType === 'non-veg' ? 'text-zomp' : 'text-gray-500'}`}>{menuItems.filter(item => item.foodType === 'non-veg' || item.food_type === 'non-veg').length}</span>
          </Button>
          <Button
            variant="ghost"
            className={`w-full flex justify-between items-center px-4 py-3 text-base font-normal ${selectedFoodType === 'others' ? 'bg-zomp/10 text-zomp' : 'hover:bg-gray-50'}`}
            onClick={() => onFoodTypeChange(selectedFoodType === 'others' ? 'all' : 'others')}
          >
            <span>🍦 Others</span>
            <span className={`${selectedFoodType === 'others' ? 'text-zomp' : 'text-gray-500'}`}>{menuItems.filter(item => item.foodType === 'others' || item.food_type === 'others').length}</span>
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold px-2 sticky top-0 bg-white py-2">Categories</h2>
          <Button
            variant="ghost"
            className={`w-full flex justify-between items-center px-4 py-3 text-base font-normal ${selectedCategory === 'All' ? 'bg-zomp/10 text-zomp' : 'hover:bg-gray-50'}`}
            onClick={() => onCategoryChange('All')}
          >
            <span>All</span>
            <span className={`${selectedCategory === 'All' ? 'text-zomp' : 'text-gray-500'}`}>{menuItems.length}</span>
          </Button>
          {filteredCategories.map((category) => (
            <Button
              key={category}
              variant="ghost"
              className={`w-full flex justify-between items-center px-4 py-3 text-base font-normal ${selectedCategory === category ? 'bg-zomp/10 text-zomp' : 'hover:bg-gray-50'}`}
              onClick={() => onCategoryChange(category)}
            >
              <span>{category}</span>
              <span className={`${selectedCategory === category ? 'text-zomp' : 'text-gray-500'}`}>{menuItems.filter(item => item.category === category).length}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}