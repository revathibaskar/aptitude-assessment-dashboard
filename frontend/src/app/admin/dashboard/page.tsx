'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AdminLayout } from '@/components/AdminLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';
import {
  Award,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  FileQuestion,
  HelpCircle,
  Loader2,
  Percent,
  TrendingUp,
  Users,
  XCircle,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await api.get('/admin/dashboard');
        setData(res.data?.data);
      } catch (err: any) {
        setError(err.message || 'Failed to load dashboard metrics.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <div className="h-96 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            <p className="text-sm font-semibold text-slate-600">Gathering assessment telemetry...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const summary = data?.summary || {
    totalCandidates: 0,
    testsCompleted: 0,
    averageScore: 0,
    passRate: 0,
    highestScore: 0,
  };

  const scoreDistribution = data?.charts?.scoreDistribution || [];
  const passFailDistribution = data?.charts?.passFailDistribution || [
    { name: 'Passed', value: 0, color: '#10b981' },
    { name: 'Failed', value: 0, color: '#ef4444' },
  ];
  const recentAttempts = data?.recentAttempts || [];

  const PIE_COLORS = ['#10b981', '#ef4444'];

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Executive Assessment Telemetry
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Live recruitment metrics, candidate distributions, and performance scoring.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/admin/candidates">
              <Button variant="outline" size="sm">
                <Users className="w-4 h-4 mr-1.5" />
                View Candidates
              </Button>
            </Link>
            <Link href="/admin/questions">
              <Button variant="primary" size="sm">
                <FileQuestion className="w-4 h-4 mr-1.5" />
                Manage Questions
              </Button>
            </Link>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm">
            {error}
          </div>
        )}

        {/* 5 Core Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {/* 1. Total Candidates */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Registered</span>
              <Users className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-3xl font-black text-slate-900">{summary.totalCandidates}</div>
            <div className="text-xs text-slate-500 mt-1">Total candidate pool</div>
          </div>

          {/* 2. Tests Completed */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Completed</span>
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-3xl font-black text-slate-900">{summary.testsCompleted}</div>
            <div className="text-xs text-slate-500 mt-1">Verified submissions</div>
          </div>

          {/* 3. Average Score */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Avg Score</span>
              <BarChart3 className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-3xl font-black text-slate-900">{summary.averageScore}</div>
            <div className="text-xs text-slate-500 mt-1">Out of 20 raw marks</div>
          </div>

          {/* 4. Pass Rate */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Pass Rate</span>
              <Percent className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-3xl font-black text-emerald-600">{summary.passRate}%</div>
            <div className="text-xs text-slate-500 mt-1">Benchmark met</div>
          </div>

          {/* 5. Highest Score */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs col-span-2 md:col-span-1">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">High Score</span>
              <TrendingUp className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-3xl font-black text-indigo-600">{summary.highestScore}</div>
            <div className="text-xs text-slate-500 mt-1">Platform record / 20</div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Chart: Score Distribution Bar Chart (Cols 7) */}
          <Card className="lg:col-span-7 shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-base">Score Distribution</CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">
                  Number of candidates achieving scores across mark ranges
                </p>
              </div>
              <Badge variant="info">Live DB Data</Badge>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={scoreDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="range" tick={{ fontSize: 11, fill: '#64748b' }} stroke="#cbd5e1" />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} stroke="#cbd5e1" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderRadius: '0.75rem',
                        border: 'none',
                        color: '#fff',
                        fontSize: '12px',
                      }}
                      formatter={(value: any) => [`${value} candidate(s)`, 'Candidates']}
                    />
                    <Bar dataKey="count" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Right Chart: Pass vs Fail Ratio (Cols 5) */}
          <Card className="lg:col-span-5 shadow-xs flex flex-col justify-between">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Pass vs. Fail Distribution</CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                Ratio of candidates meeting configured passing percentage
              </p>
            </CardHeader>
            <CardContent className="pt-4 flex-1 flex flex-col items-center justify-center">
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={passFailDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {passFailDistribution.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderRadius: '0.75rem',
                        border: 'none',
                        color: '#fff',
                        fontSize: '12px',
                      }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      formatter={(value) => <span className="text-xs font-semibold text-slate-700">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Attempts Table */}
        <Card className="shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Recent Test Attempts</CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">Most recently submitted candidate assessments</p>
            </div>
            <Link href="/admin/candidates" className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1">
              View All Candidate Records
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {recentAttempts.length === 0 ? (
              <div className="py-12 text-center text-sm text-slate-500">
                No assessments completed yet. Take an assessment from the candidate portal to populate data.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                      <th className="py-3 px-6">Candidate</th>
                      <th className="py-3 px-6">Net Score</th>
                      <th className="py-3 px-6">Percentage</th>
                      <th className="py-3 px-6">Status</th>
                      <th className="py-3 px-6">Submitted Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recentAttempts.map((attempt: any) => (
                      <tr key={attempt.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-6">
                          <div className="font-semibold text-slate-900">{attempt.candidateName}</div>
                          <div className="text-xs text-slate-500">{attempt.candidateEmail}</div>
                        </td>
                        <td className="py-3.5 px-6 font-mono font-bold text-slate-900">
                          {attempt.totalScore} / 20
                        </td>
                        <td className="py-3.5 px-6 font-semibold text-slate-800">
                          {attempt.percentage}%
                        </td>
                        <td className="py-3.5 px-6">
                          {attempt.isPassed ? (
                            <Badge variant="success">PASSED</Badge>
                          ) : (
                            <Badge variant="danger">FAILED</Badge>
                          )}
                        </td>
                        <td className="py-3.5 px-6 text-xs text-slate-500">
                          {attempt.completedAt ? new Date(attempt.completedAt).toLocaleString() : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

