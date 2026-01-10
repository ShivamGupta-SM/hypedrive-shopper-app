# Refine.dev v5 Admin Panel

<llm_info>Generic CLAUDE.md for any Refine.dev v5 project. Copy to project root and customize project_stack section.</llm_info>

<project_stack>
- Framework: Next.js 14+ with App Router
- Admin: Refine.dev v5 (headless mode)
- Styling: Tailwind CSS
- Backend: Custom API
- Auth: Custom Auth Provider
</project_stack>

---

## Table of Contents

1. [Quick Reference](#quick-reference)
2. [v5 Breaking Changes](#refine-v5-breaking-changes)
3. [Providers](#providers)
4. [Hooks Reference](#hooks-reference)
5. [Forms & Tables](#forms--tables)
6. [Filter Operators](#filter-operators)
7. [Best Practices](#best-practices)
8. [Project Structure](#project-structure)
9. [TypeScript Types](#typescript-types)
10. [Troubleshooting](#troubleshooting)

---

## Quick Reference

### All Hooks at a Glance

| Category | Hooks |
|----------|-------|
| **Data** | `useList`, `useOne`, `useMany`, `useCreate`, `useUpdate`, `useDelete`, `useCustom`, `useCustomMutation`, `useInfiniteList`, `useDataProvider`, `useApiUrl` |
| **Form/Table** | `useForm`, `useTable`, `useSelect`, `useShow`, `useModalForm` |
| **Auth** | `useLogin`, `useLogout`, `useRegister`, `useIsAuthenticated`, `useGetIdentity`, `usePermissions`, `useForgotPassword`, `useUpdatePassword`, `useOnError` |
| **Navigation** | `useNavigation`, `useGo`, `useParsed`, `useResource`, `useLink` |
| **Access Control** | `useCan` |
| **Notification** | `useNotification` |
| **Import/Export** | `useImport`, `useExport` |
| **i18n** | `useTranslate`, `useSetLocale`, `useGetLocale`, `useTranslation` |
| **Realtime** | `useSubscription`, `usePublish` |
| **UI/Utility** | `useMenu`, `useBreadcrumb`, `useTitle`, `useModal`, `useInvalidate` |

---

## Refine v5 Breaking Changes

### Hook Return Values (CRITICAL)

| Hook | v4 Return | v5 Return |
|------|-----------|-----------|
| useList/useOne/useMany | `{ data, isLoading }` | `{ result, query: { isLoading } }` |
| useShow | `{ queryResult }` | `{ result, query }` |
| useCreate/useUpdate/useDelete | `{ mutate, isLoading }` | `{ mutate, mutation: { isPending } }` |
| useLogin/useRegister | `{ mutate, isLoading }` | `{ mutate, isPending }` (direct!) |
| useCustom | `{ data, isLoading }` | `{ result, query: { isLoading } }` |
| useCustomMutation | `{ mutate, isLoading }` | `{ mutate, mutation: { isPending } }` |
| useSelect | `{ options, queryResult }` | `{ options, query }` |
| useTable (core) | `{ tableQueryResult }` | `{ tableQuery }` |
| useForm | `{ queryResult, mutationResult }` | `{ query, mutation }` |
| useInfiniteList | `{ data, fetchNextPage }` | `{ result, query: { fetchNextPage } }` |

### Key Pattern: `result` vs `data`

```typescript
// v4
const { data, isLoading } = useList();
const products = data?.data;  // Nested

// v5 PREFERRED
const { result, query: { isLoading } } = useList();
const products = result.data;  // Cleaner
```

### Auth vs Data Hooks Return Type

```typescript
// DATA MUTATION HOOKS - wrapped in mutation
const { mutate, mutation: { isPending } } = useCreate();

// AUTH MUTATION HOOKS - direct (NOT wrapped!)
const { mutate: login, isPending } = useLogin();
```

### Parameter Renames

| Old (v4) | New (v5) |
|----------|----------|
| metaData | meta |
| sort/sorter | sorters |
| initialSorter/permanentSorter | sorters: { initial, permanent } |
| initialFilter/permanentFilter | filters: { initial, permanent } |
| hasPagination: false | pagination: { mode: "off" } |
| initialCurrent | pagination: { currentPage } |
| setCurrent | setCurrentPage |
| queryResult | query |
| mutationResult | mutation |
| isLoading (mutations) | isPending |

### Type/Import Renames

```typescript
// v4 → v5
AuthBindings → AuthProvider
RouterBindings → RouterProvider
resources options → resources meta
ThemedLayoutV2 → ThemedLayout
```

### Removed in v5

- legacyRouterProvider, legacyAuthProvider
- v3LegacyAuthProviderCompatible flag
- Direct push, goBack, replace from useNavigation

---

## Providers

### Data Provider

**Required Methods:**
- `getList` - Fetch paginated, sorted, filtered list
- `getOne` - Fetch single record by ID
- `create` - Create new record
- `update` - Update existing record
- `deleteOne` - Delete single record
- `getApiUrl` - Return API base URL

**Optional Methods:** getMany, createMany, updateMany, deleteMany, custom

```typescript
import { DataProvider, HttpError } from "@refinedev/core";

export const dataProvider = (apiUrl: string): DataProvider => ({
  getApiUrl: () => apiUrl,

  getList: async ({ resource, pagination, sorters, filters }) => {
    const { current = 1, pageSize = 10 } = pagination ?? {};
    const query: Record<string, any> = { page: current, limit: pageSize };
    if (sorters?.length) query.sort = sorters.map(s => `${s.field}:${s.order}`).join(",");
    filters?.forEach((filter) => {
      if ("field" in filter) {
        if (filter.operator === "eq") query[filter.field] = filter.value;
        else if (filter.operator === "contains") query[`${filter.field}_like`] = filter.value;
      }
    });
    const response = await fetch(`${apiUrl}/${resource}?${new URLSearchParams(query)}`);
    const data = await response.json();
    return { data: data.items || data, total: data.total || data.length };
  },

  getOne: async ({ resource, id }) => {
    const response = await fetch(`${apiUrl}/${resource}/${id}`);
    return { data: await response.json() };
  },

  create: async ({ resource, variables }) => {
    const response = await fetch(`${apiUrl}/${resource}`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(variables),
    });
    return { data: await response.json() };
  },

  update: async ({ resource, id, variables }) => {
    const response = await fetch(`${apiUrl}/${resource}/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(variables),
    });
    return { data: await response.json() };
  },

  deleteOne: async ({ resource, id }) => {
    const response = await fetch(`${apiUrl}/${resource}/${id}`, { method: "DELETE" });
    return { data: await response.json() };
  },

  custom: async ({ url, method, payload, query }) => {
    const response = await fetch(`${apiUrl}${url}?${new URLSearchParams(query)}`, {
      method, headers: { "Content-Type": "application/json" }, body: payload ? JSON.stringify(payload) : undefined,
    });
    return { data: await response.json() };
  },
});
```

### Auth Provider

**Required Methods:**
- `login` - returns `{ success, redirectTo?, error? }`
- `check` - returns `{ authenticated, redirectTo?, logout?, error? }`
- `logout` - returns `{ success, redirectTo? }`
- `onError` - returns `{ logout?, redirectTo?, error? }`

**Optional Methods:** getIdentity, getPermissions, register, forgotPassword, updatePassword

```typescript
import { AuthProvider } from "@refinedev/core";

export const authProvider: AuthProvider = {
  login: async ({ email, password }) => {
    const response = await fetch("/api/auth/login", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (data.token) {
      localStorage.setItem("auth_token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      return { success: true, redirectTo: "/" };
    }
    return { success: false, error: { name: "LoginError", message: "Invalid credentials" } };
  },

  check: async () => {
    const token = localStorage.getItem("auth_token");
    if (!token) return { authenticated: false, redirectTo: "/login", logout: true };
    return { authenticated: true };
  },

  logout: async () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
    return { success: true, redirectTo: "/login" };
  },

  onError: async (error) => {
    if (error?.statusCode === 401 || error?.statusCode === 403) return { logout: true, redirectTo: "/login" };
    return {};
  },

  getIdentity: async () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },

  getPermissions: async () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user).role : null;
  },
};
```

### Notification Provider

```typescript
import { NotificationProvider } from "@refinedev/core";
import { toast } from "react-toastify";

export const notificationProvider: NotificationProvider = {
  open: ({ key, message, type }) => {
    if (type === "success") toast.success(message, { toastId: key });
    else if (type === "error") toast.error(message, { toastId: key });
    else toast.info(message, { toastId: key });
  },
  close: (key) => toast.dismiss(key),
};
```

### Access Control Provider

```typescript
import { AccessControlProvider } from "@refinedev/core";

export const accessControlProvider: AccessControlProvider = {
  can: async ({ resource, action, params }) => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user.role === "admin") return { can: true };
    if (action === "delete") return { can: false, reason: "Only admins can delete" };
    return { can: true };
  },
};
```

### Refine Setup (Next.js App Router)

```typescript
import { Refine } from "@refinedev/core";
import routerProvider from "@refinedev/nextjs-router";

const resources = [
  { name: "products", list: "/products", show: "/products/:id", edit: "/products/:id/edit", meta: { label: "Products" } },
  { name: "users", list: "/users", show: "/users/:id", create: "/users/create", meta: { label: "Users", canDelete: true } },
];

<Refine
  routerProvider={routerProvider}
  dataProvider={dataProvider(API_URL)}
  authProvider={authProvider}
  resources={resources}
  options={{ syncWithLocation: true }}
>
  {children}
</Refine>
```

---

## Hooks Reference

### 1. Data Hooks

#### useList
Fetch paginated list of records.

```typescript
const { result, query: { isLoading, isError } } = useList({
  resource: "products",
  pagination: { current: 1, pageSize: 10 },
  sorters: [{ field: "createdAt", order: "desc" }],
  filters: [{ field: "status", operator: "eq", value: "active" }],
});
const products = result.data ?? [];
const total = result.total;
```

#### useOne
Fetch single record by ID.

```typescript
const { result, query: { isLoading } } = useOne({
  resource: "products",
  id: "123"
});
const product = result.data;
```

#### useMany
Fetch multiple records by IDs.

```typescript
const { result, query: { isLoading } } = useMany({
  resource: "products",
  ids: ["1", "2", "3"]
});
const products = result.data;
```

#### useCreate
Create new record.

```typescript
const { mutate, mutation: { isPending } } = useCreate();

mutate({
  resource: "products",
  values: { name: "Product", price: 100 }
}, {
  onSuccess: (data) => console.log("Created:", data),
  onError: (error) => console.error(error),
});
```

#### useUpdate
Update existing record.

```typescript
const { mutate, mutation: { isPending } } = useUpdate();

mutate({
  resource: "products",
  id: "123",
  values: { name: "Updated Product" }
});

// With optimistic updates
const { mutate } = useUpdate({ mutationMode: "optimistic" });

// With undo capability
const { mutate } = useUpdate({ mutationMode: "undoable", undoableTimeout: 5000 });
```

#### useDelete
Delete record.

```typescript
const { mutate, mutation: { isPending } } = useDelete();

mutate({ resource: "products", id: "123" });
```

#### useCustom
Custom GET request.

```typescript
const { result, query: { isLoading } } = useCustom({
  url: "/admin/stats",
  method: "get",
  config: { query: { period: "monthly" } }
});
```

#### useCustomMutation
Custom POST/PUT/PATCH/DELETE request.

```typescript
const { mutate, mutation: { isPending } } = useCustomMutation();

mutate({
  url: "/products/123/publish",
  method: "post",
  values: { publishedAt: new Date().toISOString() }
});
```

#### useInfiniteList
Infinite scroll pagination.

```typescript
const { result, query: { hasNextPage, fetchNextPage, isFetchingNextPage } } = useInfiniteList({
  resource: "products",
  pagination: { pageSize: 20 }
});

// Load more button
{hasNextPage && (
  <button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
    Load More
  </button>
)}
```

#### useDataProvider
Direct access to data provider.

```typescript
const dataProvider = useDataProvider();

const fetchCustomData = async () => {
  const result = await dataProvider().custom({
    url: "/api/custom-endpoint",
    method: "get",
  });
  return result.data;
};

// Access specific named data provider
const secondaryProvider = dataProvider("secondary");
```

#### useApiUrl
Get API base URL.

```typescript
const apiUrl = useApiUrl();
// Returns the URL from dataProvider.getApiUrl()
```

---

### 2. Authentication Hooks

#### useLogin
User login.

```typescript
const { mutate: login, isPending } = useLogin();

login({ email: "user@example.com", password: "password123" }, {
  onSuccess: () => console.log("Logged in!"),
  onError: (error) => console.error(error.message),
});
```

#### useLogout
User logout.

```typescript
const { mutate: logout, isPending } = useLogout();

logout();
// or with redirect
logout({ redirectPath: "/goodbye" });
```

#### useRegister
User registration.

```typescript
const { mutate: register, isPending } = useRegister();

register({
  email: "newuser@example.com",
  password: "password123",
  name: "New User"
});
```

#### useIsAuthenticated
Check authentication status.

```typescript
const { data, isLoading } = useIsAuthenticated();

if (data?.authenticated) {
  // User is logged in
}
```

#### useGetIdentity
Get current user info.

```typescript
const { data: identity, isLoading } = useGetIdentity();

// identity = { id, name, email, avatar, role, ... }
```

#### usePermissions
Get user permissions.

```typescript
const { data: permissions, isLoading } = usePermissions();

if (permissions?.includes("admin")) {
  // Show admin features
}
```

#### useForgotPassword
Send password reset email.

```typescript
const { mutate: forgotPassword, isPending } = useForgotPassword<{ email: string }>();

forgotPassword({ email: "user@example.com" }, {
  onSuccess: () => toast.success("Reset link sent!"),
  onError: (error) => toast.error(error.message),
});
```

#### useUpdatePassword
Update password (reset password page).

```typescript
const { mutate: updatePassword, isPending } = useUpdatePassword<{
  password: string;
  confirmPassword: string
}>();

updatePassword({
  password: "newPassword123",
  confirmPassword: "newPassword123"
}, {
  onSuccess: () => go({ to: "/login" }),
});
```

#### useOnError
Handle auth errors programmatically.

```typescript
const { mutate: onError } = useOnError();

// Manual error handling
onError({ statusCode: 401, message: "Unauthorized" });
```

---

### 3. Navigation Hooks

#### useNavigation
Resource-based navigation.

```typescript
const { list, create, edit, show, clone } = useNavigation();

list("products");           // Go to /products
create("products");         // Go to /products/create
edit("products", "123");    // Go to /products/123/edit
show("products", "123");    // Go to /products/123
clone("products", "123");   // Go to /products/clone/123
```

#### useGo
Generic navigation with query params.

```typescript
const go = useGo();

go({ to: "/posts" });                           // push
go({ to: "/posts", type: "replace" });          // replace
go({ to: "/products", query: { search: "test", page: 1 } });

// Go back: use Next.js router
import { useRouter } from "next/navigation";
const router = useRouter();
router.back();
```

#### useParsed
Parse current URL params.

```typescript
const { resource, action, id, params, pathname } = useParsed();

// On /products/123/edit:
// resource = { name: "products", ... }
// action = "edit"
// id = "123"
```

#### useResource
Get current resource info.

```typescript
const { resource, action, id } = useResource();

// resource = { name: "products", list: "/products", ... }
```

#### useLink
Get router Link component.

```typescript
const Link = useLink();

<Link to="/products">Products</Link>
```

---

### 4. Access Control Hook

#### useCan
Check user permissions.

```typescript
const { data: canEdit } = useCan({
  resource: "products",
  action: "edit",
  params: { id: "123" }
});

{canEdit?.can && <button>Edit</button>}
{!canEdit?.can && <span>{canEdit?.reason}</span>}
```

---

### 5. Notification Hook

#### useNotification
Programmatic notifications.

```typescript
const { open, close } = useNotification();

// Open notification
open({
  key: "unique-key",
  type: "success",  // "success" | "error" | "progress"
  message: "Record created successfully",
  description: "Product has been added to the catalog",
});

// Close notification
close("unique-key");
```

---

### 6. Import/Export Hooks

#### useExport
Export data to CSV.

```typescript
const { triggerExport, isLoading } = useExport({
  resource: "products",
  mapData: (item) => ({
    id: item.id,
    name: item.name,
    price: item.price,
    status: item.status,
  }),
  maxItemCount: 1000,
  pageSize: 50,
  sorters: [{ field: "createdAt", order: "desc" }],
  filters: [{ field: "status", operator: "eq", value: "active" }],
});

<button onClick={triggerExport} disabled={isLoading}>
  {isLoading ? "Exporting..." : "Export CSV"}
</button>
```

#### useImport
Import data from CSV.

```typescript
const { inputProps, isLoading, mutationResult } = useImport({
  resource: "products",
  mapData: (item) => ({
    name: item.name,
    price: Number(item.price),
    status: item.status || "draft",
  }),
  onFinish: (results) => {
    console.log("Imported:", results.succeeded.length);
    console.log("Failed:", results.errored.length);
  },
});

<input type="file" accept=".csv" {...inputProps} />
```

---

### 7. i18n/Translation Hooks

#### useTranslate
Translate text.

```typescript
const translate = useTranslate();

<h1>{translate("pages.products.title")}</h1>
<button>{translate("buttons.save", "Save")}</button>  // with fallback
```

#### useSetLocale
Change language.

```typescript
const changeLocale = useSetLocale();

<button onClick={() => changeLocale("en")}>English</button>
<button onClick={() => changeLocale("hi")}>हिंदी</button>
<button onClick={() => changeLocale("es")}>Español</button>
```

#### useGetLocale
Get current language.

```typescript
const getLocale = useGetLocale();
const currentLocale = getLocale();  // "en", "hi", etc.
```

#### useTranslation
Combined i18n hook.

```typescript
const { translate, changeLocale, getLocale } = useTranslation();

const locale = getLocale();
const title = translate("pages.home.title");
changeLocale("en");
```

---

### 8. Realtime Hooks

#### useSubscription
Subscribe to live updates.

```typescript
useSubscription({
  channel: "products",
  types: ["created", "updated", "deleted"],
  onLiveEvent: (event) => {
    console.log("Event:", event.type, event.payload);
    // Invalidate queries or update UI
  },
});
```

#### usePublish
Publish events (frontend).

```typescript
const publish = usePublish();

publish({
  channel: "notifications",
  type: "custom",
  payload: { message: "New order received!" },
  date: new Date(),
});
```

---

### 9. UI/Utility Hooks

#### useMenu
Build navigation menu.

```typescript
const { menuItems, selectedKey, defaultOpenKeys } = useMenu();

// menuItems: [{ key, label, route, icon, children }]

{menuItems.map((item) => (
  <NavLink
    key={item.key}
    to={item.route}
    className={selectedKey === item.key ? "active" : ""}
  >
    {item.icon}
    {item.label}
  </NavLink>
))}
```

#### useBreadcrumb
Generate breadcrumbs.

```typescript
const { breadcrumbs } = useBreadcrumb();

// breadcrumbs: [{ label, href }, ...]

<nav>
  {breadcrumbs.map((crumb, index) => (
    <span key={index}>
      {crumb.href ? <Link to={crumb.href}>{crumb.label}</Link> : crumb.label}
      {index < breadcrumbs.length - 1 && " / "}
    </span>
  ))}
</nav>
```

#### useTitle
Access title component.

```typescript
const Title = useTitle();

<header>
  <Title collapsed={sidebarCollapsed} />
</header>
```

#### useModal (Ant Design)
Manage modal state.

```typescript
import { useModal } from "@refinedev/antd";

const { show, close, modalProps } = useModal();

<button onClick={show}>Open Modal</button>
<Modal {...modalProps} title="My Modal">
  <p>Modal content</p>
  <button onClick={close}>Close</button>
</Modal>
```

#### useInvalidate
Invalidate query cache.

```typescript
const invalidate = useInvalidate();

invalidate({
  resource: "products",
  invalidates: ["list", "many", "detail"]
});
```

---

## Forms & Tables

### useForm

```typescript
const { query, mutation, onFinish, formLoading } = useForm({
  resource: "products",
  action: "edit",  // "create" | "edit" | "clone"
  id: "123",
  redirect: "list",  // "list" | "show" | "edit" | false
  autoSave: { enabled: true, debounce: 2000 },
});

const product = query?.data?.data;

<form onSubmit={(e) => {
  e.preventDefault();
  onFinish(Object.fromEntries(new FormData(e.currentTarget)));
}}>
  <input name="name" defaultValue={product?.name} />
  <button disabled={mutation.isPending}>
    {mutation.isPending ? "Saving..." : "Save"}
  </button>
</form>
```

### useForm with React Hook Form + Zod

```typescript
import { useForm } from "@refinedev/react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(3),
  price: z.number().positive(),
  status: z.enum(["active", "inactive"]),
});

