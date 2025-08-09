'use client';

import { useState, useEffect } from 'react';

interface GumroadPublishingStatusProps {
  projectId: string;
  projectTitle: string;
  projectDescription: string;
  projectPrice: number;
  projectType: string;
  onPublishingComplete?: (gumroadUrl: string) => void;
}

export default function GumroadPublishingStatus({
  projectId,
  projectTitle,
  projectDescription,
  projectPrice,
  projectType,
  onPublishingComplete
}: GumroadPublishingStatusProps) {
  const [publishingStatus, setPublishingStatus] = useState<'idle' | 'publishing' | 'success' | 'error'>('idle');
  const [gumroadUrl, setGumroadUrl] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [instructions, setInstructions] = useState<string[]>([]);

  const startPublishing = async () => {
    setPublishingStatus('publishing');
    setMessage('Starting Gumroad publishing process...');

    try {
      const response = await fetch('/api/gumroad/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId }),
      });

      const result = await response.json();

      if (result.success) {
        setPublishingStatus('success');
        setMessage(result.message);
        if (result.gumroadLink) {
          setGumroadUrl(result.gumroadLink);
          onPublishingComplete?.(result.gumroadLink);
        }
        if (result.instructions) {
          setInstructions(result.instructions);
        }
      } else {
        setPublishingStatus('error');
        setMessage(result.message || 'Publishing failed');
      }
    } catch (error) {
      setPublishingStatus('error');
      setMessage('Failed to publish to Gumroad. Please try again.');
    }
  };

  useEffect(() => {
    // Auto-start publishing when component mounts
    if (publishingStatus === 'idle') {
      startPublishing();
    }
  }, []);

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
      <h3 className="text-xl font-bold text-slate-900 mb-4">Gumroad Publishing Status</h3>
      
      <div className="space-y-4">
        {/* Status Indicator */}
        <div className="flex items-center gap-3">
          <div className={`w-4 h-4 rounded-full ${
            publishingStatus === 'idle' ? 'bg-gray-300' :
            publishingStatus === 'publishing' ? 'bg-yellow-400 animate-pulse' :
            publishingStatus === 'success' ? 'bg-green-500' :
            'bg-red-500'
          }`}></div>
          <span className="font-medium text-slate-700">
            {publishingStatus === 'idle' ? 'Ready to publish' :
             publishingStatus === 'publishing' ? 'Publishing to Gumroad...' :
             publishingStatus === 'success' ? 'Published successfully!' :
             'Publishing failed'}
          </span>
        </div>

        {/* Message */}
        {message && (
          <div className={`p-4 rounded-lg ${
            publishingStatus === 'success' ? 'bg-green-50 text-green-700 border border-green-200' :
            publishingStatus === 'error' ? 'bg-red-50 text-red-700 border border-red-200' :
            'bg-blue-50 text-blue-700 border border-blue-200'
          }`}>
            {message}
          </div>
        )}

        {/* Gumroad URL */}
        {gumroadUrl && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-2">Gumroad Product Created!</h4>
            <a 
              href={gumroadUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-green-600 hover:text-green-800 underline break-all"
            >
              {gumroadUrl}
            </a>
            <p className="text-sm text-green-700 mt-2">
              Click the link above to view and manage your product on Gumroad.
            </p>
          </div>
        )}

        {/* Instructions */}
        {instructions.length > 0 && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">Next Steps:</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-blue-700">
              {instructions.map((instruction, index) => (
                <li key={index}>{instruction}</li>
              ))}
            </ol>
          </div>
        )}

        {/* Retry Button */}
        {publishingStatus === 'error' && (
          <button
            onClick={startPublishing}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition font-semibold"
          >
            Retry Publishing
          </button>
        )}

        {/* Project Details */}
        <div className="p-4 bg-slate-50 rounded-lg">
          <h4 className="font-semibold text-slate-800 mb-2">Project Details:</h4>
          <div className="space-y-1 text-sm text-slate-600">
            <p><strong>Title:</strong> {projectTitle}</p>
            <p><strong>Price:</strong> ${projectPrice}</p>
            <p><strong>Type:</strong> {projectType}</p>
            <p><strong>Description:</strong> {projectDescription.substring(0, 100)}...</p>
          </div>
        </div>
      </div>
    </div>
  );
}
