'use client';

import { useState } from 'react';
import { useAuth } from '@/components/AuthProvider';

export default function GumroadCredentialsForm() {
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/gumroad/credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, userId: user?.uid }),
      });

      const result = await response.json();

      if (result.success) {
        setMessage('✅ Gumroad credentials configured successfully!');
        setEmail('');
        setPassword('');
      } else {
        setMessage(`❌ Error: ${result.error}`);
      }
    } catch (error) {
      setMessage('❌ Failed to configure credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
      <h3 className="text-xl font-bold text-slate-900 mb-4">Gumroad Credentials</h3>
      
      <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="text-sm font-medium text-blue-800 mb-2">⚠️ Important</h4>
        <p className="text-sm text-blue-700">
          To enable automatic Gumroad publishing, you need to provide your Gumroad login credentials.
          These will be used to automatically create products when projects are approved.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Gumroad Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-blue-600 text-black font-medium bg-white"
            placeholder="your-email@gumroad.com"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Gumroad Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-blue-600 text-black font-medium bg-white"
            placeholder="Your Gumroad password"
            required
          />
        </div>

        {message && (
          <div className={`p-4 rounded-lg font-medium ${
            message.includes('✅') 
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-60 transition font-semibold"
        >
          {loading ? 'Configuring...' : 'Configure Gumroad Credentials'}
        </button>
      </form>

      <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h4 className="text-sm font-medium text-yellow-800 mb-2">🔒 Security Note</h4>
        <p className="text-sm text-yellow-700">
          Your credentials are stored securely and only used for automatic product creation.
          We recommend using a dedicated Gumroad account for automation.
        </p>
      </div>
    </div>
  );
}
