'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { getProjectsByUser, Project } from '@/lib/firebase';
import Link from 'next/link';
import DeleteModal from './DeleteModal';

export default function ProjectList({ refreshTrigger }: { refreshTrigger?: number }) {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingProject, setDeletingProject] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; projectId: string; projectTitle: string }>({
    isOpen: false,
    projectId: '',
    projectTitle: ''
  });
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const PROJECTS_PER_PAGE = 6;

  const handleDeleteClick = (projectId: string, projectTitle: string) => {
    setDeleteModal({
      isOpen: true,
      projectId,
      projectTitle
    });
  };

  const handleDeleteConfirm = async () => {
    const { projectId } = deleteModal;
    setDeletingProject(projectId);
    
    try {
      const response = await fetch(`/api/delete-project`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId }),
      });

      if (response.ok) {
        // Remove project from local state
        setProjects(projects.filter(p => p.id !== projectId));
        setDeleteModal({ isOpen: false, projectId: '', projectTitle: '' });
      } else {
        const error = await response.json();
        alert(`Failed to delete project: ${error.error}`);
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete project. Please try again.');
    } finally {
      setDeletingProject(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ isOpen: false, projectId: '', projectTitle: '' });
  };

  useEffect(() => {
    setPage(1); // Reset to first page on refresh/search
  }, [refreshTrigger, search]);

  useEffect(() => {
    const fetchProjects = async () => {
      if (!user) return;
      setLoading(true);
      const { projects, error } = await getProjectsByUser(user.uid);
      if (!error) {
        setProjects(projects);
      } else {
        setProjects([]);
      }
      setLoading(false);
    };
    fetchProjects();
  }, [user, refreshTrigger]);

  // Filtered and paginated projects
  const filteredProjects = useMemo(() => {
    if (!search.trim()) return projects;
    const q = search.trim().toLowerCase();
    return projects.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q)
    );
  }, [projects, search]);

  const totalPages = Math.ceil(filteredProjects.length / PROJECTS_PER_PAGE) || 1;
  const paginatedProjects = filteredProjects.slice(
    (page - 1) * PROJECTS_PER_PAGE,
    page * PROJECTS_PER_PAGE
  );

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Your Projects</h2>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading projects...</p>
        </div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Your Projects</h2>
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-slate-600 font-medium">No projects submitted yet.</p>
          <p className="text-slate-500 text-sm mt-2">Submit your first project above!</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
      <h2 className="text-2xl font-bold text-slate-900 mb-6">Your Projects</h2>
      {/* Search Field */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-3">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by title or description..."
          className="w-full sm:w-80 px-4 py-2 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-blue-600 text-black font-medium bg-white placeholder-slate-400"
        />
        <div className="flex-1" />
        <span className="text-sm text-slate-500">{filteredProjects.length} found</span>
      </div>
      {/* Project List */}
      <div className="space-y-4">
        {paginatedProjects.map((project) => (
          <div key={project.id} className="border-2 border-slate-200 rounded-xl p-6 hover:border-slate-300 transition">
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-bold text-lg text-slate-900">{project.title}</h3>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(project.status)}`}>
                {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
              </span>
            </div>
            
            <p className="text-slate-700 mb-3 leading-relaxed">{project.description}</p>
            
            <div className="flex justify-between items-center text-sm text-slate-500 mb-3">
              <span className="font-medium">Type: {project.projectType}</span>
              <span>Price: <span className="font-bold text-blue-600">${project.price?.toFixed(2) ?? 'N/A'}</span></span>
              <span>Submitted: {new Date(project.createdAt).toLocaleDateString()}</span>
            </div>

            {project.status === 'rejected' && project.rejectionReason && (
              <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-3">
                <p className="text-red-700 text-sm font-medium">
                  <strong>Rejection Reason:</strong> {project.rejectionReason}
                </p>
              </div>
            )}

            <div className="flex space-x-3">
              <a
                href={project.googleDriveLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 font-semibold text-sm flex items-center"
              >
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                  <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                </svg>
                View on Google Drive
              </a>
              {project.status === 'approved' && (
                <Link
                  href={`/project/${project.id}`}
                  className="text-green-600 hover:text-green-700 font-semibold text-sm flex items-center"
                >
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  View Public Page
                </Link>
              )}
              <button
                onClick={() => handleDeleteClick(project.id!, project.title)}
                disabled={deletingProject === project.id}
                className={`font-semibold text-sm flex items-center ${
                  deletingProject === project.id 
                    ? 'text-gray-400 cursor-not-allowed' 
                    : 'text-red-600 hover:text-red-700'
                }`}
              >
                {deletingProject === project.id ? (
                  <>
                    <svg className="animate-spin w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Deleting...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-lg border border-slate-300 bg-slate-100 text-slate-700 font-medium hover:bg-slate-200 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-slate-700 font-semibold">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 rounded-lg border border-slate-300 bg-slate-100 text-slate-700 font-medium hover:bg-slate-200 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
      <DeleteModal
        isOpen={deleteModal.isOpen}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        projectTitle={deleteModal.projectTitle}
        isLoading={deletingProject === deleteModal.projectId}
      />
    </div>
  );
}