import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envContent = fs.readFileSync('.env.local', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) {
        const key = parts[0].trim();
        const value = parts.slice(1).join('=').trim();
        if (key && value) env[key] = value;
    }
});

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function listTenants() {
    console.log('--- AVAILABLE TENANTS ---');
    const { data: tenants, error } = await supabase.from('tenants').select('name, slug');
    if (error) console.error('Error fetching tenants:', error);
    else {
        tenants.forEach(t => {
            console.log(`- ${t.name}: ${t.slug}`);
        });
    }
}

listTenants();
