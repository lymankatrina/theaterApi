export const SECTION_TYPES = [
  'left',
  'center',
  'right'
] as const;

export type SectionType =
  typeof SECTION_TYPES[number];
