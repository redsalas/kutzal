'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { format, addDays, startOfWeek, isSameDay, parseISO, differenceInHours } from 'date-fns';
import { es } from 'date-fns/locale';

type BookingEligibility = 'first_class' | 'package' | 'none' | 'loading';

interface SessionType {
  id: string;
  name: string;
  description: string;
}

interface Coach {
  id: string;
  full_name: string;
}

interface Session {
  id: string;
  date: string;
  time: string;
  duration_minutes: number;
  max_capacity: number;
  current_bookings: number;
  status: string;
  session_type_id: string;
  custom_type_name: string | null;
  coach_id: string;
  session_types: SessionType;
  profiles: Coach;
}

interface Booking {
  id: string;
  session_id: string;
  status: string;
}

export default function ReservarPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [userBookings, setUserBookings] = useState<Booking[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancellingBooking, setCancellingBooking] = useState(false);
  const [eligibility, setEligibility] = useState<BookingEligibility>('loading');

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/reservar');
    }
  }, [user, authLoading, router]);

  // Check booking eligibility
  useEffect(() => {
    if (!user) return;
    supabase
      .rpc('can_user_book', { p_user_id: user.id })
      .then(({ data, error }) => {
        if (error) {
          console.error('Eligibility check error:', error);
          setEligibility('none');
        } else {
          setEligibility(data as BookingEligibility);
        }
      });
  }, [user]);

  // Fetch sessions and user bookings
  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true);
      const startDate = format(startOfWeek(selectedDate, { weekStartsOn: 1 }), 'yyyy-MM-dd');
      const endDate = format(addDays(startOfWeek(selectedDate, { weekStartsOn: 1 }), 6), 'yyyy-MM-dd');

      const { data, error } = await supabase
        .from('sessions')
        .select(`
          *,
          session_types (id, name, description),
          profiles:coach_id (id, full_name)
        `)
        .eq('status', 'scheduled')
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: true })
        .order('time', { ascending: true });

      if (error) throw error;
      setSessions(data || []);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  const fetchUserBookings = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('id, session_id, status')
        .eq('user_id', user.id)
        .eq('status', 'confirmed');

      if (error) throw error;
      setUserBookings(data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  }, [user]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (user) {
      fetchSessions();
      fetchUserBookings();
    }
  }, [user, fetchSessions, fetchUserBookings]);

  const handleBookSession = async () => {
    if (!selectedSession || !user) return;

    try {
      setBookingLoading(true);

      // Gate: user must have eligibility to book
      if (eligibility === 'none') {
        alert('Necesitas un paquete activo para reservar clases.');
        router.push('/clases');
        return;
      }

      // Gate: session must be in the future
      const [year, month, day] = selectedSession.date.split('-').map(Number);
      const [hours, minutes] = selectedSession.time.split(':').map(Number);
      const sessionDateTime = new Date(year, month - 1, day, hours, minutes);
      if (sessionDateTime <= new Date()) {
        alert('No puedes reservar una clase que ya ocurrió.');
        setShowBookingModal(false);
        setSelectedSession(null);
        return;
      }

      // Check if session is full
      if (selectedSession.current_bookings >= selectedSession.max_capacity) {
        alert('Lo sentimos, esta sesión está llena.');
        return;
      }

      // Check if user already booked this session
      const alreadyBooked = userBookings.some(b => b.session_id === selectedSession.id);
      if (alreadyBooked) {
        alert('Ya tienes una reservación para esta sesión.');
        return;
      }

      // Create booking
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          session_id: selectedSession.id,
          user_id: user.id,
          status: 'confirmed'
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      // Consume eligibility after successful booking
      if (eligibility === 'first_class') {
        // Mark first class as taken
        await supabase
          .from('profiles')
          .update({ first_class_taken: true })
          .eq('id', user.id);
        setEligibility('none');
      } else if (eligibility === 'package') {
        // Deduct one class from active package
        await supabase.rpc('consume_class_from_package', { p_user_id: user.id });
        // Refresh eligibility in case package is now exhausted
        const { data } = await supabase.rpc('can_user_book', { p_user_id: user.id });
        if (data) setEligibility(data as BookingEligibility);
      }

      // Get user profile for email
      const { data: profile } = await supabase
        .from('profiles')
        .select('email, full_name')
        .eq('id', user.id)
        .single();

      // Send confirmation email
      if (profile?.email) {
        try {
          const emailResponse = await fetch('/api/email/reservation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: profile.email,
              reservationDetails: {
                className: selectedSession.custom_type_name || selectedSession.session_types?.name || 'Clase',
                date: format(parseISO(selectedSession.date), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es }),
                time: selectedSession.time,
                instructor: selectedSession.profiles?.full_name || 'Instructor',
                location: 'Kutzal Pilates Studio'
              }
            })
          });

          const emailResult = await emailResponse.json();
          
          if (!emailResponse.ok) {
            console.error('Error sending email:', emailResult);
            alert('¡Reservación confirmada! Sin embargo, hubo un problema al enviar el correo de confirmación. Por favor verifica tu reservación en el calendario.');
          } else {
            console.log('Email sent successfully:', emailResult);
            alert('¡Reservación confirmada! Revisa tu correo electrónico para los detalles.');
          }
        } catch (emailError) {
          console.error('Error sending confirmation email:', emailError);
          alert('¡Reservación confirmada! Sin embargo, hubo un problema al enviar el correo de confirmación.');
        }
      } else {
        alert('¡Reservación confirmada! No se pudo enviar el correo porque no hay email en tu perfil.');
      }

      setShowBookingModal(false);
      setSelectedSession(null);
      fetchSessions();
      fetchUserBookings();
    } catch (error) {
      console.error('Error booking session:', error);
      alert('Error al realizar la reservación. Por favor intenta de nuevo.');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!selectedSession || !user) return;

    try {
      setCancellingBooking(true);

      // Find the user's booking for this session
      const booking = userBookings.find(b => b.session_id === selectedSession.id);
      if (!booking) {
        alert('No se encontró la reservación.');
        return;
      }

      // Determine if this is eligible for a class refund:
      // - Must cancel at least 8 hours before the session (canCancelWithRefund)
      // - Must NOT be the free first class (user has packages = paid booking)
      const withRefund = canCancelWithRefund(selectedSession);

      const { data: packages } = await supabase
        .from('class_packages')
        .select('id')
        .eq('user_id', user.id)
        .limit(1);
      const hasPackages = packages && packages.length > 0;

      // Update booking status to cancelled
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', booking.id);

      if (error) throw error;

      // Restore class to package if applicable
      if (withRefund && hasPackages) {
        const { error: restoreError } = await supabase
          .rpc('restore_class_to_package', { p_user_id: user.id });
        if (restoreError) {
          console.error('Could not restore class to package:', restoreError);
        }
      }

      const msg = withRefund && hasPackages
        ? 'Reservación cancelada. Tu clase ha sido devuelta a tu paquete.'
        : 'Reservación cancelada.';
      alert(msg);
      setShowCancelModal(false);
      setSelectedSession(null);
      fetchSessions();
      fetchUserBookings();
    } catch (error) {
      console.error('Error cancelling booking:', error);
      alert('Error al cancelar la reservación. Por favor intenta de nuevo.');
    } finally {
      setCancellingBooking(false);
    }
  };

  const canCancelWithRefund = (session: Session): boolean => {
    const [year, month, day] = session.date.split('-').map(Number);
    const [hours, minutes] = session.time.split(':').map(Number);
    const sessionDateTime = new Date(year, month - 1, day, hours, minutes);
    const now = new Date();
    const hoursUntilSession = differenceInHours(sessionDateTime, now);
    return hoursUntilSession >= 8;
  };

  const getHoursUntilSession = (session: Session): number => {
    const [year, month, day] = session.date.split('-').map(Number);
    const [hours, minutes] = session.time.split(':').map(Number);
    const sessionDateTime = new Date(year, month - 1, day, hours, minutes);
    const now = new Date();
    return differenceInHours(sessionDateTime, now);
  };

  const getWeekDays = () => {
    const start = startOfWeek(selectedDate, { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  };

  const getSessionsForDate = (date: Date) => {
    return sessions.filter(session => 
      isSameDay(parseISO(session.date), date)
    );
  };

  const isSessionBooked = (sessionId: string) => {
    return userBookings.some(b => b.session_id === sessionId);
  };

  const getAvailableSpots = (session: Session) => {
    return session.max_capacity - session.current_bookings;
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B9D83] mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  // Block access entirely when no eligibility (after loading is done)
  if (!authLoading && user && eligibility === 'none') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-md p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Sin clases disponibles</h2>
          <p className="text-gray-600 mb-2">
            Ya usaste tu clase muestra gratuita y no tienes ningún paquete activo o con clases restantes.
          </p>
          <p className="text-gray-500 text-sm mb-8">
            Compra un paquete para seguir reservando clases.
          </p>
          <Link
            href="/clases"
            className="block w-full bg-[#8B9D83] hover:bg-[#7a8c73] text-white py-3 rounded-full font-semibold transition"
          >
            Ver paquetes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Reservar Clase</h1>
          {eligibility === 'first_class' && (
            <div className="inline-flex items-center gap-2 bg-olive-100 border border-olive-300 text-olive-800 px-5 py-2 rounded-full text-sm font-medium mb-3">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4H5z" />
              </svg>
              Estás reservando tu clase muestra gratuita
            </div>
          )}
          <p className="text-lg text-gray-600">Selecciona una sesión disponible</p>
        </div>

        {/* Week Navigation */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setSelectedDate(addDays(selectedDate, -7))}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
            >
              ← Semana Anterior
            </button>
            <h2 className="text-xl font-semibold">
              {format(startOfWeek(selectedDate, { weekStartsOn: 1 }), "d 'de' MMMM", { locale: es })} - {format(addDays(startOfWeek(selectedDate, { weekStartsOn: 1 }), 6), "d 'de' MMMM 'de' yyyy", { locale: es })}
            </h2>
            <button
              onClick={() => setSelectedDate(addDays(selectedDate, 7))}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
            >
              Semana Siguiente →
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
            {getWeekDays().map((day, index) => {
              const daySessions = getSessionsForDate(day);
              const isToday = isSameDay(day, new Date());

              return (
                <div
                  key={index}
                  className={`border rounded-lg p-4 ${isToday ? 'border-[#8B9D83] bg-[#8B9D83]/5' : 'border-gray-200'}`}
                >
                  <div className="text-center mb-3">
                    <div className="text-sm font-semibold text-gray-600 uppercase">
                      {format(day, 'EEE', { locale: es })}
                    </div>
                    <div className={`text-2xl font-bold ${isToday ? 'text-[#8B9D83]' : 'text-gray-900'}`}>
                      {format(day, 'd')}
                    </div>
                  </div>

                  {loading ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#8B9D83] mx-auto"></div>
                    </div>
                  ) : daySessions.length === 0 ? (
                    <div className="text-center py-4 text-gray-400 text-sm">
                      Sin clases
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {daySessions.map((session) => {
                        const availableSpots = getAvailableSpots(session);
                        const isFull = availableSpots <= 0;
                        const isBooked = isSessionBooked(session.id);
                        const [sy, sm, sd] = session.date.split('-').map(Number);
                        const [sh, smin] = session.time.split(':').map(Number);
                        const isPast = new Date(sy, sm - 1, sd, sh, smin) <= new Date();

                        return (
                          <button
                            key={session.id}
                            onClick={() => {
                              if (isPast) return;
                              setSelectedSession(session);
                              if (isBooked) {
                                setShowCancelModal(true);
                              } else {
                                setShowBookingModal(true);
                              }
                            }}
                            disabled={(isFull && !isBooked) || isPast}
                            className={`w-full text-left p-3 rounded-lg text-sm transition ${
                              isPast
                                ? 'bg-gray-50 text-gray-300 cursor-not-allowed'
                                : isBooked
                                ? 'bg-green-100 border-2 border-green-500 cursor-pointer hover:bg-green-200'
                                : isFull
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-white border border-gray-200 hover:border-[#8B9D83] hover:shadow-md'
                            }`}
                          >
                            <div className="font-semibold truncate">
                              {session.custom_type_name || session.session_types?.name || 'Clase'}
                            </div>
                            <div className="text-xs text-gray-600 mt-1">
                              {session.time} • {session.duration_minutes} min
                            </div>
                            <div className="text-xs mt-1">
                              {isPast ? (
                                <span className="text-gray-400">Pasada</span>
                              ) : isBooked ? (
                                <span className="text-green-600 font-semibold">✓ Reservado</span>
                              ) : isFull ? (
                                <span className="text-red-500">Lleno</span>
                              ) : (
                                <span className="text-gray-500">{availableSpots} lugares</span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="font-semibold mb-4">Leyenda</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-white border border-gray-200 rounded mr-2"></div>
              <span className="text-sm">Disponible</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-100 border-2 border-green-500 rounded mr-2"></div>
              <span className="text-sm">Tu reservación</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-gray-100 rounded mr-2"></div>
              <span className="text-sm">Lleno</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-gray-50 border border-gray-200 rounded mr-2"></div>
              <span className="text-sm text-gray-400">Pasada</span>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && selectedSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedSession.custom_type_name || selectedSession.session_types?.name || 'Clase'}
                </h2>
                <button
                  onClick={() => {
                    setShowBookingModal(false);
                    setSelectedSession(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {selectedSession.session_types?.description && (
                <p className="text-gray-600 mb-6">{selectedSession.session_types.description}</p>
              )}

              <div className="space-y-4 mb-6">
                <div className="flex items-center text-gray-700">
                  <svg className="w-5 h-5 mr-3 text-[#8B9D83]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="font-semibold mr-2">Fecha:</span>
                  {format(parseISO(selectedSession.date), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
                </div>

                <div className="flex items-center text-gray-700">
                  <svg className="w-5 h-5 mr-3 text-[#8B9D83]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-semibold mr-2">Hora:</span>
                  {selectedSession.time} • {selectedSession.duration_minutes} min
                </div>

                <div className="flex items-center text-gray-700">
                  <svg className="w-5 h-5 mr-3 text-[#8B9D83]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="font-semibold mr-2">Instructor:</span>
                  {selectedSession.profiles?.full_name || 'No asignado'}
                </div>

                <div className="flex items-center text-gray-700">
                  <svg className="w-5 h-5 mr-3 text-[#8B9D83]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span className="font-semibold mr-2">Lugares disponibles:</span>
                  {getAvailableSpots(selectedSession)} de {selectedSession.max_capacity}
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-yellow-800">
                  <strong>Tolerancia de llegada:</strong> 10 minutos. Si llegas después de ese tiempo, perderás tu lugar reservado.
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold mb-2">Reglas de la sesión</h3>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Traer calcetines y toalla para el sudor</li>
                  <li>• Traer agua</li>
                  <li>• Llegar 5 minutos antes</li>
                </ul>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold mb-2">Política de cancelación</h3>
                <p className="text-sm text-gray-600">
                  <strong>Moderada:</strong> Podrás cancelar hasta 8 horas antes del inicio de la sesión para recibir un reembolso.
                </p>
              </div>

              <button
                onClick={handleBookSession}
                disabled={bookingLoading || getAvailableSpots(selectedSession) <= 0}
                className="w-full bg-black text-white py-4 rounded-full font-semibold hover:bg-gray-800 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {bookingLoading ? 'Reservando...' : 'Reservar lugar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancellation Modal */}
      {showCancelModal && selectedSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Cancelar Reservación
                </h2>
                <button
                  onClick={() => {
                    setShowCancelModal(false);
                    setSelectedSession(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold text-lg mb-2">
                  {selectedSession.custom_type_name || selectedSession.session_types?.name || 'Clase'}
                </h3>
                <p className="text-gray-600 text-sm">
                  {format(parseISO(selectedSession.date), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })} • {selectedSession.time}
                </p>
              </div>

              {canCancelWithRefund(selectedSession) ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="text-green-800 font-semibold mb-1">
                        Cancelación con reembolso
                      </p>
                      <p className="text-green-700 text-sm">
                        Puedes cancelar esta clase y la sesión será devuelta a tu cuenta. Faltan {getHoursUntilSession(selectedSession)} horas para la clase.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div>
                      <p className="text-red-800 font-semibold mb-1">
                        Cancelación sin reembolso
                      </p>
                      <p className="text-red-700 text-sm">
                        Esta clase no podrá ser reembolsada a tus sesiones debido a la hora de la cancelación. Faltan menos de 8 horas para la clase.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <button
                  onClick={handleCancelBooking}
                  disabled={cancellingBooking}
                  className="w-full bg-red-600 text-white py-3 rounded-full font-semibold hover:bg-red-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {cancellingBooking ? 'Cancelando...' : 'Confirmar Cancelación'}
                </button>
                <button
                  onClick={() => {
                    setShowCancelModal(false);
                    setSelectedSession(null);
                  }}
                  className="w-full bg-gray-100 text-gray-700 py-3 rounded-full font-semibold hover:bg-gray-200 transition"
                >
                  Mantener Reservación
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Made with Bob
