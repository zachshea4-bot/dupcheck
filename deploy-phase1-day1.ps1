# Phase 1 Day 1 Deployment Script
# Run this in PowerShell from your dupcheck repo root

Set-Location $PSScriptRoot

Write-Host "🚀 Deploying Phase 1 Day 1..." -ForegroundColor Cyan

# Create FinancialImpactBanner component
Write-Host "Creating FinancialImpactBanner.tsx..." -ForegroundColor Green
@'
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
'@ | Set-Content -Path "app/components/FinancialImpactBanner.tsx" -Encoding UTF8

# Create TimelineChart component
Write-Host "Creating TimelineChart.tsx..." -ForegroundColor Green
@'
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
'@ | Set-Content -Path "app/components/TimelineChart.tsx" -Encoding UTF8

# Create summary API endpoint
Write-Host "Creating summary endpoint..." -ForegroundColor Green
@'
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

    const { data: flags, error } = await supabase
      .from('flags')
      .select('amount, created_at')
      .eq('user_id', userId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!flags || flags.length === 0) {
      return NextResponse.json({
        total_at_risk: 0,
        duplicate_count: 0,
        date_range_start: null,
        date_range_end: null,
        severity: 'green',
      });
    }

    const total_at_risk = flags.reduce((sum: number, flag: any) => sum + (flag.amount || 0), 0);
    const duplicate_count = flags.length;
    const dates = flags.map((f: any) => new Date(f.created_at).getTime()).sort((a: number, b: number) => a - b);
    const date_range_start = new Date(dates[0]).toISOString();
    const date_range_end = new Date(dates[dates.length - 1]).toISOString();

    let severity = 'green';
    if (total_at_risk > 10000) severity = 'red';
    else if (total_at_risk > 1000) severity = 'yellow';

    return NextResponse.json({
      total_at_risk,
      duplicate_count,
      date_range_start,
      date_range_end,
      severity,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal error' },
      { status: 500 }
    );
  }
}
'@ | Set-Content -Path "app/api/dashboard/summary/route.ts" -Encoding UTF8

# Create timeline API endpoint
Write-Host "Creating timeline endpoint..." -ForegroundColor Green
@'
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const days = parseInt(searchParams.get('days') || '90');

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const { data: flags, error } = await supabase
      .from('flags')
      .select('id, created_at')
      .eq('user_id', userId)
      .gte('created_at', cutoffDate.toISOString());

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!flags || flags.length === 0) {
      return NextResponse.json({ timeline: [] });
    }

    const groupedByDate: { [key: string]: number } = {};
    flags.forEach((flag: any) => {
      const date = new Date(flag.created_at).toISOString().split('T')[0];
      groupedByDate[date] = (groupedByDate[date] || 0) + 1;
    });

    const timeline = Object.entries(groupedByDate)
      .map(([date, count]) => ({
        date,
        count,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return NextResponse.json({ timeline });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal error' },
      { status: 500 }
    );
  }
}
'@ | Set-Content -Path "app/api/dashboard/timeline/route.ts" -Encoding UTF8

# Update dashboard page
Write-Host "Updating dashboard page..." -ForegroundColor Green
@'
'use client';

import { useUser } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import DashboardContent from '@/components/DashboardContent';
import PaymentsList from '@/components/PaymentsList';
import FinancialImpactBanner from '@/components/FinancialImpactBanner';
import TimelineChart from '@/components/TimelineChart';

export default function DashboardPage() {
  const { isSignedIn, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin">
          <div className="w-8 h-8 border-4 border-[#ff8c00] border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <h1 className="text-2xl font-bold">Sign in required</h1>
        <a href="/sign-in" className="px-4 py-2 bg-[#ff8c00] text-white rounded">
          Sign In
        </a>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <FinancialImpactBanner />
      <TimelineChart />
      <PaymentsList />
      <DashboardContent />
    </div>
  );
}
'@ | Set-Content -Path "app/dashboard/page.tsx" -Encoding UTF8

# Commit and push
Write-Host "Committing changes..." -ForegroundColor Green
git add app/components/FinancialImpactBanner.tsx
git add app/components/TimelineChart.tsx
git add app/api/dashboard/summary/route.ts
git add app/api/dashboard/timeline/route.ts
git add app/dashboard/page.tsx

git commit -m "feat: phase 1 day 1 - financial impact + timeline"
Write-Host "Pushing to GitHub..." -ForegroundColor Green
git push origin main

Write-Host "✅ Phase 1 Day 1 deployed! Check Vercel: https://vercel.com/zachshea4-bot/dupcheck/deployments" -ForegroundColor Cyan
