'use client';

import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { signOutUser } from '@/lib/firebase';
import Link from 'next/link';
import GumroadCredentialsForm from '@/components/GumroadCredentialsForm';
import ConnectGumroadButton from '@/components/ConnectGumroadButton';

export default function ConfigPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [config, setConfig] = useState<any>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch('/api/config');
        if (response.ok) {
          const data = await response.json();
          setConfig(data);
        }
      } catch (error) {
        console.error('Failed to fetch config:', error);
      }
    };

    if (user) {
      fetchConfig();
    }
  }, [user]);

  const handleSignOut = async () => {
    await signOutUser();
    router.push('/');
  };

  if (loading || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="bg-white shadow-lg border-b border-slate-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Configuration</h1>
              <p className="text-slate-600 font-medium">System settings and integrations</p>
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
                href="/dashboard"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
              >
                Dashboard
              </Link>
              <button
                onClick={handleSignOut}
                className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition font-semibold"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Stripe Configuration</h2>

            {config ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div>
                    <h3 className="font-semibold text-slate-900">Stripe Mode</h3>
                    <p className="text-sm text-slate-600">
                      {config.stripe?.isTestMode ? 'Test Mode (No real charges)' : 'Live Mode (Real charges)'}
                    </p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${config.stripe?.isTestMode
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-green-100 text-green-800'
                    }`}>
                    {config.stripe?.isTestMode ? 'TEST' : 'LIVE'}
                  </div>
                </div>

                {config.stripe?.isTestMode && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h3 className="text-sm font-medium text-yellow-800">Test Mode Active</h3>
                    <p className="text-sm text-yellow-700 mt-1">
                      Your Stripe account is in test mode. No real payments will be processed.
                      To enable real payments, update your STRIPE_SECRET_KEY to use a live key (starts with sk_live_).
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            )}
          </div>

                    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Gumroad Integration</h2>
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="text-sm font-medium text-green-800">✅ Automatic Gumroad Publishing Active</h3>
                <p className="text-sm text-green-700 mt-1">
                  Projects are automatically published to Gumroad when approved by AI.
                  Real Gumroad products are created with project details and direct links.
                </p>
              </div>
              
                             <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                 <h3 className="text-sm font-medium text-blue-800">How it works:</h3>
                 <ol className="list-decimal list-inside space-y-1 text-sm text-blue-700 mt-2">
                   <li>Submit a project with all required details</li>
                   <li>AI verifies and approves the project</li>
                   <li>System automatically creates REAL Gumroad product</li>
                   <li>Product URL is provided for management</li>
                   <li>Ready for first sale and $5 test sale</li>
                 </ol>
               </div>
             </div>
           </div>

           <GumroadCredentialsForm />

          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Connect Gumroad Session</h2>
            <p className="text-sm text-slate-600 mb-4">Open a one-time login window. After you log in once, publishing will work in one try using the saved session.</p>
            <ConnectGumroadButton />
          </div>
        </div>
      </div>
    </div>
  );
}
