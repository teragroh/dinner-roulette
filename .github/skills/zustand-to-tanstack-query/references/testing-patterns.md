# Testing Patterns — TanStack Query v5 (JavaScript)

Testing hooks that use TanStack Query with Jest and React Testing Library.

## Table of Contents

1. [Test Wrapper Setup](#1-test-wrapper-setup)
2. [Testing a useQuery Hook](#2-testing-a-usequery-hook)
3. [Testing a useMutation Hook](#3-testing-a-usemutation-hook)
4. [Mocking API Functions](#4-mocking-api-functions)
5. [Testing Components That Use Hooks](#5-testing-components-that-use-hooks)
6. [Common Pitfalls](#6-common-pitfalls)

---

## 1. Test Wrapper Setup

Every test needs a `QueryClientProvider`. Create a fresh `QueryClient` per test to ensure isolation.

```js
// src/test-utils.js
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,       // don't retry in tests
        gcTime: Infinity,   // prevent "Jest did not exit" warnings
      },
      mutations: {
        retry: false,
      },
    },
  });
}

export function createWrapper() {
  const queryClient = createTestQueryClient();
  return function Wrapper({ children }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  };
}
```

---

## 2. Testing a useQuery Hook

```js
// src/hooks/useProducts.test.js
import { renderHook, waitFor } from "@testing-library/react";
import { createWrapper } from "../test-utils";
import { useProducts } from "./useProducts";
import * as api from "../api/products";

// Mock the API module
jest.mock("../api/products");

test("fetches products successfully", async () => {
  const mockProducts = [
    { id: 1, name: "Widget" },
    { id: 2, name: "Gadget" },
  ];

  api.fetchProducts.mockResolvedValueOnce(mockProducts);

  const { result } = renderHook(() => useProducts(), {
    wrapper: createWrapper(),
  });

  // Initially pending
  expect(result.current.isPending).toBe(true);

  // Wait for success
  await waitFor(() => expect(result.current.isSuccess).toBe(true));

  expect(result.current.data).toEqual(mockProducts);
});

test("handles fetch error", async () => {
  api.fetchProducts.mockRejectedValueOnce(new Error("Network error"));

  const { result } = renderHook(() => useProducts(), {
    wrapper: createWrapper(),
  });

  await waitFor(() => expect(result.current.isError).toBe(true));

  expect(result.current.error.message).toBe("Network error");
});
```

---

## 3. Testing a useMutation Hook

```js
// src/hooks/useCreateProduct.test.js
import { renderHook, waitFor, act } from "@testing-library/react";
import { createWrapper } from "../test-utils";
import { useCreateProduct } from "./useCreateProduct";
import * as api from "../api/products";

jest.mock("../api/products");

test("creates a product and returns data", async () => {
  const newProduct = { name: "New Widget" };
  const createdProduct = { id: 3, name: "New Widget" };

  api.createProduct.mockResolvedValueOnce(createdProduct);

  const { result } = renderHook(() => useCreateProduct(), {
    wrapper: createWrapper(),
  });

  act(() => {
    result.current.mutate(newProduct);
  });

  await waitFor(() => expect(result.current.isSuccess).toBe(true));

  expect(result.current.data).toEqual(createdProduct);
  expect(api.createProduct).toHaveBeenCalledWith(newProduct);
});

test("handles mutation error", async () => {
  api.createProduct.mockRejectedValueOnce(new Error("Validation failed"));

  const { result } = renderHook(() => useCreateProduct(), {
    wrapper: createWrapper(),
  });

  act(() => {
    result.current.mutate({ name: "" });
  });

  await waitFor(() => expect(result.current.isError).toBe(true));

  expect(result.current.error.message).toBe("Validation failed");
});
```

---

## 4. Mocking API Functions

### Option A: Module-level mocking (Jest)

```js
jest.mock("../api/products", () => ({
  fetchProducts: jest.fn(),
  createProduct: jest.fn(),
}));
```

### Option B: MSW (Mock Service Worker) for integration tests

```js
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";

const server = setupServer(
  http.get("/api/products", () => {
    return HttpResponse.json([
      { id: 1, name: "Widget" },
    ]);
  }),

  http.post("/api/products", async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ id: 99, ...body }, { status: 201 });
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

---

## 5. Testing Components That Use Hooks

```jsx
// src/components/ProductList.test.jsx
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ProductList from "./ProductList";
import * as api from "../api/products";

jest.mock("../api/products");

function renderWithClient(ui) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  );
}

test("shows loading then products", async () => {
  api.fetchProducts.mockResolvedValueOnce([{ id: 1, name: "Widget" }]);

  renderWithClient(<ProductList />);

  expect(screen.getByText("Loading...")).toBeInTheDocument();

  await waitFor(() => {
    expect(screen.getByText("Widget")).toBeInTheDocument();
  });
});

test("shows error message on failure", async () => {
  api.fetchProducts.mockRejectedValueOnce(new Error("Server down"));

  renderWithClient(<ProductList />);

  await waitFor(() => {
    expect(screen.getByText(/Server down/)).toBeInTheDocument();
  });
});
```

---

## 6. Common Pitfalls

| Pitfall | Solution |
|---|---|
| Tests time out | Set `retry: false` in test QueryClient defaults |
| "Jest did not exit" warning | Set `gcTime: Infinity` in test QueryClient |
| Tests leak state between each other | Create a **new** `QueryClient` per test |
| `act()` warnings | Wrap `mutate()` calls in `act()` |
| Stale closure issues | Use `waitFor` instead of fixed `setTimeout` |
| React 18 `waitFor` semantics | `waitFor` calls the callback repeatedly until it passes — ensure assertions are idempotent |
