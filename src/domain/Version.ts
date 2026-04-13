/**
 * CWE content version metadata returned by `GET /cwe/version`.
 */
export interface CweVersion {
  /** CWE content version string (e.g. `'4.19.1'`) */
  ContentVersion: string;
  /** Date the content was published (e.g. `'2026-01-21'`) */
  ContentDate: string;
  /** Total number of weaknesses in this release */
  TotalWeaknesses: number;
  /** Total number of categories in this release */
  TotalCategories: number;
  /** Total number of views in this release */
  TotalViews: number;
}
