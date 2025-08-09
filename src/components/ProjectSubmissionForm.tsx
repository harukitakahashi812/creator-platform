'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { addProject } from '@/lib/firebase';
import GumroadPublishingStatus from './GumroadPublishingStatus';
import { useToast } from './ToastProvider';


export default function ProjectSubmissionForm({ onProjectSubmitted }: { onProjectSubmitted?: () => void }) {
  const { user } = useAuth();
  const toast = useToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [googleDriveLink, setGoogleDriveLink] = useState('');
  const [projectType, setProjectType] = useState<'Elementor' | 'Graphic Design' | 'Video'>('Elementor');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [price, setPrice] = useState(10);

  const [deadline, setDeadline] = useState('');
  const [showGumroadPublishing, setShowGumroadPublishing] = useState(false);
  const [approvedProject, setApprovedProject] = useState<any>(null);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setMessage('Error: You must be logged in to submit a project.');
      toast.warning('Please log in to submit your project.');
      return;
    }

    // Validate Google Drive link is provided
    const driveLinkPattern = /^https:\/\/drive\.google\.com\/file\/d\/[a-zA-Z0-9_-]+\/view/;
    const hasDrive = googleDriveLink && driveLinkPattern.test(googleDriveLink);
    if (!hasDrive) {
      setMessage('Error: Please provide a valid Google Drive link.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const { id, error } = await addProject({
        title,
        description,
        googleDriveLink,
        projectType,
        price, // Save price
        deadline, // Add deadline
        status: 'pending',
        userId: user.uid,
      });

      if (error) {
        setMessage(`Error: ${error}`);
        toast.error('Failed to create project. Please try again.');
        setLoading(false);
        return;
      }

      if (!id) {
        setMessage('Error: Failed to create project');
        toast.error('Error creating project. Try again.');
        setLoading(false);
        return;
      }

      setMessage('Project submitted successfully! Starting AI verification...');
      toast.success('Project submitted! Running AI verification...');
      // Call the verification API
      try {
        const verifyResponse = await fetch('/api/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            projectId: id,
            title,
            description,
            projectType,
            googleDriveLink: hasDrive ? googleDriveLink : '',
            deadline,
          }),
        });
        if (!verifyResponse.ok) {
          throw new Error(`HTTP error! status: ${verifyResponse.status}`);
        }
        const verifyResult = await verifyResponse.json();
        if (verifyResult.success) {
          if (verifyResult.approved) {
            setMessage('Project approved by AI! Starting automatic Gumroad publishing...');
            setApprovedProject({
              id,
              title,
              description,
              price,
              projectType
            });
            setShowGumroadPublishing(true);
          } else {
            setMessage(`Project rejected by AI: ${verifyResult.reason}`);
            toast.warning('Project rejected by AI. Check description and file.');
          }
        } else {
          setMessage(`Verification failed: ${verifyResult.error}`);
          toast.error('Verification failed. Please try again.');
        }
      } catch (verifyError) {
        console.error('Verification error:', verifyError);
        setMessage('Project submitted but verification failed. Please try again.');
        toast.error('Verification error. Please try again.');
      }
      // Clear form
      setTitle('');
      setDescription('');
      setGoogleDriveLink('');
      setProjectType('Elementor');
      setPrice(10);

      setDeadline('');
      // Trigger refresh of project list with a small delay to ensure Firestore is updated
      if (onProjectSubmitted) {
        setTimeout(() => {
          onProjectSubmitted();
        }, 1000);
      }
    } catch (error) {
      console.error('Submission error:', error);
      setMessage('Error: Failed to submit project. Please try again.');
      toast.error('Submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
      <h2 className="text-2xl font-bold text-slate-900 mb-6">Submit New Project</h2>

      {!user && (
        <div className="mb-6 p-4 rounded-lg border border-yellow-300 bg-yellow-50 text-yellow-800">
          <p className="font-semibold">You need to log in to submit a project.</p>
          <p className="mt-2 text-sm">
            Please{' '}
            <Link href="/login" className="underline font-semibold text-yellow-900">
              log in
            </Link>{' '}
            and try again.
          </p>
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Project Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-blue-600 text-black font-medium bg-white placeholder-slate-400"
            disabled={!user}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-blue-600 text-black font-medium bg-white placeholder-slate-400"
            disabled={!user}
            rows={4}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Google Drive Link</label>
          <input
            type="url"
            value={googleDriveLink}
            onChange={(e) => {
              // Remove query params from Google Drive link
              let val = e.target.value;
              if (val.startsWith('https://drive.google.com/')) {
                val = val.split('?')[0];
              }
              setGoogleDriveLink(val);
            }}
            className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-blue-600 text-black font-medium bg-white placeholder-slate-400"
            disabled={!user}
            placeholder="https://drive.google.com/file/d/YOUR_FILE_ID/view"
          />
          <p className="text-xs text-slate-500 mt-1">
            📁 Right-click your file in Google Drive → "Get link" → Copy the link
          </p>
          <p className="text-xs text-slate-500 mt-1">Google Drive link is required.</p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Price (USD)</label>
          <input
            type="number"
            min={1}
            step={1}
            value={price}
            onChange={e => setPrice(Math.max(1, Number(e.target.value)))}
            className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-blue-600 text-black font-medium bg-white placeholder-slate-400"
            disabled={!user}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Deadline (Optional)</label>
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-blue-600 text-black font-medium bg-white placeholder-slate-400"
            disabled={!user}
          />
          <p className="text-xs text-slate-500 mt-1">
            Optional: Set a deadline for this project. AI will verify if deadline is met.
          </p>
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Project Type</label>
          <div className="relative">
            <select
              value={projectType}
              onChange={(e) => setProjectType(e.target.value as 'Elementor' | 'Graphic Design' | 'Video')}
            className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-blue-600 text-black font-medium bg-white appearance-none pr-10"
            disabled={!user}
            >
              <option value="Elementor">Elementor</option>
              <option value="Graphic Design">Graphic Design</option>
              <option value="Video">Video</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
        {message && !showGumroadPublishing && (
          <div className={`p-4 rounded-lg font-medium ${
            message.includes('Error') || message.includes('rejected') || message.includes('failed')
              ? 'bg-red-50 text-red-700 border border-red-200'
              : 'bg-green-50 text-green-700 border border-green-200'
          }`}>
            {message}
          </div>
        )}

        {showGumroadPublishing && approvedProject && (
          <GumroadPublishingStatus
            projectId={approvedProject.id}
            projectTitle={approvedProject.title}
            projectDescription={approvedProject.description}
            projectPrice={approvedProject.price}
            projectType={approvedProject.projectType}
            onPublishingComplete={(gumroadUrl) => {
              setMessage(`Project approved and published to Gumroad! Product URL: ${gumroadUrl}`);
              setShowGumroadPublishing(false);
            }}
          />
        )}


        <button
          type="submit"
          disabled={loading || !user}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-500 text-white py-4 px-6 rounded-lg hover:from-blue-700 hover:to-indigo-600 disabled:opacity-60 transition font-bold text-lg shadow-lg"
        >
          {loading ? 'Submitting...' : 'Submit Project'}
        </button>
      </form>
    </div>
  );
} 