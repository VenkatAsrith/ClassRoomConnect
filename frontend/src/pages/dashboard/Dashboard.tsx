import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api.ts';
import { useWorkspaceStore } from '../../store/workspaceStore.ts';
import {
  Bell,
  BookOpen,
  FolderOpen,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  Users
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const { activeWorkspace, role } = useWorkspaceStore();
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!workspaceId) return;

    const fetchSummary = async () => {
      try {
        const res = await api.get(`/workspaces/${workspaceId}/dashboard`);
        setData(res.data);
      } catch (err) {
        console.error('Error fetching dashboard summary:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [workspaceId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-zinc-950 dark:border-white border-t-transparent dark:border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const stats = data?.stats || { members: 1, assignments: 0, resources: 0, announcements: 0 };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Welcome Top Banner: Split High Contrast layout inspired by the reference image */}
      <div className="relative w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-3xl overflow-hidden shadow-sm flex flex-col md:flex-row min-h-[220px]">
        {/* Left Side: Light, bold text */}
        <div className="w-full md:w-[45%] bg-[#F8F8FA] dark:bg-zinc-900 p-8 flex flex-col justify-between border-r border-zinc-200 dark:border-zinc-800">
          <div className="space-y-3">
            <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
              Workspace Overview
            </span>
            <h1 className="text-2xl font-normal leading-tight text-zinc-400">
              Welcome to <br />
              <span className="font-extrabold text-zinc-950 dark:text-white">
                {activeWorkspace?.name || 'Classroom Connect'}
              </span>
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-normal max-w-sm">
              Your classroom dashboard brings announcements, assignments, and study materials into a single collaborative workspace.
            </p>
          </div>
        </div>

        {/* Right Side: Deep Dark side with concentric orbits and join code */}
        <div className="w-full md:w-[55%] bg-[#0D0D0E] p-8 flex flex-col justify-between relative overflow-hidden text-white min-h-[160px] md:min-h-0">
          {/* Subtle design grid */}
          <div className="absolute inset-0 bg-dotted-grid opacity-10" />
          
          <div className="relative z-10 flex justify-between items-start">
            <div className="space-y-1">
              <h3 className="text-sm font-bold tracking-tight text-zinc-400">Classroom Subject</h3>
              <p className="text-base font-extrabold">{activeWorkspace?.subject}</p>
            </div>
            
            {role === 'teacher' && (
              <div className="bg-zinc-900 border border-zinc-800 p-2.5 rounded-xl text-right">
                <span className="block text-[8px] font-bold uppercase tracking-wider text-zinc-400">Workspace Code</span>
                <span className="text-sm font-mono font-bold tracking-widest text-emerald-400">{activeWorkspace?.joinCode}</span>
              </div>
            )}
          </div>

          <div className="relative z-10 flex items-center justify-between mt-6 md:mt-0">
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>Verified Institution Workspace</span>
            </div>
            <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
              Role: {role}
            </div>
          </div>
        </div>
      </div>

      {/* Grid panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: Recent Announcements */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-900 pb-3">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-zinc-500" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
                  Recent Announcements
                </h2>
              </div>
              <Link
                to={`/w/${workspaceId}/announcements`}
                className="text-xs font-bold text-accentblue hover:underline flex items-center gap-0.5"
              >
                <span>View Feed</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-zinc-100 dark:divide-zinc-900">
              {data?.announcements && data.announcements.length > 0 ? (
                data.announcements.map((ann: any) => (
                  <div key={ann._id} className="py-3.5 first:pt-0 last:pb-0 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-150">
                        {ann.title}
                      </h3>
                      {ann.pinned && (
                        <span className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-900 text-zinc-500 rounded-md text-[8px] font-bold uppercase tracking-wider">
                          Pinned
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                      {ann.body}
                    </p>
                    <span className="text-[9px] font-bold text-zinc-400 block uppercase">
                      By {ann.authorId?.name} &middot; {new Date(ann.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-xs text-zinc-400 italic">
                  No announcements published yet.
                </div>
              )}
            </div>
          </div>

          {/* Upcoming Assignments */}
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-900 pb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-zinc-500" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
                  Upcoming Assignments
                </h2>
              </div>
              <Link
                to={`/w/${workspaceId}/assignments`}
                className="text-xs font-bold text-accentblue hover:underline flex items-center gap-0.5"
              >
                <span>Full List</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-zinc-100 dark:divide-zinc-900">
              {data?.assignments && data.assignments.length > 0 ? (
                data.assignments.map((asg: any) => (
                  <div key={asg._id} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
                    <div>
                      <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-150 hover:underline">
                        <Link to={`/w/${workspaceId}/assignments/${asg._id}`}>{asg.title}</Link>
                      </h3>
                      <span className="text-[9px] text-zinc-400 block">
                        Created by {asg.createdBy?.name}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="px-2.5 py-1 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-full text-[10px] font-semibold border border-red-200 dark:border-red-900/50">
                        Due: {new Date(asg.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-xs text-zinc-400 italic">
                  No pending assignments.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Col: Stats & Latest Resources */}
        <div className="space-y-6">
          {/* Quick Stats Panel */}
          <div className="bg-[#0D0D0E] text-white border border-zinc-900 rounded-3xl p-6 shadow-sm relative overflow-hidden">
            <div className="absolute inset-0 bg-dotted-grid opacity-10" />
            <div className="relative z-10 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 border-b border-zinc-800 pb-2">
                Workspace Stats
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-zinc-900 border border-zinc-800 p-3.5 rounded-2xl flex items-center gap-3">
                  <Users className="w-5 h-5 text-emerald-400" />
                  <div>
                    <span className="block text-[8px] font-bold uppercase text-zinc-400">Members</span>
                    <span className="text-base font-extrabold">{stats.members}</span>
                  </div>
                </div>
                
                <div className="bg-zinc-900 border border-zinc-800 p-3.5 rounded-2xl flex items-center gap-3">
                  <BookOpen className="w-5 h-5 text-indigo-400" />
                  <div>
                    <span className="block text-[8px] font-bold uppercase text-zinc-400">Assignments</span>
                    <span className="text-base font-extrabold">{stats.assignments}</span>
                  </div>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 p-3.5 rounded-2xl flex items-center gap-3">
                  <FolderOpen className="w-5 h-5 text-blue-400" />
                  <div>
                    <span className="block text-[8px] font-bold uppercase text-zinc-400">Resources</span>
                    <span className="text-base font-extrabold">{stats.resources}</span>
                  </div>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 p-3.5 rounded-2xl flex items-center gap-3">
                  <Zap className="w-5 h-5 text-amber-400" />
                  <div>
                    <span className="block text-[8px] font-bold uppercase text-zinc-400">Announces</span>
                    <span className="text-base font-extrabold">{stats.announcements}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Latest Resources list */}
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-900 pb-3">
              <div className="flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-zinc-500" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
                  Latest Resources
                </h2>
              </div>
              <Link
                to={`/w/${workspaceId}/resources`}
                className="text-xs font-bold text-accentblue hover:underline"
              >
                Open Library
              </Link>
            </div>

            <div className="divide-y divide-zinc-100 dark:divide-zinc-900">
              {data?.resources && data.resources.length > 0 ? (
                data.resources.map((res: any) => (
                  <a
                    key={res._id}
                    href={res.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2.5 flex items-center justify-between first:pt-0 last:pb-0 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded px-1"
                  >
                    <div>
                      <h4 className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate max-w-[160px]">
                        {res.title}
                      </h4>
                      <span className="text-[8px] uppercase tracking-wider text-zinc-400 block font-bold">
                        Folder: {res.folder}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 border border-zinc-200 dark:border-zinc-800 rounded-md text-[8px] uppercase font-bold text-zinc-500">
                      {res.type}
                    </span>
                  </a>
                ))
              ) : (
                <div className="py-6 text-center text-xs text-zinc-400 italic">
                  No files uploaded yet.
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
export default Dashboard;
