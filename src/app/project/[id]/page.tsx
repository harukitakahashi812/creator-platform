'use client';

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getProjectById } from '@/lib/firebase'
import { useAuth } from '@/components/AuthProvider'
import { createCheckoutSession } from '@/lib/stripe'
import DeleteModal from '@/components/DeleteModal'
import FileUpload from '@/components/FileUpload'
import { Project } from '@/lib/firebase'

interface ProjectPageProps {
  params: { id: string }
}

export default function ProjectPage({ params }: ProjectPageProps) {
  const { id } = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (id && typeof id === 'string') {
      fetchProject(id)
    }
  }, [id])

  const fetchProject = async (projectId: string) => {
    try {
      const { project: fetchedProject, error } = await getProjectById(projectId)
      if (error) {
        setError(error)
      } else if (fetchedProject) {
        setProject(fetchedProject)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch project')
    } finally {
      setLoading(false)
    }
  }

  const handleCheckout = async () => {
    if (!project) return

    setCheckoutLoading(true)
    try {
      const response = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: project.id,
          projectTitle: project.title,
          price: project.price
        })
      })

      const data = await response.json()
      if (data.success && data.url) {
        window.location.href = data.url
      } else {
        setError(data.error || 'Failed to create checkout session')
      }
    } catch (err: any) {
      setError(err.message || 'Checkout failed')
    } finally {
      setCheckoutLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!project) return

    setDeleting(true)
    try {
      const response = await fetch('/api/delete-project', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: project.id })
      })

      if (response.ok) {
        router.push('/dashboard')
      } else {
        setError('Failed to delete project')
      }
    } catch (err: any) {
      setError(err.message || 'Delete failed')
    } finally {
      setDeleting(false)
    }
  }

  const openOfferwall = () => {
    if (!project) return
    router.push(`/offerwall?project_id=${project.id}`)
  }

  const handleAIVerification = async () => {
    if (!project) return

    setVerifying(true)
    try {
      const response = await fetch('/api/verify-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: project.id })
      })

      const data = await response.json()
      if (data.success) {
        router.refresh() // Refresh project data to show updated status
      } else {
        setError(data.error || 'Failed to verify project')
      }
    } catch (err: any) {
      setError(err.message || 'Verification failed')
    } finally {
      setVerifying(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-10 px-6">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-slate-200 rounded w-1/2 mb-8"></div>
          <div className="space-y-4">
            <div className="h-20 bg-slate-200 rounded"></div>
            <div className="h-20 bg-slate-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="max-w-4xl mx-auto py-10 px-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-slate-600 mb-6">{error || 'Project not found'}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-slate-800 text-white px-6 py-3 rounded-lg hover:bg-slate-900"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  const isOwner = user?.uid === project.userId
  const fundedAmount = project.fundedAmount || 0
  const fundingProgress = Math.min((fundedAmount / project.price) * 100, 100)
  const isFullyFunded = fundedAmount >= project.price

  return (
    <div className="max-w-4xl mx-auto py-10 px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{project.title}</h1>
        <div className="flex items-center space-x-4 text-slate-600">
          <span className="capitalize">{project.projectType}</span>
          <span>•</span>
          <span>${project.price}</span>
          <span>•</span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            project.status === 'approved' ? 'bg-green-100 text-green-800' :
            project.status === 'rejected' ? 'bg-red-100 text-red-800' :
            'bg-yellow-100 text-yellow-800'
          }`}>
            {project.status}
          </span>
        </div>
      </div>

      {/* File Upload Section - Only show if project is pending and user is owner */}
      {project.userId === user?.uid && project.status === 'pending' && (
        <div className="mb-8">
          <FileUpload 
            project={project} 
            onUploadComplete={() => {
              // Refresh project data
              router.refresh()
            }} 
          />
        </div>
      )}

      {/* AI Verification Section - Only show if files are uploaded and project is pending */}
      {project.userId === user?.uid && project.status === 'pending' && project.hasFiles && (
        <div className="mb-8">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-blue-900 mb-2">Ready for AI Verification</h3>
            <p className="text-blue-700 mb-4">
              Your project files have been uploaded. Click the button below to submit for AI verification.
            </p>
            <button
              onClick={handleAIVerification}
              disabled={verifying}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {verifying ? 'Verifying...' : 'Submit for AI Verification'}
            </button>
          </div>
        </div>
      )}

      {/* Funding Progress Section */}
      {project.status === 'approved' && (
        <div className="mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Funding Progress</h3>
            
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Current Funding: ${project.fundedAmount || 0}</span>
                <span>Target: ${project.price}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-blue-600 h-3 rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(((project.fundedAmount || 0) / project.price) * 100, 100)}%` }}
                ></div>
              </div>
              <div className="text-center mt-2">
                <span className="text-sm font-medium text-gray-700">
                  {Math.round(((project.fundedAmount || 0) / project.price) * 100)}% Funded
                </span>
              </div>
            </div>

            {(project.fundedAmount || 0) >= project.price ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <span className="text-green-800 font-medium">Project fully funded! 🎉</span>
                </div>
                <p className="text-green-700 text-sm mt-1">
                  Your project will be automatically published to Gumroad soon.
                </p>
              </div>
            ) : (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Complete Offers to Fund Your Project</h4>
                <p className="text-blue-700 text-sm mb-3">
                  Complete surveys, app installs, and other offers to earn money towards your project goal.
                </p>
                <button
                  onClick={() => router.push('/offerwall')}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium"
                >
                  Start Earning - Open Offerwall
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Project Actions */}
      {project.userId === user?.uid && (
        <div className="mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Project Actions</h3>
            
            <div className="space-y-3">
              {project.status === 'pending' && !project.hasFiles && (
                <div className="text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <p className="text-sm">📁 Please upload your project files to continue</p>
                </div>
              )}
              
              {project.status === 'pending' && project.hasFiles && (
                <div className="text-blue-700 bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm">✅ Files uploaded! Ready for AI verification</p>
                </div>
              )}
              
              {project.status === 'approved' && (
                <div className="text-green-700 bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm">🎯 Project approved! Start earning through offers</p>
                </div>
              )}
              
              {project.status === 'rejected' && (
                <div className="text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm">❌ Project rejected. Please review and resubmit</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-3">Description</h3>
            <p className="text-slate-700 leading-relaxed">{project.description}</p>
          </div>

          {project.googleDriveLink && (
            <div>
              <h3 className="text-xl font-semibold mb-3">Files</h3>
              <a
                href={project.googleDriveLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                View Project Files →
              </a>
            </div>
          )}

          {project.gumroadLink && (
            <div>
              <h3 className="text-xl font-semibold mb-3">Gumroad Product</h3>
              <a
                href={project.gumroadLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                View on Gumroad →
              </a>
            </div>
          )}

          {project.status === 'rejected' && project.rejectionReason && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-red-800 mb-2">Rejection Reason</h3>
              <p className="text-red-700">{project.rejectionReason}</p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {project.status === 'approved' && !isFullyFunded && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">Ready to Sell?</h4>
              <p className="text-blue-700 text-sm mb-3">
                Complete offers to fund your project, then it will be published automatically.
              </p>
              <button
                onClick={openOfferwall}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
              >
                Start Earning
              </button>
            </div>
          )}

          {project.status === 'approved' && isFullyFunded && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2">Project Funded!</h4>
              <p className="text-green-700 text-sm">
                Your project will be published to Gumroad automatically.
              </p>
            </div>
          )}

          {isOwner && (
            <div className="space-y-3">
              <button
                onClick={() => router.push(`/dashboard/edit/${project.id}`)}
                className="w-full bg-slate-800 text-white px-4 py-2 rounded hover:bg-slate-900"
              >
                Edit Project
              </button>
              
              <button
                onClick={() => setShowDeleteModal(true)}
                className="w-full bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Delete Project
              </button>
            </div>
          )}

          {!isOwner && project.status === 'approved' && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <h4 className="font-semibold text-slate-800 mb-2">Buy This Project</h4>
              <p className="text-slate-700 text-sm mb-3">
                Get access to this {project.projectType.toLowerCase()} for ${project.price}
              </p>
              <button
                onClick={handleCheckout}
                disabled={checkoutLoading}
                className="w-full bg-slate-900 text-white px-4 py-2 rounded hover:bg-slate-950 disabled:opacity-60"
              >
                {checkoutLoading ? 'Loading...' : 'Buy Now'}
              </button>
            </div>
          )}
        </div>
      </div>

      <DeleteModal
        isOpen={showDeleteModal}
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        projectTitle={project.title}
        isLoading={deleting}
      />
    </div>
  )
}