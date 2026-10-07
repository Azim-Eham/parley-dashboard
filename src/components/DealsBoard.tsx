import { createClient } from '@/lib/supabase/server';
import { DealsBoardClient } from './DealsBoardClient';

export async function DealsBoard({ workspaceId }: { workspaceId: string }) {
  const supabase = await createClient();

  const { data: deals, error } = await supabase
    .from('deals')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false });

  if (error) {
    return <div className="text-red-500 p-4">Error loading deals: {error.message}</div>;
  }

  return <DealsBoardClient initialDeals={deals || []} />;
}
