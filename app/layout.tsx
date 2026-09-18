import { Analytics } from '@vercel/analytics/react';
import type { Metadata } from "next"
import { ClerkProvider } from "@clerk/nextjs"
import { Toaster } from "react-hot-toast"
import "./globals.css"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"

export const metadata: Metadata = {
  title: "DupCheck - Duplicate Payment Detection",
  description: "Find and prevent duplicate payments in your business. AI-powered detection.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}>
        <ClerkProvider appearance={{ variables: { colorPrimary: "#ff8c00" } }}>
          <Navbar />
          <main className="min-h-screen">
            {children}
          </main>
          <Footer />
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "#1a1a1a",
                color: "#fff",
              },
            }}
          />
        </ClerkProvider>
      </body>
    </html>
  )
}
