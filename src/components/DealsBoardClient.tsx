'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { type Database } from '@/lib/supabase/database.types';

type Deal = Database['public']['Tables']['deals']['Row'];
type DealStage = Database['public']['Enums']['deal_stage'];

const STAGES: { id: DealStage; label: string; color: string }[] = [
  { id: 'discovery', label: 'Discovery', color: 'border-blue-200 bg-blue-50' },
  { id: 'proposal', label: 'Proposal', color: 'border-purple-200 bg-purple-50' },
  { id: 'negotiation', label: 'Negotiation', color: 'border-yellow-200 bg-yellow-50' },
  { id: 'closed_won', label: 'Closed Won', color: 'border-green-200 bg-green-50' },
  { id: 'closed_lost', label: 'Closed Lost', color: 'border-red-200 bg-red-50' },
];

export function DealsBoardClient({ initialDeals }: { initialDeals: Deal[] }) {
  const [deals, setDeals] = useState<Deal[]>(initialDeals);
  const [draggedDealId, setDraggedDealId] = useState<string | null>(null);
  const supabase = createClient();

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedDealId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetStage: DealStage) => {
    e.preventDefault();
    if (!draggedDealId) return;

    const deal = deals.find((d) => d.id === draggedDealId);
    if (!deal || deal.stage === targetStage) {
      setDraggedDealId(null);
      return;
    }

    // Optimistic UI update
    setDeals(deals.map((d) => (d.id === draggedDealId ? { ...d, stage: targetStage } : d)));
    setDraggedDealId(null);

    // Update in Supabase
    const { error } = await supabase
      .from('deals')
      .update({ stage: targetStage })
      .eq('id', draggedDealId);

    if (error) {
      // Revert if error
      alert('Failed to update deal stage');
      setDeals(initialDeals); 
    }
  };

  return (
    <div className="flex h-full gap-4 overflow-x-auto pb-4">
      {STAGES.map((stage) => {
        const stageDeals = deals.filter((d) => d.stage === stage.id);
        const totalValue = stageDeals.reduce((sum, deal) => sum + Number(deal.value), 0);

        return (
          <div
            key={stage.id}
            className="flex-shrink-0 w-80 bg-gray-50/50 rounded-xl flex flex-col border border-gray-200 shadow-sm"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, stage.id)}
          >
            <div className={`p-4 border-b ${stage.color} rounded-t-xl flex justify-between items-center`}>
              <h3 className="font-semibold text-gray-900">{stage.label}</h3>
              <span className="text-xs font-medium text-gray-600 bg-white/50 px-2 py-1 rounded-full">
                {stageDeals.length}
              </span>
            </div>
            
            <div className="p-3 text-xs text-gray-500 font-medium flex justify-between border-b border-gray-100 bg-white/30">
              <span>Total Value:</span>
              <span>${totalValue.toLocaleString()}</span>
            </div>

            <div className="flex-1 p-3 space-y-3 overflow-y-auto">
              {stageDeals.length === 0 ? (
                <div className="text-center p-4 border-2 border-dashed border-gray-200 rounded-lg text-gray-400 text-sm">
                  Drop deals here
                </div>
              ) : (
                stageDeals.map((deal) => (
                  <div
                    key={deal.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, deal.id)}
                    className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm cursor-grab active:cursor-grabbing hover:border-orange-300 transition-colors"
                  >
                    <div className="font-medium text-gray-900 mb-1">{deal.name}</div>
                    <div className="text-xl font-bold text-gray-700 mb-3">${Number(deal.value).toLocaleString()}</div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{deal.expected_close_date ? new Date(deal.expected_close_date).toLocaleDateString() : 'No date'}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
