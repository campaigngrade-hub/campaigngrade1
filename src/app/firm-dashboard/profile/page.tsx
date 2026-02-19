'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { createClient } from '@/lib/supabase/client';
import { useProfile } from '@/hooks/useProfile';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import Card from '@/components/ui/Card';
import { PARTY_FOCUS, SERVICE_CATEGORIES, US_STATES } from '@/lib/constants';
import { Firm } from '@/types';

const schema = z.object({
  description: z.string().max(1000).optional(),
  website: z.string().url('Enter a valid URL').or(z.literal('')).optional(),
  party_focus: z.string().optional(),
  year_founded: z.string().optional(),
  headquarters_state: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function FirmProfileEditPage() {
  const router = useRouter();
  const { profile, loading } = useProfile();
  const [firm, setFirm] = useState<Firm | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (!profile) return;
    const supabase = createClient();
    supabase.from('firms').select('*').eq('claimed_by', profile.id).single().then(({ data }) => {
      if (data) {
        setFirm(data);
        setSelectedServices(data.services ?? []);
        reset({
          description: data.description ?? '',
          website: data.website ?? '',
          party_focus: data.party_focus ?? '',
          year_founded: data.year_founded ?? '',
          headquarters_state: data.headquarters_state ?? '',
        });
      }
    });
  }, [profile, reset]);

  if (loading || !firm) return <div className="flex items-center justify-center min-h-64"><div className="text-gray-500">Loading...</div></div>;

  async function onSubmit(data: FormData) {
    setError(null);
    const supabase = createClient();
    const { error: updateError } = await supabase
      .from('firms')
      .update({
        description: data.description || null,
        website: data.website || null,
        party_focus: data.party_focus || null,
        year_founded: data.year_founded ? parseInt(data.year_founded) : null,
        headquarters_state: data.headquarters_state || null,
        services: selectedServices,
      })
      .eq('id', firm!.id);

    if (updateError) { setError(updateError.message); return; }
    setSuccess(true);
    setTimeout(() => router.push('/firm-dashboard'), 1500);
  }

  function toggleService(value: string) {
    setSelectedServices((prev) =>
      prev.includes(value) ? prev.filter((s) => s !== value) : [...prev, value]
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold text-navy mb-6">Edit Firm Profile</h1>

      {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-md px-4 py-3 text-sm">{error}</div>}
      {success && <div className="mb-4 bg-green-50 border border-green-200 text-green-700 rounded-md px-4 py-3 text-sm">Profile updated! Redirecting...</div>}

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card className="space-y-4 mb-6">
          <h2 className="font-semibold text-navy">Basic Information</h2>
          <p className="text-sm text-gray-500">Firm name and slug cannot be changed here. Contact support.</p>

          <Textarea
            id="description"
            label="Description"
            placeholder="Brief description of your firm's work and focus areas..."
            error={errors.description?.message}
            {...register('description')}
          />

          <Input
            id="website"
            label="Website URL"
            type="url"
            placeholder="https://yourfirm.com"
            error={errors.website?.message}
            {...register('website')}
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              id="party_focus"
              label="Party focus"
              options={PARTY_FOCUS as unknown as { value: string; label: string }[]}
              placeholder="Select..."
              {...register('party_focus')}
            />
            <Select
              id="headquarters_state"
              label="Headquarters state"
              options={US_STATES as unknown as { value: string; label: string }[]}
              placeholder="Select..."
              {...register('headquarters_state')}
            />
          </div>

          <Input
            id="year_founded"
            label="Year founded"
            type="number"
            placeholder="e.g. 2010"
            {...register('year_founded')}
          />
        </Card>

        <Card className="mb-6">
          <h2 className="font-semibold text-navy mb-4">Services</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {SERVICE_CATEGORIES.map((s) => (
              <label key={s.value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedServices.includes(s.value)}
                  onChange={() => toggleService(s.value)}
                  className="rounded"
                />
                <span className="text-sm">{s.label}</span>
              </label>
            ))}
          </div>
        </Card>

        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={() => router.push('/firm-dashboard')}>
            Cancel
          </Button>
          <Button type="submit" size="lg" className="flex-1" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Profile'}
          </Button>
        </div>
      </form>
    </div>
  );
}
