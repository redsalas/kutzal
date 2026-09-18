'use client';

import { useEffect, useState, useMemo } from 'react';
import { Calendar, dateFnsLocalizer, View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, addHours } from 'date-fns';
import { es } from 'date-fns/locale';
import { supabase } from '@/lib/supabase';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = {
  es: es,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface Session {
  id: string;
  session_type_id: string;
  custom_type_name: string | null;
  coach_id: string;
  date: string;
  time: string;
  duration_minutes: number;
  max_capacity: number;
  current_bookings: number;
  status: string;
  session_types: {
    name: string;
  };
  profiles: {
    full_name: string;
    email?: string;
  };
}

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: Session;
}

export default function CalendarView() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>('month');
  const [date, setDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('sessions')
        .select(`
          *,
          session_types (name),
          profiles:coach_id (full_name, email)
        `)
        .eq('status', 'scheduled')
        .order('date', { ascending: true });

      if (error) throw error;
      setSessions(data || []);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    fetchSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const events: CalendarEvent[] = useMemo(() => {
    return sessions.map((session) => {
      const [hours, minutes] = session.time.split(':').map(Number);
      // Parse date string as local time to avoid timezone shifts
      const [year, month, day] = session.date.split('-').map(Number);
      const startDate = new Date(year, month - 1, day, hours, minutes, 0, 0);

      const endDate = new Date(startDate);
      endDate.setMinutes(endDate.getMinutes() + session.duration_minutes);

      return {
        id: session.id,
        title: `${session.custom_type_name || session.session_types.name} - ${session.profiles.full_name}`,
        start: startDate,
        end: endDate,
        resource: session,
      };
    });
  }, [sessions]);

  const eventStyleGetter = (event: CalendarEvent) => {
    const session = event.resource;
    const isFull = session.current_bookings >= session.max_capacity;

    return {
      style: {
        backgroundColor: isFull ? '#dc2626' : '#8B9D83',
        borderRadius: '5px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block',
      },
    };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-olive-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-display text-grey-800">Calendario de Sesiones</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-4 h-4 bg-olive-400 rounded"></div>
            <span>Disponible</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-4 h-4 bg-red-600 rounded"></div>
            <span>Lleno</span>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-lg shadow p-6" style={{ height: '700px' }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          view={view}
          onView={setView}
          date={date}
          onNavigate={setDate}
          eventPropGetter={eventStyleGetter}
          onSelectEvent={(event) => setSelectedEvent(event)}
          messages={{
            next: 'Siguiente',
            previous: 'Anterior',
            today: 'Hoy',
            month: 'Mes',
            week: 'Semana',
            day: 'Día',
            agenda: 'Agenda',
            date: 'Fecha',
            time: 'Hora',
            event: 'Evento',
            noEventsInRange: 'No hay sesiones en este rango',
            showMore: (total) => `+ Ver más (${total})`,
          }}
          formats={{
            dayHeaderFormat: (date) => format(date, 'EEEE d', { locale: es }),
            dayRangeHeaderFormat: ({ start, end }) =>
              `${format(start, 'd MMM', { locale: es })} - ${format(end, 'd MMM', { locale: es })}`,
            monthHeaderFormat: (date) => format(date, 'MMMM yyyy', { locale: es }),
            weekdayFormat: (date) => format(date, 'EEE', { locale: es }),
          }}
        />
      </div>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onRefresh={fetchSessions}
        />
      )}
    </div>
  );
}

interface Booking {
  id: string;
  user_id: string;
  package_id?: string | null;
  status: string;
  created_at: string;
  profiles: {
    full_name: string;
    email: string;
  };
}

interface EventDetailModalProps {
  event: CalendarEvent;
  onClose: () => void;
  onRefresh: () => void;
}

