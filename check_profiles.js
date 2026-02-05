import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envContent = fs.readFileSync('.env.local', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) env[key.trim()] = value.trim();
});

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function checkProfiles() {
    console.log('--- CHECKING PROFILES ---');
    const { data: profiles, error } = await supabase.from('profiles').select('*');
    if (error) console.error('Error fetching profiles:', error);
    else console.log('Profiles:', profiles);
}

checkProfiles();
