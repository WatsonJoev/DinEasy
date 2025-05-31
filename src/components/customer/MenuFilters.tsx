
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface MenuFiltersProps {
  selectedCategory: string;
  selectedFoodType: string;
  showRecommended: boolean;
  categories: string[];
  onCategoryChange: (category: string) => void;
  onFoodTypeChange: (type: string) => void;
  onRecommendedToggle: () => void;
}

export function MenuFilters({
  selectedCategory,
  selectedFoodType,
  showRecommended,
  categories,
  onCategoryChange,
  onFoodTypeChange,
  onRecommendedToggle
}: MenuFiltersProps) {
  return (
    <div className="bg-white/95 backdrop-blur-sm sticky top-16 z-40 p-4 -mx-4 border-b border-charcoal/10 space-y-3">
      <h2 className="font-semibold text-charcoal">Browse Menu</h2>
      
      {/* Quick Filters */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={showRecommended ? 'default' : 'outline'}
          onClick={onRecommendedToggle}
          size="sm"
          className="bg-pumpkin hover:bg-pumpkin/90 text-white border-pumpkin"
        >
          ⭐ Recommended
        </Button>
        <Button
          variant={selectedFoodType === 'veg' ? 'default' : 'outline'}
          onClick={() => onFoodTypeChange(selectedFoodType === 'veg' ? 'all' : 'veg')}
          size="sm"
          className="bg-olivine hover:bg-olivine/90 text-white border-olivine"
        >
          🌱 Veg
        </Button>
        <Button
          variant={selectedFoodType === 'non-veg' ? 'default' : 'outline'}
          onClick={() => onFoodTypeChange(selectedFoodType === 'non-veg' ? 'all' : 'non-veg')}
          size="sm"
          className="bg-pumpkin hover:bg-pumpkin/90 text-white border-pumpkin"
        >
          🍗 Non-Veg
        </Button>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <Button
          variant={selectedCategory === 'All' ? 'default' : 'outline'}
          onClick={() => onCategoryChange('All')}
          size="sm"
          className="whitespace-nowrap"
        >
          All
        </Button>
        {categories.map(category => (
          <Button
            key={category}
            variant={selectedCategory === category ? 'default' : 'outline'}
            onClick={() => onCategoryChange(category)}
            size="sm"
            className="whitespace-nowrap"
          >
            {category}
          </Button>
        ))}
      </div>
    </div>
  );
}
