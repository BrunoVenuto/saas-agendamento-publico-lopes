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
    console.log('--- CHECKING PROFESSIONAL SERVICES LINKS ---');
    const { data: links, error } = await supabase.from('professional_services').select('*, professionals(name), services(name)');
    if (error) console.error('Error fetching links:', error);
    else console.log('Current Links:', JSON.stringify(links, null, 2));
}

checkLinks();
