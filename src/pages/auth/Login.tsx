import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            toast.error('Erro ao fazer login: ' + error.message);
        } else {
            console.log('Login success, user ID:', data.user?.id);

            // Wait a bit for auth state to propagate or fetch manually
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('role, tenant_id')
                .eq('id', data.user?.id)
                .single();

            if (profileError) {
                console.error('Error fetching profile on login:', profileError);
                toast.error('Erro ao carregar perfil. Verifique as configurações no banco.');
                navigate('/login');
            } else {
                console.log('Profile loaded:', profile);
                toast.success('Login realizado com sucesso!');

                if (profile?.role === 'SUPER_ADMIN') {
                    console.log('Redirecting to /saas-admin');
                    navigate('/saas-admin');
                } else if (profile?.tenant_id) {
                    console.log('Redirecting to /admin');
                    navigate('/admin');
                } else {
                    console.warn('User has no role/tenant, staying at login');
                    toast.error('Perfil incompleto. Entre em contato com o suporte.');
                }
            }
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Agendify</h1>
                    <p className="text-gray-500 mt-2">Entre na sua conta para gerenciar seu negócio</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
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
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary text-white py-2 rounded-lg font-bold hover:bg-primary-dark transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Entrando...' : 'Entrar'}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-600">
                    Não tem uma conta? <Link to="/signup" className="text-primary font-bold hover:underline">Cadastre-se</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
