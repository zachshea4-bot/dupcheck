"use client"

import { useState, useRef } from "react"
import { useUser } from "@clerk/nextjs"
import toast from "react-hot-toast"
import Link from "next/link"

interface CsvUploaderProps {
  onResults: (results: any) => void
  loading: boolean
  setLoading: (loading: boolean) => void
}

export default function CsvUploader({
  onResults,
  loading,
  setLoading,
}: CsvUploaderProps) {
  const { isSignedIn } = useUser()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)

  const handleFile = async (file: File) => {
    if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
      toast.error("Please upload a CSV file")
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File must be less than 10MB")
      return
    }

    setLoading(true)
    const toastId = toast.loading("Analyzing your CSV...")

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("filename", file.name)

      const response = await fetch("/api/analyze-csv", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || "Failed to analyze CSV")
        setLoading(false)
        return
      }

      toast.success(
        `Found ${data.duplicates_found} potential duplicates!`,
        { id: toastId }
      )
      onResults(data)
    } catch (error) {
      toast.error("Failed to analyze CSV")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = e.dataTransfer.files
    if (files && files[0]) {
      handleFile(files[0])
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files
    if (files && files[0]) {
      handleFile(files[0])
    }
  }

  return (
    <div className="w-full">
      <div
        className={`relative border-2 border-dashed rounded-lg p-12 text-center transition ${
          dragActive
            ? "border-[#FF8C00] bg-orange-50"
            : "border-gray-300 bg-white"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleChange}
          disabled={loading}
          className="hidden"
          id="csv-upload"
        />

        <div className="mb-4">
          <svg
            className="w-16 h-16 mx-auto text-[#FF8C00] mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
        </div>

        <h3 className="text-xl font-semibold mb-2">Upload Your CSV File</h3>
        <p className="text-gray-600 mb-6">
          Drag and drop your payment history CSV here, or click to browse
        </p>

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
          className="btn-primary mb-4"
        >
          {loading ? "Analyzing..." : "Select CSV File"}
        </button>

        <p className="text-sm text-gray-500">
          Required columns: Date, Vendor, Amount
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">CSV Format</h4>
          <code className="text-xs bg-blue-100 p-2 rounded block mb-2">
            Date,Vendor,Amount
            <br />
            1/15/2024,Acme Inc,5000
            <br />
            1/16/2024,Acme Inc,5000
          </code>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="font-semibold text-green-900 mb-2">Free to Use</h4>
          <p className="text-sm text-green-800">
            No signup required. Analyze up to 5 files with the free tier.
          </p>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg">
          <h4 className="font-semibold text-purple-900 mb-2">Premium</h4>
          <p className="text-sm text-purple-800">
            {isSignedIn ? (
              <Link
                href="/dashboard"
                className="text-[#FF8C00] font-semibold"
              >
                Upgrade for automatic monthly scanning
              </Link>
            ) : (
              <Link href="/sign-up" className="text-[#FF8C00] font-semibold">
                Sign up for automatic monthly scanning
              </Link>
            )}
          </p>
        </div>
      </div>
    </div>
  )
}
