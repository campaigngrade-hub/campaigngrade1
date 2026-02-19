'use client';

import { useState } from 'react';
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
import { COMMITTEE_ROLES, EVIDENCE_TYPES, RACE_TYPES, US_STATES } from '@/lib/constants';

const step1Schema = z.object({
  committee_name: z.string().min(2, 'Committee name is required'),
  state: z.string().optional(),
  race_type: z.string().min(1, 'Please select a race type'),
  cycle_year: z.number().int().min(2000).max(2030),
  role_on_committee: z.string().min(1, 'Please select your role'),
});

const step2Schema = z.object({
  evidence_type: z.string().min(1, 'Please select evidence type'),
  notes: z.string().optional(),
});

type Step1Data = z.infer<typeof step1Schema>;
type Step2Data = z.infer<typeof step2Schema>;

export default function VerifyPage() {
  const router = useRouter();
  const { profile, loading } = useProfile();
  const [step, setStep] = useState(1);
  const [committeeId, setCommitteeId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const step1Form = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: { cycle_year: 2024 },
  });

  const step2Form = useForm<Step2Data>({ resolver: zodResolver(step2Schema) });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!profile) {
    router.push('/login');
    return null;
  }

  if (profile.verification_status === 'approved') {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <Card>
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-navy">You&apos;re already verified!</h2>
            <p className="text-gray-600 mt-2">
              You can submit reviews and contribute to CampaignGrade.
            </p>
            <Button className="mt-4" onClick={() => router.push('/reviews/new')}>
              Submit a Review
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (profile.verification_status === 'pending') {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <Card>
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-navy">Verification Pending</h2>
            <p className="text-gray-600 mt-2">
              Your submission is under review. You&apos;ll be notified within 48 hours.
            </p>
            <Button variant="outline" className="mt-4" onClick={() => router.push('/dashboard')}>
              Go to Dashboard
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  async function handleStep1(data: Step1Data) {
    setError(null);
    const supabase = createClient();

    const { data: committee, error: committeeError } = await supabase
      .from('committees')
      .insert({
        name: data.committee_name,
        state: data.state || null,
        race_type: data.race_type,
        cycle_year: data.cycle_year,
      })
      .select()
      .single();

    if (committeeError) {
      setError(committeeError.message);
      return;
    }

    const { error: memberError } = await supabase.from('committee_members').insert({
      profile_id: profile!.id,
      committee_id: committee.id,
      role_on_committee: data.role_on_committee,
    });

    if (memberError) {
      setError(memberError.message);
      return;
    }

    setCommitteeId(committee.id);
    setStep(2);
  }

  async function handleStep2(data: Step2Data) {
    setError(null);
    setUploading(true);

    const supabase = createClient();
    let fileUrl: string | null = null;

    if (file) {
      const ext = file.name.split('.').pop();
      const path = `${profile!.id}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('verification-evidence')
        .upload(path, file);

      if (uploadError) {
        setError('File upload failed: ' + uploadError.message);
        setUploading(false);
        return;
      }

      fileUrl = path;
    }

    const { error: submissionError } = await supabase.from('verification_submissions').insert({
      profile_id: profile!.id,
      committee_id: committeeId,
      evidence_type: data.evidence_type,
      file_url: fileUrl,
      notes: data.notes || null,
    });

    if (submissionError) {
      setError(submissionError.message);
      setUploading(false);
      return;
    }

    setStep(3);
    setUploading(false);
  }

  const CYCLE_YEARS = Array.from({ length: 15 }, (_, i) => {
    const year = 2012 + i;
    return { value: String(year), label: String(year) };
  }).reverse();

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      {/* Progress */}
      <div className="flex items-center mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                step >= s ? 'bg-navy text-white' : 'bg-gray-200 text-gray-500'
              }`}
            >
              {step > s ? '✓' : s}
            </div>
            {s < 3 && (
              <div className={`h-0.5 w-16 ${step > s ? 'bg-navy' : 'bg-gray-200'}`} />
            )}
          </div>
        ))}
        <div className="ml-4 text-sm text-gray-500">
          {step === 1 && 'Committee Info'}
          {step === 2 && 'Upload Evidence'}
          {step === 3 && 'Submitted'}
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-md px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {step === 1 && (
        <Card>
          <h2 className="text-xl font-bold text-navy mb-1">Your Committee</h2>
          <p className="text-gray-500 text-sm mb-6">
            Tell us which campaign committee you were a principal of. We&apos;ll verify your role
            before you can submit reviews.
          </p>
          <form onSubmit={step1Form.handleSubmit(handleStep1)} className="space-y-4">
            <Input
              id="committee_name"
              label="Committee name"
              placeholder='e.g. "Friends of Jane Smith" or "Smith for Senate"'
              error={step1Form.formState.errors.committee_name?.message}
              {...step1Form.register('committee_name')}
            />
            <Select
              id="race_type"
              label="Race type"
              options={RACE_TYPES as unknown as { value: string; label: string }[]}
              placeholder="Select race type..."
              error={step1Form.formState.errors.race_type?.message}
              {...step1Form.register('race_type')}
            />
            <div className="grid grid-cols-2 gap-4">
              <Select
                id="state"
                label="State (optional)"
                options={US_STATES as unknown as { value: string; label: string }[]}
                placeholder="Select state..."
                {...step1Form.register('state')}
              />
              <Controller
                name="cycle_year"
                control={step1Form.control}
                render={({ field }) => (
                  <Select
                    id="cycle_year"
                    label="Election cycle"
                    options={CYCLE_YEARS}
                    value={String(field.value)}
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                    error={step1Form.formState.errors.cycle_year?.message}
                  />
                )}
              />
            </div>
            <Select
              id="role_on_committee"
              label="Your role on the committee"
              options={COMMITTEE_ROLES as unknown as { value: string; label: string }[]}
              placeholder="Select your role..."
              error={step1Form.formState.errors.role_on_committee?.message}
              {...step1Form.register('role_on_committee')}
            />
            <Button type="submit" size="lg" className="w-full" disabled={step1Form.formState.isSubmitting}>
              {step1Form.formState.isSubmitting ? 'Saving...' : 'Continue'}
            </Button>
          </form>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <h2 className="text-xl font-bold text-navy mb-1">Upload Evidence</h2>
          <p className="text-gray-500 text-sm mb-6">
            Upload documentation proving your role on the committee. This could be an invoice,
            contract, FEC filing, or state filing. Files are reviewed by staff and deleted within 90 days.
          </p>
          <form onSubmit={step2Form.handleSubmit(handleStep2)} className="space-y-4">
            <Select
              id="evidence_type"
              label="Evidence type"
              options={EVIDENCE_TYPES as unknown as { value: string; label: string }[]}
              placeholder="Select evidence type..."
              error={step2Form.formState.errors.evidence_type?.message}
              {...step2Form.register('evidence_type')}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Upload file (PDF, image)
              </label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.gif"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-navy file:text-white hover:file:bg-navy-dark"
              />
            </div>
            <Textarea
              id="notes"
              label="Notes (optional)"
              placeholder="Any context that will help our team verify your submission..."
              {...step2Form.register('notes')}
            />
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button
                type="submit"
                size="lg"
                className="flex-1"
                disabled={uploading || step2Form.formState.isSubmitting}
              >
                {uploading ? 'Uploading...' : 'Submit for Review'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {step === 3 && (
        <Card>
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-navy">Submission Received</h2>
            <p className="text-gray-600 mt-2 mb-6">
              Your submission is under review. You&apos;ll receive an email notification within 48 hours.
            </p>
            <Button onClick={() => router.push('/dashboard')}>Go to Dashboard</Button>
          </div>
        </Card>
      )}
    </div>
  );
}
