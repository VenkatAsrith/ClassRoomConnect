import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../services/api.ts';
import { useWorkspaceStore } from '../../store/workspaceStore.ts';
import { Plus, Pin, X } from 'lucide-react';

export const Announcements: React.FC = () => {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const { role } = useWorkspaceStore();
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [pinned, setPinned] = useState(false);
  const [error, setError] = useState('');

  const fetchAnnouncements = async () => {
    try {
      const res = await api.get(`/announcements/workspace/${workspaceId}`);
      setAnnouncements(res.data.announcements);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (workspaceId) fetchAnnouncements();
  }, [workspaceId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    setError('');

    try {
      const res = await api.post(`/announcements/workspace/${workspaceId}`, {
        title,
        body,
        pinned
      });
      setAnnouncements(prev => [res.data.announcement, ...prev]);
      setShowModal(false);
      setTitle('');
      setBody('');
      setPinned(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to post announcement.');
    }
  };

  const handleTogglePin = async (id: string, currentlyPinned: boolean) => {
    try {
      const res = await api.patch(`/announcements/${id}`, { pinned: !currentlyPinned });
      setAnnouncements(prev =>
        prev.map(ann => (ann._id === id ? res.data.announcement : ann))
          .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/announcements/${id}`);
      setAnnouncements(prev => prev.filter(ann => ann._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-zinc-950 dark:border-white border-t-transparent dark:border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Title section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Classroom Announcements
          </h1>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 font-semibold uppercase tracking-wider block mt-0.5">
            Structured Notice Board Feed
          </p>
        </div>
        
        {role === 'teacher' && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 font-semibold rounded-full shadow text-xs transition-all hover:scale-105"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Publish Notice</span>
          </button>
        )}
      </div>

      {/* Announcements Stream */}
      <div className="space-y-4">
        {announcements.map((ann) => (
          <div
            key={ann._id}
            className={`bg-white dark:bg-zinc-950 border rounded-3xl p-6 shadow-sm space-y-4 transition-all relative ${
              ann.pinned ? 'border-accentblue/50 dark:border-zinc-800' : 'border-zinc-200 dark:border-zinc-900'
            }`}
          >
            {/* Header info */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                  {ann.authorId?.name?.charAt(0) || 'U'}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                    <span>{ann.title}</span>
                    {ann.pinned && (
                      <Pin className="w-3 h-3 text-accentblue dark:text-zinc-400 fill-current" />
                    )}
                  </h3>
                  <span className="text-[9px] font-bold text-zinc-400 block uppercase">
                    By {ann.authorId?.name} &middot; {new Date(ann.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              {role === 'teacher' && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleTogglePin(ann._id, ann.pinned)}
                    className="p-1 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-lg text-xs font-semibold transition-all text-zinc-500"
                  >
                    Pin
                  </button>
                  <button
                    onClick={() => handleDelete(ann._id)}
                    className="p-1 border border-zinc-200 dark:border-zinc-800 hover:bg-red-50 dark:hover:bg-red-950 text-red-500 rounded-lg text-xs font-semibold transition-all"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>

            {/* Announcement body */}
            <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap pl-11">
              {ann.body}
            </p>
          </div>
        ))}

        {announcements.length === 0 && (
          <div className="text-center py-20 text-xs text-zinc-400 italic bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-3xl">
            No notices published yet.
          </div>
        )}
      </div>

      {/* Publish Notice Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 backdrop-blur-sm px-4">
          <div className="max-w-md w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-3xl p-6 shadow-xl space-y-4">
            
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-900 pb-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
                Publish New Announcement
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
                  Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Midterm Examination Schedule"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="mt-1 w-full px-3 py-2 bg-[#F5F5F5] dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-accentblue dark:focus:ring-zinc-700"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                  Announcement Details
                </label>
                <textarea
                  required
                  placeholder="Write the full notice brief here..."
                  value={body}
                  onChange={e => setBody(e.target.value)}
                  rows={5}
                  className="mt-1 w-full px-3 py-2 bg-[#F5F5F5] dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-accentblue dark:focus:ring-zinc-700 resize-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="pin"
                  checked={pinned}
                  onChange={e => setPinned(e.target.checked)}
                  className="w-3.5 h-3.5 border-zinc-300 dark:border-zinc-800 accent-accentblue"
                />
                <label htmlFor="pin" className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider select-none">
                  Pin to top of announcement feed
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 font-semibold rounded-full text-xs shadow hover:bg-zinc-800 dark:hover:bg-zinc-100"
              >
                Publish Announcement
              </button>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
export default Announcements;
