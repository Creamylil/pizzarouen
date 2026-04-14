'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X, Search } from 'lucide-react';
import { DEAL_STATUSES } from '../../schemas/deal';

interface FichesFiltersProps {
  cities: { id: string; name: string }[];
  commercials: { id: string; name: string }[];
  isCommercial?: boolean;
}

export default function FichesFilters({ cities, commercials, isCommercial }: FichesFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentCity = searchParams.get('city') ?? '';
  const currentStatus = searchParams.get('status') ?? '';
  const currentCommercial = searchParams.get('commercial') ?? '';
  const currentSearch = searchParams.get('q') ?? '';

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== 'all') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  function handleSearch(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value.trim()) {
      params.set('q', value.trim());
    } else {
      params.delete('q');
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  function clearFilters() {
    router.push(pathname);
  }

  const hasFilters = currentCity || currentStatus || currentCommercial || currentSearch;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Rechercher..."
          defaultValue={currentSearch}
          className="pl-9 w-[200px]"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearch((e.target as HTMLInputElement).value);
            }
          }}
          onBlur={(e) => {
            if (e.target.value !== currentSearch) {
              handleSearch(e.target.value);
            }
          }}
        />
      </div>

      <Select value={currentCity || 'all'} onValueChange={(v) => updateFilter('city', v)}>
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Toutes les villes" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Toutes les villes</SelectItem>
          {cities.map((c) => (
            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={currentStatus || 'all'} onValueChange={(v) => updateFilter('status', v)}>
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Tous les statuts" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tous les statuts</SelectItem>
          <SelectItem value="no_deal">Sans deal</SelectItem>
          {DEAL_STATUSES.map((s) => (
            <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {!isCommercial && (
        <Select value={currentCommercial || 'all'} onValueChange={(v) => updateFilter('commercial', v)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Tous les commerciaux" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les commerciaux</SelectItem>
            <SelectItem value="unassigned">Non assigné</SelectItem>
            {commercials.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          <X className="h-4 w-4 mr-1" />
          Effacer
        </Button>
      )}
    </div>
  );
}
