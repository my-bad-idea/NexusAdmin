# NexusAdmin 组件接口规范
> 所有组件的标准 Props 接口。以本文件为准，有冲突时覆盖其他章节。

---

## DataTable — 唯一标准接口 🔴 P0

底层：TanStack Table v8（`@tanstack/react-table@^8.20.0`）

```typescript
interface DataTableProps<T extends { id: string }> {
  // ── P0 核心（必须实现）──────────────────────────────
  columns:       ColumnDef<T>[];
  data:          T[];
  isLoading?:    boolean;           // → <SkeletonTable>
  isFetching?:   boolean;           // → 顶部进度条（不遮内容）
  error?:        Error | null;      // → <ErrorState>
  total?:        number;
  page?:         number;
  pageSize?:     number;
  onPageChange?: (page: number, pageSize: number) => void;
  onPageSizeChange?: (size: number) => void;  // Per page 下拉回调
  enableSelection?:    boolean;
  onSelectionChange?:  (selectedIds: string[]) => void;
  sortState?:          SortingState;           // 受控排序（外部管理时传入）
  onSortChange?:       (updater: SortingState | ((prev: SortingState) => SortingState)) => void;
  emptyScene?:    'empty' | 'no-results' | 'no-permission';
  emptyResource?: string;           // e.g. "users"
  onEmptyAction?: () => void;
  paginationResource?: string;      // 分页信息显示资源名 e.g. "users"

  // ── P1 推荐（默认值已标注）──────────────────────────
  density?:               'compact' | 'relaxed';  // compact
  striped?:               boolean;                // true
  enableSorting?:         boolean;                // true

  // ── P2 增强（按需启用）────────────────────────────────
  enableRowVirtualization?: boolean;  // 500+ 行时启用，需搭配 virtualizerHeight
  virtualizerHeight?: number;          // 虚拟滚动容器高度，默认 600px
  // columnPinning?: 'left' | 'right';  // 待实现
}
```

**行状态样式**（深色自动兼容，无需分支）：
```tsx
<tr className={cn(
  'border-b border-[var(--table-border)] transition-colors cursor-pointer',
  row.getIsSelected()
    ? 'bg-[var(--table-row-selected)] shadow-[inset_4px_0_0_var(--table-row-selected-bar)]'
    : ['hover:bg-[var(--table-row-hover)]',
       index % 2 === 1 && 'bg-[var(--table-row-stripe)]']
)}>
```

**密度规格**：

| density | 行高 | padding |
|---------|------|---------|
| compact（默认）| 36px | `py-2 px-3` |
| relaxed | 52px | `py-3 px-4` |

**单元格对齐**：
- 所有 `<th>` / `<td>` 设置 `vertical-align: middle`
- 复选框列（select column）：裸 `<input>` + `verticalAlign: 'middle'`，th 内跳过 `inline-flex` 排序 span 包裹（select 列直接渲染 checkbox，不包裹在排序 icon 的 span 中），禁止包裹 flex div

---

## PageContainer

```typescript
interface PageContainerProps {
  children:  ReactNode;
  title?:    string;       // ActionBar 标题
  subtitle?: string;
  titleExtra?: ReactNode;  // 标题右侧左对齐区域（如 "X selected" 徽标）
  actions?:  ReactNode;    // ActionBar 右侧按钮区（slot）
  padding?:  'default' | 'none';  // default = px-6 py-4
  maxWidth?: 'full' | 'xl';       // full = 100%, xl = max-w-screen-xl
}
// ❌ 禁止在组件内部用 p-* / max-w-* 任意值覆盖
```

---

## UserForm（新建/编辑模态框）

```typescript
interface UserFormProps {
  mode:          'create' | 'edit';
  initialData?:  UserProfile;
  open:          boolean;
  onClose:       () => void;
  onSubmit:      (data: UserSchemaData) => Promise<void>;  // UserSchemaData 来自 features/users/schema.ts
  isPending?:    boolean;   // 提交中状态，控制按钮 loading
}
```

