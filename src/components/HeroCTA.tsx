'use client';

import Link from 'next/link';
import { useProfile } from '@/hooks/useProfile';
import Button from './ui/Button';

export function HeroCTA() {
  const { profile, loading } = useProfile();
  const href = loading ? '#' : profile?.is_verified ? '/reviews/new' : profile ? '/verify' : '/signup';

  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center">
      <Link href={href}>
        <Button variant="secondary" size="lg">Rate a Firm</Button>
      </Link>
      <Link href="/firms">
        <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-navy">
          Browse Firms
        </Button>
      </Link>
    </div>
  );
}

export function BottomCTA() {
  const { profile, loading } = useProfile();
  const href = loading ? '#' : profile?.is_verified ? '/reviews/new' : profile ? '/verify' : '/signup';

  return (
    <Link href={href}>
      <Button variant="secondary" size="lg">Rate a Firm You&apos;ve Worked With</Button>
    </Link>
  );
}
