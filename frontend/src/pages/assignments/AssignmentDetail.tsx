import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api.ts';
import { useWorkspaceStore } from '../../store/workspaceStore.ts';
import { FileUp, Calendar, CheckCircle, ShieldAlert, Award, FileText } from 'lucide-react';

export const AssignmentDetail: React.FC = () => {
  const { id, workspaceId } = useParams<{ id: string; workspaceId: string }>();
  const { role } = useWorkspaceStore();

  const [assignment, setAssignment] = useState<any | null>(null);
  const [submission, setSubmission] = useState<any | null>(null);
  const [submissionsList, setSubmissionsList] = useState<any[]>([]); // Teacher View
  const [loading, setLoading] = useState(true);

  // Student Upload States
  const [uploading, setUploading] = useState(false);
  const [submitFileUrl, setSubmitFileUrl] = useState('');
  const [comment, setComment] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [studentError, setStudentError] = useState('');

  // Teacher Grading States
  const [gradingId, setGradingId] = useState<string | null>(null);
  const [gradeScore, setGradeScore] = useState('');
  const [gradeFeedback, setGradeFeedback] = useState('');
  const [gradingSuccess, setGradingSuccess] = useState(false);

  const fetchDetail = async () => {
    try {
      const res = await api.get(`/assignments/${id}`);
      setAssignment(res.data.assignment);
      setSubmission(res.data.submission);

      if (role === 'teacher') {
        const subsRes = await api.get(`/assignments/${id}/submissions`);
        setSubmissionsList(subsRes.data.submissions);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchDetail();
  }, [id, role]);

  // Student: File Upload & Submit
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setStudentError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      // Post to our local upload controller
      const res = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setSubmitFileUrl(res.data.url);
    } catch (err: any) {
      setStudentError('File upload failed. Ensure size limit is under 25MB.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmitWork = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submitFileUrl) return;
    setStudentError('');

    try {
      const res = await api.post(`/assignments/${id}/submissions`, {
        files: [submitFileUrl],
        comment
      });
      setSubmission(res.data.submission);
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (err: any) {
      setStudentError('Failed to submit assignment.');
    }
  };

  // Teacher: Grade Submission
  const handleGradeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradingId) return;

    try {
      await api.patch(`/assignments/submissions/${gradingId}`, {
        score: Number(gradeScore),
        feedback: gradeFeedback
      });
      setGradingSuccess(true);
      setGradingId(null);
      setGradeScore('');
      setGradeFeedback('');
      setTimeout(() => setGradingSuccess(false), 3000);
      
      // Reload submissions list
      const subsRes = await api.get(`/assignments/${id}/submissions`);
      setSubmissionsList(subsRes.data.submissions);
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
    <div className="space-y-8 max-w-4xl mx-auto">
      
      {/* Title */}
      <div>
        <Link to={`/w/${workspaceId}/assignments`} className="text-xs font-bold text-accentblue hover:underline">
          &larr; Back to Assignments List
        </Link>
        <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white mt-2">
          {assignment?.title}
        </h1>
        <div className="flex items-center gap-4 text-[10px] text-zinc-400 font-semibold uppercase mt-1">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-zinc-300" />
            Due: {new Date(assignment?.dueDate).toLocaleString()}
          </span>
          <span>&middot;</span>
          <span className="flex items-center gap-1">
            <Award className="w-3.5 h-3.5 text-zinc-300" />
            Max Grade: {assignment?.maxScore || 100}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Description panel */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 border-b border-zinc-100 dark:border-zinc-900 pb-2">
              Assignment Instructions
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">
              {assignment?.description}
            </p>
          </div>

          {/* Student View: Submission Status Card */}
          {role === 'student' && submission && (
            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-900 pb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Submission Status
                </h3>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  submission.status === 'graded' 
                    ? 'bg-emerald-100 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400'
                    : 'bg-indigo-100 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400'
                }`}>
                  {submission.status}
                </span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="block text-[10px] uppercase font-bold text-zinc-400">Submitted file</span>
                  <a
                    href={submission.files[0]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-accentblue hover:underline mt-1 font-semibold"
                  >
                    <FileText className="w-4 h-4 shrink-0 text-zinc-400" />
                    <span className="truncate max-w-[180px]">View Attachment</span>
                  </a>
                </div>

                <div>
                  <span className="block text-[10px] uppercase font-bold text-zinc-400">Submission Date</span>
                  <span className="text-zinc-600 dark:text-zinc-300 block mt-1 font-semibold">
                    {new Date(submission.submittedAt).toLocaleString()}
                  </span>
                </div>

                {submission.status === 'graded' && (
                  <div className="col-span-full bg-emerald-50/30 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-900/30 p-4 rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
                    <div className="sm:col-span-1">
                      <span className="block text-[10px] uppercase font-bold text-zinc-400">Awarded score</span>
                      <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                        {submission.score} / {assignment?.maxScore || 100}
                      </span>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="block text-[10px] uppercase font-bold text-zinc-400">Teacher feedback</span>
                      <p className="text-zinc-600 dark:text-zinc-300 mt-1 italic text-xs leading-normal">
                        "{submission.feedback || 'No comments left.'}"
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Action Panel */}
        <div className="space-y-6">
          
          {/* Student submit panel */}
          {role === 'student' && (!submission || submission.status !== 'graded') && (
            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 border-b border-zinc-100 dark:border-zinc-900 pb-2">
                Submit your work
              </h3>

              {studentError && (
                <div className="p-2.5 bg-red-50 text-red-600 text-[11px] rounded-xl flex gap-1.5 items-start">
                  <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                  <span>{studentError}</span>
                </div>
              )}

              {submitSuccess && (
                <div className="p-2.5 bg-emerald-50 text-emerald-600 text-[11px] rounded-xl flex gap-1.5 items-start">
                  <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>Assignment submitted!</span>
                </div>
              )}

              <form onSubmit={handleSubmitWork} className="space-y-4">
                
                {/* Drag and drop file select */}
                <div className="border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 text-center hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors relative">
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <FileUp className="w-8 h-8 text-zinc-300 mx-auto" />
                  <span className="block text-xs font-bold mt-2 text-zinc-700 dark:text-zinc-300">
                    {uploading ? 'Uploading attachment...' : 'Select attachment file'}
                  </span>
                  <span className="text-[10px] text-zinc-400 leading-normal block mt-1">
                    PDF, DOC, Images, or zip archive up to 25MB.
                  </span>
                </div>

                {submitFileUrl && (
                  <div className="p-2 border border-zinc-200 dark:border-zinc-800 bg-[#F8F8FA] dark:bg-zinc-900 rounded-xl text-[10px] flex items-center justify-between text-zinc-500">
                    <span className="truncate max-w-[180px] font-semibold">{submitFileUrl}</span>
                    <button
                      type="button"
                      onClick={() => setSubmitFileUrl('')}
                      className="text-red-500 font-bold hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                    Comments / note
                  </label>
                  <textarea
                    placeholder="Provide notes to teacher..."
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    rows={2}
                    className="mt-1 w-full px-3 py-2 bg-[#F5F5F5] dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-accentblue dark:focus:ring-zinc-700 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!submitFileUrl || uploading}
                  className="w-full py-2.5 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 font-semibold rounded-full text-xs shadow hover:bg-zinc-800 dark:hover:bg-zinc-100 disabled:opacity-50"
                >
                  Send Submission
                </button>
              </form>
            </div>
          )}

          {/* Teacher View: Student Submissions Panel */}
          {role === 'teacher' && (
            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-3xl p-6 shadow-sm space-y-4 col-span-full lg:col-span-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 border-b border-zinc-100 dark:border-zinc-900 pb-2">
                Submissions ({submissionsList.length})
              </h3>

              {gradingSuccess && (
                <div className="p-2.5 bg-emerald-50 text-emerald-600 text-[11px] rounded-xl flex gap-1.5 items-start">
                  <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>Grade saved successfully!</span>
                </div>
              )}

              <div className="space-y-3 divide-y divide-zinc-100 dark:divide-zinc-900">
                {submissionsList.map((sub) => (
                  <div key={sub._id} className="pt-3 first:pt-0 space-y-2 text-xs">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-bold text-zinc-800 dark:text-zinc-200 block">{sub.studentId?.name}</span>
                        <span className="text-[9px] text-zinc-400 font-semibold uppercase">{new Date(sub.submittedAt).toLocaleDateString()}</span>
                      </div>
                      
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                        sub.status === 'graded'
                          ? 'bg-emerald-100 text-emerald-600'
                          : 'bg-amber-100 text-amber-600'
                      }`}>
                        {sub.status === 'graded' ? `${sub.score}/${assignment?.maxScore || 100}` : 'pending'}
                      </span>
                    </div>

                    <a
                      href={sub.files[0]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] font-bold text-accentblue hover:underline flex items-center gap-1"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>View Submission File</span>
                    </a>

                    {sub.status !== 'graded' && gradingId !== sub._id && (
                      <button
                        onClick={() => {
                          setGradingId(sub._id);
                          setGradeScore(assignment?.maxScore || '100');
                        }}
                        className="w-full text-center py-1 bg-zinc-900 text-white rounded text-[10px] font-bold uppercase tracking-wider"
                      >
                        Grade Student
                      </button>
                    )}

                    {gradingId === sub._id && (
                      <form onSubmit={handleGradeSubmit} className="bg-zinc-50 dark:bg-zinc-900 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-2 mt-2">
                        <div>
                          <label className="block text-[8px] font-bold text-zinc-400 uppercase tracking-wider">Score</label>
                          <input
                            type="number"
                            required
                            min={0}
                            max={assignment?.maxScore || 100}
                            value={gradeScore}
                            onChange={e => setGradeScore(e.target.value)}
                            className="mt-1 w-full px-2 py-1 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded text-xs"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-[8px] font-bold text-zinc-400 uppercase tracking-wider">Feedback</label>
                          <textarea
                            placeholder="Feedback comment..."
                            value={gradeFeedback}
                            onChange={e => setGradeFeedback(e.target.value)}
                            rows={2}
                            className="mt-1 w-full px-2 py-1 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded text-xs resize-none"
                          />
                        </div>

                        <div className="flex gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => setGradingId(null)}
                            className="w-1/2 py-1 border border-zinc-200 dark:border-zinc-800 text-[10px] rounded"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="w-1/2 py-1 bg-zinc-950 hover:bg-zinc-800 text-white rounded-[4px] text-[10px] font-bold"
                          >
                            Save Grade
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                ))}

                {submissionsList.length === 0 && (
                  <div className="py-6 text-center text-xs text-zinc-400 italic">
                    No submissions uploaded by students yet.
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
export default AssignmentDetail;
