---
name: Feature request
about: Suggest a new endpoint or capability
labels: enhancement
---

## Which CWE API endpoint should be added?

<!-- e.g. GET /cwe/{id}/parents?view={viewId} -->

## Use case

<!-- Why is this endpoint useful? What problem does it solve? -->

## Proposed API surface

```typescript
// How you'd like to call it
const parents = await cwe.weakness(74).parents(1000);
```
