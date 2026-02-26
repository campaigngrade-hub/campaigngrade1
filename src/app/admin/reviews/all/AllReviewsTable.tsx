'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { StarRatingDisplay } from '@/components/StarRating';
import { formatDate } from '@/lib/utils';

interface Review {
  id: string;
  status: string;
  rating_overall: number;
  review_text: string;
  cycle_year: number;
  race_type: string;
  created_at: string;
  firms: { name: string; slug: string } | null;
  profiles: { full_name: string; email: string } | null;
}

const STATUS_BADGE: Record<string, 'success' | 'warning' | 'danger' | 'default'> = {
  published: 'success',
  pending: 'warning',
  flagged: 'danger',
  removed: 'danger',
};

export default function AllReviewsTable({ reviews: initial }: { reviews: Review[] }) {
  const router = useRouter();
  const [reviews, setReviews] = useState(initial);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  async function handleDelete(reviewId: string, firmName: string) {
    const confirmed = window.confirm(
      `Permanently delete this review of "${firmName}"? This cannot be undone.`
    );
    if (!confirmed) return;

    setDeleting(reviewId);
    const res = await fetch('/api/admin/reviews/delete', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reviewId }),
    });

    if (res.ok) {
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
    } else {
      const data = await res.json();
      alert('Delete failed: ' + (data.error ?? 'Unknown error'));
    }
    setDeleting(null);
  }

  const filtered = reviews.filter((r) => {
    const matchesStatus = filter === 'all' || r.status === filter;
    const matchesSearch =
      !search ||
      r.firms?.name.toLowerCase().includes(search.toLowerCase()) ||
      r.profiles?.full_name.toLowerCase().includes(search.toLowerCase()) ||
      r.review_text.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder="Search firm, reviewer, or text..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm flex-1 min-w-48 focus:outline-none focus:ring-2 focus:ring-navy"
        />
        <div className="flex gap-2">
          {['all', 'pending', 'published', 'flagged', 'removed'].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-2 rounded-md text-sm font-medium capitalize ${
                filter === s
                  ? 'bg-navy text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <p className="text-sm text-gray-500 mb-4">{filtered.length} review{filtered.length !== 1 ? 's' : ''}</p>

      {filtered.length === 0 ? (
        <Card>
          <div className="text-center py-10 text-gray-500">No reviews match your filters.</div>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((review) => (
            <Card key={review.id}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap mb-1">
                    <Link
                      href={`/firms/${review.firms?.slug ?? ''}`}
                      className="font-semibold text-navy hover:underline"
                    >
                      {review.firms?.name ?? 'Unknown Firm'}
                    </Link>
                    <Badge variant={STATUS_BADGE[review.status] ?? 'default'}>
                      {review.status}
                    </Badge>
                    <StarRatingDisplay value={review.rating_overall} size="sm" />
                  </div>
                  <p className="text-xs text-gray-500 mb-2">
                    By {review.profiles?.full_name ?? 'Unknown'} ({review.profiles?.email ?? ''})
                    · {review.cycle_year} · {review.race_type} · {formatDate(review.created_at)}
                  </p>
                  <p className="text-sm text-gray-700 line-clamp-2">{review.review_text}</p>
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  <Button
                    variant="danger"
                    size="sm"
                    disabled={deleting === review.id}
                    onClick={() => handleDelete(review.id, review.firms?.name ?? 'this firm')}
                  >
                    {deleting === review.id ? 'Deleting...' : 'Delete'}
                  </Button>
                  {review.status === 'pending' && (
                    <Link href="/admin/reviews">
                      <Button variant="outline" size="sm" className="w-full">Moderate</Button>
                    </Link>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
