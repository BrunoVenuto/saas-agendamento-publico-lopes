import React, { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { Tenant, Subscription } from '../../../types';
import {
    DollarSign,
    Calendar,
    ArrowUpRight,
    AlertCircle,
    CheckCircle2,
    Search,
    RefreshCw,
    Building2,
    CreditCard
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TenantFinancial extends Tenant {
    subscription: Subscription;
}

const SaasFinancial: React.FC = () => {
    const [tenants, setTenants] = useState<TenantFinancial[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [stats, setStats] = useState({
        totalMRR: 0,
        activeSubs: 0,
        overdueSubs: 0
    });

    useEffect(() => {
        fetchFinancialData();
    }, []);

    const fetchFinancialData = async () => {
        try {
            setLoading(true);
            // Fetch tenants and their subscriptions
            const { data: tenantsData, error } = await supabase
                .from('tenants')
                .select(`
                    *,
                    subscriptions(*)
                `);

            if (error) throw error;

            const formattedData = tenantsData.map((t: any) => ({
                ...t,
                subscription: t.subscriptions?.[0] || null
            }));

            setTenants(formattedData);
            calculateStats(formattedData);
        } catch (error) {
            console.error('Error fetching financial data:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (data: TenantFinancial[]) => {
        const stats = data.reduce((acc, tenant) => {
            if (tenant.subscription) {
                if (tenant.subscription.status === 'ACTIVE') {
                    acc.totalMRR += Number(tenant.subscription.amount);
                    acc.activeSubs += 1;
                } else if (tenant.subscription.status === 'OVERDUE') {
                    acc.overdueSubs += 1;
                }
            }
            return acc;
        }, { totalMRR: 0, activeSubs: 0, overdueSubs: 0 });

        setStats(stats);
    };

    const updateSubscriptionStatus = async (tenantId: string, currentStatus: string) => {
        const nextStatus = currentStatus === 'ACTIVE' ? 'OVERDUE' : 'ACTIVE';
        try {
            const updates: any = { status: nextStatus };

            if (nextStatus === 'ACTIVE') {
                updates.last_payment = new Date().toISOString();
                updates.next_payment = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
            }

            const { error } = await supabase
                .from('subscriptions')
                .update(updates)
                .eq('tenant_id', tenantId);

            if (error) throw error;
            fetchFinancialData();
            toast.success(`Assinatura atualizada para ${nextStatus === 'ACTIVE' ? 'Em dia' : 'Atrasado'}`);
        } catch (error: any) {
            console.error('Error updating subscription:', error);
            toast.error(`Erro ao atualizar assinatura: ${error.message || 'Erro desconhecido'}`);
        }
    };

    const createDefaultSubscription = async (tenantId: string) => {
        try {
            const { error } = await supabase
                .from('subscriptions')
                .insert({
                    tenant_id: tenantId,
                    amount: 39.90,
                    status: 'ACTIVE',
                    last_payment: new Date().toISOString()
                });

            if (error) throw error;
            fetchFinancialData();
            toast.success('Assinatura criada com sucesso!');
        } catch (error: any) {
            console.error('Error creating subscription:', error);
            toast.error('Erro ao criar assinatura inicial.');
        }
    };

    const filteredTenants = tenants.filter(t =>
        t.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Controle Financeiro</h1>
                    <p className="text-gray-500">Gestão de assinaturas e faturamento da plataforma.</p>
                </div>

                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar empresa..."
                            className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full md:w-64"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={fetchFinancialData}
                        className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600"
                    >
                        <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-lg">
                        <ArrowUpRight className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">MRR (Recorrência Mensal)</p>
                        <p className="text-2xl font-bold text-gray-900">R$ {stats.totalMRR.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="p-3 bg-indigo-500/10 text-indigo-600 rounded-lg">
                        <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Assinaturas Ativas</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.activeSubs}</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="p-3 bg-red-500/10 text-red-600 rounded-lg">
                        <AlertCircle className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Inadimplentes</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.overdueSubs}</p>
                    </div>
                </div>
            </div>

            {/* Subscriptions Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 font-medium text-gray-500 text-sm">
                                <th className="px-6 py-4">Empresa</th>
                                <th className="px-6 py-4">Valor</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Próximo Pagto.</th>
                                <th className="px-6 py-4">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredTenants.map((tenant) => (
                                <tr key={tenant.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-[10px]"
                                                style={{ backgroundColor: tenant.primary_color }}
                                            >
                                                <Building2 className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900">{tenant.name}</p>
                                                <p className="text-xs text-gray-500">/{tenant.slug}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-medium text-gray-900">
                                            R$ {tenant.subscription?.amount?.toString() || '39,90'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {tenant.subscription ? (
                                            <span className={`px-2 py-1 text-[10px] font-bold rounded-full uppercase border ${tenant.subscription.status === 'ACTIVE'
                                                ? 'bg-green-100 text-green-700 border-green-200'
                                                : tenant.subscription.status === 'OVERDUE'
                                                    ? 'bg-red-100 text-red-700 border-red-200'
                                                    : 'bg-gray-100 text-gray-700 border-gray-200'
                                                }`}>
                                                {tenant.subscription.status === 'ACTIVE' ? 'Em dia' : 'Atrasado'}
                                            </span>
                                        ) : (
                                            <span className="px-2 py-1 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-full uppercase border border-amber-200">
                                                Sem Plano
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                            <Calendar className="w-4 h-4" />
                                            <span>
                                                {tenant.subscription?.next_payment
                                                    ? format(new Date(tenant.subscription.next_payment), 'dd/MM/yyyy')
                                                    : '-'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {tenant.subscription ? (
                                            <button
                                                onClick={() => updateSubscriptionStatus(tenant.id, tenant.subscription.status)}
                                                className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-colors ${tenant.subscription.status === 'ACTIVE'
                                                    ? 'text-red-500 border-red-200 hover:bg-red-50'
                                                    : 'text-green-600 border-green-200 hover:bg-green-50'
                                                    }`}
                                            >
                                                {tenant.subscription.status === 'ACTIVE' ? 'Marcar Atraso' : 'Marcar Pago'}
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => createDefaultSubscription(tenant.id)}
                                                className="text-xs font-bold text-indigo-600 border border-indigo-200 px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors flex items-center gap-1"
                                            >
                                                <CreditCard className="w-3 h-3" /> Iniciar Plano
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SaasFinancial;
