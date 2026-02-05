import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envContent = fs.readFileSync('.env.local', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) env[key.trim()] = value.trim();
});

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function checkLinks() {
    console.log('--- SYSTEM WIDE DATA CHECK ---');

    const { data: profs } = await supabase.from('professionals').select('id, name, tenant_id');
    const { data: services } = await supabase.from('services').select('id, name, tenant_id');
    const { data: links } = await supabase.from('professional_services').select('*');
    const { data: tenants } = await supabase.from('tenants').select('id, name, slug');

    console.log('Tenants:', tenants);
    console.log('Professionals:', profs);
    console.log('Services:', services);
    console.log('Links:', links);
}

checkLinks();
