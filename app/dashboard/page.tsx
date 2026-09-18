'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import DashboardContent from '@/components/DashboardContent';
import PaymentsList from '@/components/PaymentsList';
import FinancialImpactBanner from '@/components/FinancialImpactBanner';
import TimelineChart from '@/components/TimelineChart';

export default function DashboardPage() {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      router.push('/sign-in');
    }
  }, [isSignedIn, isLoaded, router]);

  if (!mounted || !isLoaded || !isSignedIn) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin">
          <div className="w-12 h-12 border-4 border-[#ff8c00] border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">Dashboard</h1>

      {/* Payments Section */}
      <section className="mb-12 bg-white rounded-lg p-6 shadow">
        <PaymentsList limit={50} />
      </section>

      {/* Existing Dashboard Content */}
      <section className="bg-white rounded-lg p-6 shadow">
        <DashboardContent />
      </section>
    </div>
  );
}
