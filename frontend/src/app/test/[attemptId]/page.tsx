'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { AssessmentAttempt, OptionType, QuestionData } from '@/lib/types';
import { formatTime, cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Bookmark,
  Check,
  CheckCircle2,
  Clock,
  HelpCircle,
  Loader2,
  RotateCcw,
  Send,
  ShieldAlert,
} from 'lucide-react';

export default function AptitudeTestPage() {
  const params = useParams();
  const router = useRouter();
  const attemptId = params?.attemptId as string;

  const [attempt, setAttempt] = useState<AssessmentAttempt | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [savingAnswer, setSavingAnswer] = useState<boolean>(false);
  const [showSubmitModal, setShowSubmitModal] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Auto-submit guard ref to prevent multiple triggers
  const hasAutoSubmitted = useRef(false);

  // Load Assessment from Backend
  const loadAssessment = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(`/assessments/${attemptId}`);
      const data = res.data?.data;

      if (data.status === 'COMPLETED' || data.isExpired) {
        router.push(`/result/${attemptId}`);
        return;
      }

      setAttempt(data);
      setRemainingSeconds(data.remainingSeconds || 0);

      // LocalStorage recovery sync
      const localBackup = localStorage.getItem(`test_answers_${attemptId}`);
      if (localBackup) {
        try {
          const parsed = JSON.parse(localBackup);
          // Sync any answers if not yet saved on server
          data.questions.forEach((q: QuestionData) => {
            if (!q.selectedOption && parsed[q.orderIndex]) {
              q.selectedOption = parsed[q.orderIndex];
              q.isAnswered = true;
            }
          });
        } catch (e) {
          console.error('LocalStorage parse error:', e);
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to load assessment session.');
    } finally {
      setLoading(false);
    }
  }, [attemptId, router]);

  useEffect(() => {
    if (attemptId) {
      loadAssessment();
    }
  }, [attemptId, loadAssessment]);

  // Handle final submission
  const handleSubmitTest = useCallback(
    async (isAuto = false) => {
      if (hasAutoSubmitted.current || submitting) return;
      hasAutoSubmitted.current = true;
      setSubmitting(true);

      try {
        await api.post(`/assessments/${attemptId}/submit`);
        // Clear local backup
        localStorage.removeItem(`test_answers_${attemptId}`);
        router.push(`/result/${attemptId}`);
      } catch (err: any) {
        setErrorMessage(err.message || 'Submission failed. Please try again.');
        setSubmitting(false);
        hasAutoSubmitted.current = false;
      }
    },
    [attemptId, submitting, router]
  );

  // Countdown Timer Hook
  useEffect(() => {
    if (!attempt || loading || attempt.status !== 'IN_PROGRESS') return;

    const timer = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitTest(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [attempt, loading, handleSubmitTest]);

  // Save selected option
  const handleSelectOption = async (option: OptionType) => {
    if (!attempt || submitting) return;

    const currentQuestion = attempt.questions[currentIndex];
    const newSelected = currentQuestion.selectedOption === option ? null : option;

    // Optimistic UI update
    const updatedQuestions = [...attempt.questions];
    updatedQuestions[currentIndex] = {
      ...currentQuestion,
      selectedOption: newSelected,
      isAnswered: newSelected !== null,
    };
    setAttempt({ ...attempt, questions: updatedQuestions });

    // LocalStorage recovery
    const localBackup = JSON.parse(localStorage.getItem(`test_answers_${attemptId}`) || '{}');
    if (newSelected) {
      localBackup[currentQuestion.orderIndex] = newSelected;
    } else {
      delete localBackup[currentQuestion.orderIndex];
    }
    localStorage.setItem(`test_answers_${attemptId}`, JSON.stringify(localBackup));

    // Save to Backend immediately
    try {
      setSavingAnswer(true);
      await api.put(`/assessments/${attemptId}/answers`, {
        questionOrderIndex: currentQuestion.orderIndex,
        selectedOption: newSelected,
      });
    } catch (err: any) {
      console.error('Failed to sync answer with server:', err);
      // If server returned expired, redirect to result
      if (err.message?.includes('elapsed') || err.message?.includes('completed')) {
        router.push(`/result/${attemptId}`);
      }
    } finally {
      setSavingAnswer(false);
    }
  };

  // Toggle Mark for Review
  const handleToggleMarkForReview = async () => {
    if (!attempt || submitting) return;

    const currentQuestion = attempt.questions[currentIndex];
    const newReviewState = !currentQuestion.isMarkedForReview;

    // Optimistic UI update
    const updatedQuestions = [...attempt.questions];
    updatedQuestions[currentIndex] = {
      ...currentQuestion,
      isMarkedForReview: newReviewState,
    };
    setAttempt({ ...attempt, questions: updatedQuestions });

    try {
      await api.post(`/assessments/${attemptId}/mark-review`, {
        questionOrderIndex: currentQuestion.orderIndex,
        isMarkedForReview: newReviewState,
      });
    } catch (err: any) {
      console.error('Failed to update review flag:', err);
    }
  };

  // Clear answer
  const handleClearAnswer = async () => {
    if (!attempt || submitting) return;
    const currentQuestion = attempt.questions[currentIndex];
    if (!currentQuestion.selectedOption) return;

    const updatedQuestions = [...attempt.questions];
    updatedQuestions[currentIndex] = {
      ...currentQuestion,
      selectedOption: null,
      isAnswered: false,
    };
    setAttempt({ ...attempt, questions: updatedQuestions });

    const localBackup = JSON.parse(localStorage.getItem(`test_answers_${attemptId}`) || '{}');
    delete localBackup[currentQuestion.orderIndex];
    localStorage.setItem(`test_answers_${attemptId}`, JSON.stringify(localBackup));

    try {
      await api.put(`/assessments/${attemptId}/answers`, {
        questionOrderIndex: currentQuestion.orderIndex,
        selectedOption: null,
      });
    } catch (err: any) {
      console.error('Failed to clear answer:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
          <p className="text-sm font-medium text-slate-300">Synchronizing secure assessment session...</p>
        </div>
      </div>
    );
  }

  if (!attempt) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="max-w-md w-full bg-white p-6 rounded-2xl shadow-lg border border-slate-200 text-center">
          <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-slate-900 mb-1">Assessment Not Available</h2>
          <p className="text-sm text-slate-600 mb-6">{errorMessage || 'Unable to load this assessment session.'}</p>
          <Button onClick={() => router.push('/register')} variant="primary" className="w-full">
            Return to Registration
          </Button>
        </div>
      </div>
    );
  }

  const currentQuestion = attempt.questions[currentIndex];
  const answeredCount = attempt.questions.filter((q) => q.isAnswered).length;
  const unansweredCount = attempt.questions.length - answeredCount;
  const markedReviewCount = attempt.questions.filter((q) => q.isMarkedForReview).length;

  const isLowTime = remainingSeconds <= 120; // Under 2 mins warning

  return (
    <div className="min-h-screen flex flex-col bg-slate-100/70 select-none">
      {/* Top Test Navigation Bar */}
      <header className="sticky top-0 z-30 bg-slate-900 text-white border-b border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center text-white font-bold text-sm">
              Q
            </div>
            <div>
              <div className="text-sm font-bold text-slate-100 flex items-center gap-2">
                Corporate Aptitude Evaluation
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] uppercase font-bold bg-slate-800 text-indigo-300 rounded border border-slate-700">
                  Live Test
                </span>
              </div>
              <div className="text-xs text-slate-400">
                Candidate: <span className="text-slate-200">{attempt.candidate.fullName}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Live Synchronized Timer */}
            <div
              className={cn(
                'flex items-center gap-2 px-3.5 py-1.5 rounded-lg border font-mono font-bold text-sm transition-colors',
                isLowTime
                  ? 'bg-rose-950/80 border-rose-600 text-rose-300 animate-pulse'
                  : 'bg-slate-800 border-slate-700 text-emerald-400'
              )}
            >
              <Clock className="w-4 h-4" />
              <span>{formatTime(remainingSeconds)}</span>
            </div>

            <Button
              onClick={() => setShowSubmitModal(true)}
              variant="danger"
              size="sm"
              isLoading={submitting}
              className="font-semibold shadow-xs"
            >
              <Send className="w-3.5 h-3.5 mr-1" />
              Finish & Submit
            </Button>
          </div>
        </div>
      </header>

      {/* Main Test Layout: Question Area + Palette Sidebar */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Active Question Card (Cols 8) */}
        <main className="lg:col-span-8 flex flex-col space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8 flex-1 flex flex-col justify-between">
            <div>
              {/* Question Meta Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                <div className="flex items-center gap-2.5">
                  <span className="text-sm font-extrabold px-3 py-1 bg-slate-100 text-slate-800 rounded-lg border border-slate-200">
                    Question {currentIndex + 1} of 10
                  </span>
                  <Badge variant="purple" className="uppercase text-[11px] tracking-wider">
                    {currentQuestion.category.replace('_', ' ')}
                  </Badge>
                  <Badge variant="default" className="text-[11px]">
                    {currentQuestion.difficulty}
                  </Badge>
                </div>

                <div className="text-xs font-semibold text-slate-500">
                  Marking: <span className="text-emerald-600">+2</span> / <span className="text-rose-600">-1</span>
                </div>
              </div>

              {/* Question Text */}
              <div className="text-base sm:text-lg font-medium text-slate-900 leading-relaxed mb-8">
                {currentQuestion.questionText}
              </div>

              {/* Four Options */}
              <div className="space-y-3.5">
                {(['A', 'B', 'C', 'D'] as OptionType[]).map((optKey) => {
                  const isSelected = currentQuestion.selectedOption === optKey;
                  const optionText = currentQuestion.options[optKey];

                  return (
                    <button
                      key={optKey}
                      type="button"
                      onClick={() => handleSelectOption(optKey)}
                      className={cn(
                        'w-full text-left p-4 rounded-xl border-2 transition-all flex items-start gap-3.5 group cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500',
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/60 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 bg-white'
                      )}
                    >
                      <div
                        className={cn(
                          'w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 transition-colors',
                          isSelected
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-700 group-hover:bg-slate-200'
                        )}
                      >
                        {isSelected ? <Check className="w-4 h-4" /> : optKey}
                      </div>

                      <div
                        className={cn(
                          'text-sm leading-relaxed pt-0.5',
                          isSelected ? 'font-semibold text-indigo-950' : 'text-slate-700'
                        )}
                      >
                        {optionText}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom Actions for current question */}
            <div className="pt-8 mt-8 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleToggleMarkForReview}
                  variant={currentQuestion.isMarkedForReview ? 'secondary' : 'outline'}
                  size="sm"
                  className={cn(
                    currentQuestion.isMarkedForReview && 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200'
                  )}
                >
                  <Bookmark
                    className={cn(
                      'w-3.5 h-3.5 mr-1.5',
                      currentQuestion.isMarkedForReview ? 'fill-amber-600 text-amber-600' : 'text-slate-500'
                    )}
                  />
                  {currentQuestion.isMarkedForReview ? 'Marked for Review' : 'Mark for Review'}
                </Button>

                {currentQuestion.selectedOption && (
                  <Button
                    onClick={handleClearAnswer}
                    variant="ghost"
                    size="sm"
                    className="text-slate-500 hover:text-slate-800 text-xs"
                  >
                    <RotateCcw className="w-3 h-3 mr-1" />
                    Clear Choice
                  </Button>
                )}
              </div>

              {/* Prev / Next Buttons */}
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                  disabled={currentIndex === 0}
                  variant="outline"
                  size="md"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>

                {currentIndex < 9 ? (
                  <Button
                    onClick={() => setCurrentIndex((prev) => Math.min(9, prev + 1))}
                    variant="primary"
                    size="md"
                  >
                    Next
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                ) : (
                  <Button
                    onClick={() => setShowSubmitModal(true)}
                    variant="success"
                    size="md"
                  >
                    Review & Submit
                    <Send className="w-4 h-4 ml-1" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </main>

        {/* Right: Question Palette & Status Summary (Cols 4) */}
        <aside className="lg:col-span-4 space-y-5">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center justify-between">
              <span>Question Palette</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                10 Questions
              </span>
            </h3>

            {/* Grid 1 to 10 */}
            <div className="grid grid-cols-5 gap-2.5 mb-6">
              {attempt.questions.map((q, idx) => {
                const isCurrent = currentIndex === idx;
                const isAnswered = q.isAnswered;
                const isMarked = q.isMarkedForReview;

                return (
                  <button
                    key={q.orderIndex}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    className={cn(
                      'h-11 rounded-xl text-sm font-bold flex flex-col items-center justify-center relative transition-all cursor-pointer border-2 focus:outline-none focus:ring-2 focus:ring-indigo-500',
                      // Current question ring
                      isCurrent && 'ring-2 ring-indigo-600 ring-offset-2',
                      // States
                      isAnswered && !isMarked && 'bg-emerald-600 border-emerald-600 text-white shadow-xs',
                      isAnswered && isMarked && 'bg-amber-500 border-amber-500 text-white shadow-xs',
                      !isAnswered && isMarked && 'bg-amber-100 border-amber-400 text-amber-900',
                      !isAnswered && !isMarked && 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    )}
                  >
                    <span>{q.orderIndex}</span>
                    {isMarked && (
                      <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-300" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Palette Legend */}
            <div className="pt-4 border-t border-slate-100 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded bg-emerald-600" />
                  <span className="text-slate-600">Answered</span>
                </div>
                <span className="font-bold text-slate-800">{answeredCount}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded bg-slate-200 border border-slate-300" />
                  <span className="text-slate-600">Unanswered</span>
                </div>
                <span className="font-bold text-slate-800">{unansweredCount}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded bg-amber-500" />
                  <span className="text-slate-600">Marked for Review</span>
                </div>
                <span className="font-bold text-slate-800">{markedReviewCount}</span>
              </div>
            </div>
          </div>

          {/* Guidelines Notice */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200/80 p-5 text-xs text-slate-600 space-y-2.5">
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Automated Integrity Protocol
            </div>
            <p>
              Your selections are synchronized immediately to the database. Refreshing or switching devices will not erase your submitted choices or reset the clock.
            </p>
          </div>
        </aside>
      </div>

      {/* Manual Submission Confirmation Dialog */}
      <Modal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        title="Confirm Assessment Submission"
        description="Please review your attempt summary before final submission."
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 text-sm">
            <div>
              <div className="text-xs text-slate-500">Answered Questions:</div>
              <div className="text-lg font-bold text-emerald-600">{answeredCount} / 10</div>
            </div>
            <div>
              <div className="text-xs text-slate-500">Unanswered Questions:</div>
              <div className="text-lg font-bold text-rose-600">{unansweredCount} / 10</div>
            </div>
          </div>

          {unansweredCount > 0 && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 mt-0.5 text-amber-600 shrink-0" />
              <div>
                <strong>Notice:</strong> You have {unansweredCount} unattempted question{unansweredCount > 1 ? 's' : ''}. Unattempted questions incur 0 marks, whereas incorrect answers will deduct 1 mark each.
              </div>
            </div>
          )}

          <p className="text-xs text-slate-600">
            Once submitted, your answers are locked and cannot be changed. Your final score and performance analytics will be computed instantly.
          </p>

          <div className="pt-3 flex items-center justify-end gap-3">
            <Button
              onClick={() => setShowSubmitModal(false)}
              variant="outline"
              disabled={submitting}
            >
              Resume Test
            </Button>
            <Button
              onClick={() => handleSubmitTest(false)}
              variant="primary"
              isLoading={submitting}
            >
              Confirm & Submit Now
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
