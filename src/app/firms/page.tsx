import { createClient } from '@/lib/supabase/server';
import FirmDirectoryClient from './FirmDirectoryClient';

export const dynamic = 'force-dynamic';

export default async function FirmsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; service?: string; pricing?: string; min_rating?: string; sort?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from('firms')
    .select(`
      *,
      reviews!reviews_firm_id_fkey(rating_overall, would_hire_again)
    `)
    .order('name');

  if (params.service) {
    query = query.contains('services', [params.service]);
  }
  if (params.pricing) {
    query = query.eq('pricing_tier', params.pricing);
  }

  const { data: firms } = await query;

  // Compute stats and filter
  const firmsWithStats = (firms ?? [])
    .map((firm) => {
      const reviews = (firm.reviews as { rating_overall: number; would_hire_again: boolean }[]) ?? [];
      const published = reviews;
      const avg = published.length
        ? published.reduce((s, r) => s + r.rating_overall, 0) / published.length
        : null;
      const hire_again_pct = published.length
        ? Math.round((published.filter((r) => r.would_hire_again).length / published.length) * 100)
        : null;
      return {
        ...firm,
        avg_rating: avg,
        review_count: published.length,
        hire_again_pct,
      };
    })
    .filter((f) => {
      if (params.min_rating && f.avg_rating !== null && f.avg_rating < Number(params.min_rating)) return false;
      if (params.q) {
        const q = params.q.toLowerCase();
        if (!f.name.toLowerCase().includes(q)) return false;
      }
      return true;
    })
    .sort((a, b) => {
      const priceOrder = ['budget', 'mid', 'premium', 'enterprise'];
      switch (params.sort) {
        case 'rating':
          return (b.avg_rating ?? 0) - (a.avg_rating ?? 0);
        case 'reviews':
          return b.review_count - a.review_count;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price_asc':
          return (priceOrder.indexOf(a.pricing_tier ?? '') ?? 99) - (priceOrder.indexOf(b.pricing_tier ?? '') ?? 99);
        case 'price_desc':
          return (priceOrder.indexOf(b.pricing_tier ?? '') ?? 99) - (priceOrder.indexOf(a.pricing_tier ?? '') ?? 99);
        default:
          return (b.avg_rating ?? 0) - (a.avg_rating ?? 0);
      }
    });

  return <FirmDirectoryClient firms={firmsWithStats} initialParams={params} />;
}
