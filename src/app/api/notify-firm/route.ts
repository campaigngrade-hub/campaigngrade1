import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = 'CampaignGrade <noreply@campaign-grade.com>';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://campaigngrade1.vercel.app';

export async function POST(req: NextRequest) {
  // Verify the request comes from an authenticated user
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { firmName, firmSlug, firmEmail, firmId } = await req.json();

  if (!firmEmail || !firmName) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // Save contact_email to the firm using admin client (bypasses RLS)
  if (firmId) {
    const adminClient = createAdminClient();
    await adminClient
      .from('firms')
      .update({ contact_email: firmEmail })
      .eq('id', firmId)
      .is('contact_email', null); // Only set if not already set
  }

  try {
    await resend.emails.send({
      from: FROM,
      to: firmEmail,
      subject: `${firmName} just received a review on CampaignGrade`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1f2937;">
          <h2 style="color: #1e3a5f;">Your firm was just reviewed on CampaignGrade</h2>
          <p>A verified campaign principal has submitted a review of <strong>${firmName}</strong> on CampaignGrade — the trusted platform for political professionals to evaluate consulting firms.</p>
          <p>CampaignGrade helps political campaigns make informed decisions about their vendors. Firm profiles include ratings on communication, value, results, and more.</p>
          <h3 style="color: #1e3a5f;">Claim your firm profile</h3>
          <p>As a firm representative, you can:</p>
          <ul>
            <li>View and respond to reviews</li>
            <li>Update your firm's profile information</li>
            <li>Showcase your work to potential clients</li>
          </ul>
          <p>
            <a href="${APP_URL}/firms/${firmSlug}"
               style="display: inline-block; background: #f59e0b; color: #1e3a5f; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; margin-right: 12px;">
              View Your Firm Profile
            </a>
            <a href="${APP_URL}/signup"
               style="display: inline-block; background: #1e3a5f; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">
              Create an Account to Claim
            </a>
          </p>
          <p style="margin-top: 24px;">To claim your firm profile or learn more, visit <a href="${APP_URL}">${APP_URL}</a> or contact us at <a href="mailto:admin@campaign-grade.com">admin@campaign-grade.com</a>.</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
          <p style="color: #6b7280; font-size: 12px;">You received this email because your firm was reviewed on CampaignGrade. If you believe this was in error, please contact admin@campaign-grade.com.</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error sending firm notification email:', err);
    // Don't fail — review was already saved successfully
    return NextResponse.json({ success: false, error: 'Email send failed' }, { status: 200 });
  }
}
