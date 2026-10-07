import { createClient } from '@/lib/supabase/server';

export async function ContactsTable({ workspaceId }: { workspaceId: string }) {
  const supabase = await createClient();

  const { data: contacts, error } = await supabase
    .from('contacts')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false });

  if (error) {
    // If the table doesn't exist yet (migration pending), show a friendly empty state
    if (error.code === '42P01') {
      return (
        <div className="bg-white p-12 text-center">
          <p className="text-gray-500 mb-2 text-lg">Database update required.</p>
          <p className="text-sm text-gray-400">Please apply the pending Supabase migrations to enable the Contacts feature.</p>
        </div>
      );
    }
    return <div className="text-red-500 p-4">Error loading contacts: {error.message}</div>;
  }

  if (!contacts || contacts.length === 0) {
    return (
      <div className="bg-white p-12 text-center border-t border-gray-100">
        <p className="text-gray-500 font-medium">No contacts found.</p>
        <p className="text-sm text-gray-400 mt-1">Add your first contact to get started.</p>
      </div>
    );
  }

  return (
    <div className="bg-white overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50/50">
            <tr>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Job Title</th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Added</th>
              <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {contacts.map((contact) => (
              <tr key={contact.id} className="hover:bg-gray-50/80 transition-colors group">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-xs mr-3">
                      {contact.first_name[0]}{contact.last_name[0]}
                    </div>
                    <div className="text-sm font-medium text-gray-900">{contact.first_name} {contact.last_name}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {contact.email || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {contact.job_title || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(contact.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-orange-500 hover:text-orange-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    Edit
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
