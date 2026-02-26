import { createClient } from '@/lib/supabase/server';
import FirmDirectoryClient from './FirmDirectoryClient';

export const dynamic = 'force-dynamic';

export default async function FirmsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; service?: string; has_pricing?: string; min_rating?: string; sort?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from('firms')
    .select(`
      *,
      reviews!reviews_firm_id_fkey(rating_overall, would_hire_again),
      firm_pricing(id)
    `)
    .order('name');

  if (params.service) {
    query = query.contains('services', [params.service]);
  }

  const { data: firms } = await query;

  // Compute stats and filter
  const firmsWithStats = (firms ?? [])
    .map((firm) => {
      const reviews = (firm.reviews as { rating_overall: number; would_hire_again: boolean }[]) ?? [];
      const avg = reviews.length
        ? reviews.reduce((s, r) => s + r.rating_overall, 0) / reviews.length
        : null;
      const hire_again_pct = reviews.length
        ? Math.round((reviews.filter((r) => r.would_hire_again).length / reviews.length) * 100)
        : null;
      const has_pricing = Array.isArray(firm.firm_pricing) && firm.firm_pricing.length > 0;
      return {
        ...firm,
        avg_rating: avg,
        review_count: reviews.length,
        hire_again_pct,
        has_pricing,
      };
    })
    .filter((f) => {
      if (params.min_rating && f.avg_rating !== null && f.avg_rating < Number(params.min_rating)) return false;
      if (params.has_pricing === '1' && !f.has_pricing) return false;
      if (params.q) {
        const q = params.q.toLowerCase();
        if (!f.name.toLowerCase().includes(q)) return false;
      }
      return true;
    })
    .sort((a, b) => {
      switch (params.sort) {
        case 'rating':
          return (b.avg_rating ?? 0) - (a.avg_rating ?? 0);
        case 'reviews':
          return b.review_count - a.review_count;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return (b.avg_rating ?? 0) - (a.avg_rating ?? 0);
      }
    });

  return <FirmDirectoryClient firms={firmsWithStats} initialParams={params} />;
}
