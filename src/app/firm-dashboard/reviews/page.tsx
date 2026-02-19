import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import FirmReviewsClient from './FirmReviewsClient';

export const dynamic = 'force-dynamic';

export default async function FirmReviewsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (!profile || profile.role !== 'firm_admin') redirect('/dashboard');

  const { data: firm } = await supabase.from('firms').select('id, name').eq('claimed_by', user.id).single();
  if (!firm) redirect('/firm-dashboard');

  const { data: reviews } = await supabase
    .from('reviews')
    .select('*, firm_responses(*)')
    .eq('firm_id', firm.id)
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold text-navy mb-2">Reviews for {firm.name}</h1>
      <p className="text-gray-500 mb-6">
        {reviews?.length ?? 0} published review{(reviews?.length ?? 0) !== 1 ? 's' : ''}
      </p>
      <FirmReviewsClient reviews={reviews ?? []} firmId={firm.id} />
    </div>
  );
}
