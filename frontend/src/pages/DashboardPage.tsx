import { useLeadStats } from '../hooks/useLeads';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import { Users, TrendingUp, Target, AlertCircle, ArrowRight, BarChart3 } from 'lucide-react';
import Spinner from '../components/ui/Spinner';
import { LeadStatus, LeadSource } from '../types';

const statusColors: Record<LeadStatus, { bg: string; text: string; border: string; bar: string }> = {
  New: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20', bar: 'bg-blue-500' },
  Contacted: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/20', bar: 'bg-yellow-500' },
  Qualified: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/20', bar: 'bg-green-500' },
  Lost: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20', bar: 'bg-red-500' },
};

const sourceColors: Record<LeadSource, { bg: string; text: string; emoji: string }> = {
  Website: { bg: 'bg-purple-500/10', text: 'text-purple-400', emoji: '🌐' },
  Instagram: { bg: 'bg-pink-500/10', text: 'text-pink-400', emoji: '📸' },
  Referral: { bg: 'bg-teal-500/10', text: 'text-teal-400', emoji: '🤝' },
};

export default function DashboardPage() {
  const { data: stats, isLoading, isError } = useLeadStats();
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  const statuses: LeadStatus[] = ['New', 'Contacted', 'Qualified', 'Lost'];
  const sources: LeadSource[] = ['Website', 'Instagram', 'Referral'];

  const qualifiedCount = stats?.byStatus['Qualified'] ?? 0;
  const conversionRate =
    stats && stats.total > 0 ? ((qualifiedCount / stats.total) * 100).toFixed(1) : '0';

  return (
    <div className="p-8 max-w-6xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">
          Good {getGreeting()},{' '}
          <span className="text-brand-400">{user?.name.split(' ')[0]}</span> 👋
        </h1>
        <p className="text-gray-500 mt-1">
          Here's an overview of your leads pipeline
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Spinner size="lg" />
        </div>
      ) : isError ? (
        <div className="card p-8 text-center">
          <AlertCircle size={32} className="text-red-400 mx-auto mb-3" />
          <p className="text-gray-400">Failed to load stats. Make sure the backend is running.</p>
        </div>
      ) : (
        <>
          {/* Top KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <KpiCard
              label="Total Leads"
              value={stats?.total ?? 0}
              icon={Users}
              accent="brand"
              subtitle="All time"
            />
            <KpiCard
              label="Qualified"
              value={stats?.byStatus['Qualified'] ?? 0}
              icon={Target}
              accent="green"
              subtitle="Ready to close"
            />
            <KpiCard
              label="Conversion Rate"
              value={`${conversionRate}%`}
              icon={TrendingUp}
              accent="yellow"
              subtitle="Qualified / Total"
            />
            <KpiCard
              label="Active Pipeline"
              value={(stats?.byStatus['New'] ?? 0) + (stats?.byStatus['Contacted'] ?? 0)}
              icon={BarChart3}
              accent="purple"
              subtitle="New + Contacted"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Status Breakdown */}
            <div className="card p-6">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-5">
                Leads by Status
              </h2>
              <div className="space-y-3">
                {statuses.map((status) => {
                  const count = stats?.byStatus[status] ?? 0;
                  const pct = stats?.total ? (count / stats.total) * 100 : 0;
                  const colors = statusColors[status];
                  return (
                    <div key={status}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={`text-sm font-medium ${colors.text}`}>{status}</span>
                        <span className="text-sm font-mono text-gray-400">
                          {count} <span className="text-gray-600">({pct.toFixed(0)}%)</span>
                        </span>
                      </div>
                      <div className="h-2 bg-surface-tertiary rounded-full overflow-hidden">
                        <div
                          className={`h-full ${colors.bar} rounded-full transition-all duration-700`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Source Breakdown */}
            <div className="card p-6">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-5">
                Leads by Source
              </h2>
              <div className="space-y-3">
                {sources.map((source) => {
                  const count = stats?.bySource[source] ?? 0;
                  const pct = stats?.total ? (count / stats.total) * 100 : 0;
                  const { bg, text, emoji } = sourceColors[source];
                  return (
                    <div key={source} className={`flex items-center gap-4 p-3 rounded-xl ${bg} border border-white/5`}>
                      <span className="text-2xl">{emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1">
                          <span className={`text-sm font-semibold ${text}`}>{source}</span>
                          <span className="text-sm font-mono text-gray-400">{count}</span>
                        </div>
                        <div className="h-1.5 bg-black/20 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${text.replace('text-', 'bg-')} rounded-full transition-all duration-700`}
                            style={{ width: `${pct}%`, opacity: 0.7 }}
                          />
                        </div>
                      </div>
                      <span className="text-xs text-gray-500 font-mono shrink-0">{pct.toFixed(0)}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-6 card p-6 flex items-center justify-between bg-gradient-to-r from-brand-950 to-surface-secondary">
            <div>
              <h3 className="text-white font-semibold mb-1">Manage your leads</h3>
              <p className="text-gray-500 text-sm">
                View, filter, and update all your leads in one place
              </p>
            </div>
            <button
              onClick={() => navigate('/leads')}
              className="btn-primary flex items-center gap-2 shrink-0"
            >
              Go to Leads
              <ArrowRight size={14} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

interface KpiCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  accent: 'brand' | 'green' | 'yellow' | 'purple';
  subtitle: string;
}

const accentMap: Record<KpiCardProps['accent'], { icon: string; bg: string; border: string }> = {
  brand: { icon: 'text-brand-400', bg: 'bg-brand-600/10', border: 'border-brand-600/20' },
  green: { icon: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20' },
  yellow: { icon: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
  purple: { icon: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
};

function KpiCard({ label, value, icon: Icon, accent, subtitle }: KpiCardProps) {
  const a = accentMap[accent];
  return (
    <div className="card p-5 flex items-start gap-4 hover:border-surface-border/80 transition-colors">
      <div className={`w-10 h-10 rounded-xl ${a.bg} border ${a.border} flex items-center justify-center shrink-0`}>
        <Icon size={18} className={a.icon} />
      </div>
      <div>
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{label}</p>
        <p className="text-2xl font-bold text-white font-mono">{value}</p>
        <p className="text-xs text-gray-600 mt-0.5">{subtitle}</p>
      </div>
    </div>
  );
}
