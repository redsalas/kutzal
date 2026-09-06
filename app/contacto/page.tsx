'use client';

import { useState } from 'react';
import Image from 'next/image';
import LocationMap from '@/components/LocationMap';

export default function ContactoPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', comments: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || 'Error al enviar el mensaje.');
        setStatus('error');
        return;
      }

      setStatus('success');
      setForm({ name: '', email: '', phone: '', comments: '' });
    } catch {
      setErrorMsg('Error de conexión. Intenta de nuevo.');
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative h-72 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/kutzal-bg-banner.webp"
            alt="Contacto hero"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-grey-900/60" />
        </div>
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-5xl md:text-6xl font-display mb-2">Contáctanos</h1>
          <p className="text-lg text-white/80">Estamos para ayudarte</p>
        </div>
      </section>

      {/* Contact Form + Side image */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

          {/* Left — form */}
          <div>
            <h2 className="text-3xl font-display text-grey-800 mb-2">Envíanos un mensaje</h2>
            <p className="text-grey-600 mb-8">
              Completa el formulario y nos comunicaremos contigo a la brevedad.
            </p>

            {status === 'success' ? (
              <div className="bg-olive-50 border border-olive-300 rounded-2xl p-8 text-center">
                <svg className="w-12 h-12 text-olive-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <h3 className="text-xl font-semibold text-grey-800 mb-2">¡Mensaje enviado!</h3>
                <p className="text-grey-600">Gracias por contactarnos. Te responderemos pronto.</p>
                <button
                  onClick={() => setStatus('idle')}
                  className="mt-6 text-olive-600 underline text-sm"
                >
                  Enviar otro mensaje
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-grey-700 mb-1" htmlFor="name">
                    Nombre <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Tu nombre completo"
                    className="w-full border border-grey-300 rounded-xl px-4 py-3 text-grey-800 placeholder-grey-400 focus:outline-none focus:ring-2 focus:ring-olive-400"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-grey-700 mb-1" htmlFor="email">
                    Correo electrónico
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="tu@correo.com"
                    className="w-full border border-grey-300 rounded-xl px-4 py-3 text-grey-800 placeholder-grey-400 focus:outline-none focus:ring-2 focus:ring-olive-400"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-grey-700 mb-1" htmlFor="phone">
                    Teléfono
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+52 33 201 06286"
                    className="w-full border border-grey-300 rounded-xl px-4 py-3 text-grey-800 placeholder-grey-400 focus:outline-none focus:ring-2 focus:ring-olive-400"
                  />
                  <p className="text-xs text-grey-400 mt-1">Proporciona al menos correo o teléfono.</p>
                </div>

                {/* Comments */}
                <div>
                  <label className="block text-sm font-medium text-grey-700 mb-1" htmlFor="comments">
                    Mensaje <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="comments"
                    name="comments"
                    required
                    rows={5}
                    value={form.comments}
                    onChange={handleChange}
                    placeholder="¿En qué podemos ayudarte?"
                    className="w-full border border-grey-300 rounded-xl px-4 py-3 text-grey-800 placeholder-grey-400 focus:outline-none focus:ring-2 focus:ring-olive-400 resize-none"
                  />
                </div>

                {status === 'error' && (
                  <p className="text-red-500 text-sm">{errorMsg}</p>
                )}

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full bg-olive-700 hover:bg-olive-800 disabled:opacity-60 text-white font-medium py-3 rounded-full transition-colors duration-200"
                >
                  {status === 'loading' ? 'Enviando...' : 'Enviar mensaje'}
                </button>
              </form>
            )}
          </div>

          {/* Right — kutzal image */}
          <div className="relative h-[520px] rounded-[3rem] overflow-hidden shadow-lg">
            <Image
              src="/images/kutzal-bg-secondary.webp"
              alt="Kutzal studio"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-grey-900/30" />
            <div className="absolute bottom-8 left-8 right-8 text-white">
              <p className="text-lg font-semibold">Kutzal — Pilates Clásico</p>
              <p className="text-sm text-white/70">Cto. Metropolitano Sur 2242-Loc 28, Tlajomulco de Zúñiga, Jal.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Location Map */}
      <LocationMap />
    </div>
  );
}
