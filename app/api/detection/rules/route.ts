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

    const { data: rules, error } = await supabase
      .from('user_rules')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ rules: rules || [] });
  } catch (error) {
    console.error('Rules fetch error:', error);
    return NextResponse.json({ rules: [] }, { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId');
    const { rule_name, rule_type, vendor_pattern, amount_tolerance, days_apart_threshold } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    const { data: rule, error } = await supabase
      .from('user_rules')
      .insert({
        user_id: userId,
        rule_name,
        rule_type,
        vendor_pattern,
        amount_tolerance,
        days_apart_threshold
      })
      .select();

    if (error) throw error;

    return NextResponse.json({ success: true, rule: rule[0] });
  } catch (error) {
    console.error('Rule creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create rule' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const ruleId = req.nextUrl.searchParams.get('ruleId');
    const { enabled } = await req.json();

    if (!ruleId) {
      return NextResponse.json({ error: 'Missing ruleId' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('user_rules')
      .update({ enabled })
      .eq('id', ruleId)
      .select();

    if (error) throw error;

    return NextResponse.json({ success: true, rule: data[0] });
  } catch (error) {
    console.error('Rule update error:', error);
    return NextResponse.json(
      { error: 'Failed to update rule' },
      { status: 500 }
    );
  }
}
