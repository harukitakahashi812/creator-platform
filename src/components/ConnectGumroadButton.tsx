'use client';

import { useState } from 'react';

export default function ConnectGumroadButton() {
	const [status, setStatus] = useState<'idle' | 'opening' | 'success' | 'error'>('idle');
	const [error, setError] = useState('');
	const [message, setMessage] = useState('');

  const handleOpen = async () => {
    setStatus('opening');
    setError('');
		try {
			const res = await fetch('/api/gumroad/connect', { method: 'POST' });
			const data = await res.json();
			if (data.success) {
				setStatus('success');
				setMessage(data.message || 'Window opened. Please log in once, then close it.');
			} else {
				setStatus('error');
				setError(data.error || 'Failed to open window');
			}
		} catch (e: any) {
      setStatus('error');
      setError(e?.message || 'Failed to open window');
    }
  };

  return (
    <div>
      <button
        onClick={handleOpen}
        className="bg-slate-800 text-white px-6 py-3 rounded-lg hover:bg-slate-900 transition font-semibold disabled:opacity-60"
        disabled={status === 'opening'}
      >
        {status === 'opening' ? 'Opening…' : 'Open Gumroad Login Window'}
      </button>
		{status === 'success' && (
			<div className="mt-3 p-3 rounded border border-green-200 bg-green-50 text-green-700 text-sm">
				{message || 'Window opened. Please log in once, then close it.'}
			</div>
		)}
      {status === 'error' && (
        <div className="mt-3 p-3 rounded border border-red-200 bg-red-50 text-red-700 text-sm">
          {error}
        </div>
      )}
    </div>
  );
}


