'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { createClient } from '@/lib/supabase/client';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';

const schema = z.object({
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Za-z]/, 'Must contain a letter')
    .regex(/[0-9]/, 'Must contain a number'),
  confirm: z.string(),
}).refine((d) => d.password === d.confirm, {
  message: "Passwords don't match",
  path: ['confirm'],
});

type FormData = z.infer<typeof schema>;

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormData) {
    setError(null);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password: data.password });
    if (updateError) { setError(updateError.message); return; }
    setSuccess(true);
    setTimeout(() => router.push('/dashboard'), 2000);
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-navy">Set new password</h1>
        </div>
        <Card>
          {success ? (
            <div className="text-center py-4">
              <p className="text-green-700 font-medium">Password updated! Redirecting to dashboard…</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-md px-4 py-3 text-sm">{error}</div>
              )}
              <Input
                id="password"
                label="New password"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                helpText="At least 8 characters, with a letter and number"
                error={errors.password?.message}
                {...register('password')}
              />
              <Input
                id="confirm"
                label="Confirm new password"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                error={errors.confirm?.message}
                {...register('confirm')}
              />
              <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                {isSubmitting ? 'Updating…' : 'Update Password'}
              </Button>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
