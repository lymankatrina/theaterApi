import type { UserRole } from '../types/users.types';

export interface CreateUserInput {
  auth0Id: string;
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  phone?: string;
}

export interface UpdateUserInput {
  firstName?: string;
  lastName?: string;
  userName?: string;
  email?: string;
  phone?: string;
}

export interface UpdateUserRoleInput {
  role: UserRole;
}