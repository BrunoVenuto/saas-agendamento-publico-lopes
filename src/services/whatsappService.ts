import { Booking, Service, Professional, Tenant } from '../types';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const whatsappService = {
    sendConfirmation(booking: Booking, service: Service, professional: Professional, tenant: Tenant) {
        const dateStr = format(parseISO(booking.start_time), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR });

        const message = `Olá ${booking.client_name}! Seu agendamento para *${service.name}* na *${tenant.name}* com *${professional.name}* foi confirmado para o dia ${dateStr}. 
    
Link para localização: [ENDEREÇO_DO_ESTABELECIMENTO]
    
Caso precise desmarcar, entre em contato.`;

        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/${booking.client_whatsapp}?text=${encodedMessage}`;

        window.open(whatsappUrl, '_blank');
    },

    sendCancellation(booking: Booking, service: Service, tenant: Tenant) {
        const message = `Olá ${booking.client_name}, infelizmente seu agendamento para *${service.name}* na *${tenant.name}* precisou ser cancelado. Por favor, entre em contato para reagendar.`;

        const encodedMessage = encodeURIComponent(message);
        return `https://wa.me/${booking.client_whatsapp}?text=${encodedMessage}`;
    }
};
