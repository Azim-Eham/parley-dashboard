import { createClient } from '@/lib/supabase/server';
import { Calendar, CheckCircle2, Circle, Mail, Phone, Clock } from 'lucide-react';

export async function ActivitiesList({ workspaceId }: { workspaceId: string }) {
  const supabase = await createClient();

  const { data: activities, error } = await supabase
    .from('activities')
    .select('*, contacts(first_name, last_name), deals(name)')
    .eq('workspace_id', workspaceId)
    .order('due_date', { ascending: true });

  if (error) {
    return <div className="text-red-500 p-4">Error loading activities: {error.message}</div>;
  }

  if (!activities || activities.length === 0) {
    return (
      <div className="bg-white p-12 text-center border border-gray-200 rounded-xl shadow-sm">
        <p className="text-gray-500 font-medium">No upcoming activities.</p>
        <p className="text-sm text-gray-400 mt-1">Schedule a call or meeting to keep your pipeline moving.</p>
      </div>
    );
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'call': return <Phone className="w-5 h-5 text-green-500" />;
      case 'email': return <Mail className="w-5 h-5 text-blue-500" />;
      case 'meeting': return <Calendar className="w-5 h-5 text-purple-500" />;
      default: return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <ul className="divide-y divide-gray-100">
        {activities.map((activity) => {
          const isCompleted = activity.status === 'completed';
          return (
            <li key={activity.id} className={`p-4 hover:bg-gray-50 transition-colors flex gap-4 ${isCompleted ? 'opacity-60' : ''}`}>
              <button className="flex-shrink-0 mt-1 text-gray-400 hover:text-orange-500 transition-colors">
                {isCompleted ? <CheckCircle2 className="w-6 h-6 text-orange-500" /> : <Circle className="w-6 h-6" />}
              </button>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className={`text-sm font-medium ${isCompleted ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                      {activity.description}
                    </h4>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                      <span className="flex items-center gap-1 capitalize font-medium">
                        {getIcon(activity.type)} {activity.type}
                      </span>
                      {activity.contacts && (
                        <span>• with <span className="font-medium text-gray-700">{activity.contacts.first_name} {activity.contacts.last_name}</span></span>
                      )}
                      {activity.deals && (
                        <span>• regarding <span className="font-medium text-gray-700">{activity.deals.name}</span></span>
                      )}
                    </div>
                  </div>
                  
                  {activity.due_date && (
                    <div className="flex-shrink-0 whitespace-nowrap text-xs font-medium px-2.5 py-1 rounded-md bg-gray-100 text-gray-600">
                      {new Date(activity.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                    </div>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
