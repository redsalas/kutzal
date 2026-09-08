'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

interface ClassPackage {
  id: string;
  package_name: string;
  total_classes: number;
  remaining_classes: number;
  total_cost: number;
  status: string;
  purchased_at: string;
  expires_at: string;
  stripe_checkout_session_id: string | null;
}

interface Booking {
  id: string;
  status: string;
  sessions: {
    id: string;
    date: string;
    time: string;
    duration_minutes: number;
    session_types: { name: string } | null;
    profiles: { full_name: string } | null;
  };
}

interface Profile {
  full_name: string;
  email: string;
  phone: string | null;
  date_of_birth: string | null;
  first_class_taken: boolean;
}

const statusLabel: Record<string, { label: string; cls: string }> = {
  active:    { label: 'Activo',    cls: 'bg-green-100 text-green-800' },
  expired:   { label: 'Expirado',  cls: 'bg-red-100 text-red-800' },
  exhausted: { label: 'Agotado',   cls: 'bg-grey-100 text-grey-600' },
  pending:   { label: 'Pendiente', cls: 'bg-yellow-100 text-yellow-800' },
};

export default function PerfilPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [packages, setPackages] = useState<ClassPackage[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/perfil');
    }
  }, [user, authLoading, router]);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const [profileRes, packagesRes, bookingsRes] = await Promise.all([
      supabase
        .from('profiles')
        .select('full_name, email, phone, date_of_birth, first_class_taken')
        .eq('id', user.id)
        .single(),
      supabase
        .from('class_packages')
        .select('*')
        .eq('user_id', user.id)
        .order('purchased_at', { ascending: false }),
      supabase
        .from('bookings')
        .select(`
          id, status,
          sessions (
            id, date, time, duration_minutes,
            session_types (name),
            profiles:coach_id (full_name)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20),
    ]);

    if (!profileRes.error) setProfile(profileRes.data);
    if (!packagesRes.error) setPackages(packagesRes.data || []);
    if (!bookingsRes.error) setBookings((bookingsRes.data as unknown as Booking[]) || []);

    setLoading(false);
  }, [user]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  if (authLoading || (!user && !authLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-olive-700" />
      </div>
    );
  }

  const activePackages = packages.filter(
    (p) => p.status === 'active' && p.remaining_classes > 0 && new Date(p.expires_at) > new Date()
  );
  const totalRemaining = activePackages.reduce((sum, p) => sum + p.remaining_classes, 0);

  return (
    <div className="min-h-screen bg-grey-50 py-10 px-4">
      <div className="max-w-3xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold tracking-widest text-olive-600 uppercase mb-1">Kutzal Studio</p>
            <h1 className="text-3xl font-display italic text-grey-800">Mi Perfil</h1>
          </div>
          <Link
            href="/reservar"
            className="bg-olive-700 hover:bg-olive-800 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
          >
            Reservar clase
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-olive-500" />
          </div>
        ) : (
          <>
            {/* Info card */}
            <div className="bg-white rounded-2xl border border-grey-200 p-6">
              <h2 className="text-lg font-semibold text-grey-800 mb-4">Información personal</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-grey-500 mb-0.5">Nombre</p>
                  <p className="font-medium text-grey-800">{profile?.full_name || '—'}</p>
                </div>
                <div>
                  <p className="text-grey-500 mb-0.5">Correo</p>
                  <p className="font-medium text-grey-800">{profile?.email || user?.email || '—'}</p>
                </div>
                <div>
                  <p className="text-grey-500 mb-0.5">Teléfono</p>
                  <p className="font-medium text-grey-800">{profile?.phone || '—'}</p>
                </div>
                <div>
                  <p className="text-grey-500 mb-0.5">Clase muestra</p>
                  <p className="font-medium text-grey-800">
                    {profile?.first_class_taken ? (
                      <span className="text-grey-500">Ya utilizada</span>
                    ) : (
                      <span className="text-olive-700 font-semibold">Disponible ✓</span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Class balance summary */}
            <div className="bg-olive-700 rounded-2xl p-6 text-white">
              <p className="text-olive-200 text-sm font-medium uppercase tracking-widest mb-1">Clases disponibles</p>
              <p className="text-5xl font-bold mb-1">{totalRemaining}</p>
              <p className="text-olive-300 text-sm">
                {activePackages.length === 0
                  ? 'No tienes paquetes activos'
                  : `En ${activePackages.length} paquete${activePackages.length > 1 ? 's' : ''} activo${activePackages.length > 1 ? 's' : ''}`}
              </p>
              {totalRemaining === 0 && (
                <Link
                  href="/clases"
                  className="inline-block mt-4 bg-white text-olive-700 px-5 py-2 rounded-xl text-sm font-semibold hover:bg-olive-50 transition-colors"
                >
                  Comprar paquete
                </Link>
              )}
            </div>

            {/* Packages */}
            <div className="bg-white rounded-2xl border border-grey-200 p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold text-grey-800">Mis paquetes</h2>
                <Link href="/clases" className="text-sm text-olive-700 hover:underline">
                  Comprar más →
                </Link>
              </div>

              {packages.length === 0 ? (
                <div className="text-center py-8 text-grey-500">
                  <p className="mb-4">Aún no tienes paquetes comprados.</p>
                  <Link
                    href="/clases"
                    className="bg-olive-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-olive-800 transition-colors"
                  >
                    Ver paquetes
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {packages.map((pkg) => {
                    const sl = statusLabel[pkg.status] ?? { label: pkg.status, cls: 'bg-grey-100 text-grey-600' };
                    const expDate = new Date(pkg.expires_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
                    const buyDate = new Date(pkg.purchased_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
                    const pct = Math.round((pkg.remaining_classes / pkg.total_classes) * 100);

                    return (
                      <div key={pkg.id} className="border border-grey-200 rounded-xl p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="font-semibold text-grey-800">{pkg.package_name}</p>
                            <p className="text-xs text-grey-500 mt-0.5">
                              Comprado: {buyDate} · Vence: {expDate}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${sl.cls}`}>{sl.label}</span>
                            <span className="text-sm font-bold text-grey-700">${pkg.total_cost} MXN</span>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-grey-500">
                            <span>{pkg.remaining_classes} clases restantes</span>
                            <span>{pkg.total_classes} totales</span>
                          </div>
                          <div className="w-full bg-grey-100 rounded-full h-2">
                            <div
                              className="bg-olive-500 h-2 rounded-full transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Bookings history */}
            <div className="bg-white rounded-2xl border border-grey-200 p-6">
              <h2 className="text-lg font-semibold text-grey-800 mb-5">Mis reservaciones</h2>

              {bookings.length === 0 ? (
                <div className="text-center py-8 text-grey-500">
                  <p className="mb-4">Aún no tienes reservaciones.</p>
                  <Link
                    href="/reservar"
                    className="bg-olive-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-olive-800 transition-colors"
                  >
                    Reservar ahora
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {bookings.map((booking) => {
                    const session = booking.sessions;
                    const bookingStatusCls: Record<string, string> = {
                      confirmed:  'bg-green-100 text-green-800',
                      cancelled:  'bg-red-100 text-red-800',
                      completed:  'bg-grey-100 text-grey-600',
                      no_show:    'bg-orange-100 text-orange-800',
                    };
                    const bookingStatusLabel: Record<string, string> = {
                      confirmed: 'Confirmada',
                      cancelled: 'Cancelada',
                      completed: 'Completada',
                      no_show:   'No asistió',
                    };

                    return (
                      <div key={booking.id} className="flex items-center justify-between py-3 border-b border-grey-100 last:border-0">
                        <div>
                          <p className="font-medium text-grey-800 text-sm">
                            {session?.session_types?.name || 'Clase'}
                          </p>
                          <p className="text-xs text-grey-500">
                            {session?.date
                              ? format(parseISO(session.date), "EEE d MMM yyyy", { locale: es })
                              : '—'} · {session?.time?.slice(0, 5)} · {session?.duration_minutes} min
                          </p>
                          <p className="text-xs text-grey-400">
                            {session?.profiles?.full_name || 'Instructor'}
                          </p>
                        </div>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${bookingStatusCls[booking.status] ?? 'bg-grey-100 text-grey-600'}`}>
                          {bookingStatusLabel[booking.status] ?? booking.status}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
