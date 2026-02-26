import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { StarRatingDisplay } from '@/components/StarRating';
import { formatDate } from '@/lib/utils';
import type { Profile } from '@/types';

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ review?: string }>;
}) {
  const params = await searchParams;
  const reviewSubmitted = params.review === 'submitted';
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  let { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // If profile missing, create it via admin client (bypasses RLS)
  if (!profile) {
    const admin = createAdminClient();
    await admin.from('profiles').upsert({
      id: user.id,
      email: user.email ?? '',
      full_name: user.user_metadata?.full_name ?? '',
      role: 'reviewer',
    }, { onConflict: 'id' });
    const { data: newProfile } = await admin
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    if (!newProfile) redirect('/login');
    profile = newProfile;
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

  const p = profile as Profile;

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      {reviewSubmitted && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-800 rounded-md px-4 py-3 text-sm flex items-start gap-2">
          <span className="text-lg leading-none">✓</span>
          <div>
            <strong>Review submitted successfully!</strong> Your review is now in our moderation queue
            and will be published within 24–48 hours if it meets our content guidelines.
            The firm has been notified and can claim their profile.
          </div>
        </div>
      )}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-navy">Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome, {p.full_name}</p>
        </div>
        {p.is_verified && (
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
              {p.verification_status === 'approved' ? (
                <Badge variant="success">Verified Campaign Principal</Badge>
              ) : p.verification_status === 'pending' ? (
                <>
                  <Badge variant="warning">Pending Review</Badge>
                  <span className="text-sm text-gray-500">
                    Your submission is under review. You&apos;ll be notified within 48 hours.
                  </span>
                </>
              ) : p.verification_status === 'rejected' ? (
                <>
                  <Badge variant="danger">Verification Rejected</Badge>
                  {p.verification_notes && (
                    <span className="text-sm text-gray-500">Reason: {p.verification_notes}</span>
                  )}
                </>
              ) : (
                <Badge variant="default">Not Verified</Badge>
              )}
            </div>
          </div>
          {p.verification_status !== 'approved' && (
            <Link href="/verify">
              <Button variant="outline" size="sm">
                {p.verification_status === 'rejected' ? 'Resubmit' : 'Get Verified'}
              </Button>
            </Link>
          )}
        </div>
      </Card>

      {/* Claim a firm CTA — only for non-firm admins */}
      {p.role !== 'firm_admin' && p.role !== 'platform_admin' && (
        <Card className="mb-6 border-blue-200 bg-blue-50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-navy text-lg">Are you a consulting firm?</h2>
              <p className="text-sm text-gray-600 mt-1">
                Claim your firm profile to respond to reviews and manage your listing.
              </p>
            </div>
            <Link href="/firms">
              <Button variant="outline" size="sm">Find &amp; Claim Your Firm</Button>
            </Link>
          </div>
        </Card>
      )}

      {/* Reviews */}
      <div>
        <h2 className="font-semibold text-navy text-lg mb-4">
          Your Reviews ({reviews?.length ?? 0})
        </h2>

        {!reviews?.length ? (
          <Card>
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">You haven&apos;t submitted any reviews yet.</p>
              {p.is_verified ? (
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
