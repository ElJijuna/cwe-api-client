import type { CweWeakness } from '../domain/Weakness';
import type { CweRelationEntry, CweAncestorNode, CweDescendantNode } from '../domain/Relations';

/** @internal */
export type RequestFn = <T>(
  path: string,
  params?: Record<string, string | number | boolean>,
) => Promise<T>;

/**
 * Represents a CWE weakness resource, providing access to weakness details
 * and its position in the CWE hierarchy.
 *
 * Implements `PromiseLike<CweWeakness>` so it can be awaited directly to
 * fetch the full weakness, while also exposing hierarchy methods.
 *
 * @example
 * ```typescript
 * // Await directly to get full weakness data
 * const weakness = await cwe.weakness(79);
 *
 * // Or call .get() explicitly
 * const weakness = await cwe.weakness(79).get();
 *
 * // Navigate the hierarchy
 * const parents = await cwe.weakness(74).parents(1000);
 * const children = await cwe.weakness(74).children(1000);
 * const ancestors = await cwe.weakness(74).ancestors(1000);
 * const descendants = await cwe.weakness(74).descendants(1000);
 * ```
 */
export class WeaknessResource implements PromiseLike<CweWeakness> {
  /** @internal */
  constructor(
    private readonly request: RequestFn,
    private readonly id: number,
  ) {}

  /**
   * Allows the resource to be awaited directly, resolving with the full weakness.
   * Delegates to {@link WeaknessResource.get}.
   */
  then<TResult1 = CweWeakness, TResult2 = never>(
    onfulfilled?: ((value: CweWeakness) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): PromiseLike<TResult1 | TResult2> {
    return this.get().then(onfulfilled, onrejected);
  }

  /**
   * Fetches the full weakness entry.
   *
   * `GET /cwe/weakness/{id}`
   *
   * @returns The weakness object
   */
  async get(): Promise<CweWeakness> {
    const data = await this.request<{ Weaknesses: CweWeakness[] }>(`/cwe/weakness/${this.id}`);
    return data.Weaknesses[0];
  }

  /**
   * Fetches the direct parents of this weakness in a given view.
   *
   * `GET /cwe/{id}/parents?view={viewId}`
   *
   * @param viewId - CWE view ID to scope the hierarchy (e.g. `1000`)
   * @returns Array of direct parent entries
   *
   * @example
   * ```typescript
   * const parents = await cwe.weakness(74).parents(1000);
   * ```
   */
  async parents(viewId?: number): Promise<CweRelationEntry[]> {
    return this.request<CweRelationEntry[]>(
      `/cwe/${this.id}/parents`,
      viewId !== undefined ? { view: viewId } : undefined,
    );
  }

  /**
   * Fetches the direct children of this weakness in a given view.
   *
   * `GET /cwe/{id}/children?view={viewId}`
   *
   * @param viewId - CWE view ID to scope the hierarchy (e.g. `1000`)
   * @returns Array of direct child entries
   *
   * @example
   * ```typescript
   * const children = await cwe.weakness(74).children(1000);
   * ```
   */
  async children(viewId?: number): Promise<CweRelationEntry[]> {
    return this.request<CweRelationEntry[]>(
      `/cwe/${this.id}/children`,
      viewId !== undefined ? { view: viewId } : undefined,
    );
  }

  /**
   * Fetches the full ancestor tree of this weakness in a given view.
   *
   * `GET /cwe/{id}/ancestors?view={viewId}`
   *
   * @param viewId - CWE view ID to scope the hierarchy (e.g. `1000`)
   * @returns Recursive ancestor tree from this node up to the view root
   *
   * @example
   * ```typescript
   * const tree = await cwe.weakness(74).ancestors(1000);
   * ```
   */
  async ancestors(viewId?: number): Promise<CweAncestorNode[]> {
    return this.request<CweAncestorNode[]>(
      `/cwe/${this.id}/ancestors`,
      viewId !== undefined ? { view: viewId } : undefined,
    );
  }

  /**
   * Fetches the full descendant tree of this weakness in a given view.
   *
   * `GET /cwe/{id}/descendants?view={viewId}`
   *
   * @param viewId - CWE view ID to scope the hierarchy (e.g. `1000`)
   * @returns Recursive descendant tree from this node down to leaf entries
   *
   * @example
   * ```typescript
   * const tree = await cwe.weakness(74).descendants(1000);
   * ```
   */
  async descendants(viewId?: number): Promise<CweDescendantNode[]> {
    return this.request<CweDescendantNode[]>(
      `/cwe/${this.id}/descendants`,
      viewId !== undefined ? { view: viewId } : undefined,
    );
  }
}