`UserSchemaData` 字段（来自 zod `userSchema`）：`name: string`（2–50 字符）、`email`（邮箱格式）、`department: string`、`role: 'Admin'|'Editor'|'Viewer'`、`status: 'Active'|'Inactive'|'Suspended'`、`tags?: string[]`。

> ⚠ 表单内所有输入控件使用原生 HTML 元素（`<input>` / `<select>` / `<label>`），**禁止** shadcn Input / Select / Label。样式：`className="nx-input"` / `className="nx-select"`（globals.css 工具类），focus ring 由 CSS 自动处理。

---

## ConfirmDialog — 危险操作必须使用

```typescript
interface ConfirmDialogProps {
  open:        boolean;
  type:        'danger' | 'warning' | 'info';
  title:       string;
  description: string;
  count?:      number;          // 受影响条数
  confirmText?: string;         // 危险操作需输入的确认文本（默认走 i18n confirm.confirmWord）
  onConfirm:   () => Promise<void>;
  onCancel:    () => void;
}
```

| type | 确认方式 | 按钮色 | 适用 |
|------|---------|--------|------|
| danger | 输入资源名称确认 | destructive | 删除不可恢复数据 |
| warning | 点击确认 | warn | 批量禁用/重置 |
| info | 点击确认 | primary | 导出/发送通知 |

---

## AdvancedFilter（高级筛选抽屉）

```typescript
interface FilterFieldConfig {
  key:      string;
  label:    string;
  type:     'text' | 'select' | 'date-range' | 'checkbox-group' | 'date-preset';
  options?: { label: string; value: string }[];
  presets?: { label: string; value: string }[];
  halfRow?: boolean; // 连续 halfRow 字段会合并为两列一行
}

interface AdvancedFilterProps {
  open:     boolean;
  onClose:  () => void;
  fields:   FilterFieldConfig[];
  /** 当前 URL params 值 — 打开时用于初始化内部 draft */
  value:    Record<string, unknown>;
  onChange?: (value: Record<string, unknown>) => void;
  onApply:  (values: Record<string, unknown>) => void;
  onReset:  () => void;
}
```

从右侧滑入，宽 360px（admin.html 对齐）。遮罩层透明背景（`background: transparent`），仅做点击关闭区域，不遮挡表格。激活状态：触发按钮显示数字角标，抽屉顶部显示 chips 可单独移除。

---

## EmptyState

```typescript
interface EmptyStateProps {
  scene:     'empty' | 'no-results' | 'no-permission';
  resource?: string;    // e.g. "users"
  keyword?:  string;    // scene=no-results 时显示
  onAction?: () => void;
}
```

三种场景图标：`Inbox` / `SearchX` / `Lock`。无权限场景不显示 action 按钮。

---

## SkeletonTable

```typescript
interface SkeletonTableProps {
  rows?:    number;  // 默认 7
  columns?: number;  // 默认 6
}
```

**SSR 安全**：渲染中禁止 `Math.random()`，会导致 hydration mismatch。
用行列索引确定性公式：`opacity: 0.6 + ((r * columns + c) % 7) * 0.057`

---

## 表单栅格规范

```tsx
// 标准两列表单（无 <FormField> 封装组件，直接用原生 HTML）
<div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
  <div>
    <label className="nx-label">Name <span style={{ color: 'var(--label-required)' }}>*</span></label>
    <input className="nx-input" name="name" required />
  </div>
  <div>
    <label className="nx-label">Email <span style={{ color: 'var(--label-required)' }}>*</span></label>
    <input className="nx-input" name="email" type="email" required />
  </div>
  <div className="md:col-span-2">
    <label className="nx-label">Bio</label>
    <input className="nx-input" name="bio" />
  </div>
</div>
// Footer 固定右下角
<div className="flex justify-end gap-2 mt-6">
  <GhostButton onClick={onClose}>Cancel</GhostButton>
  <PrimaryButton type="submit" loading={isPending}>Save</PrimaryButton>
</div>
```

**表单规则**：
- Label 统一在 input 上方（禁止横排 label）
- 必填字段 label 加 `*`，通过 `required` prop 统一渲染
- 错误信息显示在 input 下方，`text-[var(--error-text)] text-xs`

