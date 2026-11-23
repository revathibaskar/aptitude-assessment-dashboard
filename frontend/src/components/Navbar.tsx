import React from 'react';
import Link from 'next/link';
import { Award, ShieldCheck, User } from 'lucide-react';

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-100 group-hover:bg-indigo-700 transition-colors">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight text-slate-900">
              Assessment<span className="text-indigo-600">Pro</span>
            </span>
            <span className="hidden sm:inline-block ml-2 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-slate-100 text-slate-600 rounded">
              Aptitude Engine
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/register"
            className="text-sm font-semibold text-slate-700 hover:text-indigo-600 transition-colors hidden sm:block"
          >
            Take Assessment
          </Link>
          <Link
            href="/admin/login"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-xs"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Admin Portal
          </Link>
        </div>
      </div>
    </header>
  );
}

