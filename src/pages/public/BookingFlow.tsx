import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Tenant, Service, Professional, TimeSlot } from '../../types';
import { bookingService } from '../../services/bookingService';
import { whatsappService } from '../../services/whatsappService';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Scissors, Calendar, Clock, User, CheckCircle, ChevronLeft, Activity, Dog, Dumbbell } from 'lucide-react';
import { toast } from 'sonner';

const BookingFlow: React.FC = () => {
    const { slug } = useParams();
    const [tenant, setTenant] = useState<Tenant | null>(null);
    const [services, setServices] = useState<Service[]>([]);
    const [professionals, setProfessionals] = useState<Professional[]>([]);

    const [step, setStep] = useState(1);
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [selectedProf, setSelectedProf] = useState<Professional | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
    const [slots, setSlots] = useState<TimeSlot[]>([]);
    const [clientInfo, setClientInfo] = useState({ name: '', whatsapp: '' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (slug) fetchTenantInfo();
    }, [slug]);

    useEffect(() => {
        if (tenant?.primary_color) {
            document.documentElement.style.setProperty('--primary-color', tenant.primary_color);
        }
    }, [tenant]);

    const fetchTenantInfo = async () => {
        setLoading(true);
        const { data: tenantData } = await supabase.from('tenants').select('*').eq('slug', slug).single();
        if (tenantData) {
            setTenant(tenantData);
            const { data: servicesData } = await supabase.from('services').select('*').eq('tenant_id', tenantData.id).eq('is_active', true);
            setServices(servicesData || []);
        }
        setLoading(false);
    };

    const loadProfessionals = async (serviceId: string) => {
        const { data } = await supabase
            .from('professionals')
            .select('*, professional_services!inner(service_id)')
            .eq('professional_services.service_id', serviceId)
            .eq('is_active', true);
        setProfessionals(data || []);
    };

    const loadSlots = async () => {
        if (!selectedProf || !selectedService) return;
        setLoading(true);
        try {
            const availableSlots = await bookingService.listSlots(selectedProf.id, selectedService.id, selectedDate);
            setSlots(availableSlots);
        } catch (e) {
            toast.error('Erro ao carregar horários');
        }
        setLoading(false);
    };

    useEffect(() => {
        if (step === 3) loadSlots();
    }, [step, selectedDate]);

    const handleFinish = async () => {
        if (!selectedSlot || !tenant || !selectedService || !selectedProf) return;

        setLoading(true);
        try {
            const booking = await bookingService.createBooking({
                tenant_id: tenant.id,
                service_id: selectedService.id,
                professional_id: selectedProf.id,
                client_name: clientInfo.name,
                client_whatsapp: clientInfo.whatsapp,
                start_time: selectedSlot.start.toISOString(),
                end_time: selectedSlot.end.toISOString()
            });

            toast.success('Agendamento realizado!');
            whatsappService.sendConfirmation(booking, selectedService, selectedProf, tenant);
            setStep(5); // Success state
        } catch (e) {
            toast.error('Erro ao finalizar agendamento');
        }
        setLoading(false);
    };

    const getNicheIcon = () => {
        switch (tenant?.niche) {
            case 'CLINIC': return <Activity className="w-5 h-5 text-primary" />;
            case 'PETSHOP': return <Dog className="w-5 h-5 text-primary" />;
            case 'PERSONAL': return <Dumbbell className="w-5 h-5 text-primary" />;
            default: return <Scissors className="w-5 h-5 text-primary" />;
        }
    };

    if (loading && step === 1) return <div className="flex items-center justify-center min-h-screen">Carregando...</div>;
    if (!tenant) return <div className="flex items-center justify-center min-h-screen">Estabelecimento não encontrado.</div>;

    return (
        <div className="min-h-screen bg-gray-50 pb-10">
            {/* Header */}
            <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
                <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
                    <button onClick={() => step > 1 && setStep(step - 1)} className={`${step === 1 ? 'invisible' : ''} p-2`}>
                        <ChevronLeft />
                    </button>
                    <div className="text-center">
                        <h1 className="font-bold text-gray-900">{tenant.name}</h1>
                        <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Agendamento Online</p>
                    </div>
                    <div className="w-10"></div>
                </div>
            </div>

            <main className="max-w-2xl mx-auto p-4 space-y-6">
                {/* Step Indicator */}
                <div className="flex justify-between items-center px-2">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className={`h-1 flex-1 mx-1 rounded-full ${step >= i ? 'bg-primary' : 'bg-gray-200'}`} />
                    ))}
                </div>

                {/* STEP 1: SERVICE */}
                {step === 1 && (
                    <div className="space-y-4 animate-in slide-in-from-right duration-300">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 pt-2">
                            {getNicheIcon()} Escolha o serviço
                        </h2>
                        <div className="space-y-3">
                            {services.map(s => (
                                <button
                                    key={s.id}
                                    onClick={() => { setSelectedService(s); loadProfessionals(s.id); setStep(2); }}
                                    className="w-full bg-white p-4 rounded-2xl border border-gray-100 shadow-sm text-left hover:border-primary transition-all flex justify-between items-center"
                                >
                                    <div>
                                        <h3 className="font-bold text-gray-900">{s.name}</h3>
                                        <p className="text-sm text-gray-500">{s.duration} min • {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(s.price)}</p>
                                    </div>
                                    <div className="bg-primary/5 p-2 rounded-full text-primary">
                                        <ChevronLeft className="w-5 h-5 rotate-180" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* STEP 2: PROFESSIONAL */}
                {step === 2 && (
                    <div className="space-y-4 animate-in slide-in-from-right duration-300">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 pt-2">
                            <User className="w-5 h-5 text-primary" /> Quem vai te atender?
                        </h2>
                        <div className="grid grid-cols-2 gap-4">
                            {professionals.map(p => (
                                <button
                                    key={p.id}
                                    onClick={() => { setSelectedProf(p); setStep(3); }}
                                    className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:border-primary transition-all flex flex-col items-center text-center space-y-3"
                                >
                                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-xl uppercase">
                                        {p.name.substring(0, 1)}
                                    </div>
                                    <h3 className="font-bold text-gray-900">{p.name}</h3>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* STEP 3: DATE & TIME */}
                {step === 3 && (
                    <div className="space-y-6 animate-in slide-in-from-right duration-300">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 pt-2">
                            <Calendar className="w-5 h-5 text-primary" /> Data e Horário
                        </h2>

                        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
                            {[0, 1, 2, 3, 4, 5, 6].map(i => {
                                const d = new Date();
                                d.setDate(d.getDate() + i);
                                const isSelected = format(d, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
                                return (
                                    <button
                                        key={i}
                                        onClick={() => setSelectedDate(d)}
                                        className={`flex-shrink-0 w-16 h-20 rounded-2xl flex flex-col items-center justify-center border transition-all ${isSelected ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-white text-gray-600 border-gray-100'}`}
                                    >
                                        <span className="text-[10px] uppercase font-bold opacity-75">{format(d, 'EEE', { locale: ptBR })}</span>
                                        <span className="text-xl font-bold">{format(d, 'dd')}</span>
                                    </button>
                                );
                            })}
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            {loading ? (
                                <div className="col-span-full py-10 text-center text-gray-400">Buscando horários...</div>
                            ) : slots.length === 0 ? (
                                <div className="col-span-full py-10 text-center text-gray-500">Nenhum horário disponível para esta data.</div>
                            ) : slots.map((slot, i) => (
                                <button
                                    key={i}
                                    disabled={!slot.available}
                                    onClick={() => setSelectedSlot(slot)}
                                    className={`py-3 rounded-xl border text-sm font-bold transition-all ${!slot.available ? 'bg-gray-50 text-gray-300 border-gray-100' : selectedSlot?.start === slot.start ? 'bg-primary text-white border-primary' : 'bg-white text-gray-700 border-gray-100 hover:border-primary'}`}
                                >
                                    {format(slot.start, 'HH:mm')}
                                </button>
                            ))}
                        </div>

                        {selectedSlot && (
                            <button onClick={() => setStep(4)} className="w-full bg-primary text-white py-4 rounded-2xl font-bold shadow-xl shadow-primary/20 shadow-lg animate-in fade-in slide-in-from-bottom duration-300">
                                Continuar
                            </button>
                        )}
                    </div>
                )}

                {/* STEP 4: CLIENT INFO */}
                {step === 4 && (
                    <div className="space-y-6 animate-in slide-in-from-right duration-300">
                        <h2 className="text-xl font-bold text-gray-900 pt-2">Só mais um passo...</h2>
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Seu Nome</label>
                                <input
                                    required
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="Nome Completo"
                                    value={clientInfo.name}
                                    onChange={e => setClientInfo({ ...clientInfo, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Seu WhatsApp</label>
                                <input
                                    required
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="55XXXXXXXXXXX"
                                    value={clientInfo.whatsapp}
                                    onChange={e => setClientInfo({ ...clientInfo, whatsapp: e.target.value })}
                                />
                            </div>

                            <div className="pt-4 border-t border-gray-50 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Serviço:</span>
                                    <span className="font-bold">{selectedService?.name}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Profissional:</span>
                                    <span className="font-bold">{selectedProf?.name}</span>
                                </div>
                                <div className="flex justify-between text-sm text-primary">
                                    <span className="font-medium">Data/Hora:</span>
                                    <span className="font-bold">{format(selectedSlot!.start, "dd/MM 'às' HH:mm", { locale: ptBR })}</span>
                                </div>
                            </div>

                            <button
                                disabled={!clientInfo.name || !clientInfo.whatsapp || loading}
                                onClick={handleFinish}
                                className="w-full bg-primary text-white py-4 rounded-2xl font-bold shadow-xl shadow-primary/20 disabled:opacity-50"
                            >
                                {loading ? 'Confirmando...' : 'Confirmar Agendamento'}
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 5: SUCCESS */}
                {step === 5 && (
                    <div className="flex flex-col items-center justify-center space-y-6 py-10 animate-in zoom-in duration-500">
                        <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-16 h-16" />
                        </div>
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-gray-900">Agendamento Realizado!</h2>
                            <p className="text-gray-500 mt-2">Enviamos os detalhes para o seu WhatsApp.</p>
                        </div>
                        <button onClick={() => setStep(1)} className="text-primary font-bold hover:underline">Fazer outro agendamento</button>
                    </div>
                )}
            </main>
        </div>
    );
};

export default BookingFlow;
