import { redirect } from 'next/navigation';
import { connection } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { SignOutButton } from '@/components/SignOutButton';
import { Sidebar } from '@/components/Sidebar';

export const instant = false;

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await connection();
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-[#f8f9fa] h-16 flex items-center justify-between px-4 md:px-8 border-b border-gray-100 md:border-none">
          <div className="text-sm text-gray-500 hidden sm:block">
            Home / <span className="text-gray-900 font-medium">Dashboard</span>
          </div>
          <div className="text-lg font-bold text-gray-900 sm:hidden">
            Dashboard
          </div>
          <div className="flex items-center space-x-3 md:space-x-4">
            <div className="relative">
              <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white" />
              <button className="p-1 text-gray-400 hover:text-gray-500 bg-white rounded-full border border-gray-200 shadow-sm">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>
            </div>
            <div className="flex items-center gap-2 md:gap-3 bg-white pl-1.5 md:pl-2 pr-3 md:pr-4 py-1 md:py-1.5 rounded-full border border-gray-200 shadow-sm cursor-pointer">
              <div className="h-6 w-6 md:h-7 md:w-7 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-xs">
                {user.email?.[0].toUpperCase()}
              </div>
              <div className="flex flex-col hidden sm:flex">
                <span className="text-xs font-medium text-gray-900 leading-none">{user.email?.split('@')[0]}</span>
                <span className="text-[10px] text-gray-500 mt-0.5 leading-none">Agent</span>
              </div>
            </div>
            <div className="hidden sm:block">
              <SignOutButton />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-4 md:px-8 py-4 pb-24 md:pb-4">
          {children}
        </main>
      </div>
    </div>
  );
}
