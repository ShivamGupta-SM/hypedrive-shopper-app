# HypeDrive Shopper - Vite + React CSR App

<llm_info>CLAUDE.md for Vite 7 + React 19 CSR application with TanStack Query, Zustand, and Catalyst UI.</llm_info>

<project_stack>
- Build Tool: Vite 7.x
- Framework: React 19 (CSR - Client-Side Rendering)
- State: Zustand + TanStack Query v5
- Styling: Tailwind CSS v4 + Catalyst UI
- Forms: React Hook Form + Zod
- Router: React Router v7
- Testing: Vitest + Testing Library
- Linting: Biome
</project_stack>

---

## Table of Contents

1. [Vite 7 Best Practices](#vite-7-best-practices)
2. [TanStack Query v5](#tanstack-query-v5)
3. [Zustand State Management](#zustand-state-management)
4. [React Hook Form + Zod](#react-hook-form--zod)
5. [React Router v7](#react-router-v7)
6. [Project Structure](#project-structure)
7. [TypeScript Types](#typescript-types)
8. [Troubleshooting](#troubleshooting)
9. [Git Rules](#git-rules)
10. [Design Rules](#design-rules)
11. [Color Palette](#color-palette)
12. [Catalyst UI Component Rules](#catalyst-ui-component-rules)
13. [TypeScript Style Guide](#typescript-style-guide)

---

## Vite 7 Best Practices

### Current Configuration

```typescript
// vite.config.ts
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
```

### Plugin Selection

| Plugin | Purpose |
|--------|---------|
| `@vitejs/plugin-react-swc` | React Fast Refresh with SWC compiler (faster than Babel) |
| `@tailwindcss/vite` | Native Tailwind CSS v4 integration |

### Environment Variables (CRITICAL)

**Only variables prefixed with `VITE_` are exposed to client-side code.**

```bash
# .env
VITE_API_URL=https://api.example.com    # ✅ Exposed to browser
DATABASE_URL=postgres://...              # ❌ NOT exposed (server-only)
```

```typescript
// Usage in code
const apiUrl = import.meta.env.VITE_API_URL;
const isDev = import.meta.env.DEV;
const isProd = import.meta.env.PROD;
```

### TypeScript Support for Env

```typescript
// src/vite-env.d.ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_APP_TITLE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

### Build Optimization

```typescript
// vite.config.ts - Production optimization
export default defineConfig({
  build: {
    target: 'esnext',
    minify: 'esbuild',
    cssMinify: 'lightningcss',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'react-vendor';
            }
            if (id.includes('@headlessui') || id.includes('@heroicons')) {
              return 'ui-vendor';
            }
            if (id.includes('@tanstack/react-query') || id.includes('zustand')) {
              return 'data-vendor';
            }
            return 'vendor';
          }
        },
      },
    },
  },
});
```

### Code Splitting & Lazy Loading

```typescript
import { lazy, Suspense } from 'react';

// Route-level lazy loading
const Dashboard = lazy(() => import('./pages/dashboard'));
const Settings = lazy(() => import('./pages/settings'));

// Always wrap with Suspense
<Suspense fallback={<PageSkeleton />}>
  <Dashboard />
</Suspense>
```

**Rules:**
- `React.lazy()` only works with **default exports**
- Don't split chunks smaller than ~30KB
- Use prefetch for predictable navigation

### Dev Server Performance

```typescript
export default defineConfig({
  server: {
    warmup: {
      clientFiles: ['./src/main.tsx', './src/App.tsx'],
    },
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
});
```

### TypeScript Config Requirements

```json
{
  "compilerOptions": {
    "moduleResolution": "bundler",  // Required for Vite
    "isolatedModules": true,        // Required - esbuild needs this
    "skipLibCheck": true,           // Performance
    "noEmit": true                  // Vite handles transpilation
  }
}
```

---

## TanStack Query v5

### Setup

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30,   // 30 minutes (renamed from cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

<QueryClientProvider client={queryClient}>
  <App />
</QueryClientProvider>
```

### useQuery

```typescript
import { useQuery } from '@tanstack/react-query';

const { data, isLoading, isError, error, refetch } = useQuery({
  queryKey: ['products', { page, status }],
  queryFn: () => fetchProducts({ page, status }),
  enabled: !!userId, // conditional fetching
});
```

### useMutation

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';

const queryClient = useQueryClient();

const { mutate, isPending } = useMutation({
  mutationFn: (data) => createProduct(data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['products'] });
    toast.success('Product created');
  },
  onError: (error) => {
    toast.error(error.message);
  },
});

// Usage
mutate({ name: 'Product', price: 100 });
```

### useInfiniteQuery

```typescript
import { useInfiniteQuery } from '@tanstack/react-query';

const {
  data,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
} = useInfiniteQuery({
  queryKey: ['products', 'infinite'],
  queryFn: ({ pageParam = 1 }) => fetchProducts({ page: pageParam }),
  getNextPageParam: (lastPage) => lastPage.nextPage ?? undefined,
  initialPageParam: 1,
});

// Flatten pages
const products = data?.pages.flatMap(page => page.data) ?? [];
```

### Query Invalidation

```typescript
const queryClient = useQueryClient();

// Invalidate all products queries
queryClient.invalidateQueries({ queryKey: ['products'] });

// Invalidate specific query
queryClient.invalidateQueries({ queryKey: ['products', productId] });

// Set data directly
queryClient.setQueryData(['products', productId], updatedProduct);
```

---

## Zustand State Management

### Creating a Store

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  user: User | null;
  token: string | null;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      logout: () => set({ user: null, token: null }),
    }),
    {
      name: 'auth-storage', // localStorage key
    }
  )
);
```

### Using the Store

```typescript
// Get state
const user = useAuthStore((state) => state.user);
const { user, token, logout } = useAuthStore();

// Actions
const setUser = useAuthStore((state) => state.setUser);
setUser({ id: '1', name: 'John' });

// Outside React
useAuthStore.getState().logout();
```

### Derived State with Selectors

```typescript
// Create selector for derived state
const selectIsAuthenticated = (state: AuthState) => !!state.token;

// Use in component
const isAuthenticated = useAuthStore(selectIsAuthenticated);
```

---

## React Hook Form + Zod

### Basic Form

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type FormData = z.infer<typeof schema>;

function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    await login(data);
    reset();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}

      <input type="password" {...register('password')} />
      {errors.password && <span>{errors.password.message}</span>}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Loading...' : 'Login'}
      </button>
    </form>
  );
}
```

### With Controlled Components

```typescript
import { Controller } from 'react-hook-form';

<Controller
  name="category"
  control={control}
  render={({ field }) => (
    <Select {...field} options={categories} />
  )}
/>
```

### Common Zod Patterns

```typescript
const schema = z.object({
  // Strings
  name: z.string().min(1, 'Required'),
  email: z.string().email(),
  phone: z.string().regex(/^\d{10}$/, 'Invalid phone'),

  // Numbers
  price: z.coerce.number().positive(),
  quantity: z.coerce.number().int().min(1),

  // Enums
  status: z.enum(['active', 'inactive']),

  // Optional with default
  role: z.string().default('user'),

  // Conditional
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords must match',
  path: ['confirmPassword'],
});
```

---

## React Router v7

### Route Setup

```typescript
import { createBrowserRouter, RouterProvider } from 'react-router';

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'products', element: <ProductList /> },
      { path: 'products/:id', element: <ProductShow /> },
      { path: 'products/:id/edit', element: <ProductEdit /> },
    ],
  },
  {
    path: '/login',
    element: <Login />,
  },
]);

