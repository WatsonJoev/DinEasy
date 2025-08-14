import { useState } from "react";
import { Button } from "@/components/ui/button";

interface MenuFiltersProps {
  selectedCategory: string;
  selectedFoodType: string;
  showRecommended: boolean;
  categories: string[];
  onCategoryChange: (category: string) => void;
  onFoodTypeChange: (type: string) => void;
  onRecommendedToggle: () => void;
  onSearchChange: (searchTerm: string) => void; // New prop for search functionality
}

export function MenuFilters({
  selectedCategory,
  selectedFoodType,
  showRecommended,
  categories,
  onCategoryChange,
  onFoodTypeChange,
  onRecommendedToggle,
  onSearchChange, // New prop for search functionality
}: MenuFiltersProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchTerm(value);
    onSearchChange(value); // Call the search change handler passed as a prop
  };

  return (
    <div className="bg-white/95 backdrop-blur-sm sticky top-0 z-40 p-4 -mx-4 border-b border-charcoal/10 space-y-3">
      <h2 className="font-semibold text-charcoal text-xs sm:text-sm">
        Browse Menu
      </h2>

      {/* Search Bar */}
      <div className="flex">
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Search..."
          className="flex-1 border border-gray-300 rounded-md p-2 text-sm"
        />
      </div>

      {/* Toggle Buttons */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={showRecommended ? "default" : "outline"}
          onClick={onRecommendedToggle}
          size="sm"
          className={`${
            showRecommended
              ? "bg-pumpkin text-white hover:bg-pumpkin/90 border-pumpkin"
              : "text-charcoal"
          } text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2`}
        >
          ⭐ Recommended
        </Button>

        <Button
          variant={selectedFoodType === "veg" ? "default" : "outline"}
          onClick={() =>
            onFoodTypeChange(selectedFoodType === "veg" ? "all" : "veg")
          }
          size="sm"
          className={`${
            selectedFoodType === "veg"
              ? "bg-olivine text-white hover:bg-olivine/90 border-olivine"
              : "text-charcoal"
          } text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2`}
        >
          🌱 Veg
        </Button>

        <Button
          variant={selectedFoodType === "non-veg" ? "default" : "outline"}
          onClick={() =>
            onFoodTypeChange(selectedFoodType === "non-veg" ? "all" : "non-veg")
          }
          size="sm"
          className={`${
            selectedFoodType === "non-veg"
              ? "bg-pumpkin text-white hover:bg-pumpkin/90 border-pumpkin"
              : "text-charcoal"
          } text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2`}
        >
          🍗 Non-Veg
        </Button>

        <Button
          variant={selectedFoodType === "others" ? "default" : "outline"}
          onClick={() =>
            onFoodTypeChange(selectedFoodType === "others" ? "all" : "others")
          }
          size="sm"
          className={`${
            selectedFoodType === "others"
              ? "bg-yellow-400 text-white hover:bg-yellow-400/90 border-yellow-400"
              : "text-charcoal"
          } text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2`}
        >
          🍽️ Others
        </Button>
      </div>

      {/* Category Scroll List */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-muted-foreground/30">
        <Button
          variant={selectedCategory === "All" ? "default" : "outline"}
          onClick={() => onCategoryChange("All")}
          size="sm"
          className="whitespace-nowrap text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
        >
          All
        </Button>

        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            onClick={() => onCategoryChange(category)}
            size="sm"
            className="whitespace-nowrap text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
          >
            {category}
          </Button>
        ))}
      </div>
    </div>
  );
}
