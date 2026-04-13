/**
 * Thrown when the CWE API returns a non-2xx response.
 *
 * @example
 * ```typescript
 * import { CweApiError } from 'cwe-api-client';
 *
 * try {
 *   await cwe.weakness(99999).get();
 * } catch (err) {
 *   if (err instanceof CweApiError) {
 *     console.log(err.status);     // 404
 *     console.log(err.statusText); // 'Not Found'
 *     console.log(err.message);    // 'CWE API error: 404 Not Found'
 *   }
 * }
 * ```
 */
export class CweApiError extends Error {
  /** HTTP status code (e.g. `404`, `400`, `500`) */
  readonly status: number;
  /** HTTP status text (e.g. `'Not Found'`, `'Bad Request'`) */
  readonly statusText: string;

  constructor(status: number, statusText: string) {
    super(`CWE API error: ${status} ${statusText}`);
    this.name = 'CweApiError';
    this.status = status;
    this.statusText = statusText;
  }
}
