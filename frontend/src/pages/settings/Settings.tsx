import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/api.ts';
import { useWorkspaceStore } from '../../store/workspaceStore.ts';
import { useAuthStore } from '../../store/authStore.ts';
import { Trash2, Plus, Check } from 'lucide-react';

export const Settings: React.FC = () => {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const { activeWorkspace, role, setActiveWorkspace } = useWorkspaceStore();
  const { user, updateUser } = useAuthStore();
  const navigate = useNavigate();

  // General Settings Form State
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [desc, setDesc] = useState('');
  const [success, setSuccess] = useState(false);

  // Channel Creation Form State
  const [chName, setChName] = useState('');
  const [chType, setChType] = useState<'general' | 'assignments' | 'resources' | 'projects' | 'discussion' | 'custom'>('discussion');
  const [chSuccess, setChSuccess] = useState(false);

  useEffect(() => {
    if (activeWorkspace) {
      setName(activeWorkspace.name);
      setSubject(activeWorkspace.subject);
      setDesc(activeWorkspace.description || '');
    }
  }, [activeWorkspace]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(false);

    try {
      const res = await api.patch(`/workspaces/${workspaceId}`, {
        name,
        subject,
        description: desc
      });
      setActiveWorkspace(res.data.workspace, 'teacher');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chName.trim()) return;

    try {
      await api.post(`/channels/workspace/${workspaceId}`, {
        name: chName.trim().toLowerCase().replace(/\s+/g, '-'),
        type: chType
      });
      setChSuccess(true);
      setChName('');
      setChType('discussion');
      setTimeout(() => {
        setChSuccess(false);
        // Force workspace reload (reload layout for sidebar list)
        window.location.reload();
      }, 1500);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteWorkspace = async () => {
    if (!window.confirm('WARNING: Are you sure you want to delete this workspace? This action is irreversible.')) return;

    try {
      await api.delete(`/workspaces/${workspaceId}`);
      setActiveWorkspace(null, null);
      if (user) {
        updateUser({ ...user, activeWorkspaceId: undefined });
      }
      navigate('/onboarding/workspace');
    } catch (err) {
      console.error(err);
    }
  };

  if (role !== 'teacher') {
    return (
      <div className="p-8 text-center text-xs text-red-500 font-bold bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-3xl">
        Access Denied. Only workspace teachers can view settings.
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-fade-in">
      
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
          Workspace Settings
        </h1>
        <p className="text-xs text-zinc-400 dark:text-zinc-500 font-semibold uppercase tracking-wider block mt-0.5">
          General metadata & channels administration
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Side: General Info Settings */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 border-b border-zinc-100 dark:border-zinc-900 pb-2">
              Workspace Profile Details
            </h3>

            {success && (
              <div className="p-2.5 bg-emerald-50 text-emerald-600 text-xs rounded-xl flex items-center gap-1.5 font-bold">
                <Check className="w-4 h-4" />
                <span>General profile settings updated successfully!</span>
              </div>
            )}

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                  Workspace Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="mt-1 w-full px-3 py-2 bg-[#F5F5F5] dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                  Subject
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  className="mt-1 w-full px-3 py-2 bg-[#F5F5F5] dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                  Description
                </label>
                <textarea
                  value={desc}
                  onChange={e => setDesc(e.target.value)}
                  rows={3}
                  className="mt-1 w-full px-3 py-2 bg-[#F5F5F5] dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs focus:outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 font-semibold rounded-full text-xs shadow hover:bg-zinc-800 dark:hover:bg-zinc-100"
              >
                Save Details
              </button>
            </form>
          </div>

          {/* Danger Zone */}
          <div className="bg-red-50/20 dark:bg-red-950/10 border border-red-200 dark:border-red-900/50 rounded-3xl p-6 space-y-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-red-500">
                Danger Zone
              </h3>
              <p className="text-[10px] text-zinc-400 leading-normal mt-0.5">
                Soft-archive or permanently delete this workspace. This removes all members and assets.
              </p>
            </div>
            
            <button
              onClick={handleDeleteWorkspace}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-full shadow text-xs transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Workspace</span>
            </button>
          </div>
        </div>

        {/* Right Side: Quick Channel Creator */}
        <div className="md:col-span-1">
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 border-b border-zinc-100 dark:border-zinc-900 pb-2">
              Create Channel
            </h3>

            {chSuccess && (
              <div className="p-2 bg-emerald-50 text-emerald-600 text-[10px] rounded-lg">
                Channel added! Syncing list...
              </div>
            )}

            <form onSubmit={handleCreateChannel} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                  Channel Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. projects-discussion"
                  value={chName}
                  onChange={e => setChName(e.target.value)}
                  className="mt-1 w-full px-3 py-2 bg-[#F5F5F5] dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                  Channel Category
                </label>
                <select
                  value={chType}
                  onChange={e => setChType(e.target.value as any)}
                  className="mt-1 w-full px-3 py-2 bg-[#F5F5F5] dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs focus:outline-none"
                >
                  <option value="discussion">General Discussion</option>
                  <option value="projects">Project Collab</option>
                  <option value="resources">Folder Resources</option>
                  <option value="assignments">Assignment Alerts</option>
                  <option value="custom">Custom Room</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-1 py-2.5 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 font-semibold rounded-full text-xs shadow hover:bg-zinc-800 dark:hover:bg-zinc-100"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Channel</span>
              </button>
            </form>
          </div>
        </div>

      </div>

    </div>
  );
};
export default Settings;
