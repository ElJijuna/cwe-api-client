# Roadmap

## Legend
- ✅ Implemented
- ⬜ Pending

---

## CweClient (entry point)

| Method | Endpoint | Status |
|--------|----------|--------|
| `version()` | `GET /cwe/version` | ✅ |
| `lookup(ids)` | `GET /cwe/{ids}` | ✅ |
| `weakness(id)` | — chainable | ✅ |
| `category(id)` | — chainable | ✅ |
| `view(id)` | — chainable | ✅ |

---

## WeaknessResource

| Method | Endpoint | Status |
|--------|----------|--------|
| `get()` | `GET /cwe/weakness/{id}` | ✅ |
| `parents(viewId?)` | `GET /cwe/{id}/parents?view={viewId}` | ✅ |
| `children(viewId?)` | `GET /cwe/{id}/children?view={viewId}` | ✅ |
| `ancestors(viewId?)` | `GET /cwe/{id}/ancestors?view={viewId}` | ✅ |
| `descendants(viewId?)` | `GET /cwe/{id}/descendants?view={viewId}` | ✅ |

---

## CategoryResource

| Method | Endpoint | Status |
|--------|----------|--------|
| `get()` | `GET /cwe/category/{id}` | ✅ |

---

## ViewResource

| Method | Endpoint | Status |
|--------|----------|--------|
| `get()` | `GET /cwe/view/{id}` | ✅ |

---

## Planned

| Feature | Notes | Status |
|---------|-------|--------|
| Pagination support | Some endpoints may return paginated results in future API versions | ⬜ |
| Full weakness type coverage | Extended fields (e.g. `DemonstrativeExamples`, `PotentialMitigations`, `References`) | ⬜ |
| Full category type coverage | Extended fields (e.g. `Notes`) | ⬜ |
| Full view type coverage | Extended fields (e.g. `Notes`, `Filter`) | ⬜ |
| `CweClient.weaknesses()` bulk list | Fetch all weaknesses | ⬜ |
| `CweClient.categories()` bulk list | Fetch all categories | ⬜ |
| `CweClient.views()` bulk list | Fetch all views | ⬜ |

---
