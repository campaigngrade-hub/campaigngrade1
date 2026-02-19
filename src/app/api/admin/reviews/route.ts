import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendReviewPublished, sendReviewRemoved } from '@/lib/email';

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (!profile || profile.role !== 'platform_admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { reviewId, action, notes } = await req.json();
  const adminClient = createAdminClient();

  const newStatus = action === 'publish' ? 'published' : 'removed';

  const { data: review, error: reviewError } = await adminClient
    .from('reviews')
    .update({ status: newStatus, admin_notes: notes })
    .eq('id', reviewId)
    .select('reviewer_id, firm_id, firms(name, slug)')
    .single();

  if (reviewError) return NextResponse.json({ error: reviewError.message }, { status: 500 });

  // Notify reviewer
  if (review?.reviewer_id) {
    const { data: reviewer } = await adminClient
      .from('profiles')
      .select('email, full_name')
      .eq('id', review.reviewer_id)
      .single();

    if (reviewer) {
      const firms = review.firms as unknown;
      const firmName = (Array.isArray(firms) ? firms[0] : firms as { name: string } | null)?.name ?? 'a firm';
      if (action === 'publish') {
        await sendReviewPublished(reviewer.email, reviewer.full_name, firmName);
      } else {
        await sendReviewRemoved(reviewer.email, reviewer.full_name, firmName, notes);
      }
    }
  }

  return NextResponse.json({ success: true });
}
