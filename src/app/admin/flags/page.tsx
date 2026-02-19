import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import AdminFlagQueue from './AdminFlagQueue';

export const dynamic = 'force-dynamic';

export default async function AdminFlagsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (!profile || profile.role !== 'platform_admin') redirect('/dashboard');

  const adminClient = createAdminClient();
  const { data: flags } = await adminClient
    .from('review_flags')
    .select(`
      *,
      reviews(*, firms(name, slug)),
      profiles!review_flags_flagged_by_fkey(full_name, email)
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: true });

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold text-navy mb-2">Flag Queue</h1>
      <p className="text-gray-500 mb-6">
        {flags?.length ?? 0} pending flag{(flags?.length ?? 0) !== 1 ? 's' : ''}
      </p>
      <AdminFlagQueue flags={flags ?? []} />
    </div>
  );
}
