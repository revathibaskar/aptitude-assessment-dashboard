'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Award,
  BarChart3,
  CheckCircle2,
  FileQuestion,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  ShieldCheck,
  User,
  Users,
  X,
} from 'lucide-react';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { Button } from './ui/Button';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [admin, setAdmin] = useState<{ id: string; name: string; email: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const res = await api.get('/admin/me');
        if (res.data?.success && res.data?.data) {
          setAdmin(res.data.data);
        } else {
          router.push('/admin/login');
        }
      } catch (err) {
        localStorage.removeItem('admin_token');
        router.push('/admin/login');
      } finally {
        setLoading(false);
      }
    };

    verifyAuth();
  }, [router]);

  const handleLogout = async () => {
    try {
      await api.post('/admin/logout');
    } catch (e) {
      // ignore
    } finally {
      localStorage.removeItem('admin_token');
      router.push('/admin/login');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-slate-300">Authenticating administrative session...</p>
        </div>
      </div>
    );
  }

  const navItems = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Question Bank', href: '/admin/questions', icon: FileQuestion },
    { label: 'Candidate Results', href: '/admin/candidates', icon: Users },
    { label: 'Assessment Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col lg:flex-row">
      {/* Sidebar for Desktop */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-slate-900 text-slate-200 border-r border-slate-800 shrink-0 sticky top-0 h-screen">
        <div className="h-16 flex items-center px-6 border-b border-slate-800 gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-900">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold text-base tracking-tight text-white">
              Assessment<span className="text-indigo-400">Pro</span>
            </span>
            <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Admin Suite
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all',
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-900'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Admin Profile & Logout - Always pinned at bottom */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-slate-800 text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0 border border-slate-700">
                {admin?.name?.charAt(0) || 'A'}
              </div>
              <div className="overflow-hidden">
                <div className="text-xs font-bold text-white truncate">{admin?.name}</div>
                <div className="text-[11px] text-slate-400 truncate">{admin?.email}</div>
              </div>
            </div>
          </div>
          <Button
            onClick={handleLogout}
            variant="ghost"
            size="sm"
            className="w-full text-slate-400 hover:text-rose-400 hover:bg-slate-900 justify-start px-2 text-xs"
          >
            <LogOut className="w-3.5 h-3.5 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <div className="lg:hidden bg-slate-900 text-white border-b border-slate-800 h-16 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
            <Award className="w-4 h-4" />
          </div>
          <span className="font-extrabold text-base tracking-tight text-white">
            Assessment<span className="text-indigo-400">Pro</span> Admin
          </span>
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg text-slate-300 hover:bg-slate-800"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-900 border-b border-slate-800 px-4 py-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold',
                  isActive ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 text-white'
                )}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold text-rose-400 hover:bg-slate-800"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      )}

      {/* Main Admin Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}

