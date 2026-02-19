import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { StarRatingDisplay } from '@/components/StarRating';

export const dynamic = 'force-dynamic';

export default async function FirmDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  if (!profile || profile.role !== 'firm_admin') redirect('/dashboard');

  const { data: firm } = await supabase
    .from('firms')
    .select('*')
    .eq('claimed_by', user.id)
    .single();

  if (!firm) redirect('/dashboard');

  const { data: reviews } = await supabase
    .from('reviews')
    .select('*')
    .eq('firm_id', firm.id)
    .eq('status', 'published');

  const avg = reviews?.length
    ? reviews.reduce((s, r) => s + r.rating_overall, 0) / reviews.length
    : null;

  const { count: pendingFlags } = await supabase
    .from('review_flags')
    .select('id', { count: 'exact' })
    .eq('status', 'pending')
    .in('review_id', reviews?.map((r) => r.id) ?? []);

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-navy">{firm.name}</h1>
          <p className="text-gray-500 mt-1">Firm Dashboard</p>
        </div>
        <Link href={`/firms/${firm.slug}`}>
          <Button variant="outline" size="sm">View Public Profile</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Card>
          <p className="text-3xl font-bold text-navy mb-1">{reviews?.length ?? 0}</p>
          <p className="text-sm text-gray-500">Published Reviews</p>
        </Card>
        <Card>
          <p className="text-3xl font-bold text-navy mb-1">
            {avg ? avg.toFixed(1) : '—'}
          </p>
          <p className="text-sm text-gray-500">Average Rating</p>
          {avg && <StarRatingDisplay value={avg} size="sm" showNumber={false} />}
        </Card>
        <Card className={pendingFlags ? 'border-amber-400' : ''}>
          <p className={`text-3xl font-bold mb-1 ${pendingFlags ? 'text-amber-600' : 'text-navy'}`}>
            {pendingFlags ?? 0}
          </p>
          <p className="text-sm text-gray-500">Pending Flags</p>
        </Card>
      </div>

      <div className="flex gap-4">
        <Link href="/firm-dashboard/profile">
          <Button variant="outline">Edit Profile</Button>
        </Link>
        <Link href="/firm-dashboard/reviews">
          <Button variant="primary">Manage Reviews & Responses</Button>
        </Link>
      </div>
    </div>
  );
}
