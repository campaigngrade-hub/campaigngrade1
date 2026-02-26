import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = 'CampaignGrade <noreply@campaign-grade.com>';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://campaigngrade1.vercel.app';

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (!profile || profile.role !== 'platform_admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { claimId, firmId, profileId, action, notes, firmSlug } = await req.json();
  const adminClient = createAdminClient();

  // Update claim status
  const { error: claimError } = await adminClient
    .from('firm_claim_requests')
    .update({ status: action, reviewed_by: user.id, reviewed_at: new Date().toISOString(), admin_notes: notes })
    .eq('id', claimId);

  if (claimError) return NextResponse.json({ error: claimError.message }, { status: 500 });

  // Get claimant info
  const { data: claimant } = await adminClient
    .from('profiles')
    .select('email, full_name')
    .eq('id', profileId)
    .single();

  if (action === 'approved') {
    // Set firm as claimed, update claimant role to firm_admin
    const { error: firmError } = await adminClient
      .from('firms')
      .update({ is_claimed: true, claimed_by: profileId })
      .eq('id', firmId);
    if (firmError) return NextResponse.json({ error: firmError.message }, { status: 500 });

    await adminClient
      .from('profiles')
      .update({ role: 'firm_admin' })
      .eq('id', profileId);

    // Email: approved
    if (claimant) {
      await resend.emails.send({
        from: FROM,
        to: claimant.email,
        subject: 'Your firm claim has been approved — CampaignGrade',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1e3a5f;">Claim Approved!</h2>
            <p>Hi ${claimant.full_name},</p>
            <p>Your claim has been approved. You can now manage your firm's profile and respond to reviews.</p>
            <p>
              <a href="${APP_URL}/firm-dashboard"
                 style="display: inline-block; background: #f59e0b; color: #1e3a5f; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">
                Go to Firm Dashboard
              </a>
            </p>
            <p style="color: #6b7280; font-size: 12px; margin-top: 24px;">CampaignGrade · admin@campaign-grade.com</p>
          </div>
        `,
      });
    }
  } else {
    // Email: rejected
    if (claimant) {
      await resend.emails.send({
        from: FROM,
        to: claimant.email,
        subject: 'Your firm claim could not be approved — CampaignGrade',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1e3a5f;">Claim Not Approved</h2>
            <p>Hi ${claimant.full_name},</p>
            <p>We were unable to approve your claim for the following reason:</p>
            <blockquote style="border-left: 3px solid #e5e7eb; padding-left: 12px; color: #374151;">
              ${notes || 'Insufficient documentation provided.'}
            </blockquote>
            <p>You can submit a new claim with additional documentation at <a href="${APP_URL}/firms/${firmSlug}">${APP_URL}/firms/${firmSlug}</a>.</p>
            <p>Questions? Contact us at <a href="mailto:admin@campaign-grade.com">admin@campaign-grade.com</a>.</p>
          </div>
        `,
      });
    }
  }

  return NextResponse.json({ success: true });
}
