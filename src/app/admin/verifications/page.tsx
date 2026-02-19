import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import AdminVerificationQueue from './AdminVerificationQueue';

export const dynamic = 'force-dynamic';

export default async function AdminVerificationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (!profile || profile.role !== 'platform_admin') redirect('/dashboard');

  const adminClient = createAdminClient();
  const { data: submissions } = await adminClient
    .from('verification_submissions')
    .select(`
      *,
      profiles!verification_submissions_profile_id_fkey(full_name, email, verification_status),
      committees(name, state, race_type, cycle_year)
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: true });

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold text-navy mb-2">Verification Queue</h1>
      <p className="text-gray-500 mb-6">
        {submissions?.length ?? 0} pending submission{(submissions?.length ?? 0) !== 1 ? 's' : ''}
      </p>
      <AdminVerificationQueue submissions={submissions ?? []} />
    </div>
  );
}
