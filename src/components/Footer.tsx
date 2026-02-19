import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-navy text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-white font-bold text-lg mb-2">
              <span className="text-amber-400">Campaign</span>Grade
            </h3>
            <p className="text-sm leading-relaxed">
              Verified reviews of political consulting firms, from the clients who hired them.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3 text-sm uppercase tracking-wide">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/firms" className="hover:text-white transition-colors">Browse Firms</Link></li>
              <li><Link href="/reviews/new" className="hover:text-white transition-colors">Submit a Review</Link></li>
              <li><Link href="/about" className="hover:text-white transition-colors">How It Works</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3 text-sm uppercase tracking-wide">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/content-policy" className="hover:text-white transition-colors">Content Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} CampaignGrade. All rights reserved.
          </p>
          <p className="text-xs text-gray-500">
            Reviews represent the opinions of verified campaign principals and are protected
            under Section 230 of the Communications Decency Act.
          </p>
        </div>
      </div>
    </footer>
  );
}
