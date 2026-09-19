import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function PATCH(req: NextRequest) {
  try {
    const { issueIds, action, notes } = await req.json();
    const userId = req.nextUrl.searchParams.get('userId');

    if (!issueIds?.length || !action || !userId) {
      return NextResponse.json(
        { error: 'Missing issueIds, action, or userId' },
        { status: 400 }
      );
    }

    // Update all issues
    const { data: updated, error: updateError } = await supabase
      .from('duplicate_issues')
      .update({
        status: action === 'approve' ? 'approved' : 'rejected',
        workflow_status: 'submitted',
        reviewed_by: userId,
        reviewed_at: new Date().toISOString(),
        reviewer_notes: notes || null
      })
      .in('id', issueIds)
      .select();

    if (updateError) throw updateError;

    // Log approval history for each
    const historyRecords = issueIds.map((issueId: string) => ({
      id: crypto.randomUUID(),
      duplicate_issue_id: issueId,
      user_id: userId,
      action: action === 'approve' ? 'approve' : 'reject',
      notes: notes || null,
      timestamp: new Date().toISOString()
    }));

    const { error: historyError } = await supabase
      .from('approval_history')
      .insert(historyRecords);

    if (historyError) throw historyError;

    return NextResponse.json({
      success: true,
      updated: updated?.length || 0,
      message: \\ issues \ed\
    });
  } catch (error) {
    console.error('Batch action error:', error);
    return NextResponse.json(
      { error: 'Failed to process batch action' },
      { status: 500 }
    );
  }
}
