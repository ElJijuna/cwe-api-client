import { CweApiError } from './errors/CweApiError';
import { WeaknessResource } from './resources/WeaknessResource';
import { CategoryResource } from './resources/CategoryResource';
import { ViewResource } from './resources/ViewResource';
import type { CweVersion } from './domain/Version';
import type { CweEntry } from './domain/CweEntry';

const DEFAULT_BASE_URL = 'https://cwe-api.mitre.org/api/v1';

/**
 * Payload emitted on every HTTP request made by {@link CweClient}.
 */
export interface RequestEvent {
  /** Full URL that was requested */
  url: string;
  /** HTTP method used */
  method: 'GET';
  /** Timestamp when the request started */
  startedAt: Date;
  /** Timestamp when the request finished (success or error) */
  finishedAt: Date;
  /** Total duration in milliseconds */
  durationMs: number;
  /** HTTP status code returned by the server, if a response was received */
  statusCode?: number;
  /** Error thrown, if the request failed */
  error?: Error;
}

/** Map of supported client events to their callback signatures */
export interface CweClientEvents {
  request: (event: RequestEvent) => void;
}

/**
 * Constructor options for {@link CweClient}.
 */
export interface CweClientOptions {
  /**
   * Base URL for the CWE API (default: `'https://cwe-api.mitre.org/api/v1'`).
   * Override for mirrors or local instances.
   */
  baseUrl?: string;
}

/**
 * Main entry point for the MITRE CWE API client.
 *
 * @example
 * ```typescript
 * import { CweClient } from 'cwe-api-client';
 *
 * const cwe = new CweClient();
 *
 * // Get content version metadata
 * const version = await cwe.version();
 *
 * // Look up multiple CWEs at once
 * const entries = await cwe.lookup([74, 79]);
 *
 * // Get full weakness details
 * const weakness = await cwe.weakness(79);
 *
 * // Navigate the hierarchy
 * const parents = await cwe.weakness(74).parents(1000);
 * const descendants = await cwe.weakness(74).descendants(1000);
 *
 * // Get category and view details
 * const category = await cwe.category(189);
 * const view = await cwe.view(1425);
 * ```
 */
export class CweClient {
  private readonly baseUrl: string;
  private readonly listeners: Map<
    keyof CweClientEvents,
    CweClientEvents[keyof CweClientEvents][]
  > = new Map();

  /**
   * @param options - Optional configuration for the API base URL
   */
  constructor(options: CweClientOptions = {}) {
    this.baseUrl = (options.baseUrl ?? DEFAULT_BASE_URL).replace(/\/$/, '');
  }

  /**
   * Subscribes to a client event.
   *
   * @example
   * ```typescript
   * cwe.on('request', (event) => {
   *   console.log(`${event.method} ${event.url} — ${event.durationMs}ms`);
   *   if (event.error) console.error('Request failed:', event.error);
   * });
   * ```
   */
  on<K extends keyof CweClientEvents>(event: K, callback: CweClientEvents[K]): this {
    const callbacks = this.listeners.get(event) ?? [];
    callbacks.push(callback);
    this.listeners.set(event, callbacks);
    return this;
  }

  private emit<K extends keyof CweClientEvents>(
    event: K,
    payload: Parameters<CweClientEvents[K]>[0],
  ): void {
    const callbacks = this.listeners.get(event) ?? [];
    for (const cb of callbacks) {
      (cb as (p: typeof payload) => void)(payload);
    }
  }

  /**
   * Performs a GET request to the CWE API.
   *
   * @param path - Path to append to the base URL (e.g. `/cwe/version`)
   * @param params - Optional query parameters
   * @internal
   */
  async request<T>(
    path: string,
    params?: Record<string, string | number | boolean>,
  ): Promise<T> {
    const url = buildUrl(`${this.baseUrl}${path}`, params);
    const startedAt = new Date();
    let statusCode: number | undefined;
    try {
      const response = await fetch(url, {
        headers: { Accept: 'application/json' },
      });
      statusCode = response.status;
      if (!response.ok) {
        throw new CweApiError(response.status, response.statusText);
      }
      const data = await response.json() as T;
      this.emit('request', {
        url,
        method: 'GET',
        startedAt,
        finishedAt: new Date(),
        durationMs: Date.now() - startedAt.getTime(),
        statusCode,
      });
      return data;
    } catch (err) {
      const finishedAt = new Date();
      this.emit('request', {
        url,
        method: 'GET',
        startedAt,
        finishedAt,
        durationMs: finishedAt.getTime() - startedAt.getTime(),
        statusCode,
        error: err instanceof Error ? err : new Error(String(err)),
      });
      throw err;
    }
  }

