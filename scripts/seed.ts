import { createClient } from '@supabase/supabase-js';
import { resolve } from 'path';

// Load .env.seed using Node >= 20.12 native functionality
process.loadEnvFile(resolve(process.cwd(), '.env.seed'));

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const userPassword = process.env.SEED_USER_PASSWORD || 'ParleyTest123!';

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.seed');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// A simple PRNG (Linear Congruential Generator) for reproducible randomness
let seed = 123456789;
function random() {
  seed = (seed * 9301 + 49297) % 233280;
  return seed / 233280;
}
function randomInt(min: number, max: number) {
  return Math.floor(random() * (max - min + 1)) + min;
}
function randomElement<T>(arr: T[]): T {
  return arr[randomInt(0, arr.length - 1)];
}
function randomDate(start: Date, end: Date) {
  return new Date(start.getTime() + random() * (end.getTime() - start.getTime()));
}

const firstNames = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'];
const companies = ['Acme Corp', 'Globex', 'Soylent Corp', 'Initech', 'Umbrella Corp', 'Stark Industries', 'Wayne Enterprises', 'Massive Dynamic', 'Cyberdyne', 'Hooli'];
const jobTitles = ['CEO', 'CTO', 'VP of Sales', 'Marketing Manager', 'Director of Operations', 'Founder', 'Managing Partner'];
const sources = ['Google Ads', 'LinkedIn', 'Referral', 'Organic Search', 'Outbound Email', 'Direct Mail'];

function generateLeads(workspaceId: string, count: number) {
  const leads = [];
  const now = new Date();
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

  for (let i = 0; i < count; i++) {
    const created_at = randomDate(ninetyDaysAgo, now);
    let status = 'new';
    let contacted_at = null;
    let responded_at = null;

    const r = random();
    if (r > 0.1) {
      status = 'contacted';
      contacted_at = randomDate(created_at, now);
      
      const r2 = random();
      if (r2 > 0.4) {
        status = 'not_interested';
        responded_at = randomDate(contacted_at, now);
      } else if (r2 > 0.1) {
        status = 'responded';
        responded_at = randomDate(contacted_at, now);
      } else if (r2 > 0.05) {
        status = 'booked';
        responded_at = randomDate(contacted_at, now);
      }
    }

    const firstName = randomElement(firstNames);
    const lastName = randomElement(lastNames);

    leads.push({
      workspace_id: workspaceId,
      full_name: `${firstName} ${lastName}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.test`,
      company: random() > 0.2 ? randomElement(companies) : null,
      job_title: random() > 0.3 ? randomElement(jobTitles) : null,
      source: randomElement(sources),
      status,
      created_at: created_at.toISOString(),
      contacted_at: contacted_at?.toISOString() || null,
      responded_at: responded_at?.toISOString() || null,
      last_message_preview: responded_at ? 'Thanks for reaching out, lets connect.' : null
    });
  }
  return leads;
}

async function main() {
  console.log('Starting seed...');

  const workspacesToSeed = [
    { name: 'Northgate Roofing', email: 'northgate@example.test', count: 400 },
    { name: 'Alder & Finch Dental', email: 'alder@example.test', count: 150 }
  ];

  for (const ws of workspacesToSeed) {
    // 1. Delete existing user if exists
    const { data: users, error: listUserError } = await supabase.auth.admin.listUsers();
    if (listUserError) throw listUserError;
    const existingUser = users.users.find(u => u.email === ws.email);
    if (existingUser) {
      await supabase.auth.admin.deleteUser(existingUser.id);
    }

    // 2. Delete existing workspace by name (cascades leads and members)
    await supabase.from('workspaces').delete().eq('name', ws.name);

    // 3. Create User
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: ws.email,
      password: userPassword,
      email_confirm: true
    });
    if (authError) throw authError;
    const userId = authData.user.id;
    console.log(`Created user ${ws.email} with ID ${userId}`);

    // 4. Create Workspace
    const { data: wsData, error: wsError } = await supabase.from('workspaces').insert({
      name: ws.name
    }).select().single();
    if (wsError) throw wsError;
    const workspaceId = wsData.id;
    console.log(`Created workspace ${ws.name} with ID ${workspaceId}`);

    // 5. Create Membership
    const { error: memberError } = await supabase.from('workspace_members').insert({
      workspace_id: workspaceId,
      user_id: userId
    });
    if (memberError) throw memberError;

    // 6. Insert Leads (batch in chunks of 100)
    const leads = generateLeads(workspaceId, ws.count);
    const chunkSize = 100;
    for (let i = 0; i < leads.length; i += chunkSize) {
      const chunk = leads.slice(i, i + chunkSize);
      const { error: leadsError } = await supabase.from('leads').insert(chunk);
      if (leadsError) throw leadsError;
    }
    console.log(`Inserted ${ws.count} leads for ${ws.name}`);
  }

  console.log('Seed complete!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
