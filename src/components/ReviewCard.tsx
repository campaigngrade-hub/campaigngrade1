import { Review } from '@/types';
import { cn, formatDate, getContextLine } from '@/lib/utils';
import { StarRatingDisplay } from './StarRating';
import Badge from './ui/Badge';
import Card from './ui/Card';
import { RATING_CATEGORIES } from '@/lib/constants';

interface ReviewCardProps {
  review: Review & { firm?: { name: string; slug: string } };
  showFirmName?: boolean;
  showFlagButton?: boolean;
  onFlag?: () => void;
}

export default function ReviewCard({
  review,
  showFirmName = false,
  showFlagButton = false,
  onFlag,
}: ReviewCardProps) {
  const ratingCategories = RATING_CATEGORIES.filter((c) => c.key !== 'rating_overall');

  return (
    <Card className="mb-4">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex flex-wrap gap-2">
          <Badge variant="navy">Verified Campaign Principal</Badge>
          {review.has_invoice_evidence && review.invoice_verified_by && (
            <Badge variant="success">Verified Engagement</Badge>
          )}
        </div>
        <div className="flex items-center gap-2 ml-4">
          {showFlagButton && (
            <button
              onClick={onFlag}
              className="text-xs text-gray-400 hover:text-red-500 transition-colors"
            >
              Flag
            </button>
          )}
          <span className="text-xs text-gray-400">{formatDate(review.created_at)}</span>
        </div>
      </div>

      {showFirmName && review.firm && (
        <a
          href={`/firms/${review.firm.slug}`}
          className="text-sm font-semibold text-navy hover:underline block mb-2"
        >
          {review.firm.name}
        </a>
      )}

      {/* Overall rating */}
      <div className="flex items-center gap-3 mb-2">
        <StarRatingDisplay value={review.rating_overall} size="lg" />
      </div>

      {/* Context line */}
      <p className="text-sm text-gray-500 mb-3">
        {getContextLine(review)}
        {review.services_used && review.services_used.length > 0 && ` · ${review.services_used.join(', ')}`}
      </p>

      {/* Would hire again */}
      <div className="mb-3">
        <span
          className={cn(
            'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
            review.would_hire_again
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          )}
        >
          {review.would_hire_again ? '✓ Would hire again' : '✗ Would not hire again'}
        </span>
      </div>

      {/* Review text */}
      <p className="text-sm text-gray-800 mb-3 leading-relaxed">{review.review_text}</p>

      {/* Pros/Cons */}
      {(review.pros || review.cons) && (
        <div className="grid grid-cols-2 gap-3 mb-3">
          {review.pros && (
            <div>
              <p className="text-xs font-semibold text-green-700 mb-1">Pros</p>
              <p className="text-sm text-gray-700">{review.pros}</p>
            </div>
          )}
          {review.cons && (
            <div>
              <p className="text-xs font-semibold text-red-700 mb-1">Cons</p>
              <p className="text-sm text-gray-700">{review.cons}</p>
            </div>
          )}
        </div>
      )}

      {/* Category ratings */}
      <div className="border-t border-gray-100 pt-3 mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
        {ratingCategories.map((cat) => {
          const val = review[cat.key as keyof Review] as number | null;
          if (!val) return null;
          return (
            <div key={cat.key} className="flex items-center justify-between">
              <span className="text-xs text-gray-500">{cat.label}</span>
              <StarRatingDisplay value={val} size="sm" />
            </div>
          );
        })}
      </div>

      {/* Firm response */}
      {review.firm_response && review.firm_response.status === 'published' && (
        <div className="mt-4 ml-4 pl-4 border-l-2 border-amber-300 bg-amber-50 rounded-r-md p-3">
          <p className="text-xs font-semibold text-gray-700 mb-1">Response from the firm</p>
          <p className="text-sm text-gray-700">{review.firm_response.response_text}</p>
          <p className="text-xs text-gray-400 mt-1">{formatDate(review.firm_response.created_at)}</p>
        </div>
      )}
    </Card>
  );
}
