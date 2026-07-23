import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api.ts';
import { Search as SearchIcon, Hash, Bell, BookOpen, FolderOpen, Users } from 'lucide-react';

export const Search: React.FC = () => {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || !workspaceId) return;
    setLoading(true);

    try {
      const res = await api.get(`/search?q=${encodeURIComponent(query)}&workspaceId=${workspaceId}`);
      setResults(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
          Global Workspace Search
        </h1>
        <p className="text-xs text-zinc-400 dark:text-zinc-500 font-semibold uppercase tracking-wider block mt-0.5">
          Find matching items inside this classroom
        </p>
      </div>

      {/* Search Input */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search by keywords (channels, announcements, assignments, folders, names)..."
          className="flex-1 px-4 py-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-full text-xs focus:outline-none focus:ring-2 focus:ring-accentblue"
        />
        <button
          type="submit"
          className="flex items-center gap-1.5 px-6 py-3 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 font-bold rounded-full text-xs shadow hover:bg-zinc-800"
        >
          <SearchIcon className="w-4 h-4" />
          <span>Search</span>
        </button>
      </form>

      {/* Results View */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-zinc-950 dark:border-white border-t-transparent rounded-full animate-spin" />
        </div>
      ) : results ? (
        <div className="space-y-6">
          
          {/* Channels Section */}
          {results.channels?.length > 0 && (
            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-3xl p-5 space-y-3">
              <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1">
                <Hash className="w-4 h-4" />
                <span>Channels ({results.channels.length})</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {results.channels.map((ch: any) => (
                  <Link
                    key={ch._id}
                    to={`/w/${workspaceId}/channels/${ch._id}`}
                    className="p-2 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-xl text-xs font-semibold block truncate"
                  >
                    #{ch.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Announcements Section */}
          {results.announcements?.length > 0 && (
            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-3xl p-5 space-y-3">
              <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1">
                <Bell className="w-4 h-4" />
                <span>Announcements ({results.announcements.length})</span>
              </h3>
              <div className="space-y-2">
                {results.announcements.map((ann: any) => (
                  <Link
                    key={ann._id}
                    to={`/w/${workspaceId}/announcements`}
                    className="block p-3 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-xl text-xs"
                  >
                    <span className="font-bold text-zinc-800 dark:text-zinc-200 block">{ann.title}</span>
                    <span className="text-[10px] text-zinc-400 mt-1 line-clamp-1">{ann.body}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Assignments Section */}
          {results.assignments?.length > 0 && (
            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-3xl p-5 space-y-3">
              <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1">
                <BookOpen className="w-4 h-4" />
                <span>Assignments ({results.assignments.length})</span>
              </h3>
              <div className="space-y-2">
                {results.assignments.map((asg: any) => (
                  <Link
                    key={asg._id}
                    to={`/w/${workspaceId}/assignments/${asg._id}`}
                    className="block p-3 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-xl text-xs"
                  >
                    <span className="font-bold text-zinc-800 dark:text-zinc-200 block">{asg.title}</span>
                    <span className="text-[10px] text-zinc-400 mt-1 line-clamp-1">{asg.description}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Resources Section */}
          {results.resources?.length > 0 && (
            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-3xl p-5 space-y-3">
              <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1">
                <FolderOpen className="w-4 h-4" />
                <span>Resources ({results.resources.length})</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {results.resources.map((res: any) => (
                  <a
                    key={res._id}
                    href={res.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-xl text-xs flex justify-between items-center"
                  >
                    <div>
                      <span className="font-semibold text-zinc-800 dark:text-zinc-200 block truncate max-w-[160px]">{res.title}</span>
                      <span className="text-[9px] text-zinc-400 block uppercase">Folder: {res.folder}</span>
                    </div>
                    <span className="text-[9px] font-bold text-zinc-500 uppercase">{res.type}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Members Section */}
          {results.members?.length > 0 && (
            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-3xl p-5 space-y-3">
              <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>Members ({results.members.length})</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {results.members.map((mem: any) => (
                  <div key={mem._id} className="p-3 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-zinc-100 dark:bg-zinc-900 text-zinc-500 flex items-center justify-center font-bold text-[10px]">
                      {mem.userId?.name?.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <span className="font-bold text-zinc-800 dark:text-zinc-200 block truncate">{mem.userId?.name}</span>
                      <span className="text-[9px] text-zinc-400 capitalize block">{mem.role}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {Object.values(results).every((arr: any) => arr.length === 0) && (
            <div className="text-center py-20 text-xs text-zinc-400 italic bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-3xl">
              No matching records found. Try other keywords.
            </div>
          )}

        </div>
      ) : (
        <div className="text-center py-20 text-xs text-zinc-400 italic bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-3xl">
          Enter search terms above to inspect workspace details.
        </div>
      )}

    </div>
  );
};
export default Search;
