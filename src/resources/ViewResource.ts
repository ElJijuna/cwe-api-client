import type { CweView } from '../domain/View';
import type { RequestFn } from './WeaknessResource';

/**
 * Represents a CWE view resource, providing access to view details.
 *
 * Implements `PromiseLike<CweView>` so it can be awaited directly.
 *
 * @example
 * ```typescript
 * // Await directly to get full view data
 * const view = await cwe.view(1425);
 *
 * // Or call .get() explicitly
 * const view = await cwe.view(1425).get();
 * ```
 */
export class ViewResource implements PromiseLike<CweView> {
  /** @internal */
  constructor(
    private readonly request: RequestFn,
    private readonly id: number,
  ) {}

  /**
   * Allows the resource to be awaited directly, resolving with the full view.
   * Delegates to {@link ViewResource.get}.
   */
  then<TResult1 = CweView, TResult2 = never>(
    onfulfilled?: ((value: CweView) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): PromiseLike<TResult1 | TResult2> {
    return this.get().then(onfulfilled, onrejected);
  }

  /**
   * Fetches the full view entry.
   *
   * `GET /cwe/view/{id}`
   *
   * @returns The view object
   */
  async get(): Promise<CweView> {
    const data = await this.request<{ Views: CweView[] }>(`/cwe/view/${this.id}`);
    return data.Views[0];
  }
}
