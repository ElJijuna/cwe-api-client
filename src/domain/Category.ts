/**
 * A taxonomy mapping entry linking a category to an external standard.
 */
export interface CweTaxonomyMapping {
  /** Name of the external taxonomy (e.g. `'SEI CERT Perl Coding Standard'`) */
  TaxonomyName: string;
  /** Entry identifier within the taxonomy */
  EntryID?: string;
  /** Entry name within the taxonomy */
  EntryName: string;
  /** How well the mapping fits (e.g. `'CWE More Abstract'`, `'Exact'`) */
  MappingFit?: string;
}

/**
 * A member relationship entry within a category.
 */
export interface CweCategoryRelationship {
  /** CWE identifier of the member */
  CweID: string;
  /** View context for this membership */
  ViewID: string;
}

/**
 * An external reference cited by a category.
 */
export interface CweCategoryReference {
  /** External reference identifier (e.g. `'REF-1287'`) */
  ExternalReferenceID: string;
}

/**
 * Full category entry returned by `GET /cwe/category/{id}`.
 */
export interface CweCategory {
  /** CWE identifier string (e.g. `'189'`) */
  ID: string;
  /** Category name */
  Name: string;
  /** Status (e.g. `'Draft'`, `'Stable'`, `'Deprecated'`) */
  Status: string;
  /** Short summary of what this category covers */
  Summary: string;
  /** Mappings to external taxonomies */
  TaxonomyMappings?: CweTaxonomyMapping[];
  /** Weaknesses that belong to this category */
  Relationships?: CweCategoryRelationship[];
  /** External references */
  References?: CweCategoryReference[];
}
