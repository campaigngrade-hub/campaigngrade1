'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { StarRatingDisplay } from '@/components/StarRating';
import { formatDate } from '@/lib/utils';

interface Flag {
  id: string;
  review_id: string;
  reason: string;
  details: string | null;
  created_at: string;
  profiles: { full_name: string; email: string } | null;
  reviews: {
    id: string;
    rating_overall: number;
    review_text: string;
    created_at: string;
    firms: { name: string; slug: string } | null;
  } | null;
}

export default function AdminFlagQueue({ flags }: { flags: Flag[] }) {
  const router = useRouter();
  const [processing, setProcessing] = useState<string | null>(null);

  async function handleAction(flagId: string, reviewId: string, action: 'upheld' | 'dismissed') {
    setProcessing(flagId);
    const res = await fetch('/api/admin/flags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ flagId, reviewId, action }),
    });
    if (res.ok) router.refresh();
    else alert('Error processing flag');
    setProcessing(null);
  }

  if (!flags.length) {
    return (
      <Card>
        <div className="text-center py-10 text-gray-500">No pending flags.</div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {flags.map((flag) => (
        <Card key={flag.id}>
          <div className="mb-3">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="warning">{flag.reason.replace(/_/g, ' ')}</Badge>
              <span className="text-xs text-gray-400">
                Flagged by {flag.profiles?.full_name} · {formatDate(flag.created_at)}
              </span>
            </div>
            {flag.details && (
              <p className="text-sm text-gray-600 mt-1">Details: {flag.details}</p>
            )}
          </div>

          {flag.reviews && (
            <div className="bg-gray-50 rounded-md p-3 mb-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-navy">
                  Review of {flag.reviews.firms?.name}
                </span>
                <StarRatingDisplay value={flag.reviews.rating_overall} size="sm" />
              </div>
              <p className="text-sm text-gray-700">{flag.reviews.review_text}</p>
              <p className="text-xs text-gray-400 mt-2">{formatDate(flag.reviews.created_at)}</p>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAction(flag.id, flag.review_id, 'dismissed')}
              disabled={processing === flag.id}
            >
              Dismiss (keep review)
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => handleAction(flag.id, flag.review_id, 'upheld')}
              disabled={processing === flag.id}
            >
              {processing === flag.id ? 'Processing...' : 'Uphold (remove review)'}
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
