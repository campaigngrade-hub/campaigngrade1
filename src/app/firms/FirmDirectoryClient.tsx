'use client';

import { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import FirmCard from '@/components/FirmCard';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { SERVICE_CATEGORIES } from '@/lib/constants';
import { Firm } from '@/types';

type FirmWithStats = Firm & {
  avg_rating: number | null;
  review_count: number;
  hire_again_pct: number | null;
};

interface Props {
  firms: FirmWithStats[];
  initialParams: {
    q?: string;
    service?: string;
    has_pricing?: string;
    min_rating?: string;
    sort?: string;
  };
}

export default function FirmDirectoryClient({ firms, initialParams }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const [search, setSearch] = useState(initialParams.q ?? '');

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    startTransition(() => router.push(`/firms?${params.toString()}`));
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    updateParam('q', search);
  }

  return (
    <div className="max-w-7xl mx-auto py-10 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-navy mb-2">Political Consulting Firms</h1>
        <p className="text-gray-500">Browse verified reviews from campaign principals.</p>
      </div>

      {/* Search and filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <form onSubmit={handleSearch} className="col-span-full sm:col-span-2">
          <div className="relative">
            <Input
              placeholder="Search firm name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </form>

        <Select
          id="service"
          options={SERVICE_CATEGORIES as unknown as { value: string; label: string }[]}
          placeholder="All services"
          value={initialParams.service ?? ''}
          onChange={(e) => updateParam('service', e.target.value)}
        />

        <label className="flex items-center gap-2 cursor-pointer self-end pb-2">
          <input
            type="checkbox"
            checked={initialParams.has_pricing === '1'}
            onChange={(e) => updateParam('has_pricing', e.target.checked ? '1' : '')}
            className="rounded border-gray-300 text-navy focus:ring-navy"
          />
          <span className="text-sm text-gray-700">Has public pricing</span>
        </label>

        <Select
          id="min_rating"
          options={[
            { value: '4', label: '4+ stars' },
            { value: '3', label: '3+ stars' },
            { value: '2', label: '2+ stars' },
          ]}
          placeholder="Min rating"
          value={initialParams.min_rating ?? ''}
          onChange={(e) => updateParam('min_rating', e.target.value)}
        />

        <Select
          id="sort"
          options={[
            { value: 'rating', label: 'Highest rated' },
            { value: 'reviews', label: 'Most reviewed' },
            { value: 'name', label: 'Alphabetical' },
          ]}
          placeholder="Sort by..."
          value={initialParams.sort ?? 'rating'}
          onChange={(e) => updateParam('sort', e.target.value)}
        />
      </div>

      <p className="text-sm text-gray-500 mb-4">
        {firms.length} firm{firms.length !== 1 ? 's' : ''}
      </p>

      {firms.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-lg">No firms found matching your filters.</p>
          <button
            className="mt-4 text-navy underline"
            onClick={() => router.push('/firms')}
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {firms.map((firm) => (
            <FirmCard key={firm.id} firm={firm} />
          ))}
        </div>
      )}
    </div>
  );
}
