'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { PACKAGE_OPTIONS } from '@/lib/packages';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PackageRow {
  id: string;
  package_name: string;
  total_classes: number;
  total_cost: number;
  status: string;
  purchased_at: string;
  stripe_checkout_session_id: string | null;
}

interface ProfileRow {
  id: string;
  created_at: string;
}

interface SessionRef {
  date: string;
  time: string;
}

interface BookingRow {
  id: string;
  created_at: string;
  status: string;
  sessions: SessionRef | SessionRef[] | null;
}

interface MetricsData {
  packages: PackageRow[];
  profiles: ProfileRow[];
  bookings: BookingRow[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isoYM(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function monthLabel(isoYM: string): string {
  const [y, m] = isoYM.split('-').map(Number);
  const d = new Date(y, m - 1, 1);
  return d.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });
}

function inPeriod(dateStr: string, period: string): boolean {
  if (period === 'all') return true;
  return dateStr.startsWith(period);
}

function getSessionRef(sessions: SessionRef | SessionRef[] | null): SessionRef | null {
  if (!sessions) return null;
  if (Array.isArray(sessions)) return sessions[0] ?? null;
  return sessions;
}

function formatMXN(amount: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
  }).format(amount);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  accent?: 'olive' | 'mint' | 'grey';
}
function StatCard({ label, value, sub, accent = 'olive' }: StatCardProps) {
  const border = {
    olive: 'border-olive-400',
    mint: 'border-mint-500',
    grey: 'border-grey-400',
  }[accent];
  const text = {
    olive: 'text-olive-700',
    mint: 'text-mint-700',
    grey: 'text-grey-700',
  }[accent];

  return (
    <div className={`bg-white rounded-xl border-l-4 ${border} shadow-sm px-5 py-4`}>
      <p className="text-xs font-medium text-grey-500 uppercase tracking-wide mb-1">{label}</p>
      <p className={`text-2xl font-bold ${text}`}>{value}</p>
      {sub && <p className="text-xs text-grey-400 mt-1">{sub}</p>}
    </div>
  );
}

