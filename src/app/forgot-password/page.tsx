'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { createClient } from '@/lib/supabase/client';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
});

type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    setError(null);
    const supabase = createClient();
    const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://campaign-grade.com';
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${APP_URL}/auth/callback?next=/update-password`,
    });

    if (resetError) {
      setError(resetError.message);
      return;
    }

    setSuccess(true);
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-navy">Reset your password</h1>
          <p className="text-gray-500 mt-2">
            <Link href="/login" className="text-navy font-medium hover:underline">
              ← Back to sign in
            </Link>
          </p>
        </div>

        <Card>
          {success ? (
            <div className="text-center py-4">
              <p className="text-gray-700">
                If an account exists for that email, we&apos;ve sent a password reset link. Check your inbox.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-md px-4 py-3 text-sm">
                  {error}
                </div>
              )}
              <Input
                id="email"
                label="Email address"
                type="email"
                autoComplete="email"
                placeholder="you@campaign.com"
                error={errors.email?.message}
                {...register('email')}
              />
              <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                {isSubmitting ? 'Sending...' : 'Send Reset Link'}
              </Button>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
