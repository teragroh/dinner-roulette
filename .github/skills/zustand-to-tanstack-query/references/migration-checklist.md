# Migration Checklist & Documentation Template

Use this checklist for each Zustand store during conversion, and the template at the end to produce a summary document once all stores are migrated.

## Table of Contents

1. [Per-Store Checklist](#per-store-checklist)
2. [Post-Migration Verification](#post-migration-verification)
3. [Documentation Template](#documentation-template)

---

## Per-Store Checklist

Copy this checklist for each Zustand store being migrated:

### Store: `[store file path]`

#### Audit
- [ ] Listed all properties and actions in the store
- [ ] Classified each as server state or client state
- [ ] Identified API functions used (fetch, axios, etc.)
- [ ] Presented plan to user and received approval

#### Setup (first store only)
- [ ] Installed `@tanstack/react-query`
- [ ] Installed `@tanstack/react-query-devtools` (dev dependency)
- [ ] Created `QueryClient` with sensible defaults
- [ ] Wrapped app root in `QueryClientProvider`
- [ ] Added `ReactQueryDevtools` component

#### Query Keys
- [ ] Created query key factory for this domain entity
- [ ] Keys follow `[entity] → [scope] → [params]` convention
- [ ] Keys include all variables the query function depends on

#### Hooks Created
- [ ] `useQuery` hook(s) for GET operations
- [ ] `useMutation` hook(s) for POST operations
- [ ] `useMutation` hook(s) for PUT/PATCH operations
- [ ] `useMutation` hook(s) for DELETE operations
- [ ] Dependent queries use `enabled` option
- [ ] Mutations invalidate appropriate queries in `onSettled`

#### Component Refactor
- [ ] Removed `useEffect` + fetch calls
- [ ] Replaced store selectors with hook destructuring
- [ ] Replaced `isLoading` with `isPending`
- [ ] Replaced string errors with `error.message`
- [ ] Replaced `store.action()` calls with `mutation.mutate()`
- [ ] Added `disabled={mutation.isPending}` to submit buttons
- [ ] Removed Zustand store imports from components

#### Cleanup
- [ ] Deleted Zustand store file (or removed only server-state slices)
- [ ] Removed unused Zustand imports
- [ ] Verified no orphaned references to deleted store

#### Testing
- [ ] Existing tests pass
- [ ] Added tests for new query hooks
- [ ] Added tests for new mutation hooks
- [ ] Component tests updated to use QueryClientProvider wrapper

---

## Post-Migration Verification

After all stores are migrated:

- [ ] App builds without errors
- [ ] All existing tests pass
- [ ] Manual smoke test: all pages load data correctly
- [ ] Manual smoke test: all create/update/delete operations work
- [ ] React Query Devtools show expected queries and cache
- [ ] No console warnings about missing query keys or functions
- [ ] If no Zustand stores remain: uninstalled `zustand` package
- [ ] Removed any leftover empty `stores/` directories

---

## Documentation Template

After migration is complete, produce a summary using this template:

```markdown
# Zustand → TanStack Query Migration Summary

## Date
[Date of migration]

## Scope
[Brief description of what was migrated]

## Stores Migrated

| Zustand Store | Status | Notes |
|---|---|---|
| `src/stores/useProductStore.js` | Fully removed | All state was server state |
| `src/stores/useAppStore.js` | Partially migrated | Client state (theme, sidebar) remains |

## New Files Created

| File | Purpose |
|---|---|
| `src/queryClient.js` | QueryClient configuration |
| `src/queryKeys.js` | Query key factories |
| `src/hooks/useProducts.js` | Product list query hook |
| `src/hooks/useCreateProduct.js` | Create product mutation hook |
| `src/hooks/useUpdateProduct.js` | Update product mutation hook |
| `src/hooks/useDeleteProduct.js` | Delete product mutation hook |

## Files Modified

| File | Change |
|---|---|
| `src/App.jsx` | Added QueryClientProvider + Devtools |
| `src/components/ProductList.jsx` | Replaced store with useProducts hook |
| `src/components/ProductForm.jsx` | Replaced store with useCreateProduct hook |

## Files Deleted

| File | Reason |
|---|---|
| `src/stores/useProductStore.js` | Fully replaced by TanStack Query hooks |

## Dependencies Changed

| Package | Action | Version |
|---|---|---|
| `@tanstack/react-query` | Added | ^5.x.x |
| `@tanstack/react-query-devtools` | Added (dev) | ^5.x.x |
| `zustand` | Removed / Kept | — |

## Client State Remaining in Zustand

| Store | State | Reason |
|---|---|---|
| `useAppStore` | `theme`, `sidebarOpen` | Pure client-side UI state |

## Breaking Changes
[List any breaking changes, if applicable]

## Follow-up Items
- [ ] [Any items for future attention]
```
