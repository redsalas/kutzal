'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useProfile } from '@/hooks/useProfile';

interface SessionType {
  id: string;
  name: string;
  description: string | null;
  is_custom: boolean;
}

interface Coach {
  id: string;
  full_name: string;
  email: string;
}

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
  notes: string | null;
  session_types: SessionType;
  profiles: Coach;
}

export default function SessionManagement() {
  const { profile } = useProfile();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionTypes, setSessionTypes] = useState<SessionType[]>([]);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch sessions
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('sessions')
        .select(`
          *,
          session_types (*),
          profiles (id, full_name, email)
        `)
        .order('date', { ascending: true })
        .order('time', { ascending: true });

      if (sessionsError) throw sessionsError;

      // Fetch session types
      const { data: typesData, error: typesError } = await supabase
        .from('session_types')
        .select('*')
        .order('name');

      if (typesError) throw typesError;

      // Fetch coaches (users with coach or admin role)
      const { data: coachesData, error: coachesError } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('role', ['coach', 'admin'])
        .order('full_name');

      if (coachesError) throw coachesError;

      setSessions(sessionsData || []);
      setSessionTypes(typesData || []);
      setCoaches(coachesData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDeleteSession = async (sessionId: string) => {
    if (!confirm('¿Estás seguro de eliminar esta sesión?')) return;

    try {
      const { error } = await supabase
        .from('sessions')
        .delete()
        .eq('id', sessionId);

      if (error) throw error;

      await fetchData();
      alert('Sesión eliminada exitosamente');
    } catch (error) {
      console.error('Error deleting session:', error);
      alert('Error al eliminar sesión');
    }
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
        <h2 className="text-2xl font-serif text-grey-800">Gestión de Sesiones</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-olive-400 hover:bg-olive-500 text-white px-6 py-2 rounded-lg transition-colors flex items-center gap-2"
        >
          <span className="text-xl">+</span>
          Nueva Sesión
        </button>
      </div>

      {/* Sessions List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-grey-200">
            <thead className="bg-grey-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-grey-500 uppercase tracking-wider">
                  Fecha y Hora
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-grey-500 uppercase tracking-wider">
                  Tipo de Clase
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-grey-500 uppercase tracking-wider">
                  Coach
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-grey-500 uppercase tracking-wider">
                  Duración
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-grey-500 uppercase tracking-wider">
                  Capacidad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-grey-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-grey-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-grey-200">
              {sessions.map((session) => (
                <tr key={session.id} className="hover:bg-grey-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-grey-900">
                      {new Date(session.date).toLocaleDateString('es-MX', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </div>
                    <div className="text-sm text-grey-500">{session.time}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-grey-900">
                      {session.custom_type_name || session.session_types.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-grey-500">
                    {session.profiles.full_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-grey-500">
                    {session.duration_minutes} min
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-grey-900">
                      {session.current_bookings}/{session.max_capacity}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        session.status === 'scheduled'
                          ? 'bg-green-100 text-green-800'
                          : session.status === 'cancelled'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-grey-100 text-grey-800'
                      }`}
                    >
                      {session.status === 'scheduled'
                        ? 'Programada'
                        : session.status === 'cancelled'
                        ? 'Cancelada'
                        : 'Completada'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => setEditingSession(session)}
                      className="text-olive-600 hover:text-olive-900"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeleteSession(session.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || editingSession) && (
        <SessionModal
          session={editingSession}
          sessionTypes={sessionTypes}
          coaches={coaches}
          onClose={() => {
            setShowCreateModal(false);
            setEditingSession(null);
          }}
          onSave={async () => {
            await fetchData();
            setShowCreateModal(false);
            setEditingSession(null);
          }}
        />
      )}
    </div>
  );
}

interface SessionModalProps {
  session: Session | null;
  sessionTypes: SessionType[];
  coaches: Coach[];
  onClose: () => void;
  onSave: () => void;
}

function SessionModal({ session, sessionTypes, coaches, onClose, onSave }: SessionModalProps) {
  const [formData, setFormData] = useState({
    session_type_id: session?.session_type_id || '',
    custom_type_name: session?.custom_type_name || '',
    coach_id: session?.coach_id || '',
    date: session?.date || '',
    time: session?.time || '',
    duration_minutes: session?.duration_minutes || 60,
    max_capacity: session?.max_capacity || 10,
    status: session?.status || 'scheduled',
    notes: session?.notes || '',
  });

  const selectedType = sessionTypes.find((t) => t.id === formData.session_type_id);
  const isOtherType = selectedType?.name === 'Otro';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (session) {
        // Update existing session
        const { error } = await supabase
          .from('sessions')
          .update(formData)
          .eq('id', session.id);

        if (error) throw error;
      } else {
        // Create new session
        const { error } = await supabase.from('sessions').insert([formData]);

        if (error) throw error;
      }

      alert(session ? 'Sesión actualizada' : 'Sesión creada exitosamente');
      onSave();
    } catch (error) {
      console.error('Error saving session:', error);
      alert('Error al guardar sesión');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-serif text-grey-800 mb-4">
          {session ? 'Editar Sesión' : 'Nueva Sesión'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-grey-700 mb-1">
                Tipo de Clase
              </label>
              <select
                value={formData.session_type_id}
                onChange={(e) =>
                  setFormData({ ...formData, session_type_id: e.target.value })
                }
                className="w-full px-4 py-2 border border-grey-300 rounded-lg focus:ring-2 focus:ring-olive-400 focus:border-transparent"
                required
              >
                <option value="">Seleccionar...</option>
                {sessionTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>

            {isOtherType && (
              <div>
                <label className="block text-sm font-medium text-grey-700 mb-1">
                  Nombre Personalizado
                </label>
                <input
                  type="text"
                  value={formData.custom_type_name}
                  onChange={(e) =>
                    setFormData({ ...formData, custom_type_name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-grey-300 rounded-lg focus:ring-2 focus:ring-olive-400 focus:border-transparent"
                  required={isOtherType}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-grey-700 mb-1">Coach</label>
              <select
                value={formData.coach_id}
                onChange={(e) => setFormData({ ...formData, coach_id: e.target.value })}
                className="w-full px-4 py-2 border border-grey-300 rounded-lg focus:ring-2 focus:ring-olive-400 focus:border-transparent"
                required
              >
                <option value="">Seleccionar...</option>
                {coaches.map((coach) => (
                  <option key={coach.id} value={coach.id}>
                    {coach.full_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-grey-700 mb-1">Fecha</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-2 border border-grey-300 rounded-lg focus:ring-2 focus:ring-olive-400 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-grey-700 mb-1">Hora</label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="w-full px-4 py-2 border border-grey-300 rounded-lg focus:ring-2 focus:ring-olive-400 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-grey-700 mb-1">
                Duración
              </label>
              <select
                value={formData.duration_minutes}
                onChange={(e) =>
                  setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })
                }
                className="w-full px-4 py-2 border border-grey-300 rounded-lg focus:ring-2 focus:ring-olive-400 focus:border-transparent"
                required
              >
                <option value={60}>1 hora</option>
                <option value={90}>1.5 horas</option>
                <option value={120}>2 horas</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-grey-700 mb-1">
                Capacidad
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={formData.max_capacity}
                onChange={(e) =>
                  setFormData({ ...formData, max_capacity: parseInt(e.target.value) })
                }
                className="w-full px-4 py-2 border border-grey-300 rounded-lg focus:ring-2 focus:ring-olive-400 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-grey-700 mb-1">Estado</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-2 border border-grey-300 rounded-lg focus:ring-2 focus:ring-olive-400 focus:border-transparent"
                required
              >
                <option value="scheduled">Programada</option>
                <option value="cancelled">Cancelada</option>
                <option value="completed">Completada</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-grey-700 mb-1">
              Notas (opcional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-grey-300 rounded-lg focus:ring-2 focus:ring-olive-400 focus:border-transparent"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-olive-400 hover:bg-olive-500 text-white py-2 rounded-lg transition-colors"
            >
              {session ? 'Actualizar' : 'Crear'} Sesión
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-grey-200 hover:bg-grey-300 text-grey-800 py-2 rounded-lg transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Made with Bob
