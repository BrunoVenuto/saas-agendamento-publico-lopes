import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envContent = fs.readFileSync('.env.local', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) env[key.trim()] = value.trim();
});

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function dumpProfs() {
    console.log('--- DUMPING ALL PROFESSIONALS ---');
    const { data: all, error } = await supabase.from('professionals').select('*');
    if (error) console.error('Error:', error);
    else console.log('All Professionals:', JSON.stringify(all, null, 2));

    const { data: allServices } = await supabase.from('services').select('*');
    console.log('All Services:', JSON.stringify(allServices, null, 2));

    const { data: allTenants } = await supabase.from('tenants').select('*');
    console.log('All Tenants:', JSON.stringify(allTenants, null, 2));
}

dumpProfs();
