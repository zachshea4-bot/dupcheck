"use client"

import Link from "next/link"
import { useUser } from "@clerk/nextjs"

export default function PricingPlans() {
  const { isSignedIn } = useUser()

  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Get started with duplicate detection",
      features: [
        "Upload up to 5 CSVs/month",
        "AI duplicate detection",
        "Results within 1 minute",
        "Email support",
        "No credit card required",
      ],
      cta: "Get Started",
      ctaLink: isSignedIn ? "/dashboard" : "/sign-up",
      highlighted: false,
    },
    {
      name: "Starter",
      price: "$99",
      period: "/month",
      description: "Automatic scanning for growing businesses",
      features: [
        "Everything in Free",
        "Unlimited monthly scans",
        "Auto-sync with QuickBooks",
        "Monthly email reports",
        "Duplicate alerts",
        "Priority email support",
      ],
      cta: "Start Free Trial",
      ctaLink: "/checkout?plan=starter",
      highlighted: false,
    },
    {
      name: "Professional",
      price: "$249",
      period: "/month",
      description: "For accounting teams and agencies",
      features: [
        "Everything in Starter",
        "Connect up to 5 accounts",
        "Weekly email reports",
        "Slack notifications",
        "API access",
        "Phone support",
        "Custom duplicate rules",
      ],
      cta: "Start Free Trial",
      ctaLink: "/checkout?plan=pro",
      highlighted: true,
    },
    {
      name: "Firm",
      price: "$499",
      period: "/month",
      description: "Enterprise duplicate detection",
      features: [
        "Everything in Professional",
        "Unlimited account connections",
        "Daily scans",
        "Real-time alerts",
        "Dedicated account manager",
        "Custom integrations",
        "SLA guarantee",
      ],
      cta: "Contact Sales",
      ctaLink: "mailto:sales@dupcheck.io",
      highlighted: false,
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {plans.map((plan) => (
        <div
          key={plan.name}
          className={`card flex flex-col transition-all ${
            plan.highlighted ? "ring-2 ring-[#FF8C00] transform scale-105" : ""
          }`}
        >
          {plan.highlighted && (
            <div className="bg-[#FF8C00] text-white px-3 py-1 rounded-full text-sm font-semibold inline-block w-fit mb-4">
              Most Popular
            </div>
          )}

          <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
          <p className="text-gray-600 text-sm mb-4">{plan.description}</p>

          <div className="mb-6">
            <span className="text-4xl font-bold">{plan.price}</span>
            <span className="text-gray-600 text-sm">{plan.period}</span>
          </div>

          <ul className="space-y-3 mb-8 flex-1">
            {plan.features.map((feature) => (
              <li key={feature} className="flex gap-3 text-sm">
                <svg
                  className="w-5 h-5 text-[#FF8C00] flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                {feature}
              </li>
            ))}
          </ul>

          <Link
            href={plan.ctaLink}
            className={`text-center font-semibold py-3 rounded-lg transition ${
              plan.highlighted
                ? "bg-[#FF8C00] text-white hover:bg-[#E67E00]"
                : "bg-gray-200 text-[#1a1a1a] hover:bg-gray-300"
            }`}
          >
            {plan.cta}
          </Link>
        </div>
      ))}
    </div>
  )
}
