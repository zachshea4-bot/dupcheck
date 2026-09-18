import Stripe from "stripe"

// No apiVersion override: stripe-node pins the API version it was built
// against, and passing an older date fails type-checking in v22.
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function createCustomer(userId: string, email: string) {
  return await stripe.customers.create({
    metadata: { userId },
    email,
  })
}

export async function getCustomer(customerId: string) {
  return await stripe.customers.retrieve(customerId)
}

export async function createCheckoutSession(
  customerId: string,
  priceId: string
) {
  return await stripe.checkout.sessions.create({
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    mode: "subscription",
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
  })
}
