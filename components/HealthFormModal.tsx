'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export interface HealthFormData {
  // Section 3
  practiced_pilates_before: boolean | null;
  pilates_level: 'principiante' | 'intermedio' | 'avanzado' | null;
  does_physical_activity: boolean | null;
  physical_activity_detail: string;
  has_injuries: boolean;
  injuries_detail: string;
  has_back_problems: boolean;
  back_problems_detail: string;
  has_joint_problems: boolean;
  joint_problems_detail: string;
  has_prior_surgeries: boolean;
  prior_surgeries_detail: string;
  has_chronic_diseases: boolean;
  chronic_diseases_detail: string;
  has_respiratory_problems: boolean;
  respiratory_problems_detail: string;
  is_pregnant_or_postpartum: boolean;
  has_medical_restrictions: boolean;
  medical_restrictions_detail: string;
  // Section 4
  goal_rehabilitation: boolean;
  goal_strengthening: boolean;
  goal_flexibility: boolean;
  goal_stress_reduction: boolean;
  goal_general_fitness: boolean;
  goal_other: string;
}

const emptyForm = (): HealthFormData => ({
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

interface HealthFormModalProps {
  userId: string;
  onComplete: () => void;
  onClose: () => void;
}

export default function HealthFormModal({ userId, onComplete, onClose }: HealthFormModalProps) {
  const [formData, setFormData] = useState<HealthFormData>(emptyForm());
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = <K extends keyof HealthFormData>(key: K, value: HealthFormData[K]) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  const validate = (): string | null => {
    if (formData.practiced_pilates_before === null)
      return 'Por favor indica si has practicado pilates anteriormente.';
    if (formData.practiced_pilates_before && !formData.pilates_level)
      return 'Por favor selecciona tu nivel de pilates.';
    if (formData.does_physical_activity === null)
      return 'Por favor indica si realizas actividad física actualmente.';
    const goalsSelected =
      formData.goal_rehabilitation ||
      formData.goal_strengthening ||
      formData.goal_flexibility ||
      formData.goal_stress_reduction ||
      formData.goal_general_fitness ||
      formData.goal_other.trim().length > 0;
    if (!goalsSelected)
      return 'Por favor selecciona al menos un objetivo para tomar clases de pilates.';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setLoading(true);
    try {
      const { error: dbError } = await supabase.from('health_forms').insert({
        user_id: userId,
        ...formData,
      });
      if (dbError) throw dbError;
      onComplete();
    } catch (err) {
      setError('Error al guardar el formulario. Por favor intenta de nuevo.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 px-4 py-6 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl my-auto">
        {/* Header */}
        <div className="bg-olive-700 rounded-t-lg px-6 py-4">
          <h2 className="text-white text-lg font-semibold tracking-wide text-center">
            INFORMACIÓN DE SALUD Y OBJETIVOS
          </h2>
          <p className="text-olive-100 text-xs text-center mt-1">
            Esta información es confidencial y ayuda a tu instructor a personalizar tu práctica.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-6">
          {/* ── SECTION 3 ─────────────────────────────────────────── */}
          <div>
            <h3 className="text-sm font-bold text-grey-800 uppercase tracking-wider border-b border-grey-200 pb-1 mb-4">
              3. Información Médica y de Salud
            </h3>

            {/* Pilates experience */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-4">
                <span className="text-sm text-grey-700">¿Ha practicado pilates anteriormente?</span>
                <label className="flex items-center gap-1 text-sm cursor-pointer">
                  <input
                    type="radio"
                    name="practiced_pilates_before"
                    onChange={() => set('practiced_pilates_before', true)}
                    checked={formData.practiced_pilates_before === true}
                  />
                  Sí
                </label>
                <label className="flex items-center gap-1 text-sm cursor-pointer">
                  <input
                    type="radio"
                    name="practiced_pilates_before"
                    onChange={() => { set('practiced_pilates_before', false); set('pilates_level', null); }}
                    checked={formData.practiced_pilates_before === false}
                  />
                  No
                </label>
                {formData.practiced_pilates_before && (
                  <div className="flex items-center gap-3 flex-wrap ml-2">
                    <span className="text-sm font-medium text-grey-700">Nivel:</span>
                    {(['principiante', 'intermedio', 'avanzado'] as const).map((lvl) => (
                      <label key={lvl} className="flex items-center gap-1 text-sm cursor-pointer capitalize">
                        <input
                          type="radio"
                          name="pilates_level"
                          value={lvl}
                          checked={formData.pilates_level === lvl}
                          onChange={() => set('pilates_level', lvl)}
                        />
                        {lvl.charAt(0).toUpperCase() + lvl.slice(1)}
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Physical activity */}
              <div className="flex flex-wrap items-center gap-4">
                <span className="text-sm text-grey-700">¿Realiza actualmente alguna actividad física?</span>
                <label className="flex items-center gap-1 text-sm cursor-pointer">
                  <input
                    type="radio"
                    name="does_physical_activity"
                    onChange={() => set('does_physical_activity', true)}
                    checked={formData.does_physical_activity === true}
                  />
                  Sí
                </label>
                <label className="flex items-center gap-1 text-sm cursor-pointer">
                  <input
                    type="radio"
                    name="does_physical_activity"
                    onChange={() => { set('does_physical_activity', false); set('physical_activity_detail', ''); }}
                    checked={formData.does_physical_activity === false}
                  />
                  No
                </label>
                {formData.does_physical_activity && (
                  <input
                    type="text"
                    placeholder="Especifique…"
                    value={formData.physical_activity_detail}
                    onChange={(e) => set('physical_activity_detail', e.target.value)}
                    className="flex-1 min-w-[160px] border-b border-grey-400 focus:outline-none focus:border-olive-500 text-sm py-0.5"
                  />
                )}
              </div>
            </div>

            {/* Medical history */}
            <p className="text-sm font-semibold text-grey-800 mt-4 mb-2">
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
                  <label className="flex items-center gap-1 text-sm cursor-pointer flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={formData[boolKey] as boolean}
                      onChange={(e) => {
                        set(boolKey, e.target.checked as HealthFormData[typeof boolKey]);
                        if (!e.target.checked) set(detailKey, '' as HealthFormData[typeof detailKey]);
                      }}
                    />
                    {label}:
                  </label>
                  {formData[boolKey] && (
                    <input
                      type="text"
                      placeholder="Especifique…"
                      value={formData[detailKey] as string}
                      onChange={(e) => set(detailKey, e.target.value as HealthFormData[typeof detailKey])}
                      className="flex-1 min-w-[160px] border-b border-grey-400 focus:outline-none focus:border-olive-500 text-sm py-0.5"
                    />
                  )}
                </div>
              ))}

              {/* Pregnancy */}
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm text-grey-700 flex-shrink-0">Embarazo o post parto:</span>
                <label className="flex items-center gap-1 text-sm cursor-pointer">
                  <input
                    type="radio"
                    name="is_pregnant_or_postpartum"
                    onChange={() => set('is_pregnant_or_postpartum', false)}
                    checked={formData.is_pregnant_or_postpartum === false}
                  />
                  No
                </label>
                <label className="flex items-center gap-1 text-sm cursor-pointer">
                  <input
                    type="radio"
                    name="is_pregnant_or_postpartum"
                    onChange={() => set('is_pregnant_or_postpartum', true)}
                    checked={formData.is_pregnant_or_postpartum === true}
                  />
                  Sí
                </label>
              </div>
            </div>

            {/* Medical restrictions */}
            <div className="mt-3">
              <p className="text-sm font-semibold text-grey-800">
                Restricciones médicas{' '}
                <span className="font-normal text-grey-500">
                  ¿Cuenta con indicaciones médicas especiales o restricciones de movimiento?
                </span>
              </p>
              <div className="flex flex-wrap items-center gap-3 mt-1">
                <label className="flex items-center gap-1 text-sm cursor-pointer">
                  <input
                    type="radio"
                    name="has_medical_restrictions"
                    onChange={() => { set('has_medical_restrictions', false); set('medical_restrictions_detail', ''); }}
                    checked={formData.has_medical_restrictions === false}
                  />
                  No
                </label>
                <label className="flex items-center gap-1 text-sm cursor-pointer">
                  <input
                    type="radio"
                    name="has_medical_restrictions"
                    onChange={() => set('has_medical_restrictions', true)}
                    checked={formData.has_medical_restrictions === true}
                  />
                  Sí
                </label>
                {formData.has_medical_restrictions && (
                  <input
                    type="text"
                    placeholder="Especifique…"
                    value={formData.medical_restrictions_detail}
                    onChange={(e) => set('medical_restrictions_detail', e.target.value)}
                    className="flex-1 min-w-[180px] border-b border-grey-400 focus:outline-none focus:border-olive-500 text-sm py-0.5"
                  />
                )}
              </div>
            </div>
          </div>

          {/* ── SECTION 4 ─────────────────────────────────────────── */}
          <div>
            <h3 className="text-sm font-bold text-grey-800 uppercase tracking-wider border-b border-grey-200 pb-1 mb-4">
              4. Objetivos del Alumno
            </h3>
            <p className="text-sm font-semibold text-grey-800 mb-2">
              Motivo por el cual tomará clases de pilates:{' '}
              <span className="font-normal text-grey-500">(Selecciona todos los que apliquen)</span>
            </p>
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
                <label key={key} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData[key] as boolean}
                    onChange={(e) => set(key, e.target.checked as HealthFormData[typeof key])}
                  />
                  {label}
                </label>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-2">
              <span className="text-sm text-grey-700 flex-shrink-0">Otro:</span>
              <input
                type="text"
                placeholder="Describe tu objetivo…"
                value={formData.goal_other}
                onChange={(e) => set('goal_other', e.target.value)}
                className="flex-1 border-b border-grey-400 focus:outline-none focus:border-olive-500 text-sm py-0.5"
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-300 text-red-700 rounded text-sm">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-olive-400 hover:bg-olive-500 text-white py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Guardando…' : 'Guardar y Continuar'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-grey-100 hover:bg-grey-200 text-grey-700 py-2.5 rounded-lg font-medium transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
