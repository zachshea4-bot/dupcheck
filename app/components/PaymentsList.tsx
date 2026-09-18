'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';

interface Payment {
  id: string;
  amount: number;
  vendor: string;
  date: string;
}

export default function PaymentsList() {
  const { user } = useUser();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        if (!user) return;
        const response = await fetch(
          `/api/dashboard/payments?userId=${user.id}&limit=10`
        );
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        setPayments(data.payments || []);
      } catch (error) {
        console.error('Error fetching payments:', error);
        setPayments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [user]);

  if (loading) {
    return <div className="text-slate-600">Loading payments...</div>;
  }

  if (payments.length === 0) {
    return (
      <div className="bg-slate-50 rounded-lg p-8 text-center">
        <p className="text-slate-600">
          No payments found. Upload a file to get started.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-semibold text-slate-900 mb-4">
        Recent Payments
      </h3>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                Vendor
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                Date
              </th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <tr
                key={payment.id}
                className="border-b border-slate-200 hover:bg-slate-50"
              >
                <td className="px-6 py-4 text-sm text-slate-900">
                  {payment.vendor}
                </td>
                <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                  ${payment.amount.toFixed(2)}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {new Date(payment.date).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
