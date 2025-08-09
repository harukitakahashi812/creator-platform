'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from '@/lib/firebase';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const { user, error } = await signIn(email, password);
    setLoading(false);
    
    if (user) {
      router.push('/dashboard');
    } else {
      // Provide user-friendly error messages
      let userFriendlyError = 'Login failed. Please try again.';
      
      if (error) {
        if (error.includes('invalid-credential')) {
          userFriendlyError = 'Invalid email or password. Please check your credentials and try again.';
        } else if (error.includes('user-not-found')) {
          userFriendlyError = 'No account found with this email. Please sign up first.';
        } else if (error.includes('too-many-requests')) {
          userFriendlyError = 'Too many failed attempts. Please wait a moment and try again.';
        } else if (error.includes('network')) {
          userFriendlyError = 'Network error. Please check your connection and try again.';
        } else {
          userFriendlyError = error;
        }
      }
      
      setError(userFriendlyError);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-blue-800 px-4">
      <div className="w-full max-w-md p-8 bg-white/95 rounded-2xl shadow-2xl border border-slate-200">
        <h1 className="text-3xl font-extrabold mb-8 text-center text-slate-900 tracking-tight font-sans">Log In</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-blue-600 text-lg font-sans bg-white placeholder-slate-400 text-black"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-blue-600 text-lg font-sans bg-white placeholder-slate-400 text-black"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
          {error && <div className="text-red-600 text-sm font-medium text-center">{error}</div>}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-500 text-white py-3 rounded-lg font-bold text-lg shadow-lg hover:from-blue-700 hover:to-indigo-600 transition disabled:opacity-60"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>
        <p className="mt-6 text-center text-base text-slate-600 font-sans">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-blue-600 font-semibold hover:underline">Sign Up</Link>
        </p>
      </div>
    </div>
  );
}