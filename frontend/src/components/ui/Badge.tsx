import { LeadStatus, LeadSource } from '../../types';

interface StatusBadgeProps {
  status: LeadStatus;
}

interface SourceBadgeProps {
  source: LeadSource;
}

const statusMap: Record<LeadStatus, string> = {
  New: 'badge-new',
  Contacted: 'badge-contacted',
  Qualified: 'badge-qualified',
  Lost: 'badge-lost',
};

const sourceMap: Record<LeadSource, { color: string; emoji: string }> = {
  Website: { color: 'bg-purple-500/15 text-purple-400 border-purple-500/30', emoji: '🌐' },
  Instagram: { color: 'bg-pink-500/15 text-pink-400 border-pink-500/30', emoji: '📸' },
  Referral: { color: 'bg-teal-500/15 text-teal-400 border-teal-500/30', emoji: '🤝' },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={`badge ${statusMap[status]}`}>
      {status}
    </span>
  );
}

export function SourceBadge({ source }: SourceBadgeProps) {
  const { color, emoji } = sourceMap[source];
  return (
    <span className={`badge border ${color}`}>
      {emoji} {source}
    </span>
  );
}
