'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface UploadState {
  isUploading: boolean;
  progress: number;
  error: string | null;
  success: boolean;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    soundpack_id: '',
    tags: '',
  });
  const [file, setFile] = useState<File | null>(null);
  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    error: null,
    success: false,
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      // Validate file type
      if (!selectedFile.type.startsWith('audio/')) {
        setUploadState((prev) => ({
          ...prev,
          error: 'Please select an audio file',
        }));
        return;
      }
      setFile(selectedFile);
      setUploadState((prev) => ({ ...prev, error: null }));
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setUploadState((prev) => ({
        ...prev,
        error: 'Please select a sound file',
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
      // First, upload to temporary storage or get signed URL
      const fileFormData = new FormData();
      fileFormData.append('file', file);
      setUploadState((prev) => ({ ...prev, progress: 30 }));

      // TODO: Replace with your file upload endpoint
      const uploadRes = await fetch('/api/admin/upload-file', {
        method: 'POST',
        body: fileFormData,
      });

      if (!uploadRes.ok) throw new Error('File upload failed');
      
      const { url } = await uploadRes.json();
      setUploadState((prev) => ({ ...prev, progress: 60 }));

      // Then save metadata
      const metadataRes = await fetch('/api/admin/upload-sound', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          soundpack_id: formData.soundpack_id,
          tags: formData.tags.split(',').map((tag: string) => tag.trim()),
          filePath: url,
        }),
      });

      if (!metadataRes.ok) throw new Error('Failed to save sound metadata');

      setUploadState({
        isUploading: false,
        progress: 100,
        error: null,
        success: true,
      });

      // Reset form
      setFormData({
        title: '',
        description: '',
        soundpack_id: '',
        tags: '',
      });
      setFile(null);

      // Refresh the page data
      router.refresh();
    } catch (error: any) {
      setUploadState({
        isUploading: false,
        progress: 0,
        error: error.message || 'Upload failed',
        success: false,
      });
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Upload New Sound
        </h1>

        <form onSubmit={handleUpload} className="space-y-4">
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
              Soundpack ID (Optional)
            </label>
            <input
              type="text"
              name="soundpack_id"
              value={formData.soundpack_id}
              onChange={handleInputChange}
              className="input input-bordered w-full text-black bg-white"
            />
            <p className="mt-1 text-sm text-gray-500">
              Leave empty if the sound doesn't belong to a soundpack
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
              Separate tags with commas. Multi-word tags are supported (e.g., "white noise").
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
              required
            />
          </div>

          {uploadState.error && (
            <div className="text-red-600 text-sm">{uploadState.error}</div>
          )}

          {uploadState.success && (
            <div className="text-green-600 text-sm">
              Sound uploaded successfully!
            </div>
          )}

          {uploadState.isUploading && (
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-indigo-600 h-2.5 rounded-full"
                style={{ width: `${uploadState.progress}%` }}
              ></div>
            </div>
          )}

          <button
            type="submit"
            disabled={uploadState.isUploading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
          >
            {uploadState.isUploading ? 'Uploading...' : 'Upload Sound'}
          </button>
        </form>
      </div>
    </div>
  );
}
