import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useStore } from '../../store';
import { supabase } from '../../lib/supabase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setUser } = useStore();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const isAdmin = session.user.email === 'admin@shreehari.com';
        let profileData: any = null;
        try {
          const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
          profileData = data;
        } catch (e) {
          // ignore error if profile table is not yet created
        }

        setUser({ 
          id: session.user.id, 
          email: session.user.email || '', 
          name: profileData?.name || session.user.user_metadata?.full_name || 'User', 
          role: profileData?.role || (isAdmin ? 'admin' : 'customer'), 
          mobile: profileData?.mobile || session.user.user_metadata?.mobile || '',
          companyName: profileData?.companyName,
          gstNumber: profileData?.gstNumber,
          profilePicture: profileData?.profilePicture,
          addresses: profileData?.addresses || []
        });
        const redirect = searchParams.get('redirect');
        navigate(isAdmin ? '/admin' : (redirect || '/'));
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setUser, navigate, searchParams]);

  const handleGoogleLogin = async () => {
    try {


      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || 'Failed to initiate Google login');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      if (data.user) {
        const isAdmin = data.user.email === 'admin@shreehari.com';
        let profileData: any = null;
        try {
          const { data: prof } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();
          profileData = prof;
        } catch (e) {}

        const role = profileData?.role || (isAdmin ? 'admin' : 'customer');
        setUser({ 
          id: data.user.id, 
          email: data.user.email || '', 
          name: profileData?.name || data.user.user_metadata?.full_name || 'User', 
          role, 
          mobile: profileData?.mobile || data.user.user_metadata?.mobile || '',
          companyName: profileData?.companyName,
          gstNumber: profileData?.gstNumber,
          profilePicture: profileData?.profilePicture,
          addresses: profileData?.addresses || []
        });
        
        const redirect = searchParams.get('redirect');
        if (role === 'admin') {
          navigate('/admin');
        } else {
          navigate(redirect || '/');
        }
      }
    } catch (err: any) {

      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-slate-50 flex items-center justify-center p-4 font-sans text-slate-900">
      <div className="w-full max-w-md bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block hover:opacity-80 transition-opacity">
            <h1 className="text-3xl font-bold text-amber-500 mb-2 uppercase tracking-tight">Shree Hari</h1>
          </Link>
          <p className="text-slate-500 font-medium text-sm">Welcome back to your spiritual journey</p>
        </div>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm text-center border border-red-200 font-medium">{error}</div>}

        <button
          onClick={handleGoogleLogin}
          className="w-full flex justify-center items-center gap-3 bg-white border border-slate-200 text-slate-700 py-3 rounded-lg font-bold text-sm hover:bg-slate-50 transition-colors shadow-sm mb-6"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          CONTINUE WITH GOOGLE
        </button>


        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-slate-500 font-bold uppercase tracking-wider text-xs">Or continue with email</span>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Email Address</label>
            <input 
              type="email" 
              required 
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 transition-all font-medium text-slate-900" 
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Password</label>
            <input 
              type="password" 
              required 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 transition-all font-medium text-slate-900" 
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold text-sm uppercase tracking-wide hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-50 mt-4"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="mt-6 text-center text-slate-600 text-sm font-medium">
          Don't have an account? <Link to="/register" className="text-amber-600 font-bold hover:underline">Register</Link>
        </p>
      </div>
    </div>
  );
}
