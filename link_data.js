import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envContent = fs.readFileSync('.env.local', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) env[key.trim()] = value.trim();
});

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function linkData() {
    console.log('--- LINKING DATA FOR PET FELIZ ---');

    const { data: profs } = await supabase.from('professionals').select('id').eq('name', 'Xavier').single();
    const { data: services } = await supabase.from('services').select('id').eq('name', 'Banho').single();

    if (profs && services) {
        console.log(`Linking ${profs.id} to ${services.id}...`);
        const { error } = await supabase.from('professional_services').insert([{ professional_id: profs.id, service_id: services.id }]);
        if (error) {
            console.error('Link Error (likely RLS or already exists):', error);
        } else {
            console.log('✅ Linked successfully!');
        }
    } else {
        console.log('Could not find Xavier or Banho to link.');
    }
}

linkData();
