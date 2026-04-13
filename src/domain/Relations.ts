/**
 * A CWE entry as represented in hierarchy relationship responses.
 */
export interface CweRelationEntry {
  /** Entry type (e.g. `'pillar_weakness'`, `'class_weakness'`, `'view'`) */
  Type: string;
  /** CWE identifier string */
  ID: string;
  /** View context for this relationship */
  ViewID: string;
  /** Whether this is the primary parent (present on parent entries) */
  Primary_Parent?: boolean;
}

/**
 * A node in the ancestor tree returned by `GET /cwe/{id}/ancestors`.
 * Each node references its parent chain recursively up to the view root.
 */
export interface CweAncestorNode {
  /** This node's CWE entry data */
  Data: CweRelationEntry;
  /** Parent nodes, or `null` if this node is the root */
  Parents: CweAncestorNode[] | null;
}

/**
 * A node in the descendant tree returned by `GET /cwe/{id}/descendants`.
 * Each node references its children recursively down to leaf entries.
 */
export interface CweDescendantNode {
  /** This node's CWE entry data */
  Data: CweRelationEntry;
  /** Child nodes, or `null` if this node is a leaf */
  Children: CweDescendantNode[] | null;
}
