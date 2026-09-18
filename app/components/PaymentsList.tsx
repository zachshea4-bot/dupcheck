'use client';

import { useState, useEffect } from 'react';

type PaymentRecord = {
  id: number;
  customer_id: string;
  user_id: string;
  amount: number;
  stripe_id: string;
  timestamp: string;
  status: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
};

type PaymentsListProps = {
  limit?: number;
};

export default function PaymentsList({ limit = 50 }: PaymentsListProps) {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
const userId = 'test-user'; // TODO: get from Clerk
const response = await fetch(`/api/dashboard/payments?userId=${userId}&limit=${limit}`);        
        if (!response.ok) {
          throw new Error(`Failed to fetch payments: ${response.statusText}`);
        }
        
        const data = await response.json();
        setPayments(data.payments || []);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load payments');
        setPayments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [limit]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="animate-spin">
          <div className="w-8 h-8 border-4 border-[#ff8c00] border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800 font-semibold">Error loading payments</p>
        <p className="text-red-600 text-sm mt-1">{error}</p>
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <div className="p-6 text-center bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-600">No payments recorded yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Recent Payments</h2>
        <p className="text-sm text-gray-600">{payments.length} payment(s)</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-gray-300">
              <th className="text-left p-3 font-semibold text-gray-700">Date</th>
              <th className="text-left p-3 font-semibold text-gray-700">Amount</th>
              <th className="text-left p-3 font-semibold text-gray-700">Stripe ID</th>
              <th className="text-left p-3 font-semibold text-gray-700">Status</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <tr key={payment.id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="p-3 text-gray-900">
                  {new Date(payment.timestamp).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </td>
                <td className="p-3 font-semibold text-gray-900">
                  ${payment.amount.toFixed(2)}
                </td>
                <td className="p-3 text-gray-600 font-mono text-xs">
                  {payment.stripe_id.slice(0, 12)}...
                </td>
                <td className="p-3">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                      payment.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : payment.status === 'refunded'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
