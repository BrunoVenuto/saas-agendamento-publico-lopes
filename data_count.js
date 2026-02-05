import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envContent = fs.readFileSync('.env.local', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) env[key.trim()] = value.trim();
});

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function countAll() {
    console.log('--- DATA COUNT CHECK ---');

    // Professionals count (all)
    const { count: profCount, error: profError } = await supabase.from('professionals').select('*', { count: 'exact', head: true });
    console.log('Total Professionals (including based on RLS):', profCount);

    // Services count (all)
    const { count: svcCount, error: svcError } = await supabase.from('services').select('*', { count: 'exact', head: true });
    console.log('Total Services (including based on RLS):', svcCount);

    // Specific check for any professionals regardless of is_active
    const { data: allProfs } = await supabase.from('professionals').select('id, name, is_active, tenant_id');
    console.log('All visible professionals:', allProfs);

    // Try to see if there are any tenants that we missed
    const { data: tenants } = await supabase.from('tenants').select('id, name, slug');
    console.log('Tenants:', tenants);
}

countAll();
