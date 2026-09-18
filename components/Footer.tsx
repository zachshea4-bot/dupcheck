"use client"

import Link from "next/link"

export default function Footer() {
  return (
    <footer className="bg-[#1a1a1a] text-gray-400 py-12 border-t border-gray-700">
      <div className="container-max">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-white font-bold mb-4">DupCheck</h3>
            <p className="text-sm">
              AI-powered duplicate payment detection for businesses.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-[#FF8C00]">
                  Features
                </Link>
              </li>
              <li>
                <Link href="#upload" className="hover:text-[#FF8C00]">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-[#FF8C00]">
                  About
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-[#FF8C00]">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 pt-8 text-center text-sm">
          <p>&copy; 2024 DupCheck. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
