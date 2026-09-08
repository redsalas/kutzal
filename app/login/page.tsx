'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import HealthFormModal from '@/components/HealthFormModal';

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Health form state
  const [showHealthForm, setShowHealthForm] = useState(false);
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);

  const { signIn, signUp } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    // Validation
    if (!email || !password) {
      setError('Por favor completa todos los campos');
      setLoading(false);
      return;
    }

    if (isSignUp && !fullName.trim()) {
      setError('Por favor ingresa tu nombre completo');
      setLoading(false);
      return;
    }

    if (isSignUp && password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      setLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        const { error, userId } = await signUp(email, password, fullName);
        if (error) {
          setError(error.message || 'Error al crear la cuenta');
        } else {
          // Send welcome email
          try {
            await fetch('/api/email/welcome', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email, userName: fullName }),
            });
          } catch (emailError) {
            console.error('Failed to send welcome email:', emailError);
          }

          // Show health form before finishing registration
          if (userId) {
            // Sign in immediately so auth.uid() is available for the health form RLS insert
            await signIn(email, password);
            setPendingUserId(userId);
            setShowHealthForm(true);
          } else {
            setSuccessMessage('¡Cuenta creada! Por favor verifica tu correo electrónico.');
            resetForm();
          }
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          setError(error.message || 'Error al iniciar sesión');
        } else {
          router.push('/');
        }
      }
    } catch {
      setError('Ocurrió un error inesperado');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setFullName('');
  };

  const handleHealthFormComplete = () => {
    setShowHealthForm(false);
    setPendingUserId(null);
    resetForm();
    setSuccessMessage('¡Cuenta creada! Por favor verifica tu correo electrónico para activar tu cuenta.');
    router.push('/');
  };

  const handleHealthFormClose = () => {
    // User cancelled the health form — still show success, they can fill it later
    setShowHealthForm(false);
    setPendingUserId(null);
    resetForm();
    setSuccessMessage('¡Cuenta creada! Por favor verifica tu correo electrónico.');
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-grey-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <div className="text-4xl font-display italic text-grey-800">
              Kutzal
              <span className="block text-xs font-body not-italic tracking-wider text-grey-600">
                PILATES CLÁSICO
              </span>
            </div>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-display text-grey-800 text-center mb-6">
            {isSignUp ? 'Crear Cuenta' : 'Iniciar Sesión'}
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-grey-700 mb-1">
                  Nombre Completo
                </label>
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-2 border border-grey-300 rounded-lg focus:ring-2 focus:ring-olive-400 focus:border-transparent"
                  placeholder="Tu nombre completo"
                  required
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-grey-700 mb-1">
                Correo Electrónico
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-grey-300 rounded-lg focus:ring-2 focus:ring-olive-400 focus:border-transparent"
                placeholder="tu@email.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-grey-700 mb-1">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-grey-300 rounded-lg focus:ring-2 focus:ring-olive-400 focus:border-transparent"
                placeholder="••••••••"
                required
              />
            </div>

            {isSignUp && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-grey-700 mb-1">
                  Confirmar Contraseña
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-grey-300 rounded-lg focus:ring-2 focus:ring-olive-400 focus:border-transparent"
                  placeholder="••••••••"
                  required
                />
              </div>
            )}

            {isSignUp && (
              <p className="text-xs text-grey-500 bg-olive-50 border border-olive-200 rounded p-2">
                📋 Al crear tu cuenta se te pedirá completar un breve formulario de salud y objetivos para personalizar tu experiencia.
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-olive-400 hover:bg-olive-500 text-white py-3 rounded-lg transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Procesando...' : isSignUp ? 'Crear Cuenta' : 'Iniciar Sesión'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
                setSuccessMessage('');
              }}
              className="text-olive-600 hover:text-olive-700 text-sm font-medium"
            >
              {isSignUp
                ? '¿Ya tienes cuenta? Inicia sesión'
                : '¿No tienes cuenta? Regístrate'}
            </button>
          </div>

          <div className="mt-4 text-center">
            <Link
              href="/"
              className="text-grey-600 hover:text-grey-800 text-sm"
            >
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>

      {/* Health & Goals Form Modal */}
      {showHealthForm && pendingUserId && (
        <HealthFormModal
          userId={pendingUserId}
          onComplete={handleHealthFormComplete}
          onClose={handleHealthFormClose}
        />
      )}
    </div>
  );
}
