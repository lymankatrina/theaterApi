export const ADMISSION_TYPES = ['adult', 'child', 'student', 'military', 'senior'] as const;

export type AdmissionType = (typeof ADMISSION_TYPES)[number];
