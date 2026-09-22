'use client';

import { useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { ROLES } from '@/lib/roles';
import { useProfile } from '@/hooks/useProfile';
import UserManagement from '@/components/dashboard/UserManagement';
import SessionManagement from '@/components/dashboard/SessionManagement';
import CalendarView from '@/components/dashboard/CalendarView';
import MetricsView from '@/components/dashboard/MetricsView';
import PushNotificationToggle from '@/components/PushNotificationToggle';

type TabType = 'calendar' | 'sessions' | 'users' | 'metrics';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<TabType>('calendar');
  const { profile } = useProfile();

  const tabs = [
    { id: 'calendar' as TabType, name: 'Calendario', icon: '📅' },
    { id: 'sessions' as TabType, name: 'Sesiones', icon: '🏋️' },
    { id: 'users' as TabType, name: 'Usuarios', icon: '👥' },
    { id: 'metrics' as TabType, name: 'Métricas', icon: '📊' },
  ];

  return (
    <ProtectedRoute requiredRole={ROLES.COACH}>
      <div className="min-h-screen bg-grey-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-grey-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-display italic text-grey-800">
                  Panel de Control
                </h1>
                <p className="text-sm text-grey-600 mt-1">
                  Bienvenido, {profile?.full_name}
                </p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-olive-100 rounded-full">
                <span className="text-sm font-medium text-olive-700">
                  {profile?.role === 'admin' ? '👑 Administrador' : '🎯 Coach'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white border-b border-grey-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav
              className="flex overflow-x-auto scrollbar-none -mb-px"
              aria-label="Tabs"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex-shrink-0 py-4 px-4 border-b-2 font-medium text-sm flex items-center gap-2 whitespace-nowrap
                    ${
                      activeTab === tab.id
                        ? 'border-olive-500 text-olive-600'
                        : 'border-transparent text-grey-500 hover:text-grey-700 hover:border-grey-300'
                    }
                  `}
                >
                  <span>{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {profile?.id && (
            <PushNotificationToggle userId={profile.id} role={profile.role} />
          )}

          {activeTab === 'calendar' && <CalendarView />}
          {activeTab === 'sessions' && <SessionManagement />}
          {activeTab === 'users' && <UserManagement />}
          {activeTab === 'metrics' && <MetricsView />}
        </div>
      </div>
    </ProtectedRoute>
  );
}


