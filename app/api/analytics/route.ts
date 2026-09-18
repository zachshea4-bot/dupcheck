import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20'
});

export async function GET(req: NextRequest) {
  try {
    // Fetch all subscriptions
    const subscriptions = await stripe.subscriptions.list({
      limit: 100,
      status: 'all'
    });

    // Fetch all customers
    const customers = await stripe.customers.list({
      limit: 100
    });

    // Calculate metrics
    const activeSubscriptions = subscriptions.data.filter(
      (sub) => sub.status === 'active'
    ).length;

    const cancelledSubscriptions = subscriptions.data.filter(
      (sub) => sub.status === 'canceled'
    ).length;

    // Calculate MRR (Monthly Recurring Revenue)
    let totalMRR = 0;
    subscriptions.data.forEach((sub) => {
      if (sub.status === 'active' && sub.items.data.length > 0) {
        const item = sub.items.data[0];
        if (item.price.recurring?.interval === 'month') {
          totalMRR += (item.price.unit_amount || 0) / 100;
        }
      }
    });

    // Group subscriptions by plan
    const planBreakdown: { [key: string]: number } = {};
    subscriptions.data.forEach((sub) => {
      if (sub.status === 'active' && sub.items.data.length > 0) {
        const priceId = sub.items.data[0].price.id;
        planBreakdown[priceId] = (planBreakdown[priceId] || 0) + 1;
      }
    });

    // Get product names for plan breakdown
    const priceDetails: { [key: string]: any } = {};
    for (const priceId of Object.keys(planBreakdown)) {
      const price = await stripe.prices.retrieve(priceId);
      if (price.product) {
        const product = await stripe.products.retrieve(price.product as string);
        priceDetails[priceId] = {
          name: product.name,
          price: (price.unit_amount || 0) / 100,
          count: planBreakdown[priceId]
        };
      }
    }

    // Calculate churn (cancelled in last 30 days)
    const thirtyDaysAgo = Math.floor(Date.now() / 1000) - 30 * 24 * 60 * 60;
    const recentChurn = subscriptions.data.filter(
      (sub) =>
        sub.status === 'canceled' &&
        sub.canceled_at &&
        sub.canceled_at > thirtyDaysAgo
    ).length;

    // Calculate LTV (assuming 12 month average subscription)
    const averageContractValue = activeSubscriptions > 0 ? totalMRR / activeSubscriptions : 0;
    const ltv = averageContractValue * 12;

    // Get customer acquisition over time (last 90 days)
    const ninetyDaysAgo = Math.floor(Date.now() / 1000) - 90 * 24 * 60 * 60;
    const recentCustomers = customers.data.filter(
      (customer) => customer.created > ninetyDaysAgo
    ).length;

    return NextResponse.json({
      metrics: {
        activeSubscriptions,
        totalMRR: Math.round(totalMRR * 100) / 100,
        cancelledSubscriptions,
        recentChurn,
        averageContractValue: Math.round(averageContractValue * 100) / 100,
        ltv: Math.round(ltv * 100) / 100,
        totalCustomers: customers.data.length,
        recentCustomers
      },
      planBreakdown: priceDetails,
      churnRate: activeSubscriptions > 0 ? ((recentChurn / (activeSubscriptions + recentChurn)) * 100).toFixed(1) : '0'
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
