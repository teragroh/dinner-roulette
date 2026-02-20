---
name: zustand-to-tanstack-query
description: >
  Convert a React JavaScript application from Zustand stores (with manual fetch/useEffect API calls)
  to TanStack Query v5 for server-state management. Use on prompts like "migrate from zustand to
  tanstack query", "convert store to react query", "replace zustand with tanstack query",
  "refactor API calls to use useQuery/useMutation", or any request to move server-state out of
  a client-state store into TanStack Query. Targets JavaScript (not TypeScript) React apps.
---

# Zustand → TanStack Query Migration

Migrate server-state out of Zustand stores into TanStack Query v5 hooks, one store at a time.

## When to Keep Zustand

TanStack Query replaces **server state** only. Keep Zustand (or another client-state library) for
truly client-only state such as theme, sidebar open/closed, form wizard step, drag positions, etc.
After migration, the remaining Zustand stores should contain only synchronous client state.

## Workflow Overview

The migration follows these steps for **each** Zustand store:

1. **Audit** — Scan the store and classify every slice of state
2. **Plan** — Present a conversion plan to the user for approval
3. **Install** — Add `@tanstack/react-query` and `@tanstack/react-query-devtools` (once)
4. **Provider** — Wrap the app in `QueryClientProvider` (once)
5. **Query keys** — Create a query-key factory file
6. **Custom hooks** — Write `useQuery` / `useMutation` hooks to replace store actions
7. **Refactor components** — Swap store selectors for hook results
8. **Invalidation** — Wire mutations to invalidate relevant queries
9. **Cleanup** — Remove Zustand store file and uninstall Zustand if no stores remain
10. **Test** — Verify all existing tests pass; add query-hook tests
11. **Document** — Record what changed

### Step 1 — Audit the Store

Search for Zustand store files using these grep patterns:

```
create(         — Zustand store creation
useStore        — Zustand hook usage
zustand         — import references
fetch(          — manual fetch calls inside stores
axios           — axios calls inside stores
async           — async actions (likely API calls)
setState        — Zustand state updates
getState        — Zustand state reads
```

For each store, classify every property and action:

| Property / Action | Type | Migration target |
|---|---|---|
| `items`, `data`, `list` | server state (fetched) | `useQuery` |
| `isLoading`, `error` | derived server state | `useQuery` returns `isPending`, `isError`, `error` |
| `fetchItems()` | async GET action | `queryFn` inside `useQuery` |
| `createItem()` | async POST action | `useMutation` |
| `updateItem()` | async PUT/PATCH action | `useMutation` |
| `deleteItem()` | async DELETE action | `useMutation` |
| `theme`, `sidebarOpen` | client state | **Keep in Zustand** |
| `setFilter`, `sortBy` | UI/client state | **Keep in Zustand** or `useState` |

### Step 2 — Present Plan for Approval

Before writing any code, present the user with a table listing:
- Every Zustand store file path
- Every property/action and its classification (server vs. client)
- The proposed TanStack Query hook name
- Any state that remains in Zustand

**Wait for user approval before proceeding.**

### Step 3 — Install Dependencies (Once)

```bash
npm install @tanstack/react-query
npm install --save-dev @tanstack/react-query-devtools
```

### Step 4 — Add QueryClientProvider (Once)

Wrap the app root in `QueryClientProvider`. See [conversion-patterns.md](references/conversion-patterns.md) for the provider setup pattern.

### Step 5 — Create Query Key Factory

Create a `src/queryKeys.js` (or per-feature key files). See [query-key-conventions.md](references/query-key-conventions.md) for the factory pattern and naming rules.

### Step 6 — Write Custom Hooks

For each server-state slice, create a custom hook file. See [conversion-patterns.md](references/conversion-patterns.md) for:
- `useQuery` patterns (GET → query)
- `useMutation` patterns (POST/PUT/DELETE → mutation)
- Dependent queries (`enabled` option)
- Optimistic updates
- Paginated / infinite queries

### Step 7 — Refactor Components

Replace Zustand selectors with TanStack Query hook destructuring. See [conversion-patterns.md](references/conversion-patterns.md) for before/after component examples.

### Step 8 — Wire Invalidation

After each mutation succeeds, invalidate related queries so the UI stays fresh. Common patterns:

```js
const queryClient = useQueryClient();

const mutation = useMutation({
  mutationFn: createItem,
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: itemKeys.lists() });
  },
});
```

### Step 9 — Cleanup

- Delete the migrated Zustand store file.
- Remove Zustand imports from converted components.
- If no Zustand stores remain, run `npm uninstall zustand`.

### Step 10 — Test

- Run existing test suite; fix any breakages.
- Add hook-level tests for new query/mutation hooks.
- See [testing-patterns.md](references/testing-patterns.md) for wrapper and assertion patterns.

### Step 11 — Document

After all stores are migrated, produce a summary. See [migration-checklist.md](references/migration-checklist.md) for the documentation template.

## Important TanStack Query v5 Defaults

Be aware of these defaults when migrating — they often surprise first-time users:

- Cached data is considered **stale immediately** (`staleTime: 0`). Set `staleTime` to reduce refetches.
- Stale queries refetch on **window focus**, **mount**, and **reconnect**.
- Failed queries retry **3 times** with exponential backoff. Set `retry: false` in tests.
- Inactive queries are garbage-collected after **5 minutes** (`gcTime`).
- Only the **object signature** is supported: `useQuery({ queryKey, queryFn, ...options })`.
- Status is `'pending'` (not `'loading'`). Use `isPending`, not the old `isLoading` for initial load; `isLoading` = `isPending && isFetching`.

## Reference Files

| File | When to read |
|---|---|
| [references/conversion-patterns.md](references/conversion-patterns.md) | Writing hooks and refactoring components |
| [references/query-key-conventions.md](references/query-key-conventions.md) | Setting up query key factories |
| [references/testing-patterns.md](references/testing-patterns.md) | Writing tests for query/mutation hooks |
| [references/migration-checklist.md](references/migration-checklist.md) | Documenting the migration at the end |
