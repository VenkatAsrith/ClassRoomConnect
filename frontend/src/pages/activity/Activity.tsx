import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../services/api.ts';

export const Activity: React.FC = () => {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!workspaceId) return;

    const fetchLogs = async () => {
      try {
        const res = await api.get(`/workspaces/${workspaceId}/activity`);
        setLogs(res.data.logs);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [workspaceId]);

  const getActionText = (log: any) => {
    const actor = log.actorId?.name || 'A user';
    switch (log.action) {
      case 'created_workspace':
        return `${actor} created this workspace.`;
      case 'joined_workspace':
        return `${actor} joined the workspace.`;
      case 'created_channel':
        return `${actor} added a new discussion channel.`;
      case 'published_announcement':
        return `${actor} published a classroom announcement.`;
      case 'created_assignment':
        return `${actor} created a new assignment brief.`;
      case 'submitted_assignment':
        return `${actor} uploaded a submission for grading.`;
      case 'uploaded_resource':
        return `${actor} uploaded a document to resources library.`;
      case 'added_schedule_entry':
        return `${actor} updated the weekly timetable.`;
      case 'removed_member':
        return `${actor} removed a student member.`;
      default:
        return `${actor} performed action: ${log.action}`;
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
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
          Workspace Activity
        </h1>
        <p className="text-xs text-zinc-400 dark:text-zinc-500 font-semibold uppercase tracking-wider block mt-0.5">
          Audit timeline logs
        </p>
      </div>

      {/* Timeline List */}
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-3xl p-6 shadow-sm">
        <div className="relative border-l border-zinc-150 dark:border-zinc-800 ml-4 pl-6 space-y-6 py-2">
          {logs.map((log) => (
            <div key={log._id} className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
              
              {/* Orb indicator icon */}
              <div className="absolute -left-9.5 top-0.5 bg-white dark:bg-zinc-950 border-2 border-zinc-300 dark:border-zinc-700 w-3 h-3 rounded-full flex items-center justify-center">
                <div className="w-1 h-1 rounded-full bg-zinc-400 dark:bg-zinc-500" />
              </div>

              <div>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                  {getActionText(log)}
                </span>
                <span className="text-[9px] text-zinc-400 font-bold block uppercase mt-0.5">
                  Actor Role: {log.actorId?.role || 'user'}
                </span>
              </div>
              
              <div className="text-[9px] text-zinc-400 font-bold uppercase shrink-0 pt-0.5 sm:pt-0">
                {new Date(log.createdAt).toLocaleString()}
              </div>

            </div>
          ))}

          {logs.length === 0 && (
            <div className="text-center py-12 text-xs text-zinc-400 italic -ml-6 border-l-0">
              No activity logs recorded yet.
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
export default Activity;
