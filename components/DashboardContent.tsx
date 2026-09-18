"use client"

import { useEffect, useState } from "react"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import CsvUploader from "./CsvUploader"
import DuplicateResults from "./DuplicateResults"
import axios from "axios"

export default function DashboardContent() {
  const { user } = useUser()
  const router = useRouter()
  const [userData, setUserData] = useState<any>(null)
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchUserData()
  }, [user])

  const fetchUserData = async () => {
    try {
      const response = await axios.get("/api/user")
      setUserData(response.data)
    } catch (error) {
      console.error("Failed to fetch user data", error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container-max max-w-4xl">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2">
            Welcome back, {user?.firstName || "there"}!
          </h1>
          <p className="text-gray-600">
            Analyze your payments for duplicates or manage your subscription.
          </p>
        </div>

        {/* Plan Info */}
        {userData && (
          <div className="card mb-8 bg-gradient-to-r from-[#FF8C00] to-[#FFB84D] text-white">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm opacity-90">Current Plan</p>
                <p className="text-3xl font-bold capitalize">
                  {userData.plan}
                </p>
              </div>
              {userData.plan === "free" && (
                <button
                  onClick={() => router.push("/#pricing")}
                  className="bg-white text-[#FF8C00] px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
                >
                  Upgrade
                </button>
              )}
            </div>
          </div>
        )}

        {/* Upload Section */}
        {!results ? (
          <CsvUploader
            onResults={setResults}
            loading={loading}
            setLoading={setLoading}
          />
        ) : (
          <div>
            <button
              onClick={() => setResults(null)}
              className="mb-6 px-4 py-2 text-[#FF8C00] hover:bg-orange-50 rounded-lg transition"
            >
              ← New Analysis
            </button>
            <DuplicateResults results={results} />
          </div>
        )}
      </div>
    </div>
  )
}
