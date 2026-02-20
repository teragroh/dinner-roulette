# Conversion Patterns — Zustand → TanStack Query v5 (JavaScript)

> All examples use plain JavaScript (no TypeScript). TanStack Query v5 object-only API.

## Table of Contents

1. [Provider Setup](#1-provider-setup)
2. [GET → useQuery](#2-get--usequery)
3. [POST → useMutation](#3-post--usemutation)
4. [PUT/PATCH → useMutation](#4-putpatch--usemutation)
5. [DELETE → useMutation](#5-delete--usemutation)
6. [Dependent Queries](#6-dependent-queries)
7. [Paginated Queries](#7-paginated-queries)
8. [Infinite Scroll Queries](#8-infinite-scroll-queries)
9. [Optimistic Updates (UI-based)](#9-optimistic-updates-ui-based)
10. [Optimistic Updates (Cache-based)](#10-optimistic-updates-cache-based)
11. [Component Refactor](#11-component-refactor)
12. [Keeping Client State in Zustand](#12-keeping-client-state-in-zustand)

---

## 1. Provider Setup

Set up once in the app entry point.

```jsx
// src/queryClient.js
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 minutes — adjust to your app
      retry: 1,
    },
  },
});
```

```jsx
// src/App.jsx  (or your root component)
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { queryClient } from "./queryClient";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* your app routes / components */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
```

---

## 2. GET → useQuery

### Before (Zustand)

```js
// src/stores/useProductStore.js
import { create } from "zustand";
import { fetchProducts } from "../api/products";

const useProductStore = create((set) => ({
  products: [],
  isLoading: false,
  error: null,

  fetchProducts: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await fetchProducts();
      set({ products: data, isLoading: false });
    } catch (err) {
      set({ error: err.message, isLoading: false });
    }
  },
}));

export default useProductStore;
```

```jsx
// Component usage
import { useEffect } from "react";
import useProductStore from "../stores/useProductStore";

function ProductList() {
  const { products, isLoading, error, fetchProducts } = useProductStore();

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  return <ul>{products.map((p) => <li key={p.id}>{p.name}</li>)}</ul>;
}
```

### After (TanStack Query)

```js
// src/hooks/useProducts.js
import { useQuery } from "@tanstack/react-query";
import { fetchProducts } from "../api/products";
import { productKeys } from "../queryKeys";

export function useProducts() {
  return useQuery({
    queryKey: productKeys.lists(),
    queryFn: fetchProducts,
  });
}
```

```jsx
// Component usage
import { useProducts } from "../hooks/useProducts";

function ProductList() {
  const { data: products, isPending, isError, error } = useProducts();

  if (isPending) return <p>Loading...</p>;
  if (isError) return <p>Error: {error.message}</p>;
  return <ul>{products.map((p) => <li key={p.id}>{p.name}</li>)}</ul>;
}
```

**Key differences:**
- No `useEffect` needed — `useQuery` fetches on mount automatically.
- `isLoading` → `isPending` (v5 naming). `isLoading` in v5 means `isPending && isFetching`.
- Error is an `Error` object, access `.message`.
- Data is `undefined` until first successful fetch, not `[]`.

---

## 3. POST → useMutation

### Before (Zustand)

```js
// Inside Zustand store
createProduct: async (newProduct) => {
  set({ isLoading: true });
  try {
    const created = await api.post("/products", newProduct);
    set((state) => ({
      products: [...state.products, created],
      isLoading: false,
    }));
  } catch (err) {
    set({ error: err.message, isLoading: false });
  }
},
```

### After (TanStack Query)

```js
// src/hooks/useCreateProduct.js
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createProduct } from "../api/products";
import { productKeys } from "../queryKeys";

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProduct,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
}
```

```jsx
// Component usage
import { useCreateProduct } from "../hooks/useCreateProduct";

function AddProductForm() {
  const { mutate, isPending, isError, error } = useCreateProduct();

  const handleSubmit = (formData) => {
    mutate(formData, {
      onSuccess: () => {
        // navigate, show toast, etc.
      },
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      {isError && <p>Error: {error.message}</p>}
      <button type="submit" disabled={isPending}>
        {isPending ? "Creating..." : "Create"}
      </button>
    </form>
  );
}
```

---

## 4. PUT/PATCH → useMutation

### Before (Zustand)

```js
updateProduct: async (id, updates) => {
  try {
    const updated = await api.put(`/products/${id}`, updates);
    set((state) => ({
      products: state.products.map((p) => (p.id === id ? updated : p)),
    }));
  } catch (err) {
    set({ error: err.message });
  }
},
```

### After (TanStack Query)

```js
// src/hooks/useUpdateProduct.js
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateProduct } from "../api/products";
import { productKeys } from "../queryKeys";

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }) => updateProduct(id, updates),
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: productKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
}
```

---

## 5. DELETE → useMutation

### Before (Zustand)

```js
deleteProduct: async (id) => {
  try {
    await api.delete(`/products/${id}`);
    set((state) => ({
      products: state.products.filter((p) => p.id !== id),
    }));
  } catch (err) {
    set({ error: err.message });
  }
},
```

### After (TanStack Query)

```js
// src/hooks/useDeleteProduct.js
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteProduct } from "../api/products";
import { productKeys } from "../queryKeys";

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProduct,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
}
```

---

## 6. Dependent Queries

When one query depends on data from another (e.g., fetch user, then fetch user's orders):

### Before (Zustand)

```js
// Inside store — sequential fetching
fetchUserOrders: async () => {
  const user = await api.get("/me");
  set({ user });
  const orders = await api.get(`/users/${user.id}/orders`);
  set({ orders });
},
```

### After (TanStack Query)

```js
import { useQuery } from "@tanstack/react-query";

export function useUser() {
  return useQuery({
    queryKey: ["user", "me"],
    queryFn: () => api.get("/me"),
  });
}

export function useUserOrders(userId) {
  return useQuery({
    queryKey: ["orders", { userId }],
    queryFn: () => api.get(`/users/${userId}/orders`),
    enabled: !!userId, // only runs when userId is available
  });
}
```

```jsx
// Component
function UserOrders() {
  const { data: user } = useUser();
  const { data: orders, isPending } = useUserOrders(user?.id);

  if (isPending) return <p>Loading orders...</p>;
  return <ul>{orders.map((o) => <li key={o.id}>{o.name}</li>)}</ul>;
}
```

---

## 7. Paginated Queries

### Before (Zustand)

```js
const useProductStore = create((set, get) => ({
  products: [],
  page: 1,
  totalPages: 1,

  fetchPage: async (page) => {
    const res = await api.get(`/products?page=${page}`);
    set({ products: res.items, page, totalPages: res.totalPages });
  },

  nextPage: () => get().fetchPage(get().page + 1),
  prevPage: () => get().fetchPage(get().page - 1),
}));
```

### After (TanStack Query)

```js
import { useState } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { productKeys } from "../queryKeys";

export function useProductsPage() {
  const [page, setPage] = useState(1);

  const query = useQuery({
    queryKey: productKeys.list({ page }),
    queryFn: () => api.get(`/products?page=${page}`),
    placeholderData: keepPreviousData, // keeps previous page visible while next loads
  });

  return {
    ...query,
    page,
    nextPage: () => setPage((p) => p + 1),
    prevPage: () => setPage((p) => Math.max(1, p - 1)),
  };
}
```

---

## 8. Infinite Scroll Queries

### Before (Zustand)

```js
const useProductStore = create((set, get) => ({
  products: [],
  nextCursor: null,
  hasMore: true,

  loadMore: async () => {
    const cursor = get().nextCursor;
    const res = await api.get(`/products?cursor=${cursor || ""}`);
    set((state) => ({
      products: [...state.products, ...res.items],
      nextCursor: res.nextCursor,
      hasMore: !!res.nextCursor,
    }));
  },
}));
```

### After (TanStack Query)

```js
import { useInfiniteQuery } from "@tanstack/react-query";
import { productKeys } from "../queryKeys";

export function useInfiniteProducts() {
  return useInfiniteQuery({
    queryKey: productKeys.lists(),
    queryFn: ({ pageParam }) => api.get(`/products?cursor=${pageParam}`),
    initialPageParam: "",
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });
}
```

```jsx
// Component
function InfiniteProductList() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isPending } =
    useInfiniteProducts();

  if (isPending) return <p>Loading...</p>;

  return (
    <>
      <ul>
        {data.pages.flatMap((page) =>
          page.items.map((p) => <li key={p.id}>{p.name}</li>)
        )}
      </ul>
      {hasNextPage && (
        <button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
          {isFetchingNextPage ? "Loading more..." : "Load More"}
        </button>
      )}
    </>
  );
}
```

---

## 9. Optimistic Updates (UI-based)

The simpler approach — render optimistic UI from mutation variables, no cache manipulation.

```js
export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProduct,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
}
```

```jsx
function ProductList() {
  const { data: products } = useProducts();
  const createMutation = useCreateProduct();

  return (
    <ul>
      {products?.map((p) => (
        <li key={p.id}>{p.name}</li>
      ))}
      {createMutation.isPending && (
        <li style={{ opacity: 0.5 }}>{createMutation.variables.name}</li>
      )}
    </ul>
  );
}
```

---

## 10. Optimistic Updates (Cache-based)

When multiple components need to see the optimistic state:

```js
export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }) => updateProduct(id, updates),

    onMutate: async ({ id, updates }, context) => {
      await context.client.cancelQueries({ queryKey: productKeys.detail(id) });

      const previous = context.client.getQueryData(productKeys.detail(id));

      context.client.setQueryData(productKeys.detail(id), (old) => ({
        ...old,
        ...updates,
      }));

      return { previous, id };
    },

    onError: (_err, _vars, onMutateResult, context) => {
      context.client.setQueryData(
        productKeys.detail(onMutateResult.id),
        onMutateResult.previous
      );
    },

    onSettled: (_data, _error, variables, _onMutateResult, context) => {
      context.client.invalidateQueries({
        queryKey: productKeys.detail(variables.id),
      });
      context.client.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
}
```

---

## 11. Component Refactor

### Before (Zustand selectors)

```jsx
import { useEffect } from "react";
import useProductStore from "../stores/useProductStore";

function ProductPage({ productId }) {
  const product = useProductStore((s) => s.products.find((p) => p.id === productId));
  const isLoading = useProductStore((s) => s.isLoading);
  const error = useProductStore((s) => s.error);
  const fetchProducts = useProductStore((s) => s.fetchProducts);
  const deleteProduct = useProductStore((s) => s.deleteProduct);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;
  if (!product) return <p>Not found</p>;

  return (
    <div>
      <h1>{product.name}</h1>
      <button onClick={() => deleteProduct(productId)}>Delete</button>
    </div>
  );
}
```

### After (TanStack Query hooks)

```jsx
import { useProduct } from "../hooks/useProduct";
import { useDeleteProduct } from "../hooks/useDeleteProduct";

function ProductPage({ productId }) {
  const { data: product, isPending, isError, error } = useProduct(productId);
  const deleteMutation = useDeleteProduct();

  if (isPending) return <p>Loading...</p>;
  if (isError) return <p>{error.message}</p>;
  if (!product) return <p>Not found</p>;

  return (
    <div>
      <h1>{product.name}</h1>
      <button
        onClick={() => deleteMutation.mutate(productId)}
        disabled={deleteMutation.isPending}
      >
        {deleteMutation.isPending ? "Deleting..." : "Delete"}
      </button>
    </div>
  );
}
```

**Checklist for each component:**
- [ ] Remove `useEffect` that called fetch actions
- [ ] Replace store selectors with query hook destructuring
- [ ] Replace store mutation calls with `mutation.mutate()`
- [ ] Replace `isLoading` → `isPending` for initial load
- [ ] Replace string `error` → `error.message`
- [ ] Remove Zustand store import

---

## 12. Keeping Client State in Zustand

If a store has a mix of server and client state, extract only the server state.

### Before

```js
const useAppStore = create((set) => ({
  // Server state — MOVE to TanStack Query
  user: null,
  fetchUser: async () => { /* ... */ },

  // Client state — KEEP in Zustand
  sidebarOpen: false,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  theme: "light",
  setTheme: (theme) => set({ theme }),
}));
```

### After

```js
// src/stores/useAppStore.js  — only client state remains
import { create } from "zustand";

const useAppStore = create((set) => ({
  sidebarOpen: false,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  theme: "light",
  setTheme: (theme) => set({ theme }),
}));

export default useAppStore;
```

```js
// src/hooks/useUser.js  — server state moved to TanStack Query
import { useQuery } from "@tanstack/react-query";
import { fetchUser } from "../api/auth";

export function useUser() {
  return useQuery({
    queryKey: ["user", "me"],
    queryFn: fetchUser,
  });
}
```
