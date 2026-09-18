import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const days = parseInt(searchParams.get('days') || '90');

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const { data: flags, error } = await supabase
      .from('flags')
      .select('id, created_at')
      .eq('user_id', userId)
      .gte('created_at', cutoffDate.toISOString());

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!flags || flags.length === 0) {
      return NextResponse.json({ timeline: [] });
    }

    const groupedByDate: { [key: string]: number } = {};
    flags.forEach((flag: any) => {
      const date = new Date(flag.created_at).toISOString().split('T')[0];
      groupedByDate[date] = (groupedByDate[date] || 0) + 1;
    });

    const timeline = Object.entries(groupedByDate)
      .map(([date, count]) => ({
        date,
        count,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return NextResponse.json({ timeline });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal error' },
      { status: 500 }
    );
  }
}