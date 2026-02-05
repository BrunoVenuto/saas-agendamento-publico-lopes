import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Service } from '../../types';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { formatPrice } from '../../utils/ui';

const Services: React.FC = () => {
    const { profile } = useAuth();
    const [services, setServices] = useState<Service[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [currentService, setCurrentService] = useState<Partial<Service>>({
        name: '',
        description: '',
        duration: 30,
        price: 0,
        is_active: true
    });

    useEffect(() => {
        if (profile?.tenant_id) fetchServices();
    }, [profile]);

    const fetchServices = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('services')
            .select('*')
            .eq('tenant_id', profile!.tenant_id)
            .order('created_at', { ascending: false });

        if (error) toast.error('Erro ao buscar serviços');
        else setServices(data || []);
        setLoading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!profile?.tenant_id) {
            toast.error('Erro: Estabelecimento não identificado. Tente fazer login novamente.');
            return;
        }

        try {
            const serviceData = {
                ...currentService,
                tenant_id: profile.tenant_id
            };

            let error;
            if (currentService.id) {
                const { error: err } = await supabase.from('services').update(serviceData).eq('id', currentService.id);
                error = err;
            } else {
                const { error: err } = await supabase.from('services').insert([serviceData]);
                error = err;
            }

            if (error) {
                console.error('Supabase error:', error);
                toast.error('Erro ao salvar serviço: ' + error.message);
            } else {
                toast.success('Serviço salvo com sucesso!');
                setIsModalOpen(false);
                fetchServices();
                setCurrentService({ name: '', description: '', duration: 30, price: 0, is_active: true });
            }
        } catch (err: any) {
            console.error('Submit error:', err);
            toast.error('Ocorreu um erro inesperado ao salvar.');
        }
    };

    const deleteService = async (id: string) => {
        if (!confirm('Deseja realmente excluir este serviço?')) return;
        const { error } = await supabase.from('services').delete().eq('id', id);
        if (error) toast.error('Erro ao excluir serviço');
        else {
            toast.success('Serviço excluído');
            fetchServices();
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Serviços</h1>
                    <p className="text-gray-500">Gerencie o catálogo de serviços do seu estabelecimento.</p>
                </div>
                <button
                    onClick={() => {
                        setCurrentService({ name: '', description: '', duration: 30, price: 0, is_active: true });
                        setIsModalOpen(true);
                    }}
                    className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 font-bold hover:bg-primary-dark transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Novo Serviço
                </button>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-3 text-sm font-semibold text-gray-900">Nome</th>
                            <th className="px-6 py-3 text-sm font-semibold text-gray-900">Duração</th>
                            <th className="px-6 py-3 text-sm font-semibold text-gray-900">Preço</th>
                            <th className="px-6 py-3 text-sm font-semibold text-gray-900">Status</th>
                            <th className="px-6 py-3 text-sm font-semibold text-gray-900 text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {loading ? (
                            <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-500">Carregando...</td></tr>
                        ) : services.length === 0 ? (
                            <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-500">Nenhum serviço cadastrado.</td></tr>
                        ) : services.map((service) => (
                            <tr key={service.id}>
                                <td className="px-6 py-4">
                                    <div className="font-medium text-gray-900">{service.name}</div>
                                    <div className="text-xs text-gray-500">{service.description}</div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">{service.duration} min</td>
                                <td className="px-6 py-4 text-sm text-gray-600">{formatPrice(service.price)}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${service.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                        {service.is_active ? 'Ativo' : 'Inativo'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button onClick={() => { setCurrentService(service); setIsModalOpen(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => deleteService(service.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg ml-1">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900">{currentService.id ? 'Editar' : 'Novo'} Serviço</h2>
                            <button onClick={() => setIsModalOpen(false)}><X className="w-6 h-6 text-gray-400" /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Serviço</label>
                                <input
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary"
                                    value={currentService.name}
                                    onChange={e => setCurrentService({ ...currentService, name: e.target.value })}
                                    placeholder="Ex: Corte de Cabelo"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                                <textarea
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary h-20"
                                    value={currentService.description}
                                    onChange={e => setCurrentService({ ...currentService, description: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Duração (min)</label>
                                    <input
                                        type="number"
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary"
                                        value={currentService.duration}
                                        onChange={e => setCurrentService({ ...currentService, duration: Number(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Preço (R$)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary"
                                        value={currentService.price}
                                        onChange={e => setCurrentService({ ...currentService, price: Number(e.target.value) })}
                                    />
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    checked={currentService.is_active}
                                    onChange={e => setCurrentService({ ...currentService, is_active: e.target.checked })}
                                />
                                <label htmlFor="is_active" className="text-sm font-medium text-gray-700">Serviço Ativo</label>
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-primary text-white py-2 rounded-lg font-bold hover:bg-primary-dark transition-colors mt-4"
                            >
                                Salvar Serviço
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Services;
