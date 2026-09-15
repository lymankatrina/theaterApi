export const USER_ROLES = [
  'customer',
  'employee',
  'admin'
] as const;

export type UserRole = typeof USER_ROLES[number];
