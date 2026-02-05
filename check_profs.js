import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envContent = fs.readFileSync('.env.local', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) env[key.trim()] = value.trim();
});

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function checkProfessionals() {
    console.log('--- CHECKING PROFESSIONALS AND SERVICES ---');

    // Check personal-lopes (tenant_id: 4813bf23-b4fb-426c-a3b0-7168c32a54a3)
    const tenantId = '4813bf23-b4fb-426c-a3b0-7168c32a54a3';

    const { data: profs, error: profError } = await supabase.from('professionals').select('*').eq('tenant_id', tenantId);
    console.log('Professionals for Personal Lopes:', profs);
    if (profError) console.error('Prof Error:', profError);

    const { data: services, error: serviceError } = await supabase.from('services').select('*').eq('tenant_id', tenantId);
    console.log('Services for Personal Lopes:', services);
    if (serviceError) console.error('Service Error:', serviceError);

    const { data: allProfs } = await supabase.from('professionals').select('*, tenants(name, slug)');
    console.log('All Professionals in DB:', allProfs);
}

checkProfessionals();
