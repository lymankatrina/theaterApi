import type { ObjectId } from 'mongodb';
import type { UserRole } from '../types/users.types';

export interface User {
  auth0Id: string;
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  role: UserRole;
  phone?: string;
  _id?: ObjectId;
}
