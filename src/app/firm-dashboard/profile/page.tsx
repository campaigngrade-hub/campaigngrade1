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
import { SERVICE_CATEGORIES, US_STATES } from '@/lib/constants';
import { Firm } from '@/types';

const schema = z.object({
  description: z.string().max(1000).optional(),
  website: z.string().url('Enter a valid URL').or(z.literal('')).optional(),
  year_founded: z.string().optional(),
  headquarters_state: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

type PriceType = 'monthly' | 'one_time' | 'contingency';

interface PricingRow {
  id?: string;          // existing DB row id
  service: string;
  price: string;        // kept as string for input control
  price_type: PriceType;
}

const PRICE_TYPE_LABELS: Record<PriceType, string> = {
  monthly: 'Monthly',
  one_time: 'One-time',
  contingency: 'Contingency',
};

export default function FirmProfileEditPage() {
  const router = useRouter();
  const { profile, loading } = useProfile();
  const [firm, setFirm] = useState<Firm | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [pricingRows, setPricingRows] = useState<PricingRow[]>([]);

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
        setLogoPreview(data.logo_url ?? null);
        reset({
          description: data.description ?? '',
          website: data.website ?? '',
          year_founded: data.year_founded ? String(data.year_founded) : '',
          headquarters_state: data.headquarters_state ?? '',
        });
        // Load existing pricing rows
        supabase
          .from('firm_pricing')
          .select('*')
          .eq('firm_id', data.id)
          .order('created_at')
          .then(({ data: pricing }) => {
            if (pricing && pricing.length > 0) {
              setPricingRows(pricing.map((p) => ({
                id: p.id,
                service: p.service,
                price: String(p.price),
                price_type: p.price_type as PriceType,
              })));
            }
          });
      }
    });
  }, [profile, reset]);

  if (loading || !firm) return (
    <div className="flex items-center justify-center min-h-64">
      <div className="text-gray-500">Loading...</div>
    </div>
  );

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { setError('Logo must be under 2MB.'); return; }
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
    setError(null);
  }

  function addPricingRow() {
    setPricingRows((prev) => [...prev, { service: '', price: '', price_type: 'one_time' }]);
  }

  function removePricingRow(index: number) {
    setPricingRows((prev) => prev.filter((_, i) => i !== index));
  }

  function updatePricingRow(index: number, field: keyof PricingRow, value: string) {
    setPricingRows((prev) => prev.map((row, i) =>
      i === index ? { ...row, [field]: value } : row
    ));
  }

  async function savePricing(firmId: string) {
    const supabase = createClient();
    // Delete all existing rows and re-insert (simplest conflict-free approach)
    await supabase.from('firm_pricing').delete().eq('firm_id', firmId);

    const validRows = pricingRows.filter(
      (r) => r.service && r.price && !isNaN(Number(r.price)) && Number(r.price) > 0
    );
    if (validRows.length === 0) return;

    await supabase.from('firm_pricing').insert(
      validRows.map((r) => ({
        firm_id: firmId,
        service: r.service,
        price: Number(r.price),
        price_type: r.price_type,
      }))
    );
  }

  async function onSubmit(data: FormData) {
    setError(null);
    const supabase = createClient();
    let logo_url = firm!.logo_url;

    if (logoFile) {
      setUploadingLogo(true);
      const ext = logoFile.name.split('.').pop();
      const path = `logos/${firm!.id}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('firm-assets')
        .upload(path, logoFile, { upsert: true });

      if (uploadError) {
        setError('Logo upload failed: ' + uploadError.message);
        setUploadingLogo(false);
        return;
      }

      const { data: urlData } = supabase.storage.from('firm-assets').getPublicUrl(path);
      logo_url = urlData.publicUrl;
      setUploadingLogo(false);
    }

    const { error: updateError } = await supabase
      .from('firms')
      .update({
        description: data.description || null,
        website: data.website || null,
        year_founded: data.year_founded ? parseInt(data.year_founded) : null,
        headquarters_state: data.headquarters_state || null,
        services: selectedServices,
        logo_url,
      })
      .eq('id', firm!.id);

    if (updateError) { setError(updateError.message); return; }

    await savePricing(firm!.id);

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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-navy">Edit Firm Profile</h1>
        <a
          href={`/firms/${firm.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-navy hover:underline"
        >
          View public profile →
        </a>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-md px-4 py-3 text-sm">{error}</div>
      )}
      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 rounded-md px-4 py-3 text-sm">
          Profile updated! Redirecting...
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>

        {/* Logo */}
        <Card className="mb-6 space-y-4">
          <h2 className="font-semibold text-navy">Logo</h2>
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-lg border border-gray-200 flex items-center justify-center bg-gray-50 overflow-hidden flex-shrink-0">
              {logoPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoPreview} alt="Logo preview" className="w-full h-full object-contain" />
              ) : (
                <span className="text-3xl text-gray-300">🏢</span>
              )}
            </div>
            <div className="flex-1">
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.svg,.webp"
                onChange={handleLogoChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-navy file:text-white hover:file:bg-navy-dark"
              />
              <p className="text-xs text-gray-500 mt-1">PNG, JPG, SVG or WebP · Max 2MB · Recommended: square, 400×400px+</p>
              {logoFile && <p className="text-xs text-green-600 mt-1">✓ {logoFile.name} selected</p>}
            </div>
          </div>
        </Card>

        {/* Basic info */}
        <Card className="space-y-4 mb-6">
          <div>
            <h2 className="font-semibold text-navy">Basic Information</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Firm name: <strong>{firm.name}</strong> — to change the name, contact{' '}
              <a href="mailto:admin@campaign-grade.com" className="text-navy underline">admin@campaign-grade.com</a>.
            </p>
          </div>

          <Textarea
            id="description"
            label="Bio / Description"
            rows={4}
            placeholder="Tell potential clients about your firm — your focus areas, approach, track record, and what makes you different..."
            helpText="This appears at the top of your public profile. Max 1,000 characters."
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
              id="headquarters_state"
              label="Headquarters state"
              options={US_STATES as unknown as { value: string; label: string }[]}
              placeholder="Select..."
              {...register('headquarters_state')}
            />
            <Input
              id="year_founded"
              label="Year founded"
              type="number"
              placeholder="e.g. 2010"
              {...register('year_founded')}
            />
          </div>
        </Card>

        {/* Services */}
        <Card className="mb-6">
          <h2 className="font-semibold text-navy mb-1">Services Offered</h2>
          <p className="text-sm text-gray-500 mb-4">Select all services your firm provides. These appear as tags on your profile.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {SERVICE_CATEGORIES.map((s) => (
              <label key={s.value} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={selectedServices.includes(s.value)}
                  onChange={() => toggleService(s.value)}
                  className="rounded border-gray-300 text-navy focus:ring-navy"
                />
                <span className="text-sm group-hover:text-navy">{s.label}</span>
              </label>
            ))}
          </div>
        </Card>

        {/* Pricing */}
        <Card className="mb-6">
          <h2 className="font-semibold text-navy mb-1">Public Pricing</h2>
          <p className="text-sm text-gray-500 mb-4">
            Optionally list prices for your services. These are displayed publicly on your profile and help campaigns budget. Leave blank to not display pricing.
          </p>

          {pricingRows.length > 0 && (
            <div className="space-y-3 mb-4">
              {/* Header row */}
              <div className="grid grid-cols-12 gap-2 text-xs font-medium text-gray-500 px-1">
                <span className="col-span-5">Service</span>
                <span className="col-span-3">Price (USD)</span>
                <span className="col-span-3">Billing type</span>
                <span className="col-span-1" />
              </div>
              {pricingRows.map((row, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-5">
                    <select
                      value={row.service}
                      onChange={(e) => updatePricingRow(i, 'service', e.target.value)}
                      className="w-full rounded-md border border-gray-300 text-sm px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-navy"
                    >
                      <option value="">Select service…</option>
                      {SERVICE_CATEGORIES.map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-3">
                    <div className="relative">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                      <input
                        type="number"
                        min="0"
                        step="100"
                        placeholder="0"
                        value={row.price}
                        onChange={(e) => updatePricingRow(i, 'price', e.target.value)}
                        className="w-full rounded-md border border-gray-300 text-sm pl-5 pr-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-navy"
                      />
                    </div>
                  </div>
                  <div className="col-span-3">
                    <select
                      value={row.price_type}
                      onChange={(e) => updatePricingRow(i, 'price_type', e.target.value)}
                      className="w-full rounded-md border border-gray-300 text-sm px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-navy"
                    >
                      {(Object.keys(PRICE_TYPE_LABELS) as PriceType[]).map((t) => (
                        <option key={t} value={t}>{PRICE_TYPE_LABELS[t]}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-1 flex justify-center">
                    <button
                      type="button"
                      onClick={() => removePricingRow(i)}
                      className="text-gray-400 hover:text-red-500 transition-colors text-lg leading-none"
                      title="Remove row"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <Button type="button" variant="outline" size="sm" onClick={addPricingRow}>
            + Add pricing row
          </Button>
        </Card>

        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={() => router.push('/firm-dashboard')}>
            Cancel
          </Button>
          <Button type="submit" size="lg" className="flex-1" disabled={isSubmitting || uploadingLogo}>
            {isSubmitting || uploadingLogo ? 'Saving...' : 'Save Profile'}
          </Button>
        </div>
      </form>
    </div>
  );
}
