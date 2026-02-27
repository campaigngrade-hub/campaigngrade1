'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Textarea from '@/components/ui/Textarea';
import Badge from '@/components/ui/Badge';
import { StarRatingDisplay } from '@/components/StarRating';
import { formatDate, getContextLine } from '@/lib/utils';

interface AdminReview {
  id: string;
  reviewer_id: string | null;
  rating_overall: number;
  review_text: string;
  pros: string | null;
  cons: string | null;
  cycle_year: number;
  race_type: string;
  region: string | null;
  budget_tier: string | null;
  would_hire_again: boolean;
  invoice_path: string | null;
  created_at: string;
  firms: { name: string; slug: string } | null;
  profiles: { full_name: string; email: string; is_verified: boolean; verification_status: string } | null;
}

export default function AdminReviewQueue({ reviews }: { reviews: AdminReview[] }) {
  const router = useRouter();
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [processing, setProcessing] = useState<string | null>(null);

  async function viewDocument(invoicePath: string) {
    const res = await fetch(`/api/admin/verifications/signed-url?file=${encodeURIComponent(invoicePath)}`);
    const data = await res.json();
    if (data.url) window.open(data.url, '_blank');
    else alert('Could not load document.');
  }

  async function handleAction(reviewId: string, action: 'publish' | 'remove') {
    setProcessing(reviewId);
    const res = await fetch('/api/admin/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reviewId, action, notes: notes[reviewId] ?? '' }),
    });
    if (res.ok) router.refresh();
    else alert('Error processing review');
    setProcessing(null);
  }

  if (!reviews.length) {
    return (
      <Card>
        <div className="text-center py-10 text-gray-500">No pending reviews.</div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <Card key={review.id}>
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="font-semibold text-navy">
                Review of {review.firms?.name ?? 'Unknown Firm'}
              </p>
              <p className="text-sm text-gray-500">
                By {review.profiles?.full_name} · {formatDate(review.created_at)}
              </p>
              <div className="flex gap-2 mt-1">
                {review.profiles?.is_verified ? (
                  <Badge variant="success">Verified Reviewer</Badge>
                ) : (
                  <Badge variant="warning">Unverified Reviewer</Badge>
                )}
              </div>
            </div>
            <StarRatingDisplay value={review.rating_overall} />
          </div>

          <p className="text-xs text-gray-400 mb-2">{getContextLine(review)}</p>

          <div className="bg-gray-50 rounded-md p-3 mb-3">
            <p className="text-sm text-gray-800">{review.review_text}</p>
            {review.pros && <p className="text-sm text-green-700 mt-2"><strong>Pros:</strong> {review.pros}</p>}
            {review.cons && <p className="text-sm text-red-700 mt-1"><strong>Cons:</strong> {review.cons}</p>}
          </div>

          {review.invoice_path && (
            <div className="mb-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => viewDocument(review.invoice_path!)}
              >
                📄 View Verification Document
              </Button>
            </div>
          )}

          <Textarea
            label="Admin notes"
            placeholder="Add notes about this moderation decision (sent to reviewer if removed)..."
            value={notes[review.id] ?? ''}
            onChange={(e) => setNotes((prev) => ({ ...prev, [review.id]: e.target.value }))}
            rows={2}
          />

          <div className="flex gap-3 mt-3">
            <Button
              variant="danger"
              size="sm"
              onClick={() => handleAction(review.id, 'remove')}
              disabled={processing === review.id}
            >
              Reject
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleAction(review.id, 'publish')}
              disabled={processing === review.id}
            >
              {processing === review.id ? 'Processing...' : 'Publish'}
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
