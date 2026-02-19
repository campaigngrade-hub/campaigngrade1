import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import AdminReviewQueue from './AdminReviewQueue';

export const dynamic = 'force-dynamic';

export default async function AdminReviewsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (!profile || profile.role !== 'platform_admin') redirect('/dashboard');

  const adminClient = createAdminClient();
  const { data: reviews } = await adminClient
    .from('reviews')
    .select(`
      *,
      firms(name, slug),
      profiles!reviews_reviewer_id_fkey(full_name, email, is_verified, verification_status)
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: true });

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold text-navy mb-2">Review Moderation Queue</h1>
      <p className="text-gray-500 mb-6">
        {reviews?.length ?? 0} pending review{(reviews?.length ?? 0) !== 1 ? 's' : ''}
      </p>
      <AdminReviewQueue reviews={reviews ?? []} />
    </div>
  );
}
