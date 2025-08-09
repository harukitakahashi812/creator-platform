'use client';

import { useState, useEffect, useMemo } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';

interface Project {
  id: string;
  title: string;
  description: string;
  projectType: string;
  createdAt: Date;
  price?: number;
}

export default function BrowsePage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const PROJECTS_PER_PAGE = 6;

  useEffect(() => {
    const fetchApprovedProjects = async () => {
      try {
        const q = query(
          collection(db, 'projects'),
          where('status', '==', 'approved'),
          orderBy('createdAt', 'desc')
        );
        
        const querySnapshot = await getDocs(q);
        const projectsData = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
          } as Project;
        });
        
        setProjects(projectsData);
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchApprovedProjects();
  }, []);

  useEffect(() => {
    setPage(1); // Reset to first page on filter/search
  }, [filter, search]);

  // Filter by type and search
  const filteredProjects = useMemo(() => {
    let filtered = filter === 'all' ? projects : projects.filter(project => project.projectType === filter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );
    }
    return filtered;
  }, [projects, filter, search]);

  const totalPages = Math.ceil(filteredProjects.length / PROJECTS_PER_PAGE) || 1;
  const paginatedProjects = filteredProjects.slice(
    (page - 1) * PROJECTS_PER_PAGE,
    page * PROJECTS_PER_PAGE
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-slate-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Browse Projects</h1>
              <p className="text-slate-600 font-medium">Discover AI-verified creative projects</p>
            </div>
            <Link
              href="/"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold shadow-md"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="container mx-auto px-4 py-6">
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
        {/* Filter Buttons */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Filter by Type</h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              All Projects
            </button>
            <button
              onClick={() => setFilter('Elementor')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'Elementor'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Elementor
            </button>
            <button
              onClick={() => setFilter('Graphic Design')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'Graphic Design'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Graphic Design
            </button>
            <button
              onClick={() => setFilter('Video')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'Video'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Video
            </button>
          </div>
        </div>

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No projects found</h3>
            <p className="text-slate-600">No projects match your current filter.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedProjects.map((project) => (
              <div key={project.id} className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden hover:shadow-xl transition-shadow">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                      {project.projectType}
                    </span>
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                      AI-Verified ✓
                    </span>
                  </div>
                  
                  <h3 className="font-bold text-lg text-slate-900 mb-3">{project.title}</h3>
                  <p className="text-slate-700 mb-4 leading-relaxed line-clamp-3">{project.description}</p>
                  
                  <div className="flex justify-between items-center text-sm text-slate-500 mb-4">
                    <span>Added: {new Date(project.createdAt).toLocaleDateString()}</span>
                    <span className="font-bold text-blue-600">${project.price?.toFixed(2) ?? '10.00'}</span>
                  </div>

                  <Link
                    href={`/project/${project.id}`}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition font-medium text-center block shadow-md"
                  >
                    View & Purchase
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
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
      </div>
    </div>
  );
}
