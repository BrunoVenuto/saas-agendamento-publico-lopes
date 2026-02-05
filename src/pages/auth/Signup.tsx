import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';

const NICHE_COLORS: Record<string, string> = {
    SALON: '#be185d',
    CLINIC: '#00a3ff',
    PETSHOP: '#f59e0b',
    PERSONAL: '#22c55e'
};

const Signup: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [businessName, setBusinessName] = useState('');
    const [niche, setNiche] = useState('SALON');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // 1. Auth Signup
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
            });

            if (authError) throw authError;
            if (!authData.user) throw new Error('Falha ao criar usuário');

            // 2. Create Tenant
            const slug = businessName.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
            const { data: tenant, error: tenantError } = await supabase
                .from('tenants')
                .insert([{
                    name: businessName,
                    slug: slug,
                    owner_id: authData.user.id,
                    niche: niche,
                    primary_color: NICHE_COLORS[niche]
                }])
                .select()
                .single();

            if (tenantError) throw tenantError;

            // 3. Create Profile
            const { error: profileError } = await supabase
                .from('profiles')
                .insert([{
                    id: authData.user.id,
                    tenant_id: tenant.id,
                    full_name: name,
                    role: 'TENANT_ADMIN'
                }]);

            if (profileError) throw profileError;

            toast.success('Conta criada com sucesso!');
            navigate('/admin');
        } catch (error: any) {
            toast.error('Erro ao cadastrar: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Comece Agora</h1>
                    <p className="text-gray-500 mt-2">Crie sua conta no Agendify em poucos segundos</p>
                </div>

                <form onSubmit={handleSignup} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Seu Nome</label>
                        <input
                            type="text"
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ex: João Silva"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Negócio</label>
                        <input
                            type="text"
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary"
                            value={businessName}
                            onChange={(e) => setBusinessName(e.target.value)}
                            placeholder="Ex: Barbearia Estilo"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nicho do Negócio</label>
                        <select
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary bg-white"
                            value={niche}
                            onChange={(e) => setNiche(e.target.value)}
                        >
                            <option value="SALON">Salão & Barbearia</option>
                            <option value="CLINIC">Clínica & Saúde</option>
                            <option value="PETSHOP">Petshop</option>
                            <option value="PERSONAL">Personal & Coach</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="seu@email.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
                        <input
                            type="password"
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Mínimo 6 caracteres"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary text-white py-2 rounded-lg font-bold hover:bg-primary-dark transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Criando Conta...' : 'Criar Minha Conta'}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-600">
                    Já tem uma conta? <Link to="/login" className="text-primary font-bold hover:underline">Entrar</Link>
                </div>
            </div>
        </div>
    );
};

export default Signup;
