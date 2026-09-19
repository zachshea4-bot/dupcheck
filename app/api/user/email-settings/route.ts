import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    const { data: settings, error } = await supabase
      .from('email_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    return NextResponse.json({
      settings: settings || {
        digest_enabled: true,
        digest_frequency: 'weekly',
        digest_day_of_week: 1,
        digest_time_of_day: '09:00:00'
      }
    });
  } catch (error) {
    console.error('Settings fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId');
    const { digest_enabled, digest_frequency, digest_day_of_week, digest_time_of_day } =
      await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    const { data: settings, error } = await supabase
      .from('email_settings')
      .upsert(
        {
          user_id: userId,
          digest_enabled,
          digest_frequency,
          digest_day_of_week,
digest_time_of_day,
          updated_at: new Date().toISOString()
        },
        { onConflict: 'user_id' }
      )
      .select();

    if (error) throw error;

    return NextResponse.json({ success: true, settings: settings?.[0] });
  } catch (error) {
    console.error('Settings update error:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
