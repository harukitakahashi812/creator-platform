'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { useRouter, useSearchParams } from 'next/navigation'
import { getProject } from '@/lib/firebase'
import { Project } from '@/lib/firebase'

export default function OfferwallPage() {
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const projectId = searchParams.get('project_id')
  
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    if (projectId) {
      loadProject()
    }
  }, [user, projectId])

  const loadProject = async () => {
    try {
      const projectData = await getProject(projectId!)
      setProject(projectData)
    } catch (err: any) {
      setError(err.message || 'Failed to load project')
    } finally {
      setLoading(false)
    }
  }

  const openClixwallOfferwall = () => {
    if (!project) return

    // Clixwall integration URL
    const clixwallUrl = `https://clixwall.com/offerwall?user_id=${user?.uid}&subid=${project.id}&callback=${encodeURIComponent(`${window.location.origin}/api/offerwall/callback`)}`
    
    // Open in new tab
    window.open(clixwallUrl, '_blank', 'width=1200,height=800')
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">Please log in to access the offerwall.</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading offerwall...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Project Not Found</h1>
          <p className="text-gray-600 mb-4">The project you're looking for doesn't exist.</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  if (project.status !== 'approved') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Project Not Ready</h1>
          <p className="text-gray-600 mb-4">
            This project needs to be approved before you can start earning through offers.
          </p>
          <button
            onClick={() => router.push(`/project/${project.id}`)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            View Project
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Complete Offers to Fund Your Project</h1>
          <p className="text-lg text-gray-600">
            Earn money by completing surveys, installing apps, and other offers
          </p>
        </div>

        {/* Project Info Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Project: {project.title}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="text-center">
              <div className="p-3 bg-blue-100 rounded-lg inline-block mb-2">
                <span className="text-blue-600 text-2xl">💰</span>
              </div>
              <p className="text-sm text-gray-600">Target Amount</p>
              <p className="text-xl font-bold text-gray-900">${project.price}</p>
            </div>
            
            <div className="text-center">
              <div className="p-3 bg-green-100 rounded-lg inline-block mb-2">
                <span className="text-green-600 text-2xl">💵</span>
              </div>
              <p className="text-sm text-gray-600">Current Funding</p>
              <p className="text-xl font-bold text-gray-900">${project.fundedAmount || 0}</p>
            </div>
            
            <div className="text-center">
              <div className="p-3 bg-purple-100 rounded-lg inline-block mb-2">
                <span className="text-purple-600 text-2xl">📊</span>
              </div>
              <p className="text-sm text-gray-600">Progress</p>
              <p className="text-xl font-bold text-gray-900">
                {Math.round(((project.fundedAmount || 0) / project.price) * 100)}%
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>${project.fundedAmount || 0} earned</span>
              <span>${project.price} needed</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-blue-600 h-3 rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(((project.fundedAmount || 0) / project.price) * 100, 100)}%` }}
              ></div>
            </div>
          </div>

          {(project.fundedAmount || 0) >= project.price ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <span className="text-4xl mb-2 block">🎉</span>
              <p className="text-green-800 font-medium text-lg">Project Fully Funded!</p>
              <p className="text-green-700 text-sm">
                Your project will be automatically published to Gumroad soon.
              </p>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                You need ${(project.price - (project.fundedAmount || 0)).toFixed(2)} more to reach your goal
              </p>
            </div>
          )}
        </div>

        {/* Offerwall Options */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Start Earning</h3>
          
          <div className="space-y-4">
            {/* Clixwall Integration */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Clixwall Offers</h4>
                  <p className="text-sm text-gray-600">
                    High-paying surveys, app installs, and signup offers
                  </p>
                </div>
                <button
                  onClick={openClixwallOfferwall}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center"
                >
                  Open Offerwall
                  <span className="ml-2">→</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Back to Project */}
        <div className="text-center mt-8">
          <button
            onClick={() => router.push(`/project/${project.id}`)}
            className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700"
          >
            Back to Project
          </button>
        </div>
      </div>
    </div>
  )
}
