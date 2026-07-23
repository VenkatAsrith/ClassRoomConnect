import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../services/api.ts';
import { useWorkspaceStore } from '../../store/workspaceStore.ts';
import { GraduationCap, ShieldCheck } from 'lucide-react';

export const Members: React.FC = () => {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const { role } = useWorkspaceStore();

  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMembers = async () => {
    try {
      const res = await api.get(`/workspaces/${workspaceId}/members`);
      setMembers(res.data.members);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (workspaceId) fetchMembers();
  }, [workspaceId]);

  const handleRemove = async (userId: string) => {
    if (!window.confirm('Are you sure you want to remove this member?')) return;

    try {
      await api.delete(`/workspaces/${workspaceId}/members/${userId}`);
      setMembers(prev => prev.filter(m => m.userId?._id !== userId));
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
      
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
          Workspace Directory
        </h1>
        <p className="text-xs text-zinc-400 dark:text-zinc-500 font-semibold uppercase tracking-wider block mt-0.5">
          Classroom Roster & Members list
        </p>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-3xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-150 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/50">
              <th className="p-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Member</th>
              <th className="p-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Email</th>
              <th className="p-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Role</th>
              <th className="p-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Joined At</th>
              {role === 'teacher' && (
                <th className="p-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider text-right">Actions</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900">
            {members.map((member) => (
              <tr key={member._id} className="hover:bg-zinc-50/30 dark:hover:bg-zinc-900/10 text-xs">
                
                {/* Member Profile */}
                <td className="p-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                    {member.userId?.name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <span className="font-bold text-zinc-800 dark:text-zinc-200 block">
                      {member.userId?.name}
                    </span>
                    <span className="text-[9px] text-zinc-400 font-semibold block capitalize">
                      Status: {member.userId?.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </td>

                {/* Email */}
                <td className="p-4 text-zinc-500 dark:text-zinc-400 font-semibold">
                  {member.userId?.email}
                </td>

                {/* Role badge */}
                <td className="p-4">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                    member.role === 'teacher'
                      ? 'bg-purple-100 dark:bg-purple-950/20 text-purple-600'
                      : 'bg-emerald-100 dark:bg-emerald-950/20 text-emerald-600'
                  }`}>
                    {member.role === 'teacher' ? (
                      <>
                        <ShieldCheck className="w-3 h-3" />
                        <span>Teacher</span>
                      </>
                    ) : (
                      <>
                        <GraduationCap className="w-3 h-3" />
                        <span>Student</span>
                      </>
                    )}
                  </span>
                </td>

                {/* Date */}
                <td className="p-4 text-zinc-400 uppercase font-semibold text-[10px]">
                  {new Date(member.joinedAt).toLocaleDateString()}
                </td>

                {/* Actions */}
                {role === 'teacher' && (
                  <td className="p-4 text-right">
                    {member.role !== 'teacher' && (
                      <button
                        onClick={() => handleRemove(member.userId?._id)}
                        className="px-2.5 py-1 border border-zinc-200 dark:border-zinc-800 hover:bg-red-50 dark:hover:bg-red-950 text-red-500 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors"
                      >
                        Remove
                      </button>
                    )}
                  </td>
                )}

              </tr>
            ))}

            {members.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-zinc-400 italic">
                  No directory records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};
export default Members;