<RouterProvider router={router} />
```

### Navigation

```typescript
import { useNavigate, useParams, useSearchParams, Link } from 'react-router';

// Programmatic navigation
const navigate = useNavigate();
navigate('/products');
navigate('/products/123');
navigate(-1); // go back

// Get route params
const { id } = useParams();

// Query params
const [searchParams, setSearchParams] = useSearchParams();
const page = searchParams.get('page') || '1';
setSearchParams({ page: '2' });

// Link component
<Link to="/products">Products</Link>
<Link to={`/products/${id}`}>View Product</Link>
```

### Protected Routes

```typescript
import { Navigate, Outlet } from 'react-router';

function ProtectedRoute() {
  const { token } = useAuthStore();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

// In router config
{
  path: '/',
  element: <ProtectedRoute />,
  children: [
    { path: 'dashboard', element: <Dashboard /> },
  ],
}
```

---

## Project Structure

```
src/
├── main.tsx                  # Entry point
├── App.tsx                   # Root component with providers
├── App.css                   # Global styles + Tailwind imports
├── vite-env.d.ts            # Vite type declarations
├── components/
│   ├── app-layout.tsx       # Main layout wrapper
│   ├── sidebar-layout.tsx   # Sidebar navigation
│   ├── command-menu.tsx     # Command palette (Cmd+K)
│   ├── protected-route.tsx  # Auth guard
│   └── [component].tsx      # Feature components
├── pages/
│   ├── dashboard.tsx
│   ├── auth/                # Login, Register, etc.
│   ├── campaigns/           # Campaign CRUD
│   ├── enrollments/         # Enrollment management
│   ├── wallet/              # Wallet & transactions
│   └── settings/            # User settings
├── hooks/
│   └── use-api.ts           # API hooks
├── lib/
│   ├── client.ts            # API client
│   ├── theme.ts             # Color system
│   ├── money-utils.ts       # Currency formatting
│   └── error-utils.ts       # Error handling
├── store/
│   └── [store].ts           # Zustand stores
└── types/                   # TypeScript types
```

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Files (utilities) | camelCase | `formatPrice.ts` |
| Files (components) | PascalCase | `ProductList.tsx` |
| Files (hooks) | camelCase with use- | `useProductStats.ts` |
| Components | PascalCase | `ProductList`, `UserEdit` |
| Hooks | camelCase with use | `useProductStats` |
| Types/Interfaces | PascalCase | `Product`, `User` |
| Constants | UPPER_SNAKE_CASE | `API_URL` |
| Functions | camelCase | `formatPrice` |

---

## TypeScript Types

```typescript
export interface BaseRecord {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface Product extends BaseRecord {
  name: string;
  description?: string;
  price: number;
  stock: number;
  categoryId: string;
  status: "active" | "inactive" | "draft";
}

export interface User extends BaseRecord {
  email: string;
  name: string;
  avatar?: string;
  role: "admin" | "staff" | "customer";
  status: "active" | "inactive" | "suspended";
}

export interface ListResponse<T> {
  data: T[];
  total: number;
}

export interface PaginationParams {
  page: number;
  limit: number;
}
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| HMR not working | Check for circular imports, restart dev server |
| Env vars undefined | Check `VITE_` prefix, restart server after .env changes |
| Build fails | Run `tsc --noEmit` to find type errors |
| Query not refetching | Check queryKey, invalidate correctly |
| Form not submitting | Check handleSubmit wrapper, validation errors |
| Store not persisting | Check localStorage key, hydration timing |

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized (trigger logout) |
| 403 | Forbidden |
| 404 | Not Found |
| 500 | Server Error |

---

## Git Rules

- Never `git restore` without permission
- No destructive git operations that cause data loss
- No force push to main/master

---

## Design Rules

- No purple colors or gradients - keep colors clean and minimal
- No hover animations or fancy transitions - these look like "AI slop"
- Keep UI simple, clean, and functional like Airbnb/iOS native apps
- Use solid colors, no gradients
- Prefer subtle, minimal interactions over flashy effects

---

## Color Palette

The app uses a consistent semantic color system defined in `src/lib/theme.ts`. Always import colors from this file for consistency.

### Semantic Colors

| Purpose | Color | Light Mode | Dark Mode |
|---------|-------|------------|-----------|
| **Success** | Emerald | `emerald-600` | `emerald-400` |
| **Warning** | Amber | `amber-600` | `amber-400` |
| **Error** | Red | `red-600` | `red-400` |
| **Info** | Sky | `sky-600` | `sky-400` |
| **Neutral** | Zinc | `zinc-500` | `zinc-400` |

### Status Colors (Enrollments)

| Status | Color | Meaning |
|--------|-------|---------|
| `awaiting_submission` | Amber | User action required |
| `changes_requested` | Amber | User action required |
| `awaiting_review` | Sky | Processing/under review |
| `approved` | Emerald | Success/completed |
| `rejected` / `permanently_rejected` | Red | Failed/rejected |
| `cancelled` / `withdrawn` / `expired` | Zinc | Inactive/neutral |

### Usage Example

```typescript
import { getStatusColors, semanticColors, getTrendColors } from "@/lib/theme";

// Status colors
const colors = getStatusColors("approved");
<span className={colors.text}>Approved</span>
<div className={colors.bg}>...</div>
<Icon className={colors.icon} />

// Semantic colors
<p className={semanticColors.success.text}>+₹500</p>
<div className={semanticColors.warning.bg}>Alert</div>

// Trend colors
const trend = getTrendColors(15); // positive
<span className={`${trend.bg} ${trend.text}`}>+15%</span>
```

### Money/Financial Display

| State | Color | Example |
|-------|-------|---------|
| Positive (earnings) | Emerald | `+₹500` |
| Negative (deductions) | Red | `-₹100` |
| Pending | Amber | `₹200 (pending)` |
| Neutral | Zinc | `₹0.00` |

### Key Files

- `src/App.css` - CSS custom properties for Tailwind theme
- `src/lib/theme.ts` - TypeScript color utilities and constants

---

## Catalyst UI Component Rules

### Input Components (CRITICAL)

The Catalyst UI `Input` and `InputGroup` components have their own internal wrappers. **DO NOT add extra wrapper divs around them.**

**WRONG - causes double margin/padding:**
```tsx
<div className="relative">
  <InputGroup>
    <MagnifyingGlassIcon />
    <Input name="search" placeholder="Search..." />
  </InputGroup>
</div>
```

**CORRECT - use components directly:**
```tsx
<InputGroup>
  <MagnifyingGlassIcon />
  <Input name="search" placeholder="Search..." />
</InputGroup>
```

**For forms with labels, use Field component:**
```tsx
<Field>
  <Label>Email</Label>
  <Input type="email" name="email" />
</Field>
```

### Component Internal Structure

- `Input` wraps itself in a `<span data-slot="control">` with `relative block w-full`
- `InputGroup` adds positioning for icons via `has-[[data-slot=icon]]` selectors
- `Select` has similar internal wrapper structure
- Do NOT add `className` for sizing to Input - it has built-in responsive sizing

### Form Layout Pattern

Use Catalyst's `Field`, `Label`, `Description` components for form layouts:

```tsx
import { Field, Label, Description } from "@/components/fieldset";

<Field>
  <Label>Email address</Label>
  <Description>We'll use this for notifications</Description>
  <Input type="email" name="email" />
</Field>
```

---

## TypeScript Style Guide

- Use interface/type for complex objects
- Prefer built-in utility types (Record, Partial, Pick) over any
- Always ES6+ syntax and import, never require
- Use built-in fetch for HTTP
