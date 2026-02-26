'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Textarea from '@/components/ui/Textarea';
import Badge from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';

interface ClaimRequest {
  id: string;
  firm_id: string;
  profile_id: string;
  title_at_firm: string;
  notes: string | null;
  document_url: string | null;
  status: string;
  created_at: string;
  firms: { name: string; slug: string } | null;
  profiles: { full_name: string; email: string } | null;
}

export default function AdminClaimsQueue({ claims }: { claims: ClaimRequest[] }) {
  const router = useRouter();
  const [adminNotes, setAdminNotes] = useState<Record<string, string>>({});
  const [processing, setProcessing] = useState<string | null>(null);
  const [docUrls, setDocUrls] = useState<Record<string, string>>({});

  async function getDocUrl(claimId: string, docPath: string) {
    const res = await fetch(`/api/admin/verifications/signed-url?file=${encodeURIComponent(docPath)}`);
    const data = await res.json();
    if (data.url) {
      setDocUrls((prev) => ({ ...prev, [claimId]: data.url }));
      window.open(data.url, '_blank');
    }
  }

  async function handleAction(claim: ClaimRequest, action: 'approved' | 'rejected') {
    setProcessing(claim.id);
    const res = await fetch('/api/admin/claims', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        claimId: claim.id,
        firmId: claim.firm_id,
        profileId: claim.profile_id,
        action,
        notes: adminNotes[claim.id] ?? '',
        firmSlug: claim.firms?.slug,
      }),
    });
    if (res.ok) router.refresh();
    else alert('Error processing claim');
    setProcessing(null);
  }

  if (!claims.length) return (
    <Card>
      <div className="text-center py-10 text-gray-500">No pending claim requests.</div>
    </Card>
  );

  return (
    <div className="space-y-4">
      {claims.map((claim) => (
        <Card key={claim.id}>
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="font-semibold text-navy text-lg">{claim.firms?.name ?? 'Unknown Firm'}</p>
              <p className="text-sm text-gray-600">
                Claimed by <strong>{claim.profiles?.full_name}</strong> ({claim.profiles?.email})
              </p>
              <p className="text-sm text-gray-500">
                Title: <strong>{claim.title_at_firm}</strong> · Submitted {formatDate(claim.created_at)}
              </p>
            </div>
            <Badge variant="warning">Pending</Badge>
          </div>

          {claim.notes && (
            <div className="bg-gray-50 rounded-md p-3 mb-3 text-sm text-gray-700">
              <strong>Applicant notes:</strong> {claim.notes}
            </div>
          )}

          {claim.document_url && (
            <div className="mb-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => getDocUrl(claim.id, claim.document_url!)}
              >
                View Verification Document
              </Button>
            </div>
          )}

          <Textarea
            label="Admin notes (sent to applicant if rejected)"
            placeholder="Optional notes about this decision…"
            value={adminNotes[claim.id] ?? ''}
            onChange={(e) => setAdminNotes((prev) => ({ ...prev, [claim.id]: e.target.value }))}
            rows={2}
          />

          <div className="flex gap-3 mt-3">
            <Button
              variant="danger"
              size="sm"
              onClick={() => handleAction(claim, 'rejected')}
              disabled={processing === claim.id}
            >
              Reject
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleAction(claim, 'approved')}
              disabled={processing === claim.id}
            >
              {processing === claim.id ? 'Processing…' : 'Approve Claim'}
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
