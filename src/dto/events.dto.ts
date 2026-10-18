import type { EventType, ContentStatus } from '../types/events.types';

export interface CreateEventInput {
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

export type UpdateEventInput = Partial<CreateEventInput>;
