import { auth } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("clerk_id", userId)
      .single()

    if (error && error.code === "PGRST116") {
      const { data: newUser, error: createError } = await supabase
        .from("users")
        .insert([
          {
            clerk_id: userId,
            plan: "free",
            subscription_status: "inactive",
            created_at: new Date(),
            updated_at: new Date(),
          },
        ])
        .select()
        .single()

      if (createError) {
        return NextResponse.json(
          { error: "Failed to create user" },
          { status: 500 }
        )
      }

      return NextResponse.json(newUser)
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("User fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    )
  }
}
