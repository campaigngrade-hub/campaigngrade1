import Link from 'next/link';
import { Firm } from '@/types';
import { getServiceLabel } from '@/lib/utils';
import { StarRatingDisplay } from './StarRating';
import Badge from './ui/Badge';
import Card from './ui/Card';

interface FirmCardProps {
  firm: Firm & { avg_rating?: number | null; review_count?: number };
}

export default function FirmCard({ firm }: FirmCardProps) {
  return (
    <Link href={`/firms/${firm.slug}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-navy text-base truncate pr-2">{firm.name}</h3>
            {firm.is_claimed && (
              <Badge variant="info" className="mt-1">Claimed</Badge>
            )}
          </div>
          {firm.logo_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={firm.logo_url}
              alt={firm.name}
              className="w-10 h-10 object-contain rounded flex-shrink-0"
            />
          )}
        </div>

        <div className="flex items-center gap-2 mb-3">
          <StarRatingDisplay value={firm.avg_rating ?? null} size="sm" />
          <span className="text-xs text-gray-500">
            ({firm.review_count ?? 0} {(firm.review_count ?? 0) === 1 ? 'review' : 'reviews'})
          </span>
        </div>

        {firm.services && firm.services.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {firm.services.slice(0, 4).map((s) => (
              <span
                key={s}
                className="inline-flex px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600"
              >
                {getServiceLabel(s)}
              </span>
            ))}
            {firm.services.length > 4 && (
              <span className="inline-flex px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-500">
                +{firm.services.length - 4} more
              </span>
            )}
          </div>
        )}

        {(firm as Firm & { has_pricing?: boolean }).has_pricing && (
          <p className="text-xs text-green-700 mt-2">✓ Pricing available</p>
        )}
      </Card>
    </Link>
  );
}
