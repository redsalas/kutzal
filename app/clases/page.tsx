'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import HeroSection from '@/components/HeroSection';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { PACKAGE_OPTIONS, PackageOption } from '@/lib/packages';

const weekdayMorning = ['07:00', '08:00', '09:00'];
const weekdayAfternoon = ['17:00', '18:00', '19:00'];
const saturday = ['08:00', '09:00', '10:00'];

type BookingEligibility = 'first_class' | 'package' | 'none' | 'loading';

function ReserveButton({
  eligibility,
  onBuy,
}: {
  eligibility: BookingEligibility | 'unauthenticated';
  onBuy: () => void;
}) {
  if (eligibility === 'loading') {
    return (
      <button
        disabled
        className="block w-full text-center bg-grey-200 text-grey-500 py-4 rounded-2xl text-lg font-medium cursor-not-allowed"
      >
        Cargando...
      </button>
    );
  }

  if (eligibility === 'unauthenticated') {
    return (
      <Link
        href="/login?redirect=/reservar"
        className="block w-full text-center bg-olive-700 hover:bg-olive-800 text-white py-4 rounded-2xl text-lg font-medium transition-colors duration-200"
      >
        Iniciar sesión para reservar
      </Link>
    );
  }

  if (eligibility === 'first_class' || eligibility === 'package') {
    return (
      <Link
        href="/reservar"
        className="block w-full text-center bg-olive-700 hover:bg-olive-800 text-white py-4 rounded-2xl text-lg font-medium transition-colors duration-200"
      >
        {eligibility === 'first_class' ? 'Reservar clase muestra (gratis)' : 'Reservar clase'}
      </Link>
    );
  }

  // eligibility === 'none'
  return (
    <div className="space-y-3">
      <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 text-sm text-amber-800">
        Necesitas un paquete activo para reservar clases.
      </div>
      <button
        onClick={onBuy}
        className="block w-full text-center bg-olive-700 hover:bg-olive-800 text-white py-4 rounded-2xl text-lg font-medium transition-colors duration-200"
      >
        Comprar paquete
      </button>
    </div>
  );
}

