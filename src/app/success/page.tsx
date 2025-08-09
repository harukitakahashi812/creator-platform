'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    const id = searchParams.get('session_id');
    setSessionId(id);
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Payment Successful!</h1>
        <p className="text-gray-600 mb-6">
          Thank you for your purchase. You should receive an email confirmation shortly.
        </p>
        
        {sessionId && (
          <div className="bg-gray-100 p-4 rounded mb-6">
            <p className="text-sm text-gray-600">Session ID:</p>
            <p className="font-mono text-sm text-gray-600 break-all">{sessionId}</p>
          </div>
        )}
        
        <div className="space-y-3">
          <Link
            href="/"
            className="block w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition"
          >
            Back to Home
          </Link>
          <Link
            href="/dashboard"
            className="block w-full border border-gray-300 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-50 transition"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}