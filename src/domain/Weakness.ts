/**
 * A related weakness reference within a CWE entry.
 */
export interface CweRelatedWeakness {
  /** Relationship nature (e.g. `'ChildOf'`, `'CanPrecede'`, `'PeerOf'`) */
  Nature: string;
  /** Related CWE identifier */
  CweID: string;
  /** View context for this relationship */
  ViewID: string;
  /** Ordinal designation (e.g. `'Primary'`) */
  Ordinal?: string;
}

/**
 * Weakness ordinality entry.
 */
export interface CweWeaknessOrdinality {
  /** Ordinality value (e.g. `'Resultant'`, `'Primary'`) */
  Ordinality: string;
}

/**
 * An applicable platform entry for a weakness.
 */
export interface CweApplicablePlatform {
  /** Platform type (e.g. `'Language'`, `'Technology'`, `'Operating System'`) */
  Type: string;
  /** Platform class (e.g. `'Not Language-Specific'`, `'Web Based'`) */
  Class?: string;
  /** Platform name (e.g. `'Java'`, `'AI/ML'`) */
  Name?: string;
  /** Prevalence (e.g. `'Often'`, `'Sometimes'`, `'Undetermined'`) */
  Prevalence: string;
}

/**
 * An alternate term or synonym for a weakness.
 */
export interface CweAlternateTerm {
  /** Alternate term string */
  Term: string;
  /** Description of when/how this term is used */
  Description: string;
}

/**
 * Full weakness entry returned by `GET /cwe/weakness/{id}`.
 */
export interface CweWeakness {
  /** CWE identifier string (e.g. `'79'`) */
  ID: string;
  /** Weakness name */
  Name: string;
  /** Abstraction level (e.g. `'Pillar'`, `'Class'`, `'Base'`, `'Variant'`) */
  Abstraction: string;
  /** Structure type (e.g. `'Simple'`, `'Composite'`, `'Chain'`) */
  Structure: string;
  /** Status (e.g. `'Stable'`, `'Draft'`, `'Incomplete'`, `'Deprecated'`) */
  Status: string;
  /** Path to a diagram image, if available */
  Diagram?: string;
  /** Short description of the weakness */
  Description: string;
  /** Extended description with additional details */
  ExtendedDescription?: string;
  /** Likelihood of exploitation (e.g. `'High'`, `'Medium'`, `'Low'`) */
  LikelihoodOfExploit?: string;
  /** References to related weaknesses */
  RelatedWeaknesses?: CweRelatedWeakness[];
  /** Ordinality of this weakness */
  WeaknessOrdinalities?: CweWeaknessOrdinality[];
  /** Platforms to which this weakness applies */
  ApplicablePlatforms?: CweApplicablePlatform[];
  /** Background context paragraphs */
  BackgroundDetails?: string[];
  /** Alternate names or terms for this weakness */
  AlternateTerms?: CweAlternateTerm[];
}
