import Card from '@/components/ui/Card';

export default function ContentPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold text-navy mb-2">Content Policy</h1>
      <p className="text-gray-500 mb-8">
        Last updated: {new Date().getFullYear()}. This policy governs all content submitted to CampaignGrade.
      </p>

      <Card className="mb-6">
        <h2 className="text-xl font-bold text-navy mb-4">What We Allow</h2>
        <p className="text-gray-700 leading-relaxed">
          CampaignGrade is a platform for genuine professional opinions from verified campaign principals.
          We encourage honest, specific, and constructive reviews of your professional experiences
          with political consulting firms and vendors.
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-700 mt-4">
          <li>Honest assessments of your working relationship with a firm</li>
          <li>Opinions about quality of work, responsiveness, and value</li>
          <li>Constructive criticism of professional conduct</li>
          <li>Comparisons to your expectations or prior engagements (without naming competitors)</li>
        </ul>
      </Card>

      <Card className="mb-6">
        <h2 className="text-xl font-bold text-navy mb-4">What We Do Not Allow</h2>
        <p className="text-gray-700 mb-4">
          The following content will be removed from CampaignGrade:
        </p>

        <div className="space-y-4">
          {[
            {
              title: '1. Allegations of criminal conduct',
              body: 'Reviews may not accuse a firm or its employees of crimes, including fraud, embezzlement, or other illegal activity. Criminal allegations require law enforcement involvement, not a review platform.',
            },
            {
              title: '2. Personal attacks on named individuals',
              body: 'Reviews are about firms, not individual people. You may describe behaviors ("the account manager was consistently unresponsive") but may not name or personally attack specific individuals ("John Smith is a fraud").',
            },
            {
              title: '3. Confidential financial specifics',
              body: 'Do not disclose exact contract amounts, proprietary strategies shared under NDA, or donor information. You may reference budget ranges (already captured in structured fields).',
            },
            {
              title: '4. Demonstrably false factual claims',
              body: 'Opinions are protected. "I felt they were overpriced" is an opinion. "They embezzled campaign funds" is a factual claim that requires evidence. Reviews must reflect genuine experiences and opinions, not fabrications.',
            },
            {
              title: '5. Off-topic content',
              body: 'Reviews must relate to the professional engagement. Personal gossip, political disagreements with the firm\'s other clients, or content unrelated to the reviewer\'s experience as a client will be removed.',
            },
            {
              title: '6. Commercially motivated content',
              body: 'Reviews written to promote a competing firm or as part of a coordinated campaign to damage a firm\'s reputation will be removed and the account will be banned.',
            },
          ].map((item) => (
            <div key={item.title} className="border-l-4 border-amber-400 pl-4">
              <h3 className="font-semibold text-navy mb-1">{item.title}</h3>
              <p className="text-gray-700 text-sm">{item.body}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card className="mb-6">
        <h2 className="text-xl font-bold text-navy mb-4">Moderation Process</h2>
        <p className="text-gray-700 leading-relaxed">
          All reviews are submitted to a moderation queue before publication. Our team reviews each
          submission for compliance with this policy. We typically respond within 24–48 hours.
        </p>
        <p className="text-gray-700 leading-relaxed mt-3">
          Firms may flag reviews for policy violations. Flagged reviews are reviewed by our staff.
          We do not remove reviews simply because a firm disagrees with the rating. We evaluate
          flags against this content policy.
        </p>
        <p className="text-gray-700 leading-relaxed mt-3">
          Reviews are either published as submitted or rejected entirely. We do not edit review content.
        </p>
      </Card>

      <Card>
        <h2 className="text-xl font-bold text-navy mb-4">Appeals</h2>
        <p className="text-gray-700 leading-relaxed">
          If your review was rejected and you believe it complies with this policy, contact us at{' '}
          <a href="mailto:admin@campaigngrade.com" className="text-navy hover:underline">
            admin@campaigngrade.com
          </a>{' '}
          with your account email and the firm you reviewed. We will review your appeal within 5 business days.
        </p>
      </Card>
    </div>
  );
}
