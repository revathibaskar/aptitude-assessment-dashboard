'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { api } from '@/lib/api';
import { AssessmentResult } from '@/lib/types';
import { formatTime } from '@/lib/utils';
import {
  Award,
  CheckCircle2,
  Clock,
  Download,
  HelpCircle,
  Home,
  Info,
  Loader2,
  Percent,
  Printer,
  ShieldAlert,
  ShieldCheck,
  TrendingDown,
  XCircle,
} from 'lucide-react';

export default function ResultPage() {
  const params = useParams();
  const router = useRouter();
  const attemptId = params?.attemptId as string;

  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/results/${attemptId}`);
        setResult(res.data?.data);
      } catch (err: any) {
        setError(err.message || 'Unable to load assessment result.');
      } finally {
        setLoading(false);
      }
    };

    if (attemptId) {
      fetchResult();
    }
  }, [attemptId]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            <p className="text-sm font-semibold text-slate-700">Calculating official score report...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-6 text-center">
            <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto mb-3" />
            <h2 className="text-xl font-bold text-slate-900 mb-1">Result Not Available</h2>
            <p className="text-sm text-slate-600 mb-6">{error || 'Unable to retrieve assessment scorecard.'}</p>
            <Button onClick={() => router.push('/')} variant="primary" className="w-full">
              Return Home
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  const isPassed = result.isPassed;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Print Header Button */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            Back to Home
          </Link>

          <Button
            onClick={() => window.print()}
            variant="outline"
            size="sm"
            className="print:hidden text-xs"
          >
            <Printer className="w-3.5 h-3.5 mr-1" />
            Print Scorecard
          </Button>
        </div>

        {/* Hero Scorecard Banner */}
        <div
          className={`p-8 rounded-3xl border shadow-sm mb-8 text-center sm:text-left sm:flex sm:items-center sm:justify-between transition-colors ${
            isPassed
              ? 'bg-gradient-to-r from-emerald-900 to-slate-900 text-white border-emerald-800'
              : 'bg-gradient-to-r from-slate-900 to-rose-950 text-white border-rose-900'
          }`}
        >
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3 bg-white/10 backdrop-blur-xs">
              {isPassed ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300">Assessment Qualified</span>
                </>
              ) : (
                <>
                  <XCircle className="w-3.5 h-3.5 text-rose-400" />
                  <span className="text-rose-300">Below Benchmark</span>
                </>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-2">
              {result.candidate.fullName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              Email: {result.candidate.email} • Exam ID: #{result.attemptId.slice(0, 8)}
            </p>
          </div>

          <div className="mt-6 sm:mt-0 flex flex-col items-center sm:items-end justify-center">
            <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">
              Final Net Score
            </div>
            <div className="text-5xl font-black tracking-tight flex items-baseline gap-1">
              <span className={result.totalScore < 0 ? 'text-rose-400' : 'text-emerald-400'}>
                {result.totalScore}
              </span>
              <span className="text-lg text-slate-400 font-semibold">/ 20</span>
            </div>
            <div className="text-sm font-semibold text-slate-300 mt-1">
              {result.percentage}% Net Percentage
            </div>
          </div>
        </div>

        {/* Detailed Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center gap-2 text-emerald-600 mb-1">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Correct</span>
            </div>
            <div className="text-2xl font-extrabold text-slate-900">{result.correctAnswers}</div>
            <div className="text-xs text-emerald-600 font-medium">+{result.correctAnswers * 2} marks</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center gap-2 text-rose-600 mb-1">
              <XCircle className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Incorrect</span>
            </div>
            <div className="text-2xl font-extrabold text-slate-900">{result.incorrectAnswers}</div>
            <div className="text-xs text-rose-600 font-medium">-{result.marksDeducted} marks deducted</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center gap-2 text-slate-500 mb-1">
              <HelpCircle className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Unattempted</span>
            </div>
            <div className="text-2xl font-extrabold text-slate-900">{result.unattemptedQuestions}</div>
            <div className="text-xs text-slate-400">0 marks change</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center gap-2 text-blue-600 mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Time Taken</span>
            </div>
            <div className="text-2xl font-extrabold text-slate-900">{formatTime(result.timeTakenSeconds)}</div>
            <div className="text-xs text-slate-500">15m max duration</div>
          </div>
        </div>

        {/* Assessment Evaluation Breakdown */}
        <Card className="shadow-sm mb-8">
          <CardHeader>
            <CardTitle>Assessment Evaluation Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-slate-100 text-sm">
              <span className="text-slate-600">Candidate Name</span>
              <span className="font-bold text-slate-900">{result.candidate.fullName}</span>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-slate-100 text-sm">
              <span className="text-slate-600">Registered Email</span>
              <span className="font-semibold text-slate-800">{result.candidate.email}</span>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-slate-100 text-sm">
              <span className="text-slate-600">Raw Score Formula</span>
              <span className="font-mono text-xs font-semibold bg-slate-100 px-2 py-1 rounded text-slate-700">
                (Correct × 2) - (Incorrect × 1) = {result.totalScore}
              </span>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-slate-100 text-sm">
              <span className="text-slate-600">Percentage Calculation</span>
              <span className="font-mono text-xs font-semibold bg-slate-100 px-2 py-1 rounded text-slate-700">
                ({result.totalScore} / 20) × 100 = {result.percentage}%
              </span>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-slate-100 text-sm">
              <span className="text-slate-600">Configured Passing Benchmark</span>
              <span className="font-bold text-slate-900">{result.passPercentage}%</span>
            </div>

            <div className="flex items-center justify-between pt-3 text-sm">
              <span className="text-slate-600">Final Candidate Status</span>
              <div>
                {isPassed ? (
                  <Badge variant="success" className="text-xs px-3 py-1 font-bold">
                    PASSED
                  </Badge>
                ) : (
                  <Badge variant="danger" className="text-xs px-3 py-1 font-bold">
                    FAILED
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Corporate Certification Note */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div className="text-xs text-slate-600 leading-relaxed">
            <div className="font-bold text-sm text-slate-900 mb-1">Official Benchmark Record</div>
            This result has been recorded in the platform database with immutable attempt snapshots and timestamped at{' '}
            {new Date(result.completedAt).toLocaleString()}. The evaluation committee and recruiting administrators can access your complete performance breakdown directly via the Admin Portal.
          </div>
        </div>
      </main>
    </div>
  );
}
