export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold text-navy mb-2">Terms of Service</h1>
      <p className="text-gray-500 mb-8">
        Last updated: {new Date().getFullYear()}. By using CampaignGrade, you agree to these terms.
      </p>

      <div className="space-y-6 text-gray-700 leading-relaxed">
        <section>
          <h2 className="text-xl font-bold text-navy mb-2">1. Acceptance of Terms</h2>
          <p>
            By accessing or using CampaignGrade (&quot;the Platform&quot;), you agree to be bound by these
            Terms of Service. If you do not agree, do not use the Platform.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-navy mb-2">2. Eligibility</h2>
          <p>
            You must be a verified campaign principal (candidate, campaign manager, treasurer, finance
            director, or other senior campaign staff with direct vendor relationships) to submit reviews.
            You must be at least 18 years old to use the Platform.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-navy mb-2">3. Accuracy of Reviews</h2>
          <p>
            By submitting a review, you represent and warrant that: (a) your review reflects your
            genuine experience and personal opinion; (b) you were a principal on the campaign committee
            you identified; (c) you directly engaged the firm you reviewed; and (d) to the best of
            your knowledge, all factual claims in your review are accurate.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-navy mb-2">4. User Indemnification</h2>
          <p>
            You agree to indemnify, defend, and hold harmless CampaignGrade, its officers, directors,
            employees, and agents from and against any claims, liabilities, damages, losses, and expenses,
            including attorneys&apos; fees, arising out of or in connection with your review content or your
            use of the Platform.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-navy mb-2">5. Content Removal</h2>
          <p>
            CampaignGrade reserves the right to remove any content at its sole discretion, including
            content that violates our Content Policy or these Terms. We do not edit review content —
            reviews are published as submitted or removed entirely.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-navy mb-2">6. Section 230 Notice</h2>
          <p>
            CampaignGrade is a platform for third-party content. Reviews represent the opinions of
            verified campaign principals and are not the opinions of CampaignGrade. CampaignGrade
            does not adopt or endorse any review as its own speech. This Platform is operated
            consistent with Section 230 of the Communications Decency Act.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-navy mb-2">7. Prohibited Conduct</h2>
          <p>You agree not to:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Submit false or fraudulent reviews</li>
            <li>Create multiple accounts to manipulate ratings</li>
            <li>Submit reviews on behalf of competitors to damage firm reputations</li>
            <li>Attempt to identify anonymous reviewers</li>
            <li>Use the Platform for any unlawful purpose</li>
            <li>Attempt to circumvent our verification process</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-navy mb-2">8. Dispute Resolution</h2>
          <p>
            All disputes arising from your use of the Platform shall be resolved through binding
            arbitration in accordance with the American Arbitration Association rules. You waive
            your right to a jury trial and your right to participate in class action litigation.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-navy mb-2">9. Limitation of Liability</h2>
          <p>
            CampaignGrade shall not be liable for any indirect, incidental, special, consequential,
            or punitive damages arising from your use of the Platform or reliance on any review
            content, even if advised of the possibility of such damages.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-navy mb-2">10. Changes to Terms</h2>
          <p>
            We reserve the right to modify these Terms at any time. Continued use of the Platform
            after changes constitutes acceptance of the revised Terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-navy mb-2">11. Contact</h2>
          <p>
            Questions about these Terms? Contact us at{' '}
            <a href="mailto:admin@campaign-grade.com" className="text-navy hover:underline">
              admin@campaign-grade.com
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
