import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import AllReviewsTable from './AllReviewsTable';

export const dynamic = 'force-dynamic';

export default async function AllReviewsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (!profile || profile.role !== 'platform_admin') redirect('/dashboard');

  const adminClient = createAdminClient();
  const { data: reviews } = await adminClient
    .from('reviews')
    .select(`
      id, status, rating_overall, review_text, cycle_year, race_type, created_at,
      firms(name, slug),
      profiles!reviews_reviewer_id_fkey(full_name, email)
    `)
    .order('created_at', { ascending: false });

  const counts = (reviews ?? []).reduce((acc, r) => {
    acc[r.status] = (acc[r.status] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold text-navy">All Reviews</h1>
        <Link href="/admin" className="text-sm text-gray-500 hover:text-navy">← Admin Dashboard</Link>
      </div>

      {/* Status summary */}
      <div className="flex flex-wrap gap-4 mb-6 text-sm text-gray-600">
        <span className="font-medium text-navy">{reviews?.length ?? 0} total</span>
        {Object.entries(counts).map(([status, count]) => (
          <span key={status}>
            <span className="capitalize">{status}</span>: <strong>{count}</strong>
          </span>
        ))}
      </div>

      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <AllReviewsTable reviews={(reviews ?? []) as any} />
    </div>
  );
}
