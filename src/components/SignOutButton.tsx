'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function SignOutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh(); // Forces a re-evaluation of the layout which will redirect to /login
  };

  return (
    <button
      onClick={handleSignOut}
      disabled={loading}
      className="text-sm font-medium text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors disabled:opacity-50"
    >
      {loading ? 'Signing out...' : 'Sign out'}
    </button>
  );
}
