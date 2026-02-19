import Link from 'next/link';
import Card from '@/components/ui/Card';

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold text-navy mb-2">About CampaignGrade</h1>
      <p className="text-gray-500 mb-8">The trusted review platform for political consulting.</p>

      <div className="prose prose-gray max-w-none space-y-8">
        <Card>
          <h2 className="text-xl font-bold text-navy mb-3">What is CampaignGrade?</h2>
          <p className="text-gray-700 leading-relaxed">
            CampaignGrade is a review platform where verified political campaign principals — candidates,
            campaign managers, treasurers, and finance directors — can anonymously rate and review the
            consulting firms and vendors they hired during election cycles.
          </p>
          <p className="text-gray-700 leading-relaxed mt-3">
            Think of it as Glassdoor for political consulting, but from the client side. The platform
            exists to bring transparency to an industry where vendor quality is notoriously difficult
            to evaluate before signing a contract.
          </p>
        </Card>

        <Card>
          <h2 className="text-xl font-bold text-navy mb-3">How Verification Works</h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            Every reviewer on CampaignGrade must be a verified campaign principal. We verify manually:
          </p>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>You create an account and complete the verification form</li>
            <li>You provide the name and details of your campaign committee</li>
            <li>You upload evidence of your role (invoice, contract, FEC filing, or state filing)</li>
            <li>Our team reviews your submission, typically within 48 hours</li>
            <li>Once approved, you can submit reviews</li>
          </ol>
          <p className="text-gray-700 leading-relaxed mt-3">
            We do not use automated verification. Every submission is reviewed by a human.
          </p>
        </Card>

        <Card>
          <h2 className="text-xl font-bold text-navy mb-3">Anonymization</h2>
          <p className="text-gray-700 leading-relaxed">
            Reviewer identity is never shared publicly. Reviews display context information (race type,
            region, cycle year, budget range) but never the reviewer&apos;s name, email, or committee name.
            Firms cannot identify which campaign submitted a review.
          </p>
          <p className="text-gray-700 leading-relaxed mt-3">
            Reviewers can choose between two anonymization levels:
          </p>
          <ul className="list-disc list-inside space-y-1 text-gray-700 mt-2">
            <li><strong>Standard:</strong> Shows race type, region, cycle year, and budget tier</li>
            <li><strong>Minimal:</strong> Shows only race type and cycle year (for very small races)</li>
          </ul>
        </Card>

        <Card>
          <h2 className="text-xl font-bold text-navy mb-3">Who Can Review?</h2>
          <p className="text-gray-700 leading-relaxed">
            CampaignGrade is for verified campaign principals only:
          </p>
          <ul className="list-disc list-inside space-y-1 text-gray-700 mt-2">
            <li>Candidates</li>
            <li>Campaign managers</li>
            <li>Treasurers</li>
            <li>Finance directors</li>
            <li>Other senior campaign staff with direct vendor relationships</li>
          </ul>
          <p className="text-gray-700 mt-3">
            Campaign staff without direct hiring authority, political party operatives not attached to a
            specific committee, and vendors themselves are not eligible to submit reviews.
          </p>
        </Card>

        <Card>
          <h2 className="text-xl font-bold text-navy mb-3">For Consulting Firms</h2>
          <p className="text-gray-700 leading-relaxed">
            Firms can claim their profiles to respond to reviews and update their listing. Claiming
            is free and requires verification of your firm identity. Firms can respond to reviews once
            per review, and responses are published alongside the original review.
          </p>
          <p className="text-gray-700 mt-3">
            CampaignGrade does not remove reviews simply because firms disagree with ratings. We apply
            a content policy focused on factual accuracy and professional conduct.
          </p>
          <Link href="/content-policy" className="text-navy hover:underline text-sm mt-2 inline-block">
            Read our content policy →
          </Link>
        </Card>
      </div>
    </div>
  );
}