---

## Drawer vs Modal 使用边界

| 容器 | 宽度 | 适用 | 禁止 |
|------|------|------|------|
| Sheet（Drawer，右侧滑入）| --drawer-w (360px) | 筛选面板 / 快速预览 / 多步骤 | 超过 8 个字段的编辑表单 |
| Dialog（Modal，居中）| --dialog-max-w (560px) | 确认弹窗 / 简单编辑（≤6字段）| 放列表 / 图表 |
| 独立路由页 | 100% | 复杂编辑（>6字段）/ 详情 | — |

---

## MobileCard（表格移动端卡片视图）

- `< 768px` 时 DataTable 自动切换为卡片视图，开发者无需手动处理
- 卡片布局：前两列为主信息（`flex-1`），`actions` 列居右；其余列包裹在底部 `flex-wrap` 区
- 选中态：`border-l-4 border-[var(--sel-border)] bg-[var(--surface-3)]`

---

## 响应式列折叠优先级

> DataTable 无内置列隐藏机制。在列表页的 `columns` 定义中，通过 `meta.className` 传入 Tailwind 类手动控制：

| 隐藏断点 | 列 | 推荐做法 |
|---------|----|----- |
| < 768px | 创建时间、部门 | `className: 'hidden md:table-cell'` |
| < 480px | 角色 | `className: 'hidden sm:table-cell'` |
| 永不隐藏 | 姓名/邮箱 + 操作列 | — |

---

## Header（布局级，`components/layout/Header.tsx`，视觉参考 admin.html `.header`）

```typescript
export function Header(): JSX.Element  // 无 props
```

无 props — locale 通过 `useLocale()`（next-intl）获取，折叠状态来自 `useMenuStore`。

> ⚠ 使用 `useDropdown()` hook + click-outside，**禁止** shadcn DropdownMenu。`useDropdown` 定义在 `Header.tsx` 内部（局部 hook），非独立 hook 文件。原因：base-ui DropdownMenu 的 `ring-foreground/10 bg-popover focus:bg-accent` 与 admin.html 的 `.dropdown-btn / .dropdown-panel` 不一致。

**三区布局**（`flex`, `gap:12px`, `padding:0 20px`, `height:var(--header-h)`）：
- **左区**：sidebar collapse toggle（30×30px）+ `<Breadcrumb>`（根据 pathname 自动生成）
- **中区**：`<GlobalSearch />` 组件
- **右区**（`marginLeft:auto`）：NotificationDropdown + UserDropdown

两个 Dropdown 均使用 `useDropdown()` hook，触发按钮 `dropdown-btn` 样式（32px height, 1px border, `var(--bg)`），面板 `absolute, right:0, top:calc(100%+6px), shadow:var(--shadow-2), radius-lg`，淡入动画。

**NotificationDropdown**（300px）：头部 Notifications 标题 + "3 new" accent badge；列表：colored dots + title + time，hover `var(--stripe)`，分隔线。

**UserDropdown**（220px）：
- 头部：32px 圆形 avatar + name（13px 600）+ email（11px muted）
- 菜单项：Profile / Change Password（`padding:9px 16px`，hover stripe）
- Theme row：icon + label + `<select>`（26px，mono font，SVG arrow）
- Language row：同上，4 选项（简体/繁體/日本語/English），切换机制：设置 `NEXT_LOCALE` cookie + `router.refresh()`（不改 URL）
- Sign Out：`color:var(--danger)`；分隔线：`1px var(--border), margin:4px 0`

**折叠按钮图标**：展开时显示"lines+左箭头"SVG，收起时显示"lines+右箭头"SVG（与 admin.html `.header-collapse-btn` 一致）

---

## GlobalSearch（Header 中区，全局搜索组件）

```typescript
// components/common/GlobalSearch.tsx
export function GlobalSearch(): JSX.Element  // 无 props
```

