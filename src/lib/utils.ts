import { BUDGET_TIERS, RACE_TYPES, REGIONS, SERVICE_CATEGORIES } from './constants';

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function getRaceTypeLabel(value: string): string {
  return RACE_TYPES.find((r) => r.value === value)?.label ?? value;
}

export function getRegionLabel(value: string): string {
  return REGIONS.find((r) => r.value === value)?.label ?? value;
}

export function getBudgetTierLabel(value: string): string {
  return BUDGET_TIERS.find((b) => b.value === value)?.label ?? value;
}

export function getServiceLabel(value: string): string {
  return SERVICE_CATEGORIES.find((s) => s.value === value)?.label ?? value;
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatRating(rating: number | null | undefined): string {
  if (rating == null) return 'N/A';
  return rating.toFixed(1);
}

export function getContextLine(review: {
  race_type: string;
  region?: string | null;
  cycle_year: number;
  budget_tier?: string | null;
  anonymization_level?: string;
}): string {
  const parts: string[] = [getRaceTypeLabel(review.race_type)];

  if (review.anonymization_level !== 'minimal' && review.region) {
    parts.push(getRegionLabel(review.region));
  }

  parts.push(String(review.cycle_year));

  if (review.anonymization_level !== 'minimal' && review.budget_tier) {
    parts.push(getBudgetTierLabel(review.budget_tier));
  }

  return parts.join(' · ');
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function calcAvgRating(reviews: { rating_overall: number }[]): number {
  if (!reviews.length) return 0;
  return reviews.reduce((sum, r) => sum + r.rating_overall, 0) / reviews.length;
}

export function hireAgainPercent(reviews: { would_hire_again: boolean }[]): number {
  if (!reviews.length) return 0;
  return Math.round((reviews.filter((r) => r.would_hire_again).length / reviews.length) * 100);
}
