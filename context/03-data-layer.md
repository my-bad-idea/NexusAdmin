# NexusAdmin 数据层规范
> 状态分层原则 + Zustand stores + TanStack Query hooks + 模板层。

---

## 一、状态归属规则 🔴 P0（硬性约束）

```
TanStack Query 管理：
  ✅ 服务端数据（用户列表、详情、图表数据）
  ✅ 分页状态（page、pageSize）
  ✅ 筛选参数（作为 queryKey 的一部分）
  ✅ 增删改查后的缓存失效（invalidate）
  ✅ 乐观更新

Zustand 管理：
  ✅ auth（token / user / permissions）
  ✅ theme（light / dark / system）
  ✅ menuCollapsed（侧边栏折叠）
  ✅ tableViewMode（table / card，per tableId）

URL Search Params 管理：
  ✅ 筛选条件（keyword / role / status / page / size）

禁止：
  ❌ Zustand 存放 list / items / rows / records（服务端数据）
  ❌ useState 存放跨组件筛选条件
  ❌ URL Params 与 TanStack Query 双写同一筛选
  ❌ 手动 setQueryData 拼接列表数据（用 invalidate）
```

---

## 二、Zustand Stores

```typescript
// store/authStore.ts
interface AuthState {
  token:       string | null;
  user:        UserProfile | null;
  permissions: string[];          // ['user:read', 'user:write', ...]
  setAuth:     (token: string, user: UserProfile, permissions: string[]) => void;
  clearAuth:   () => void;
}
export const useAuthStore = create<AuthState>()(
  devtools(persist(devGuard((set) => ({
    token: null, user: null, permissions: [],
    setAuth:  (token, user, permissions) => set({ token, user, permissions }),
    clearAuth: () => set({ token: null, user: null, permissions: [] }),
  })), { name: 'nexus-auth' }), { name: 'NexusAuth' })
);

// store/themeStore.ts
type ThemeMode = 'light' | 'dark' | 'system';
export const useThemeStore = create<{ mode: ThemeMode; setMode: (m: ThemeMode) => void }>()(
  persist((set) => ({
    mode: 'system',
    setMode: (mode) => {
      set({ mode });
      const isDark = mode === 'dark' ||
        (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    },
  }), { name: 'nexus-theme' })
);
```

---

## 三、fetch 封装 + 拦截器

```typescript
// lib/fetch.ts
export async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const token = useAuthStore.getState().token;
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });
  if (res.status === 401) {
    useAuthStore.getState().clearAuth();
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }
  const data = await res.json();
  if (data.code !== 0) throw new Error(data.message);
  return data.data as T;
}
```

---

## 四、核心 Hooks

### queryKeys 工厂
```typescript
// queries/keys.ts
export const queryKeys = {
  users: {
    all:  ['users'] as const,
    list: (filters: unknown) => ['users', 'list', filters] as const,
    detail: (id: string) => ['users', id] as const,
  },
};
```

### useList — URL↔Query 同步
```typescript
// hooks/useList.ts — URL Search Params 驱动 TanStack Query
// 读取 URL 中的 page/size/keyword 等参数，构建 queryKey，返回数据 + setFilter/setPage/resetFilters
// placeholderData 保留旧数据，翻页时不闪烁
export function useList<T>({ queryKey, queryFn, defaultPageSize = 20 }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const filters  = Object.fromEntries(searchParams.entries());
  const page     = Number(searchParams.get('page') ?? 1);
  const pageSize = Number(searchParams.get('size') ?? defaultPageSize);

  const query = useQuery({
    queryKey: [...queryKey, filters, page, pageSize],
    queryFn:  () => queryFn({ ...filters, page, pageSize }),
    placeholderData: (prev) => prev,
  });

  const setFilter = (key: string, value: string) => {
    const p = new URLSearchParams(searchParams);
    value ? p.set(key, value) : p.delete(key);
    p.set('page', '1');
    router.replace(`?${p.toString()}`, { scroll: false });
  };

  return { ...query, filters, page, pageSize, setFilter,
           setPage: (n: number) => { const p = new URLSearchParams(searchParams); p.set('page', String(n)); router.replace(`?${p}`); },
           setPageSize: (n: number) => { const p = new URLSearchParams(searchParams); p.set('size', String(n)); p.set('page', '1'); router.replace(`?${p}`); },
           resetFilters: () => router.replace('?') };
}
```

### useAction — 增删改 + invalidate + toast
```typescript
// hooks/useAction.ts
export function useAction<TData = void, TVar = void>({
  mutationFn, invalidateKeys,
  successMessage = 'Operation successful', onSuccess,
}) {
  const qc = useQueryClient();
  return useMutation<TData, Error, TVar>({
    mutationFn,
    onSuccess: (data) => {
      invalidateKeys.forEach(key => qc.invalidateQueries({ queryKey: key }));
      toast.success(typeof successMessage === 'function' ? successMessage(data) : successMessage);
      onSuccess?.(data);
    },
    onError: (err) => toast.error(err.message),
  });
}
```