无 props — URL 不含 locale 前缀，路径直接使用 `/dashboard`、`/users` 等。搜索逻辑封装在 `hooks/useGlobalSearch.ts`，静态页面注册表在 `lib/searchablePages.ts`，查询键 `queryKeys.search.users(q)`（与 `users.list` 分离命名空间）。

**输入框**（plain `<input>`，非 shadcn）：
- 容器：`position:relative`, `flex:1`, `maxWidth:320px`, `marginLeft:12px`
- 高度 32px，padding `0 10px 0 32px`，fontSize 13px
- 左侧 Search icon（absolute，13px，`var(--txt-muted)`）
- 聚焦：`borderColor=var(--accent)`, `boxShadow=0 0 0 3px rgba(99,102,241,.12)`
- 无障碍：`role="combobox"`, `aria-expanded`, `aria-controls`, `aria-activedescendant`

**下拉面板**（输入有内容时展开）：
- 定位：`left:0`, `top:calc(100%+6px)`, `width:100%`, `minWidth:280px`
- 样式：`bg:var(--white)`, `border:1px var(--border)`, `radius:var(--radius-lg)`, `shadow:var(--shadow-2)`
- 最大高度 360px，`overflowY:auto`
- `role="listbox"`

**结果分组**：
- 分组标签：10px 大写，`var(--txt-muted)`，`padding:8px 16px 4px`，`letterSpacing:.05em`
- **Pages 组**（`query.length >= 1`）：同步过滤 `SEARCHABLE_PAGES`，限 5 条
  - 每项：lucide icon(14px, opacity:0.6) + 标题(13px)
- **Users 组**（`query.length >= 2`，防抖 300ms）：`fetchUsers({ keyword, pageSize:5 })`，`staleTime:30s`
  - 每项：圆形头像(24px, initials, `var(--accent)`) + 姓名 + 邮箱(11px muted)
- 组间分隔线：`1px var(--border)`, `margin:4px 0`

**结果项样式**：
- `padding:9px 16px`, `fontSize:13px`, `cursor:pointer`
- hover / keyboard-active：`background:var(--stripe)`
- `role="option"`, `aria-selected`

**键盘导航**：
- ↑↓：切换高亮项（循环）
- Enter：跳转到选中项
- Escape：关闭面板
- Pages 跳转：直接路径（如 `/dashboard`、`/users`），无 locale 前缀
- Users 跳转：`/users?keyword={name}`（预填用户列表筛选）

**空状态 / 加载态**：
- 加载中（`query >= 2` 且 API 请求中）：居中显示 "Searching..."
- 无结果（`query >= 2` 且无匹配）：居中显示 "No results found"
- 样式：`padding:16px`, `fontSize:12px`, `color:var(--txt-muted)`, `textAlign:center`

---

## HtmlLangSync（布局级辅助组件）

```typescript
// components/common/HtmlLangSync.tsx
export function HtmlLangSync(): null  // 无 props，useLocale() 读取 locale
```

**双重保障机制**：
1. **服务端**：`middleware.ts` 从 `NEXT_LOCALE` cookie 读取 locale → 通过 `x-middleware-request-x-locale` 传递 → `app/layout.tsx` 通过 `headers().get('x-locale')` 读取并设置 `<html lang={locale}>`
2. **客户端**：`HtmlLangSync` 在 `[locale]/layout.tsx` 挂载，使用 `useLocale()`（next-intl）+ `useEffect` 同步 `<html lang>`，处理语言切换后 `router.refresh()` 触发的重渲染

---

## Sidebar（布局级，`components/layout/Sidebar.tsx`，视觉参考 admin.html `.sidebar`）

```typescript
export function Sidebar(): JSX.Element  // 无 props
```

无 props — 折叠状态来自 `useMenuStore().collapsed`（持久化到 localStorage）。宽度：展开 `var(--sidebar-w)` = 220px，收起 `var(--sidebar-collapsed-w)` = 56px，过渡 `transition-[width] 220ms cubic-bezier(.4,0,.2,1)`。

结构：Logo 区（高度 `var(--header-h)`）+ Nav 区（`flex-1`）+ Footer 区。Footer 仅显示版本号（无 Logout，登出在 Header UserDropdown），collapsed 时隐藏。

