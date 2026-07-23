import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore.ts';
import { useWorkspaceStore } from '../../store/workspaceStore.ts';
import { api } from '../../services/api.ts';
import { ShieldAlert, Plus, DoorOpen, Copy, Check } from 'lucide-react';

export const WorkspaceSetup: React.FC = () => {
  const { user, updateUser } = useAuthStore();
  const { setActiveWorkspace } = useWorkspaceStore();
  const navigate = useNavigate();

  // Teacher Form State
  const [wsName, setWsName] = useState('');
  const [wsSubject, setWsSubject] = useState('');
  const [wsDesc, setWsDesc] = useState('');
  
  // Student Form State
  const [joinCode, setJoinCode] = useState('');

  // General Status State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdWorkspace, setCreatedWorkspace] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/workspaces', {
        name: wsName,
        subject: wsSubject,
        description: wsDesc
      });
      const { workspace } = res.data;
      setCreatedWorkspace(workspace);
      
      // Update local storage and stores
      setActiveWorkspace(workspace, 'teacher');
      if (user) {
        updateUser({ ...user, activeWorkspaceId: workspace._id });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create workspace.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/workspaces/join', { code: joinCode.trim() });
      const { workspace } = res.data;
      
      setActiveWorkspace(workspace, 'student');
      if (user) {
        updateUser({ ...user, activeWorkspaceId: workspace._id });
      }
      navigate(`/w/${workspace._id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to join workspace. Verify code.');
    } finally {
      setLoading(false);
    }
  };

  const copyCode = () => {
    if (createdWorkspace) {
      navigator.clipboard.writeText(createdWorkspace.joinCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const proceedToWorkspace = () => {
    if (createdWorkspace) {
      navigate(`/w/${createdWorkspace._id}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F5F5] dark:bg-[#09090B] px-4 py-12 transition-colors duration-200">
      <div className="max-w-md w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-3xl p-8 shadow-xl space-y-6">
        
        {/* Header */}
        <div className="text-center">
          <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
            Onboarding Workspace
          </span>
          <h1 className="text-2xl font-bold tracking-tight mt-1 text-zinc-900 dark:text-white">
            {user?.role === 'teacher' ? 'Create a Classroom Workspace' : 'Join a Classroom Workspace'}
          </h1>
          <p className="text-xs text-zinc-500 mt-1.5 leading-relaxed">
            {user?.role === 'teacher' 
              ? 'Workspaces host channels, assignment pipelines, schedules, and document folders for your classes.'
              : 'Enter the workspace joining code provided by your teacher to synchronize your classes.'}
          </p>
        </div>

        {error && (
          <div className="flex gap-2 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-xl text-xs text-red-600 dark:text-red-400 items-start">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Teacher Mode: Create Workspace */}
        {user?.role === 'teacher' && !createdWorkspace && (
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                Workspace Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. CS-101 Introduction to Programming"
                value={wsName}
                onChange={e => setWsName(e.target.value)}
                className="mt-1 w-full px-4 py-2.5 bg-[#F5F5F5] dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accentblue dark:focus:ring-zinc-700"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                Subject
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Computer Science"
                value={wsSubject}
                onChange={e => setWsSubject(e.target.value)}
                className="mt-1 w-full px-4 py-2.5 bg-[#F5F5F5] dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accentblue dark:focus:ring-zinc-700"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                Description (Optional)
              </label>
              <textarea
                placeholder="Brief classroom details or notes..."
                value={wsDesc}
                onChange={e => setWsDesc(e.target.value)}
                rows={3}
                className="mt-1 w-full px-4 py-2.5 bg-[#F5F5F5] dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accentblue dark:focus:ring-zinc-700 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-100 font-semibold rounded-full shadow text-sm disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>{loading ? 'Creating workspace...' : 'Create Workspace'}</span>
            </button>
          </form>
        )}

        {/* Teacher Mode: Created Workspace Display Join Code */}
        {user?.role === 'teacher' && createdWorkspace && (
          <div className="space-y-6 text-center">
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 rounded-2xl">
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                Workspace Created Successfully!
              </span>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white mt-1">
                {createdWorkspace.name}
              </h3>
            </div>

            <div className="space-y-2">
              <span className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                Share Workspace Join Code
              </span>
              <div className="flex items-center justify-between gap-2 p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl">
                <span className="text-xl font-mono font-bold tracking-widest text-zinc-800 dark:text-zinc-200 pl-2">
                  {createdWorkspace.joinCode}
                </span>
                <button
                  onClick={copyCode}
                  className="p-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[10px] text-zinc-400 text-center leading-normal">
                Students will enter this code on onboarding to connect with this classroom.
              </p>
            </div>

            <button
              onClick={proceedToWorkspace}
              className="w-full flex items-center justify-center gap-2 py-3 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-100 font-semibold rounded-full shadow text-sm"
            >
              <DoorOpen className="w-4 h-4" />
              <span>Enter Workspace Dashboard</span>
            </button>
          </div>
        )}

        {/* Student Mode: Join Workspace */}
        {user?.role === 'student' && (
          <form onSubmit={handleJoin} className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                Workspace Join Code
              </label>
              <input
                type="text"
                required
                placeholder="CLS-XXXXXX"
                value={joinCode}
                onChange={e => setJoinCode(e.target.value.toUpperCase())}
                maxLength={10}
                className="mt-1 w-full px-4 py-2.5 bg-[#F5F5F5] dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm text-center font-mono tracking-widest font-bold focus:outline-none focus:ring-2 focus:ring-accentblue dark:focus:ring-zinc-700"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-100 font-semibold rounded-full shadow text-sm disabled:opacity-50"
            >
              <DoorOpen className="w-4 h-4" />
              <span>{loading ? 'Joining workspace...' : 'Join Classroom Workspace'}</span>
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
export default WorkspaceSetup;
