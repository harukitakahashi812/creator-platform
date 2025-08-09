'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signUp } from '@/lib/firebase';
import Link from 'next/link';

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const { user, error } = await signUp(email, password);
    setLoading(false);
    
    if (user) {
      // Store additional user data in Firestore
      try {
        const response = await fetch('/api/create-user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            uid: user.uid,
            email: user.email,
            createdAt: new Date().toISOString(),
          }),
        });
        
        if (!response.ok) {
          console.error('Failed to store user data in Firestore');
        }
      } catch (error) {
        console.error('Error storing user data:', error);
      }
      
      router.push('/dashboard');
    } else {
      // Provide user-friendly error messages
      let userFriendlyError = 'Signup failed. Please try again.';
      
      if (error) {
        if (error.includes('email-already-in-use')) {
          userFriendlyError = 'An account with this email already exists. Please log in instead.';
        } else if (error.includes('weak-password')) {
          userFriendlyError = 'Password is too weak. Please use at least 6 characters.';
        } else if (error.includes('invalid-email')) {
          userFriendlyError = 'Please enter a valid email address.';
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
        <h1 className="text-3xl font-extrabold mb-8 text-center text-slate-900 tracking-tight font-sans">Sign Up</h1>
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
            autoComplete="new-password"
          />
          {error && <div className="text-red-600 text-sm font-medium text-center">{error}</div>}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-500 text-white py-3 rounded-lg font-bold text-lg shadow-lg hover:from-blue-700 hover:to-indigo-600 transition disabled:opacity-60"
            disabled={loading}
          >
            {loading ? 'Signing up...' : 'Sign Up'}
          </button>
        </form>
        <p className="mt-6 text-center text-base text-slate-600 font-sans">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-600 font-semibold hover:underline">Log In</Link>
        </p>
      </div>
    </div>
  );
}