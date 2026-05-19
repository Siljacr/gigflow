import { useState } from 'react';
import { Lead, LeadFormData, LeadStatus, LeadSource } from '../../types';
import Spinner from '../ui/Spinner';

interface LeadFormProps {
  initialData?: Lead;
  onSubmit: (data: LeadFormData) => void;
  isLoading?: boolean;
  onCancel: () => void;
}

const STATUSES: LeadStatus[] = ['New', 'Contacted', 'Qualified', 'Lost'];
const SOURCES: LeadSource[] = ['Website', 'Instagram', 'Referral'];

interface FormErrors {
  name?: string;
  email?: string;
  source?: string;
}

export default function LeadForm({ initialData, onSubmit, isLoading, onCancel }: LeadFormProps) {
  const [form, setForm] = useState<LeadFormData>({
    name: initialData?.name ?? '',
    email: initialData?.email ?? '',
    status: initialData?.status ?? 'New',
    source: initialData?.source ?? 'Website',
    notes: initialData?.notes ?? '',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!form.name.trim() || form.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    if (!form.email.trim() || !/^\S+@\S+\.\S+$/.test(form.email)) {
      newErrors.email = 'Valid email is required';
    }
    if (!form.source) {
      newErrors.source = 'Source is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) onSubmit(form);
  };

  const Field = ({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) => (
    <div>
      <label className="label">{label}</label>
      {children}
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Name" error={errors.name}>
        <input
          type="text"
          className={`input ${errors.name ? 'border-red-500' : ''}`}
          placeholder="John Doe"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
      </Field>

      <Field label="Email" error={errors.email}>
        <input
          type="email"
          className={`input ${errors.email ? 'border-red-500' : ''}`}
          placeholder="john@example.com"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Status">
          <select
            className="input"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value as LeadStatus })}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </Field>

        <Field label="Source" error={errors.source}>
          <select
            className={`input ${errors.source ? 'border-red-500' : ''}`}
            value={form.source}
            onChange={(e) => setForm({ ...form, source: e.target.value as LeadSource })}
          >
            {SOURCES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Notes (optional)">
        <textarea
          className="input resize-none"
          rows={3}
          placeholder="Any additional context..."
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
        />
      </Field>

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} className="btn-secondary flex-1">
          Cancel
        </button>
        <button type="submit" disabled={isLoading} className="btn-primary flex-1 flex items-center justify-center gap-2">
          {isLoading ? (
            <>
              <Spinner size="sm" />
              Saving...
            </>
          ) : (
            initialData ? 'Update Lead' : 'Create Lead'
          )}
        </button>
      </div>
    </form>
  );
}
