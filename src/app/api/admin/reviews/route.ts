import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendReviewPublished, sendReviewRemoved } from '@/lib/email';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (!profile || profile.role !== 'platform_admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { reviewId, action, notes } = await req.json();
  const adminClient = createAdminClient();

  const newStatus = action === 'publish' ? 'published' : 'removed';

  const { data: review, error: reviewError } = await adminClient
    .from('reviews')
    .update({ status: newStatus, admin_notes: notes })
    .eq('id', reviewId)
    .select('reviewer_id, firm_id, firm_contact_email_submitted, firms(name, slug, contact_email)')
    .single();

  if (reviewError) return NextResponse.json({ error: reviewError.message }, { status: 500 });

  const firms = review?.firms as unknown;
  const firmData = (Array.isArray(firms) ? firms[0] : firms) as { name: string; slug: string; contact_email: string | null } | null;
  const firmName = firmData?.name ?? 'a firm';
  const firmSlug = firmData?.slug ?? '';
  // Use submitted email first, fall back to saved firm contact_email
  const firmEmail = (review as { firm_contact_email_submitted?: string | null }).firm_contact_email_submitted
    ?? firmData?.contact_email
    ?? null;

  // Notify reviewer
  if (review?.reviewer_id) {
    const { data: reviewer } = await adminClient
      .from('profiles')
      .select('email, full_name')
      .eq('id', review.reviewer_id)
      .single();

    if (reviewer) {
      if (action === 'publish') {
        await sendReviewPublished(reviewer.email, reviewer.full_name, firmName);
      } else {
        await sendReviewRemoved(reviewer.email, reviewer.full_name, firmName, notes);
      }
    }
  }

  // On publish: notify the firm that a review is now live
  if (action === 'publish' && firmEmail && firmName) {
    const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://campaign-grade.com';
    const safeFirmName = escapeHtml(firmName);
    const safeFirmSlug = encodeURIComponent(firmSlug);
    const { Resend } = await import('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);
    try {
      await resend.emails.send({
        from: 'CampaignGrade <noreply@campaign-grade.com>',
        to: firmEmail,
        subject: `${safeFirmName} just received a review on CampaignGrade`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1f2937;">
            <h2 style="color: #1e3a5f;">Your firm was just reviewed on CampaignGrade</h2>
            <p>A verified campaign principal has submitted a review of <strong>${safeFirmName}</strong> on CampaignGrade — the trusted platform for political professionals to evaluate consulting firms.</p>
            <p>CampaignGrade helps political campaigns make informed decisions about their vendors. Firm profiles include ratings on communication, value, results, and more.</p>
            <h3 style="color: #1e3a5f;">Claim your firm profile</h3>
            <p>As a firm representative, you can:</p>
            <ul>
              <li>View and respond to reviews</li>
              <li>Update your firm's profile information</li>
              <li>Showcase your work to potential clients</li>
            </ul>
            <p>
              <a href="${APP_URL}/firms/${safeFirmSlug}"
                 style="display: inline-block; background: #f59e0b; color: #1e3a5f; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; margin-right: 12px;">
                View Your Firm Profile
              </a>
              <a href="${APP_URL}/signup?next=${encodeURIComponent(`/claim/${safeFirmSlug}`)}"
                 style="display: inline-block; background: #1e3a5f; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">
                Create an Account to Claim
              </a>
            </p>
            <p style="margin-top: 24px; color: #6b7280; font-size: 12px;">You received this email because your firm was reviewed on CampaignGrade. If you believe this was in error, please contact <a href="mailto:admin@campaign-grade.com">admin@campaign-grade.com</a>.</p>
          </div>
        `,
      });
    } catch (err) {
      console.error('Failed to send firm notification email:', err);
      // Don't fail the publish action if email fails
    }
  }

  return NextResponse.json({ success: true });
}
