'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { createClient } from '@/lib/supabase/client';
import { useProfile } from '@/hooks/useProfile';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Textarea from '@/components/ui/Textarea';
import ReviewCard from '@/components/ReviewCard';
import { Review } from '@/types';

const responseSchema = z.object({
  response_text: z.string().min(10, 'Response must be at least 10 characters').max(2000),
});

type ResponseForm = z.infer<typeof responseSchema>;

export default function FirmReviewsClient({
  reviews,
  firmId,
}: {
  reviews: (Review & { firm_responses?: { id: string; response_text: string; status: string } | null })[];
  firmId: string;
}) {
  const router = useRouter();
  const { profile } = useProfile();
  const [respondingTo, setRespondingTo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<ResponseForm>({
    resolver: zodResolver(responseSchema),
  });

  async function onSubmitResponse(data: ResponseForm) {
    if (!profile || !respondingTo) return;
    setError(null);
    const supabase = createClient();
    const { error: insertError } = await supabase.from('firm_responses').insert({
      review_id: respondingTo,
      firm_id: firmId,
      responder_id: profile.id,
      response_text: data.response_text,
    });

    if (insertError) { setError(insertError.message); return; }
    reset();
    setRespondingTo(null);
    router.refresh();
  }

  if (!reviews.length) {
    return (
      <Card>
        <div className="text-center py-10 text-gray-500">
          No published reviews yet.
        </div>
      </Card>
    );
  }

  return (
    <div>
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-md px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {reviews.map((review) => {
        const response = Array.isArray(review.firm_responses) ? review.firm_responses[0] : review.firm_responses;
        const hasResponse = response && response.status === 'published';

        return (
          <div key={review.id} className="mb-4">
            <ReviewCard review={review} />

            {!hasResponse && (
              <div className="mt-1 mb-4 ml-4">
                {respondingTo === review.id ? (
                  <Card className="bg-blue-50 border-blue-200">
                    <h4 className="font-semibold text-navy mb-3 text-sm">Your Response</h4>
                    <form onSubmit={handleSubmit(onSubmitResponse)} className="space-y-3">
                      <Textarea
                        placeholder="Write a professional response to this review... (max 2000 characters)"
                        error={errors.response_text?.message}
                        rows={4}
                        {...register('response_text')}
                      />
                      <p className="text-xs text-gray-500">
                        Your response will be published alongside the review. You can respond once per review.
                        Keep it professional.
                      </p>
                      <div className="flex gap-2">
                        <Button type="button" variant="ghost" size="sm" onClick={() => { setRespondingTo(null); reset(); }}>
                          Cancel
                        </Button>
                        <Button type="submit" size="sm" disabled={isSubmitting}>
                          {isSubmitting ? 'Publishing...' : 'Publish Response'}
                        </Button>
                      </div>
                    </form>
                  </Card>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setRespondingTo(review.id)}
                  >
                    Respond to this review
                  </Button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
