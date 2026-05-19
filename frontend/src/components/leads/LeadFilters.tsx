import { LeadFilters, LeadStatus, LeadSource } from '../../types';
import { Search, X, SlidersHorizontal } from 'lucide-react';

interface LeadFiltersBarProps {
  filters: LeadFilters;
  onFiltersChange: (filters: Partial<LeadFilters>) => void;
  onSearchChange: (search: string) => void;
  searchInput: string;
}

const STATUSES: LeadStatus[] = ['New', 'Contacted', 'Qualified', 'Lost'];
const SOURCES: LeadSource[] = ['Website', 'Instagram', 'Referral'];

export default function LeadFiltersBar({
  filters,
  onFiltersChange,
  onSearchChange,
  searchInput,
}: LeadFiltersBarProps) {
  const hasActiveFilters = filters.status || filters.source;

  const clearFilters = () => {
    onFiltersChange({ status: '', source: '', sort: 'latest', page: 1 });
    onSearchChange('');
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
      {/* Search */}
      <div className="relative flex-1 max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          className="input pl-9 pr-8 text-sm"
          placeholder="Search by name or email..."
          value={searchInput}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        {searchInput && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
          >
            <X size={12} />
          </button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <SlidersHorizontal size={14} className="text-gray-500" />

        {/* Status filter */}
        <select
          className="input text-sm w-auto py-2 px-3"
          value={filters.status ?? ''}
          onChange={(e) => onFiltersChange({ status: e.target.value as LeadStatus | '', page: 1 })}
        >
          <option value="">All Status</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        {/* Source filter */}
        <select
          className="input text-sm w-auto py-2 px-3"
          value={filters.source ?? ''}
          onChange={(e) => onFiltersChange({ source: e.target.value as LeadSource | '', page: 1 })}
        >
          <option value="">All Sources</option>
          {SOURCES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        {/* Sort */}
        <select
          className="input text-sm w-auto py-2 px-3"
          value={filters.sort}
          onChange={(e) => onFiltersChange({ sort: e.target.value as 'latest' | 'oldest', page: 1 })}
        >
          <option value="latest">Latest</option>
          <option value="oldest">Oldest</option>
        </select>

        {/* Clear */}
        {(hasActiveFilters || searchInput) && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white bg-surface-tertiary hover:bg-surface-border border border-surface-border px-2.5 py-2 rounded-lg transition-colors"
          >
            <X size={12} />
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