const {
  refineCore: { onFinish, formLoading },
  register,
  handleSubmit,
  formState: { errors }
} = useForm({
  resolver: zodResolver(schema),
  refineCoreProps: { resource: "products", action: "create" },
});

<form onSubmit={handleSubmit(onFinish)}>
  <input {...register("name")} />
  {errors.name && <span>{errors.name.message}</span>}
  <button disabled={formLoading}>Submit</button>
</form>
```

### useTable (Core)

```typescript
const {
  tableQuery,
  currentPage, setCurrentPage,
  pageSize, setPageSize,
  sorters, setSorters,
  filters, setFilters,
  pageCount
} = useTable({
  resource: "products",
  pagination: { pageSize: 10 },
  sorters: { initial: [{ field: "createdAt", order: "desc" }] },
  filters: { initial: [], permanent: [] },
  syncWithLocation: true,
});

const { data, isLoading } = tableQuery;
```

### useTable with TanStack Table

```typescript
import { useTable } from "@refinedev/react-table";
import { flexRender } from "@tanstack/react-table";

const { reactTable, refineCore } = useTable({
  columns,
  refineCoreProps: {
    resource: "products",
    pagination: { mode: "server" },
    filters: { permanent: refineFilters },
  },
});

const { getHeaderGroups, getRowModel, nextPage, previousPage } = reactTable;
const { tableQuery } = refineCore;

