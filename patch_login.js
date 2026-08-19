import fs from 'fs';
let code = fs.readFileSync('src/pages/auth/Login.tsx', 'utf-8');
code = code.replace(
  /const handleGoogleLogin = async \(\) => \{[\s\S]*?catch \(err: any\) \{[\s\S]*?\}[\s\S]*?\};/,
  `const handleGoogleLogin = async () => {
    try {
      const isMock = !import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('placeholder');
      if (isMock) {
        // Fallback for mock environment
        setUser({ id: 'admin_mock', email: 'admin@shreehari.com', name: 'Admin', role: 'admin', mobile: '' });
        navigate('/admin');
        return;
      }

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
  };`
);
fs.writeFileSync('src/pages/auth/Login.tsx', code);
