import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendVerificationApproved, sendVerificationRejected } from '@/lib/email';

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (!profile || profile.role !== 'platform_admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { submissionId, profileId, action, notes } = await req.json();
  const adminClient = createAdminClient();

  // Update submission status
  const { error: subError } = await adminClient
    .from('verification_submissions')
    .update({ status: action, reviewed_by: user.id, reviewed_at: new Date().toISOString(), admin_notes: notes })
    .eq('id', submissionId);

  if (subError) return NextResponse.json({ error: subError.message }, { status: 500 });

  // Update profile
  const { data: reviewerProfile, error: profileError } = await adminClient
    .from('profiles')
    .update({
      verification_status: action,
      is_verified: action === 'approved',
      verification_notes: notes || null,
    })
    .eq('id', profileId)
    .select('email, full_name')
    .single();

  if (profileError) return NextResponse.json({ error: profileError.message }, { status: 500 });

  // Send email
  if (reviewerProfile) {
    if (action === 'approved') {
      await sendVerificationApproved(reviewerProfile.email, reviewerProfile.full_name);
    } else {
      await sendVerificationRejected(reviewerProfile.email, reviewerProfile.full_name, notes);
    }
  }

  return NextResponse.json({ success: true });
}
