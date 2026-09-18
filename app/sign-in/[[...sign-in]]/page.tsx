import { SignIn } from "@clerk/nextjs"

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="w-full max-w-md">
        <SignIn
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "bg-white rounded-lg shadow-lg",
              formButtonPrimary: "bg-[#FF8C00] hover:bg-[#E67E00]",
              footer: "hidden",
            },
          }}
        />
        <p className="text-center text-gray-600 mt-6">
          Don&apos;t have an account?{" "}
          <a href="/sign-up" className="text-[#FF8C00] font-semibold hover:underline">
            Sign up
          </a>
        </p>
      </div>
    </div>
  )
}
