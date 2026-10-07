import { createClient } from '@/lib/supabase/server';

export async function CompaniesTable({ workspaceId }: { workspaceId: string }) {
  const supabase = await createClient();

  const { data: companies, error } = await supabase
    .from('companies')
    .select('*, contacts(count), deals(count)')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false });

  if (error) {
    return <div className="text-red-500 p-4">Error loading companies: {error.message}</div>;
  }

  if (!companies || companies.length === 0) {
    return (
      <div className="bg-white p-12 text-center border-t border-gray-100">
        <p className="text-gray-500 font-medium">No companies found.</p>
        <p className="text-sm text-gray-400 mt-1">Add your first target account to get started.</p>
      </div>
    );
  }

  return (
    <div className="bg-white overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50/50">
            <tr>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Company</th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Industry</th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Size</th>
              <th scope="col" className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Contacts</th>
              <th scope="col" className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Deals</th>
              <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {companies.map((company) => (
              <tr key={company.id} className="hover:bg-gray-50/80 transition-colors group">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-xs mr-3 border border-gray-200">
                      {company.name[0]?.toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{company.name}</div>
                      {company.website && (
                        <a href={`https://${company.website.replace(/^https?:\/\//, '')}`} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline">
                          {company.website}
                        </a>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {company.industry || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {company.size || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                  <span className="bg-gray-100 text-gray-600 py-1 px-2.5 rounded-full text-xs font-medium">
                    {company.contacts?.[0]?.count ?? 0}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                  <span className="bg-orange-50 text-orange-600 py-1 px-2.5 rounded-full text-xs font-medium">
                    {company.deals?.[0]?.count ?? 0}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-orange-500 hover:text-orange-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
