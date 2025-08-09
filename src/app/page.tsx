'use client';

import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { useToast } from '@/components/ToastProvider';

export default function Home() {
  const { user, loading } = useAuth();
  const toast = useToast();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  // Show a lightweight banner to prompt login once the auth state is known
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-slate-200">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Creator Platform</h1>
          </div>
          <div className="flex gap-3">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold shadow-md"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7m-9 2v8m4-8v8m5 0a2 2 0 002-2V7a2 2 0 00-.586-1.414l-7-7a2 2 0 00-2.828 0l-7 7A2 2 0 003 7v11a2 2 0 002 2h3" />
                  </svg>
                  Dashboard
                </Link>
                <Link
                  href="/browse"
                  className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition font-semibold shadow-md"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                  Browse Projects
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 bg-slate-100 text-slate-700 px-6 py-3 rounded-lg hover:bg-slate-200 transition font-semibold shadow-md"
                >
                  Log In
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold shadow-md"
                >
                  Sign Up
                </Link>
                <Link
                  href="/browse"
                  className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition font-semibold shadow-md"
                >
                  Browse Projects
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Submit your creative project, get AI-verified, and earn.
          </h1>
          <p className="text-xl text-gray-700 mb-8">
            Upload your Elementor sites, graphic designs, or videos to Google Drive. 
            Our AI verifies quality and publishes approved projects for purchase.
          </p>
          
           {/* Login hint banner for unauthenticated users */}
           {!user && (
             <div className="mx-auto mb-6 max-w-xl bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg p-4">
               <p className="text-sm font-medium">You’re not logged in. Log in to submit projects and get them published automatically.</p>
             </div>
           )}

           <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-lg text-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition shadow-lg"
                >
                  Go to Dashboard
                </Link>
                <Link
                  href="/browse"
                  className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-lg text-lg font-medium hover:from-green-700 hover:to-emerald-700 transition shadow-lg"
                >
                  Browse Projects
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/signup"
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-lg text-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition shadow-lg"
                >
                  Start Creating
                </Link>
                <Link
                  href="/browse"
                  className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-lg text-lg font-medium hover:from-green-700 hover:to-emerald-700 transition shadow-lg"
                >
                  Browse Projects
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 text-center hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Easy Upload</h3>
            <p className="text-gray-700 leading-relaxed">Share your Google Drive links with project details and descriptions.</p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 text-center hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">AI Verification</h3>
            <p className="text-gray-700 leading-relaxed">Advanced AI reviews your work for quality and completeness automatically.</p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 text-center hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Earn Money</h3>
            <p className="text-gray-700 leading-relaxed">Approved projects go live and customers can purchase via Stripe or Gumroad.</p>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-bold text-gray-900 mb-2">How it works</h3>
              <p className="text-gray-600">
                Submit your creative project via Google Drive link. Our AI analyzes it for quality and completeness. 
                If approved, it goes live on a public page where customers can purchase it.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-bold text-gray-900 mb-2">What's allowed</h3>
              <p className="text-gray-600">
                We accept WordPress Elementor websites, graphic design files (images, vectors), 
                and video content (MP4 animations, tutorials). Projects must be complete and of reasonable quality.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-bold text-gray-900 mb-2">How do I get paid</h3>
              <p className="text-gray-600">
                Customers purchase your projects for $5~$25 via Stripe or Gumroad. 
                Payment processing and creator payouts are handled through these platforms.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-gray-600">
          <p>&copy; 2025 Creator Platform. Built for creators and demo purposes.</p>
        </div>
      </footer>
    </div>
  );
}