export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold text-navy mb-2">Privacy Policy</h1>
      <p className="text-gray-500 mb-8">
        Last updated: {new Date().getFullYear()}. This policy explains how we collect and use your information.
      </p>

      <div className="space-y-6 text-gray-700 leading-relaxed">
        <section>
          <h2 className="text-xl font-bold text-navy mb-2">1. Information We Collect</h2>
          <p>When you use CampaignGrade, we collect:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Account information: name, email address, and password</li>
            <li>Verification information: committee details and uploaded evidence files</li>
            <li>Review content: ratings, written reviews, and structured data</li>
            <li>Usage data: page views and interactions (no advertising trackers)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-navy mb-2">2. How We Use Your Information</h2>
          <p>We use your information to:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Verify your identity and eligibility to submit reviews</li>
            <li>Publish anonymized reviews on the Platform</li>
            <li>Send transactional emails (verification status, review publication)</li>
            <li>Operate and improve the Platform</li>
            <li>Investigate fraud and abuse</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-navy mb-2">3. Anonymization of Reviews</h2>
          <p>
            Your name, email, and committee name are <strong>never shared publicly</strong> or with
            consulting firms. Published reviews display only anonymized context: race type, region
            (not state), cycle year, and budget tier. Firms cannot identify which campaign submitted
            a review.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-navy mb-2">4. Evidence Files</h2>
          <p>
            Uploaded verification evidence (invoices, contracts, filing screenshots) is reviewed by
            our staff solely for the purpose of verifying your eligibility. Evidence files are stored
            in a private, encrypted bucket and are automatically deleted within 90 days of upload.
            Only a confirmation record of your verified status is retained.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-navy mb-2">5. Data Sharing</h2>
          <p>We do not sell, rent, or share your personal information with third parties except:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Service providers who operate the Platform (Supabase, Vercel, Resend)</li>
            <li>When required by valid legal process (court orders, subpoenas)</li>
            <li>To prevent imminent harm or fraud</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-navy mb-2">6. Legal Process</h2>
          <p>
            If we receive a valid legal order requiring disclosure of your identity, we will:
            (a) notify you as promptly as legally permitted; (b) challenge overly broad orders;
            and (c) disclose only what is legally required. We do not proactively share reviewer
            identity with firms or any third parties absent legal compulsion.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-navy mb-2">7. Data Retention</h2>
          <p>
            Account data is retained as long as your account is active. You may request account
            deletion at any time by contacting admin@campaign-grade.com. Published reviews associated
            with your account will be anonymized (reviewer ID removed) upon account deletion.
            Verification evidence is deleted within 90 days regardless.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-navy mb-2">8. Security</h2>
          <p>
            We use industry-standard security measures including TLS encryption, row-level security
            in our database, and private storage buckets for sensitive files. No security system is
            perfect; we encourage you to use a strong password.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-navy mb-2">9. Contact</h2>
          <p>
            Privacy questions or requests:{' '}
            <a href="mailto:admin@campaign-grade.com" className="text-navy hover:underline">
              admin@campaign-grade.com
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
