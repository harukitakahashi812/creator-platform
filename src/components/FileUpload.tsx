'use client'

import { useState } from 'react'
import { updateProject } from '@/lib/firebase'
import { Project } from '@/types/project'
import { CloudArrowUpIcon, LinkIcon, DocumentIcon } from '@heroicons/react/24/outline'

interface FileUploadProps {
  project: Project
  onUploadComplete: () => void
}

export default function FileUpload({ project, onUploadComplete }: FileUploadProps) {
  const [uploadMethod, setUploadMethod] = useState<'file' | 'drive'>('file')
  const [googleDriveLink, setGoogleDriveLink] = useState(project.googleDriveLink || '')
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files))
    }
  }

  const handleGoogleDriveSubmit = async () => {
    if (!googleDriveLink.trim()) {
      setError('Please enter a Google Drive link')
      return
    }

    setUploading(true)
    setError('')

    try {
      await updateProject(project.id, {
        googleDriveLink: googleDriveLink.trim(),
        hasFiles: true
      })
      
      setSuccess(true)
      onUploadComplete()
      
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to update project')
    } finally {
      setUploading(false)
    }
  }

  const handleFileUpload = async () => {
    if (files.length === 0) {
      setError('Please select files to upload')
      return
    }

    setUploading(true)
    setError('')

    try {
      // Here you would typically upload to a storage service like Firebase Storage
      // For now, we'll just mark that files are uploaded
      await updateProject(project.id, {
        hasFiles: true,
        fileCount: files.length
      })
      
      setSuccess(true)
      onUploadComplete()
      
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to upload files')
    } finally {
      setUploading(false)
    }
  }

  if (project.hasFiles) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center">
          <DocumentIcon className="w-5 h-5 text-green-600 mr-2" />
          <span className="text-green-800 font-medium">Files uploaded successfully!</span>
        </div>
        {project.googleDriveLink && (
          <div className="mt-2">
            <a 
              href={project.googleDriveLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-green-700 hover:text-green-900 underline break-all"
            >
              View Google Drive files
            </a>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Upload Project Files</h3>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-700 text-sm">Files uploaded successfully!</p>
        </div>
      )}

      <div className="mb-6">
        <div className="flex space-x-4 mb-4">
          <button
            onClick={() => setUploadMethod('file')}
            className={`px-4 py-2 rounded-lg font-medium ${
              uploadMethod === 'file'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <CloudArrowUpIcon className="w-4 h-4 inline mr-2" />
            Upload Files
          </button>
          <button
            onClick={() => setUploadMethod('drive')}
            className={`px-4 py-2 rounded-lg font-medium ${
              uploadMethod === 'drive'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <LinkIcon className="w-4 h-4 inline mr-2" />
            Google Drive Link
          </button>
        </div>
      </div>

      {uploadMethod === 'file' ? (
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-4">
              <label htmlFor="file-upload" className="cursor-pointer">
                <span className="text-blue-600 hover:text-blue-500 font-medium">
                  Click to upload files
                </span>
                <span className="text-gray-500"> or drag and drop</span>
              </label>
              <input
                id="file-upload"
                name="file-upload"
                type="file"
                multiple
                className="sr-only"
                onChange={handleFileSelect}
                accept=".zip,.rar,.7z,.pdf,.doc,.docx,.txt,.html,.css,.js,.php,.py,.java,.cpp,.c,.h,.xml,.json"
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              ZIP, RAR, PDF, documents, code files up to 100MB
            </p>
          </div>
          
          {files.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Selected Files:</h4>
              <ul className="space-y-1">
                {files.map((file, index) => (
                  <li key={index} className="text-sm text-gray-600 flex items-center">
                    <DocumentIcon className="w-4 h-4 mr-2" />
                    {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <button
            onClick={handleFileUpload}
            disabled={uploading || files.length === 0}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? 'Uploading...' : 'Upload Files'}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label htmlFor="drive-link" className="block text-sm font-medium text-gray-700 mb-2">
              Google Drive Link
            </label>
            <input
              type="url"
              id="drive-link"
              value={googleDriveLink}
              onChange={(e) => setGoogleDriveLink(e.target.value)}
              placeholder="https://drive.google.com/drive/folders/..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Make sure the link is publicly accessible or shared with appropriate permissions
            </p>
          </div>
          
          <button
            onClick={handleGoogleDriveSubmit}
            disabled={uploading || !googleDriveLink.trim()}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? 'Saving...' : 'Save Drive Link'}
          </button>
        </div>
      )}
    </div>
  )
}
