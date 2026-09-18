'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

type TimelineData = {
  date: string;
  count: number;
}[];

export default function TimelineChart() {
  const [timeline, setTimeline] = useState<TimelineData>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTimeline = async () => {
      try {
        const userId = 'test-user';
        const response = await fetch(`/api/dashboard/timeline?userId=${userId}&days=90`);
        if (!response.ok) throw new Error('Failed to fetch timeline');
        const data = await response.json();
        setTimeline(data.timeline);
      } catch (err) {
        console.error('Error fetching timeline:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTimeline();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin w-8 h-8 border-4 border-[#ff8c00] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (timeline.length === 0) {
    return (
      <div className="p-6 text-center bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-600">No duplicate activity in the past 90 days</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h2 className="text-xl font-bold mb-4">Duplicate Timeline (Last 90 Days)</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={timeline}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="count" stroke="#ff8c00" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