// Render
<table>
  <thead>
    {getHeaderGroups().map(hg => (
      <tr key={hg.id}>
        {hg.headers.map(h => (
          <th key={h.id}>{flexRender(h.column.columnDef.header, h.getContext())}</th>
        ))}
      </tr>
    ))}
  </thead>
  <tbody>
    {getRowModel().rows.map(row => (
      <tr key={row.id}>
        {row.getVisibleCells().map(cell => (
          <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
        ))}
      </tr>
    ))}
  </tbody>
</table>
```

### useSelect

```typescript
const { options, query: { isLoading } } = useSelect({
  resource: "categories",
  optionLabel: "name",
  optionValue: "id",
  filters: [{ field: "status", operator: "eq", value: "active" }],
  defaultValue: ["1", "2"],  // Pre-fetch these IDs
});

<select>
  {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
</select>
```

### useShow

```typescript
const { result, query: { isLoading } } = useShow({
  resource: "products",
  id: "123"
});

const product = result.data;
```

### useModalForm

```typescript
const {
  modal: { visible, show, close },
  formProps
} = useModalForm({
  resource: "products",
  action: "create"
});

<button onClick={() => show()}>Create Product</button>

<Modal visible={visible} onClose={close}>
  <form {...formProps}>
    {/* form fields */}
  </form>
</Modal>
```

### Filters Format

```typescript
// Initial vs Permanent
filters: {
  initial: [],      // Applied ONLY on first load
  permanent: [],    // ALWAYS applied - use for dynamic filters
}

// Dynamic filters pattern
const refineFilters = useMemo(() => {
  return filters
    .filter(f => f.value)
    .map(f => ({ field: f.field, operator: f.operator, value: f.value }));
}, [filters]);

refineCoreProps: { filters: { permanent: refineFilters } }
```

---

## Filter Operators

| Category | Operators |
|----------|-----------|
| **Comparison** | `eq`, `ne`, `lt`, `lte`, `gt`, `gte` |
| **Array** | `in`, `nin`, `ina`, `nina` |
| **String** | `contains`, `ncontains`, `containss`, `ncontainss`, `startswith`, `endswith` |
| **Range** | `between`, `nbetween` |
| **Null** | `null`, `nnull` |
| **Logical** | `or`, `and` |

```typescript
// Examples
filters: [{ field: "status", operator: "eq", value: "active" }]
filters: [{ field: "price", operator: "gte", value: 100 }, { field: "price", operator: "lte", value: 500 }]
filters: [{ field: "category", operator: "in", value: ["electronics", "clothing"] }]
filters: [{
  operator: "or",
  value: [
    { field: "status", operator: "eq", value: "pending" },
    { field: "status", operator: "eq", value: "processing" }
  ]
}]
```

---

## Best Practices

### Error Handling

```typescript
mutate({ resource: "products", values }, {
  onError: (error) => toast.error(error.message),
  onSuccess: () => toast.success("Created successfully"),
});
```

### Cache Invalidation

```typescript
const invalidate = useInvalidate();
invalidate({ resource: "products", invalidates: ["list", "many", "detail"] });
```

### Token Refresh Pattern

```typescript
import axios from "axios";
const axiosInstance = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL });

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true;
      const refreshToken = localStorage.getItem("refresh_token");
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, { refreshToken });
          localStorage.setItem("auth_token", data.token);
          error.config.headers.Authorization = `Bearer ${data.token}`;
          return axiosInstance(error.config);
        } catch { /* redirect to login */ }
      }
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
```

---

## Project Structure

```
src/
├── app/                      # Next.js App Router pages
│   ├── layout.tsx
│   ├── page.tsx
│   ├── login/page.tsx
│   └── [resource]/
│       ├── page.tsx          # List
│       ├── create/page.tsx   # Create
│       ├── [id]/
│       │   ├── page.tsx      # Show
│       │   └── edit/page.tsx # Edit
├── components/
│   ├── layout/               # Layout components
│   └── common/               # Shared components
├── providers/
│   ├── dataProvider.ts
│   ├── authProvider.ts
│   ├── accessControlProvider.ts
│   └── notificationProvider.ts
├── lib/
│   ├── api-client.ts
│   └── utils.ts
├── hooks/                    # Custom hooks
├── types/                    # TypeScript types
└── config/                   # Configuration
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

export type FilterOperator =
  | "eq" | "ne" | "lt" | "lte" | "gt" | "gte"
  | "contains" | "startswith" | "endswith"
  | "in" | "nin" | "between" | "null" | "nnull";
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Data not fetching | Check data provider, API endpoint, auth token in headers |
| Auth not working | Verify `check()` returns `{ authenticated: true/false }`, check localStorage |
| Routing issues | Verify routerProvider, resource paths, syncWithLocation |
| Type errors | Add generic types: `useList<Product>` |
| Performance issues | Enable pagination, use React.memo/useCallback/useMemo, server-side pagination |
| v5 Migration | `result` vs `data`, `query` vs `queryResult`, `isPending` vs `isLoading`, `setCurrentPage` vs `setCurrent` |

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
