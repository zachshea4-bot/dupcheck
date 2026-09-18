'use client';

import { useEffect, useState } from 'react';

interface AnalyticsData {
  metrics: {
    activeSubscriptions: number;
    totalMRR: number;
    cancelledSubscriptions: number;
    recentChurn: number;
    averageContractValue: number;
    ltv: number;
    totalCustomers: number;
    recentCustomers: number;
  };
  planBreakdown: {
    [key: string]: {
      name: string;
      price: number;
      count: number;
    };
  };
  churnRate: string;
}

export default function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch('/api/analytics');
        if (!response.ok) {
          throw new Error('Failed to fetch analytics');
        }
        const data = await response.json();
        setAnalytics(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-slate-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow">
          <p className="text-red-600 font-semibold">Error loading analytics</p>
          <p className="text-slate-600 mt-2">{error}</p>
        </div>
      </div>
    );
  }

  const { metrics, planBreakdown, churnRate } = analytics;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">DupCheck Analytics</h1>
          <p className="text-slate-600">Real-time metrics from Stripe</p>
        </div>

        {/* Top KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Active Subscriptions */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-slate-600 mb-2">Active Subscriptions</div>
            <div className="text-3xl font-bold text-blue-600">{metrics.activeSubscriptions}</div>
            <div className="text-xs text-slate-500 mt-2">
              {metrics.totalCustomers} total customers
            </div>
          </div>

          {/* MRR */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-slate-600 mb-2">Monthly Recurring Revenue</div>
            <div className="text-3xl font-bold text-green-600">${metrics.totalMRR.toLocaleString()}</div>
            <div className="text-xs text-slate-500 mt-2">
              ${metrics.averageContractValue.toFixed(0)}/month average
            </div>
          </div>

          {/* LTV */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-slate-600 mb-2">Customer Lifetime Value</div>
            <div className="text-3xl font-bold text-purple-600">${metrics.ltv.toLocaleString()}</div>
            <div className="text-xs text-slate-500 mt-2">
              (12-month projection)
            </div>
          </div>

          {/* Churn Rate */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-slate-600 mb-2">30-Day Churn Rate</div>
            <div className={`text-3xl font-bold ${
              parseFloat(churnRate) === 0 ? 'text-green-600' : 'text-orange-600'
            }`}>
              {churnRate}%
            </div>
            <div className="text-xs text-slate-500 mt-2">
              {metrics.recentChurn} cancellations
            </div>
          </div>
        </div>

        {/* Plan Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Revenue by Plan */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Revenue by Plan</h2>
            <div className="space-y-4">
              {Object.entries(planBreakdown).map(([priceId, plan]) => (
                <div key={priceId} className="flex items-center justify-between p-3 bg-slate-50 rounded">
                  <div>
                    <div className="font-semibold text-slate-900">{plan.name}</div>
                    <div className="text-sm text-slate-600">${plan.price}/month × {plan.count}</div>
                  </div>
                  <div className="font-bold text-blue-600">
                    ${(plan.price * plan.count).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Customer Acquisition */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Sales Pipeline</h2>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-600">
                <div className="text-sm text-slate-600">New Customers (90 days)</div>
                <div className="text-2xl font-bold text-blue-600 mt-1">
                  {metrics.recentCustomers}
                </div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-600">
                <div className="text-sm text-slate-600">Total Customers</div>
                <div className="text-2xl font-bold text-green-600 mt-1">
                  {metrics.totalCustomers}
                </div>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg border-l-4 border-orange-600">
                <div className="text-sm text-slate-600">Cancelled Subscriptions</div>
                <div className="text-2xl font-bold text-orange-600 mt-1">
                  {metrics.cancelledSubscriptions}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Items */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Next Steps</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border-2 border-blue-200 rounded-lg">
              <div className="font-semibold text-slate-900 mb-2">🎯 Sales Target</div>
              <p className="text-sm text-slate-600">
                {metrics.activeSubscriptions === 0
                  ? 'Get your first paying customer! Focus on outreach.'
                  : `You have ${metrics.activeSubscriptions} customers. Aim for 10x growth.`}
              </p>
            </div>
            <div className="p-4 border-2 border-green-200 rounded-lg">
              <div className="font-semibold text-slate-900 mb-2">💰 Revenue Insight</div>
              <p className="text-sm text-slate-600">
                {metrics.totalMRR === 0
                  ? 'Start with your first customer and scale from there.'
                  : `Your MRR is $${metrics.totalMRR}. Double it by ${new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toLocaleDateString()}`}
              </p>
            </div>
            <div className="p-4 border-2 border-purple-200 rounded-lg">
              <div className="font-semibold text-slate-900 mb-2">📈 Growth Path</div>
              <p className="text-sm text-slate-600">
                Focus on customer acquisition first. Retention metrics matter more once you hit 10+ customers.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
