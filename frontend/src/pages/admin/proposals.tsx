import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/admin/AdminLayout';
import StatusBadge from '@/components/admin/StatusBadge';
import LoadingSpinner from '@/components/LoadingSpinner';

type TrendProposal = {
  id: string;
  source: string;
  sourceId: string;
  sourceUrl: string;
  title: string;
  description: string;
  keywords: string[];
  trendScore: number;
  aiCourseProposal: {
    relevanceScore: number;
    suggestedCourseTitle: string;
    suggestedDescription: string;
    keywords: string[];
    estimatedDurationMinutes: number;
    hackernewsData?: {
      author: string;
      time: number;
      score: number;
    };
  };
  estimatedDurationMinutes: number;
  estimatedGenerationCostUsd: number;
  estimatedEngagementScore: number;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export default function AdminProposalsPage() {
  const router = useRouter();
  const [proposals, setProposals] = useState<TrendProposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Filter state
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const fetchProposals = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/proposals');

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${await res.text()}`);
      }

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch proposals');
      }

      setProposals(data.data || []);
    } catch (err) {
      console.error('Error fetching proposals:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch proposals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProposals();
  }, []);

  const handleApprove = async (id: string) => {
    if (!confirm('Er du sikker på at du vil godkende dette forslag?')) {
      return;
    }

    setActionLoading(id);

    try {
      const res = await fetch(`/api/admin/proposals/${id}/approve`, {
        method: 'POST',
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${await res.text()}`);
      }

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to approve proposal');
      }

      // Refresh proposals list
      await fetchProposals();

      alert('✅ Forslag godkendt!');
    } catch (err) {
      console.error('Error approving proposal:', err);
      alert(`❌ Fejl: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm('Er du sikker på at du vil afvise dette forslag?')) {
      return;
    }

    setActionLoading(id);

    try {
      const res = await fetch(`/api/admin/proposals/${id}/reject`, {
        method: 'POST',
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${await res.text()}`);
      }

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to reject proposal');
      }

      // Refresh proposals list
      await fetchProposals();

      alert('✅ Forslag afvist');
    } catch (err) {
      console.error('Error rejecting proposal:', err);
      alert(`❌ Fejl: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setActionLoading(null);
    }
  };

  // Filter proposals by status
  const filteredProposals = proposals.filter((proposal) => {
    if (statusFilter === 'all') return true;
    return proposal.status === statusFilter;
  });

  // Format timestamp
  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('da-DK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <AdminLayout title="Trend Forslag">
      {/* Filters */}
      <div className="mb-6 flex gap-4 items-center">
        <div>
          <label className="block text-sm font-medium text-dark-text-secondary mb-2">
            Status Filter
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-dark-card border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">Alle</option>
            <option value="PENDING">Afventer</option>
            <option value="APPROVED">Godkendt</option>
            <option value="REJECTED">Afvist</option>
            <option value="GENERATING">Genererer</option>
            <option value="PUBLISHED">Udgivet</option>
          </select>
        </div>

        <div className="ml-auto">
          <button
            onClick={fetchProposals}
            disabled={loading}
            className="bg-dark-card hover:bg-dark-hover border border-dark-border rounded-lg px-4 py-2 text-white transition-colors disabled:opacity-50"
          >
            🔄 Opdater
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-dark-card border border-dark-border rounded-lg p-4">
          <div className="text-dark-text-secondary text-sm mb-1">Total</div>
          <div className="text-2xl font-bold text-white">{proposals.length}</div>
        </div>
        <div className="bg-dark-card border border-dark-border rounded-lg p-4">
          <div className="text-dark-text-secondary text-sm mb-1">Afventer</div>
          <div className="text-2xl font-bold text-yellow-400">
            {proposals.filter((p) => p.status === 'PENDING').length}
          </div>
        </div>
        <div className="bg-dark-card border border-dark-border rounded-lg p-4">
          <div className="text-dark-text-secondary text-sm mb-1">Godkendt</div>
          <div className="text-2xl font-bold text-green-400">
            {proposals.filter((p) => p.status === 'APPROVED').length}
          </div>
        </div>
        <div className="bg-dark-card border border-dark-border rounded-lg p-4">
          <div className="text-dark-text-secondary text-sm mb-1">Afvist</div>
          <div className="text-2xl font-bold text-red-400">
            {proposals.filter((p) => p.status === 'REJECTED').length}
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
          <p className="text-red-400">❌ {error}</p>
        </div>
      )}

      {/* Proposals List */}
      {!loading && !error && (
        <div className="space-y-4">
          {filteredProposals.length === 0 ? (
            <div className="bg-dark-card border border-dark-border rounded-lg p-8 text-center">
              <p className="text-dark-text-secondary">
                Ingen forslag fundet
              </p>
            </div>
          ) : (
            filteredProposals.map((proposal) => (
              <div
                key={proposal.id}
                className="bg-dark-card border border-dark-border rounded-lg p-6 hover:border-primary/30 transition-colors"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-white">
                        {proposal.title}
                      </h3>
                      <StatusBadge status={proposal.status} type="proposal" />
                    </div>
                    <a
                      href={proposal.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      🔗 {proposal.sourceUrl}
                    </a>
                  </div>
                </div>

                {/* HackerNews Metadata */}
                {proposal.aiCourseProposal.hackernewsData && (
                  <div className="flex gap-4 mb-4 text-sm text-dark-text-secondary">
                    <span>
                      👤 {proposal.aiCourseProposal.hackernewsData.author}
                    </span>
                    <span>
                      🔥 {proposal.aiCourseProposal.hackernewsData.score} points
                    </span>
                    <span>
                      📅 {formatDate(proposal.createdAt)}
                    </span>
                  </div>
                )}

                {/* AI Analysis */}
                <div className="bg-dark-bg rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">🤖</span>
                    <span className="font-semibold text-white">AI Analyse</span>
                  </div>

                  <div className="space-y-2 text-sm">
                    {proposal.aiCourseProposal.relevanceScore !== undefined && (
                      <div>
                        <span className="text-dark-text-secondary">Relevance Score:</span>
                        <span className="ml-2 text-white font-medium">
                          {Math.round(proposal.aiCourseProposal.relevanceScore)}%
                        </span>
                        <div className="mt-1 h-2 bg-dark-card rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-primary to-secondary"
                            style={{
                              width: `${proposal.aiCourseProposal.relevanceScore}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}

                    <div>
                      <span className="text-dark-text-secondary">Foreslået Kursus Titel:</span>
                      <p className="text-white font-medium mt-1">
                        {proposal.aiCourseProposal.suggestedCourseTitle || (proposal.aiCourseProposal as any).suggestedTitle || 'N/A'}
                      </p>
                    </div>

                    {(proposal.aiCourseProposal.suggestedDescription || proposal.description) && (
                      <div>
                        <span className="text-dark-text-secondary">Beskrivelse:</span>
                        <p className="text-white mt-1">
                          {proposal.aiCourseProposal.suggestedDescription || proposal.description}
                        </p>
                      </div>
                    )}

                    <div>
                      <span className="text-dark-text-secondary">Keywords:</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {(proposal.aiCourseProposal.keywords || (proposal.aiCourseProposal as any).keyTopics || []).map((keyword: string, idx: number) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-primary/20 text-primary text-xs rounded"
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-4 mt-2">
                      <span className="text-dark-text-secondary">
                        ⏱️ Estimeret varighed: {proposal.estimatedDurationMinutes} min
                      </span>
                      <span className="text-dark-text-secondary">
                        💰 Estimeret cost: ${proposal.estimatedGenerationCostUsd.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                {proposal.status === 'PENDING' && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleApprove(proposal.id)}
                      disabled={actionLoading === proposal.id}
                      className="flex-1 bg-primary hover:bg-primary-dark text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {actionLoading === proposal.id ? '⏳ Godkender...' : '✅ Godkend'}
                    </button>
                    <button
                      onClick={() => handleReject(proposal.id)}
                      disabled={actionLoading === proposal.id}
                      className="flex-1 bg-dark-bg hover:bg-dark-hover text-white font-medium py-2 px-4 rounded-lg border border-dark-border transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {actionLoading === proposal.id ? '⏳ Afviser...' : '❌ Afvis'}
                    </button>
                  </div>
                )}

                {proposal.status === 'APPROVED' && (
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 text-center">
                    <p className="text-green-400 text-sm">
                      ✅ Godkendt - Klar til kursus generering (Phase 2)
                    </p>
                  </div>
                )}

                {proposal.status === 'REJECTED' && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-center">
                    <p className="text-red-400 text-sm">❌ Afvist</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </AdminLayout>
  );
}
