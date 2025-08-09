'use client';

import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import ProjectSubmissionForm from '@/components/ProjectSubmissionForm';
import ProjectList from '@/components/ProjectList';
import { signOutUser } from '@/lib/firebase';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    if (!loading && !user && pathname !== '/') {
      router.replace('/login');
    }
  }, [user, loading, router, pathname]);

  const handleSignOut = async () => {
    await signOutUser();
    router.push('/');
  };

  if (loading || (!user && pathname !== '/')) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-slate-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
              <p className="text-slate-600 font-medium">Welcome back, {user?.email}</p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/"
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold shadow-md"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7m-9 2v8m4-8v8m5 0a2 2 0 002-2V7a2 2 0 00-.586-1.414l-7-7a2 2 0 00-2.828 0l-7 7A2 2 0 003 7v11a2 2 0 002 2h3" />
                </svg>
                Home
              </Link>
              <Link
                href="/dashboard/config"
                className="inline-flex items-center gap-2 bg-slate-600 text-white px-6 py-3 rounded-lg hover:bg-slate-700 transition font-semibold shadow-md"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Config
              </Link>
              <button
                onClick={handleSignOut}
                className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition font-semibold shadow-md"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          <ProjectSubmissionForm onProjectSubmitted={() => setRefreshTrigger(prev => prev + 1)} />
          <ProjectList refreshTrigger={refreshTrigger} />
        </div>
      </div>
    </div>
  );
}