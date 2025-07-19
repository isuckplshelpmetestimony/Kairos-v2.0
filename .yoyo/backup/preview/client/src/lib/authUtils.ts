// Admin configuration
const ADMIN_EMAIL = 'seanmacalintal0409@gmail.com';
const ADMIN_PHONE = '09291860540'; // Updated with actual number

// User types
export const USER_ROLES = {
  ADMIN: 'admin',
  PREMIUM: 'premium',
  FREE: 'free',
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

export interface PremiumUser {
  email: string;
  status: 'active' | 'inactive';
}

// Check if user has full access to all events
export const hasFullAccess = (
  userEmail: string,
  userPhone: string,
  premiumUsers: PremiumUser[] = []
): boolean => {
  // Admin always has access
  if (userEmail === ADMIN_EMAIL || userPhone === ADMIN_PHONE) {
    return true;
  }
  // Check if user is in premium users list
  return premiumUsers.some(user =>
    user.email === userEmail && user.status === 'active'
  );
};

// Get user role
export const getUserRole = (
  userEmail: string,
  userPhone: string
): UserRole => {
  if (userEmail === ADMIN_EMAIL || userPhone === ADMIN_PHONE) {
    return USER_ROLES.ADMIN;
  }
  return USER_ROLES.FREE; // Default for now
}; 