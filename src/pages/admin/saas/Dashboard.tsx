import React, { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { Building2, Calendar, Users, TrendingUp, DollarSign } from 'lucide-react';

const SaasDashboard: React.FC = () => {
    const [stats, setStats] = useState({
        totalTenants: 0,
        totalBookings: 0,
        totalUsers: 0,
        predictedRevenue: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const [
                { count: tenantsCount },
                { count: bookingsCount },
                { count: usersCount },
                { data: bookingsData }
            ] = await Promise.all([
                supabase.from('tenants').select('*', { count: 'exact', head: true }),
                supabase.from('bookings').select('*', { count: 'exact', head: true }),
                supabase.from('profiles').select('*', { count: 'exact', head: true }),
                supabase.from('bookings').select('service_id, services(price)').eq('status', 'CONFIRMED')
            ]);

            const revenue = bookingsData?.reduce((acc, booking: any) => {
                const price = Array.isArray(booking.services)
                    ? booking.services[0]?.price
                    : booking.services?.price;
                return acc + (Number(price) || 0);
            }, 0) || 0;

            setStats({
                totalTenants: tenantsCount || 0,
                totalBookings: bookingsCount || 0,
                totalUsers: usersCount || 0,
                predictedRevenue: revenue
            });
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="flex items-center justify-center h-64">Carregando estatísticas...</div>;

    const cards = [
        { name: 'Estabelecimentos', value: stats.totalTenants, icon: Building2, color: 'bg-blue-500' },
        { name: 'Total de Agendamentos', value: stats.totalBookings, icon: Calendar, color: 'bg-indigo-500' },
        { name: 'Usuários na Plataforma', value: stats.totalUsers, icon: Users, color: 'bg-emerald-500' },
        { name: 'Receita Prevista (Total)', value: `R$ ${stats.predictedRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, icon: DollarSign, color: 'bg-amber-500' },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Visão Geral da Plataforma</h1>
                <p className="text-gray-500">Métricas consolidadas de todos os estabelecimentos.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((card) => (
                    <div key={card.name} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-4">
                            <div className={`${card.color} p-3 rounded-lg text-white`}>
                                <card.icon className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">{card.name}</p>
                                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Placeholder for charts or recent activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-indigo-500" />
                        Crescimento da Plataforma
                    </h3>
                    <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-100 rounded-lg">
                        <p className="text-gray-400">Gráfico de crescimento (Em Breve)</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold mb-4">Ações Rápidas</h3>
                    <div className="space-y-3">
                        <button className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 hover:border-indigo-500 hover:bg-indigo-50 transition-colors flex items-center justify-between group">
                            <span className="font-medium">Cadastrar Novo Estabelecimento</span>
                            <Building2 className="w-5 h-5 text-gray-400 group-hover:text-indigo-500" />
                        </button>
                        <button className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 hover:border-indigo-500 hover:bg-indigo-50 transition-colors flex items-center justify-between group">
                            <span className="font-medium">Relatório de Faturamento Mensal</span>
                            <DollarSign className="w-5 h-5 text-gray-400 group-hover:text-indigo-500" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SaasDashboard;
