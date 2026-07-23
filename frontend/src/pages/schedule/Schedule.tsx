import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../services/api.ts';
import { useWorkspaceStore } from '../../store/workspaceStore.ts';
import { Calendar, Plus, Clock, MapPin, X } from 'lucide-react';

export const Schedule: React.FC = () => {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const { role } = useWorkspaceStore();

  const [schedule, setSchedule] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [showModal, setShowModal] = useState(false);
  const [day, setDay] = useState<'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat'>('Mon');
  const [subject, setSubject] = useState('');
  const [faculty, setFaculty] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [room, setRoom] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const fetchSchedule = async () => {
    try {
      const res = await api.get(`/schedule/workspace/${workspaceId}`);
      setSchedule(res.data.schedule);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (workspaceId) fetchSchedule();
  }, [workspaceId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !faculty.trim() || !startTime || !endTime) return;
    setError('');

    try {
      const res = await api.post(`/schedule/workspace/${workspaceId}`, {
        day,
        subject,
        faculty,
        startTime,
        endTime,
        room,
        notes
      });
      setSchedule(prev => [...prev, res.data.entry].sort((a, b) => a.startTime.localeCompare(b.startTime)));
      setShowModal(false);
      setSubject('');
      setFaculty('');
      setStartTime('');
      setEndTime('');
      setRoom('');
      setNotes('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add entry.');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/schedule/${id}`);
      setSchedule(prev => prev.filter(s => s._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const daysOfWeek: ('Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat')[] = [
    'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-zinc-950 dark:border-white border-t-transparent dark:border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Classroom Schedule
          </h1>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 font-semibold uppercase tracking-wider block mt-0.5">
            Weekly subject timetable
          </p>
        </div>

        {role === 'teacher' && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 font-semibold rounded-full shadow text-xs transition-all hover:scale-105"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Class Slot</span>
          </button>
        )}
      </div>

      {/* Week Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {daysOfWeek.map((currentDay) => {
          const dayEntries = schedule.filter(s => s.day === currentDay);
          return (
            <div
              key={currentDay}
              className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-3xl p-5 shadow-sm space-y-4 flex flex-col justify-between min-h-[220px] h-full"
            >
              <div className="space-y-3">
                {/* Day Header */}
                <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-900 pb-2">
                  <Calendar className="w-4 h-4 text-zinc-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
                    {currentDay === 'Mon' ? 'Monday' :
                     currentDay === 'Tue' ? 'Tuesday' :
                     currentDay === 'Wed' ? 'Wednesday' :
                     currentDay === 'Thu' ? 'Thursday' :
                     currentDay === 'Fri' ? 'Friday' : 'Saturday'}
                  </h3>
                </div>

                {/* Day Slots */}
                <div className="space-y-3 divide-y divide-zinc-100 dark:divide-zinc-900">
                  {dayEntries.map((entry) => (
                    <div key={entry._id} className="pt-3 first:pt-0 text-xs space-y-1.5 relative group">
                      {role === 'teacher' && (
                        <button
                          onClick={() => handleDelete(entry._id)}
                          className="absolute right-0 top-3 text-[9px] text-red-500 hover:underline opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          Remove
                        </button>
                      )}

                      <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                        <Clock className="w-3.5 h-3.5 text-zinc-300" />
                        <span>{entry.startTime} - {entry.endTime}</span>
                      </div>

                      <h4 className="font-bold text-zinc-900 dark:text-white">
                        {entry.subject}
                      </h4>

                      <div className="flex justify-between items-center text-[10px] font-semibold text-zinc-400 uppercase">
                        <span>Faculty: {entry.faculty}</span>
                        {entry.room && (
                          <span className="flex items-center gap-0.5">
                            <MapPin className="w-3 h-3" />
                            <span>Room {entry.room}</span>
                          </span>
                        )}
                      </div>

                      {entry.notes && (
                        <p className="text-[10px] italic text-zinc-400 leading-normal pl-1">
                          "{entry.notes}"
                        </p>
                      )}
                    </div>
                  ))}

                  {dayEntries.length === 0 && (
                    <div className="py-8 text-center text-[10px] text-zinc-400 italic">
                      No classes scheduled.
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Entry Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 backdrop-blur-sm px-4">
          <div className="max-w-md w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-3xl p-6 shadow-xl space-y-4">
            
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-900 pb-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
                Add Timetable Slot
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
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                    Day
                  </label>
                  <select
                    value={day}
                    onChange={e => setDay(e.target.value as any)}
                    className="mt-1 w-full px-3 py-2 bg-[#F5F5F5] dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-accentblue dark:focus:ring-zinc-700"
                  >
                    <option value="Mon">Monday</option>
                    <option value="Tue">Tuesday</option>
                    <option value="Wed">Wednesday</option>
                    <option value="Thu">Thursday</option>
                    <option value="Fri">Friday</option>
                    <option value="Sat">Saturday</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                    Room / Lab (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 403-B"
                    value={room}
                    onChange={e => setRoom(e.target.value)}
                    className="mt-1 w-full px-3 py-2 bg-[#F5F5F5] dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-accentblue dark:focus:ring-zinc-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                  Subject Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Advanced Operating Systems"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  className="mt-1 w-full px-3 py-2 bg-[#F5F5F5] dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-accentblue dark:focus:ring-zinc-700"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                  Faculty Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Prof. Alan Turing"
                  value={faculty}
                  onChange={e => setFaculty(e.target.value)}
                  className="mt-1 w-full px-3 py-2 bg-[#F5F5F5] dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-accentblue dark:focus:ring-zinc-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                    Start Time
                  </label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={e => setStartTime(e.target.value)}
                    className="mt-1 w-full px-3 py-2 bg-[#F5F5F5] dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-accentblue dark:focus:ring-zinc-700"
                  />
                </div>
                
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                    End Time
                  </label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={e => setEndTime(e.target.value)}
                    className="mt-1 w-full px-3 py-2 bg-[#F5F5F5] dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-accentblue dark:focus:ring-zinc-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                  Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Bring laptop, lab materials..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="mt-1 w-full px-3 py-2 bg-[#F5F5F5] dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-accentblue dark:focus:ring-zinc-700"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 font-semibold rounded-full text-xs shadow hover:bg-zinc-800 dark:hover:bg-zinc-100"
              >
                Add Timetable Slot
              </button>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
export default Schedule;