function EventDetailModal({ event, onClose, onRefresh }: EventDetailModalProps) {
  const session = event.resource;
  const availableSpots = session.max_capacity - session.current_bookings;
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [availableSessions, setAvailableSessions] = useState<Session[]>([]);
  const [rescheduleSearch, setRescheduleSearch] = useState('');
  const [rescheduleDateFilter, setRescheduleDateFilter] = useState('');
  const [loadingAvailableSessions, setLoadingAvailableSessions] = useState(false);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          id,
          user_id,
          package_id,
          status,
          created_at,
          profiles:user_id (full_name, email)
        `)
        .eq('session_id', session.id)
        .eq('status', 'confirmed')
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      // Transform data to match Booking interface
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const transformedData = (data || []).map((item: any) => ({
        id: item.id,
        user_id: item.user_id,
        package_id: item.package_id,
        status: item.status,
        created_at: item.created_at,
        profiles: Array.isArray(item.profiles) ? item.profiles[0] : item.profiles
      }));
      
      setBookings(transformedData);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    fetchBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.id]);

  const fetchAvailableSessions = async () => {
    try {
      setLoadingAvailableSessions(true);
      // For admins, allow rescheduling to any upcoming session (future date & time), removing the strict 8h restriction
      const now = new Date();
      const today = format(now, 'yyyy-MM-dd');

      const [{ data: sessionData, error: sessionError }, { data: bookingCounts, error: countsError }] = await Promise.all([
        supabase
          .from('sessions')
          .select(`
            *,
            session_types (name),
            profiles:coach_id (full_name, email)
          `)
          .eq('status', 'scheduled')
          .neq('id', session.id)
          .gte('date', today)
          .order('date', { ascending: true })
          .order('time', { ascending: true }),
        supabase
          .from('bookings')
          .select('session_id')
          .eq('status', 'confirmed'),
      ]);

      if (sessionError) throw sessionError;
      if (countsError) console.error('Error fetching booking counts:', countsError);

      const countMap: Record<string, number> = {};
      for (const row of bookingCounts || []) {
        countMap[row.session_id] = (countMap[row.session_id] || 0) + 1;
      }

      // Filter to future sessions only and calculate accurate spots
      const futureSessions = (sessionData || [])
        .map((s) => ({
          ...s,
          current_bookings: countMap[s.id] ?? 0,
        }))
        .filter((s) => {
          const [year, month, day] = s.date.split('-').map(Number);
          const [hours, minutes] = s.time.split(':').map(Number);
          const sessionDateTime = new Date(year, month - 1, day, hours, minutes);
          return sessionDateTime > now && (s.current_bookings < s.max_capacity);
        });

      setAvailableSessions(futureSessions);
    } catch (error) {
      console.error('Error fetching available sessions:', error);
    } finally {
      setLoadingAvailableSessions(false);
    }
  };

  const handleCancelBooking = async (bookingId: string, userId: string, packageId?: string | null) => {
    if (!confirm('¿Estás seguro de que quieres cancelar esta reservación?')) {
      return;
    }

    try {
      // 1. Cancel the booking
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', bookingId);

      if (error) throw error;

      // 2. Restore class to the specific package if applicable
      const targetPackageId = packageId !== undefined ? packageId : null;
      if (packageId !== null) {
        const { error: restoreError } = await supabase.rpc('restore_class_to_package', {
          p_user_id: userId,
          p_package_id: targetPackageId,
        });
        if (restoreError) {
          console.error('Could not restore class to package:', restoreError);
        }
      }

      // 3. Notify Coach of cancellation
      const targetBooking = bookings.find(b => b.id === bookingId);
      if (session.profiles?.email) {
        const [year, month, day] = session.date.split('-').map(Number);
        const sessionDate = new Date(year, month - 1, day);
        try {
          await fetch('/api/email/coach-notification', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              coachEmail: session.profiles.email,
              type: 'cancellation',
              details: {
                coachName: session.profiles.full_name,
                clientName: targetBooking?.profiles.full_name || 'Usuario',
                clientEmail: targetBooking?.profiles.email || '',
                className: session.custom_type_name || session.session_types?.name || 'Clase',
                date: format(sessionDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es }),
                time: session.time,
                location: 'Kutzal Pilates Studio',
                actionBy: 'admin'
              }
            })
          });
        } catch (coachErr) {
          console.error('Error notifying coach of cancellation:', coachErr);
        }
      }

      // 4. Send Push notification to User whose booking was cancelled
      try {
        const [year, month, day] = session.date.split('-').map(Number);
        const sessionDate = new Date(year, month - 1, day);
        await fetch('/api/push/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            target: 'user',
            userId,
            payload: {
              title: 'Tu reservación ha sido cancelada',
              body: `Tu clase de ${session.custom_type_name || session.session_types?.name || 'Pilates'} del ${format(sessionDate, "d 'de' MMMM", { locale: es })} ha sido cancelada.`,
              url: '/perfil',
            },
          }),
        });
      } catch (userPushErr) {
        console.error('Error sending push to user:', userPushErr);
      }

      alert('Reservación cancelada exitosamente');
      fetchBookings();
      onRefresh();
    } catch (error) {
      console.error('Error cancelling booking:', error);
      alert('Error al cancelar la reservación');
    }
  };

  const handleReschedule = async (newSessionId: string) => {
    if (!selectedBooking) return;

    try {
      // Get the new session details for the email
      const newSession = availableSessions.find(s => s.id === newSessionId);
      if (!newSession) {
        alert('Error: No se encontró la sesión seleccionada');
        return;
      }

      // Check if user already has a DIFFERENT booking for the new session
      const { data: existingBookings, error: checkError } = await supabase
        .from('bookings')
        .select('id')
        .eq('session_id', newSessionId)
        .eq('user_id', selectedBooking.user_id)
        .eq('status', 'confirmed')
        .neq('id', selectedBooking.id); // Exclude the current booking being rescheduled

      if (checkError) {
        throw checkError;
      }

      if (existingBookings && existingBookings.length > 0) {
        alert('Este usuario ya tiene una reservación para la sesión seleccionada. Por favor elige otra sesión.');
        return;
      }

      // Update the booking to point to the new session
      const { error } = await supabase
        .from('bookings')
        .update({ session_id: newSessionId })
        .eq('id', selectedBooking.id);

      if (error) throw error;

      // Send reschedule notification email to client
      const [year, month, day] = newSession.date.split('-').map(Number);
      const sessionDate = new Date(year, month - 1, day);
      const newClassName = newSession.custom_type_name || newSession.session_types.name;
      const formattedNewDate = format(sessionDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es });
      const [prevY, prevM, prevD] = session.date.split('-').map(Number);
      const formattedPrevDate = format(new Date(prevY, prevM - 1, prevD), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es });

      try {
        await fetch('/api/email/reservation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: selectedBooking.profiles.email,
            reservationDetails: {
              className: newClassName,
              date: formattedNewDate,
              time: newSession.time,
              instructor: newSession.profiles.full_name,
              location: 'Kutzal Pilates Studio',
              isRescheduled: true,
              previousDate: formattedPrevDate,
              previousTime: session.time
            }
          })
        });
      } catch (emailError) {
        console.error('Error sending reschedule email:', emailError);
      }

      // Notify Coach of the new session
      if (newSession.profiles?.email) {
        try {
          await fetch('/api/email/coach-notification', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              coachEmail: newSession.profiles.email,
              type: 'rescheduled',
              details: {
                coachName: newSession.profiles.full_name,
                clientName: selectedBooking.profiles.full_name,
                clientEmail: selectedBooking.profiles.email,
                className: newClassName,
                date: formattedNewDate,
                time: newSession.time,
                previousDate: formattedPrevDate,
                previousTime: session.time,
                location: 'Kutzal Pilates Studio',
                actionBy: 'admin'
              }
            })
          });
        } catch (coachErr) {
          console.error('Error notifying new coach of reschedule:', coachErr);
        }
      }

      // If previous session had a different coach, notify previous coach of removal
      if (session.profiles?.email && session.profiles.email !== newSession.profiles?.email) {
        try {
          await fetch('/api/email/coach-notification', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              coachEmail: session.profiles.email,
              type: 'cancellation',
              details: {
                coachName: session.profiles.full_name,
                clientName: selectedBooking.profiles.full_name,
                clientEmail: selectedBooking.profiles.email,
                className: session.custom_type_name || session.session_types.name,
                date: formattedPrevDate,
                time: session.time,
                location: 'Kutzal Pilates Studio',
                actionBy: 'admin'
              }
            })
          });
        } catch (prevCoachErr) {
          console.error('Error notifying previous coach of cancellation:', prevCoachErr);
        }
      }

      // Send Push notification to User regarding the rescheduled class
      try {
        await fetch('/api/push/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            target: 'user',
            userId: selectedBooking.user_id,
            payload: {
              title: '🗓️ Clase Reprogramada',
              body: `Tu clase ha sido reprogramada para el ${formattedNewDate} a las ${newSession.time.slice(0, 5)} hrs.`,
              url: '/perfil',
            },
          }),
        });
      } catch (userPushErr) {
        console.error('Error sending push to rescheduled user:', userPushErr);
      }

      alert('Reservación reprogramada exitosamente. Se ha enviado un correo de confirmación al usuario.');
      setShowRescheduleModal(false);
      setSelectedBooking(null);
      fetchBookings();
      onRefresh();
    } catch (error) {
      console.error('Error rescheduling booking:', error);
      alert('Error al reprogramar la reservación');
    }
  };

  const openRescheduleModal = async (booking: Booking) => {
    setSelectedBooking(booking);
    setRescheduleSearch('');
    setRescheduleDateFilter('');
    await fetchAvailableSessions();
    setShowRescheduleModal(true);
  };

  const filteredRescheduleSessions = useMemo(() => {
    return availableSessions.filter((s) => {
      const typeName = (s.custom_type_name || s.session_types?.name || '').toLowerCase();
      const coachName = (s.profiles?.full_name || '').toLowerCase();
      const q = rescheduleSearch.toLowerCase().trim();

      const matchesQuery = !q || typeName.includes(q) || coachName.includes(q);
      const matchesDate = !rescheduleDateFilter || s.date === rescheduleDateFilter;

      return matchesQuery && matchesDate;
    });
  }, [availableSessions, rescheduleSearch, rescheduleDateFilter]);

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-display text-grey-800">Detalles de la Sesión</h3>
            <button
              onClick={onClose}
              className="text-grey-400 hover:text-grey-600 text-2xl"
            >
              ×
            </button>
          </div>

          <div className="space-y-4 mb-6">
            <div>
              <label className="text-sm font-medium text-grey-500">Tipo de Clase</label>
              <p className="text-grey-900">
                {session.custom_type_name || session.session_types.name}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-grey-500">Coach</label>
              <p className="text-grey-900">{session.profiles.full_name}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-grey-500">Fecha</label>
                <p className="text-grey-900">
                  {format(new Date(session.date), 'dd/MM/yyyy', { locale: es })}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-grey-500">Hora</label>
                <p className="text-grey-900">{session.time}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-grey-500">Duración</label>
                <p className="text-grey-900">{session.duration_minutes} minutos</p>
              </div>
              <div>
                <label className="text-sm font-medium text-grey-500">Capacidad</label>
                <p className="text-grey-900">
                  {session.current_bookings}/{session.max_capacity}
                </p>
              </div>
            </div>

            <div
              className={`p-4 rounded-lg ${
                availableSpots > 0 ? 'bg-green-50' : 'bg-red-50'
              }`}
            >
              <p
                className={`text-center font-medium ${
                  availableSpots > 0 ? 'text-green-800' : 'text-red-800'
                }`}
              >
                {availableSpots > 0
                  ? `${availableSpots} lugar${availableSpots !== 1 ? 'es' : ''} disponible${availableSpots !== 1 ? 's' : ''}`
                  : 'Sesión llena'}
              </p>
            </div>
          </div>

          {/* Enrolled Users Section */}
          <div className="border-t pt-4">
            <h4 className="font-semibold text-grey-800 mb-3">
              Usuarios Inscritos ({bookings.length})
            </h4>
            
            {loading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-olive-400 mx-auto"></div>
              </div>
            ) : bookings.length === 0 ? (
              <p className="text-grey-500 text-center py-4">No hay usuarios inscritos</p>
            ) : (
              <div className="space-y-2">
                {bookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between p-3 bg-grey-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-grey-900">{booking.profiles.full_name}</p>
                      <p className="text-sm text-grey-500">{booking.profiles.email}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openRescheduleModal(booking)}
                        className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition"
                      >
                        Reprogramar
                      </button>
                      <button
                        onClick={() => handleCancelBooking(booking.id, booking.user_id, booking.package_id)}
                        className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={onClose}
            className="w-full mt-6 bg-olive-400 hover:bg-olive-500 text-white py-2 rounded-lg transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>

      {/* Reschedule Modal */}
      {showRescheduleModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Reprogramar Reservación</h3>
              <button
                onClick={() => {
                  setShowRescheduleModal(false);
                  setSelectedBooking(null);
                }}
                className="text-grey-400 hover:text-grey-600 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Usuario:</strong> {selectedBooking.profiles.full_name}
              </p>
              <p className="text-sm text-blue-800">
                <strong>Sesión actual:</strong> {session.custom_type_name || session.session_types.name} - {format(new Date(session.date), 'dd/MM/yyyy')} {session.time}
              </p>
            </div>

            <div className="mb-4 space-y-3">
              <h4 className="font-semibold text-grey-800">Seleccionar nueva clase</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Buscar por clase o instructor..."
                  value={rescheduleSearch}
                  onChange={(e) => setRescheduleSearch(e.target.value)}
                  className="px-3 py-2 text-sm border border-grey-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-olive-500"
                />
                <input
                  type="date"
                  value={rescheduleDateFilter}
                  onChange={(e) => setRescheduleDateFilter(e.target.value)}
                  className="px-3 py-2 text-sm border border-grey-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-olive-500"
                />
              </div>
              {(rescheduleSearch || rescheduleDateFilter) && (
                <div className="flex justify-between items-center text-xs text-grey-500">
                  <span>Mostrando {filteredRescheduleSessions.length} de {availableSessions.length} clases disponibles</span>
                  <button
                    onClick={() => { setRescheduleSearch(''); setRescheduleDateFilter(''); }}
                    className="text-olive-600 hover:underline font-medium"
                  >
                    Limpiar filtros
                  </button>
                </div>
              )}
            </div>
            
            {loadingAvailableSessions ? (
              <div className="py-12 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-olive-500 mx-auto" />
                <p className="text-xs text-grey-500 mt-2">Cargando clases disponibles...</p>
              </div>
            ) : filteredRescheduleSessions.length === 0 ? (
              <p className="text-grey-500 text-center py-8 border border-dashed border-grey-200 rounded-lg">
                No se encontraron clases disponibles para reprogramar con los filtros seleccionados.
              </p>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {filteredRescheduleSessions.map((availSession) => {
                  const [y, m, d] = availSession.date.split('-').map(Number);
                  const sessionDateObj = new Date(y, m - 1, d);
                  return (
                    <button
                      key={availSession.id}
                      onClick={() => handleReschedule(availSession.id)}
                      className="w-full text-left p-3.5 border border-grey-200 rounded-xl hover:border-olive-400 hover:bg-olive-50 transition"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-grey-900">
                            {availSession.custom_type_name || availSession.session_types?.name}
                          </p>
                          <p className="text-sm text-grey-600 capitalize">
                            {format(sessionDateObj, "EEEE, d 'de' MMMM", { locale: es })}
                          </p>
                          <p className="text-xs text-grey-500 mt-0.5">
                            {availSession.time.slice(0, 5)} hrs • {availSession.duration_minutes} min • Coach: {availSession.profiles?.full_name}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="inline-block px-2.5 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            {availSession.max_capacity - availSession.current_bookings} lugares
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            <button
              onClick={() => {
                setShowRescheduleModal(false);
                setSelectedBooking(null);
              }}
              className="w-full mt-4 bg-grey-200 hover:bg-grey-300 text-grey-800 py-2 rounded-lg transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </>
  );
}


