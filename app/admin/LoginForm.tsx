'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginForm() {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        router.refresh();
      } else if (response.status === 429) {
        const data = await response.json();
        const retryAfter = response.headers.get('Retry-After');
        const minutes = retryAfter ? Math.ceil(parseInt(retryAfter) / 60) : 15;
        setError(data.error || `Too many attempts. Please try again in ${minutes} minutes.`);
      } else {
        setError('Invalid password');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-[#1a1a1a] rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-xl border border-[#2a2a2a]">
          <h1 className="text-2xl sm:text-3xl text-foreground mb-2 text-center">Admin Login</h1>
          <p className="text-gray-400 text-center mb-6 sm:mb-8 font-system-sans text-xs sm:text-sm">
            Enter your password to access the dashboard
          </p>
          
          <form onSubmit={handleLogin} className="space-y-5 sm:space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2 font-system-sans">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="w-full px-3 sm:px-4 py-3 bg-[#252525] border border-[#3a3a3a] rounded-lg text-foreground placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#F0B8CD] focus:border-transparent transition-all font-system-sans text-base"
                disabled={isLoading}
              />
            </div>
            
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-lg px-3 sm:px-4 py-3">
                <p className="text-red-400 text-sm font-system-sans">{error}</p>
              </div>
            )}
            
            <button 
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-[#F0B8CD] hover:bg-[#e5a3bc] text-[#141414] font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-system-sans text-base"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}