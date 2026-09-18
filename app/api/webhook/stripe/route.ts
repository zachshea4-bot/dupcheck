import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@supabase/supabase-js"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export async function POST(request: NextRequest) {
  const sig = request.headers.get("stripe-signature")!
  const body = await request.text()

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret)
  } catch (error: any) {
    console.error("Webhook signature verification failed:", error.message)
    return NextResponse.json({ received: false }, { status: 400 })
  }

  try {
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        const customer = await stripe.customers.retrieve(customerId)
        const userId = (customer as any).metadata?.userId

        if (userId) {
          const plan =
            subscription.items.data[0]?.price?.metadata?.plan || "starter"
          // In current Stripe API versions the billing period lives on the
          // subscription item, not the subscription itself.
          const periodEnd = subscription.items.data[0]?.current_period_end

          await supabase
            .from("users")
            .update({
              stripe_customer_id: customerId,
              stripe_subscription_id: subscription.id,
              plan: plan,
              subscription_status: subscription.status,
              current_period_end: periodEnd ? new Date(periodEnd * 1000) : null,
              updated_at: new Date(),
            })
            .eq("clerk_id", userId)
        }
        break
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        const customer = await stripe.customers.retrieve(customerId)
        const userId = (customer as any).metadata?.userId

        if (userId) {
          await supabase
            .from("users")
            .update({
              plan: "free",
              subscription_status: "cancelled",
              updated_at: new Date(),
            })
            .eq("clerk_id", userId)
        }
        break
      }
    }
  } catch (error) {
    console.error("Error processing webhook:", error)
  }

  return NextResponse.json({ received: true })
}
