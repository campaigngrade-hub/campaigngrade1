import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { getServiceLabel } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function AdminFirmsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (!profile || profile.role !== 'platform_admin') redirect('/dashboard');

  const adminClient = createAdminClient();
  const { data: firms } = await adminClient
    .from('firms')
    .select('*')
    .order('name');

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-navy">Manage Firms</h1>
        <span className="text-gray-500 text-sm">{firms?.length ?? 0} firms total</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left pb-2 font-medium text-gray-600">Firm</th>
              <th className="text-left pb-2 font-medium text-gray-600">Services</th>
              <th className="text-left pb-2 font-medium text-gray-600">Party</th>
              <th className="text-left pb-2 font-medium text-gray-600">Status</th>
              <th className="text-left pb-2 font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {firms?.map((firm) => (
              <tr key={firm.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3">
                  <Link href={`/firms/${firm.slug}`} className="font-medium text-navy hover:underline">
                    {firm.name}
                  </Link>
                  <p className="text-xs text-gray-400">{firm.slug}</p>
                </td>
                <td className="py-3">
                  <div className="flex flex-wrap gap-1">
                    {firm.services?.slice(0, 2).map((s: string) => (
                      <span key={s} className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">
                        {getServiceLabel(s)}
                      </span>
                    ))}
                    {(firm.services?.length ?? 0) > 2 && (
                      <span className="text-xs text-gray-400">+{firm.services!.length - 2}</span>
                    )}
                  </div>
                </td>
                <td className="py-3 capitalize">{firm.party_focus ?? '—'}</td>
                <td className="py-3">
                  {firm.is_claimed ? <Badge variant="info">Claimed</Badge> : <Badge variant="default">Unclaimed</Badge>}
                </td>
                <td className="py-3">
                  <Link href={`/firms/${firm.slug}`} className="text-navy hover:underline text-xs">
                    View →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
