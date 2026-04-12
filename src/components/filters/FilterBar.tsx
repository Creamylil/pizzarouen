'use client';

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
    <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
      <h2 className="m-0 p-0 leading-none">
        <button
          onClick={() => handleHalalChange(!filters.halalOnly)}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium
            transition-all duration-200 border cursor-pointer
            ${filters.halalOnly
              ? 'bg-emerald-500 text-white border-emerald-500'
              : 'bg-transparent text-white/70 border-white/20 hover:border-white/40 hover:text-white'
            }
          `}
          style={{ fontFamily: 'var(--font-body)' }}
        >
          <span className="text-xs">☪️</span>
          Pizza Halal
        </button>
      </h2>

      <h2 className="m-0 p-0 leading-none">
        <button
          onClick={() => handleTop10Change(!filters.showTop10)}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium
            transition-all duration-200 border cursor-pointer
            ${filters.showTop10
              ? 'bg-amber-500 text-white border-amber-500'
              : 'bg-transparent text-white/70 border-white/20 hover:border-white/40 hover:text-white'
            }
          `}
          style={{ fontFamily: 'var(--font-body)' }}
        >
          <span className="text-xs">🏆</span>
          Top 10 Meilleures Pizzerias
        </button>
      </h2>
    </div>
  );
}
