import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import EditReviewClient from './EditReviewClient';

export default async function EditReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: review } = await supabase
    .from('reviews')
    .select('*')
    .eq('id', id)
    .eq('reviewer_id', user.id)
    .in('status', ['pending', 'published'])
    .single();

  if (!review) redirect('/dashboard');

  return <EditReviewClient review={review} />;
}
