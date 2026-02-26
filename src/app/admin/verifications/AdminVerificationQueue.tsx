'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Textarea from '@/components/ui/Textarea';
import Badge from '@/components/ui/Badge';
import { formatDate, getRaceTypeLabel } from '@/lib/utils';

interface Submission {
  id: string;
  profile_id: string;
  committee_id: string | null;
  evidence_type: string;
  file_url: string | null;
  notes: string | null;
  status: string;
  created_at: string;
  profiles: { full_name: string; email: string; verification_status: string } | null;
  committees: { name: string; state: string | null; race_type: string | null; cycle_year: number } | null;
}

export default function AdminVerificationQueue({ submissions }: { submissions: Submission[] }) {
  const router = useRouter();
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [processing, setProcessing] = useState<string | null>(null);

  async function getSignedUrl(submissionId: string, fileUrl: string) {
    const res = await fetch(`/api/admin/verifications/signed-url?file=${encodeURIComponent(fileUrl)}`);
    const data = await res.json();
    if (data.url) {
      window.open(data.url, '_blank');
    }
  }

  async function handleAction(submissionId: string, profileId: string, action: 'approved' | 'rejected') {
    setProcessing(submissionId);
    const res = await fetch('/api/admin/verifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        submissionId,
        profileId,
        action,
        notes: notes[submissionId] ?? '',
      }),
    });

    if (res.ok) {
      router.refresh();
    } else {
      const err = await res.json();
      alert('Error: ' + err.error);
    }
    setProcessing(null);
  }

  if (!submissions.length) {
    return (
      <Card>
        <div className="text-center py-10 text-gray-500">
          No pending verifications.
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {submissions.map((sub) => (
        <Card key={sub.id}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="font-semibold text-navy">
                {sub.profiles?.full_name ?? 'Unknown'}{' '}
                <span className="font-normal text-gray-500 text-sm">({sub.profiles?.email})</span>
              </p>
              {sub.committees && (
                <div className="mt-1 text-sm text-gray-600">
                  <span className="font-medium">{sub.committees.name}</span>
                  {sub.committees.race_type && (
                    <> · {getRaceTypeLabel(sub.committees.race_type)}</>
                  )}
                  {sub.committees.state && <> · {sub.committees.state}</>}
                  <> · {sub.committees.cycle_year}</>
                </div>
              )}
              <div className="flex gap-2 mt-2">
                <Badge variant="default">{sub.evidence_type}</Badge>
                <span className="text-xs text-gray-400">{formatDate(sub.created_at)}</span>
              </div>
            </div>
          </div>

          {sub.notes && (
            <div className="mb-4 bg-gray-50 rounded-md p-3 text-sm text-gray-700">
              <strong>Reviewer notes:</strong> {sub.notes}
            </div>
          )}

          {sub.file_url && (
            <div className="mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => getSignedUrl(sub.id, sub.file_url!)}
              >
                View Verification Document
              </Button>
            </div>
          )}

          <Textarea
            label="Admin notes"
            placeholder="Add notes about this verification decision..."
            value={notes[sub.id] ?? ''}
            onChange={(e) => setNotes((prev) => ({ ...prev, [sub.id]: e.target.value }))}
            rows={2}
          />

          <div className="flex gap-3 mt-3">
            <Button
              variant="danger"
              size="sm"
              onClick={() => handleAction(sub.id, sub.profile_id, 'rejected')}
              disabled={processing === sub.id}
            >
              Reject
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleAction(sub.id, sub.profile_id, 'approved')}
              disabled={processing === sub.id}
            >
              {processing === sub.id ? 'Processing...' : 'Approve'}
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
