
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface MenuFiltersProps {
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  selectedFoodType: string;
  onFoodTypeChange: (type: string) => void;
  showRecommended: boolean;
  onRecommendedChange: (show: boolean) => void;
}

export function MenuFilters({
  categories,
  selectedCategory,
  onCategoryChange,
  selectedFoodType,
  onFoodTypeChange,
  showRecommended,
  onRecommendedChange
}: MenuFiltersProps) {
  const foodTypes = [
    { id: 'all', label: 'All', icon: '🍽️' },
    { id: 'veg', label: 'Veg', icon: '🟢' },
    { id: 'non-veg', label: 'Non-Veg', icon: '🔴' },
    { id: 'vegan', label: 'Vegan', icon: '🌱' },
    { id: 'jain', label: 'Jain', icon: '🟡' }
  ];

  return (
    <div className="bg-white/95 backdrop-blur-sm sticky top-16 z-40 p-4 -mx-4 border-b border-charcoal/10 space-y-3">
      {/* Food Type Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {foodTypes.map(type => (
          <Button
            key={type.id}
            variant={selectedFoodType === type.id ? 'default' : 'outline'}
            onClick={() => onFoodTypeChange(type.id)}
            size="sm"
            className="whitespace-nowrap flex items-center gap-1"
          >
            <span>{type.icon}</span>
            {type.label}
          </Button>
        ))}
      </div>

      {/* Category Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <Button
          variant={selectedCategory === 'All' ? 'default' : 'outline'}
          onClick={() => onCategoryChange('All')}
          size="sm"
          className="whitespace-nowrap"
        >
          All Categories
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

      {/* Recommended Filter */}
      <div className="flex items-center gap-2">
        <Button
          variant={showRecommended ? 'default' : 'outline'}
          onClick={() => onRecommendedChange(!showRecommended)}
          size="sm"
          className="flex items-center gap-1"
        >
          ⭐ Recommended Only
        </Button>
        {showRecommended && (
          <Badge variant="secondary" className="text-xs">
            Showing recommended items
          </Badge>
        )}
      </div>
    </div>
  );
}
