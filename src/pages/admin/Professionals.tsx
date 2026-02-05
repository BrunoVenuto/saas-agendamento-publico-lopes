import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Professional, Service, Availability } from '../../types';
import { Plus, Pencil, Trash2, X, Clock, Users } from 'lucide-react';
import { toast } from 'sonner';

const Professionals: React.FC = () => {
    const { profile } = useAuth();
    const [professionals, setProfessionals] = useState<Professional[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAvailModalOpen, setIsAvailModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [currentProf, setCurrentProf] = useState<Partial<Professional>>({
        name: '',
        whatsapp: '',
        bio: '',
        is_active: true,
        services: []
    });
    const [availabilities, setAvailabilities] = useState<Partial<Availability>[]>([]);

    useEffect(() => {
        if (profile?.tenant_id) {
            fetchProfessionals();
            fetchServices();
        }
    }, [profile]);

    const fetchProfessionals = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('professionals')
            .select('*, professional_services(service_id)')
            .eq('tenant_id', profile!.tenant_id);

        if (error) toast.error('Erro ao buscar profissionais');
        else {
            const formatted = data.map((p: any) => ({
                ...p,
                services: p.professional_services.map((ps: any) => ps.service_id)
            }));
            setProfessionals(formatted);
        }
        setLoading(false);
    };

    const fetchServices = async () => {
        const { data } = await supabase
            .from('services')
            .select('*')
            .eq('tenant_id', profile!.tenant_id)
            .eq('is_active', true);
        setServices(data || []);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!profile?.tenant_id) {
            toast.error('Erro: Estabelecimento não identificado.');
            return;
        }

        try {
            const profData = {
                name: currentProf.name,
                whatsapp: currentProf.whatsapp,
                bio: currentProf.bio,
                is_active: currentProf.is_active,
                tenant_id: profile.tenant_id
            };

            let profId = currentProf.id;
            let error;

            if (profId) {
                const { error: err } = await supabase.from('professionals').update(profData).eq('id', profId);
                error = err;
            } else {
                const { data, error: err } = await supabase.from('professionals').insert([profData]).select().single();
                profId = data?.id;
                error = err;
            }

            if (error) {
                console.error('Supabase error:', error);
                toast.error('Erro ao salvar profissional: ' + error.message);
            } else {
                // Update services
                const { error: delError } = await supabase.from('professional_services').delete().eq('professional_id', profId);
                if (delError) console.error('Error deleting links:', delError);

                if (currentProf.services?.length) {
                    const psData = currentProf.services.map(sId => ({ professional_id: profId!, service_id: sId }));
                    const { error: insError } = await supabase.from('professional_services').insert(psData);
                    if (insError) {
                        toast.error('Profissional salvo, mas falha ao vincular serviços.');
                        console.error('Error inserting links:', insError);
                    }
                }

                if (!error) {
                    toast.success('Profissional salvo!');
                    setIsModalOpen(false);
                    fetchProfessionals();
                }
            }
        } catch (err: any) {
            console.error('Submit error:', err);
            toast.error('Ocorreu um erro inesperado ao salvar.');
        }
    };

    const openAvailability = async (prof: Professional) => {
        setCurrentProf(prof);
        const { data } = await supabase.from('availability').select('*').eq('professional_id', prof.id);
        const baseAvail = Array.from({ length: 7 }, (_, i) => {
            const existing = data?.find(d => d.day_of_week === i);
            return existing || { professional_id: prof.id, day_of_week: i, start_time: '09:00', end_time: '18:00', is_active: false };
        });
        setAvailabilities(baseAvail);
        setIsAvailModalOpen(true);
    };

    const saveAvailability = async () => {
        const toUpsert = availabilities.map(a => ({
            professional_id: currentProf.id,
            day_of_week: a.day_of_week,
            start_time: a.start_time,
            end_time: a.end_time,
            is_active: a.is_active
        }));

        const { error } = await supabase.from('availability').upsert(toUpsert, { onConflict: 'professional_id,day_of_week' });

        if (error) toast.error('Erro ao salvar horários');
        else {
            toast.success('Horários salvos!');
            setIsAvailModalOpen(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Profissionais</h1>
                    <p className="text-gray-500">Equipe e horários de atendimento.</p>
                </div>
                <button
                    onClick={() => { setCurrentProf({ name: '', whatsapp: '', services: [], is_active: true }); setIsModalOpen(true); }}
                    className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 font-bold hover:bg-primary-dark transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Novo Profissional
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full text-center py-10 text-gray-500">Carregando...</div>
                ) : professionals.length === 0 ? (
                    <div className="col-span-full text-center py-10 text-gray-500">Nenhum profissional cadastrado.</div>
                ) : professionals.map((prof) => (
                    <div key={prof.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                                <Users className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">{prof.name}</h3>
                                <p className="text-sm text-gray-500">{prof.whatsapp}</p>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-1">
                            {prof.services?.map(sId => {
                                const s = services.find(sv => sv.id === sId);
                                return s ? <span key={sId} className="px-2 py-0.5 bg-gray-100 text-[10px] font-medium rounded text-gray-600">{s.name}</span> : null;
                            })}
                        </div>

                        <div className="flex gap-2 pt-2 border-t border-gray-100">
                            <button onClick={() => openAvailability(prof)} className="flex-1 flex items-center justify-center gap-1 text-sm font-medium text-primary hover:bg-primary/5 py-2 rounded-lg transition-colors">
                                <Clock className="w-4 h-4" /> Horários
                            </button>
                            <button onClick={() => { setCurrentProf(prof); setIsModalOpen(true); }} className="p-2 text-gray-400 hover:text-blue-600 rounded-lg">
                                <Pencil className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900">{currentProf.id ? 'Editar' : 'Novo'} Profissional</h2>
                            <button onClick={() => setIsModalOpen(false)}><X className="w-6 h-6 text-gray-400" /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                                <input
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary"
                                    value={currentProf.name}
                                    onChange={e => setCurrentProf({ ...currentProf, name: e.target.value })}
                                    placeholder="Nome do profissional"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
                                <input
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary"
                                    value={currentProf.whatsapp}
                                    onChange={e => setCurrentProf({ ...currentProf, whatsapp: e.target.value })}
                                    placeholder="5511999999999"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Serviços Atendidos</label>
                                <div className="space-y-2 mt-2 max-h-40 overflow-y-auto border border-gray-100 p-2 rounded-lg">
                                    {services.map(s => (
                                        <div key={s.id} className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                id={`s-${s.id}`}
                                                checked={currentProf.services?.includes(s.id)}
                                                onChange={e => {
                                                    const next = e.target.checked
                                                        ? [...(currentProf.services || []), s.id]
                                                        : (currentProf.services || []).filter(id => id !== s.id);
                                                    setCurrentProf({ ...currentProf, services: next });
                                                }}
                                            />
                                            <label htmlFor={`s-${s.id}`} className="text-sm text-gray-600">{s.name}</label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <button className="w-full bg-primary text-white py-2 rounded-lg font-bold hover:bg-primary-dark transition-colors">Salvar</button>
                        </form>
                    </div>
                </div>
            )}

            {/* Availability Modal */}
            {isAvailModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Horários - {currentProf.name}</h2>
                            <button onClick={() => setIsAvailModalOpen(false)}><X className="w-6 h-6 text-gray-400" /></button>
                        </div>

                        <div className="space-y-4">
                            {['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'].map((day, i) => {
                                const avail = availabilities.find(a => a.day_of_week === i);
                                return (
                                    <div key={i} className="flex items-center gap-4 p-3 border border-gray-100 rounded-xl">
                                        <div className="flex items-center gap-2 w-32">
                                            <input
                                                type="checkbox"
                                                checked={avail?.is_active}
                                                onChange={e => {
                                                    const next = [...availabilities];
                                                    const idx = next.findIndex(a => a.day_of_week === i);
                                                    next[idx] = { ...next[idx], is_active: e.target.checked };
                                                    setAvailabilities(next);
                                                }}
                                            />
                                            <span className="text-sm font-medium">{day}</span>
                                        </div>
                                        {avail?.is_active && (
                                            <div className="flex items-center gap-2 flex-1">
                                                <input
                                                    type="time"
                                                    className="px-2 py-1 border rounded text-sm"
                                                    value={avail.start_time?.substring(0, 5)}
                                                    onChange={e => {
                                                        const next = [...availabilities];
                                                        const idx = next.findIndex(a => a.day_of_week === i);
                                                        next[idx] = { ...next[idx], start_time: e.target.value };
                                                        setAvailabilities(next);
                                                    }}
                                                />
                                                <span className="text-gray-400">às</span>
                                                <input
                                                    type="time"
                                                    className="px-2 py-1 border rounded text-sm"
                                                    value={avail.end_time?.substring(0, 5)}
                                                    onChange={e => {
                                                        const next = [...availabilities];
                                                        const idx = next.findIndex(a => a.day_of_week === i);
                                                        next[idx] = { ...next[idx], end_time: e.target.value };
                                                        setAvailabilities(next);
                                                    }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                            <button onClick={saveAvailability} className="w-full bg-primary text-white py-2 rounded-lg font-bold hover:bg-primary-dark transition-colors">Salvar Horários</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Professionals;
