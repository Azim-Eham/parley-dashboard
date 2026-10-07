import { createClient } from '@/lib/supabase/server';
import { ActivitiesList } from '@/components/ActivitiesList';
import { Suspense } from 'react';

export default async function ActivitiesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return <div>Not authenticated</div>;
  }

  const { data: member } = await supabase
    .from('workspace_members')
    .select('workspace_id')
    .eq('user_id', user.id)
    .single();

  if (!member) {
    return <div>No workspace found</div>;
  }

  const workspaceId = member.workspace_id;

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Activities</h2>
        <button className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 shadow-sm transition-colors">
          Schedule Event
        </button>
      </div>
      
      <div className="flex-1 max-w-4xl">
        <Suspense fallback={<div className="h-64 bg-gray-50 animate-pulse rounded-xl border border-gray-200"></div>}>
          <ActivitiesList workspaceId={workspaceId} />
        </Suspense>
      </div>
    </div>
  );
}
