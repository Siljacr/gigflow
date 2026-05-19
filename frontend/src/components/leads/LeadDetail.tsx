import { Lead } from '../../types';
import { StatusBadge, SourceBadge } from '../ui/Badge';
import { Calendar, Mail, User, FileText, Shield } from 'lucide-react';

interface LeadDetailProps {
  lead: Lead;
}

export default function LeadDetail({ lead }: LeadDetailProps) {
  const createdByName =
    typeof lead.createdBy === 'object' ? lead.createdBy.name : 'Unknown';

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-start gap-4 pb-4 border-b border-surface-border">
        <div className="w-14 h-14 rounded-xl bg-brand-600/20 border border-brand-600/30 flex items-center justify-center">
          <span className="text-brand-400 text-xl font-bold">
            {lead.name.charAt(0).toUpperCase()}
          </span>
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">{lead.name}</h3>
          <p className="text-gray-400 text-sm font-mono">{lead.email}</p>
          <div className="flex items-center gap-2 mt-2">
            <StatusBadge status={lead.status} />
            <SourceBadge source={lead.source} />
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { icon: Mail, label: 'Email', value: lead.email },
          {
            icon: Calendar,
            label: 'Created',
            value: new Date(lead.createdAt).toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
            }),
          },
          { icon: Shield, label: 'Status', value: lead.status },
          { icon: User, label: 'Created By', value: createdByName },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="bg-surface-tertiary border border-surface-border rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Icon size={13} className="text-gray-500" />
              <span className="text-xs text-gray-500 uppercase tracking-wide">{label}</span>
            </div>
            <p className="text-sm font-medium text-white">{value}</p>
          </div>
        ))}
      </div>

      {lead.notes && (
        <div className="bg-surface-tertiary border border-surface-border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <FileText size={13} className="text-gray-500" />
            <span className="text-xs text-gray-500 uppercase tracking-wide">Notes</span>
          </div>
          <p className="text-sm text-gray-300 leading-relaxed">{lead.notes}</p>
        </div>
      )}
    </div>
  );
}
