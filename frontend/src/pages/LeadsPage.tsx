import { useState, useEffect } from 'react';
import { Lead, LeadFilters, LeadFormData } from '../types';
import { useLeads, useCreateLead, useUpdateLead, useDeleteLead } from '../hooks/useLeads';
import { useDebounce } from '../hooks/useDebounce';
import { leadService } from '../services/leadService';
import { useAuthStore } from '../store/authStore';
import LeadFiltersBar from '../components/leads/LeadFilters';
import LeadTable from '../components/leads/LeadTable';
import LeadForm from '../components/leads/LeadForm';
import LeadDetail from '../components/leads/LeadDetail';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { Plus, Download, Users } from 'lucide-react';
import toast from 'react-hot-toast';

const DEFAULT_FILTERS: LeadFilters = {
  search: '',
  status: '',
  source: '',
  sort: 'latest',
  page: 1,
};

export default function LeadsPage() {
  const user = useAuthStore((s) => s.user);

  // Filters state
  const [filters, setFilters] = useState<LeadFilters>(DEFAULT_FILTERS);
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 400);

  // Sync debounced search into filters
  useEffect(() => {
    setFilters((f) => ({ ...f, search: debouncedSearch, page: 1 }));
  }, [debouncedSearch]);

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [viewingLead, setViewingLead] = useState<Lead | null>(null);
  const [deletingLead, setDeletingLead] = useState<Lead | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Queries & mutations
  const { data, isLoading, isFetching } = useLeads(filters);
  const createMutation = useCreateLead();
  const updateMutation = useUpdateLead();
  const deleteMutation = useDeleteLead();

  const leads = data?.data ?? [];
  const meta = data?.meta ?? {
    total: 0, page: 1, limit: 10, totalPages: 0,
    hasNextPage: false, hasPrevPage: false,
  };

  const handleCreate = async (formData: LeadFormData) => {
    await createMutation.mutateAsync(formData);
    setIsCreateOpen(false);
  };

  const handleUpdate = async (formData: LeadFormData) => {
    if (!editingLead) return;
    await updateMutation.mutateAsync({ id: editingLead._id, data: formData });
    setEditingLead(null);
  };

  const handleDelete = async () => {
    if (!deletingLead) return;
    await deleteMutation.mutateAsync(deletingLead._id);
    setDeletingLead(null);
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const blob = await leadService.exportCSV({
        status: filters.status || undefined,
        source: filters.source || undefined,
        search: filters.search || undefined,
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `gigflow-leads-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('CSV exported!');
    } catch {
      toast.error('Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  const updateFilters = (partial: Partial<LeadFilters>) => {
    setFilters((f) => ({ ...f, ...partial }));
  };

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl bg-brand-600/20 border border-brand-600/30 flex items-center justify-center">
              <Users size={16} className="text-brand-400" />
            </div>
            <h1 className="text-2xl font-bold text-white">Leads</h1>
            {meta.total > 0 && (
              <span className="bg-surface-tertiary border border-surface-border text-gray-400 text-xs font-mono px-2 py-0.5 rounded-full">
                {meta.total}
              </span>
            )}
          </div>
          <p className="text-gray-500 text-sm ml-12">
            {user?.role === 'admin' ? 'All leads across the team' : 'Your assigned leads'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            disabled={isExporting || leads.length === 0}
            className="btn-secondary flex items-center gap-2 text-sm"
          >
            <Download size={14} />
            {isExporting ? 'Exporting...' : 'Export CSV'}
          </button>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            <Plus size={14} />
            Add Lead
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-4">
        <LeadFiltersBar
          filters={filters}
          onFiltersChange={updateFilters}
          onSearchChange={handleSearchChange}
          searchInput={searchInput}
        />
      </div>

      {/* Table */}
      <div className={`card transition-opacity duration-200 ${isFetching && !isLoading ? 'opacity-70' : 'opacity-100'}`}>
        <LeadTable
          leads={leads}
          meta={meta}
          isLoading={isLoading}
          onEdit={setEditingLead}
          onDelete={setDeletingLead}
          onView={setViewingLead}
          onPageChange={(page) => updateFilters({ page })}
        />
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Add New Lead"
      >
        <LeadForm
          onSubmit={handleCreate}
          isLoading={createMutation.isPending}
          onCancel={() => setIsCreateOpen(false)}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={!!editingLead}
        onClose={() => setEditingLead(null)}
        title="Edit Lead"
      >
        {editingLead && (
          <LeadForm
            initialData={editingLead}
            onSubmit={handleUpdate}
            isLoading={updateMutation.isPending}
            onCancel={() => setEditingLead(null)}
          />
        )}
      </Modal>

      {/* View Modal */}
      <Modal
        isOpen={!!viewingLead}
        onClose={() => setViewingLead(null)}
        title="Lead Details"
        size="lg"
      >
        {viewingLead && <LeadDetail lead={viewingLead} />}
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingLead}
        onClose={() => setDeletingLead(null)}
        onConfirm={handleDelete}
        title="Delete Lead"
        message={`Are you sure you want to delete "${deletingLead?.name}"? This action cannot be undone.`}
        confirmLabel="Delete Lead"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
