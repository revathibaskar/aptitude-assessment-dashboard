'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';
import { AlertCircle, Award, CheckCircle2, Lock, ShieldCheck } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function AdminLoginPage() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await api.post('/admin/login', data);
      const resData = response.data?.data;

      if (resData?.token) {
        localStorage.setItem('admin_token', resData.token);
      }

      router.push('/admin/dashboard');
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    setValue('email', 'admin@assessment.com');
    setValue('password', 'Admin@123456');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-4 group">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 group-hover:bg-indigo-500 transition-colors">
            <Award className="w-6 h-6" />
          </div>
          <span className="font-black text-2xl text-white tracking-tight">
            Assessment<span className="text-indigo-400">Pro</span>
          </span>
        </Link>
        <h2 className="text-2xl font-black text-white tracking-tight">
          Admin Portal Authentication
        </h2>
        <p className="mt-1.5 text-xs text-slate-400">
          Enter administrative credentials to manage assessments and candidates.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <Card className="shadow-2xl border-slate-800 bg-slate-950 text-slate-100">
          <CardHeader className="border-slate-800 pb-4">
            <CardTitle className="text-base text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              Administrative Login
            </CardTitle>
            <CardDescription className="text-slate-400 text-xs">
              Protected by bcrypt hashing and secure HTTP-only cookies.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            {errorMessage && (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-300 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                <div>{errorMessage}</div>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="admin@assessment.com"
                  {...register('email')}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-900 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
                {errors.email && (
                  <p className="text-xs text-rose-400 mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••••••"
                  {...register('password')}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-900 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
                {errors.password && (
                  <p className="text-xs text-rose-400 mt-1">{errors.password.message}</p>
                )}
              </div>

              <Button
                type="submit"
                size="lg"
                isLoading={isLoading}
                className="w-full mt-2 font-bold"
              >
                Sign In to Dashboard
              </Button>
            </form>

            {/* Demo Credentials Helper Box */}
            <div className="mt-6 pt-5 border-t border-slate-800/80">
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-300 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-indigo-400" />
                    Demo Admin Credentials
                  </span>
                  <button
                    type="button"
                    onClick={fillDemoCredentials}
                    className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 underline"
                  >
                    Auto-Fill
                  </button>
                </div>
                <div className="text-slate-400 space-y-0.5 font-mono text-[11px]">
                  <div>Email: <span className="text-slate-200">admin@assessment.com</span></div>
                  <div>Password: <span className="text-slate-200">Admin@123456</span></div>
                </div>
              </div>
            </div>

            <div className="mt-5 text-center">
              <Link
                href="/"
                className="text-xs font-semibold text-slate-400 hover:text-white transition-colors"
              >
                ← Return to Public Candidate Portal
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

