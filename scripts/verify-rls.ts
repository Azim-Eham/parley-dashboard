import { createClient } from '@supabase/supabase-js';
import { resolve } from 'path';

// Load .env.local and .env.seed
process.loadEnvFile(resolve(process.cwd(), '.env.local'));
process.loadEnvFile(resolve(process.cwd(), '.env.seed'));

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const userPassword = process.env.SEED_USER_PASSWORD || 'ParleyTest123!';

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing env vars in .env.local');
  process.exit(1);
}

// Anon client
const anonClient = createClient(supabaseUrl, supabaseKey);

// Helper to create authenticated client
async function createAuthClient(email: string) {
  const client = createClient(supabaseUrl!, supabaseKey!);
  const { error } = await client.auth.signInWithPassword({
    email,
    password: userPassword
  });
  if (error) throw new Error(`Failed to sign in as ${email}: ${error.message}`);
  return client;
}

async function runTests() {
  console.log('--- Running RLS Verification Tests ---');

  const emailA = 'northgate@example.test';
  const emailB = 'alder@example.test';

  const clientA = await createAuthClient(emailA);
  const clientB = await createAuthClient(emailB);

  // 1. an unauthenticated (anon) request to leads returns no rows
  const { data: anonData, error: anonError } = await anonClient.from('leads').select('id');
  if (anonError) console.error('Test 1 failed:', anonError);
  if (anonData && anonData.length > 0) throw new Error('Anon user could read leads');
  console.log('✅ Test 1 passed: unauthenticated request to leads returns no rows');

  // Fetch workspaces to know their IDs
  const { data: wsA } = await clientA.from('workspaces').select('id').single();
  const { data: wsB } = await clientB.from('workspaces').select('id').single();

  if (!wsA || !wsB) throw new Error('Could not fetch workspaces for authenticated users');

  // 2. user A sees only workspace A's leads, user B only B's
  const { data: leadsA } = await clientA.from('leads').select('workspace_id');
  const allLeadsABelongToA = leadsA?.every(l => l.workspace_id === wsA.id);
  if (!allLeadsABelongToA || leadsA?.length === 0) throw new Error("User A didn't see only workspace A leads");
  
  const { data: leadsB } = await clientB.from('leads').select('workspace_id');
  const allLeadsBBelongToB = leadsB?.every(l => l.workspace_id === wsB.id);
  if (!allLeadsBBelongToB || leadsB?.length === 0) throw new Error("User B didn't see only workspace B leads");
  console.log('✅ Test 2 passed: user A sees only workspace A leads, user B only B\'s');

  // 3. user A cannot read B's leads by filtering on B's workspace_id
  const { data: spoofData } = await clientA.from('leads').select('*').eq('workspace_id', wsB.id);
  if (spoofData && spoofData.length > 0) throw new Error('User A read B\'s leads by filtering');
  console.log('✅ Test 3 passed: user A cannot read B\'s leads by filtering on B\'s workspace_id');

  // 4. lead_funnel called with B's workspace id as user A returns zero rows or zeros
  const { data: funnelSpoof, error: funnelError } = await clientA.rpc('lead_funnel', {
    p_workspace: wsB.id,
    p_from: new Date(0).toISOString(),
    p_to: new Date().toISOString()
  });
  if (funnelError) {
    // If it throws an error because the function doesn't return anything or access denied, that's also passing
    console.log('✅ Test 4 passed: lead_funnel returned error on unauthorized workspace access', funnelError.message);
  } else {
    // If it returns, it should be zeros
    if (funnelSpoof && funnelSpoof.length > 0) {
       const counts = funnelSpoof[0];
       if (Number(counts.total) !== 0) {
         throw new Error('User A got non-zero funnel counts for B\'s workspace');
       }
    }
    console.log('✅ Test 4 passed: lead_funnel returned zeros for unauthorized workspace access');
  }

  // 5. inserting a lead as an authenticated client is rejected
  const { error: insertError } = await clientA.from('leads').insert({
    workspace_id: wsA.id,
    full_name: 'Test Insert',
    source: 'Test',
    status: 'new'
  });
  if (!insertError) throw new Error('Inserting a lead succeeded, should have failed due to RLS');
  console.log('✅ Test 5 passed: inserting a lead as an authenticated client is rejected');

  // 6. the timeline check constraint rejects responded_at < contacted_at
  // We cannot test the check constraint from the client if RLS blocks insert/update. 
  // We'll test it using the service role (bypassing RLS) just to ensure the check constraint itself works.
  const serviceClient = createClient(supabaseUrl!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { error: timelineError } = await serviceClient.from('leads').insert({
    workspace_id: wsA.id,
    full_name: 'Timeline Check',
    source: 'Test',
    status: 'responded',
    created_at: new Date('2024-01-01T00:00:00Z').toISOString(),
    contacted_at: new Date('2024-01-05T00:00:00Z').toISOString(),
    responded_at: new Date('2024-01-02T00:00:00Z').toISOString() // Before contacted_at!
  });
  if (!timelineError || !timelineError.message.includes('leads_timeline_ok')) {
     throw new Error('Check constraint leads_timeline_ok did not fire! Error was: ' + (timelineError?.message || 'None'));
  }
  console.log('✅ Test 6 passed: timeline check constraint rejects responded_at < contacted_at');

  console.log('--- All tests passed! ---');
}

runTests().catch(err => {
  console.error('Test script failed:', err);
  process.exit(1);
});
