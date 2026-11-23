'use client';

import React, { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Info,
  Loader2,
  Percent,
  Save,
  ShieldCheck,
} from 'lucide-react';

export default function AdminSettingsPage() {
  const [durationMinutes, setDurationMinutes] = useState<number>(15);
  const [passPercentage, setPassPercentage] = useState<number>(60);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const res = await api.get('/admin/settings');
        const data = res.data?.data;
        if (data) {
          setDurationMinutes(data.durationMinutes);
          setPassPercentage(data.passPercentage);
        }
      } catch (err: any) {
        setFeedback({ type: 'error', message: err.message || 'Failed to fetch settings.' });
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    try {
      await api.put('/admin/settings', {
        durationMinutes: Number(durationMinutes),
        passPercentage: Number(passPercentage),
      });
      setFeedback({ type: 'success', message: 'Assessment settings updated successfully!' });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to update settings.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="h-96 flex items-center justify-center">
          <Loader2 className="w-7 h-7 animate-spin text-indigo-600" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Assessment Configuration
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Configure global assessment parameters, timer durations, and qualification benchmarks.
          </p>
        </div>

        {feedback && (
          <div
            className={`p-4 rounded-xl text-sm border flex items-center gap-2.5 ${
              feedback.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        <Card className="shadow-xs">
          <CardHeader>
            <CardTitle>Global Test Parameters</CardTitle>
            <CardDescription>
              Changes applied here will affect all future assessment attempts. Existing completed attempts preserve their original snapshots.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSave} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase text-slate-600">
                  Assessment Duration (Minutes) *
                </label>
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <Clock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      required
                      min={1}
                      max={180}
                      value={durationMinutes}
                      onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 1)}
                      className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-indigo-600 font-mono font-bold"
                    />
                  </div>
                  <span className="text-xs font-semibold text-slate-500">Minutes (Default: 15)</span>
                </div>
                <p className="text-xs text-slate-400">
                  Defines the exact timer countdown enforced both client-side and server-side.
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase text-slate-600">
                  Passing Benchmark Percentage (%) *
                </label>
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <Percent className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      required
                      min={0}
                      max={100}
                      step={0.5}
                      value={passPercentage}
                      onChange={(e) => setPassPercentage(parseFloat(e.target.value) || 0)}
                      className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-indigo-600 font-mono font-bold"
                    />
                  </div>
                  <span className="text-xs font-semibold text-slate-500">% Score (Default: 60%)</span>
                </div>
                <p className="text-xs text-slate-400">
                  Minimum score percentage required for candidate qualification based on raw net score.
                </p>
              </div>

              {/* Informational callout */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Snapshot Architecture:</strong> Every candidate attempt stores an immutable snapshot of the active duration and pass percentage at the instant the test was initialized. Changing these values now will not alter the qualification result of past candidates.
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <Button type="submit" variant="primary" size="lg" isLoading={saving}>
                  <Save className="w-4 h-4 mr-1.5" />
                  Save Assessment Configuration
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

