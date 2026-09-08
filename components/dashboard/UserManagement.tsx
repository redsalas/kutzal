'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { UserProfile } from '@/hooks/useProfile';
import { UserRole, ROLES, getRoleDisplayName, isAdmin } from '@/lib/roles';
import { useProfile } from '@/hooks/useProfile';
import { HealthFormData } from '@/components/HealthFormModal';
import { PACKAGE_OPTIONS } from '@/lib/packages';

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

export default function UserManagement() {
  const { profile: currentUserProfile } = useProfile();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [viewingFormUser, setViewingFormUser] = useState<UserProfile | null>(null);
  const [viewingPackagesUser, setViewingPackagesUser] = useState<UserProfile | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-compiler/react-compiler
    void fetchUsers();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleUpdateUser = async (userId: string, updates: Partial<UserProfile>) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId);

      if (error) throw error;

      await fetchUsers();
      setEditingUser(null);
      alert('Usuario actualizado exitosamente');
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Error al actualizar usuario');
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <h2 className="text-2xl font-display text-grey-800">Gestión de Usuarios</h2>
        <div className="text-sm text-grey-600">
          Total: {users.length} usuarios
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow p-4">
        <input
          type="text"
          placeholder="Buscar por nombre o correo..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-grey-300 rounded-lg focus:ring-2 focus:ring-olive-400 focus:border-transparent"
        />
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-grey-200">
            <thead className="bg-grey-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-grey-500 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-grey-500 uppercase tracking-wider">
                  Teléfono
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-grey-500 uppercase tracking-wider">
                  Fecha de Nacimiento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-grey-500 uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-grey-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-grey-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-grey-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-grey-900">
                          {user.full_name}
                        </div>
                        <div className="text-sm text-grey-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-grey-500">
                    {user.phone || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-grey-500">
                    {user.date_of_birth || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.role === 'admin'
                          ? 'bg-purple-100 text-purple-800'
                          : user.role === 'coach'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-grey-100 text-grey-800'
                      }`}
                    >
                      {getRoleDisplayName(user.role)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setEditingUser(user)}
                        className="text-olive-600 hover:text-olive-900"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => setViewingFormUser(user)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Ver Formulario
                      </button>
                      <button
                        onClick={() => setViewingPackagesUser(user)}
                        className="text-purple-600 hover:text-purple-900"
                      >
                        Paquetes
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSave={handleUpdateUser}
          isAdmin={isAdmin(currentUserProfile?.role)}
        />
      )}

      {/* Health Form Viewer Modal */}
      {viewingFormUser && (
        <HealthFormViewerModal
          user={viewingFormUser}
          onClose={() => setViewingFormUser(null)}
        />
      )}

      {/* Packages Modal */}
      {viewingPackagesUser && (
        <UserPackagesModal
          user={viewingPackagesUser}
          onClose={() => setViewingPackagesUser(null)}
        />
      )}
    </div>
  );
}

// ─── User Packages Modal ──────────────────────────────────────────────────────

interface UserPackagesModalProps {
  user: UserProfile;
  onClose: () => void;
}

function UserPackagesModal({ user, onClose }: UserPackagesModalProps) {
  const [packages, setPackages] = useState<ClassPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [addForm, setAddForm] = useState({
    packageId: 'pkg_8',
    customClasses: '',
    customCost: '',
    useCustom: false,
  });

  const fetchPackages = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('class_packages')
      .select('*')
      .eq('user_id', user.id)
      .order('purchased_at', { ascending: false });
    if (!error) setPackages(data || []);
    setLoading(false);
  };

  useEffect(() => {
    void fetchPackages();
  }, [user.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAddPackage = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddLoading(true);

    try {
      let classes: number;
      let cost: number;
      let name: string;

      if (addForm.useCustom) {
        classes = parseInt(addForm.customClasses, 10);
        cost = parseInt(addForm.customCost, 10);
        name = `Paquete personalizado (${classes} clases)`;
      } else {
        const pkg = PACKAGE_OPTIONS.find((p) => p.id === addForm.packageId);
        if (!pkg) return;
        classes = pkg.classes;
        cost = pkg.price;
        name = pkg.name;
      }

      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + 1);

      const { error } = await supabase.from('class_packages').insert({
        user_id: user.id,
        package_name: name,
        total_classes: classes,
        remaining_classes: classes,
        total_cost: cost,
        status: 'active',
        expires_at: expiresAt.toISOString(),
        // No stripe fields — manual cash payment
      });

      if (error) throw error;

      setShowAddForm(false);
      setAddForm({ packageId: 'pkg_8', customClasses: '', customCost: '', useCustom: false });
      await fetchPackages();
    } catch (err) {
      console.error('Error adding package:', err);
      alert('Error al agregar el paquete.');
    } finally {
      setAddLoading(false);
    }
  };

  const statusLabel: Record<string, { label: string; cls: string }> = {
    active:    { label: 'Activo',    cls: 'bg-green-100 text-green-800' },
    expired:   { label: 'Expirado',  cls: 'bg-red-100 text-red-800' },
    exhausted: { label: 'Agotado',   cls: 'bg-grey-100 text-grey-600' },
    pending:   { label: 'Pendiente', cls: 'bg-yellow-100 text-yellow-800' },
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-grey-200 flex items-center justify-between sticky top-0 bg-white z-10">
          <div>
            <h3 className="text-xl font-display text-grey-800">Paquetes de {user.full_name}</h3>
            <p className="text-sm text-grey-500">{user.email}</p>
          </div>
          <button onClick={onClose} className="text-grey-400 hover:text-grey-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Add Package Button */}
          <div className="flex justify-end">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-2 bg-olive-700 hover:bg-olive-800 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Agregar paquete manual
            </button>
          </div>

          {/* Add Package Form */}
          {showAddForm && (
            <form onSubmit={handleAddPackage} className="bg-olive-50 border border-olive-200 rounded-xl p-5 space-y-4">
              <h4 className="font-semibold text-grey-800">Pago en efectivo / manual</h4>

              <label className="flex items-center gap-2 text-sm text-grey-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={addForm.useCustom}
                  onChange={(e) => setAddForm({ ...addForm, useCustom: e.target.checked })}
                  className="rounded"
                />
                Paquete personalizado (número y precio libre)
              </label>

              {!addForm.useCustom ? (
                <div>
                  <label className="block text-sm font-medium text-grey-700 mb-1">Paquete</label>
                  <select
                    value={addForm.packageId}
                    onChange={(e) => setAddForm({ ...addForm, packageId: e.target.value })}
                    className="w-full px-3 py-2 border border-grey-300 rounded-lg text-sm focus:ring-2 focus:ring-olive-400 focus:border-transparent"
                  >
                    {PACKAGE_OPTIONS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} — {p.priceDisplay} MXN
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-grey-700 mb-1">Número de clases</label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={addForm.customClasses}
                      onChange={(e) => setAddForm({ ...addForm, customClasses: e.target.value })}
                      className="w-full px-3 py-2 border border-grey-300 rounded-lg text-sm focus:ring-2 focus:ring-olive-400"
                      placeholder="ej. 5"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-grey-700 mb-1">Costo (MXN)</label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={addForm.customCost}
                      onChange={(e) => setAddForm({ ...addForm, customCost: e.target.value })}
                      className="w-full px-3 py-2 border border-grey-300 rounded-lg text-sm focus:ring-2 focus:ring-olive-400"
                      placeholder="ej. 675"
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  type="submit"
                  disabled={addLoading}
                  className="flex-1 bg-olive-700 hover:bg-olive-800 disabled:bg-grey-300 text-white py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  {addLoading ? 'Guardando...' : 'Agregar paquete'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 bg-grey-100 hover:bg-grey-200 text-grey-700 py-2 rounded-lg text-sm transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}

          {/* Packages List */}
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-olive-500" />
            </div>
          ) : packages.length === 0 ? (
            <div className="text-center py-10 text-grey-500">
              <p className="text-lg mb-1">Sin paquetes registrados</p>
              <p className="text-sm">Este usuario aún no ha comprado ningún paquete.</p>
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
                        {pkg.stripe_checkout_session_id ? (
                          <p className="text-xs text-grey-400 mt-0.5">Stripe: {pkg.stripe_checkout_session_id.slice(0, 20)}…</p>
                        ) : (
                          <p className="text-xs text-olive-600 mt-0.5 font-medium">Pago en efectivo</p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${sl.cls}`}>{sl.label}</span>
                        <span className="text-sm font-bold text-grey-700">${pkg.total_cost} MXN</span>
                      </div>
                    </div>

                    {/* Progress bar */}
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
      </div>
    </div>
  );
}

