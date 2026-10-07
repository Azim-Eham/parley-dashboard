import { createClient } from '@/lib/supabase/server';
import { User, Building2, Bell, Shield } from 'lucide-react';
import { DemoDataButton } from '@/components/DemoDataButton';

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return <div>Not authenticated</div>;

  const { data: member } = await supabase
    .from('workspace_members')
    .select('workspace_id, workspaces(name)')
    .eq('user_id', user.id)
    .single();

  return (
    <div className="space-y-6 h-full max-w-5xl">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Settings Navigation */}
        <div className="space-y-1">
          <button className="w-full flex items-center gap-3 px-4 py-2.5 bg-orange-50 text-orange-600 rounded-lg font-medium text-sm">
            <User className="w-4 h-4" /> Profile
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-600 hover:bg-gray-50 rounded-lg font-medium text-sm transition-colors">
            <Building2 className="w-4 h-4" /> Workspace
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-600 hover:bg-gray-50 rounded-lg font-medium text-sm transition-colors">
            <Bell className="w-4 h-4" /> Notifications
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-600 hover:bg-gray-50 rounded-lg font-medium text-sm transition-colors">
            <Shield className="w-4 h-4" /> Security
          </button>
        </div>

        {/* Settings Content */}
        <div className="md:col-span-3 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h3>
            <div className="space-y-4 max-w-md">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input type="email" disabled value={user.email || ''} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Workspace ID</label>
                <input type="text" disabled value={member?.workspace_id || ''} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-500 font-mono" />
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-gray-100 flex items-center justify-between">
              <button className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 shadow-sm transition-colors">
                Save Changes
              </button>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Developer Tools</h3>
            <p className="text-sm text-gray-500 mb-4">Populate your workspace with sample data to test the dashboard.</p>
            <DemoDataButton workspaceId={member?.workspace_id || ''} />
          </div>
        </div>
      </div>
    </div>
  );
}
