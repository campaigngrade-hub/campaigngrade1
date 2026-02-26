import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function DELETE(req: NextRequest) {
  // Auth check
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Admin only
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (!profile || profile.role !== 'platform_admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { reviewId } = await req.json();
  if (!reviewId) return NextResponse.json({ error: 'Missing reviewId' }, { status: 400 });

  const adminClient = createAdminClient();

  // Hard delete — cascades to firm_responses and review_flags via FK ON DELETE CASCADE
  const { error } = await adminClient
    .from('reviews')
    .delete()
    .eq('id', reviewId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
