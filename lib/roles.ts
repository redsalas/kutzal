// Role definitions
export type UserRole = 'user' | 'coach' | 'admin';

export const ROLES = {
  USER: 'user' as UserRole,
  COACH: 'coach' as UserRole,
  ADMIN: 'admin' as UserRole,
};

// Role hierarchy (higher number = more permissions)
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  user: 1,
  coach: 2,
  admin: 3,
};

// Check if user has a specific role
export function hasRole(userRole: UserRole | null | undefined, requiredRole: UserRole): boolean {
  if (!userRole) return false;
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

// Check if user is admin
export function isAdmin(userRole: UserRole | null | undefined): boolean {
  return userRole === ROLES.ADMIN;
}

// Check if user is coach or admin
export function isCoachOrAdmin(userRole: UserRole | null | undefined): boolean {
  return userRole === ROLES.COACH || userRole === ROLES.ADMIN;
}

// Check if user is regular user
export function isRegularUser(userRole: UserRole | null | undefined): boolean {
  return userRole === ROLES.USER;
}

// Get role display name
export function getRoleDisplayName(role: UserRole): string {
  const displayNames: Record<UserRole, string> = {
    user: 'Usuario',
    coach: 'Coach',
    admin: 'Administrador',
  };
  return displayNames[role];
}

// Get available roles for assignment (admins can assign any role)
export function getAssignableRoles(currentUserRole: UserRole | null | undefined): UserRole[] {
  if (isAdmin(currentUserRole)) {
    return [ROLES.USER, ROLES.COACH, ROLES.ADMIN];
  }
  return [];
}

// Made with Bob
