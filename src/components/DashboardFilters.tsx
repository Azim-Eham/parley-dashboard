'use client';

import { useQueryState, useQueryStates } from 'nuqs';
import { dashboardParsers } from '@/lib/searchParams';

import { ChevronDown, Filter } from 'lucide-react';

export function DashboardFilters() {
  const [timeline, setTimeline] = useQueryStates(
    {
      from: dashboardParsers.from,
      to: dashboardParsers.to,
    },
    { shallow: false }
  );
  
  const [statuses, setStatuses] = useQueryState('statuses', dashboardParsers.statuses.withOptions({ shallow: false }));

  const setPreset = (preset: 'all_time' | 'last_7_days' | 'last_30_days' | 'last_90_days') => {
    if (preset === 'all_time') {
      setTimeline({ from: null, to: null });
      return;
    }

    const to = new Date();
    const from = new Date();
    
    if (preset === 'last_7_days') from.setDate(from.getDate() - 7);
    if (preset === 'last_30_days') from.setDate(from.getDate() - 30);
    if (preset === 'last_90_days') from.setDate(from.getDate() - 90);

    setTimeline({
      from: from.toISOString(),
      to: to.toISOString(),
    });
  };

  const currentPreset = () => {
    if (!timeline.from || !timeline.to) return 'all_time';
    const diffDays = Math.round((new Date(timeline.to).getTime() - new Date(timeline.from).getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 7) return 'last_7_days';
    if (diffDays === 30) return 'last_30_days';
    if (diffDays === 90) return 'last_90_days';
    return 'custom';
  };

  const preset = currentPreset();
  const activeStatuses = statuses || [];

  const timelineOptions = [
    { value: 'all_time', label: 'All Time' },
    { value: 'last_7_days', label: '7D' },
    { value: 'last_30_days', label: '30D' },
    { value: 'last_90_days', label: '90D' },
  ] as const;

  const statusOptions = ['new', 'contacted', 'responded', 'booked', 'not_interested'];

  return (
    <div className="flex items-center space-x-3">
      {/* Premium Segmented Control for Timeline */}
      <div className="flex items-center bg-gray-100/80 p-1 rounded-lg border border-gray-200/50 shadow-inner">
        {timelineOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setPreset(opt.value)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-200 ${
              preset === opt.value
                ? 'bg-white text-gray-900 shadow-sm ring-1 ring-black/5'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="w-px h-6 bg-gray-200"></div>

      {/* Premium Styled Select for Status */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <Filter className="h-3.5 w-3.5 text-gray-400 group-hover:text-orange-500 transition-colors" />
        </div>
        <select
          value={activeStatuses.length === 0 ? 'all' : activeStatuses[0]}
          onChange={(e) => {
            if (e.target.value === 'all') {
              setStatuses(null);
            } else {
              setStatuses([e.target.value]);
            }
          }}
          className="appearance-none bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg pl-9 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 hover:bg-gray-50 transition-all cursor-pointer shadow-sm capitalize"
        >
          <option value="all">All Statuses</option>
          {statusOptions.map((status) => (
            <option key={status} value={status}>
              {status.replace('_', ' ')}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
          <ChevronDown className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
        </div>
      </div>
    </div>
  );
}