  /**
   * Fetches CWE content version metadata.
   *
   * `GET /cwe/version`
   *
   * @returns Version metadata including content version, date, and counts
   *
   * @example
   * ```typescript
   * const v = await cwe.version();
   * console.log(v.ContentVersion); // '4.19.1'
   * console.log(v.TotalWeaknesses); // 969
   * ```
   */
  async version(): Promise<CweVersion> {
    return this.request<CweVersion>('/cwe/version');
  }

  /**
   * Looks up multiple CWE entries by their numeric IDs in a single request.
   *
   * `GET /cwe/{ids}` (comma-separated)
   *
   * @param ids - Array of CWE numeric IDs (e.g. `[74, 79]`)
   * @returns Array of lightweight CWE entries with type and ID
   *
   * @example
   * ```typescript
   * const entries = await cwe.lookup([74, 79]);
   * entries.forEach(e => console.log(e.ID, e.Type));
   * ```
   */
  async lookup(ids: number[]): Promise<CweEntry[]> {
    return this.request<CweEntry[]>(`/cwe/${ids.join(',')}`);
  }

  /**
   * Returns a {@link WeaknessResource} for a given CWE weakness ID, providing
   * access to weakness details and its hierarchy (parents, children, ancestors,
   * descendants).
   *
   * The returned resource can be awaited directly to fetch the full weakness,
   * or chained to access hierarchy methods.
   *
   * @param id - The CWE weakness numeric ID (e.g. `79`)
   * @returns A chainable weakness resource
   *
   * @example
   * ```typescript
   * const weakness = await cwe.weakness(79);
   * const parents = await cwe.weakness(74).parents(1000);
   * const tree = await cwe.weakness(74).descendants(1000);
   * ```
   */
  weakness(id: number): WeaknessResource {
    return new WeaknessResource(
      <T>(path: string, params?: Record<string, string | number | boolean>) =>
        this.request<T>(path, params),
      id,
    );
  }

  /**
   * Returns a {@link CategoryResource} for a given CWE category ID, providing
   * access to category details.
   *
   * The returned resource can be awaited directly to fetch the full category.
   *
   * @param id - The CWE category numeric ID (e.g. `189`)
   * @returns A chainable category resource
   *
   * @example
   * ```typescript
   * const category = await cwe.category(189);
   * console.log(category.Name); // 'Numeric Errors'
   * ```
   */
  category(id: number): CategoryResource {
    return new CategoryResource(
      <T>(path: string, params?: Record<string, string | number | boolean>) =>
        this.request<T>(path, params),
      id,
    );
  }

  /**
   * Returns a {@link ViewResource} for a given CWE view ID, providing access
   * to view details.
   *
   * The returned resource can be awaited directly to fetch the full view.
   *
   * @param id - The CWE view numeric ID (e.g. `1425`)
   * @returns A chainable view resource
   *
   * @example
   * ```typescript
   * const view = await cwe.view(1425);
   * console.log(view.Name); // 'Weaknesses in the 2023 CWE Top 25...'
   * ```
   */
  view(id: number): ViewResource {
    return new ViewResource(
      <T>(path: string, params?: Record<string, string | number | boolean>) =>
        this.request<T>(path, params),
      id,
    );
  }
}

/**
 * Appends query parameters to a URL string, skipping `undefined` values.
 * @internal
 */
function buildUrl(base: string, params?: Record<string, string | number | boolean>): string {
  if (!params) return base;
  const entries = Object.entries(params).filter(([, v]) => v !== undefined);
  if (entries.length === 0) return base;
  const search = new URLSearchParams(entries.map(([k, v]) => [k, String(v)]));
  return `${base}?${search.toString()}`;
}
