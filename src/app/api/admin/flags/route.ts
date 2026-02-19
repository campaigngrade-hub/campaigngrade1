import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendFlagResolution } from '@/lib/email';

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (!profile || profile.role !== 'platform_admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { flagId, action, reviewId } = await req.json(); // action: 'upheld' | 'dismissed'
  const adminClient = createAdminClient();

  // Update flag status
  await adminClient
    .from('review_flags')
    .update({ status: action, resolved_by: user.id, resolved_at: new Date().toISOString() })
    .eq('id', flagId);

  // If upheld, remove the review
  if (action === 'upheld') {
    await adminClient.from('reviews').update({ status: 'removed' }).eq('id', reviewId);
  }

  // Notify flagger
  const { data: flag } = await adminClient
    .from('review_flags')
    .select('flagged_by, profiles!review_flags_flagged_by_fkey(email, full_name)')
    .eq('id', flagId)
    .single();

  if (flag?.flagged_by) {
    const profiles = flag.profiles as unknown;
    const flaggerProfile = (Array.isArray(profiles) ? profiles[0] : profiles) as { email: string; full_name: string } | null;
    if (flaggerProfile) {
      await sendFlagResolution(flaggerProfile.email, flaggerProfile.full_name, action as 'upheld' | 'dismissed');
    }
  }

  return NextResponse.json({ success: true });
}
