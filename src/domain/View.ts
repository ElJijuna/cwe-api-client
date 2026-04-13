/**
 * An audience entry describing who a view is relevant for.
 */
export interface CweViewAudience {
  /** Audience type (e.g. `'Software Developers'`, `'Educators'`) */
  Type: string;
  /** Description of how this view is relevant to this audience */
  Description: string;
}

/**
 * A member entry within a view.
 */
export interface CweViewMember {
  /** CWE identifier of the member */
  CweID: string;
  /** View identifier this membership belongs to */
  ViewID: string;
}

/**
 * Full view entry returned by `GET /cwe/view/{id}`.
 */
export interface CweView {
  /** CWE identifier string (e.g. `'1425'`) */
  ID: string;
  /** View name */
  Name: string;
  /** View type (e.g. `'Graph'`, `'Explicit'`, `'Implicit'`) */
  Type: string;
  /** Status (e.g. `'Draft'`, `'Stable'`, `'Deprecated'`) */
  Status: string;
  /** Objective description of the view */
  Objective?: string;
  /** Intended audiences for this view */
  Audience?: CweViewAudience[];
  /** CWE entries that are members of this view */
  Members?: CweViewMember[];
}
