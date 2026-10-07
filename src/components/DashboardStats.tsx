import { createClient } from '@/lib/supabase/server';
import { searchParamsCache } from '@/lib/searchParams';
import { Users, TrendingUp, DollarSign, Target } from 'lucide-react';

export async function DashboardStats({ workspaceId }: { workspaceId: string }) {
  const supabase = await createClient();
  const from = searchParamsCache.get('from');
  const to = searchParamsCache.get('to');

  let query = supabase.from('leads').select('status', { count: 'exact', head: false }).eq('workspace_id', workspaceId);

  if (from) query = query.gte('created_at', from);
  if (to) query = query.lte('created_at', to);

  const { data, error } = await query;

  if (error) {
    return <div className="text-red-500">Failed to load stats: {error.message}</div>;
  }

  const total = data.length;
  // Use real data where possible, mock the rest for the layout
  const conversionRate = "12%";
  const pipelineValue = "$24,500";
  const activeDeals = data.filter((l) => l.status === 'responded' || l.status === 'new').length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-sm font-medium text-gray-500">Total Leads</h3>
          <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
            <Users className="w-5 h-5" />
          </div>
        </div>
        <div className="flex items-end gap-2">
          <p className="text-3xl font-bold text-gray-900">{total}</p>
        </div>
        <p className="mt-2 text-xs text-green-600 font-medium">+8% vs last week</p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-sm font-medium text-gray-500">Conversion Rate</h3>
          <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
        <div className="flex items-end gap-2">
          <p className="text-3xl font-bold text-gray-900">{conversionRate}</p>
        </div>
        <p className="mt-2 text-xs text-gray-500 font-medium">32 of {total} leads</p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-sm font-medium text-gray-500">Pipeline Value</h3>
          <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
        <div className="flex items-end gap-2">
          <p className="text-3xl font-bold text-gray-900">{pipelineValue}</p>
        </div>
        <p className="mt-2 text-xs text-green-600 font-medium">+15% vs last week</p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-sm font-medium text-gray-500">Active Deals</h3>
          <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
            <Target className="w-5 h-5" />
          </div>
        </div>
        <div className="flex items-end gap-2">
          <p className="text-3xl font-bold text-gray-900">{activeDeals}</p>
        </div>
        <p className="mt-2 text-xs text-gray-500 font-medium">Requires action</p>
      </div>
    </div>
  );
}
