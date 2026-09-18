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
