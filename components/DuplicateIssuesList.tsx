'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';

interface Issue {
  id: string;
  vendor: string;
  amount: number;
  flagged_date: string;
  reason: string;
  confidence_score: number;
  status: string;
  flagged_payment_ids: string[];
  explanations: any[];
}

export default function DuplicateIssuesList() {
  const { user } = useUser();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [batchNotes, setBatchNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        if (!user) return;
        const response = await fetch(
          \/api/dashboard/issues?userId=\&status=pending\
        );
        const data = await response.json();
        setIssues(data.issues || []);
      } catch (error) {
        console.error('Error fetching issues:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchIssues();
  }, [user]);

  const toggleSelect = (issueId: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(issueId)) {
      newSelected.delete(issueId);
    } else {
      newSelected.add(issueId);
    }
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === issues.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(issues.map(i => i.id)));
    }
  };

  const handleBatchAction = async (action: 'approve' | 'reject') => {
    if (selectedIds.size === 0) return;

    setProcessing(true);
    try {
      const response = await fetch('/api/dashboard/issues/batch', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          issueIds: Array.from(selectedIds),
          action,
          notes: batchNotes,
          userId: user?.id
        })
      });

      const data = await response.json();
      if (data.success) {
        setIssues(issues.filter(i => !selectedIds.has(i.id)));
        setSelectedIds(new Set());
        setBatchNotes('');
      }
    } catch (error) {
      console.error('Batch action error:', error);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return <div className="text-slate-600">Loading issues...</div>;
  }

  if (issues.length === 0) {
    return (
      <div className="bg-slate-50 rounded-lg p-8 text-center">
        <p className="text-slate-600">No duplicate issues found!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-slate-900">
          Duplicate Issues ({issues.length})
        </h3>
        {selectedIds.size > 0 && (
          <div className="text-sm text-slate-600">
            {selectedIds.size} selected
          </div>
        )}
      </div>

      {selectedIds.size > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Approval Notes (optional)
            </label>
            <textarea
              value={batchNotes}
              onChange={(e) => setBatchNotes(e.target.value)}
              placeholder="Why are you approving/rejecting these?"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm"
              rows={2}
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => handleBatchAction('approve')}
              disabled={processing}
              className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 transition-all"
            >
              {processing ? 'Processing...' : \Approve All (\)\}
            </button>
            <button
              onClick={() => handleBatchAction('reject')}
              disabled={processing}
              className="flex-1 bg-slate-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-slate-700 disabled:opacity-50 transition-all"
            >
              {processing ? 'Processing...' : \Reject All (\)\}
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-lg">
          <input
            type="checkbox"
            checked={selectedIds.size === issues.length && issues.length > 0}
            onChange={toggleSelectAll}
            className="w-5 h-5 rounded border-slate-300 cursor-pointer"
          />
          <span className="text-sm font-semibold text-slate-600">
            {selectedIds.size === issues.length && issues.length > 0
              ? 'Deselect All'
              : 'Select All'}
          </span>
        </div>

        {issues.map((issue) => (
          <div
            key={issue.id}
            className={\lex items-start gap-4 bg-white border-l-4 border-orange-500 rounded-lg p-6 shadow transition-all \\}
          >
            <input
              type="checkbox"
              checked={selectedIds.has(issue.id)}
              onChange={() => toggleSelect(issue.id)}
              className="w-5 h-5 rounded border-slate-300 cursor-pointer mt-1"
            />

            <div className="flex-1">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="text-lg font-semibold text-slate-900">
                    {issue.vendor}
                  </h4>
                  <p className="text-sm text-slate-600">
                    {issue.flagged_payment_ids.length} transactions
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-red-600">
                    \
                  </div>
                  <div className="text-sm text-slate-600">At Risk</div>
                </div>
              </div>

              <div className="flex gap-2 mb-4 flex-wrap">
                {issue.explanations?.[0]?.tags?.map((tag: string) => (
                  <span
                    key={tag}
                    className="inline-block bg-orange-100 text-orange-800 text-xs px-3 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <p className="text-sm text-slate-700 mb-6">{issue.reason}</p>

              <div className="mb-4">
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-slate-600">Confidence</span>
                  <span className="text-sm font-semibold text-slate-900">
                    {Math.round(issue.confidence_score * 100)}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-orange-500 h-2 rounded-full"
                    style={{ width: \\%\ }}
                  ></div>
                </div>
              </div>

              {!selectedIds.has(issue.id) && (
                <div className="flex gap-3">
                  <button
                    onClick={() => toggleSelect(issue.id)}
                    className="text-blue-600 text-sm font-semibold hover:underline"
                  >
                    Select
                  </button>
                  <button
                    onClick={() => {
                      setSelectedIds(new Set([issue.id]));
                    }}
                    className="text-blue-600 text-sm font-semibold hover:underline"
                  >
                    Quick Approve
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
