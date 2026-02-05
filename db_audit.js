import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envContent = fs.readFileSync('.env.local', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) env[key.trim()] = value.trim();
});

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function audit() {
    console.log('--- DB AUDIT START ---');

    const { data: tenants } = await supabase.from('tenants').select('*');
    console.log('TENANTS:', tenants);

    const { data: profiles } = await supabase.from('profiles').select('*');
    console.log('PROFILES:', profiles);

    const { data: profs } = await supabase.from('professionals').select('*');
    console.log('PROFESSIONALS:', profs);

    const { data: svcs } = await supabase.from('services').select('*');
    console.log('SERVICES:', svcs);

    const { data: links } = await supabase.from('professional_services').select('*');
    console.log('LINKS:', links);

    const { data: avails } = await supabase.from('availability').select('*');
    console.log('AVAILABILITIES:', avails);

    console.log('--- DB AUDIT END ---');
}

audit();
