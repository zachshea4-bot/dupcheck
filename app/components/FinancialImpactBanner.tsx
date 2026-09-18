'use client';

import { useState, useEffect } from 'react';

type SummaryData = {
  total_at_risk: number;
  duplicate_count: number;
  date_range_start: string | null;
  date_range_end: string | null;
  severity: 'green' | 'yellow' | 'red';
};

export default function FinancialImpactBanner() {
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const userId = 'test-user';
        const response = await fetch(`/api/dashboard/summary?userId=${userId}`);
        if (!response.ok) throw new Error('Failed to fetch summary');
        const data = await response.json();
        setSummary(data);
      } catch (err) {
        console.error('Error fetching summary:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  if (loading || !summary) return null;
  if (summary.duplicate_count === 0) return null;

  const bgColor = {
    red: 'bg-red-50 border-red-200',
    yellow: 'bg-yellow-50 border-yellow-200',
    green: 'bg-green-50 border-green-200',
  }[summary.severity];

  const textColor = {
    red: 'text-red-900',
    yellow: 'text-yellow-900',
    green: 'text-green-900',
  }[summary.severity];

  const icon = {
    red: '🚨',
    yellow: '⚠️',
    green: '✓',
  }[summary.severity];

  const dateRange = summary.date_range_start
    ? `${new Date(summary.date_range_start).toLocaleDateString()} - ${new Date(summary.date_range_end!).toLocaleDateString()}`
    : 'Unknown';

  return (
    <div className={`border p-6 rounded-lg mb-6 ${bgColor}`}>
      <div className="flex items-start justify-between">
        <div>
          <h2 className={`text-2xl font-bold ${textColor} flex items-center gap-2`}>
            {icon} POTENTIAL DUPLICATES FOUND
          </h2>
          <p className={`text-3xl font-bold ${textColor} mt-2`}>
            ${summary.total_at_risk.toLocaleString()}
          </p>
          <p className={textColor}>
            {summary.duplicate_count} duplicate pairs detected
          </p>
          <p className={`text-sm ${textColor} opacity-80`}>
            Issue spans: {dateRange}
          </p>
        </div>
        <button className="px-6 py-2 bg-[#ff8c00] text-white rounded-lg font-semibold hover:bg-[#e67e00]">
          Review Duplicates
        </button>
      </div>
    </div>
  );
}
