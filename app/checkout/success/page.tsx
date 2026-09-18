import { Suspense } from 'react';
import CheckoutContent from './checkout-content';

export default function CheckoutSuccess() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="text-center"><div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div><p className="mt-4 text-slate-600">Processing...</p></div></div>}>
      <CheckoutContent />
    </Suspense>
  );
}
