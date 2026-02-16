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
    Users
} from 'lucide-react';

const SaasTenants: React.FC = () => {
    const [tenants, setTenants] = useState<(Tenant & { stats: any })[]>([]);
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
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">Carregando estabelecimentos...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTenants.map((tenant) => (
                        <div key={tenant.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                            <div className="p-6 border-b border-gray-50">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-12 h-12 rounded-lg flex items-center justify-center text-white"
                                            style={{ backgroundColor: tenant.primary_color }}
                                        >
                                            <Building2 className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900">{tenant.name}</h3>
                                            <p className="text-xs text-gray-500">/{tenant.slug}</p>
                                        </div>
                                    </div>
                                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold rounded uppercase">
                                        {tenant.niche}
                                    </span>
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
                                <a
                                    href={`/${tenant.slug}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                                >
                                    Ver Landing Page <ExternalLink className="w-3 h-3" />
                                </a>
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
