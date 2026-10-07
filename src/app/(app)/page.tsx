import { createClient } from '@/lib/supabase/server';
import { searchParamsCache } from '@/lib/searchParams';
import { type SearchParams } from 'nuqs/server';
import { DashboardStats } from '@/components/DashboardStats';
import { DashboardFilters } from '@/components/DashboardFilters';
import { LeadsTable } from '@/components/LeadsTable';
import { Suspense } from 'react';

type PageProps = {
  searchParams: Promise<SearchParams>;
};

async function DashboardData({ user }: { user: any }) {
  const supabase = await createClient();
  const { data: member, error: memberError } = await supabase
    .from('workspace_members')
    .select('workspace_id')
    .eq('user_id', user.id)
    .single();

  if (memberError || !member) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <p className="text-red-700">Error: Could not find workspace for user. {memberError?.message}</p>
      </div>
    );
  }

  const workspaceId = member.workspace_id;

  return (
    <>
      <Suspense fallback={<div className="h-32 bg-white rounded-xl shadow-sm border border-gray-200 animate-pulse mb-6"></div>}>
        <DashboardStats workspaceId={workspaceId} />
      </Suspense>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Latest Leads Table</h3>
        </div>
        <Suspense fallback={<div className="h-96 bg-gray-50 animate-pulse"></div>}>
          <LeadsTable workspaceId={workspaceId} />
        </Suspense>
      </div>
    </>
  );
}

export default async function DashboardPage({ searchParams }: PageProps) {
  // 1. Parse search params for Nuqs cache
  await searchParamsCache.parse(searchParams);

  // 2. Get auth user
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return <div>Not authenticated</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <div className="flex items-center space-x-3">
          <DashboardFilters />
          <button className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 shadow-sm transition-colors">
            Export
          </button>
          <button className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 shadow-sm transition-colors">
            New Lead
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart Placeholder */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-semibold text-gray-900">Leads Overview</h3>
          </div>
          {/* Simple CSS Bar Chart Placeholder */}
          <div className="h-64 flex items-end justify-between gap-2 px-2 border-b border-gray-100 pb-2 relative">
            <div className="absolute left-0 top-0 bottom-0 w-full flex flex-col justify-between text-xs text-gray-400 pointer-events-none">
              <div className="border-t border-dashed border-gray-100 w-full text-right -mt-2">100</div>
              <div className="border-t border-dashed border-gray-100 w-full text-right -mt-2">80</div>
              <div className="border-t border-dashed border-gray-100 w-full text-right -mt-2">60</div>
              <div className="border-t border-dashed border-gray-100 w-full text-right -mt-2">40</div>
              <div className="border-t border-dashed border-gray-100 w-full text-right -mt-2">20</div>
              <div className="w-full text-right -mt-2">0</div>
            </div>
            {/* Bars */}
            {[60, 80, 100, 75, 85, 45, 60].map((h, i) => (
              <div key={i} className="w-12 bg-orange-100 relative group rounded-t-sm z-10" style={{ height: `${h}%` }}>
                <div className="absolute bottom-0 w-full bg-orange-400 opacity-80 rounded-t-sm" style={{ height: `${h * 0.6}%` }}></div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 px-2 text-xs text-gray-500">
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
            <span>Sun</span>
          </div>
        </div>

        {/* Donut Chart Placeholder */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col">
          <h3 className="font-semibold text-gray-900 mb-6">Lead Status</h3>
          <div className="flex-1 flex flex-col items-center justify-center">
            {/* Simple CSS Donut */}
            <div className="relative w-48 h-48 rounded-full border-[16px] border-orange-500 border-r-orange-200 border-t-orange-100 flex items-center justify-center shadow-inner mb-6">
              <div className="text-center">
                <div className="text-sm text-gray-500">Total Leads</div>
                <div className="text-3xl font-bold text-gray-900">150</div>
              </div>
            </div>
            <div className="flex gap-4 text-xs font-medium text-gray-600 w-full justify-center">
              <div className="flex items-center"><span className="w-2 h-2 rounded-full bg-orange-500 mr-2"></span>New</div>
              <div className="flex items-center"><span className="w-2 h-2 rounded-full bg-orange-200 mr-2"></span>Contacted</div>
              <div className="flex items-center"><span className="w-2 h-2 rounded-full bg-orange-100 mr-2"></span>Won</div>
            </div>
          </div>
        </div>
      </div>

      <Suspense fallback={
        <div className="space-y-6">
          <div className="h-32 bg-white rounded-xl shadow-sm border border-gray-200 animate-pulse"></div>
          <div className="h-96 bg-white rounded-xl shadow-sm border border-gray-200 animate-pulse"></div>
        </div>
      }>
        <DashboardData user={user} />
      </Suspense>
    </div>
  );
}
