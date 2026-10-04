import type { ObjectId } from 'mongodb';
import type { AdmissionType } from '../types/prices.types';

export interface Price {
  admissionType: AdmissionType;
  priceInCents: number;
  _id?: ObjectId;
}
