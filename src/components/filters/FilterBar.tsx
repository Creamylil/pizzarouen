'use client';

import { Checkbox } from '@/components/ui/checkbox';
import type { Filters } from '@/types/pizzeria';

interface FilterBarProps {
  filters: Filters;
  onLocalFiltersChange: (newFilters: Filters) => void;
}

export default function FilterBar({ filters, onLocalFiltersChange }: FilterBarProps) {
  const handleHalalChange = (checked: boolean) => {
    onLocalFiltersChange({
      ...filters,
      halalOnly: checked,
    });
  };

  const handleTop10Change = (checked: boolean) => {
    onLocalFiltersChange({
      ...filters,
      showTop10: checked,
    });
  };

  return (
    <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
      <div className="flex items-center gap-3 backdrop-blur-sm px-4 py-2 rounded-full shadow-md border border-white/20 hover:shadow-lg transition-all duration-200 bg-primary-foreground">
        <Checkbox
          id="halal-filter"
          checked={filters.halalOnly}
          onCheckedChange={handleHalalChange}
          className="h-5 w-5 rounded border-2 border-gray-800 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500 data-[state=checked]:text-white transition-colors"
        />
        <h2
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleHalalChange(!filters.halalOnly);
          }}
          className="text-sm font-semibold cursor-pointer select-none text-primary"
        >
          Pizza Halal
        </h2>
      </div>

      <div className="flex items-center gap-3 backdrop-blur-sm px-4 py-2 rounded-full shadow-md border border-white/20 hover:shadow-lg transition-all duration-200 bg-primary-foreground">
        <Checkbox
          id="top10-filter"
          checked={filters.showTop10}
          onCheckedChange={handleTop10Change}
          className="h-5 w-5 rounded border-2 border-gray-800 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500 data-[state=checked]:text-white transition-colors"
        />
        <h2
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleTop10Change(!filters.showTop10);
          }}
          className="text-sm font-semibold cursor-pointer select-none text-primary"
        >
          Top 10 Meilleures Pizzerias
        </h2>
      </div>
    </div>
  );
}
