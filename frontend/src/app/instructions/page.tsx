'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { api } from '@/lib/api';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock,
  HelpCircle,
  Info,
  ShieldCheck,
  XCircle,
} from 'lucide-react';

export default function InstructionsPage() {
  const router = useRouter();
  const [candidate, setCandidate] = useState<any>(null);
  const [instructions, setInstructions] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Read stored candidate from sessionStorage
    const stored = sessionStorage.getItem('current_candidate');
    if (!stored) {
      router.push('/register');
      return;
    }
    setCandidate(JSON.parse(stored));

    const fetchInstructions = async () => {
      try {
        const res = await api.get('/assessments/instructions');
        setInstructions(res.data?.data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch assessment instructions.');
      } finally {
        setLoading(false);
      }
    };

    fetchInstructions();
  }, [router]);

  const handleStartTest = async () => {
    if (!candidate?.id) return;
    setStarting(true);
    setError(null);

    try {
      const res = await api.post('/assessments/start', {
        candidateId: candidate.id,
      });
      const attemptData = res.data?.data;
      if (attemptData?.attemptId) {
        router.push(`/test/${attemptData.attemptId}`);
      }
    } catch (err: any) {
      setError(err.message || 'Could not start assessment session. Please try again.');
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-medium text-slate-600">Loading assessment parameters...</p>
          </div>
        </div>
      </div>
    );
  }

  const durationMinutes = instructions?.durationMinutes || 15;
  const passPercentage = instructions?.passPercentage || 60;
  const canStart = instructions?.canStart ?? false;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <div className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="text-center mb-8">
          <span className="text-xs font-bold tracking-widest uppercase text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
            Step 2 of 3: Assessment Protocol
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 mt-3 tracking-tight">
            Assessment Instructions
          </h1>
          <p className="text-sm text-slate-600 mt-1.5">
            Logged in as <span className="font-semibold text-slate-900">{candidate?.fullName}</span> ({candidate?.email})
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 mt-0.5 shrink-0 text-rose-600" />
            <div className="text-sm font-medium">{error}</div>
          </div>
        )}

        {!canStart && instructions?.reasonNotReady && (
          <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 flex items-start gap-3">
            <Info className="w-5 h-5 mt-0.5 shrink-0 text-amber-600" />
            <div className="text-sm font-medium">
              <span className="font-bold">System Status: </span>
              {instructions.reasonNotReady}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Quick Metrics */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Questions</div>
              <div className="text-2xl font-black text-slate-900">10 Questions</div>
              <div className="text-xs text-slate-500">Multiple Choice</div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Duration</div>
              <div className="text-2xl font-black text-slate-900">{durationMinutes} Minutes</div>
              <div className="text-xs text-slate-500">Server Enforced</div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Passing Benchmark</div>
              <div className="text-2xl font-black text-slate-900">{passPercentage}% Score</div>
              <div className="text-xs text-slate-500">Max Possible: 20 marks</div>
            </div>
          </div>
        </div>

        <Card className="shadow-md mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Marking Scheme</CardTitle>
              <Badge variant="warning">Negative Marking Active</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 text-emerald-900">
                <div className="flex items-center gap-2 font-bold text-sm mb-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Correct Answer
                </div>
                <div className="text-2xl font-extrabold text-emerald-700">+2 Marks</div>
                <p className="text-xs text-emerald-800 mt-1">Awarded for each correct option selected.</p>
              </div>

              <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-200 text-rose-900">
                <div className="flex items-center gap-2 font-bold text-sm mb-1">
                  <XCircle className="w-4 h-4 text-rose-600" />
                  Wrong Answer
                </div>
                <div className="text-2xl font-extrabold text-rose-700">-1 Mark</div>
                <p className="text-xs text-rose-800 mt-1">Deducted for incorrect option selected.</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-100/70 border border-slate-200 text-slate-900">
                <div className="flex items-center gap-2 font-bold text-sm mb-1">
                  <Info className="w-4 h-4 text-slate-500" />
                  Unattempted
                </div>
                <div className="text-2xl font-extrabold text-slate-700">0 Marks</div>
                <p className="text-xs text-slate-600 mt-1">No marks awarded or deducted.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md mb-8">
          <CardHeader>
            <CardTitle>Crucial Exam Rules</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3.5 text-sm text-slate-700">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0 text-xs">
                1
              </div>
              <p>
                <strong>Question Navigation:</strong> You can jump to any question numbered 1 to 10 at any time using the Question Palette on the right.
              </p>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0 text-xs">
                2
              </div>
              <p>
                <strong>Mark for Review:</strong> You can flag any question for later review. Flagged questions are color-coded in amber on the palette.
              </p>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0 text-xs">
                3
              </div>
              <p>
                <strong>Auto-Save & Accidental Refresh:</strong> Your answers are synchronized with the server in real-time. If you refresh or close the tab, your timer and answers will be safely restored upon reopening.
              </p>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0 text-xs">
                4
              </div>
              <p>
                <strong>Countdown Timer & Auto-Submit:</strong> When the {durationMinutes}-minute countdown ends, your assessment will automatically submit with the currently saved answers.
              </p>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0 text-xs">
                5
              </div>
              <p>
                <strong>Single Attempt:</strong> Once submitted, you cannot re-take or modify the test. Your final score and performance report will be generated immediately.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row items-center justify-between gap-4 py-5">
            <div className="text-xs text-slate-500">
              Ensure you have a stable connection before proceeding.
            </div>

            <Button
              onClick={handleStartTest}
              size="lg"
              disabled={!canStart || starting}
              isLoading={starting}
              className="w-full sm:w-auto"
            >
              I Understand, Start Test Now
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
