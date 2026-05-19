import { Lead } from '../../types';
import { StatusBadge, SourceBadge } from '../ui/Badge';
import { Pencil, Trash2, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { PaginationMeta } from '../../types';
import Spinner from '../ui/Spinner';

interface LeadTableProps {
  leads: Lead[];
  meta: PaginationMeta;
  isLoading: boolean;
  onEdit: (lead: Lead) => void;
  onDelete: (lead: Lead) => void;
  onView: (lead: Lead) => void;
  onPageChange: (page: number) => void;
}

export default function LeadTable({
  leads,
  meta,
  isLoading,
  onEdit,
  onDelete,
  onView,
  onPageChange,
}: LeadTableProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (leads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-surface-tertiary border border-surface-border flex items-center justify-center mb-4">
          <span className="text-3xl">📭</span>
        </div>
        <h3 className="text-lg font-semibold text-white mb-1">No leads found</h3>
        <p className="text-gray-500 text-sm">Try adjusting your filters or add a new lead</p>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="animate-fade-in">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-surface-border">
              {['Name', 'Email', 'Status', 'Source', 'Created', 'Actions'].map((h) => (
                <th
                  key={h}
                  className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider py-3 px-4"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border">
            {leads.map((lead) => (
              <tr
                key={lead._id}
                className="hover:bg-surface-tertiary/50 transition-colors group"
              >
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-brand-600/20 border border-brand-600/30 flex items-center justify-center shrink-0">
                      <span className="text-brand-400 text-xs font-bold">
                        {lead.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-white">{lead.name}</span>
                  </div>
                </td>
                <td className="py-3.5 px-4 text-sm text-gray-400 font-mono">{lead.email}</td>
                <td className="py-3.5 px-4">
                  <StatusBadge status={lead.status} />
                </td>
                <td className="py-3.5 px-4">
                  <SourceBadge source={lead.source} />
                </td>
                <td className="py-3.5 px-4 text-sm text-gray-500">{formatDate(lead.createdAt)}</td>
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onView(lead)}
                      className="p-1.5 text-gray-400 hover:text-brand-400 hover:bg-brand-600/10 rounded-lg transition-colors"
                      title="View"
                    >
                      <Eye size={14} />
                    </button>
                    <button
                      onClick={() => onEdit(lead)}
                      className="p-1.5 text-gray-400 hover:text-yellow-400 hover:bg-yellow-500/10 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => onDelete(lead)}
                      className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {meta.totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-4 border-t border-surface-border mt-2">
          <p className="text-sm text-gray-500">
            Showing {(meta.page - 1) * meta.limit + 1}–{Math.min(meta.page * meta.limit, meta.total)} of{' '}
            <span className="text-white font-medium">{meta.total}</span> leads
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange(meta.page - 1)}
              disabled={!meta.hasPrevPage}
              className="p-2 text-gray-400 hover:text-white hover:bg-surface-tertiary rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={16} />
            </button>

            {Array.from({ length: Math.min(5, meta.totalPages) }, (_, i) => {
              const page = i + 1;
              return (
                <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  className={`w-8 h-8 text-sm rounded-lg transition-colors ${
                    page === meta.page
                      ? 'bg-brand-600 text-white font-semibold'
                      : 'text-gray-400 hover:text-white hover:bg-surface-tertiary'
                  }`}
                >
                  {page}
                </button>
              );
            })}

            <button
              onClick={() => onPageChange(meta.page + 1)}
              disabled={!meta.hasNextPage}
              className="p-2 text-gray-400 hover:text-white hover:bg-surface-tertiary rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