// ─── Edit User Modal ──────────────────────────────────────────────────────────

interface EditUserModalProps {
  user: UserProfile;
  onClose: () => void;
  onSave: (userId: string, updates: Partial<UserProfile>) => void;
  isAdmin: boolean;
}

function EditUserModal({ user, onClose, onSave, isAdmin }: EditUserModalProps) {
  const [formData, setFormData] = useState({
    full_name: user.full_name,
    phone: user.phone || '',
    date_of_birth: user.date_of_birth || '',
    role: user.role,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(user.id, formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <h3 className="text-xl font-display text-grey-800 mb-4">Editar Usuario</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-grey-700 mb-1">
              Nombre Completo
            </label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) =>
                setFormData({ ...formData, full_name: e.target.value })
              }
              className="w-full px-4 py-2 border border-grey-300 rounded-lg focus:ring-2 focus:ring-olive-400 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-grey-700 mb-1">
              Teléfono
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-2 border border-grey-300 rounded-lg focus:ring-2 focus:ring-olive-400 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-grey-700 mb-1">
              Fecha de Nacimiento
            </label>
            <input
              type="date"
              value={formData.date_of_birth}
              onChange={(e) =>
                setFormData({ ...formData, date_of_birth: e.target.value })
              }
              className="w-full px-4 py-2 border border-grey-300 rounded-lg focus:ring-2 focus:ring-olive-400 focus:border-transparent"
            />
          </div>

          {isAdmin && (
            <div>
              <label className="block text-sm font-medium text-grey-700 mb-1">
                Rol
              </label>
              <select
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value as UserRole })
                }
                className="w-full px-4 py-2 border border-grey-300 rounded-lg focus:ring-2 focus:ring-olive-400 focus:border-transparent"
              >
                <option value={ROLES.USER}>{getRoleDisplayName(ROLES.USER)}</option>
                <option value={ROLES.COACH}>{getRoleDisplayName(ROLES.COACH)}</option>
                <option value={ROLES.ADMIN}>{getRoleDisplayName(ROLES.ADMIN)}</option>
              </select>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-olive-400 hover:bg-olive-500 text-white py-2 rounded-lg transition-colors"
            >
              Guardar
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

// ─── Health Form Viewer Modal ─────────────────────────────────────────────────

interface HealthFormViewerModalProps {
  user: UserProfile;
  onClose: () => void;
}

const emptyFormData = (): HealthFormData => ({
  practiced_pilates_before: null,
  pilates_level: null,
  does_physical_activity: null,
  physical_activity_detail: '',
  has_injuries: false,
  injuries_detail: '',
  has_back_problems: false,
  back_problems_detail: '',
  has_joint_problems: false,
  joint_problems_detail: '',
  has_prior_surgeries: false,
  prior_surgeries_detail: '',
  has_chronic_diseases: false,
  chronic_diseases_detail: '',
  has_respiratory_problems: false,
  respiratory_problems_detail: '',
  is_pregnant_or_postpartum: false,
  has_medical_restrictions: false,
  medical_restrictions_detail: '',
  goal_rehabilitation: false,
  goal_strengthening: false,
  goal_flexibility: false,
  goal_stress_reduction: false,
  goal_general_fitness: false,
  goal_other: '',
});

function HealthFormViewerModal({ user, onClose }: HealthFormViewerModalProps) {
  const [existingForm, setExistingForm] = useState<(HealthFormData & { created_at?: string }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<HealthFormData>(emptyFormData());
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const fetchForm = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('health_forms')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching health form:', error);
      }
      if (data) {
        setExistingForm(data as HealthFormData & { created_at?: string });
        setFormData(data as HealthFormData);
      } else {
        // No form yet — open in edit mode so admin can fill it
        setEditing(true);
      }
      setLoading(false);
    };
    void fetchForm();
  }, [user.id]);

  const set = <K extends keyof HealthFormData>(key: K, value: HealthFormData[K]) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError('');
    setSaveSuccess(false);
    setSaving(true);
    try {
      const { error: dbError } = await supabase
        .from('health_forms')
        .upsert({ user_id: user.id, ...formData }, { onConflict: 'user_id' });
      if (dbError) throw dbError;
      // Refresh stored form
      const { data } = await supabase
        .from('health_forms')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      if (data) setExistingForm(data as HealthFormData & { created_at?: string });
      setEditing(false);
      setSaveSuccess(true);
    } catch (err) {
      setSaveError('Error al guardar el formulario. Por favor intenta de nuevo.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const yesNo = (val: boolean | null | undefined) => {
    if (val === null || val === undefined) return '—';
    return val ? 'Sí' : 'No';
  };

  const levelLabel: Record<string, string> = {
    principiante: 'Principiante',
    intermedio: 'Intermedio',
    avanzado: 'Avanzado',
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 px-4 py-6 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl my-auto">
        {/* Header */}
        <div className="bg-olive-700 rounded-t-lg px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-white text-base font-semibold">
              Formulario de Salud y Objetivos
              {editing && !existingForm && (
                <span className="ml-2 text-xs font-normal bg-white text-olive-800 px-2 py-0.5 rounded">
                  Completando por administrador
                </span>
              )}
              {editing && existingForm && (
                <span className="ml-2 text-xs font-normal bg-white text-olive-800 px-2 py-0.5 rounded">
                  Editando
                </span>
              )}
            </h2>
            <p className="text-olive-200 text-xs mt-0.5">{user.full_name} — {user.email}</p>
          </div>
          <button onClick={onClose} className="text-white hover:text-olive-200 text-xl leading-none">
            ✕
          </button>
        </div>

        <div className="px-6 py-5">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-olive-400"></div>
            </div>
          ) : editing ? (
            // ── Editable form ────────────────────────────────────────────
            <form onSubmit={handleSave} className="space-y-6 text-sm">
              {/* Section 3 */}
              <div>
                <h3 className="font-bold text-grey-800 uppercase tracking-wider text-xs border-b border-grey-200 pb-1 mb-4">
                  3. Información Médica y de Salud
                </h3>
                <div className="space-y-3">
                  {/* Pilates experience */}
                  <div className="flex flex-wrap items-center gap-4">
                    <span className="text-grey-700">¿Ha practicado pilates anteriormente?</span>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input type="radio" name="vf_practiced" onChange={() => set('practiced_pilates_before', true)} checked={formData.practiced_pilates_before === true} /> Sí
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input type="radio" name="vf_practiced" onChange={() => { set('practiced_pilates_before', false); set('pilates_level', null); }} checked={formData.practiced_pilates_before === false} /> No
                    </label>
                    {formData.practiced_pilates_before && (
                      <div className="flex items-center gap-3 flex-wrap ml-2">
                        <span className="font-medium text-grey-700">Nivel:</span>
                        {(['principiante', 'intermedio', 'avanzado'] as const).map((lvl) => (
                          <label key={lvl} className="flex items-center gap-1 cursor-pointer capitalize">
                            <input type="radio" name="vf_level" value={lvl} checked={formData.pilates_level === lvl} onChange={() => set('pilates_level', lvl)} />
                            {lvl.charAt(0).toUpperCase() + lvl.slice(1)}
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                  {/* Physical activity */}
                  <div className="flex flex-wrap items-center gap-4">
                    <span className="text-grey-700">¿Realiza actualmente alguna actividad física?</span>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input type="radio" name="vf_activity" onChange={() => set('does_physical_activity', true)} checked={formData.does_physical_activity === true} /> Sí
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input type="radio" name="vf_activity" onChange={() => { set('does_physical_activity', false); set('physical_activity_detail', ''); }} checked={formData.does_physical_activity === false} /> No
                    </label>
                    {formData.does_physical_activity && (
                      <input type="text" placeholder="Especifique…" value={formData.physical_activity_detail} onChange={(e) => set('physical_activity_detail', e.target.value)} className="flex-1 min-w-[160px] border-b border-grey-400 focus:outline-none focus:border-olive-500 py-0.5" />
                    )}
                  </div>
                </div>

                {/* Medical history */}
                <p className="font-semibold text-grey-800 mt-4 mb-2">
                  Antecedentes médicos <span className="font-normal text-grey-500">(Marque o describa según corresponda)</span>
                </p>
                <div className="space-y-2">
                  {(
                    [
                      { boolKey: 'has_injuries', detailKey: 'injuries_detail', label: 'Lesiones recientes o crónicas' },
                      { boolKey: 'has_back_problems', detailKey: 'back_problems_detail', label: 'Problemas de espalda (lumbalgia, hernia discal, escoliosis, etc.)' },
                      { boolKey: 'has_joint_problems', detailKey: 'joint_problems_detail', label: 'Problemas de rodilla, cadera, hombro o cuello' },
                      { boolKey: 'has_prior_surgeries', detailKey: 'prior_surgeries_detail', label: 'Cirugías previas (fecha y tipo)' },
                      { boolKey: 'has_chronic_diseases', detailKey: 'chronic_diseases_detail', label: 'Enfermedades crónicas (diabetes, hipertensión, cardiopatías, etc.)' },
                      { boolKey: 'has_respiratory_problems', detailKey: 'respiratory_problems_detail', label: 'Problemas respiratorios' },
                    ] as { boolKey: keyof HealthFormData; detailKey: keyof HealthFormData; label: string }[]
                  ).map(({ boolKey, detailKey, label }) => (
                    <div key={boolKey} className="flex flex-wrap items-center gap-3">
                      <label className="flex items-center gap-1 cursor-pointer flex-shrink-0">
                        <input type="checkbox" checked={formData[boolKey] as boolean} onChange={(e) => { set(boolKey, e.target.checked as HealthFormData[typeof boolKey]); if (!e.target.checked) set(detailKey, '' as HealthFormData[typeof detailKey]); }} />
                        {label}:
                      </label>
                      {formData[boolKey] && (
                        <input type="text" placeholder="Especifique…" value={formData[detailKey] as string} onChange={(e) => set(detailKey, e.target.value as HealthFormData[typeof detailKey])} className="flex-1 min-w-[160px] border-b border-grey-400 focus:outline-none focus:border-olive-500 py-0.5" />
                      )}
                    </div>
                  ))}
                  {/* Pregnancy */}
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-grey-700 flex-shrink-0">Embarazo o post parto:</span>
                    <label className="flex items-center gap-1 cursor-pointer"><input type="radio" name="vf_pregnant" onChange={() => set('is_pregnant_or_postpartum', false)} checked={formData.is_pregnant_or_postpartum === false} /> No</label>
                    <label className="flex items-center gap-1 cursor-pointer"><input type="radio" name="vf_pregnant" onChange={() => set('is_pregnant_or_postpartum', true)} checked={formData.is_pregnant_or_postpartum === true} /> Sí</label>
                  </div>
                </div>

                {/* Medical restrictions */}
                <div className="mt-3">
                  <p className="font-semibold text-grey-800">Restricciones médicas <span className="font-normal text-grey-500">¿Indicaciones médicas o restricciones de movimiento?</span></p>
                  <div className="flex flex-wrap items-center gap-3 mt-1">
                    <label className="flex items-center gap-1 cursor-pointer"><input type="radio" name="vf_restrictions" onChange={() => { set('has_medical_restrictions', false); set('medical_restrictions_detail', ''); }} checked={formData.has_medical_restrictions === false} /> No</label>
                    <label className="flex items-center gap-1 cursor-pointer"><input type="radio" name="vf_restrictions" onChange={() => set('has_medical_restrictions', true)} checked={formData.has_medical_restrictions === true} /> Sí</label>
                    {formData.has_medical_restrictions && (
                      <input type="text" placeholder="Especifique…" value={formData.medical_restrictions_detail} onChange={(e) => set('medical_restrictions_detail', e.target.value)} className="flex-1 min-w-[180px] border-b border-grey-400 focus:outline-none focus:border-olive-500 py-0.5" />
                    )}
                  </div>
                </div>
              </div>

              {/* Section 4 */}
              <div>
                <h3 className="font-bold text-grey-800 uppercase tracking-wider text-xs border-b border-grey-200 pb-1 mb-4">
                  4. Objetivos del Alumno
                </h3>
                <p className="font-semibold text-grey-800 mb-2">Motivo por el cual tomará clases de pilates:</p>
                <div className="flex flex-wrap gap-x-6 gap-y-2">
                  {(
                    [
                      { key: 'goal_rehabilitation', label: 'Rehabilitación' },
                      { key: 'goal_strengthening', label: 'Fortalecimiento' },
                      { key: 'goal_flexibility', label: 'Flexibilidad' },
                      { key: 'goal_stress_reduction', label: 'Reducción del estrés' },
                      { key: 'goal_general_fitness', label: 'Condición física general' },
                    ] as { key: keyof HealthFormData; label: string }[]
                  ).map(({ key, label }) => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={formData[key] as boolean} onChange={(e) => set(key, e.target.checked as HealthFormData[typeof key])} />
                      {label}
                    </label>
                  ))}
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-grey-700 flex-shrink-0">Otro:</span>
                  <input type="text" placeholder="Describe el objetivo…" value={formData.goal_other} onChange={(e) => set('goal_other', e.target.value)} className="flex-1 border-b border-grey-400 focus:outline-none focus:border-olive-500 py-0.5" />
                </div>
              </div>

              {saveError && (
                <div className="p-3 bg-red-50 border border-red-300 text-red-700 rounded">
                  {saveError}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="flex-1 bg-olive-400 hover:bg-olive-500 text-white py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  {saving ? 'Guardando…' : 'Guardar'}
                </button>
                {existingForm && (
                  <button type="button" onClick={() => { setEditing(false); setFormData(existingForm); setSaveError(''); }} className="flex-1 bg-grey-100 hover:bg-grey-200 text-grey-700 py-2.5 rounded-lg font-medium transition-colors">
                    Cancelar
                  </button>
                )}
                {!existingForm && (
                  <button type="button" onClick={onClose} className="flex-1 bg-grey-100 hover:bg-grey-200 text-grey-700 py-2.5 rounded-lg font-medium transition-colors">
                    Cerrar
                  </button>
                )}
              </div>
            </form>
          ) : existingForm ? (
            // ── Read-only view ────────────────────────────────────────────
            <div className="space-y-6 text-sm">
              {saveSuccess && (
                <div className="p-3 bg-green-50 border border-green-300 text-green-700 rounded">
                  Formulario guardado exitosamente.
                </div>
              )}
              {/* Section 3 */}
              <section>
                <h3 className="font-bold text-grey-800 uppercase tracking-wider text-xs border-b border-grey-200 pb-1 mb-3">
                  3. Información Médica y de Salud
                </h3>
                <dl className="space-y-2">
                  <Row label="¿Ha practicado pilates anteriormente?">
                    {yesNo(existingForm.practiced_pilates_before)}
                    {existingForm.practiced_pilates_before && existingForm.pilates_level && (
                      <span className="ml-2 text-grey-500">— Nivel: {levelLabel[existingForm.pilates_level] ?? existingForm.pilates_level}</span>
                    )}
                  </Row>
                  <Row label="¿Realiza actividad física actualmente?">
                    {yesNo(existingForm.does_physical_activity)}
                    {existingForm.does_physical_activity && existingForm.physical_activity_detail && (
                      <span className="ml-2 text-grey-500">— {existingForm.physical_activity_detail}</span>
                    )}
                  </Row>
                  <div className="pt-1">
                    <p className="font-semibold text-grey-700 mb-1">Antecedentes médicos:</p>
                    <div className="pl-3 space-y-1">
                      <MedRow label="Lesiones recientes o crónicas" value={existingForm.has_injuries} detail={existingForm.injuries_detail} />
                      <MedRow label="Problemas de espalda" value={existingForm.has_back_problems} detail={existingForm.back_problems_detail} />
                      <MedRow label="Problemas de rodilla, cadera, hombro o cuello" value={existingForm.has_joint_problems} detail={existingForm.joint_problems_detail} />
                      <MedRow label="Cirugías previas" value={existingForm.has_prior_surgeries} detail={existingForm.prior_surgeries_detail} />
                      <MedRow label="Enfermedades crónicas" value={existingForm.has_chronic_diseases} detail={existingForm.chronic_diseases_detail} />
                      <MedRow label="Problemas respiratorios" value={existingForm.has_respiratory_problems} detail={existingForm.respiratory_problems_detail} />
                      <Row label="Embarazo o post parto">{yesNo(existingForm.is_pregnant_or_postpartum)}</Row>
                    </div>
                  </div>
                  <div className="pt-1">
                    <MedRow label="Restricciones médicas" value={existingForm.has_medical_restrictions} detail={existingForm.medical_restrictions_detail} />
                  </div>
                </dl>
              </section>
              {/* Section 4 */}
              <section>
                <h3 className="font-bold text-grey-800 uppercase tracking-wider text-xs border-b border-grey-200 pb-1 mb-3">
                  4. Objetivos del Alumno
                </h3>
                <p className="font-semibold text-grey-700 mb-2">Motivo para tomar clases de pilates:</p>
                <ul className="list-disc list-inside space-y-0.5 text-grey-700">
                  {existingForm.goal_rehabilitation && <li>Rehabilitación</li>}
                  {existingForm.goal_strengthening && <li>Fortalecimiento</li>}
                  {existingForm.goal_flexibility && <li>Flexibilidad</li>}
                  {existingForm.goal_stress_reduction && <li>Reducción del estrés</li>}
                  {existingForm.goal_general_fitness && <li>Condición física general</li>}
                  {existingForm.goal_other && <li>Otro: {existingForm.goal_other}</li>}
                </ul>
              </section>
              {existingForm.created_at && (
                <p className="text-xs text-grey-400 text-right">
                  Completado el {new Date(existingForm.created_at).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              )}
              <div className="flex gap-3">
                <button onClick={() => { setEditing(true); setSaveSuccess(false); setSaveError(''); setFormData(existingForm); }} className="flex-1 bg-olive-400 hover:bg-olive-500 text-white py-2.5 rounded-lg font-medium transition-colors">
                  Editar
                </button>
                <button onClick={onClose} className="flex-1 bg-grey-100 hover:bg-grey-200 text-grey-700 py-2.5 rounded-lg font-medium transition-colors">
                  Cerrar
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

// Small display helpers

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-2">
      <dt className="font-medium text-grey-700 flex-shrink-0">{label}:</dt>
      <dd className="text-grey-600">{children}</dd>
    </div>
  );
}

function MedRow({ label, value, detail }: { label: string; value: boolean; detail?: string | null }) {
  return (
    <div className="flex gap-2">
      <dt className="font-medium text-grey-700 flex-shrink-0">{label}:</dt>
      <dd className="text-grey-600">
        {value ? 'Sí' : 'No'}
        {value && detail ? <span className="text-grey-500"> — {detail}</span> : null}
      </dd>
    </div>
  );
}

// Made with Bob