### useFormError — API 校验错误映射到表单字段
```typescript
// hooks/useFormError.ts
export function useFormError<T extends FieldValues>(setError: UseFormSetError<T>) {
  return function handleError(err: unknown): boolean {
    const apiErr = err as { code: number; errors?: Record<string, string[]> };
    if (apiErr?.code === 1001 && apiErr.errors) {
      Object.entries(apiErr.errors).forEach(([field, msgs]) =>
        setError(field as any, { message: msgs[0] })
      );
      return true;
    }
    return false;
  };
}
```

---

## 五、模板层 Hooks（useListPage / useFormPage）

### useListPage — 列表页全套封装
```typescript
// hooks/templates/useListPage.ts
interface UseListPageOptions<T extends { id: string }> {
  resource:    string;
  queryFn:     (params: ListParams) => Promise<PageData<T>>;
  deleteFn?:   (id: string) => Promise<void>;
  permPrefix?: string;
}

export function useListPage<T extends { id: string }>({
  resource, queryFn, deleteFn, permPrefix,
}) {
  const list      = useList({ queryKey: [resource], queryFn });
  const canWrite  = usePermission(permPrefix ? `${permPrefix}:write`  : '');
  const canDelete = usePermission(permPrefix ? `${permPrefix}:delete` : '');
  const canExport = usePermission(permPrefix ? `${permPrefix}:export` : '');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [viewMode, setViewMode] = useTableViewMode(resource);

  const deleteAction = deleteFn
    ? useAction<void, string>({
        mutationFn: deleteFn,
        invalidateKeys: [[resource]],
        successMessage: `${resource} deleted`,
      })
    : null;

  return {
    ...list,
    canWrite:  permPrefix ? canWrite  : true,
    canDelete: permPrefix ? canDelete : true,
    canExport: permPrefix ? canExport : false,
    selectedIds, setSelectedIds,
    deleteAction, viewMode, setViewMode,
  };
}
```

**用法（列表页样板）**：
```tsx
// features/users/UserList.tsx
const page = useListPage({
  resource:   'users',
  queryFn:    fetchUsers,
  deleteFn:   (id) => apiFetch(`/users/${id}`, { method: 'DELETE' }),
  permPrefix: 'user',
});

return (
  <PageContainer title="User List"
    actions={page.canWrite && <PrimaryButton onClick={openForm}>+ Add User</PrimaryButton>}
  >
    <DataTable
      data={page.data?.list ?? []}
      columns={userColumns}
      isLoading={page.isLoading}
      isFetching={page.isFetching}
      total={page.data?.total}
      page={page.page}
      onPageChange={page.setPage}
      onSelectionChange={page.setSelectedIds}
    />
  </PageContainer>
);
```

### useFormPage — 表单页全套封装
```typescript
// hooks/templates/useFormPage.ts
// 参数：resource / id（有=编辑,无=新建）/ schema(zod) / fetchFn / toFormValues / submitFn / invalidateKeys / onSuccess
// 返回：{ form, isEdit, isLoading, isPending, submit }
// 内部集成：useQuery(编辑时加载) + useForm(zodResolver) + useFormError(API校验映射) + useAction(提交+invalidate+toast)
// 详见 @context/00-quick-ref.md 或规格文件 §27.2
```

---

## 六、useGlobalSearch — 全局搜索 Hook

```typescript
// hooks/useGlobalSearch.ts
export type SearchResultItem =
  | { type: 'page'; data: SearchablePage }
  | { type: 'user'; data: UserProfile };

export interface GlobalSearchResult {
  query: string;
  setQuery: (q: string) => void;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  ref: React.RefObject<HTMLDivElement | null>;
  flatItems: SearchResultItem[];
  pages: SearchablePage[];              // 静态页面匹配（query >= 1 字符）
  users: UserProfile[];                 // API 用户搜索（query >= 2 字符，防抖 300ms）
  isLoadingUsers: boolean;
  activeIndex: number;                  // 键盘导航当前选中索引
  onKeyDown: (e: React.KeyboardEvent) => void;
  navigate: (item: SearchResultItem) => void;
}

export function useGlobalSearch(): GlobalSearchResult
// 查询键：queryKeys.search.users(q)，staleTime: 30s，placeholderData: keepPreviousData
// Pages 跳转：直接路径（/dashboard, /users），无 locale 前缀
// Users 跳转：/users?keyword={name}
```

---

## 七、date-picker-helpers — 日期选择辅助函数

```typescript
// components/common/date-picker-helpers.ts
interface CalendarDay {
  day: number;
  iso: string;            // 'YYYY-MM-DD'
  isCurrentMonth: boolean;
  isToday: boolean;
}

getWeekStartDay(locale: string): 0 | 1          // en → 0(周日), 其他 → 1(周一)
getCalendarDays(year, month, weekStartsOn): CalendarDay[]  // 42 格日历
formatMonthYear(year, month, locale): string     // Intl 格式化月份标题
getWeekdayNames(locale, weekStartsOn): string[]  // Intl 格式化星期名
formatDisplayDate(iso, locale): string           // ISO → 本地化日期显示
parseIsoDate(iso): { year, month } | null        // ISO → 年月解析
```

---

## 八、CRUD 刷新约定

```typescript
// ✅ 正确：invalidate 触发重新 fetch
onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.users.all })

// ❌ 错误：手动修改缓存（容易产生不一致）
onSuccess: (data) => qc.setQueryData(key, old => ({ ...old, list: [...old.list, data] }))
```
