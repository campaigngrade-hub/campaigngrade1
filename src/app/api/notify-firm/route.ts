import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = 'CampaignGrade <noreply@campaigngrade.com>';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://campaigngrade1.vercel.app';

export async function POST(req: NextRequest) {
  // Verify the request comes from an authenticated user
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { firmName, firmSlug, firmEmail } = await req.json();

  if (!firmEmail || !firmName) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    await resend.emails.send({
      from: FROM,
      to: firmEmail,
      subject: `${firmName} just received a review on CampaignGrade`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
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
               style="display: inline-block; background: #f59e0b; color: #1e3a5f; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">
              View Your Firm Profile
            </a>
          </p>
          <p>To claim your firm profile or learn more, visit <a href="${APP_URL}">${APP_URL}</a> or contact us at <a href="mailto:admin@campaigngrade.com">admin@campaigngrade.com</a>.</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
          <p style="color: #6b7280; font-size: 12px;">You received this email because your firm was reviewed on CampaignGrade. If you believe this was in error, please contact admin@campaigngrade.com.</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error sending firm notification email:', err);
    // Don't fail the review submission if email fails
    return NextResponse.json({ success: false, error: 'Email send failed' }, { status: 500 });
  }
}
