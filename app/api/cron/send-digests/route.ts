import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function GET(req: NextRequest) {
  const expectedAuth = \Bearer \\;
  if (req.headers.get('authorization') !== expectedAuth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { data: settings, error: settingsError } = await supabase
      .from('email_settings')
      .select('user_id, digest_frequency, digest_day_of_week, digest_time_of_day')
      .eq('digest_enabled', true);

    if (settingsError) throw settingsError;

    const now = new Date();
    const dayOfWeek = now.getDay();
    const hour = now.getHours();

    let digests_sent = 0;

    for (const setting of settings || []) {
      let shouldSend = false;

      if (setting.digest_frequency === 'daily') {
        shouldSend = hour >= 9 && hour < 10;
      } else if (setting.digest_frequency === 'weekly') {
        shouldSend =
          dayOfWeek === setting.digest_day_of_week &&
          hour >= (parseInt(setting.digest_time_of_day?.split(':')[0] || '9')) &&
          hour < (parseInt(setting.digest_time_of_day?.split(':')[0] || '9') + 1);
      }

      if (shouldSend) {
        const response = await fetch('https://dupcheck.vercel.app/api/email/digest/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: setting.user_id })
        });

        const data = await response.json();
        if (data.success) digests_sent++;
      }
    }

    return NextResponse.json({
      success: true,
      message: \Cron job completed: \ digests sent\,
      digests_sent
    });
  } catch (error) {
    console.error('Cron error:', error);
    return NextResponse.json(
      { error: 'Cron job failed' },
      { status: 500 }
    );
  }
}
