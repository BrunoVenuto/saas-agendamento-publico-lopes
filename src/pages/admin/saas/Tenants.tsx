import React, { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { Tenant, Niche } from '../../../types';
import {
    Search,
    Filter,
    ExternalLink,
    Settings,
    Building2,
    Calendar,
    Users,
    Clock,
    CheckCircle2,
    XCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { format, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TenantWithStats extends Tenant {
    stats: {
        bookings: number;
        professionals: number;
    }
}

const SaasTenants: React.FC = () => {
    const [tenants, setTenants] = useState<TenantWithStats[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchTenants();
    }, []);

    const fetchTenants = async () => {
        try {
            setLoading(true);
            const { data: tenantsData, error } = await supabase
                .from('tenants')
                .select(`
                    *,
                    bookings(count),
                    professionals(count)
                `);

            if (error) throw error;

            const formattedTenants = tenantsData.map(t => ({
                ...t,
                stats: {
                    bookings: t.bookings?.[0]?.count || 0,
                    professionals: t.professionals?.[0]?.count || 0
                }
            }));

            setTenants(formattedTenants);
        } catch (error) {
            console.error('Error fetching tenants:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleTenantStatus = async (tenantId: string, currentStatus: boolean) => {
        try {
            const { error } = await supabase
                .from('tenants')
                .update({ is_active: !currentStatus })
                .eq('id', tenantId);

            if (error) throw error;

            setTenants(tenants.map(t =>
                t.id === tenantId ? { ...t, is_active: !currentStatus } : t
            ));
            toast.success(`Estabelecimento ${!currentStatus ? 'ativado' : 'desativado'} com sucesso!`);
        } catch (error: any) {
            console.error('Error updating tenant status:', error);
            toast.error(`Erro ao atualizar status: ${error.message || 'Erro desconhecido'}`);
        }
    };

    const isLate = (createdAt: string) => {
        return differenceInDays(new Date(), new Date(createdAt)) > 30;
    };

    const filteredTenants = tenants.filter(t =>
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.slug.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Estabelecimentos</h1>
                    <p className="text-gray-500">Gerencie todos os negócios cadastrados na plataforma.</p>
                </div>

                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar estabelecimento..."
                            className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full md:w-64"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <Filter className="w-5 h-5 text-gray-600" />
                    </button>
                    <button
                        onClick={fetchTenants}
                        className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600"
                        title="Atualizar"
                    >
                        <Clock className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-gray-500 font-medium">Carregando estabelecimentos...</span>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTenants.map((tenant) => (
                        <div key={tenant.id} className={`bg-white rounded-xl shadow-sm border ${tenant.is_active ? 'border-gray-100' : 'border-red-100 bg-red-50/10'} overflow-hidden hover:shadow-md transition-shadow relative`}>
                            {!tenant.is_active && (
                                <div className="absolute top-2 right-2 z-10">
                                    <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold rounded-full border border-red-200">
                                        DESATIVADO
                                    </span>
                                </div>
                            )}

                            <div className="p-6 border-b border-gray-50">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`w-12 h-12 rounded-lg flex items-center justify-center text-white ${!tenant.is_active && 'grayscale opacity-50'}`}
                                            style={{ backgroundColor: tenant.primary_color }}
                                        >
                                            <Building2 className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-bold text-gray-900">{tenant.name}</h3>
                                                {isLate(tenant.created_at) && (
                                                    <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-full border border-amber-200">
                                                        ATRASADA
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-500">/{tenant.slug}</p>
                                        </div>
                                    </div>
                                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold rounded uppercase">
                                        {tenant.niche}
                                    </span>
                                </div>
                                <div className="mt-4 flex items-center gap-2 text-[10px] text-gray-400">
                                    <Calendar className="w-3 h-3" />
                                    <span>Criado em {format(new Date(tenant.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</span>
                                </div>
                            </div>

                            <div className="p-4 grid grid-cols-2 gap-4 bg-gray-50/50">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Calendar className="w-4 h-4 text-indigo-500" />
                                    <span>{tenant.stats.bookings} Agendamentos</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Users className="w-4 h-4 text-indigo-500" />
                                    <span>{tenant.stats.professionals} Profis.</span>
                                </div>
                            </div>

                            <div className="p-4 flex items-center justify-between border-t border-gray-100">
                                <div className="flex items-center gap-4">
                                    <a
                                        href={`/${tenant.slug}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                                    >
                                        Ver Landing Page <ExternalLink className="w-3 h-3" />
                                    </a>

                                    <button
                                        onClick={() => toggleTenantStatus(tenant.id, tenant.is_active)}
                                        className={`flex items-center gap-1 text-xs font-bold transition-colors ${tenant.is_active
                                            ? 'text-red-500 hover:text-red-700'
                                            : 'text-green-600 hover:text-green-800'
                                            }`}
                                    >
                                        {tenant.is_active ? (
                                            <><XCircle className="w-3 h-3" /> Desativar</>
                                        ) : (
                                            <><CheckCircle2 className="w-3 h-3" /> Ativar</>
                                        )}
                                    </button>
                                </div>

                                <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                                    <Settings className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SaasTenants;
