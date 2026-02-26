import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = 'CampaignGrade <noreply@campaign-grade.com>';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://campaign-grade.com';
const ADMIN_EMAIL = 'admin@campaign-grade.com';

export async function sendVerificationApproved(email: string, name: string) {
  try {
    await resend.emails.send({
      from: FROM,
      to: email,
      subject: "You're verified on CampaignGrade!",
      html: `
        <h2>Welcome, ${name}!</h2>
        <p>Your identity has been verified. You can now submit reviews on CampaignGrade.</p>
        <p><a href="${APP_URL}/reviews/new">Submit your first review</a></p>
        <p>Thank you for helping the political community make better vendor decisions.</p>
      `,
    });
  } catch (err) {
    console.error('Email send error (verification approved):', err);
  }
}

export async function sendVerificationRejected(
  email: string,
  name: string,
  reason: string
) {
  try {
    await resend.emails.send({
      from: FROM,
      to: email,
      subject: "CampaignGrade verification update",
      html: `
        <h2>Hi ${name},</h2>
        <p>We were unable to verify your submission for the following reason:</p>
        <blockquote>${reason}</blockquote>
        <p>You can resubmit with additional documentation at <a href="${APP_URL}/verify">${APP_URL}/verify</a></p>
        <p>If you have questions, contact us at ${ADMIN_EMAIL}.</p>
      `,
    });
  } catch (err) {
    console.error('Email send error (verification rejected):', err);
  }
}

export async function sendReviewPublished(email: string, name: string, firmName: string) {
  try {
    await resend.emails.send({
      from: FROM,
      to: email,
      subject: `Your review of ${firmName} has been published`,
      html: `
        <h2>Hi ${name},</h2>
        <p>Your review of <strong>${firmName}</strong> has been reviewed and published on CampaignGrade.</p>
        <p>Thank you for contributing to our community.</p>
        <p><a href="${APP_URL}/dashboard">View your reviews</a></p>
      `,
    });
  } catch (err) {
    console.error('Email send error (review published):', err);
  }
}

export async function sendReviewRemoved(
  email: string,
  name: string,
  firmName: string,
  reason: string
) {
  try {
    await resend.emails.send({
      from: FROM,
      to: email,
      subject: `Your review of ${firmName} has been removed`,
      html: `
        <h2>Hi ${name},</h2>
        <p>Your review of <strong>${firmName}</strong> has been removed for the following reason:</p>
        <blockquote>${reason}</blockquote>
        <p>Please review our <a href="${APP_URL}/content-policy">content policy</a> for guidelines.</p>
        <p>If you believe this decision was in error, contact us at ${ADMIN_EMAIL}.</p>
      `,
    });
  } catch (err) {
    console.error('Email send error (review removed):', err);
  }
}

export async function sendNewReviewNotification(
  firmAdminEmail: string,
  firmName: string,
  firmSlug: string
) {
  try {
    await resend.emails.send({
      from: FROM,
      to: firmAdminEmail,
      subject: `New review posted for ${firmName}`,
      html: `
        <h2>New Review on CampaignGrade</h2>
        <p>A new review has been posted for <strong>${firmName}</strong>.</p>
        <p><a href="${APP_URL}/firms/${firmSlug}">View the review</a></p>
        <p><a href="${APP_URL}/firm-dashboard/reviews">Respond in your firm dashboard</a></p>
      `,
    });
  } catch (err) {
    console.error('Email send error (new review notification):', err);
  }
}

export async function sendFlagResolution(
  email: string,
  name: string,
  outcome: 'upheld' | 'dismissed'
) {
  try {
    await resend.emails.send({
      from: FROM,
      to: email,
      subject: `Flag resolution: ${outcome}`,
      html: `
        <h2>Hi ${name},</h2>
        <p>The review you flagged has been <strong>${outcome}</strong>.</p>
        ${outcome === 'upheld' ? '<p>The review has been removed from CampaignGrade.</p>' : '<p>The review remains published on CampaignGrade.</p>'}
        <p>Thank you for helping maintain the quality of our platform.</p>
      `,
    });
  } catch (err) {
    console.error('Email send error (flag resolution):', err);
  }
}
