"use client"

import { useState } from "react"
import Link from "next/link"
import { useUser } from "@clerk/nextjs"

interface DuplicateResultsProps {
  results: any
}

export default function DuplicateResults({ results }: DuplicateResultsProps) {
  const { isSignedIn } = useUser()
  const [expanded, setExpanded] = useState<number | null>(null)

  const duplicates = results.duplicates || []
  const totalAmount = results.total_amount || 0
  const duplicatesFound = results.duplicates_found || 0

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-gradient-to-br from-[#FF8C00] to-[#E67E00] text-white">
          <h3 className="text-sm font-semibold opacity-90 mb-2">
            Duplicates Found
          </h3>
          <p className="text-4xl font-bold">{duplicatesFound}</p>
        </div>

        <div className="card bg-gradient-to-br from-red-500 to-red-600 text-white">
          <h3 className="text-sm font-semibold opacity-90 mb-2">
            Total Amount
          </h3>
          <p className="text-4xl font-bold">${totalAmount.toFixed(0)}</p>
        </div>

        <div className="card bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
          <h3 className="text-sm font-semibold opacity-90 mb-2">
            Average Per Duplicate
          </h3>
          <p className="text-4xl font-bold">
            ${(totalAmount / Math.max(duplicatesFound, 1)).toFixed(0)}
          </p>
        </div>
      </div>

      {/* Detailed List */}
      <div>
        <h3 className="font-semibold text-lg mb-4">Detailed Duplicates</h3>

        {duplicates.length === 0 ? (
          <div className="card text-center">
            <p className="text-gray-600">
              No duplicate payments detected in your CSV.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {duplicates.map((dup: any, idx: number) => (
              <div
                key={idx}
                className="card cursor-pointer"
                onClick={() => setExpanded(expanded === idx ? null : idx)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold">{dup.reason}</h4>
                    <p className="text-sm text-gray-600">
                      Amount: ${dup.total_amount?.toFixed(2)} • Confidence:{" "}
                      <span
                        className={
                          dup.confidence === "high"
                            ? "text-green-600"
                            : "text-yellow-600"
                        }
                      >
                        {dup.confidence}
                      </span>
                    </p>
                  </div>
                  <svg
                    className={`w-5 h-5 transition ${
                      expanded === idx ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 14l-7 7m0 0l-7-7m7 7V3"
                    />
                  </svg>
                </div>

                {expanded === idx && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h5 className="font-semibold mb-3">Duplicate Group:</h5>
                    <div className="space-y-2">
                      {dup.group?.map((item: any, i: number) => (
                        <div
                          key={i}
                          className="bg-gray-50 p-3 rounded text-sm"
                        >
                          <p>
                            <strong>Date:</strong> {item.date}
                          </p>
                          <p>
                            <strong>Vendor:</strong> {item.vendor}
                          </p>
                          <p>
                            <strong>Amount:</strong> ${item.amount}
                          </p>
                          {item.reference && (
                            <p>
                              <strong>Reference:</strong> {item.reference}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CTA */}
      {!isSignedIn ? (
        <div className="bg-[#FF8C00] text-white p-6 rounded-lg text-center">
          <h3 className="text-xl font-semibold mb-2">
            Want to monitor automatically?
          </h3>
          <p className="mb-4">
            Sign up for DupCheck Pro to scan your payments monthly and get
            alerts
          </p>
          <Link href="/sign-up" className="btn-secondary">
            Get Started
          </Link>
        </div>
      ) : (
        <div className="bg-[#FF8C00] text-white p-6 rounded-lg text-center">
          <h3 className="text-xl font-semibold mb-2">
            Enable automatic scanning
          </h3>
          <p className="mb-4">
            Upgrade to Pro to get monthly duplicate scans and email alerts
          </p>
          <Link href="/dashboard" className="btn-secondary">
            Go to Dashboard
          </Link>
        </div>
      )}
    </div>
  )
}
