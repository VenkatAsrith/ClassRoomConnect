import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api.ts';
import { useWorkspaceStore } from '../../store/workspaceStore.ts';
import { Plus, Calendar, X } from 'lucide-react';

export const AssignmentsList: React.FC = () => {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const { role } = useWorkspaceStore();

  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [maxScore, setMaxScore] = useState('100');
  const [error, setError] = useState('');

  const fetchAssignments = async () => {
    try {
      const res = await api.get(`/assignments/workspace/${workspaceId}`);
      setAssignments(res.data.assignments);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (workspaceId) fetchAssignments();
  }, [workspaceId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !dueDate) return;
    setError('');

    try {
      const res = await api.post(`/assignments/workspace/${workspaceId}`, {
        title,
        description,
        dueDate,
        maxScore: Number(maxScore)
      });
      setAssignments(prev => [...prev, res.data.assignment]);
      setShowModal(false);
      setTitle('');
      setDescription('');
      setDueDate('');
      setMaxScore('100');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create assignment.');
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Classroom Assignments
          </h1>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 font-semibold uppercase tracking-wider block mt-0.5">
            Assignment Tracker & grading desk
          </p>
        </div>
        
        {role === 'teacher' && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 font-semibold rounded-full shadow text-xs transition-all hover:scale-105"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Assignment</span>
          </button>
        )}
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {assignments.map((asg) => (
          <div
            key={asg._id}
            className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-3xl p-6 shadow-sm flex flex-col justify-between hover:border-zinc-300 dark:hover:border-zinc-800 transition-all group"
          >
            <div className="space-y-2">
              <span className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 rounded-md text-[8px] font-bold uppercase tracking-wider">
                Max Score: {asg.maxScore || 100}
              </span>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white group-hover:underline">
                <Link to={`/w/${workspaceId}/assignments/${asg._id}`}>{asg.title}</Link>
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                {asg.description}
              </p>
            </div>

            <div className="flex items-center justify-between border-t border-zinc-100 dark:border-zinc-900 pt-4 mt-6">
              <div className="flex items-center gap-1 text-[10px] text-zinc-400 font-semibold uppercase">
                <Calendar className="w-3.5 h-3.5 text-zinc-300" />
                <span>Due: {new Date(asg.dueDate).toLocaleDateString()}</span>
              </div>
              
              <Link
                to={`/w/${workspaceId}/assignments/${asg._id}`}
                className="text-xs font-bold text-accentblue hover:underline"
              >
                {role === 'teacher' ? 'Grade Work' : 'Submit Assignment'} &rarr;
              </Link>
            </div>
          </div>
        ))}

        {assignments.length === 0 && (
          <div className="col-span-full text-center py-20 text-xs text-zinc-400 italic bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-3xl">
            No assignments published yet.
          </div>
        )}
      </div>

      {/* Create Assignment Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 backdrop-blur-sm px-4">
          <div className="max-w-md w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-3xl p-6 shadow-xl space-y-4">
            
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-900 pb-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
                Create New Assignment
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
                  Assignment Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lab report 2 - Data Structures"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="mt-1 w-full px-3 py-2 bg-[#F5F5F5] dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-accentblue dark:focus:ring-zinc-700"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                  Instructions / Brief
                </label>
                <textarea
                  required
                  placeholder="Describe files to submit, research guidelines, etc..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={4}
                  className="mt-1 w-full px-3 py-2 bg-[#F5F5F5] dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-accentblue dark:focus:ring-zinc-700 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                    Due Date
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={dueDate}
                    onChange={e => setDueDate(e.target.value)}
                    className="mt-1 w-full px-3 py-2 bg-[#F5F5F5] dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-accentblue dark:focus:ring-zinc-700"
                  />
                </div>
                
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                    Max Score
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    max={1000}
                    value={maxScore}
                    onChange={e => setMaxScore(e.target.value)}
                    className="mt-1 w-full px-3 py-2 bg-[#F5F5F5] dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-accentblue dark:focus:ring-zinc-700"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 font-semibold rounded-full text-xs shadow hover:bg-zinc-800 dark:hover:bg-zinc-100"
              >
                Create Assignment
              </button>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
export default AssignmentsList;
