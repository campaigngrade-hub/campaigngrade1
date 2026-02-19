'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import ReviewCard from '@/components/ReviewCard';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import { Review } from '@/types';
import { createClient } from '@/lib/supabase/client';
import { useProfile } from '@/hooks/useProfile';
import { FLAG_REASONS } from '@/lib/constants';

const flagSchema = z.object({
  reason: z.string().min(1, 'Please select a reason'),
  details: z.string().optional(),
});

type FlagFormData = z.infer<typeof flagSchema>;

export default function FirmPageClient({ reviews, firmId }: { reviews: Review[]; firmId: string }) {
  const { profile } = useProfile();
  const [sort, setSort] = useState('newest');
  const [flaggingReviewId, setFlaggingReviewId] = useState<string | null>(null);
  const [flagSuccess, setFlagSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<FlagFormData>({
    resolver: zodResolver(flagSchema),
  });

  const sorted = [...reviews].sort((a, b) => {
    switch (sort) {
      case 'oldest': return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case 'highest': return b.rating_overall - a.rating_overall;
      case 'lowest': return a.rating_overall - b.rating_overall;
      default: return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  async function onFlag(data: FlagFormData) {
    if (!profile || !flaggingReviewId) return;
    const supabase = createClient();
    await supabase.from('review_flags').insert({
      review_id: flaggingReviewId,
      flagged_by: profile.id,
      reason: data.reason,
      details: data.details ?? null,
    });
    setFlagSuccess(true);
    setFlaggingReviewId(null);
    reset();
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Select
          id="sort"
          options={[
            { value: 'newest', label: 'Newest first' },
            { value: 'oldest', label: 'Oldest first' },
            { value: 'highest', label: 'Highest rated' },
            { value: 'lowest', label: 'Lowest rated' },
          ]}
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        />
      </div>

      {flagSuccess && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 rounded-md px-4 py-3 text-sm">
          Flag submitted. Our team will review it shortly.
        </div>
      )}

      {sorted.map((review) => (
        <div key={review.id}>
          <ReviewCard
            review={review}
            showFlagButton={!!profile && profile.role !== 'platform_admin'}
            onFlag={() => {
              setFlaggingReviewId(review.id);
              setFlagSuccess(false);
            }}
          />

          {flaggingReviewId === review.id && (
            <div className="mb-4 bg-gray-50 border border-gray-200 rounded-md p-4">
              <h4 className="font-semibold text-gray-700 mb-3 text-sm">Flag this review</h4>
              <form onSubmit={handleSubmit(onFlag)} className="space-y-3">
                <Select
                  id="reason"
                  options={FLAG_REASONS as unknown as { value: string; label: string }[]}
                  placeholder="Select reason..."
                  error={errors.reason?.message}
                  {...register('reason')}
                />
                <Textarea
                  id="details"
                  placeholder="Additional details (optional)"
                  rows={2}
                  {...register('details')}
                />
                <div className="flex gap-2">
                  <Button type="button" variant="ghost" size="sm" onClick={() => setFlaggingReviewId(null)}>
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" variant="danger" disabled={isSubmitting}>
                    {isSubmitting ? 'Submitting...' : 'Submit Flag'}
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
