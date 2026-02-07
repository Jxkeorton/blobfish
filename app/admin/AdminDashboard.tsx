// app/admin/AdminDashboard.tsx
'use client';

import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const router = useRouter();

  const handleLogout = async () => {
    const response = await fetch('/api/admin/logout', {
      method: 'POST',
    });

    if (response.ok) {
      router.refresh(); // Refresh to show login form again
    }
  };

  return (
    <div className="min-h-[60vh] px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="flex items-center justify-between mb-8 pb-6 border-b border-[#2a2a2a]">
          <h1 className="text-3xl text-foreground">Admin Dashboard</h1>
          <button 
            onClick={handleLogout}
            className="px-5 py-2.5 bg-[#252525] hover:bg-[#333] text-foreground rounded-lg transition-all duration-200 border border-[#3a3a3a] font-system-sans text-sm"
          >
            Logout
          </button>
        </header>

        {/* Content Area */}
        <div className="bg-[#1a1a1a] rounded-2xl p-8 border border-[#2a2a2a]">
          <h2 className="text-xl text-foreground mb-4">Welcome, Admin</h2>
          <p className="text-gray-400 font-system-sans">
            Protected content goes here. Use this dashboard to manage your site content.
          </p>
        </div>
      </div>
    </div>
  );
}