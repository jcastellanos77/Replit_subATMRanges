import { Search, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from '@/hooks/useLanguage';

interface ShopFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  selectedCity: string;
  onCityChange: (value: string) => void;
  selectedState: string;
  onStateChange: (value: string) => void;
  categories: string[];
  cities: string[];
  states: string[];
  resultsCount: number;
}

export default function ShopFilters({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedCity,
  onCityChange,
  selectedState,
  onStateChange,
  categories,
  cities,
  states,
  resultsCount,
}: ShopFiltersProps) {
  const { t } = useLanguage();
  return (
    <section className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Search Bar */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder={t('search.placeholder')}
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 focus:ring-2 focus:ring-atm-green focus:border-transparent"
                data-testid="input-search"
              />
            </div>
          </div>
          
          {/* Filter Dropdowns */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={onCategoryChange}>
              <SelectTrigger className="w-full sm:w-[180px] focus:ring-2 focus:ring-atm-green" data-testid="select-category">
                <SelectValue placeholder={t('filter.category.label')} />
                <ChevronDown className="h-4 w-4 opacity-50" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('filter.category.all')}</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {/* City Filter */}
            <Select value={selectedCity} onValueChange={onCityChange}>
              <SelectTrigger className="w-full sm:w-[180px] focus:ring-2 focus:ring-atm-green" data-testid="select-city">
                <SelectValue placeholder={t('filter.city.label')} />
                <ChevronDown className="h-4 w-4 opacity-50" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('filter.city.all')}</SelectItem>
                {cities.map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {/* State Filter */}
            <Select value={selectedState} onValueChange={onStateChange}>
              <SelectTrigger className="w-full sm:w-[180px] focus:ring-2 focus:ring-atm-green" data-testid="select-state">
                <SelectValue placeholder={t('filter.state.label')} />
                <ChevronDown className="h-4 w-4 opacity-50" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('filter.state.all')}</SelectItem>
                {states.map((state) => (
                  <SelectItem key={state} value={state}>
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Results Count */}
        <div className="mt-4 text-sm text-gray-600" data-testid="text-results-count">
          <span>{resultsCount}</span> {t('filter.results')}
        </div>
      </div>
    </section>
  );
}
