import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: NextRequest) {
  // Verify the request comes from an authenticated user
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { firmEmail, firmId } = await req.json();

  if (!firmEmail || !firmId) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(firmEmail)) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
  }

  // Save contact_email to the firm — only if not already set (admin client bypasses RLS)
  const adminClient = createAdminClient();
  await adminClient
    .from('firms')
    .update({ contact_email: firmEmail })
    .eq('id', firmId)
    .is('contact_email', null);

  return NextResponse.json({ success: true });
}
