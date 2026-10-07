import { createClient } from '@/lib/supabase/server';
import { searchParamsCache } from '@/lib/searchParams';

export async function LeadsTable({ workspaceId }: { workspaceId: string }) {
  const supabase = await createClient();
  const from = searchParamsCache.get('from');
  const to = searchParamsCache.get('to');
  const statuses = searchParamsCache.get('statuses');

  let query = supabase
    .from('leads')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false });

  if (from) query = query.gte('created_at', from);
  if (to) query = query.lte('created_at', to);
  if (statuses && statuses.length > 0) {
    const validStatuses = statuses as ("new" | "contacted" | "not_interested" | "responded" | "booked")[];
    query = query.in('status', validStatuses);
  }

  const { data: leads, error } = await query;
  if (error) {
    console.error("Database error:", error);
    return <div className="text-red-500 p-4">An error occurred while loading leads. Please try again.</div>;
  }

  if (!leads || leads.length === 0) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
        <p className="text-gray-500">No leads found matching your filters.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {leads.map((lead) => (
              <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{lead.full_name}</div>
                  <div className="text-sm text-gray-500">{lead.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {lead.company || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {lead.source}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                    ${lead.status === 'new' ? 'bg-green-100 text-green-800' : ''}
                    ${lead.status === 'contacted' ? 'bg-blue-100 text-blue-800' : ''}
                    ${lead.status === 'responded' ? 'bg-purple-100 text-purple-800' : ''}
                    ${lead.status === 'booked' ? 'bg-yellow-100 text-yellow-800' : ''}
                    ${lead.status === 'not_interested' ? 'bg-gray-100 text-gray-800' : ''}
                  `}>
                    {lead.status?.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(lead.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
