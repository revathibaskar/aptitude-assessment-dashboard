'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { AdminLayout } from '@/components/AdminLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { api } from '@/lib/api';
import {
  ArrowLeft,
  Award,
  CheckCircle2,
  Clock,
  HelpCircle,
  Info,
  Loader2,
  User,
  XCircle,
} from 'lucide-react';

export default function CandidateDetailPage() {
  const params = useParams();
  const router = useRouter();
  const candidateId = params?.id as string;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCandidateDetail = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/admin/candidates/${candidateId}`);
        setData(res.data?.data);
      } catch (err: any) {
        setError(err.message || 'Failed to load candidate audit detail.');
      } finally {
        setLoading(false);
      }
    };

    if (candidateId) {
      fetchCandidateDetail();
    }
  }, [candidateId]);

  if (loading) {
    return (
      <AdminLayout>
        <div className="h-96 flex items-center justify-center">
          <Loader2 className="w-7 h-7 animate-spin text-indigo-600" />
        </div>
      </AdminLayout>
    );
  }

  if (error || !data) {
    return (
      <AdminLayout>
        <div className="p-6 bg-white rounded-2xl border border-slate-200 text-center">
          <p className="text-rose-600 font-semibold mb-4">{error || 'Candidate not found.'}</p>
          <Button onClick={() => router.push('/admin/candidates')} variant="outline">
            Return to Candidates
          </Button>
        </div>
      </AdminLayout>
    );
  }

  const { candidate, attempt } = data;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Back Link */}
        <div>
          <Link
            href="/admin/candidates"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Candidates List
          </Link>
        </div>

        {/* Candidate Profile Summary Header */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black text-slate-900">{candidate.fullName}</h1>
              {attempt ? (
                attempt.isPassed ? (
                  <Badge variant="success">QUALIFIED (PASSED)</Badge>
                ) : (
                  <Badge variant="danger">UNQUALIFIED (FAILED)</Badge>
                )
              ) : (
                <Badge variant="default">{candidate.status}</Badge>
              )}
            </div>

            <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-slate-600">
              <div>
                <span className="text-slate-400">Email:</span> {candidate.email}
              </div>
              <div>
                <span className="text-slate-400">Phone:</span> {candidate.phoneNumber}
              </div>
              <div>
                <span className="text-slate-400">Age:</span> {candidate.age} yrs
              </div>
              <div>
                <span className="text-slate-400">City:</span> {candidate.city || 'N/A'}
              </div>
            </div>

            <div className="mt-1 text-xs text-slate-500">
              <span className="text-slate-400">Qualification:</span> {candidate.highestQualification}
            </div>
          </div>

          {/* Quick Attempt Score */}
          {attempt && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center min-w-[160px]">
              <div className="text-xs uppercase font-bold text-slate-400">Net Score</div>
              <div className="text-3xl font-black text-indigo-600">{attempt.totalScore} / 20</div>
              <div className="text-xs font-semibold text-slate-700">{attempt.percentage}% Net Mark</div>
            </div>
          )}
        </div>

        {/* Score Metrics Breakdown */}
        {attempt && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200/80">
              <div className="text-xs text-slate-400 font-bold uppercase">Correct Answers</div>
              <div className="text-xl font-bold text-emerald-600 mt-1">{attempt.correctCount} / 10</div>
              <div className="text-xs text-emerald-700">+{attempt.correctCount * 2} marks</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200/80">
              <div className="text-xs text-slate-400 font-bold uppercase">Incorrect Answers</div>
              <div className="text-xl font-bold text-rose-600 mt-1">{attempt.incorrectCount} / 10</div>
              <div className="text-xs text-rose-700">-{attempt.marksDeducted} marks deducted</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200/80">
              <div className="text-xs text-slate-400 font-bold uppercase">Unattempted</div>
              <div className="text-xl font-bold text-slate-700 mt-1">{attempt.unattemptedCount} / 10</div>
              <div className="text-xs text-slate-400">0 marks</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200/80">
              <div className="text-xs text-slate-400 font-bold uppercase">Pass Requirement</div>
              <div className="text-xl font-bold text-slate-900 mt-1">{attempt.passPercentage}%</div>
              <div className="text-xs text-slate-500">Benchmark snapshot</div>
            </div>
          </div>
        )}

        {/* Question by Question Audit Log */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900">
            Immutable Question Snapshot & Response Audit
          </h2>

          {!attempt || !attempt.questions ? (
            <div className="p-8 bg-white rounded-xl border text-center text-sm text-slate-500">
              Candidate has not started or completed an assessment attempt yet.
            </div>
          ) : (
            attempt.questions.map((q: any) => {
              const isCorrect = q.isCorrect === true;
              const isIncorrect = q.isCorrect === false;
              const isUnattempted = q.selectedOption === null;

              return (
                <Card key={q.orderIndex} className="shadow-xs overflow-hidden">
                  <div
                    className={`px-5 py-3 border-b flex items-center justify-between text-xs font-semibold ${
                      isCorrect
                        ? 'bg-emerald-50/70 border-emerald-100 text-emerald-900'
                        : isIncorrect
                        ? 'bg-rose-50/70 border-rose-100 text-rose-900'
                        : 'bg-slate-50 border-slate-100 text-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span>Question #{q.orderIndex}</span>
                      <span className="text-slate-400">•</span>
                      <span>{q.category}</span>
                      <span className="text-slate-400">•</span>
                      <span>{q.difficulty}</span>
                    </div>

                    <div>
                      {isCorrect && <Badge variant="success">+2 Marks Awarded</Badge>}
                      {isIncorrect && <Badge variant="danger">-1 Mark Deducted</Badge>}
                      {isUnattempted && <Badge variant="default">0 Marks (Unattempted)</Badge>}
                    </div>
                  </div>

                  <CardContent className="pt-4 space-y-4">
                    <p className="text-sm font-medium text-slate-900 leading-relaxed">
                      {q.questionText}
                    </p>

                    {/* Options list */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {['A', 'B', 'C', 'D'].map((optKey) => {
                        const optText = q.options[optKey];
                        const isCandSelected = q.selectedOption === optKey;
                        const isActualCorrect = q.correctOption === optKey;

                        return (
                          <div
                            key={optKey}
                            className={`p-3 rounded-lg border flex items-start gap-2.5 ${
                              isActualCorrect
                                ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950 font-semibold'
                                : isCandSelected && !isActualCorrect
                                ? 'bg-rose-50/80 border-rose-300 text-rose-950 line-through'
                                : 'bg-slate-50 border-slate-200 text-slate-700'
                            }`}
                          >
                            <span className="font-bold">{optKey}.</span>
                            <span className="flex-1">{optText}</span>
                            {isActualCorrect && (
                              <span className="text-[10px] bg-emerald-600 text-white px-1.5 py-0.5 rounded uppercase font-bold shrink-0">
                                Correct
                              </span>
                            )}
                            {isCandSelected && !isActualCorrect && (
                              <span className="text-[10px] bg-rose-600 text-white px-1.5 py-0.5 rounded uppercase font-bold shrink-0">
                                Selected
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Explanation */}
                    {q.explanation && (
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
                        <span className="font-bold text-slate-900">Audit Explanation: </span>
                        {q.explanation}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
