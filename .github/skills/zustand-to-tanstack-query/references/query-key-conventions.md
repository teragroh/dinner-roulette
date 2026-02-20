# Query Key Conventions

Consistent query keys prevent cache collisions and enable precise invalidation.

## Table of Contents

1. [Key Factory Pattern](#key-factory-pattern)
2. [Naming Rules](#naming-rules)
3. [Per-Feature Factory Example](#per-feature-factory-example)
4. [Invalidation Strategies](#invalidation-strategies)

---

## Key Factory Pattern

Create one factory per domain entity. Each factory returns arrays that nest from broad → specific.

```js
// src/queryKeys.js
export const productKeys = {
  all:     () => ["products"],
  lists:   () => [...productKeys.all(), "list"],
  list:    (filters) => [...productKeys.lists(), filters],
  details: () => [...productKeys.all(), "detail"],
  detail:  (id) => [...productKeys.details(), id],
};

export const orderKeys = {
  all:     () => ["orders"],
  lists:   () => [...orderKeys.all(), "list"],
  list:    (filters) => [...orderKeys.lists(), filters],
  details: () => [...orderKeys.all(), "detail"],
  detail:  (id) => [...orderKeys.details(), id],
};

export const userKeys = {
  all:  () => ["users"],
  me:   () => [...userKeys.all(), "me"],
  detail: (id) => [...userKeys.all(), id],
};
```

### Why functions, not plain arrays?

Returning a new array from a function each time avoids accidental mutation of shared references and keeps the factory extensible.

---

## Naming Rules

| Level | Purpose | Example |
|---|---|---|
| `all()` | Broadest scope — invalidates everything for this entity | `["products"]` |
| `lists()` | All list queries (any filter combination) | `["products", "list"]` |
| `list(filters)` | A specific filtered/paginated list | `["products", "list", { page: 2, status: "active" }]` |
| `details()` | All detail queries | `["products", "detail"]` |
| `detail(id)` | A single entity by ID | `["products", "detail", 42]` |

### Conventions

- **Plural entity name** as the first element: `"products"`, `"orders"`, `"users"`.
- **Segment type** as the second element: `"list"` or `"detail"`.
- **Variables** (filters, IDs) as subsequent elements.
- Filter objects are deterministically hashed by TanStack Query, so `{ page, status }` === `{ status, page }`.

---

## Per-Feature Factory Example

For larger apps, co-locate keys with the feature:

```
src/
  features/
    products/
      hooks/
        useProducts.js
        useCreateProduct.js
      queryKeys.js        ← keys for this feature only
    orders/
      hooks/
        useOrders.js
      queryKeys.js
```

```js
// src/features/products/queryKeys.js
export const productKeys = {
  all:     () => ["products"],
  lists:   () => [...productKeys.all(), "list"],
  list:    (filters) => [...productKeys.lists(), filters],
  details: () => [...productKeys.all(), "detail"],
  detail:  (id) => [...productKeys.details(), id],
};
```

---

## Invalidation Strategies

### After creating an item — invalidate all lists

```js
queryClient.invalidateQueries({ queryKey: productKeys.lists() });
// Invalidates ["products", "list"] and all sub-keys like ["products", "list", { page: 1 }]
```

### After updating an item — invalidate the detail AND lists

```js
queryClient.invalidateQueries({ queryKey: productKeys.detail(id) });
queryClient.invalidateQueries({ queryKey: productKeys.lists() });
```

### After deleting — invalidate lists (detail is no longer relevant)

```js
queryClient.invalidateQueries({ queryKey: productKeys.lists() });
queryClient.removeQueries({ queryKey: productKeys.detail(id) });
```

### Nuclear option — invalidate everything for the entity

```js
queryClient.invalidateQueries({ queryKey: productKeys.all() });
// Invalidates ALL product queries: lists, details, everything
```

### Cross-entity invalidation

When creating an order might affect product stock:

```js
const createOrderMutation = useMutation({
  mutationFn: createOrder,
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
    queryClient.invalidateQueries({ queryKey: productKeys.lists() }); // stock changed
  },
});
```
