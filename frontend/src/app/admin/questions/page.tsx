'use client';

import React, { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { api } from '@/lib/api';
import { OptionType, QuestionAdminItem, QuestionCategory, QuestionDifficulty } from '@/lib/types';
import {
  AlertCircle,
  CheckCircle2,
  Edit2,
  FileQuestion,
  HelpCircle,
  Info,
  Loader2,
  Plus,
  Search,
  Trash2,
  XCircle,
} from 'lucide-react';

export default function QuestionManagementPage() {
  const [questions, setQuestions] = useState<QuestionAdminItem[]>([]);
  const [activeCount, setActiveCount] = useState<number>(10);
  const [loading, setLoading] = useState<boolean>(true);
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modal states
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState<boolean>(false);
  const [editingQuestion, setEditingQuestion] = useState<QuestionAdminItem | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [deletingQuestion, setDeletingQuestion] = useState<QuestionAdminItem | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Form states
  const [formData, setFormData] = useState({
    text: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctOption: 'A' as OptionType,
    category: 'QUANTITATIVE' as QuestionCategory,
    difficulty: 'MEDIUM' as QuestionDifficulty,
    explanation: '',
    isActive: true,
  });

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (categoryFilter) params.category = categoryFilter;
      if (statusFilter) params.isActive = statusFilter === 'active';
      if (searchTerm) params.search = searchTerm;

      const res = await api.get('/admin/questions', { params });
      setQuestions(res.data?.data?.questions || []);
      setActiveCount(res.data?.data?.activeCount ?? 0);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to load questions.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [categoryFilter, statusFilter, searchTerm]);

  const handleOpenAdd = () => {
    setEditingQuestion(null);
    setFormData({
      text: '',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctOption: 'A',
      category: 'QUANTITATIVE',
      difficulty: 'MEDIUM',
      explanation: '',
      isActive: activeCount < 10,
    });
    setIsAddEditModalOpen(true);
  };

  const handleOpenEdit = (q: QuestionAdminItem) => {
    setEditingQuestion(q);
    setFormData({
      text: q.text,
      optionA: q.optionA,
      optionB: q.optionB,
      optionC: q.optionC,
      optionD: q.optionD,
      correctOption: q.correctOption,
      category: q.category,
      difficulty: q.difficulty,
      explanation: q.explanation || '',
      isActive: q.isActive,
    });
    setIsAddEditModalOpen(true);
  };

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);

    try {
      if (editingQuestion) {
        await api.put(`/admin/questions/${editingQuestion.id}`, formData);
        setFeedback({ type: 'success', message: 'Question updated successfully.' });
      } else {
        await api.post('/admin/questions', formData);
        setFeedback({ type: 'success', message: 'Question created successfully.' });
      }
      setIsAddEditModalOpen(false);
      fetchQuestions();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to save question.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteQuestion = async () => {
    if (!deletingQuestion) return;
    setSubmitting(true);

    try {
      await api.delete(`/admin/questions/${deletingQuestion.id}`);
      setFeedback({ type: 'success', message: 'Question removed successfully.' });
      setIsDeleteModalOpen(false);
      fetchQuestions();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to delete question.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (q: QuestionAdminItem) => {
    try {
      await api.put(`/admin/questions/${q.id}`, {
        isActive: !q.isActive,
      });
      fetchQuestions();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Could not update status.' });
    }
  };

  const isExactlyTen = activeCount === 10;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Question Management Bank
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Maintain corporate evaluation questions with strict active benchmark rules.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button onClick={handleOpenAdd} variant="primary" size="sm">
              <Plus className="w-4 h-4 mr-1.5" />
              Add New Question
            </Button>
          </div>
        </div>

        {/* Business Rule Warning/Info Banner */}
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between ${
            isExactlyTen
              ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
              : 'bg-amber-50/90 border-amber-300 text-amber-900'
          }`}
        >
          <div className="flex items-center gap-3">
            {isExactlyTen ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            )}
            <div className="text-xs sm:text-sm">
              <span className="font-bold">Active Question Rule: </span>
              {isExactlyTen ? (
                <>Assessment ready! Exactly 10 questions are active ({activeCount}/10 active).</>
              ) : (
                <>
                  Action required: Exactly 10 active questions are required to start assessments (currently{' '}
                  <span className="font-bold underline">{activeCount} active</span>). Tests are locked until exactly 10 are active.
                </>
              )}
            </div>
          </div>

          <Badge variant={isExactlyTen ? 'success' : 'warning'} className="text-xs">
            {activeCount} / 10 Active
          </Badge>
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
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Filters and Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="w-full md:w-80 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search question text..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="w-full md:w-auto flex items-center gap-3">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
            >
              <option value="">All Categories</option>
              <option value="QUANTITATIVE">Quantitative</option>
              <option value="LOGICAL_REASONING">Logical Reasoning</option>
              <option value="VERBAL">Verbal</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
            >
              <option value="">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
        </div>

        {/* Questions Table */}
        <Card className="shadow-xs">
          <CardContent className="p-0">
            {loading ? (
              <div className="py-16 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
              </div>
            ) : questions.length === 0 ? (
              <div className="py-16 text-center text-sm text-slate-500">
                No questions found matching your criteria.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                      <th className="py-3 px-5">Question Details</th>
                      <th className="py-3 px-5">Category</th>
                      <th className="py-3 px-5">Difficulty</th>
                      <th className="py-3 px-5">Correct Option</th>
                      <th className="py-3 px-5 text-center">Status</th>
                      <th className="py-3 px-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {questions.map((q) => (
                      <tr key={q.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-4 px-5 max-w-md">
                          <p className="font-semibold text-slate-900 line-clamp-2">{q.text}</p>
                          <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                            <span>A: {q.optionA}</span> • <span>B: {q.optionB}</span>
                          </div>
                        </td>
                        <td className="py-4 px-5">
                          <Badge variant="purple" className="text-[11px]">
                            {q.category.replace('_', ' ')}
                          </Badge>
                        </td>
                        <td className="py-4 px-5">
                          <Badge variant="default" className="text-[11px]">
                            {q.difficulty}
                          </Badge>
                        </td>
                        <td className="py-4 px-5 font-bold font-mono text-indigo-700">
                          Option {q.correctOption}
                        </td>
                        <td className="py-4 px-5 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleActive(q)}
                            className="cursor-pointer"
                          >
                            {q.isActive ? (
                              <Badge variant="success">Active</Badge>
                            ) : (
                              <Badge variant="default">Inactive</Badge>
                            )}
                          </button>
                        </td>
                        <td className="py-4 px-5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenEdit(q)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100"
                              title="Edit question"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setDeletingQuestion(q);
                                setIsDeleteModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50"
                              title="Delete question"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
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

      {/* Add / Edit Question Modal */}
      <Modal
        isOpen={isAddEditModalOpen}
        onClose={() => setIsAddEditModalOpen(false)}
        title={editingQuestion ? 'Edit Question' : 'Create New Question'}
        description="Provide four clear options and one defensible correct answer."
        maxWidth="lg"
      >
        <form onSubmit={handleSaveQuestion} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
              Question Text *
            </label>
            <textarea
              rows={3}
              required
              value={formData.text}
              onChange={(e) => setFormData({ ...formData, text: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-indigo-600"
              placeholder="Enter the full question scenario or problem statement..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Option A *"
              required
              value={formData.optionA}
              onChange={(e) => setFormData({ ...formData, optionA: e.target.value })}
            />
            <Input
              label="Option B *"
              required
              value={formData.optionB}
              onChange={(e) => setFormData({ ...formData, optionB: e.target.value })}
            />
            <Input
              label="Option C *"
              required
              value={formData.optionC}
              onChange={(e) => setFormData({ ...formData, optionC: e.target.value })}
            />
            <Input
              label="Option D *"
              required
              value={formData.optionD}
              onChange={(e) => setFormData({ ...formData, optionD: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Select
              label="Correct Option *"
              required
              options={[
                { value: 'A', label: 'Option A' },
                { value: 'B', label: 'Option B' },
                { value: 'C', label: 'Option C' },
                { value: 'D', label: 'Option D' },
              ]}
              value={formData.correctOption}
              onChange={(e) => setFormData({ ...formData, correctOption: e.target.value as OptionType })}
            />

            <Select
              label="Category *"
              required
              options={[
                { value: 'QUANTITATIVE', label: 'Quantitative' },
                { value: 'LOGICAL_REASONING', label: 'Logical Reasoning' },
                { value: 'VERBAL', label: 'Verbal' },
              ]}
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as QuestionCategory })}
            />

            <Select
              label="Difficulty *"
              required
              options={[
                { value: 'EASY', label: 'Easy' },
                { value: 'MEDIUM', label: 'Medium' },
                { value: 'HARD', label: 'Hard' },
              ]}
              value={formData.difficulty}
              onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as QuestionDifficulty })}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
              Detailed Solution / Explanation
            </label>
            <textarea
              rows={2}
              value={formData.explanation}
              onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-indigo-600"
              placeholder="Step-by-step reasoning or mathematical proof for auditing..."
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isActiveCheck"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
            />
            <label htmlFor="isActiveCheck" className="text-xs font-medium text-slate-700">
              Active Question (Remember: Max 10 active questions allowed)
            </label>
          </div>

          <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAddEditModalOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={submitting}>
              {editingQuestion ? 'Save Changes' : 'Create Question'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Question Deletion"
        description="Are you sure you want to delete this question?"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            Deleting this question will remove it from future assessment pools. Completed test attempts preserve immutable historical snapshots and will not be affected.
          </p>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800">
            {deletingQuestion?.text}
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteQuestion}
              isLoading={submitting}
            >
              Delete Question
            </Button>
          </div>
        </div>
      </Modal>
    </AdminLayout>
  );
}
