'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export function DemoDataButton({ workspaceId }: { workspaceId: string }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const supabase = createClient();

  const generateData = async () => {
    setLoading(true);
    setSuccess(false);
    
    try {
      // 1. Create Companies
      const { data: companies, error: cError } = await supabase
        .from('companies')
        .insert([
          { workspace_id: workspaceId, name: 'Acme Corp', website: 'acme.com', industry: 'Manufacturing', size: '1000-5000' },
          { workspace_id: workspaceId, name: 'Globex', website: 'globex.com', industry: 'Technology', size: '50-200' },
          { workspace_id: workspaceId, name: 'Initech', website: 'initech.com', industry: 'Software', size: '500-1000' }
        ])
        .select();
        
      if (cError) throw cError;

      // 2. Create Contacts
      const { data: contacts, error: coError } = await supabase
        .from('contacts')
        .insert([
          { workspace_id: workspaceId, first_name: 'John', last_name: 'Doe', email: 'john@acme.com', phone: '555-0100', job_title: 'CEO', company_id: companies[0].id },
          { workspace_id: workspaceId, first_name: 'Jane', last_name: 'Smith', email: 'jane@globex.com', phone: '555-0101', job_title: 'CTO', company_id: companies[1].id },
          { workspace_id: workspaceId, first_name: 'Bill', last_name: 'Lumbergh', email: 'bill@initech.com', phone: '555-0102', job_title: 'VP', company_id: companies[2].id }
        ])
        .select();

      if (coError) throw coError;

      // 3. Create Leads
      const { error: lError } = await supabase
        .from('leads')
        .insert([
          { workspace_id: workspaceId, full_name: 'Alice Johnson', company: 'Wonderland Inc', email: 'alice@wonderland.com', status: 'new', source: 'Website' },
          { workspace_id: workspaceId, full_name: 'Bob Marley', company: 'Music Co', email: 'bob@music.com', status: 'contacted', source: 'Referral' },
          { workspace_id: workspaceId, full_name: 'Charlie Brown', company: 'Peanuts LLC', email: 'charlie@peanuts.com', status: 'responded', source: 'Outbound' }
        ]);

      if (lError) throw lError;

      // 4. Create Deals
      const { data: deals, error: dError } = await supabase
        .from('deals')
        .insert([
          { workspace_id: workspaceId, name: 'Acme Q4 Enterprise License', value: 50000, stage: 'proposal', expected_close_date: new Date(Date.now() + 86400000 * 30).toISOString(), company_id: companies[0].id, contact_id: contacts[0].id },
          { workspace_id: workspaceId, name: 'Globex Cloud Migration', value: 120000, stage: 'negotiation', expected_close_date: new Date(Date.now() + 86400000 * 15).toISOString(), company_id: companies[1].id, contact_id: contacts[1].id },
          { workspace_id: workspaceId, name: 'Initech Support Contract', value: 15000, stage: 'discovery', expected_close_date: new Date(Date.now() + 86400000 * 60).toISOString(), company_id: companies[2].id, contact_id: contacts[2].id }
        ])
        .select();

      if (dError) throw dError;

      // 5. Create Activities
      const { error: aError } = await supabase
        .from('activities')
        .insert([
          { workspace_id: workspaceId, type: 'meeting', description: 'Product Demo with Acme', due_date: new Date(Date.now() + 86400000 * 2).toISOString(), status: 'pending', deal_id: deals[0].id, contact_id: contacts[0].id },
          { workspace_id: workspaceId, type: 'call', description: 'Follow up on proposal', due_date: new Date(Date.now() - 86400000 * 1).toISOString(), status: 'completed', deal_id: deals[0].id, contact_id: contacts[0].id },
          { workspace_id: workspaceId, type: 'email', description: 'Send technical specs', due_date: new Date(Date.now() + 86400000 * 1).toISOString(), status: 'pending', deal_id: deals[1].id, contact_id: contacts[1].id }
        ]);

      if (aError) throw aError;

      setSuccess(true);
      setTimeout(() => window.location.reload(), 1500);
    } catch (error: any) {
      alert('Error generating data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={generateData} 
      disabled={loading}
      className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 shadow-sm transition-colors disabled:opacity-50"
    >
      {loading ? 'Generating...' : success ? 'Success! Reloading...' : 'Generate Demo Data'}
    </button>
  );
}
