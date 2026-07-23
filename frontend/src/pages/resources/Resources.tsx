import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../services/api.ts';
import { useWorkspaceStore } from '../../store/workspaceStore.ts';
import { Folder, Plus, FileText, Globe, Image, Video, FileUp, X } from 'lucide-react';

export const Resources: React.FC = () => {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const { role } = useWorkspaceStore();

  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFolder, setActiveFolder] = useState<string | null>(null);

  // Form State
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [folder, setFolder] = useState('');
  const [type, setType] = useState<'pdf' | 'ppt' | 'image' | 'video' | 'link'>('pdf');
  const [url, setUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const fetchResources = async () => {
    try {
      const res = await api.get(`/resources/workspace/${workspaceId}`);
      setResources(res.data.resources);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (workspaceId) fetchResources();
  }, [workspaceId]);

  // Group resources by logical folders
  const folders = Array.from(new Set(resources.map((r: any) => r.folder)));

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUrl(res.data.url);
    } catch (err: any) {
      setError('File upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !folder.trim() || !url.trim()) return;
    setError('');

    try {
      const res = await api.post(`/resources/workspace/${workspaceId}`, {
        title,
        folder: folder.trim(),
        type,
        url
      });
      setResources(prev => [res.data.resource, ...prev]);
      setShowModal(false);
      setTitle('');
      setFolder('');
      setUrl('');
      setType('pdf');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add resource.');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/resources/${id}`);
      setResources(prev => prev.filter(r => r._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const getIcon = (resType: string) => {
    switch (resType) {
      case 'link':
        return <Globe className="w-5 h-5 text-blue-500" />;
      case 'image':
        return <Image className="w-5 h-5 text-emerald-500" />;
      case 'video':
        return <Video className="w-5 h-5 text-red-500" />;
      default:
        return <FileText className="w-5 h-5 text-zinc-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-zinc-950 dark:border-white border-t-transparent dark:border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Filter resource grid items by active folder selection
  const activeResources = activeFolder
    ? resources.filter(r => r.folder === activeFolder)
    : resources;

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Resource Library
          </h1>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 font-semibold uppercase tracking-wider block mt-0.5">
            Folder-organized academic documents
          </p>
        </div>

        {role === 'teacher' && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 font-semibold rounded-full shadow text-xs transition-all hover:scale-105"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Upload Document</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Left Side: Folder list */}
        <div className="md:col-span-1 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-3xl p-5 shadow-sm h-fit space-y-4">
          <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest border-b border-zinc-150 dark:border-zinc-900 pb-2">
            Folders
          </h3>
          
          <div className="space-y-1">
            <button
              onClick={() => setActiveFolder(null)}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-colors ${
                activeFolder === null
                  ? 'bg-zinc-950 dark:bg-white text-white dark:text-zinc-950'
                  : 'text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900'
              }`}
            >
              <Folder className="w-4 h-4 shrink-0" />
              <span>All Documents</span>
            </button>

            {folders.map(fold => (
              <button
                key={fold}
                onClick={() => setActiveFolder(fold)}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-colors ${
                  activeFolder === fold
                    ? 'bg-zinc-950 dark:bg-white text-white dark:text-zinc-950'
                    : 'text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900'
                }`}
              >
                <Folder className="w-4 h-4 shrink-0" />
                <span className="truncate">{fold}</span>
              </button>
            ))}

            {folders.length === 0 && (
              <span className="block px-3 text-[10px] text-zinc-400 italic">No folders created</span>
            )}
          </div>
        </div>

        {/* Right Side: Grid of resource files */}
        <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 h-fit">
          {activeResources.map((res) => (
            <div
              key={res._id}
              className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-3xl p-5 shadow-sm flex flex-col justify-between hover:border-zinc-300 dark:hover:border-zinc-800 transition-all"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  {getIcon(res.type)}
                  
                  {role === 'teacher' && (
                    <button
                      onClick={() => handleDelete(res._id)}
                      className="text-[9px] font-bold text-red-500 hover:underline"
                    >
                      Delete
                    </button>
                  )}
                </div>
                
                <div>
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                    {res.title}
                  </h4>
                  <span className="text-[9px] text-zinc-400 font-bold block uppercase mt-0.5">
                    Folder: {res.folder}
                  </span>
                </div>
              </div>

              <div className="border-t border-zinc-100 dark:border-zinc-900 pt-3.5 mt-5 flex items-center justify-between">
                <span className="text-[8px] text-zinc-400 uppercase font-semibold">
                  By {res.uploadedBy?.name}
                </span>
                <a
                  href={res.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] font-bold text-accentblue hover:underline"
                >
                  Download &rarr;
                </a>
              </div>
            </div>
          ))}

          {activeResources.length === 0 && (
            <div className="col-span-full text-center py-20 text-xs text-zinc-400 italic bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-3xl">
              No files found in this category.
            </div>
          )}
        </div>

      </div>

      {/* Upload Resource Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 backdrop-blur-sm px-4">
          <div className="max-w-md w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-3xl p-6 shadow-xl space-y-4">
            
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-900 pb-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
                Upload New Resource
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 border border-zinc-200 dark:border-zinc-800 rounded-full text-zinc-400"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {error && (
              <div className="p-2.5 bg-red-50 dark:bg-red-950 text-red-600 text-xs rounded-xl">
                {error}
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                  Resource Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lecture 4 - Binary Trees"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="mt-1 w-full px-3 py-2 bg-[#F5F5F5] dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-accentblue dark:focus:ring-zinc-700"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                  Logical Folder
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lectures, Syllabus, Notes"
                  value={folder}
                  onChange={e => setFolder(e.target.value)}
                  className="mt-1 w-full px-3 py-2 bg-[#F5F5F5] dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-accentblue dark:focus:ring-zinc-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                    Resource Type
                  </label>
                  <select
                    value={type}
                    onChange={e => setType(e.target.value as any)}
                    className="mt-1 w-full px-3 py-2 bg-[#F5F5F5] dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-accentblue dark:focus:ring-zinc-700"
                  >
                    <option value="pdf">PDF Document</option>
                    <option value="ppt">PPT Slides</option>
                    <option value="image">Image Asset</option>
                    <option value="video">Video Lecture</option>
                    <option value="link">External Link</option>
                  </select>
                </div>
                
                <div className="flex flex-col justify-end">
                  {type !== 'link' && (
                    <div className="relative w-full">
                      <input
                        type="file"
                        onChange={handleFileUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <button
                        type="button"
                        className="w-full flex items-center justify-center gap-1.5 py-2 border border-dashed border-zinc-300 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-lg text-xs font-bold text-zinc-600 dark:text-zinc-300"
                      >
                        <FileUp className="w-4 h-4 text-zinc-400" />
                        <span>{uploading ? 'Uploading...' : 'Choose File'}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                  Resource URL
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://example.com/file"
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  className="mt-1 w-full px-3 py-2 bg-[#F5F5F5] dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-accentblue dark:focus:ring-zinc-700"
                />
              </div>

              <button
                type="submit"
                disabled={uploading}
                className="w-full py-2.5 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 font-semibold rounded-full text-xs shadow hover:bg-zinc-800 dark:hover:bg-zinc-100"
              >
                Upload Resource
              </button>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
export default Resources;
