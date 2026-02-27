'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { createClient } from '@/lib/supabase/client';
import { useProfile } from '@/hooks/useProfile';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import Card from '@/components/ui/Card';
import { StarRatingInput } from '@/components/StarRating';
import {
  BUDGET_TIERS,
  RACE_TYPES,
  REGIONS,
  RACE_OUTCOMES,
  SERVICE_CATEGORIES,
} from '@/lib/constants';
import { Firm, CommitteeMember } from '@/types';

const schema = z.object({
  firm_id: z.string().uuid('Please select a firm'),
  firm_contact_email: z.string().email('Please enter a valid email for the firm'),
  committee_id: z.string().uuid('Please select a committee'),
  rating_overall: z.number().int().min(1, 'Overall rating is required').max(5),
  rating_communication: z.number().int().min(1).max(5).optional(),
  rating_budget_transparency: z.number().int().min(1).max(5).optional(),
  rating_results_vs_projections: z.number().int().min(1).max(5).optional(),
  rating_responsiveness: z.number().int().min(1).max(5).optional(),
  rating_strategic_quality: z.number().int().min(1).max(5).optional(),
  review_text: z.string().min(50, 'Review must be at least 50 characters').max(5000),
  pros: z.string().max(1000).optional(),
  cons: z.string().max(1000).optional(),
  cycle_year: z.number().int().min(2000).max(2040),
  race_type: z.string().min(1, 'Race type is required'),
  region: z.string().optional(),
  budget_tier: z.string().optional(),
  would_hire_again: z.boolean(),
  race_outcome: z.string().optional(),
  anonymization_level: z.enum(['standard', 'minimal']),
});

type FormData = z.infer<typeof schema>;

const CYCLE_YEARS = Array.from({ length: 29 }, (_, i) => {
  const year = 2040 - i;
  return { value: String(year), label: String(year) };
});

