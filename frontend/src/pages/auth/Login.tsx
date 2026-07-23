import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore.ts';
import { api } from '../../services/api.ts';
import { VectorOrbit } from '../../components/ui/VectorOrbit.tsx';
import { ShieldCheck, Moon, Sun, ArrowRight } from 'lucide-react';
import { useUIStore } from '../../store/uiStore.ts';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const setSession = useAuthStore(state => state.setSession);
  const { theme, toggleTheme } = useUIStore();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/login', { email, password });
      const { user, accessToken, refreshToken } = res.data;
      setSession(user, accessToken, refreshToken);
      
      if (user.activeWorkspaceId) {
        navigate(`/w/${user.activeWorkspaceId}`);
      } else {
        navigate('/onboarding/workspace');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#F5F5F5] dark:bg-[#09090B] transition-colors duration-200">
      
      {/* Light / Dark Mode Float Toggle */}
      <button 
        onClick={toggleTheme}
        className="absolute top-4 left-4 z-50 p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full shadow-sm"
      >
        {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-zinc-700" />}
      </button>

      {/* Left Pane: Light Auth Card Panel */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-12 md:px-20 lg:px-32 bg-white dark:bg-[#121214] border-r border-zinc-200 dark:border-zinc-800">
        <div className="max-w-md w-full mx-auto space-y-8">
          <div>
            <span className="text-zinc-400 dark:text-zinc-500 font-medium tracking-wide text-sm">
              Classroom Connect
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white mt-1">
              Sign in to your account
            </h1>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              Or{' '}
              <Link to="/register" className="font-semibold text-accentblue dark:text-zinc-300 hover:underline">
                create a new workspace profile
              </Link>
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-lg text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@school.edu"
                className="mt-1 w-full px-4 py-3 bg-[#F5F5F5] dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-accentblue dark:focus:ring-zinc-700 focus:bg-white dark:focus:bg-zinc-950 transition-all text-sm"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-1 w-full px-4 py-3 bg-[#F5F5F5] dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-accentblue dark:focus:ring-zinc-700 focus:bg-white dark:focus:bg-zinc-950 transition-all text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center py-3 bg-zinc-950 dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-150 text-white dark:text-zinc-950 font-medium rounded-full shadow transition-all hover:scale-[1.01] text-sm disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>

      {/* Right Pane: Dark Presentation Card inspired by the reference image */}
      <div className="flex-1 hidden md:flex items-center justify-center p-8 bg-[#F5F5F5] dark:bg-[#09090B]">
        {/* Split card wrapper */}
        <div className="relative w-full max-w-2xl h-[480px] bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-3xl overflow-hidden shadow-xl flex">
          
          {/* Left Sub-Pane: Off-White Info card */}
          <div className="w-[45%] bg-[#F8F8FA] dark:bg-zinc-900 p-8 flex flex-col justify-between border-r border-zinc-200 dark:border-zinc-800">
            <div className="space-y-4">
              <span className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                Educational SaaS
              </span>
              <h2 className="text-xl font-normal leading-tight text-zinc-400">
                How Collaborative <br />
                <span className="font-extrabold text-zinc-950 dark:text-white">Education is reshaping classroom connections</span>
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                From real-time channels to structured resource folder libraries, Classroom Connect provides students and teachers with a secure digital workspace.
              </p>
            </div>
            
            <div className="flex flex-wrap gap-1.5">
              <span className="px-2.5 py-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-full text-[10px] text-zinc-600 dark:text-zinc-300">
                Workspaces
              </span>
              <span className="px-2.5 py-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-full text-[10px] text-zinc-600 dark:text-zinc-300">
                Realtime
              </span>
              <span className="px-2.5 py-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-full text-[10px] text-zinc-600 dark:text-zinc-300">
                Folders
              </span>
            </div>
          </div>

          {/* Right Sub-Pane: Deep Dark interactive orbit visualization */}
          <div className="w-[55%] bg-[#0D0D0E] p-8 flex flex-col justify-between relative overflow-hidden text-white">
            <VectorOrbit />
            
            <div className="relative z-10 space-y-2">
              <h3 className="text-lg font-bold tracking-tight">The Future of Classrooms.</h3>
              <p className="text-[11px] text-zinc-400 leading-relaxed max-w-[90%]">
                Organized workspaces replacing chaotic group chats. A central, multi-tenant operating system for academic administration.
              </p>
            </div>

            <div className="relative z-10 flex items-center justify-between mt-auto">
              <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Certified Secured</span>
              </div>
              <Link 
                to="/register"
                className="flex items-center gap-1 bg-white hover:bg-zinc-200 text-zinc-950 px-3 py-1.5 rounded-full text-[10px] font-bold shadow transition-all"
              >
                <span>Get Started</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
export default Login;