// Simple inline bar-chart rendered with divs — no external lib required
interface BarDatum {
  label: string;
  value: number;
  color?: string;
}
interface InlineBarChartProps {
  data: BarDatum[];
  title: string;
  yLabel?: string;
  maxHeight?: number;
}
function InlineBarChart({ data, title, yLabel, maxHeight = 140 }: InlineBarChartProps) {
  if (!data.length) return null;
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="bg-white rounded-xl border border-grey-200 shadow-sm p-5">
      <p className="text-sm font-semibold text-grey-700 mb-4">{title}</p>
      {yLabel && <p className="text-xs text-grey-400 mb-3">{yLabel}</p>}
      <div className="flex items-end gap-1" style={{ height: maxHeight }}>
        {data.map((d, i) => (
          <div key={i} className="flex flex-col items-center flex-1 min-w-0 gap-1">
            <span className="text-[10px] text-grey-500 font-medium">{d.value > 0 ? d.value : ''}</span>
            <div
              className="w-full rounded-t-md transition-all duration-300"
              style={{
                height: `${Math.round((d.value / max) * (maxHeight - 28))}px`,
                backgroundColor: d.color ?? '#7d8a6a',
                minHeight: d.value > 0 ? 4 : 0,
              }}
            />
            <span
              className="text-[10px] text-grey-500 text-center leading-tight"
              style={{ maxWidth: '100%', overflow: 'hidden', wordBreak: 'break-word' }}
            >
              {d.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Horizontal stacked bar for payment type
interface PaymentBreakdownProps {
  stripe: number;
  cash: number;
  totalAmount: number;
}
function PaymentBreakdown({ stripe, cash, totalAmount }: PaymentBreakdownProps) {
  const total = stripe + cash;
  if (total === 0) return null;
  const stripeW = Math.round((stripe / total) * 100);
  const cashW = 100 - stripeW;

  return (
    <div className="bg-white rounded-xl border border-grey-200 shadow-sm p-5">
      <p className="text-sm font-semibold text-grey-700 mb-4">Forma de pago — Paquetes vendidos</p>
      <div className="flex rounded-full overflow-hidden h-6 mb-3">
        {stripe > 0 && (
          <div
            className="bg-olive-500 flex items-center justify-center text-white text-xs font-semibold"
            style={{ width: `${stripeW}%` }}
            title={`Stripe: ${stripe}`}
          >
            {stripeW > 12 ? `${stripeW}%` : ''}
          </div>
        )}
        {cash > 0 && (
          <div
            className="bg-mint-500 flex items-center justify-center text-white text-xs font-semibold"
            style={{ width: `${cashW}%` }}
            title={`Efectivo: ${cash}`}
          >
            {cashW > 12 ? `${cashW}%` : ''}
          </div>
        )}
      </div>
      <div className="flex gap-6 text-sm">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-olive-500 inline-block" />
          <span className="text-grey-600">
            Stripe — <strong>{stripe}</strong> paquetes ({formatMXN(totalAmount * (stripe / total))})
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-mint-500 inline-block" />
          <span className="text-grey-600">
            Efectivo — <strong>{cash}</strong> paquetes ({formatMXN(totalAmount * (cash / total))})
          </span>
        </div>
      </div>
    </div>
  );
}

// Simple table
interface TableProps<T> {
  title: string;
  headers: string[];
  rows: T[];
  renderRow: (row: T, i: number) => React.ReactNode;
  emptyText?: string;
}
function SimpleTable<T>({ title, headers, rows, renderRow, emptyText = 'Sin datos' }: TableProps<T>) {
  return (
    <div className="bg-white rounded-xl border border-grey-200 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-grey-100">
        <p className="text-sm font-semibold text-grey-700">{title}</p>
      </div>
      {rows.length === 0 ? (
        <p className="text-sm text-grey-400 text-center py-8">{emptyText}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-grey-50">
              <tr>
                {headers.map((h) => (
                  <th key={h} className="text-left px-4 py-2 text-xs font-semibold text-grey-500 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-grey-100">
              {rows.map((row, i) => renderRow(row, i))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Period selector ───────────────────────────────────────────────────────────

function buildPeriodOptions(data: MetricsData): { value: string; label: string }[] {
  // Collect every YYYY-MM that appears in any of the three datasets
  const months = new Set<string>();

  data.packages.forEach((p) => months.add(p.purchased_at.slice(0, 7)));
  data.profiles.forEach((p) => months.add(p.created_at.slice(0, 7)));
  data.bookings.forEach((b) => {
    const ref = getSessionRef(b.sessions);
    const dateStr = ref?.date ?? b.created_at;
    months.add(dateStr.slice(0, 7));
  });

  const sorted = Array.from(months).sort((a, b) => (a > b ? -1 : 1)); // newest first

  const options: { value: string; label: string }[] = [
    { value: 'all', label: 'Total (histórico)' },
    ...sorted.map((val) => ({ value: val, label: monthLabel(val) })),
  ];

  return options;
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function MetricsView() {
  const [data, setData] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<string>('');

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [pkgRes, profRes, bookRes] = await Promise.all([
        supabase
          .from('class_packages')
          .select('id, package_name, total_classes, total_cost, status, purchased_at, stripe_checkout_session_id')
          .order('purchased_at', { ascending: false }),
        supabase
          .from('profiles')
          .select('id, created_at')
          .eq('role', 'user')
          .order('created_at', { ascending: false }),
        supabase
          .from('bookings')
          .select('id, created_at, status, sessions(date, time)')
          .order('created_at', { ascending: false }),
      ]);

      if (pkgRes.error) throw pkgRes.error;
      if (profRes.error) throw profRes.error;
      if (bookRes.error) throw bookRes.error;

      const loaded: MetricsData = {
        packages: pkgRes.data ?? [],
        profiles: profRes.data ?? [],
        bookings: (bookRes.data ?? []) as unknown as BookingRow[],
      };
      setData(loaded);
      // Default to the most recent month that actually has data
      const opts = buildPeriodOptions(loaded);
      const firstMonth = opts.find((o) => o.value !== 'all');
      setPeriod((prev) => (prev === '' ? (firstMonth?.value ?? 'all') : prev));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error cargando métricas');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-compiler/react-compiler
    void fetchAll();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-olive-500" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-16">
        <p className="text-red-600 font-medium">{error ?? 'Error desconocido'}</p>
        <button
          onClick={() => void fetchAll()}
          className="mt-4 px-4 py-2 bg-olive-500 text-white rounded-lg text-sm hover:bg-olive-600"
        >
          Reintentar
        </button>
      </div>
    );
  }

  // ── Derived stats ────────────────────────────────────────────────────────────

  const periodOptions = buildPeriodOptions(data);
  const filteredPkgs = data.packages.filter((p) => inPeriod(p.purchased_at, period));
  const filteredProfiles = data.profiles.filter((p) => inPeriod(p.created_at, period));
  const filteredBookings = data.bookings.filter((b) => {
    const sessionRef = getSessionRef(b.sessions);
    const dateStr = sessionRef?.date ?? b.created_at;
    return inPeriod(dateStr, period);
  });

  // Packages
  const totalPackages = filteredPkgs.length;
  const totalRevenue = filteredPkgs.reduce((sum, p) => sum + p.total_cost, 0);
  const stripePackages = filteredPkgs.filter((p) => p.stripe_checkout_session_id).length;
  const cashPackages = totalPackages - stripePackages;
  const stripeRevenue = filteredPkgs.filter((p) => p.stripe_checkout_session_id).reduce((s, p) => s + p.total_cost, 0);
  const cashRevenue = totalRevenue - stripeRevenue;

  // Packages by type
  const packagesByType = PACKAGE_OPTIONS.map((opt) => ({
    label: opt.isUnlimited ? 'UNLIMITED' : `${opt.classes}cl`,
    value: filteredPkgs.filter((p) => p.package_name === opt.name).length,
    color: opt.isUnlimited ? '#4f5844' : '#7d8a6a',
  })).filter((d) => d.value > 0);

  // Users
  const totalUsers = filteredProfiles.length;
  // All-time total regardless of filter (for sub-label)
  const allTimeUsers = data.profiles.length;

  // Bookings
  const confirmedBookings = filteredBookings.filter((b) => b.status === 'confirmed' || b.status === 'completed');
  const totalBookings = confirmedBookings.length;

  // Bookings by hour
  const hourCounts: Record<number, number> = {};
  confirmedBookings.forEach((b) => {
    const sRef = getSessionRef(b.sessions);
    if (!sRef?.time) return;
    const h = parseInt(sRef.time.split(':')[0], 10);
    hourCounts[h] = (hourCounts[h] ?? 0) + 1;
  });
  const hourData: BarDatum[] = Array.from({ length: 16 }, (_, i) => i + 6).map((h) => ({
    label: `${h}:00`,
    value: hourCounts[h] ?? 0,
    color: hourCounts[h] ? '#6aae6a' : '#e5e7eb',
  }));

  // Top hour
  const topHour = Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0];

  // Recent packages table (top 8)
  const recentPackages = filteredPkgs.slice(0, 8);

  // ── Render ────────────────────────────────────────────────────────────────────

  const periodLabel = periodOptions.find((o) => o.value === period)?.label ?? '';

  return (
    <div className="space-y-8">
      {/* Period selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-display italic text-grey-800">Métricas</h2>
          <p className="text-sm text-grey-500 mt-0.5">Vista: <span className="font-medium text-grey-700">{periodLabel}</span></p>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm text-grey-600 font-medium whitespace-nowrap">Período:</label>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="border border-grey-200 rounded-lg px-3 py-2 text-sm bg-white text-grey-700 focus:outline-none focus:ring-2 focus:ring-olive-400"
          >
            {periodOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <button
            onClick={() => void fetchAll()}
            className="px-3 py-2 text-sm bg-olive-100 text-olive-700 rounded-lg hover:bg-olive-200 transition-colors font-medium"
          >
            ↻ Actualizar
          </button>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <section>
        <h3 className="text-xs font-semibold text-grey-400 uppercase tracking-widest mb-3">Resumen</h3>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Paquetes vendidos"
            value={totalPackages}
            sub={period === 'all' ? 'histórico' : periodLabel}
            accent="olive"
          />
          <StatCard
            label="Ingresos totales"
            value={formatMXN(totalRevenue)}
            sub={`Stripe: ${formatMXN(stripeRevenue)} · Efectivo: ${formatMXN(cashRevenue)}`}
            accent="olive"
          />
          <StatCard
            label="Usuarios registrados"
            value={totalUsers}
            sub={period !== 'all' ? `Total histórico: ${allTimeUsers}` : 'solo rol usuario'}
            accent="mint"
          />
          <StatCard
            label="Reservaciones"
            value={totalBookings}
            sub={topHour ? `Hora pico: ${topHour[0]}:00 (${topHour[1]} reservas)` : 'confirmadas'}
            accent="grey"
          />
        </div>
      </section>

      {/* ── Packages ── */}
      <section>
        <h3 className="text-xs font-semibold text-grey-400 uppercase tracking-widest mb-3">Paquetes</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* By type */}
          {packagesByType.length > 0 ? (
            <InlineBarChart
              data={packagesByType}
              title="Paquetes vendidos por tipo"
              yLabel="Cantidad de paquetes"
            />
          ) : (
            <div className="bg-white rounded-xl border border-grey-200 shadow-sm p-5 flex items-center justify-center text-grey-400 text-sm">
              Sin paquetes en este período
            </div>
          )}

          {/* Payment breakdown */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-xl border border-grey-200 shadow-sm px-5 py-4">
                <p className="text-xs font-medium text-grey-500 uppercase tracking-wide mb-1">Stripe</p>
                <p className="text-xl font-bold text-olive-700">{stripePackages}</p>
                <p className="text-xs text-grey-400 mt-1">{formatMXN(stripeRevenue)}</p>
              </div>
              <div className="bg-white rounded-xl border border-grey-200 shadow-sm px-5 py-4">
                <p className="text-xs font-medium text-grey-500 uppercase tracking-wide mb-1">Efectivo</p>
                <p className="text-xl font-bold text-mint-700">{cashPackages}</p>
                <p className="text-xs text-grey-400 mt-1">{formatMXN(cashRevenue)}</p>
              </div>
            </div>
            {totalPackages > 0 && (
              <PaymentBreakdown
                stripe={stripePackages}
                cash={cashPackages}
                totalAmount={totalRevenue}
              />
            )}
          </div>
        </div>
      </section>

      {/* ── Bookings by hour ── */}
      <section>
        <h3 className="text-xs font-semibold text-grey-400 uppercase tracking-widest mb-3">Reservaciones por hora</h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2">
            <InlineBarChart
              data={hourData}
              title="Distribución de reservaciones por hora del día"
              yLabel="Reservas confirmadas"
              maxHeight={160}
            />
          </div>
          <div className="space-y-3">
            <div className="bg-white rounded-xl border border-grey-200 shadow-sm p-5">
              <p className="text-xs font-medium text-grey-500 uppercase tracking-wide mb-3">Top 5 horas</p>
              {Object.entries(hourCounts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([h, count], i) => (
                  <div key={h} className="flex items-center justify-between py-1.5 border-b border-grey-50 last:border-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-grey-400 w-4">{i + 1}</span>
                      <span className="text-sm text-grey-700 font-medium">{h}:00 h</span>
                    </div>
                    <span className="text-sm font-semibold text-mint-700">{count} reservas</span>
                  </div>
                ))}
              {Object.keys(hourCounts).length === 0 && (
                <p className="text-xs text-grey-400 text-center py-4">Sin datos en este período</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Recent packages table ── */}
      <section>
        <h3 className="text-xs font-semibold text-grey-400 uppercase tracking-widest mb-3">
          {period === 'all' ? 'Últimos paquetes comprados' : `Paquetes — ${periodLabel}`}
        </h3>
        <SimpleTable
          title={`${recentPackages.length} de ${totalPackages} paquetes`}
          headers={['Paquete', 'Clases', 'Costo', 'Pago', 'Estado', 'Fecha']}
          rows={recentPackages}
          emptyText="No hay paquetes en este período"
          renderRow={(pkg, i) => (
            <tr key={pkg.id} className={i % 2 === 0 ? 'bg-white' : 'bg-grey-50'}>
              <td className="px-4 py-3 text-grey-800 font-medium text-xs">{pkg.package_name}</td>
              <td className="px-4 py-3 text-grey-600 text-xs text-center">{pkg.total_classes >= 9999 ? '∞' : pkg.total_classes}</td>
              <td className="px-4 py-3 text-grey-700 text-xs font-medium">{formatMXN(pkg.total_cost)}</td>
              <td className="px-4 py-3 text-xs">
                {pkg.stripe_checkout_session_id ? (
                  <span className="px-2 py-0.5 bg-olive-100 text-olive-700 rounded-full text-[11px] font-medium">Stripe</span>
                ) : (
                  <span className="px-2 py-0.5 bg-mint-100 text-mint-700 rounded-full text-[11px] font-medium">Efectivo</span>
                )}
              </td>
              <td className="px-4 py-3 text-xs">
                <span
                  className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${
                    pkg.status === 'active'
                      ? 'bg-mint-100 text-mint-700'
                      : pkg.status === 'exhausted'
                      ? 'bg-grey-100 text-grey-600'
                      : pkg.status === 'expired'
                      ? 'bg-red-50 text-red-500'
                      : 'bg-grey-50 text-grey-400'
                  }`}
                >
                  {pkg.status === 'active' ? 'Activo' : pkg.status === 'exhausted' ? 'Agotado' : pkg.status === 'expired' ? 'Expirado' : pkg.status}
                </span>
              </td>
              <td className="px-4 py-3 text-grey-500 text-xs whitespace-nowrap">
                {new Date(pkg.purchased_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
              </td>
            </tr>
          )}
        />
      </section>
    </div>
  );
}
