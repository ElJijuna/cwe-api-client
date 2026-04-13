import type { CweCategory } from '../domain/Category';
import type { RequestFn } from './WeaknessResource';

/**
 * Represents a CWE category resource, providing access to category details.
 *
 * Implements `PromiseLike<CweCategory>` so it can be awaited directly.
 *
 * @example
 * ```typescript
 * // Await directly to get full category data
 * const category = await cwe.category(189);
 *
 * // Or call .get() explicitly
 * const category = await cwe.category(189).get();
 * ```
 */
export class CategoryResource implements PromiseLike<CweCategory> {
  /** @internal */
  constructor(
    private readonly request: RequestFn,
    private readonly id: number,
  ) {}

  /**
   * Allows the resource to be awaited directly, resolving with the full category.
   * Delegates to {@link CategoryResource.get}.
   */
  then<TResult1 = CweCategory, TResult2 = never>(
    onfulfilled?: ((value: CweCategory) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): PromiseLike<TResult1 | TResult2> {
    return this.get().then(onfulfilled, onrejected);
  }

  /**
   * Fetches the full category entry.
   *
   * `GET /cwe/category/{id}`
   *
   * @returns The category object
   */
  async get(): Promise<CweCategory> {
    const data = await this.request<{ Categories: CweCategory[] }>(`/cwe/category/${this.id}`);
    return data.Categories[0];
  }
}
