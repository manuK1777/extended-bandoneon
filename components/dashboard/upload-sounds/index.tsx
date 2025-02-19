'use client';

import { useState, useEffect } from 'react';

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
  const [newSoundpack, setNewSoundpack] = useState({
    name: '',
    description: '',
    cover_image_url: '',
  });
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
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      // Validate file types
      const invalidFiles = selectedFiles.filter(
        file => !file.type.startsWith('audio/')
      );
      
      if (invalidFiles.length > 0) {
        setUploadState((prev) => ({
          ...prev,
          error: 'Please select only audio files',
        }));
        return;
      }
      
      setFiles(selectedFiles);
      setUploadState((prev) => ({ ...prev, error: null }));
    }
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

  const handleCreateSoundpack = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/admin/soundpacks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSoundpack),
      });

      if (!response.ok) throw new Error('Failed to create soundpack');
      
      const createdSoundpack = await response.json();
      setSoundpacks(prev => [...prev, createdSoundpack]);
      setFormData(prev => ({ ...prev, soundpack_id: createdSoundpack.id.toString() }));
      setIsCreateModalOpen(false);
      setNewSoundpack({ name: '', description: '', cover_image_url: '' });
    } catch (error) {
      console.error('Error creating soundpack:', error);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0) {
      setUploadState((prev) => ({
        ...prev,
        error: 'Please select at least one sound file',
      }));
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
        const progress = Math.round((i / files.length) * 100);
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
    } catch (error: unknown) {
      setUploadState((prev) => ({
        ...prev,
        isUploading: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      }));
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-sm p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Upload Sounds
      </h1>

      <form onSubmit={handleUpload} className="space-y-6">
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
            required
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
              className="btn btn-primary"
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
            placeholder="e.g., white noise, low frequency, piano"
            className="input input-bordered w-full text-black bg-white"
          />
          <p className="mt-1 text-sm text-gray-500">
            Separate tags with commas. Multi-word tags are supported (e.g., &quot;white noise&quot;).
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Sound File
          </label>
          <input
            type="file"
            accept="audio/*"
            onChange={handleFileChange}
            className="file-input file-input-bordered w-full text-black bg-white"
            data-choose-text="Choose sound files"
            data-no-file-text="No files selected"
            multiple
          />
          <p className="mt-1 text-sm text-gray-500">
            Accepted formats: MP3, WAV, OGG. You can select multiple files.
          </p>
        </div>

        {uploadState.error && (
          <div className="text-red-600 text-sm">{uploadState.error}</div>
        )}

        {uploadState.success && (
          <div className="text-green-600 text-sm">
            Upload successful!
          </div>
        )}

        {uploadState.isUploading && (
          <>
            <div className="text-sm mb-2">
              Uploading... {uploadState.progress}%
              {files.length > 1 && ` (File ${Math.floor(uploadState.progress / (100 / files.length)) + 1} of ${files.length})`}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
              <div
                className="bg-green-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${uploadState.progress}%` }}
              ></div>
            </div>
          </>
        )}

        <button
          type="submit"
          disabled={uploadState.isUploading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
        >
          {uploadState.isUploading ? 'Uploading...' : 'Upload sound(s)'}
        </button>
      </form>

      {/* Create Soundpack Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Create New Soundpack</h2>
            <form onSubmit={handleCreateSoundpack} className="space-y-4">
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
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="btn btn-ghost"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
