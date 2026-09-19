'use client';

import { useEffect, useState } from 'react';

interface HistoryItem {
  id: string;
  action: string;
  timestamp: string;
  user_id: string;
  notes: string;
}

export default function ApprovalHistory({ issueId }: { issueId: string }) {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch(
          \/api/dashboard/issues/\/history\
        );
        const data = await response.json();
        setHistory(data.history || []);
      } catch (error) {
        console.error('Error fetching history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [issueId]);

  if (loading) {
    return <div className="text-slate-600 text-sm">Loading history...</div>;
  }

  if (history.length === 0) {
    return <div className="text-slate-600 text-sm">No history yet</div>;
  }

  return (
    <div className="border-t border-slate-200 pt-4 mt-4">
      <h4 className="font-semibold text-slate-900 mb-3 text-sm">Approval History</h4>
      <div className="space-y-2">
        {history.map((item) => (
          <div key={item.id} className="text-sm bg-slate-50 rounded px-3 py-2">
            <div className="flex justify-between items-start">
              <div>
                <span className="font-semibold text-slate-900">
                  {item.action === 'approve' ? '✓ Approved' : '✗ Rejected'}
                </span>
                <span className="text-slate-600 ml-2">
                  by {item.user_id.slice(0, 8)}
                </span>
              </div>
              <span className="text-slate-500 text-xs">
                {new Date(item.timestamp).toLocaleDateString()}
              </span>
            </div>
            {item.notes && (
              <p className="text-slate-600 text-xs mt-1">Note: {item.notes}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
