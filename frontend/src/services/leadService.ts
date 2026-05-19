import api from './api';
import { ApiResponse, Lead, LeadFormData, LeadFilters, LeadStats, PaginationMeta } from '../types';

export const leadService = {
  getLeads: async (filters: LeadFilters): Promise<{ data: Lead[]; meta: PaginationMeta }> => {
    const params = new URLSearchParams();
    params.set('page', String(filters.page));
    params.set('limit', '10');
    params.set('sort', filters.sort);
    if (filters.status) params.set('status', filters.status);
    if (filters.source) params.set('source', filters.source);
    if (filters.search) params.set('search', filters.search);

    const res = await api.get<ApiResponse<Lead[]>>(`/leads?${params.toString()}`);
    return {
      data: res.data.data ?? [],
      meta: res.data.meta ?? { total: 0, page: 1, limit: 10, totalPages: 0, hasNextPage: false, hasPrevPage: false },
    };
  },

  getLead: async (id: string): Promise<Lead> => {
    const res = await api.get<ApiResponse<Lead>>(`/leads/${id}`);
    if (!res.data.data) throw new Error('Lead not found');
    return res.data.data;
  },

  createLead: async (data: LeadFormData): Promise<Lead> => {
    const res = await api.post<ApiResponse<Lead>>('/leads', data);
    if (!res.data.data) throw new Error('Failed to create lead');
    return res.data.data;
  },

  updateLead: async (id: string, data: Partial<LeadFormData>): Promise<Lead> => {
    const res = await api.put<ApiResponse<Lead>>(`/leads/${id}`, data);
    if (!res.data.data) throw new Error('Failed to update lead');
    return res.data.data;
  },

  deleteLead: async (id: string): Promise<void> => {
    await api.delete(`/leads/${id}`);
  },

  exportCSV: async (filters: Partial<LeadFilters>): Promise<Blob> => {
    const params = new URLSearchParams();
    if (filters.status) params.set('status', filters.status);
    if (filters.source) params.set('source', filters.source);
    if (filters.search) params.set('search', filters.search);

    const res = await api.get(`/leads/export?${params.toString()}`, { responseType: 'blob' });
    return res.data as Blob;
  },

  getStats: async (): Promise<LeadStats> => {
    const res = await api.get<ApiResponse<LeadStats>>('/leads/stats');
    if (!res.data.data) throw new Error('Failed to get stats');
    return res.data.data;
  },
};
