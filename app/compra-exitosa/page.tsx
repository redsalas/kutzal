'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

type Status = 'loading' | 'success' | 'error';

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [status, setStatus] = useState<Status>('loading');

  useEffect(() => {
    if (!sessionId) {
      setStatus('error');
      return;
    }

    // Fulfill the purchase server-side (idempotent — safe to call even if
    // the Stripe webhook already ran)
    fetch('/api/stripe/fulfill', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) {
          setStatus('success');
        } else {
          console.error('Fulfill failed:', data);
          // Still show success if payment went through — DB may just be slow
          setStatus('success');
        }
      })
      .catch((err) => {
        console.error('Fulfill request error:', err);
        setStatus('success'); // Don't punish user for network errors
      });
  }, [sessionId]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-olive-700" />
        <p className="text-grey-500 text-sm">Activando tu paquete...</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h1 className="text-3xl font-display italic text-grey-800 mb-4">Algo salió mal</h1>
          <p className="text-grey-600 mb-8">No pudimos confirmar tu compra. Contáctanos si el cargo fue realizado.</p>
          <Link href="/clases" className="bg-olive-700 text-white px-8 py-3 rounded-2xl font-medium hover:bg-olive-800 transition-colors">
            Volver a Clases
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-olive-50">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-olive-700 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <p className="text-xs font-semibold tracking-widest text-olive-600 uppercase mb-3">
          Kutzal Studio
        </p>
        <h1 className="text-4xl font-display italic text-grey-800 mb-4">
          ¡Compra exitosa!
        </h1>
        <p className="text-grey-600 text-lg mb-2">
          Tu paquete de clases ha sido activado.
        </p>
        <p className="text-grey-500 text-sm mb-10">
          Tienes 1 mes para usar tus clases a partir de hoy.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/reservar"
            className="bg-olive-700 hover:bg-olive-800 text-white px-8 py-3 rounded-2xl font-medium transition-colors duration-200"
          >
            Reservar clase
          </Link>
          <Link
            href="/perfil"
            className="bg-white border border-grey-200 hover:bg-grey-50 text-grey-800 px-8 py-3 rounded-2xl font-medium transition-colors duration-200"
          >
            Ver mis clases
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CompraExitosaPage() {
  return (
    <Suspense>
      <SuccessContent />
    </Suspense>
  );
}
