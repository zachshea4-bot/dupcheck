import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId');
    const limit = req.nextUrl.searchParams.get('limit') || '10';

    if (!userId) {
      return NextResponse.json(
        { payments: [], error: 'No userId provided' },
        { status: 200 }
      );
    }

    // TODO: Query Supabase when payments table is populated
    // For now, return empty array
    return NextResponse.json({
      payments: [],
      message: 'No payments yet. Upload a CSV to get started.'
    });
  } catch (error) {
    console.error('Payments API error:', error);
    return NextResponse.json(
      { payments: [], error: 'Failed to fetch payments' },
      { status: 200 }
    );
  }
}
