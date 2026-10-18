export const CONTENT_STATUSES = ['public', 'private'] as const;

export type ContentStatus = (typeof CONTENT_STATUSES)[number];

export const EVENT_TYPES = ['premiere', 'club', 'private', 'special'] as const;

export type EventType = (typeof EVENT_TYPES)[number];
