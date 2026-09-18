'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

const PLANS = [
  {
    name: 'Starter',
    price: 49,
    priceId: 'price_starter', // Replace with your Stripe price ID
    description: 'For small businesses',
    features: [
      'Up to 100 transactions/month',
      'Duplicate detection',
      'Email alerts',
      'Basic dashboard',
      'Email support'
    ],
    cta: 'Start Free Trial'
  },
  {
    name: 'Professional',
    price: 149,
    priceId: 'price_professional',
    description: 'For growing companies',
    features: [
      'Up to 5,000 transactions/month',
      'AI-powered duplicate clustering',
      'Webhook integrations',
      'Advanced analytics',
      'Priority email support',
      'Custom rules engine'
    ],
    cta: 'Start Free Trial',
    highlighted: true
  },
  {
    name: 'Enterprise',
    price: null,
    priceId: null,
    description: 'For large organizations',
    features: [
      'Unlimited transactions',
      'Real-time sync APIs',
      'QuickBooks & Xero integration',
      'Dedicated account manager',
      '99.9% SLA',
      'Custom integrations'
    ],
    cta: 'Contact Sales'
  }
];

export default function PricingPage() {
  const { isSignedIn, user } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const handleCheckout = async (priceId: string | null, planName: string) => {
    if (!isSignedIn) {
      router.push('/sign-in');
      return;
    }

    if (!priceId) {
      // Enterprise contact
      window.location.href = 'mailto:sales@dupcheck.app?subject=Enterprise%20Inquiry';
      return;
    }

    setLoading(priceId);
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId,
          planName,
          userEmail: user?.emailAddresses[0]?.emailAddress,
          userId: user?.id
        })
      });

      const { url } = await response.json();
      if (url) window.location.href = url;
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to start checkout. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-slate-600">
            Save thousands by catching duplicate payments before they hurt your bottom line
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-lg shadow-lg overflow-hidden transition-transform hover:scale-105 ${
                plan.highlighted
                  ? 'md:scale-105 bg-blue-600 text-white'
                  : 'bg-white'
              }`}
            >
              {/* Card Header */}
              <div className={`p-8 ${plan.highlighted ? 'bg-blue-700' : 'bg-slate-50'}`}>
                <h3 className={`text-2xl font-bold mb-2 ${
                  plan.highlighted ? 'text-white' : 'text-slate-900'
                }`}>
                  {plan.name}
                </h3>
                <p className={`${plan.highlighted ? 'text-blue-100' : 'text-slate-600'}`}>
                  {plan.description}
                </p>
              </div>

              {/* Price */}
              <div className={`px-8 py-6 ${
                plan.highlighted ? 'bg-blue-600' : 'bg-white'
              }`}>
                {plan.price ? (
                  <div className="flex items-baseline">
                    <span className={`text-5xl font-bold ${
                      plan.highlighted ? 'text-white' : 'text-slate-900'
                    }`}>
                      ${plan.price}
                    </span>
                    <span className={`ml-2 ${
                      plan.highlighted ? 'text-blue-100' : 'text-slate-600'
                    }`}>
                      /month
                    </span>
                  </div>
                ) : (
                  <div className={`text-3xl font-bold ${
                    plan.highlighted ? 'text-white' : 'text-slate-900'
                  }`}>
                    Custom Pricing
                  </div>
                )}
              </div>

              {/* Features */}
              <div className={`px-8 py-6 flex-1 ${
                plan.highlighted ? 'bg-blue-600' : 'bg-white'
              }`}>
                <ul className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className={`mr-3 text-lg ${
                        plan.highlighted ? 'text-blue-200' : 'text-green-600'
                      }`}>
                        ✓
                      </span>
                      <span className={plan.highlighted ? 'text-blue-50' : 'text-slate-700'}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA Button */}
              <div className={`px-8 py-6 ${
                plan.highlighted ? 'bg-blue-700' : 'bg-slate-50'
              }`}>
                <button
                  onClick={() => handleCheckout(plan.priceId, plan.name)}
                  disabled={loading === plan.priceId}
                  className={`w-full py-3 px-4 rounded-lg font-semibold transition-all ${
                    plan.highlighted
                      ? 'bg-white text-blue-600 hover:bg-blue-50 disabled:opacity-50'
                      : 'bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50'
                  }`}
                >
                  {loading === plan.priceId ? 'Loading...' : plan.cta}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="mt-16 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {[
              {
                q: 'Do you offer a free trial?',
                a: 'Yes! All plans include a 14-day free trial. No credit card required for Starter & Professional.'
              },
              {
                q: 'Can I change plans anytime?',
                a: 'Absolutely. Upgrade or downgrade anytime. We'"'"'ll prorate billing if you switch mid-cycle.'
              },
              {
                q: 'What payment methods do you accept?',
                a: 'We accept all major credit cards via Stripe. Enterprise customers can use ACH transfers.'
              },
              {
                q: 'Is my data secure?',
                a: 'Yes. All data is encrypted end-to-end and stored in Supabase with SOC 2 compliance.'
              }
            ].map((faq, idx) => (
              <div key={idx} className="bg-white rounded-lg p-6 shadow">
                <h3 className="font-semibold text-slate-900 mb-2">{faq.q}</h3>
                <p className="text-slate-700">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
