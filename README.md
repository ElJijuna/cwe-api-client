# cwe-api-client

[![CI](https://github.com/ElJijuna/cwe-api-client/actions/workflows/ci.yml/badge.svg)](https://github.com/ElJijuna/cwe-api-client/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/cwe-api-client)](https://www.npmjs.com/package/cwe-api-client)
[![Bundle size](https://img.shields.io/bundlephobia/minzip/cwe-api-client)](https://bundlephobia.com/package/cwe-api-client)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/node/v/cwe-api-client)](https://nodejs.org/)

TypeScript client for the [MITRE CWE REST API](https://cwe-api.mitre.org/api/v1).
Works in **Node.js** and the **browser** (isomorphic). Fully typed, zero runtime dependencies.

---

## Installation

```bash
npm install cwe-api-client
```

---

## Quick start

```typescript
import { CweClient } from 'cwe-api-client';

const cwe = new CweClient();

// Custom API base URL (e.g. a mirror)
const cwe = new CweClient({ baseUrl: 'https://my-mirror.example.com/api/v1' });
```

---

## API reference

### Version metadata

```typescript
const version = await cwe.version();

console.log(version.ContentVersion);  // '4.19.1'
console.log(version.ContentDate);     // '2026-01-21'
console.log(version.TotalWeaknesses); // 969
console.log(version.TotalCategories); // 420
console.log(version.TotalViews);      // 58
```

### Multi-ID lookup

Look up multiple CWE entries by their numeric IDs in a single request:

```typescript
const entries = await cwe.lookup([74, 79]);

entries.forEach(e => console.log(`CWE-${e.ID} (${e.Type})`));
// CWE-74 (class_weakness)
// CWE-79 (base_weakness)
```

### Weakness details

```typescript
// Await directly
const weakness = await cwe.weakness(79);

// Or call .get() explicitly
const weakness = await cwe.weakness(79).get();

console.log(weakness.Name);                 // 'Improper Neutralization of Input...'
console.log(weakness.Abstraction);          // 'Base'
console.log(weakness.Status);              // 'Stable'
console.log(weakness.LikelihoodOfExploit); // 'High'
console.log(weakness.Description);
```

### Category details

```typescript
const category = await cwe.category(189);

console.log(category.Name);    // 'Numeric Errors'
console.log(category.Status);  // 'Draft'
console.log(category.Summary);
console.log(category.Relationships?.length); // number of member weaknesses
```

### View details

```typescript
const view = await cwe.view(1425);

console.log(view.Name);    // 'Weaknesses in the 2023 CWE Top 25...'
console.log(view.Type);    // 'Graph'
console.log(view.Status);  // 'Draft'
console.log(view.Members?.length); // 25
```

### Hierarchy navigation

All hierarchy methods accept an optional `viewId` to scope the results to a specific CWE view (e.g. `1000` for Research Concepts):

```typescript
// Direct parents
const parents = await cwe.weakness(74).parents(1000);
parents.forEach(p => console.log(`CWE-${p.ID}`, p.Primary_Parent ? '[primary]' : ''));

// Direct children
const children = await cwe.weakness(74).children(1000);
children.forEach(c => console.log(`CWE-${c.ID} (${c.Type})`));

// Full ancestor tree (recursive, up to the view root)
const ancestors = await cwe.weakness(74).ancestors(1000);
// ancestors[0].Data        → this node
// ancestors[0].Parents     → parent nodes (recursive)

// Full descendant tree (recursive, down to leaf entries)
const descendants = await cwe.weakness(74).descendants(1000);
// descendants[0].Data      → this node
// descendants[0].Children  → child nodes (recursive)
```

---

## Chainable resource pattern

Every resource implements `PromiseLike`, so it can be **awaited directly** or **chained** to sub-methods:

```typescript
// Await directly → fetches the full weakness
const weakness = await cwe.weakness(79);

// Chain → fetches hierarchy
const parents     = await cwe.weakness(74).parents(1000);
const descendants = await cwe.weakness(74).descendants(1000);
```

---

## Request events

Subscribe to every HTTP request for logging, monitoring, or debugging:

```typescript
cwe.on('request', (event) => {
  console.log(`[${event.method}] ${event.url} → ${event.statusCode} (${event.durationMs}ms)`);
  if (event.error) {
    console.error('Request failed:', event.error.message);
  }
});
```

The `event` object contains:

| Field | Type | Description |
|---|---|---|
| `url` | `string` | Full URL that was requested |
| `method` | `'GET'` | HTTP method used |
| `startedAt` | `Date` | When the request started |
| `finishedAt` | `Date` | When the request finished |
| `durationMs` | `number` | Duration in milliseconds |
| `statusCode` | `number \| undefined` | HTTP status code, if a response was received |
| `error` | `Error \| undefined` | Present only if the request failed |

Multiple listeners can be registered. The event is always emitted after the request completes, whether it succeeded or failed.

---

## Error handling

Non-2xx responses throw a `CweApiError` with the HTTP status code and status text:

```typescript
import { CweApiError } from 'cwe-api-client';

try {
  await cwe.weakness(99999).get();
} catch (err) {
  if (err instanceof CweApiError) {
    console.log(err.status);     // 404
    console.log(err.statusText); // 'Not Found'
    console.log(err.message);    // 'CWE API error: 404 Not Found'
    console.log(err.stack);      // full stack trace
  }
}
```

---

## TypeScript types

All domain types are exported:

```typescript
import type {
  // Client
  CweClientOptions, RequestEvent, CweClientEvents,
  // Version
  CweVersion,
  // Multi-ID lookup
  CweEntry, CweEntryType,
  // Weakness
  CweWeakness, CweRelatedWeakness, CweWeaknessOrdinality,
  CweApplicablePlatform, CweAlternateTerm,
  // Category
  CweCategory, CweTaxonomyMapping, CweCategoryRelationship, CweCategoryReference,
  // View
  CweView, CweViewAudience, CweViewMember,
  // Relations / hierarchy
  CweRelationEntry, CweAncestorNode, CweDescendantNode,
} from 'cwe-api-client';
```

---

## Contributing

See [CONTRIBUTING.md](.github/CONTRIBUTING.md).

---

## License

[MIT](LICENSE)
