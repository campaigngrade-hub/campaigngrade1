import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import Card from '@/components/ui/Card';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (!profile || profile.role !== 'platform_admin') redirect('/dashboard');

  const adminClient = createAdminClient();

  const [
    { count: pendingVerifications },
    { count: pendingReviews },
    { count: pendingFlags },
    { count: totalFirms },
    { count: totalReviews },
    { count: totalUsers },
  ] = await Promise.all([
    adminClient.from('verification_submissions').select('id', { count: 'exact' }).eq('status', 'pending'),
    adminClient.from('reviews').select('id', { count: 'exact' }).eq('status', 'pending'),
    adminClient.from('review_flags').select('id', { count: 'exact' }).eq('status', 'pending'),
    adminClient.from('firms').select('id', { count: 'exact' }),
    adminClient.from('reviews').select('id', { count: 'exact' }),
    adminClient.from('profiles').select('id', { count: 'exact' }),
  ]);

  const stats = [
    { label: 'Pending Verifications', value: pendingVerifications ?? 0, href: '/admin/verifications', urgent: (pendingVerifications ?? 0) > 0 },
    { label: 'Pending Reviews', value: pendingReviews ?? 0, href: '/admin/reviews', urgent: (pendingReviews ?? 0) > 0 },
    { label: 'Pending Flags', value: pendingFlags ?? 0, href: '/admin/flags', urgent: (pendingFlags ?? 0) > 0 },
  ];

  const totals = [
    { label: 'Total Firms', value: totalFirms ?? 0, href: '/admin/firms' },
    { label: 'Total Reviews', value: totalReviews ?? 0, href: '/admin/reviews/all' },
    { label: 'Total Users', value: totalUsers ?? 0, href: '/admin/users' },
  ];

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold text-navy mb-8">Admin Dashboard</h1>

      <h2 className="font-semibold text-navy mb-4">Action Required</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card className={`hover:shadow-md transition-shadow cursor-pointer ${stat.urgent ? 'border-amber-400' : ''}`}>
              <p className={`text-3xl font-bold mb-1 ${stat.urgent ? 'text-amber-600' : 'text-navy'}`}>
                {stat.value}
              </p>
              <p className="text-sm text-gray-600">{stat.label}</p>
            </Card>
          </Link>
        ))}
      </div>

      <h2 className="font-semibold text-navy mb-4">Platform Stats</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {totals.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <p className="text-3xl font-bold text-navy mb-1">{stat.value}</p>
              <p className="text-sm text-gray-600">{stat.label}</p>
            </Card>
          </Link>
        ))}
      </div>

      <h2 className="font-semibold text-navy mb-4">Quick Links</h2>
      <div className="flex flex-wrap gap-3">
        {[
          { label: 'Verification Queue', href: '/admin/verifications' },
          { label: 'Review Moderation', href: '/admin/reviews' },
          { label: 'Flag Queue', href: '/admin/flags' },
          { label: 'Manage Firms', href: '/admin/firms' },
          { label: 'Manage Users', href: '/admin/users' },
        ].map((link) => (
          <Link
            key={link.label}
            href={link.href}
            className="px-4 py-2 bg-navy text-white text-sm rounded hover:bg-navy-dark transition-colors"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
