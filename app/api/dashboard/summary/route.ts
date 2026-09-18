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

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

    const { data: flags, error } = await supabase
      .from('flags')
      .select('amount, created_at')
      .eq('user_id', userId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!flags || flags.length === 0) {
      return NextResponse.json({
        total_at_risk: 0,
        duplicate_count: 0,
        date_range_start: null,
        date_range_end: null,
        severity: 'green',
      });
    }

    const total_at_risk = flags.reduce((sum: number, flag: any) => sum + (flag.amount || 0), 0);
    const duplicate_count = flags.length;
    const dates = flags.map((f: any) => new Date(f.created_at).getTime()).sort((a: number, b: number) => a - b);
    const date_range_start = new Date(dates[0]).toISOString();
    const date_range_end = new Date(dates[dates.length - 1]).toISOString();

    let severity = 'green';
    if (total_at_risk > 10000) severity = 'red';
    else if (total_at_risk > 1000) severity = 'yellow';

    return NextResponse.json({
      total_at_risk,
      duplicate_count,
      date_range_start,
      date_range_end,
      severity,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal error' },
      { status: 500 }
    );
  }
}
