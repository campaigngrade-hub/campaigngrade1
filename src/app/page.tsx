import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import FirmCard from '@/components/FirmCard';
import ReviewCard from '@/components/ReviewCard';
import Button from '@/components/ui/Button';
import { HeroCTA, BottomCTA } from '@/components/HeroCTA';
import { Review } from '@/types';

export default async function HomePage() {
  const supabase = await createClient();

  // Fetch top-rated firms (by average rating)
  const { data: firms } = await supabase
    .from('firms')
    .select('*')
    .limit(6);

  // Fetch recent published reviews
  const { data: reviews } = await supabase
    .from('reviews')
    .select('*, firms(name, slug), firm_responses(*)')
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(3);

  // Get total stats
  const { count: reviewCount } = await supabase
    .from('reviews')
    .select('id', { count: 'exact' })
    .eq('status', 'published');

  const { count: firmCount } = await supabase
    .from('firms')
    .select('id', { count: 'exact' });

  return (
    <div>
      {/* Hero */}
      <section className="bg-navy text-white py-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            The review platform political campaigns trust
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-8">
            Verified reviews of political consulting firms, written by the candidates, campaign
            managers, and finance directors who hired them.
          </p>
          <HeroCTA />

          {/* Stats */}
          <div className="flex gap-8 justify-center mt-12 text-center">
            <div>
              <p className="text-3xl font-bold text-amber-400">{reviewCount ?? 0}</p>
              <p className="text-sm text-gray-300">Verified Reviews</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-amber-400">{firmCount ?? 0}</p>
              <p className="text-sm text-gray-300">Firms Listed</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-amber-400">100%</p>
              <p className="text-sm text-gray-300">Verified Reviewers</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-navy text-center mb-10">How CampaignGrade Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Verify your role',
                desc: 'Submit documentation proving you were a principal on a campaign committee. Our team verifies manually.',
              },
              {
                step: '2',
                title: 'Rate your vendors',
                desc: 'Rate firms on communication, budget transparency, results, responsiveness, and strategic quality.',
              },
              {
                step: '3',
                title: 'Help the community',
                desc: 'Your anonymous review helps other campaigns make better hiring decisions. Firms can respond.',
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 rounded-full bg-navy text-white text-lg font-bold flex items-center justify-center mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="font-semibold text-navy mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured firms */}
      {firms && firms.length > 0 && (
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-navy">Firms on CampaignGrade</h2>
              <Link href="/firms" className="text-navy text-sm font-medium hover:underline">
                View all →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {firms.map((firm) => (
                <FirmCard key={firm.id} firm={firm} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Recent reviews */}
      {reviews && reviews.length > 0 && (
        <section className="py-16 px-4 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-navy mb-8">Recent Reviews</h2>
            {reviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review as Review & { firm?: { name: string; slug: string } }}
                showFirmName
              />
            ))}
            <div className="text-center mt-6">
              <Link href="/firms" className="text-navy font-medium hover:underline">
                Browse all firms and reviews →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-16 px-4 bg-navy text-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Have you hired a political consultant?</h2>
          <p className="text-gray-300 mb-8">
            Your verified review helps campaigns make smarter decisions. It takes less than 10 minutes.
          </p>
          <BottomCTA />
        </div>
      </section>
    </div>
  );
}
