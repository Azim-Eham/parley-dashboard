import { createClient } from '@/lib/supabase/server';
import { BarChart, PieChart, TrendingUp, Users } from 'lucide-react';

export default async function ReportsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return <div>Not authenticated</div>;

  const { data: member } = await supabase
    .from('workspace_members')
    .select('workspace_id, workspaces(name)')
    .eq('user_id', user.id)
    .single();

  if (!member) return <div>No workspace found</div>;

  // Fetch some quick stats
  const { count: leadsCount } = await supabase.from('leads').select('*', { count: 'exact', head: true }).eq('workspace_id', member.workspace_id);
  const { count: dealsCount } = await supabase.from('deals').select('*', { count: 'exact', head: true }).eq('workspace_id', member.workspace_id);

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Reports</h2>
          <p className="text-sm text-gray-500 mt-1">{member.workspaces?.name} Analytics</p>
        </div>
        <button className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 shadow-sm transition-colors">
          Download PDF
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Leads', value: leadsCount || 0, icon: Users, trend: '+12%' },
          { label: 'Active Deals', value: dealsCount || 0, icon: TrendingUp, trend: '+5%' },
          { label: 'Win Rate', value: '24%', icon: PieChart, trend: '+2%' },
          { label: 'Revenue', value: '$0', icon: BarChart, trend: '0%' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-orange-50 rounded-lg text-orange-500">
                <stat.icon className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">{stat.trend}</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
            <div className="text-sm text-gray-500 font-medium">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col">
          <h3 className="font-semibold text-gray-900 mb-6">Lead Sources</h3>
          <div className="flex-1 flex items-center justify-center border-2 border-dashed border-gray-100 rounded-lg text-gray-400">
            Chart data unavailable
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col">
          <h3 className="font-semibold text-gray-900 mb-6">Revenue Forecast</h3>
          <div className="flex-1 flex items-center justify-center border-2 border-dashed border-gray-100 rounded-lg text-gray-400">
            Chart data unavailable
          </div>
        </div>
      </div>
    </div>
  );
}
