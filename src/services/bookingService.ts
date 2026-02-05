import { supabase } from '../lib/supabase';
import { Booking, TimeSlot, Service, Professional, Availability, AppointmentStatus } from '../types';
import { addMinutes, format, parseISO, startOfDay, endOfDay, isBefore, isAfter, isEqual } from 'date-fns';

export const bookingService = {
    /**
     * Lists available time slots for a professional on a specific date
     */
    async listSlots(professionalId: string, serviceId: string, date: Date): Promise<TimeSlot[]> {
        // 1. Get the service to know the duration
        const { data: service, error: serviceError } = await supabase
            .from('services')
            .select('*')
            .eq('id', serviceId)
            .single();

        if (serviceError || !service) throw new Error('Service not found');

        // 2. Get professional's availability for that day of week
        const dayOfWeek = date.getDay();
        const { data: availability, error: availError } = await supabase
            .from('availability')
            .select('*')
            .eq('professional_id', professionalId)
            .eq('day_of_week', dayOfWeek)
            .eq('is_active', true)
            .single();

        if (availError || !availability) return [];

        // 3. Get existing bookings for that professional on that date
        const dayStart = startOfDay(date).toISOString();
        const dayEnd = endOfDay(date).toISOString();

        const { data: existingBookings, error: bookingsError } = await supabase
            .from('bookings')
            .select('*')
            .eq('professional_id', professionalId)
            .neq('status', 'CANCELLED')
            .gte('start_time', dayStart)
            .lte('start_time', dayEnd);

        if (bookingsError) throw bookingsError;

        // 4. Generate slots
        const slots: TimeSlot[] = [];
        let currentSlotStart = parseISO(`${format(date, 'yyyy-MM-dd')}T${availability.start_time}`);
        const dayFinished = parseISO(`${format(date, 'yyyy-MM-dd')}T${availability.end_time}`);

        const now = new Date();

        while (isBefore(addMinutes(currentSlotStart, service.duration), dayFinished) || isEqual(addMinutes(currentSlotStart, service.duration), dayFinished)) {
            const currentSlotEnd = addMinutes(currentSlotStart, service.duration);

            // Check if slot is in the past
            const isPast = isBefore(currentSlotStart, now);

            // Check for conflicts with existing bookings
            const hasConflict = existingBookings?.some(booking => {
                const bStart = parseISO(booking.start_time);
                const bEnd = parseISO(booking.end_time);

                // Overflow check: if new slot starts during an existing booking or ends during one
                const startsDuring = (isBefore(bStart, currentSlotStart) || isEqual(bStart, currentSlotStart)) && isAfter(bEnd, currentSlotStart);
                const endsDuring = isBefore(bStart, currentSlotEnd) && (isAfter(bEnd, currentSlotEnd) || isEqual(bEnd, currentSlotEnd));
                const covers = isBefore(currentSlotStart, bStart) && isAfter(currentSlotEnd, bEnd);

                return startsDuring || endsDuring || covers;
            });

            slots.push({
                start: currentSlotStart,
                end: currentSlotEnd,
                available: !isPast && !hasConflict
            });

            // Move to next slot (we could add a 'gap' here if needed, or just step by 30 mins)
            // Standard: step by service duration or fixed 30 min intervals
            currentSlotStart = addMinutes(currentSlotStart, 30);
        }

        return slots;
    },

    /**
     * Creates a new booking
     */
    async createBooking(data: Omit<Booking, 'id' | 'status'>): Promise<Booking> {
        const { data: booking, error } = await supabase
            .from('bookings')
            .insert([{
                ...data,
                status: 'CONFIRMED'
            }])
            .select()
            .single();

        if (error) throw error;
        return booking;
    },

    /**
     * Fetches bookings for a tenant
     */
    async getTenantBookings(tenantId: string) {
        const { data, error } = await supabase
            .from('bookings')
            .select(`
        *,
        services (name),
        professionals (name)
      `)
            .eq('tenant_id', tenantId)
            .order('start_time', { ascending: true });

        if (error) throw error;
        return data;
    }
};
