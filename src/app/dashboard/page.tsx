import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { StarRatingDisplay } from '@/components/StarRating';
import { formatDate } from '@/lib/utils';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // If profile missing, create it on the fly then continue
  if (!profile) {
    const { createAdminClient } = await import('@/lib/supabase/admin');
    const admin = createAdminClient();
    await admin.from('profiles').upsert({
      id: user.id,
      email: user.email ?? '',
      full_name: user.user_metadata?.full_name ?? '',
      role: 'reviewer',
    }, { onConflict: 'id' });
    redirect('/dashboard');
  }

  const { data: reviews } = await supabase
    .from('reviews')
    .select('*, firms(name, slug)')
    .eq('reviewer_id', user.id)
    .order('created_at', { ascending: false });

  const statusBadge = (status: string) => {
    const map: Record<string, 'success' | 'warning' | 'danger' | 'default'> = {
      published: 'success',
      pending: 'warning',
      flagged: 'danger',
      removed: 'danger',
    };
    return <Badge variant={map[status] ?? 'default'}>{status}</Badge>;
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-navy">Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome, {profile.full_name}</p>
        </div>
        {profile.is_verified && (
          <Link href="/reviews/new">
            <Button variant="secondary">+ Rate a Firm</Button>
          </Link>
        )}
      </div>

      {/* Verification status */}
      <Card className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-navy text-lg">Verification Status</h2>
            <div className="flex items-center gap-2 mt-2">
              {profile.verification_status === 'approved' ? (
                <Badge variant="success">Verified Campaign Principal</Badge>
              ) : profile.verification_status === 'pending' ? (
                <>
                  <Badge variant="warning">Pending Review</Badge>
                  <span className="text-sm text-gray-500">
                    Your submission is under review. You&apos;ll be notified within 48 hours.
                  </span>
                </>
              ) : profile.verification_status === 'rejected' ? (
                <>
                  <Badge variant="danger">Verification Rejected</Badge>
                  {profile.verification_notes && (
                    <span className="text-sm text-gray-500">Reason: {profile.verification_notes}</span>
                  )}
                </>
              ) : (
                <Badge variant="default">Not Verified</Badge>
              )}
            </div>
          </div>
          {profile.verification_status !== 'approved' && (
            <Link href="/verify">
              <Button variant="outline" size="sm">
                {profile.verification_status === 'rejected' ? 'Resubmit' : 'Get Verified'}
              </Button>
            </Link>
          )}
        </div>
      </Card>

      {/* Reviews */}
      <div>
        <h2 className="font-semibold text-navy text-lg mb-4">
          Your Reviews ({reviews?.length ?? 0})
        </h2>

        {!reviews?.length ? (
          <Card>
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">You haven&apos;t submitted any reviews yet.</p>
              {profile.is_verified ? (
                <Link href="/reviews/new">
                  <Button variant="secondary">Submit Your First Review</Button>
                </Link>
              ) : (
                <p className="text-sm text-gray-400">
                  Complete verification to start reviewing firms.
                </p>
              )}
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <Card key={review.id}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <Link
                        href={`/firms/${(review.firms as { slug: string } | null)?.slug ?? ''}`}
                        className="font-semibold text-navy hover:underline"
                      >
                        {(review.firms as { name: string } | null)?.name ?? 'Unknown Firm'}
                      </Link>
                      {statusBadge(review.status)}
                    </div>
                    <StarRatingDisplay value={review.rating_overall} size="sm" />
                    <p className="text-sm text-gray-500 mt-1">
                      {review.cycle_year} · {formatDate(review.created_at)}
                    </p>
                  </div>
                  {(review.status === 'pending' || review.status === 'published') && (
                    <Link href={`/reviews/${review.id}/edit`}>
                      <Button variant="ghost" size="sm">Edit</Button>
                    </Link>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
