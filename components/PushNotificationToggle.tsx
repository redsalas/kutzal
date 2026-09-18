'use client';

import { usePushNotifications } from '@/hooks/usePushNotifications';

interface PushNotificationToggleProps {
  userId: string;
  role?: string;
}

export default function PushNotificationToggle({ userId, role }: PushNotificationToggleProps) {
  const { isSupported, permission, isSubscribed, loading, subscribe, unsubscribe } =
    usePushNotifications(userId);

  if (!isSupported) {
    return null;
  }

  const isAdminOrCoach = role === 'admin' || role === 'coach';

  return (
    <div className="bg-white border border-grey-200 rounded-2xl p-5 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="p-2.5 bg-olive-50 rounded-xl text-olive-700 mt-0.5">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
        </div>
        <div>
          <h3 className="font-semibold text-grey-800 text-sm sm:text-base">
            Notificaciones Push en este dispositivo
          </h3>
          <p className="text-xs sm:text-sm text-grey-500 mt-0.5">
            {isAdminOrCoach
              ? 'Recibe avisos inmediatos en tu celular o PC cuando alguien reserve, se registre, cancele o reprograme una clase.'
              : 'Recibe avisos inmediatos cuando se confirme o reprograme tu clase o se asigne un nuevo paquete.'}
          </p>
        </div>
      </div>

      <div className="w-full sm:w-auto flex justify-end">
        {permission === 'denied' ? (
          <span className="text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg font-medium">
            Bloqueadas en el navegador
          </span>
        ) : isSubscribed ? (
          <button
            onClick={() => void unsubscribe()}
            disabled={loading}
            className="w-full sm:w-auto px-4 py-2 bg-grey-100 hover:bg-grey-200 text-grey-700 text-xs sm:text-sm font-medium rounded-xl transition-colors"
          >
            {loading ? 'Procesando...' : 'Desactivar notificaciones'}
          </button>
        ) : (
          <button
            onClick={() => void subscribe()}
            disabled={loading}
            className="w-full sm:w-auto px-5 py-2.5 bg-olive-700 hover:bg-olive-800 text-white text-xs sm:text-sm font-semibold rounded-xl shadow transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            )}
            Activar notificaciones
          </button>
        )}
      </div>
    </div>
  );
}
