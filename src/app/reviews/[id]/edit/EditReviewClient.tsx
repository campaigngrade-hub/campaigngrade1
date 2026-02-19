'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { createClient } from '@/lib/supabase/client';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import Card from '@/components/ui/Card';
import { StarRatingInput } from '@/components/StarRating';
import { BUDGET_TIERS, RACE_TYPES, REGIONS, RACE_OUTCOMES, SERVICE_CATEGORIES } from '@/lib/constants';
import { Review } from '@/types';

const schema = z.object({
  rating_overall: z.number().int().min(1).max(5),
  rating_communication: z.number().int().min(1).max(5).optional(),
  rating_budget_transparency: z.number().int().min(1).max(5).optional(),
  rating_results_vs_projections: z.number().int().min(1).max(5).optional(),
  rating_responsiveness: z.number().int().min(1).max(5).optional(),
  rating_strategic_quality: z.number().int().min(1).max(5).optional(),
  review_text: z.string().min(50, 'At least 50 characters').max(5000),
  pros: z.string().max(1000).optional(),
  cons: z.string().max(1000).optional(),
  race_type: z.string().min(1),
  region: z.string().optional(),
  budget_tier: z.string().optional(),
  service_used: z.string().optional(),
  would_hire_again: z.boolean(),
  race_outcome: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function EditReviewClient({ review }: { review: Review }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, control, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      rating_overall: review.rating_overall,
      rating_communication: review.rating_communication ?? undefined,
      rating_budget_transparency: review.rating_budget_transparency ?? undefined,
      rating_results_vs_projections: review.rating_results_vs_projections ?? undefined,
      rating_responsiveness: review.rating_responsiveness ?? undefined,
      rating_strategic_quality: review.rating_strategic_quality ?? undefined,
      review_text: review.review_text,
      pros: review.pros ?? '',
      cons: review.cons ?? '',
      race_type: review.race_type,
      region: review.region ?? '',
      budget_tier: review.budget_tier ?? '',
      service_used: review.service_used ?? '',
      would_hire_again: review.would_hire_again,
      race_outcome: review.race_outcome ?? '',
    },
  });

  async function onSubmit(data: FormData) {
    setError(null);
    const supabase = createClient();
    const { error: updateError } = await supabase
      .from('reviews')
      .update({ ...data, status: 'pending' })
      .eq('id', review.id);

    if (updateError) { setError(updateError.message); return; }
    router.push('/dashboard');
  }

  const ratingField = (key: string, label: string, required = false) => (
    <Controller
      key={key}
      name={key as keyof FormData}
      control={control}
      render={({ field, fieldState }) => (
        <StarRatingInput
          label={label}
          value={(field.value as number) || 0}
          onChange={field.onChange}
          required={required}
          error={fieldState.error?.message}
        />
      )}
    />
  );

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold text-navy mb-6">Edit Review</h1>
      {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-md px-4 py-3 text-sm">{error}</div>}
      <p className="text-sm text-gray-500 mb-6">Editing this review will reset it to pending moderation.</p>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card className="space-y-6 mb-6">
          <h2 className="font-semibold text-navy">Ratings</h2>
          {ratingField('rating_overall', 'Overall Rating', true)}
          {ratingField('rating_communication', 'Communication')}
          {ratingField('rating_budget_transparency', 'Budget Transparency')}
          {ratingField('rating_results_vs_projections', 'Results vs. Projections')}
          {ratingField('rating_responsiveness', 'Responsiveness')}
          {ratingField('rating_strategic_quality', 'Strategic Quality')}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Would you hire again?</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" value="true" {...register('would_hire_again', { setValueAs: (v) => v === 'true' })} />
                <span className="text-sm text-green-700 font-medium">Yes</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" value="false" {...register('would_hire_again', { setValueAs: (v) => v === 'true' })} />
                <span className="text-sm text-red-700 font-medium">No</span>
              </label>
            </div>
          </div>
        </Card>

        <Card className="space-y-4 mb-6">
          <h2 className="font-semibold text-navy">Context</h2>
          <div className="grid grid-cols-2 gap-4">
            <Select id="race_type" label="Race type" options={RACE_TYPES as unknown as { value: string; label: string }[]} error={errors.race_type?.message} {...register('race_type')} />
            <Select id="region" label="Region" options={REGIONS as unknown as { value: string; label: string }[]} placeholder="Select..." {...register('region')} />
            <Select id="budget_tier" label="Budget" options={BUDGET_TIERS as unknown as { value: string; label: string }[]} placeholder="Select..." {...register('budget_tier')} />
            <Select id="service_used" label="Service used" options={SERVICE_CATEGORIES as unknown as { value: string; label: string }[]} placeholder="Select..." {...register('service_used')} />
            <Select id="race_outcome" label="Race outcome" options={RACE_OUTCOMES as unknown as { value: string; label: string }[]} placeholder="Select..." {...register('race_outcome')} />
          </div>
          <Textarea id="review_text" label="Review" rows={6} error={errors.review_text?.message} {...register('review_text')} />
          <Textarea id="pros" label="Pros" rows={2} {...register('pros')} />
          <Textarea id="cons" label="Cons" rows={2} {...register('cons')} />
        </Card>

        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={() => router.push('/dashboard')}>Cancel</Button>
          <Button type="submit" size="lg" className="flex-1" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
}