---

## NavItem（Sidebar 内部组件）

```typescript
interface NavItem {
  id:        string;
  titleKey:  string;           // i18n 翻译键（通过 t(titleKey) 解析，非直接文本）
  icon:      string;           // ICON_MAP key → LucideIcon
  path:      string;           // e.g. '/users'
  permCode?: string;           // 无权限时 return null（不渲染）
  badge?:    number;           // 右侧徽标数字（accent bg + 白字，pill 样式）
  children?: NavItem[];        // 有 children 时渲染为可展开/折叠的分组
}
```

- **展开态**：`height:40px`, `padding:9px 18px`, `fontSize:13px`
- **收起态**：`height:40px`, `padding:0`, `justify-content:center` + Tooltip（`side=right`, `fontSize:12px`, `padding:5px 10px`）；隐藏子导航和 badge
- **激活**：左侧 3px accent bar + `bg:rgba(99,102,241,.20)`
- **子导航**：`padding-left:44px`, `fontSize:12.5px`，激活色 `#a5b4fc` + `bg:rgba(99,102,241,.16)`
- **分组父项**：带 ChevronDown 展开/折叠箭头，无 section label
- **Badge**：`bg:var(--accent)`, `color:#fff`, mono 10px, `padding:1px 6px`, `radius:10px`

---

## FilterBar（列表页筛选区，视觉参考 admin.html `.filter-bar`）

FilterBar **不是独立组件**，是列表页内联的 JSX 结构。容器：`bg:var(--white)`, `border:1px var(--border)`, `radius:var(--radius-md)`, `padding:8px 12px`, `display:flex`, `flex-wrap:wrap`, `gap:8px`, `margin-bottom:10px`。

> ⚠ 所有控件使用原生 HTML 元素，**禁止** shadcn Input / Select。原因：base-ui Select 的 `SelectValue` 渲染 `value` 属性而非 `children` 文本；shadcn Input 的 `focus-visible:ring-ring/50` 与 admin.html 的 accent ring 不一致。

**元素规格（从左到右）**：
1. 搜索框：`className="nx-input nx-input-sm"`（28px，focus ring 由 CSS 自动处理）；带左侧 Search icon 时加 `padding-left:28px` + absolute icon 定位
2. 下拉选择：`className="nx-select-sm"`（28px，`width:auto`，SVG 箭头内置）
3. 日期选择（`<input type="date">`）：`height:28px`, `min-width:160px`, `fontSize:11px`，mono 字体
4. 操作按钮组（`marginLeft:auto`）：Search（PrimaryButton，28px）、Reset（GhostButton，28px）、Filters 触发按钮（funnel icon + "Filters" + badge count，激活态 `border+bg+color=var(--accent)`）

高级筛选按钮打开 `<AdvancedFilter>` 右侧抽屉（360px）。筛选条件绑定 URL Params，**禁止** `useState` / Zustand 存储筛选值。

---

## StatCards（仪表盘统计卡片组，`features/dashboard/StatCards.tsx`）

```typescript
export function StatCards(): JSX.Element  // 无 props
```

自包含 feature 组件，内部通过 `useQuery` 获取数据，仅在 Dashboard 页使用（`<StatCards />`）。

内部 hardcoded CARDS 配置，4 张卡片：总用户 / 总角色 / 今日登录 / 系统状态。

- 卡片：`padding:16px`, `border:1px var(--border)`, `radius:var(--radius-md)`, `bg:var(--white)`, `shadow:var(--shadow-1)`
- value 字体：`fontSize:var(--text-2xl)`（20px），`fontWeight:var(--font-bold)`（600）
- label 字体：`fontSize:var(--text-sm)`（12px），`color:var(--txt-muted)`
- icon 区域：36×36px，`borderRadius:var(--radius-sm)`，bg 由配置决定
- 加载态：4 个等高骨架卡片，`animate-pulse`
- 响应式：1列 → `sm:` 2列 → `lg:` 4列
