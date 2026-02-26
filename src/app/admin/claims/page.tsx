import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import AdminClaimsQueue from './AdminClaimsQueue';

export const dynamic = 'force-dynamic';

export default async function AdminClaimsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (!profile || profile.role !== 'platform_admin') redirect('/dashboard');

  const adminClient = createAdminClient();
  const { data: claims } = await adminClient
    .from('firm_claim_requests')
    .select(`
      *,
      firms(name, slug),
      profiles!firm_claim_requests_profile_id_fkey(full_name, email)
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: true });

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold text-navy mb-2">Firm Claim Requests</h1>
      <p className="text-gray-500 mb-6">
        {claims?.length ?? 0} pending claim{(claims?.length ?? 0) !== 1 ? 's' : ''}
      </p>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <AdminClaimsQueue claims={(claims ?? []) as any} />
    </div>
  );
}
