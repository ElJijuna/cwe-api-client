/**
 * CWE entry type string.
 */
export type CweEntryType =
  | 'pillar_weakness'
  | 'class_weakness'
  | 'base_weakness'
  | 'variant_weakness'
  | 'compound_element'
  | 'category'
  | 'view';

/**
 * Lightweight CWE entry returned by the multi-ID lookup endpoint
 * (`GET /cwe/{ids}`).
 */
export interface CweEntry {
  /** CWE entry type (e.g. `'base_weakness'`, `'category'`, `'view'`) */
  Type: CweEntryType;
  /** CWE identifier string (e.g. `'79'`) */
  ID: string;
}
