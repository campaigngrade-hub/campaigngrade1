import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ReviewCard from '@/components/ReviewCard';
import { StarRatingDisplay } from '@/components/StarRating';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import { Review } from '@/types';
import { getServiceLabel } from '@/lib/utils';
import { RATING_CATEGORIES } from '@/lib/constants';
import FirmPageClient from './FirmPageClient';

export const dynamic = 'force-dynamic';

export default async function FirmProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: firm } = await supabase
    .from('firms')
    .select('*')
    .eq('slug', slug)
    .single();

  if (!firm) notFound();

  const { data: reviews } = await supabase
    .from('reviews')
    .select('*, firm_responses(*)')
    .eq('firm_id', firm.id)
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  // Compute stats
  const published = reviews ?? [];
  const avgOverall = published.length
    ? published.reduce((s, r) => s + r.rating_overall, 0) / published.length
    : null;

  const categoryAvgs = RATING_CATEGORIES.filter((c) => c.key !== 'rating_overall').map((cat) => {
    const vals = published.map((r) => r[cat.key as keyof typeof r] as number | null).filter(Boolean) as number[];
    return {
      ...cat,
      avg: vals.length ? vals.reduce((s, v) => s + v, 0) / vals.length : null,
    };
  });

  const hireAgainPct = published.length
    ? Math.round((published.filter((r) => r.would_hire_again).length / published.length) * 100)
    : null;

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      {/* Firm header */}
      <Card className="mb-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h1 className="text-2xl font-bold text-navy">{firm.name}</h1>
              {firm.is_claimed && <Badge variant="info">Claimed</Badge>}
            </div>

            {firm.description && (
              <p className="text-gray-600 mb-4 max-w-2xl">{firm.description}</p>
            )}

            <div className="flex flex-wrap gap-2 mb-4">
              {firm.services?.map((s: string) => (
                <span key={s} className="inline-flex px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600">
                  {getServiceLabel(s)}
                </span>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
              {firm.website && (
                <a
                  href={firm.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-navy hover:underline"
                >
                  {firm.website.replace(/^https?:\/\//, '')}
                </a>
              )}
              {firm.party_focus && (
                <span className="capitalize">{firm.party_focus}</span>
              )}
              {firm.headquarters_state && (
                <span>Based in {firm.headquarters_state}</span>
              )}
              {firm.year_founded && (
                <span>Est. {firm.year_founded}</span>
              )}
            </div>
          </div>

          {firm.logo_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={firm.logo_url} alt={firm.name} className="w-16 h-16 object-contain rounded flex-shrink-0" />
          )}
        </div>

        {!firm.is_claimed && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Is this your firm?{' '}
              <Link href={`/claim/${firm.slug}`} className="text-navy font-medium hover:underline">
                Claim this profile
              </Link>{' '}
              to respond to reviews and update your listing.
            </p>
          </div>
        )}
      </Card>

      {/* Rating summary */}
      {published.length > 0 && (
        <Card className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Overall */}
            <div>
              <h2 className="font-semibold text-navy mb-4">Rating Summary</h2>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-5xl font-bold text-navy">{avgOverall?.toFixed(1)}</span>
                <div>
                  <StarRatingDisplay value={avgOverall} size="lg" showNumber={false} />
                  <p className="text-sm text-gray-500 mt-1">
                    {published.length} review{published.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              {hireAgainPct !== null && (
                <p className="text-sm text-gray-600">
                  <span className={hireAgainPct >= 50 ? 'text-green-700 font-semibold' : 'text-red-700 font-semibold'}>
                    {hireAgainPct}%
                  </span>{' '}
                  would hire again
                </p>
              )}
            </div>

            {/* Category breakdown */}
            <div>
              <h3 className="font-semibold text-navy mb-4">By Category</h3>
              <div className="space-y-2">
                {categoryAvgs.map((cat) => cat.avg != null && (
                  <div key={cat.key} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{cat.label}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-1.5">
                        <div
                          className="bg-amber-400 h-1.5 rounded-full"
                          style={{ width: `${(cat.avg / 5) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-700 w-6">
                        {cat.avg.toFixed(1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Reviews section */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-navy text-xl">
          Reviews ({published.length})
        </h2>
        <Link href="/reviews/new">
          <Button variant="secondary" size="sm">Write a Review</Button>
        </Link>
      </div>

      {published.length === 0 ? (
        <Card>
          <div className="text-center py-10">
            <p className="text-gray-500 mb-4">No reviews yet for this firm.</p>
            <Link href="/reviews/new">
              <Button variant="secondary">Be the first to review</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <FirmPageClient reviews={published as Review[]} firmId={firm.id} />
      )}
    </div>
  );
}
