import type { ObjectId } from 'mongodb';

import type { EventType, ContentStatus } from '../types/events.types';

export interface Event {
  _id?: ObjectId;
  title: string;
  tagline: string;
  description: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  image: string;
  link?: string;
  type: EventType;
  postStartDate: string;
  postEndDate: string;
  status: ContentStatus;
}
