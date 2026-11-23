import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { ArrowRight, CheckCircle2, Clock, Shield, BarChart3, HelpCircle, Users } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-16 lg:py-24 border-b border-slate-200/60 bg-gradient-to-b from-white to-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-6">
                <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></span>
                Official Corporate Recruitment Benchmark
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
                Corporate Aptitude <br className="hidden sm:inline" />
                <span className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                  Assessment Dashboard
                </span>
              </h1>
              <p className="mt-6 text-base sm:text-lg text-slate-600 leading-relaxed">
                A rigorous, timed cognitive evaluation evaluating Quantitative acumen, Logical Reasoning, and Verbal synthesis for graduate and early-career recruitment.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/register"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-base shadow-lg shadow-indigo-200 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  Start Assessment
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/admin/login"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-semibold text-base shadow-xs transition-colors"
                >
                  Admin Portal
                </Link>
              </div>

              {/* Quick Specs Badges */}
              <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
                <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs text-left">
                  <div className="flex items-center gap-2 text-indigo-600 mb-1">
                    <HelpCircle className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Questions</span>
                  </div>
                  <div className="text-xl font-extrabold text-slate-900">10 Questions</div>
                  <div className="text-xs text-slate-500">MCQ (4 Options)</div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs text-left">
                  <div className="flex items-center gap-2 text-indigo-600 mb-1">
                    <Clock className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Duration</span>
                  </div>
                  <div className="text-xl font-extrabold text-slate-900">15 Minutes</div>
                  <div className="text-xs text-slate-500">Enforced by Server</div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs text-left">
                  <div className="flex items-center gap-2 text-emerald-600 mb-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Marking</span>
                  </div>
                  <div className="text-xl font-extrabold text-slate-900">+2 / -1 Marks</div>
                  <div className="text-xs text-slate-500">Negative marking</div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs text-left">
                  <div className="flex items-center gap-2 text-blue-600 mb-1">
                    <Shield className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Integrity</span>
                  </div>
                  <div className="text-xl font-extrabold text-slate-900">1 Attempt</div>
                  <div className="text-xs text-slate-500">Shuffled Order</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Highlights */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                Enterprise Assessment Features
              </h2>
              <p className="mt-2 text-slate-600 text-sm sm:text-base">
                Engineered for fairness, strict security, and comprehensive candidate analytics.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-4">
                  <Clock className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Automated Server-Side Timer</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Start time and deadlines are cryptographically enforced on the backend. Accidental page refreshes restore remaining time and state automatically.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Tamper-Proof Scoring</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Correct answers are never leaked to client browsers before submission. Real-time answer auto-saving preserves every candidate response safely.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Corporate Admin Dashboard</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Full administrative command center: Recharts score distributions, candidate audits with question snapshots, CSV exports, and configurable settings.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500">
          EvalPro Aptitude Assessment Dashboard • Full Stack Developer & AI Specialist Assignment
        </div>
      </footer>
    </div>
  );
}