export default function NewReviewPage() {
  const router = useRouter();
  const { profile, loading } = useProfile();
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [firmSearch, setFirmSearch] = useState('');
  const [firmResults, setFirmResults] = useState<Firm[]>([]);
  const [selectedFirm, setSelectedFirm] = useState<Firm | null>(null);
  const [committees, setCommittees] = useState<(CommitteeMember & { committees?: { name: string; cycle_year: number } })[]>([]);
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);
  const [showAddCommittee, setShowAddCommittee] = useState(false);
  const [newCommitteeName, setNewCommitteeName] = useState('');
  const [newCommitteeYear, setNewCommitteeYear] = useState('2024');
  const [addingCommittee, setAddingCommittee] = useState(false);
  const [hireAgain, setHireAgain] = useState<boolean>(true);
  const [servicesUsed, setServicesUsed] = useState<string[]>([]);

  const {
    register,
    control,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      cycle_year: 2024,
      would_hire_again: true,
      anonymization_level: 'standard',
      rating_overall: 0,
    },
  });

  const searchFirms = useCallback(async (q: string) => {
    if (!q.trim()) { setFirmResults([]); return; }
    const supabase = createClient();
    const { data } = await supabase
      .from('firms')
      .select('*')
      .ilike('name', `%${q}%`)
      .limit(10);
    setFirmResults(data ?? []);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => searchFirms(firmSearch), 300);
    return () => clearTimeout(timer);
  }, [firmSearch, searchFirms]);

  useEffect(() => {
    if (!profile) return;
    const supabase = createClient();
    supabase
      .from('committee_members')
      .select('*, committees(name, cycle_year)')
      .eq('profile_id', profile.id)
      .then(({ data }) => setCommittees(data as typeof committees ?? []));
  }, [profile]);

  async function handleAddCommittee() {
    if (!newCommitteeName.trim() || !profile) return;
    setAddingCommittee(true);
    const supabase = createClient();
    const { data: committee, error: cErr } = await supabase
      .from('committees')
      .insert({ name: newCommitteeName.trim(), cycle_year: parseInt(newCommitteeYear) })
      .select().single();
    if (cErr || !committee) { setAddingCommittee(false); return; }
    await supabase.from('committee_members').insert({
      profile_id: profile.id,
      committee_id: committee.id,
      role_on_committee: 'other_senior_staff',
    });
    const { data: refreshed } = await supabase
      .from('committee_members')
      .select('*, committees(name, cycle_year)')
      .eq('profile_id', profile.id);
    setCommittees(refreshed as typeof committees ?? []);
    setValue('committee_id', committee.id);
    setShowAddCommittee(false);
    setNewCommitteeName('');
    setAddingCommittee(false);
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-64">
      <div className="text-gray-500">Loading...</div>
    </div>
  );

  if (!profile) { router.push('/login'); return null; }

  const ratingField = (key: keyof FormData, label: string, required = false) => (
    <Controller
      key={key}
      name={key}
      control={control}
      render={({ field, fieldState }) => (
        <StarRatingInput
          label={label}
          value={(field.value as number) || 0}
          onChange={(val) => field.onChange(val)}
          required={required}
          error={fieldState.error?.message}
        />
      )}
    />
  );

  async function goToStep2() {
    setError(null);
    const firmId = getValues('firm_id');
    const contactEmail = getValues('firm_contact_email');
    const committeeId = getValues('committee_id');

    if (!firmId) { setError('Please select a firm.'); return; }
    if (!contactEmail) { setError("Please enter the firm's contact email."); return; }
    // Validate email format
    const emailValid = z.string().email().safeParse(contactEmail);
    if (!emailValid.success) { setError('Please enter a valid email address for the firm.'); return; }
    if (!committeeId) { setError('Please select or add a committee.'); return; }
    setStep(2);
  }

  async function goToStep3() {
    setError(null);
    const rating = getValues('rating_overall');
    if (!rating || rating < 1) { setError('Please provide an overall rating.'); return; }
    setStep(3);
  }

  async function goToStep4() {
    setError(null);
    const reviewText = getValues('review_text');
    const raceType = getValues('race_type');
    if (!reviewText || reviewText.length < 50) {
      setError('Your review must be at least 50 characters.');
      return;
    }
    if (!raceType) { setError('Please select a race type.'); return; }
    setStep(4);
  }

  async function submitReview() {
    setError(null);

    if (!invoiceFile) {
      setError('Please upload an invoice or contract to verify your engagement.');
      return;
    }

    const data = getValues();

    // Validate all required fields manually before submitting
    if (!data.firm_id) { setError('Please select a firm.'); return; }
    if (!data.firm_contact_email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.firm_contact_email)) {
      setError("Please enter a valid email for the firm."); return;
    }
    if (!data.committee_id) { setError('Please select a committee.'); return; }
    if (!data.rating_overall || data.rating_overall < 1) { setError('Please provide an overall rating.'); return; }
    if (!data.review_text || data.review_text.length < 50) { setError('Review must be at least 50 characters.'); return; }
    if (!data.race_type) { setError('Please select a race type.'); return; }
    setSubmitting(true);

    try {
      const supabase = createClient();

      // Check duplicate
      const { data: existing } = await supabase
        .from('reviews')
        .select('id')
        .eq('reviewer_id', profile!.id)
        .eq('firm_id', data.firm_id)
        .eq('cycle_year', data.cycle_year)
        .maybeSingle();

      if (existing) {
        setError(`You've already reviewed this firm for the ${data.cycle_year} cycle.`);
        setSubmitting(false);
        return;
      }

      // Check committee cap (max 3 reviews per committee/firm/cycle)
      const { count } = await supabase
        .from('reviews')
        .select('id', { count: 'exact' })
        .eq('committee_id', data.committee_id)
        .eq('firm_id', data.firm_id)
        .eq('cycle_year', data.cycle_year);

      if ((count ?? 0) >= 3) {
        setError('Multiple members of your committee have already reviewed this firm for this cycle.');
        setSubmitting(false);
        return;
      }

      // Rate limiting: max 10 reviews in 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const { count: recentCount } = await supabase
        .from('reviews')
        .select('id', { count: 'exact' })
        .eq('reviewer_id', profile!.id)
        .gte('created_at', thirtyDaysAgo.toISOString());

      if ((recentCount ?? 0) >= 10) {
        setError('You have reached the maximum of 10 reviews in a 30-day period.');
        setSubmitting(false);
        return;
      }

      // Upload invoice (required)
      const ext = invoiceFile.name.split('.').pop();
      const path = `${profile!.id}/review-${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('verification-evidence')
        .upload(path, invoiceFile);

      if (uploadError) {
        setError('Failed to upload invoice: ' + uploadError.message);
        setSubmitting(false);
        return;
      }

      // Insert review
      const { error: insertError } = await supabase.from('reviews').insert({
        reviewer_id: profile!.id,
        firm_id: data.firm_id,
        committee_id: data.committee_id,
        rating_overall: data.rating_overall,
        rating_communication: data.rating_communication ?? null,
        rating_budget_transparency: data.rating_budget_transparency ?? null,
        rating_results_vs_projections: data.rating_results_vs_projections ?? null,
        rating_responsiveness: data.rating_responsiveness ?? null,
        rating_strategic_quality: data.rating_strategic_quality ?? null,
        review_text: data.review_text,
        pros: data.pros ?? null,
        cons: data.cons ?? null,
        cycle_year: data.cycle_year,
        race_type: data.race_type,
        region: data.region ?? null,
        budget_tier: data.budget_tier ?? null,
        services_used: servicesUsed.length > 0 ? servicesUsed : null,
        would_hire_again: data.would_hire_again,
        race_outcome: data.race_outcome ?? null,
        anonymization_level: data.anonymization_level,
        has_invoice_evidence: true,
        status: 'pending',
      });

      if (insertError) {
        setError('Failed to submit review: ' + insertError.message);
        setSubmitting(false);
        return;
      }

      // Save firm contact email via API (uses admin client, bypasses RLS)
      await fetch('/api/notify-firm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firmName: selectedFirm?.name,
          firmSlug: selectedFirm?.slug,
          firmEmail: data.firm_contact_email,
          firmId: data.firm_id,
        }),
      });

      router.push('/dashboard?review=submitted');
    } catch (err) {
      console.error('Submit error:', err);
      setError('An unexpected error occurred. Please try again.');
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold text-navy mb-6">Submit a Review</h1>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-md px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* Step indicator */}
      <div className="flex gap-2 mb-6">
        {['Select Firm', 'Ratings', 'Review Details', 'Submit'].map((label, idx) => (
          <div key={label} className="flex items-center">
            <button
              type="button"
              onClick={() => idx + 1 < step && setStep(idx + 1)}
              className={`text-sm px-3 py-1 rounded-full font-medium ${
                step === idx + 1
                  ? 'bg-navy text-white'
                  : step > idx + 1
                  ? 'bg-green-100 text-green-800 cursor-pointer'
                  : 'bg-gray-100 text-gray-400'
              }`}
            >
              {step > idx + 1 ? '✓ ' : ''}{label}
            </button>
            {idx < 3 && <span className="text-gray-300 mx-1">›</span>}
          </div>
        ))}
      </div>

      {/* Step 1: Firm + committee */}
      {step === 1 && (
        <Card className="space-y-4">
          <h2 className="font-semibold text-navy text-lg">Which firm are you reviewing?</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search for a firm</label>
            <Input
              placeholder="Type firm name..."
              value={firmSearch}
              onChange={(e) => setFirmSearch(e.target.value)}
              error={errors.firm_id?.message}
            />
            {firmResults.length > 0 && (
              <div className="border border-gray-200 rounded-md mt-1 max-h-48 overflow-y-auto">
                {firmResults.map((firm) => (
                  <button
                    key={firm.id}
                    type="button"
                    onClick={() => {
                      setSelectedFirm(firm);
                      setValue('firm_id', firm.id);
                      const contactEmail = (firm as Firm & { contact_email?: string }).contact_email;
                      if (contactEmail) setValue('firm_contact_email', contactEmail);
                      setFirmSearch(firm.name);
                      setFirmResults([]);
                      setError(null);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm"
                  >
                    {firm.name}
                    {firm.services?.length && (
                      <span className="text-gray-400 ml-2">· {firm.services[0]}</span>
                    )}
                  </button>
                ))}
              </div>
            )}
            {firmSearch && !firmResults.length && (
              <p className="text-xs text-gray-400 mt-1">
                Firm not found?{' '}
                <button
                  type="button"
                  className="text-navy underline"
                  onClick={async () => {
                    const supabase = createClient();
                    const slug = firmSearch.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
                    const { data: newFirm } = await supabase
                      .from('firms')
                      .insert({ name: firmSearch, slug: `${slug}-${Date.now()}` })
                      .select()
                      .single();
                    if (newFirm) {
                      setSelectedFirm(newFirm);
                      setValue('firm_id', newFirm.id);
                      setFirmResults([]);
                    }
                  }}
                >
                  Add it
                </button>
              </p>
            )}
          </div>

          {selectedFirm && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-sm">
              Reviewing: <strong>{selectedFirm.name}</strong>
            </div>
          )}

          <Input
            id="firm_contact_email"
            label="Firm's contact email"
            type="email"
            placeholder="contact@firmname.com"
            helpText="We'll notify the firm that a review was posted so they can claim their profile."
            error={errors.firm_contact_email?.message}
            {...register('firm_contact_email')}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Which committee was this for?
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-navy"
              {...register('committee_id')}
            >
              <option value="">Select committee...</option>
              {committees.map((cm) => (
                <option key={cm.committee_id} value={cm.committee_id}>
                  {cm.committees?.name ?? cm.committee_id}
                  {' '}({cm.committees?.cycle_year})
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setShowAddCommittee(!showAddCommittee)}
              className="text-xs text-navy underline mt-1 block"
            >
              + Add a committee
            </button>
            {showAddCommittee && (
              <div className="mt-2 p-3 border border-gray-200 rounded-md bg-gray-50 space-y-2">
                <input
                  type="text"
                  placeholder="Committee name (e.g. Friends of Jane Smith)"
                  value={newCommitteeName}
                  onChange={(e) => setNewCommitteeName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
                <select
                  value={newCommitteeYear}
                  onChange={(e) => setNewCommitteeYear(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  {Array.from({ length: 29 }, (_, i) => 2040 - i).map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
                <Button type="button" size="sm" onClick={handleAddCommittee} disabled={addingCommittee}>
                  {addingCommittee ? 'Adding...' : 'Add Committee'}
                </Button>
              </div>
            )}
            {errors.committee_id && (
              <p className="text-xs text-red-600 mt-1">{errors.committee_id.message}</p>
            )}
          </div>

          <Button type="button" size="lg" className="w-full" onClick={goToStep2}>
            Continue
          </Button>
        </Card>
      )}

      {/* Step 2: Ratings */}
      {step === 2 && (
        <Card className="space-y-6">
          <h2 className="font-semibold text-navy text-lg">Rate this firm</h2>
          {ratingField('rating_overall', 'Overall Rating', true)}
          {ratingField('rating_communication', 'Communication')}
          {ratingField('rating_budget_transparency', 'Budget Transparency')}
          {ratingField('rating_results_vs_projections', 'Results vs. Projections')}
          {ratingField('rating_responsiveness', 'Responsiveness')}
          {ratingField('rating_strategic_quality', 'Strategic Quality')}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Would you hire this firm again?</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="would_hire_again_radio"
                  checked={hireAgain === true}
                  onChange={() => { setHireAgain(true); setValue('would_hire_again', true); }}
                />
                <span className="text-sm text-green-700 font-medium">Yes</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="would_hire_again_radio"
                  checked={hireAgain === false}
                  onChange={() => { setHireAgain(false); setValue('would_hire_again', false); }}
                />
                <span className="text-sm text-red-700 font-medium">No</span>
              </label>
            </div>
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={() => setStep(1)}>Back</Button>
            <Button type="button" size="lg" className="flex-1" onClick={goToStep3}>
              Continue
            </Button>
          </div>
        </Card>
      )}

      {/* Step 3: Context & text */}
      {step === 3 && (
        <Card className="space-y-4">
          <h2 className="font-semibold text-navy text-lg">Review Details</h2>

          <div className="grid grid-cols-2 gap-4">
            <Controller
              name="cycle_year"
              control={control}
              render={({ field }) => (
                <Select
                  id="cycle_year"
                  label="Election cycle"
                  options={CYCLE_YEARS}
                  value={String(field.value)}
                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                />
              )}
            />
            <Select
              id="race_type"
              label="Race type"
              options={RACE_TYPES as unknown as { value: string; label: string }[]}
              placeholder="Select..."
              error={errors.race_type?.message}
              {...register('race_type')}
            />
            <Select
              id="region"
              label="Region"
              options={REGIONS as unknown as { value: string; label: string }[]}
              placeholder="Select..."
              {...register('region')}
            />
            <Select
              id="budget_tier"
              label="Budget range"
              options={BUDGET_TIERS as unknown as { value: string; label: string }[]}
              placeholder="Select..."
              {...register('budget_tier')}
            />
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Services used (select all that apply)</label>
              <div className="grid grid-cols-2 gap-2">
                {SERVICE_CATEGORIES.map((cat) => (
                  <label key={cat.value} className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={servicesUsed.includes(cat.value)}
                      onChange={(e) => {
                        setServicesUsed(prev =>
                          e.target.checked
                            ? [...prev, cat.value]
                            : prev.filter(v => v !== cat.value)
                        );
                      }}
                      className="rounded border-gray-300 text-navy focus:ring-navy"
                    />
                    {cat.label}
                  </label>
                ))}
              </div>
            </div>
            <Select
              id="race_outcome"
              label="Race outcome"
              options={RACE_OUTCOMES as unknown as { value: string; label: string }[]}
              placeholder="Select..."
              {...register('race_outcome')}
            />
          </div>

          <Select
            id="anonymization_level"
            label="Anonymization level"
            options={[
              { value: 'standard', label: 'Standard — Show race type, region, cycle, budget' },
              { value: 'minimal', label: 'Minimal — Show race type and cycle only (for small races)' },
            ]}
            {...register('anonymization_level')}
          />

          <Textarea
            id="review_text"
            label="Your review"
            rows={6}
            placeholder="Describe your experience working with this firm. What did they do well? What fell short? What should other campaign principals know?"
            error={errors.review_text?.message}
            helpText="Minimum 50 characters. Focus on the professional relationship, not individuals."
            {...register('review_text')}
          />

          <Textarea
            id="pros"
            label="Pros (optional)"
            rows={2}
            placeholder="What did they do well?"
            {...register('pros')}
          />

          <Textarea
            id="cons"
            label="Cons (optional)"
            rows={2}
            placeholder="Where did they fall short?"
            {...register('cons')}
          />

          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={() => setStep(2)}>Back</Button>
            <Button type="button" size="lg" className="flex-1" onClick={goToStep4}>
              Continue
            </Button>
          </div>
        </Card>
      )}

      {/* Step 4: Invoice + submit */}
      {step === 4 && (
        <Card className="space-y-4">
          <h2 className="font-semibold text-navy text-lg">Verify Your Engagement & Submit</h2>

          <div className="bg-amber-50 border border-amber-200 rounded-md p-4 text-sm">
            <h3 className="font-semibold text-amber-900 mb-2">Content Guidelines Reminder</h3>
            <ul className="space-y-1 text-amber-800 list-disc list-inside">
              <li>Do not accuse anyone of criminal conduct</li>
              <li>Do not name individual employees — focus on the firm</li>
              <li>Do not disclose exact contract amounts or donor info</li>
              <li>Keep it factual and honest — this is your professional opinion</li>
            </ul>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Upload invoice or contract <span className="text-red-500">*</span>
            </label>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => setInvoiceFile(e.target.files?.[0] ?? null)}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-navy file:text-white hover:file:bg-navy-dark"
            />
            {invoiceFile && (
              <p className="text-xs text-green-600 mt-1">✓ {invoiceFile.name} ready to upload</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Required. Verifies your paid engagement with this firm. Accepted: PDF, JPG, PNG.
            </p>
          </div>

          <div className="border-t pt-4">
            <p className="text-sm text-gray-600 mb-4">
              Your review will be submitted for moderation and published within 24–48 hours
              if it meets our content guidelines.
            </p>
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => setStep(3)}>Back</Button>
              <Button
                type="button"
                size="lg"
                className="flex-1"
                disabled={submitting}
                onClick={submitReview}
              >
                {submitting ? 'Submitting...' : 'Submit Review'}
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
