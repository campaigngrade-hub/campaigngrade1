'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

interface StarRatingInputProps {
  value: number;
  onChange: (value: number) => void;
  label?: string;
  error?: string;
  required?: boolean;
}

export function StarRatingInput({ value, onChange, label, error, required }: StarRatingInputProps) {
  const [hovered, setHovered] = useState(0);

  return (
    <div>
      {label && (
        <p className="text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </p>
      )}
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            className="focus:outline-none"
            aria-label={`${star} star${star !== 1 ? 's' : ''}`}
          >
            <svg
              className={cn(
                'w-7 h-7 transition-colors',
                (hovered || value) >= star ? 'text-amber-500' : 'text-gray-300'
              )}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        ))}
        {value > 0 && (
          <span className="ml-2 text-sm text-gray-500 self-center">{value}/5</span>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

interface StarRatingDisplayProps {
  value: number | null | undefined;
  size?: 'sm' | 'md' | 'lg';
  showNumber?: boolean;
  label?: string;
}

export function StarRatingDisplay({
  value,
  size = 'md',
  showNumber = true,
  label,
}: StarRatingDisplayProps) {
  const sizes = { sm: 'w-3 h-3', md: 'w-4 h-4', lg: 'w-5 h-5' };
  const rating = value ?? 0;
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;

  return (
    <div className="flex items-center gap-1">
      {label && <span className="text-sm text-gray-600 mr-1">{label}:</span>}
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={cn(
            sizes[size],
            star <= fullStars
              ? 'text-amber-500'
              : star === fullStars + 1 && hasHalf
              ? 'text-amber-300'
              : 'text-gray-300'
          )}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      {showNumber && value != null && (
        <span className="text-sm text-gray-700 ml-1 font-medium">{value.toFixed(1)}</span>
      )}
      {value == null && <span className="text-sm text-gray-400">No ratings yet</span>}
    </div>
  );
}
