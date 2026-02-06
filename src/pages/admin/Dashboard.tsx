import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { formatPrice } from '../../utils/ui';
import { Calendar, DollarSign, Users, Scissors } from 'lucide-react';

const Dashboard: React.FC = () => {
    const { profile } = useAuth();
    const [stats, setStats] = useState({
        totalBookings: 0,
        expectedRevenue: 0,
        activeServices: 0,
        activeProfessionals: 0
    });

    useEffect(() => {
        if (profile?.tenant_id) {
            fetchStats();
        }
    }, [profile]);

    const fetchStats = async () => {
        const tenantId = profile!.tenant_id;

        const [bookingsRes, servicesRes, professionalsRes] = await Promise.all([
            supabase.from('bookings').select('*, services(price)').eq('tenant_id', tenantId),
            supabase.from('services').select('id').eq('tenant_id', tenantId).eq('is_active', true),
            supabase.from('professionals').select('id').eq('tenant_id', tenantId).eq('is_active', true)
        ]);

        const bookings = bookingsRes.data || [];
        const revenue = bookings
            .filter((b: any) => b.status !== 'CANCELLED')
            .reduce((acc, curr: any) => acc + (Number(curr.services?.price) || 0), 0);

        setStats({
            totalBookings: bookings.length,
            expectedRevenue: revenue,
            activeServices: servicesRes.data?.length || 0,
            activeProfessionals: professionalsRes.data?.length || 0
        });
    };

    const cards = [
        { title: 'Agendamentos', value: stats.totalBookings, icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-100' },
        { title: 'Faturamento Previsto', value: formatPrice(stats.expectedRevenue), icon: DollarSign, color: 'text-green-600', bg: 'bg-green-100' },
        { title: 'Serviços Ativos', value: stats.activeServices, icon: Scissors, color: 'text-purple-600', bg: 'bg-purple-100' },
        { title: 'Profissionais', value: stats.activeProfessionals, icon: Users, color: 'text-orange-600', bg: 'bg-orange-100' },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Bem-vindo, {profile?.full_name}!</h1>
                <p className="text-gray-500">Aqui está o resumo do seu estabelecimento hoje.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((card) => (
                    <div key={card.title} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                        <div className={`${card.bg} p-3 rounded-lg`}>
                            <card.icon className={`w-6 h-6 ${card.color}`} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">{card.title}</p>
                            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Placeholder for Recent Bookings */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-lg font-bold text-gray-900">Últimos Agendamentos</h2>
                </div>
                <div className="p-6 text-center text-gray-500">
                    Nenhum agendamento recente para exibir.
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
