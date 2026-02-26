'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useProfile } from '@/hooks/useProfile';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Card from '@/components/ui/Card';
import { Firm } from '@/types';

export default function ClaimFirmPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { profile, loading } = useProfile();
  const [firm, setFirm] = useState<Firm | null>(null);
  const [firmLoading, setFirmLoading] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [notes, setNotes] = useState('');
  const [title, setTitle] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.from('firms').select('*').eq('slug', slug).single()
      .then(({ data }) => { setFirm(data); setFirmLoading(false); });
  }, [slug]);

  if (loading || firmLoading) return (
    <div className="flex items-center justify-center min-h-64">
      <div className="text-gray-500">Loading…</div>
    </div>
  );

  if (!profile) { router.push('/login'); return null; }

  if (!firm) return (
    <div className="max-w-2xl mx-auto py-12 px-4 text-center">
      <p className="text-gray-500">Firm not found.</p>
    </div>
  );

  if (firm.is_claimed) return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <Card>
        <div className="text-center py-6">
          <h2 className="text-xl font-bold text-navy mb-2">This firm is already claimed</h2>
          <p className="text-gray-500 mb-4">
            If you believe this is in error, contact{' '}
            <a href="mailto:admin@campaign-grade.com" className="text-navy underline">
              admin@campaign-grade.com
            </a>.
          </p>
          <Button variant="outline" onClick={() => router.push(`/firms/${slug}`)}>Back to Firm Profile</Button>
        </div>
      </Card>
    </div>
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!file) { setError('Please upload a verification document.'); return; }
    if (!title.trim()) { setError('Please enter your title at the firm.'); return; }

    setSubmitting(true);
    const supabase = createClient();

    // Upload document
    const ext = file.name.split('.').pop();
    const path = `claim-requests/${firm!.id}/${profile!.id}-${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from('verification-evidence')
      .upload(path, file);

    if (uploadError) {
      setError('File upload failed: ' + uploadError.message);
      setSubmitting(false);
      return;
    }

    // Insert claim request
    const { error: insertError } = await supabase.from('firm_claim_requests').insert({
      firm_id: firm!.id,
      profile_id: profile!.id,
      title_at_firm: title,
      notes: notes || null,
      document_url: path,
      status: 'pending',
    });

    if (insertError) {
      setError('Submission failed: ' + insertError.message);
      setSubmitting(false);
      return;
    }

    setSubmitted(true);
    setSubmitting(false);
  }

  if (submitted) return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <Card>
        <div className="text-center py-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-navy">Claim Request Submitted</h2>
          <p className="text-gray-600 mt-2 mb-6">
            We'll review your documentation and respond within 48 hours at{' '}
            <strong>{profile.email}</strong>.
          </p>
          <Button onClick={() => router.push('/dashboard')}>Go to Dashboard</Button>
        </div>
      </Card>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-navy">Claim {firm.name}</h1>
        <p className="text-gray-500 mt-1">
          Verify that you represent this firm to manage your profile and respond to reviews.
        </p>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-md px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <Card>
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            id="title"
            label="Your title at the firm"
            placeholder="e.g. Managing Partner, Partner, Director"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            helpText="We need to verify you are an authorized representative."
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Verification document <span className="text-red-500">*</span>
            </label>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-navy file:text-white hover:file:bg-navy-dark"
            />
            {file && <p className="text-xs text-green-600 mt-1">✓ {file.name}</p>}
            <p className="text-xs text-gray-500 mt-1">
              Upload a document proving your association with this firm — e.g. business card scan,
              signed letter on firm letterhead, FEC filing showing the firm, or a screenshot of your
              firm email/bio page. PDF, JPG, or PNG.
            </p>
          </div>

          <Textarea
            id="notes"
            label="Additional notes (optional)"
            placeholder="Any context that will help us verify your claim faster…"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-sm text-blue-800">
            <strong>What happens next:</strong> Our team reviews your document within 48 hours.
            Once approved, you'll be able to respond to reviews and edit your firm's profile.
            Documents are stored securely and deleted within 90 days.
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={() => router.push(`/firms/${slug}`)}>
              Cancel
            </Button>
            <Button type="submit" size="lg" className="flex-1" disabled={submitting}>
              {submitting ? 'Submitting…' : 'Submit Claim Request'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
