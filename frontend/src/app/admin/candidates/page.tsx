'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AdminLayout } from '@/components/AdminLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { api } from '@/lib/api';
import {
  ArrowUpDown,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  FileSpreadsheet,
  Loader2,
  Search,
  Users,
  XCircle,
} from 'lucide-react';

export default function CandidatesManagementPage() {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  // Filters & Sorting state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PASSED' | 'FAILED'>('ALL');
  const [sortBy, setSortBy] = useState<'date' | 'score' | 'name'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const fetchCandidates = async (page = 1) => {
    try {
      setLoading(true);
      const params: any = {
        page,
        limit: 10,
        sortBy,
        sortOrder,
      };

      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (statusFilter !== 'ALL') params.statusFilter = statusFilter;

      const res = await api.get('/admin/candidates', { params });
      const data = res.data?.data;
      setCandidates(data?.candidates || []);
      setPagination(data?.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 });
    } catch (err) {
      console.error('Failed to fetch candidate list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates(1);
  }, [searchTerm, statusFilter, sortBy, sortOrder]);

  const handleExportCsv = async (isFiltered = true) => {
    try {
      setExporting(true);
      const params: any = {};
      if (isFiltered) {
        if (searchTerm.trim()) params.search = searchTerm.trim();
        if (statusFilter !== 'ALL') params.statusFilter = statusFilter;
      }

      const res = await api.get('/admin/results/export', {
        params,
        responseType: 'blob',
      });

      const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute(
        'download',
        `assessment_results_${isFiltered ? 'filtered_' : 'all_'}${Date.now()}.csv`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('CSV Export failed:', err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header & CSV Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Candidate Evaluation Records
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Search, filter, examine detailed test attempts, and export audit sheets.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              onClick={() => handleExportCsv(true)}
              variant="outline"
              size="sm"
              isLoading={exporting}
              className="text-xs"
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              Export Filtered CSV
            </Button>
            <Button
              onClick={() => handleExportCsv(false)}
              variant="primary"
              size="sm"
              isLoading={exporting}
              className="text-xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5" />
              Export All CSV
            </Button>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="w-full md:w-96 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name or email address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="w-full md:w-auto flex flex-wrap items-center gap-3">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
            >
              <option value="ALL">All Status (Pass/Fail)</option>
              <option value="PASSED">Passed Only</option>
              <option value="FAILED">Failed Only</option>
            </select>

            {/* Sort Field */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
            >
              <option value="date">Sort by Date</option>
              <option value="score">Sort by Score</option>
              <option value="name">Sort by Name</option>
            </select>

            {/* Sort Order */}
            <Button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              variant="outline"
              size="sm"
              className="text-xs h-8 px-2.5"
            >
              <ArrowUpDown className="w-3.5 h-3.5 mr-1" />
              {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
            </Button>
          </div>
        </div>

        {/* Candidate Results Table */}
        <Card className="shadow-xs">
          <CardContent className="p-0">
            {loading ? (
              <div className="py-20 flex items-center justify-center">
                <Loader2 className="w-7 h-7 animate-spin text-indigo-600" />
              </div>
            ) : candidates.length === 0 ? (
              <div className="py-20 text-center text-sm text-slate-500">
                No candidates found matching the selected filter criteria.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                      <th className="py-3.5 px-6">Candidate</th>
                      <th className="py-3.5 px-6">Contact / Age</th>
                      <th className="py-3.5 px-6">Raw Score</th>
                      <th className="py-3.5 px-6">Percentage</th>
                      <th className="py-3.5 px-6">Result Status</th>
                      <th className="py-3.5 px-6">Attempt Date</th>
                      <th className="py-3.5 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {candidates.map((cand) => (
                      <tr key={cand.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-4 px-6">
                          <div className="font-bold text-slate-900">{cand.fullName}</div>
                          <div className="text-xs text-slate-500">{cand.email}</div>
                        </td>
                        <td className="py-4 px-6 text-xs text-slate-600">
                          <div>{cand.phoneNumber}</div>
                          <div className="text-slate-400">Age: {cand.age} yrs • {cand.gender || 'N/A'}</div>
                        </td>
                        <td className="py-4 px-6 font-mono font-bold text-slate-900">
                          {cand.score !== null ? `${cand.score} / 20` : '—'}
                        </td>
                        <td className="py-4 px-6 font-semibold text-slate-800">
                          {cand.percentage !== null ? `${cand.percentage}%` : '—'}
                        </td>
                        <td className="py-4 px-6">
                          {cand.status === 'COMPLETED' ? (
                            cand.isPassed ? (
                              <Badge variant="success">PASSED</Badge>
                            ) : (
                              <Badge variant="danger">FAILED</Badge>
                            )
                          ) : (
                            <Badge variant="default">{cand.status}</Badge>
                          )}
                        </td>
                        <td className="py-4 px-6 text-xs text-slate-500">
                          {cand.attemptDate ? new Date(cand.attemptDate).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <Link href={`/admin/candidates/${cand.id}`}>
                            <Button variant="outline" size="sm" className="text-xs">
                              <Eye className="w-3.5 h-3.5 mr-1" />
                              View Audit
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls */}
            {!loading && pagination.totalPages > 1 && (
              <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                <div>
                  Showing Page <span className="font-bold">{pagination.page}</span> of{' '}
                  <span className="font-bold">{pagination.totalPages}</span> ({pagination.total} total)
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => fetchCandidates(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    variant="outline"
                    size="sm"
                    className="text-xs h-8"
                  >
                    <ChevronLeft className="w-3.5 h-3.5 mr-1" />
                    Previous
                  </Button>
                  <Button
                    onClick={() => fetchCandidates(pagination.page + 1)}
                    disabled={pagination.page >= pagination.totalPages}
                    variant="outline"
                    size="sm"
                    className="text-xs h-8"
                  >
                    Next
                    <ChevronRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
