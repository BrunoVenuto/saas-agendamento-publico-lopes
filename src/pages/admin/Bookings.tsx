import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { whatsappService } from '../../services/whatsappService';
import { Booking } from '../../types';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

const Bookings: React.FC = () => {
    const { profile } = useAuth();
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (profile?.tenant_id) fetchBookings();
    }, [profile]);

    const fetchBookings = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('bookings')
            .select(`
        *,
        services (name, price),
        professionals (name)
      `)
            .eq('tenant_id', profile!.tenant_id)
            .order('start_time', { ascending: false });

        if (error) toast.error('Erro ao buscar agendamentos');
        else setBookings(data || []);
        setLoading(false);
    };

    const updateStatus = async (id: string, status: string) => {
        const { error } = await supabase
            .from('bookings')
            .update({ status })
            .eq('id', id);

        if (error) {
            toast.error('Erro ao atualizar status');
        } else {
            toast.success('Status atualizado');

            // If cancelled, trigger WhatsApp message
            if (status === 'CANCELLED') {
                const booking = bookings.find(b => b.id === id);
                if (booking) {
                    const { data: tenant } = await supabase
                        .from('tenants')
                        .select('*')
                        .eq('id', profile!.tenant_id)
                        .single();

                    if (tenant) {
                        whatsappService.sendCancellation(
                            booking,
                            booking.services,
                            tenant
                        );
                    }
                }
            }

            fetchBookings();
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Agendamentos</h1>
                <p className="text-gray-500">Acompanhe todos os atendimentos marcados.</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden min-h-[400px]">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-3 text-sm font-semibold text-gray-900">Data/Hora</th>
                            <th className="px-6 py-3 text-sm font-semibold text-gray-900">Cliente</th>
                            <th className="px-6 py-3 text-sm font-semibold text-gray-900">Serviço</th>
                            <th className="px-6 py-3 text-sm font-semibold text-gray-900">Profissional</th>
                            <th className="px-6 py-3 text-sm font-semibold text-gray-900">Status</th>
                            <th className="px-6 py-3 text-sm font-semibold text-gray-900 text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {loading ? (
                            <tr><td colSpan={6} className="px-6 py-10 text-center text-gray-500">Carregando...</td></tr>
                        ) : bookings.length === 0 ? (
                            <tr><td colSpan={6} className="px-6 py-10 text-center text-gray-500">Nenhum agendamento encontrado.</td></tr>
                        ) : bookings.map((booking) => (
                            <tr key={booking.id}>
                                <td className="px-6 py-4 text-sm text-gray-900">
                                    <div className="font-medium">{format(parseISO(booking.start_time), 'dd/MM/yyyy')}</div>
                                    <div className="text-primary font-bold">{format(parseISO(booking.start_time), 'HH:mm')}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm font-medium text-gray-900">{booking.client_name}</div>
                                    <div className="text-xs text-gray-500">{booking.client_whatsapp}</div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">{booking.services?.name}</td>
                                <td className="px-6 py-4 text-sm text-gray-600 font-medium">{booking.professionals?.name}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded-full 
                    ${booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                                            booking.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                                                'bg-gray-100 text-gray-600'}`}>
                                        {booking.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right space-x-2">
                                    {booking.status === 'CONFIRMED' && (
                                        <>
                                            <button onClick={() => updateStatus(booking.id, 'COMPLETED')} className="text-xs font-bold text-green-600 hover:underline">Concluir</button>
                                            <button onClick={() => updateStatus(booking.id, 'CANCELLED')} className="text-xs font-bold text-red-600 hover:underline">Cancelar</button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Bookings;
