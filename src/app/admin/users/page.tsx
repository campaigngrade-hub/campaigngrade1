import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import Badge from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (!profile || profile.role !== 'platform_admin') redirect('/dashboard');

  const adminClient = createAdminClient();
  const { data: users } = await adminClient
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-navy">Manage Users</h1>
        <span className="text-gray-500 text-sm">{users?.length ?? 0} total users</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left pb-2 font-medium text-gray-600">Name</th>
              <th className="text-left pb-2 font-medium text-gray-600">Email</th>
              <th className="text-left pb-2 font-medium text-gray-600">Role</th>
              <th className="text-left pb-2 font-medium text-gray-600">Verification</th>
              <th className="text-left pb-2 font-medium text-gray-600">Joined</th>
            </tr>
          </thead>
          <tbody>
            {users?.map((u) => (
              <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 font-medium">{u.full_name}</td>
                <td className="py-3 text-gray-600">{u.email}</td>
                <td className="py-3">
                  <Badge variant={u.role === 'platform_admin' ? 'navy' : u.role === 'firm_admin' ? 'info' : 'default'}>
                    {u.role}
                  </Badge>
                </td>
                <td className="py-3">
                  {u.verification_status === 'approved' ? (
                    <Badge variant="success">Verified</Badge>
                  ) : u.verification_status === 'pending' ? (
                    <Badge variant="warning">Pending</Badge>
                  ) : u.verification_status === 'rejected' ? (
                    <Badge variant="danger">Rejected</Badge>
                  ) : (
                    <Badge variant="default">None</Badge>
                  )}
                </td>
                <td className="py-3 text-gray-500">{formatDate(u.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
