'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Navbar } from '@/components/Navbar';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';
import { AlertCircle, ArrowRight, CheckCircle2, ShieldAlert } from 'lucide-react';

const registerSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, 'Full Name must be at least 2 characters')
    .max(50, 'Full Name cannot exceed 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Full Name can only contain letters and spaces'),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('Please enter a valid email address'),
  age: z.coerce
    .number({ invalid_type_error: 'Age must be a number' })
    .int('Age must be a whole number')
    .min(18, 'Minimum age allowed is 18 years')
    .max(60, 'Maximum age allowed is 60 years'),
  phoneNumber: z
    .string()
    .trim()
    .regex(/^\d{10}$/, 'Phone number must be exactly 10 digits'),
  gender: z.string().optional(),
  highestQualification: z
    .string()
    .min(1, 'Please select your highest qualification'),
  city: z.string().trim().optional(),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [duplicateModal, setDuplicateModal] = useState<{
    message: string;
    attemptId?: string;
    isCompleted?: boolean;
    candidateId?: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      age: undefined as any,
      phoneNumber: '',
      gender: '',
      highestQualification: '',
      city: '',
    },
    mode: 'onTouched',
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    setServerError(null);

    try {
      const response = await api.post('/candidates/register', data);
      const resData = response.data?.data;

      if (resData?.candidate) {
        // Store candidate info for instructions page
        sessionStorage.setItem('current_candidate', JSON.stringify(resData.candidate));
        
        if (resData.isResumed && resData.existingAttemptId) {
          router.push(`/test/${resData.existingAttemptId}`);
        } else {
          router.push('/instructions');
        }
      }
    } catch (err: any) {
      const errResponse = err.response?.data;
      if (errResponse?.isCompleted || err.message?.includes('already been completed')) {
        setDuplicateModal({
          message: errResponse?.message || err.message,
          attemptId: errResponse?.attemptId,
          isCompleted: true,
          candidateId: errResponse?.candidateId,
        });
      } else {
        setServerError(err.message || 'Registration failed. Please check your details.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <div className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="text-center mb-8">
          <span className="text-xs font-bold tracking-widest uppercase text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
            Step 1 of 3: Candidate Verification
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 mt-3 tracking-tight">
            Assessment Registration
          </h1>
          <p className="text-sm text-slate-600 mt-1.5 max-w-lg mx-auto">
            Please provide your details below. Each candidate is permitted one attempt. All fields marked with (*) are required.
          </p>
        </div>

        {serverError && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 mt-0.5 shrink-0 text-rose-600" />
            <div className="text-sm">
              <span className="font-bold">Registration Alert: </span>
              {serverError}
            </div>
          </div>
        )}

        <Card className="shadow-md">
          <CardHeader className="bg-slate-50/70">
            <CardTitle>Personal & Academic Profile</CardTitle>
            <CardDescription>
              Ensure information matches your identification documents for corporate verification.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Full Name */}
              <Input
                label="Full Name"
                placeholder="e.g. Rachel Green"
                required
                {...register('fullName')}
                error={errors.fullName?.message}
                hint="Letters and spaces only (2-50 characters)"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Email */}
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="name@example.com"
                  required
                  {...register('email')}
                  error={errors.email?.message}
                  hint="One test attempt per email"
                />

                {/* Phone */}
                <Input
                  label="Phone Number"
                  type="tel"
                  placeholder="10-digit mobile number"
                  maxLength={10}
                  required
                  {...register('phoneNumber')}
                  error={errors.phoneNumber?.message}
                  hint="Exactly 10 digits without spaces"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Age */}
                <Input
                  label="Age (Years)"
                  type="number"
                  placeholder="18 - 60"
                  min={18}
                  max={60}
                  required
                  {...register('age')}
                  error={errors.age?.message}
                  hint="Eligible age: 18 to 60"
                />

                {/* Gender */}
                <Select
                  label="Gender (Optional)"
                  options={[
                    { value: '', label: 'Select Gender (Optional)' },
                    { value: 'Male', label: 'Male' },
                    { value: 'Female', label: 'Female' },
                    { value: 'Non-Binary', label: 'Non-Binary' },
                    { value: 'Prefer not to say', label: 'Prefer not to say' },
                  ]}
                  {...register('gender')}
                  error={errors.gender?.message}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Highest Qualification */}
                <Select
                  label="Highest Qualification"
                  required
                  options={[
                    { value: '', label: 'Select Qualification' },
                    { value: "Bachelor's Degree", label: "Bachelor's Degree (B.Tech, B.E, B.Sc, B.Com, B.A)" },
                    { value: "Master's Degree", label: "Master's Degree (M.Tech, M.S, MBA, M.Sc, M.A)" },
                    { value: 'Doctorate / Ph.D.', label: 'Doctorate / Ph.D.' },
                    { value: 'Diploma', label: 'Diploma / Associate Degree' },
                    { value: 'High School', label: 'High School (10+2 / Secondary)' },
                    { value: 'Other Professional Degree', label: 'Other Professional Certification / Degree' },
                  ]}
                  {...register('highestQualification')}
                  error={errors.highestQualification?.message}
                />

                {/* City */}
                <Input
                  label="City (Optional)"
                  placeholder="e.g. Bangalore, Austin, London"
                  {...register('city')}
                  error={errors.city?.message}
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-slate-500 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  All data is encrypted and validated on server.
                </div>

                <Button
                  type="submit"
                  size="lg"
                  isLoading={isLoading}
                  className="w-full sm:w-auto"
                >
                  Save & View Instructions
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Duplicate Attempt Modal */}
      {duplicateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-4">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Attempt Already Recorded
            </h3>
            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
              {duplicateModal.message}
            </p>

            <div className="flex flex-col gap-2.5">
              {duplicateModal.attemptId && (
                <Button
                  onClick={() => router.push(`/result/${duplicateModal.attemptId}`)}
                  variant="primary"
                >
                  View Completed Assessment Result
                </Button>
              )}
              <Button
                onClick={() => setDuplicateModal(null)}
                variant="outline"
              >
                Close & Use Different Email
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

