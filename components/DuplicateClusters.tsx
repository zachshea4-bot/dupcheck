'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';

interface Cluster {
  id: string;
  transaction_ids: string[];
  confidence_score: number;
  total_amount: number;
  created_at: string;
}

export default function DuplicateClusters() {
  const { user } = useUser();
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    const fetchClusters = async () => {
      try {
        if (!user) return;
        const response = await fetch(\/api/detection/clusters?userId=\\);
        const data = await response.json();
        setClusters(data.clusters || []);
      } catch (error) {
        console.error('Error fetching clusters:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClusters();
  }, [user]);

  const handleBatchAnalyze = async () => {
    setAnalyzing(true);
    try {
      // Get all pending issues
      const response = await fetch(\/api/dashboard/issues?userId=\&status=pending\);
      const data = await response.json();
      const paymentIds = data.issues?.map((i: any) => i.flagged_payment_ids[0]) || [];

      if (paymentIds.length > 0) {
        const analyzeResponse = await fetch('/api/detection/batch-analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user?.id,
            paymentIds
          })
        });

        const result = await analyzeResponse.json();
        if (result.success) {
          setClusters([...clusters, ...result.clusters]);
          alert(\Created \ new clusters!\);
        }
      }
    } catch (error) {
      console.error('Batch analysis error:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return <div className="text-slate-600">Loading clusters...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Duplicate Clusters</h2>
        <button
          onClick={handleBatchAnalyze}
          disabled={analyzing}
          className="bg-purple-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50"
        >
          {analyzing ? 'Analyzing...' : 'Batch Analyze'}
        </button>
      </div>

      {clusters.length === 0 ? (
        <div className="bg-slate-50 rounded-lg p-8 text-center text-slate-600">
          No clusters found. Run batch analysis to detect duplicates.
        </div>
      ) : (
        <div className="grid gap-4">
          {clusters.map((cluster) => (
            <div key={cluster.id} className="bg-white rounded-lg p-6 border-l-4 border-purple-500 shadow">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-slate-900">Cluster</h3>
                  <p className="text-sm text-slate-600">{cluster.transaction_ids.length} transactions</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-purple-600">\</div>
                  <div className="text-sm text-slate-600">Total Amount</div>
                </div>
              </div>

              <div className="mb-3">
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-slate-600">Confidence</span>
                  <span className="text-sm font-semibold">{Math.round(cluster.confidence_score * 100)}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-purple-500 h-2 rounded-full"
                    style={{ width: \\%\ }}
                  ></div>
                </div>
              </div>

              <p className="text-xs text-slate-500">
                Created: {new Date(cluster.created_at).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