export default function ClasesPage() {
  const { user, loading: authLoading } = useAuth();

  const [eligibility, setEligibility] = useState<BookingEligibility>('loading');
  const [selectedPackage, setSelectedPackage] = useState<PackageOption | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Derived: treat no user (after auth finishes loading) as unauthenticated
  const resolvedEligibility: BookingEligibility | 'unauthenticated' =
    !authLoading && !user ? 'unauthenticated' : eligibility;

  useEffect(() => {
    if (authLoading || !user) return;

    async function checkEligibility() {
      const { data, error } = await supabase
        .rpc('can_user_book', { p_user_id: user!.id });

      if (error) {
        console.error('Error checking eligibility:', error);
        setEligibility('none');
      } else {
        setEligibility(data as BookingEligibility);
      }
    }

    void checkEligibility();
  }, [user, authLoading]);

  const handleBuyPackage = async () => {
    if (!selectedPackage || !user) return;

    if (!user.email) {
      alert('No se encontró un email en tu cuenta. Contacta al soporte.');
      return;
    }

    try {
      setCheckoutLoading(true);
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageId: selectedPackage.id,
          userId: user.id,
          userEmail: user.email,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.url) {
        alert('Error al iniciar el pago. Intenta de nuevo.');
        return;
      }

      window.location.href = data.url;
    } catch (err) {
      console.error('Checkout error:', err);
      alert('Error al conectar con el procesador de pagos.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <HeroSection
        title="CLASES"
        imageSrc="/images/bg-cover-large-1.webp"
        carousel={false}
      />

      {/* Pricing + Schedule */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold tracking-widest text-olive-600 uppercase mb-3">
              Inversión
            </p>
            <h2 className="text-4xl md:text-5xl font-display italic text-grey-800">
              Precios & Horarios
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Pricing */}
            <div>
              <h3 className="text-2xl font-display text-grey-800 mb-6">Precios</h3>
              <div className="space-y-3">
                {/* Free first class */}
                <div className="flex justify-between items-center px-6 py-4 rounded-2xl border bg-olive-700 border-olive-700 text-white">
                  <span className="font-medium text-lg text-white">Clase muestra</span>
                  <span className="text-xl font-bold text-white">Gratis</span>
                </div>
                {/* Paid packages */}
                {PACKAGE_OPTIONS.map((pkg) => (
                  <div
                    key={pkg.id}
                    className="flex justify-between items-center px-6 py-4 rounded-2xl border bg-grey-50 border-grey-200 text-grey-800"
                  >
                    <span className="font-medium text-lg text-grey-800">{pkg.name}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-xl font-bold text-olive-700">{pkg.priceDisplay}</span>
                      {user && (
                        <button
                          onClick={() => {
                            setSelectedPackage(pkg);
                            setShowModal(true);
                          }}
                          className="text-sm bg-olive-700 hover:bg-olive-800 text-white px-4 py-1.5 rounded-xl transition-colors duration-200 whitespace-nowrap"
                        >
                          Comprar
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div className="mt-8 space-y-3">
                <ReserveButton eligibility={resolvedEligibility} onBuy={() => setShowModal(true)} />
                {user && (
                  <button
                    onClick={() => setShowModal(true)}
                    className="block w-full text-center border border-olive-700 text-olive-700 hover:bg-olive-50 py-4 rounded-2xl text-lg font-medium transition-colors duration-200"
                  >
                    Comprar paquete
                  </button>
                )}
              </div>
            </div>

            {/* Schedule */}
            <div>
              <h3 className="text-2xl font-display text-grey-800 mb-6">Horarios</h3>

              {/* Lunes a Viernes */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-grey-700 mb-4 pb-2 border-b border-grey-200">
                  Lunes a Viernes
                </h4>
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <p className="text-xs font-semibold tracking-widest text-olive-600 uppercase mb-3">AM</p>
                    <div className="space-y-2">
                      {weekdayMorning.map((time) => (
                        <div
                          key={time}
                          className="bg-grey-50 border border-grey-200 rounded-xl px-4 py-2 text-grey-800 font-medium text-center"
                        >
                          {time}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold tracking-widest text-olive-600 uppercase mb-3">PM</p>
                    <div className="space-y-2">
                      {weekdayAfternoon.map((time) => (
                        <div
                          key={time}
                          className="bg-grey-50 border border-grey-200 rounded-xl px-4 py-2 text-grey-800 font-medium text-center"
                        >
                          {time}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Sábado */}
              <div>
                <h4 className="text-lg font-semibold text-grey-700 mb-4 pb-2 border-b border-grey-200">
                  Sábado
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  {saturday.map((time) => (
                    <div
                      key={time}
                      className="bg-grey-50 border border-grey-200 rounded-xl px-4 py-2 text-grey-800 font-medium text-center"
                    >
                      {time}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 px-4 bg-olive-50">
        <div className="max-w-5xl mx-auto">
          <h3 className="text-3xl font-display italic text-grey-800 text-center mb-12">
            Beneficios
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Fortaleza & Core',
                desc: 'Trabaja los músculos profundos del abdomen y espalda para una base sólida y estable.',
              },
              {
                title: 'Postura & Alineación',
                desc: 'Corrige desequilibrios musculares y mejora la alineación corporal en cada movimiento.',
              },
              {
                title: 'Flexibilidad & Movilidad',
                desc: 'Aumenta el rango de movimiento articular y reduce la tensión muscular acumulada.',
              },
            ].map((b) => (
              <div
                key={b.title}
                className="bg-white rounded-2xl p-8 shadow-sm border border-grey-200 text-center"
              >
                <h4 className="text-xl font-semibold text-grey-800 mb-3">{b.title}</h4>
                <p className="text-grey-600 leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Buy Package Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-display italic text-grey-800">Comprar paquete</h2>
              <button
                onClick={() => { setShowModal(false); setSelectedPackage(null); }}
                className="text-grey-400 hover:text-grey-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {!user ? (
              <div className="text-center py-4">
                <p className="text-grey-600 mb-6">Inicia sesión para comprar un paquete.</p>
                <Link
                  href="/login?redirect=/clases"
                  className="bg-olive-700 text-white px-6 py-3 rounded-2xl font-medium hover:bg-olive-800 transition-colors"
                >
                  Iniciar sesión
                </Link>
              </div>
            ) : (
              <>
                <p className="text-grey-500 text-sm mb-6">
                  Selecciona el paquete que deseas comprar. Las clases son válidas por 1 mes a partir de la fecha de compra.
                </p>

                <div className="space-y-3 mb-6">
                  {PACKAGE_OPTIONS.map((pkg) => (
                    <button
                      key={pkg.id}
                      onClick={() => setSelectedPackage(pkg)}
                      className={`w-full flex justify-between items-center px-5 py-4 rounded-2xl border-2 transition-colors duration-150 ${
                        selectedPackage?.id === pkg.id
                          ? 'border-olive-700 bg-olive-50'
                          : 'border-grey-200 hover:border-olive-300'
                      }`}
                    >
                      <span className="font-medium text-grey-800">{pkg.name}</span>
                      <span className="font-bold text-olive-700">{pkg.priceDisplay} MXN</span>
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleBuyPackage}
                  disabled={!selectedPackage || checkoutLoading}
                  className="w-full bg-olive-700 hover:bg-olive-800 disabled:bg-grey-200 disabled:text-grey-400 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-medium text-lg transition-colors duration-200"
                >
                  {checkoutLoading ? 'Redirigiendo...' : selectedPackage ? `Pagar ${selectedPackage.priceDisplay} MXN` : 'Selecciona un paquete'}
                </button>

                <p className="text-xs text-grey-400 text-center mt-4">
                  Pago seguro procesado por Stripe. Recibirás un correo de confirmación.
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
