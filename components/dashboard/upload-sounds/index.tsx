'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

interface UploadState {
  isUploading: boolean;
  progress: number;
  error: string | null;
  success: boolean;
}

interface Soundpack {
  id: number;
  name: string;
  description: string;
  cover_image_url: string;
  tags: string;
}

export default function UploadSounds() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    soundpack_id: '',
    tags: '',
  });
  const [files, setFiles] = useState<File[]>([]);
  const [soundpacks, setSoundpacks] = useState<Soundpack[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newSoundpack, setNewSoundpack] = useState({
    name: '',
    description: '',
    cover_image_url: '',
    tags: ''
  });
  const [createError, setCreateError] = useState<string | null>(null);
  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    error: null,
    success: false,
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles?.length) return;

    setFiles(Array.from(selectedFiles));

    // Set the title to the first file's name without extension
    if (selectedFiles[0]) {
      const fileName = selectedFiles[0].name;
      const titleWithoutExtension = fileName.substring(0, fileName.lastIndexOf('.'));
      setFormData(prev => ({
        ...prev,
        title: titleWithoutExtension
      }));
    }

    // Validate file types
    const invalidFiles = Array.from(selectedFiles).filter(
      file => !file.type.startsWith('audio/')
    );
    
    if (invalidFiles.length > 0) {
      setUploadState((prev) => ({
        ...prev,
        error: 'Please select only audio files',
      }));
      return;
    }
    
    setUploadState((prev) => ({ ...prev, error: null }));
  };

  const removeFile = (indexToRemove: number) => {
    setFiles(prevFiles => {
      const newFiles = prevFiles.filter((_, index) => index !== indexToRemove);
      // If we removed the first file and there are other files, update the title to the new first file
      if (indexToRemove === 0 && newFiles.length > 0) {
        const newFirstFileName = newFiles[0].name;
        const newTitleWithoutExtension = newFirstFileName.substring(0, newFirstFileName.lastIndexOf('.'));
        setFormData(prev => ({
          ...prev,
          title: newTitleWithoutExtension
        }));
      }
      // If we removed the last file, clear the title if it matches the removed file
      if (newFiles.length === 0) {
        setFormData(prev => ({
          ...prev,
          title: ''
        }));
        // Reset the file input
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (fileInput) {
          fileInput.value = '';
        }
      }
      return newFiles;
    });
  };

  useEffect(() => {
    // Fetch soundpacks when component mounts
    const fetchSoundpacks = async () => {
      try {
        const response = await fetch('/api/admin/soundpacks');
        if (!response.ok) throw new Error('Failed to fetch soundpacks');
        const data = await response.json();
        setSoundpacks(data);
      } catch (error) {
        console.error('Error fetching soundpacks:', error);
      }
    };

    fetchSoundpacks();
  }, []);

  const handleCreateSoundpack = async () => {
    try {
      setIsCreating(true);
      setCreateError(null);
      
      // Normalize the data before sending
      const normalizedData = {
        name: newSoundpack.name.trim(),
        description: newSoundpack.description.trim(),
        cover_image_url: newSoundpack.cover_image_url.trim(),
        tags: newSoundpack.tags.trim()
      };

      const response = await fetch('/api/admin/soundpacks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(normalizedData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create soundpack');
      }
      
      setSoundpacks(prev => [...prev, data]);
      setFormData(prev => ({ ...prev, soundpack_id: data.id.toString() }));
      setIsCreateModalOpen(false);
      setNewSoundpack({ name: '', description: '', cover_image_url: '', tags: '' });
      toast.success('Soundpack created successfully!');
    } catch (error) {
      console.error('Error creating soundpack:', error);
      setCreateError(error instanceof Error ? error.message : 'Failed to create soundpack');
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0) {
      toast.error('Please select at least one sound file');
      return;
    }

    setUploadState({
      isUploading: true,
      progress: 0,
      error: null,
      success: false,
    });

    try {
      // Upload each file
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Simple progress based on completed files
        const progress = Math.round((i / files.length) * 90); // Leave 10% for final processing
        setUploadState(prev => ({ ...prev, progress }));

        // First, upload the file
        const fileFormData = new FormData();
        fileFormData.append('file', file);

        const uploadRes = await fetch('/api/admin/upload-file', {
          method: 'POST',
          body: fileFormData,
        });

        if (!uploadRes.ok) throw new Error('File upload failed');
        
        const { url, duration, bytes, format } = await uploadRes.json();

        // Then save metadata
        const metadataRes = await fetch('/api/admin/upload-sound', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: `${formData.title}${files.length > 1 ? ` (${i + 1})` : ''}`,
            description: formData.description,
            soundpack_id: formData.soundpack_id,
            tags: formData.tags.split(',').map((tag: string) => tag.trim()),
            filePath: url,
            duration,
            fileSize: bytes,
            fileFormat: format,
          }),
        });

        if (!metadataRes.ok) {
          throw new Error('Failed to save sound metadata');
        }
      }

      setUploadState({
        isUploading: false,
        progress: 100,
        error: null,
        success: true,
      });

      // Reset form after successful upload
      setFormData({
        title: '',
        description: '',
        soundpack_id: '',
        tags: '',
      });
      setFiles([]);
      
      // Show success toast
      toast.success(`Successfully uploaded ${files.length} ${files.length === 1 ? 'file' : 'files'}!`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setUploadState((prev) => ({
        ...prev,
        isUploading: false,
        error: errorMessage
      }));
      toast.error(errorMessage);
    }
  };

  const handleClearForm = () => {
    setFormData({
      title: '',
      description: '',
      soundpack_id: '',
      tags: '',
    });
    setFiles([]);
    setUploadState({
      isUploading: false,
      progress: 0,
      error: null,
      success: false,
    });
  };

  const resetSoundpackForm = () => {
    setNewSoundpack({
      name: '',
      description: '',
      cover_image_url: '',
      tags: ''
    });
    setCreateError(null);
  };

  const handleCloseCreateModal = () => {
    resetSoundpackForm();
    setIsCreateModalOpen(false);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-sm p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Upload Sounds
      </h1>

      <form onSubmit={handleUpload} className="space-y-6">
        <div className="space-y-6">
          {/* File Upload Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Sound Files
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md relative">
              <div className="space-y-1 text-center">
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  accept="audio/*"
                  key={files.length}
                />
                <div className="flex text-sm text-gray-600">
                  <p className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                    Upload a file
                  </p>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">MP3, WAV up to 10MB</p>
              </div>
            </div>
            {files.length > 0 && (
              <div className="mt-2">
                <p className="text-sm font-medium text-gray-700 mb-2">Selected files:</p>
                <ul className="mt-2 divide-y divide-gray-100 bg-white rounded-lg border border-gray-200">
                  {Array.from(files).map((file, index) => (
                    <li key={index} className="px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors">
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                        </svg>
                        <span className="text-sm text-gray-700">{file.name}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="ml-2 p-1 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                        title="Remove file"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="input input-bordered w-full text-black bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="textarea textarea-bordered w-full text-black bg-white"
                placeholder="Description (optional)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Soundpack
              </label>
              <div className="flex gap-2 items-center">
                <select
                  name="soundpack_id"
                  value={formData.soundpack_id}
                  onChange={handleInputChange}
                  className="select select-bordered w-full text-black bg-white"
                >
                  <option value="">No soundpack</option>
                  {soundpacks.map((pack) => (
                    <option key={pack.id} value={pack.id}>
                      {pack.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(true)}
                  className="btn bg-blue-600 hover:bg-blue-800 text-white transition-transform active:scale-95"
                >
                  Create New
                </button>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Select an existing soundpack or create a new one
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Tags
              </label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                placeholder="Enter tags separated by commas (e.g., left-hand, improvisation)"
                className="input input-bordered w-full text-black bg-white"
              />
              <p className="text-xs text-gray-500 mt-1">Tags will be formatted as lowercase with hyphens instead of spaces</p>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-between space-x-4 mt-6">
            <button
              type="button"
              onClick={handleClearForm}
              className="px-4 py-2 text-sm font-medium text-gray-800 hover:text-gray-900 rounded-md border border-gray-300 bg-yellow-200 hover:bg-yellow-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Clear Form
            </button>
            <button
              type="submit"
              disabled={uploadState.isUploading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-800 rounded-md transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center"
              style={{
                transform: uploadState.isUploading ? 'scale(0.98)' : 'scale(1)',
                transition: 'transform 0.1s ease-in-out'
              }}
            >
              {uploadState.isUploading ? (
                <>
                  <span className="loading loading-spinner loading-sm mr-2"></span>
                  Uploading... {uploadState.progress}%
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Upload Files
                </>
              )}
            </button>
          </div>
        </div>

        {uploadState.error && (
          <div className="text-red-600 text-sm">{uploadState.error}</div>
        )}

        {uploadState.isUploading && (
          <div className="text-sm mb-2">
            Uploading... {uploadState.progress}%
            {files.length > 1 && ` (File ${Math.floor(uploadState.progress / (100 / files.length)) + 1} of ${files.length})`}
          </div>
        )}
      </form>

      {/* Create Soundpack Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md relative">
            <button
              onClick={handleCloseCreateModal}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h2 className="text-xl font-bold mb-4 text-gray-900">Create New Soundpack</h2>
            {createError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
                {createError}
              </div>
            )}
            <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={newSoundpack.name}
                  onChange={(e) => setNewSoundpack(prev => ({ ...prev, name: e.target.value }))}
                  className="input input-bordered w-full text-black bg-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={newSoundpack.description}
                  onChange={(e) => setNewSoundpack(prev => ({ ...prev, description: e.target.value }))}
                  className="textarea textarea-bordered w-full text-black bg-white"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Cover Image URL</label>
                <input
                  type="url"
                  value={newSoundpack.cover_image_url}
                  onChange={(e) => setNewSoundpack(prev => ({ ...prev, cover_image_url: e.target.value }))}
                  className="input input-bordered w-full text-black bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Tags</label>
                <input
                  type="text"
                  value={newSoundpack.tags}
                  onChange={(e) => setNewSoundpack(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="e.g., experimental, electronic, ambient (comma separated)"
                  className="input input-bordered w-full text-black bg-white"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Separate tags with commas
                </p>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={handleCloseCreateModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  onClick={handleCreateSoundpack}
                  disabled={isCreating || !newSoundpack.name}
                  className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {isCreating ? (
                    <>
                      <span className="loading loading-spinner loading-sm text-yellow-500 mr-2"></span>
                      <span className="text-black">Creating...</span>
                    </>
                  ) : (
                    'Create Soundpack'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
