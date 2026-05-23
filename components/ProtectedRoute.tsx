'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useProfile } from '@/hooks/useProfile';
import { UserRole, hasRole } from '@/lib/roles';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  fallbackPath?: string;
}

export default function ProtectedRoute({
  children,
  requiredRole,
  fallbackPath = '/',
}: ProtectedRouteProps) {
  const { profile, loading } = useProfile();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    // Not logged in
    if (!profile) {
      router.push('/login');
      return;
    }

    // Check role requirement
    if (requiredRole && !hasRole(profile.role, requiredRole)) {
      router.push(fallbackPath);
    }
  }, [profile, loading, requiredRole, fallbackPath, router]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-olive-400 mx-auto mb-4"></div>
          <p className="text-grey-600">Cargando...</p>
        </div>
      </div>
    );
  }

  // Not authorized
  if (!profile || (requiredRole && !hasRole(profile.role, requiredRole))) {
    return null;
  }

  return <>{children}</>;
}

// Made with Bob
