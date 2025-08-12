'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getProjectById, Project } from '@/lib/firebase';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';

export default function ProjectPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProject = async () => {
      if (!params.id || typeof params.id !== 'string') {
        setError('Invalid project ID');
        setLoading(false);
        return;
      }

      const { project, error } = await getProjectById(params.id);
      if (project) {
        setProject(project);
      } else {
        setError(error || 'Project not found');
      }
      setLoading(false);
    };

    fetchProject();
  }, [params.id]);

  const handleStripeCheckout = async () => {
    if (!project?.id) return;

    try {
      console.log('🛒 Initiating Stripe checkout for project:', project.id);

      const response = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: project.id,
          projectTitle: project.title,
          price: displayPrice,
        }),
      });

      const result = await response.json();

      if (response.ok && result.url) {
        console.log('✅ Checkout URL received, redirecting...');
        window.location.href = result.url;
      } else {
        console.error('❌ Checkout failed:', result.error);
        alert(`Failed to create checkout session: ${result.error}`);
      }
    } catch (error) {
      console.error('❌ Checkout error:', error);
      alert('Failed to initiate checkout. Please try again.');
    }
  };

  const handleGumroadPurchase = () => {
    if (!project) return;
    if (!project.gumroadLink) {
      alert('Gumroad product is being created. Please refresh this page in a moment.');
      return;
    }
    window.open(project.gumroadLink, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading project...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Project Not Found</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link href="/" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  if (project.status !== 'approved') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Project Not Available</h1>
          <p className="text-gray-600 mb-6">This project is not yet approved for public viewing.</p>
          <Link href="/" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  // Use a fallback price if missing
  const displayPrice = typeof project.price === 'number' && !isNaN(project.price) ? project.price : 10;
  const isSubscription = (project as any).isSubscription === true;
  const interval = ((project as any).interval as 'month' | 'year') || 'month';

  // Check if current user is the owner
  const isOwner = user && project.userId && user.uid === project.userId;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 bg-white border border-slate-200 shadow-sm px-4 py-2 rounded-lg text-blue-700 font-semibold hover:bg-blue-50 hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Project Header */}
            <div className="p-8">
              <div className="flex items-center justify-between mb-4">
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  {project.projectType}
                </span>
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  AI-Verified ✓
                </span>
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-4">{project.title}</h1>
              <p className="text-lg text-gray-700 mb-6">{project.description}</p>

              {/* Project Preview - Removed Google Drive link for security */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Project Preview</h2>
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
                  <div className="flex items-center space-x-4">
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-3 rounded-lg">
                      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 6a2 2 0 11-4 0 2 2 0 014 0zm2-2a2 2 0 00-2 2v2a2 2 0 002 2h8a2 2 0 002-2v-2a2 2 0 00-2-2H8z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">Professional {project.projectType} Project</h3>
                      <p className="text-gray-600">Complete, AI-verified project ready for purchase</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">${displayPrice.toFixed(2)}</div>
                      <div className="text-sm text-gray-500">One-time purchase</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Purchase Options */}
              <div className="border-t border-gray-200 pt-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">Purchase This Project</h2>
                {isOwner ? (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
                    <h3 className="text-lg font-semibold text-yellow-800 mb-2">You are the creator of this project.</h3>
                    <p className="text-yellow-700">You cannot purchase your own work.</p>
                  </div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2">
                    {/* Stripe Option */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200 hover:shadow-lg transition-shadow">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Secure Checkout</h3>
                      <p className="text-gray-700 mb-4">Pay securely with credit card via Stripe</p>
                      <div className="text-2xl font-bold text-blue-600 mb-4">
                        ${displayPrice.toFixed(2)}{isSubscription ? ` / ${interval}` : ''}
                      </div>
                      <button
                        onClick={handleStripeCheckout}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition font-medium shadow-md"
                      >
                        Buy with Stripe
                      </button>
                    </div>
                    {/* Gumroad Option */}
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200 hover:shadow-lg transition-shadow">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Gumroad</h3>
                      <p className="text-gray-700 mb-4">Alternative payment method</p>
                      <div className="text-2xl font-bold text-green-600 mb-4">${displayPrice.toFixed(2)}</div>
                      <button
                        onClick={handleGumroadPurchase}
                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-6 rounded-lg hover:from-green-700 hover:to-emerald-700 transition font-medium shadow-md"
                      >
                        Buy with Gumroad
                      </button>
                                         </div>
                   </div>
                  )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}