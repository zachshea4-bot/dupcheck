"use client"

import Link from "next/link"
import { useUser, UserButton } from "@clerk/nextjs"
import { useState } from "react"

export default function Navbar() {
  const { isSignedIn } = useUser()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <nav className="bg-[#1a1a1a] text-white py-4 sticky top-0 z-50">
      <div className="container-max flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold gradient-text">
          DupCheck
        </Link>

        <div className="hidden md:flex gap-8 items-center">
          <Link href="/" className="hover:text-[#FF8C00] transition">
            Home
          </Link>
          <a href="#upload" className="hover:text-[#FF8C00] transition">
            Try Free
          </a>
          {isSignedIn ? (
            <>
              <Link
                href="/dashboard"
                className="hover:text-[#FF8C00] transition"
              >
                Dashboard
              </Link>
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "w-10 h-10",
                  },
                }}
              />
            </>
          ) : (
            <>
              <Link href="/sign-in" className="hover:text-[#FF8C00] transition">
                Sign In
              </Link>
              <Link href="/sign-up" className="btn-primary text-sm py-2 px-4">
                Get Started
              </Link>
            </>
          )}
        </div>

        <button
          className="md:hidden text-white"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        {mobileOpen && (
          <div className="absolute top-full left-0 right-0 bg-[#1a1a1a] md:hidden py-4 px-4">
            <div className="flex flex-col gap-4">
              <Link href="/" className="hover:text-[#FF8C00]">
                Home
              </Link>
              <a href="#upload" className="hover:text-[#FF8C00]">
                Try Free
              </a>
              {isSignedIn ? (
                <Link href="/dashboard" className="hover:text-[#FF8C00]">
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link href="/sign-in" className="hover:text-[#FF8C00]">
                    Sign In
                  </Link>
                  <Link href="/sign-up" className="btn-primary text-sm py-2">
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
