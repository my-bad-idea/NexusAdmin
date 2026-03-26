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
  emptyScene?:    'empty' | 'no-results' | 'no-permission';
  emptyResource?: string;           // e.g. "users"
  onEmptyAction?: () => void;
  paginationResource?: string;      // 分页信息显示资源名 e.g. "users"

  // ── P1 推荐（默认值已标注）──────────────────────────
  density?:               'compact' | 'relaxed';  // compact
  striped?:               boolean;                // true
  enableSorting?:         boolean;                // true
  enableColumnVisibility?: boolean;               // false
  mobileView?:            'auto' | 'table' | 'card'; // auto（未实现，计划 v2）

  // ── P2 增强（按需启用）──────────────────────────────
  enableRowVirtualization?: boolean;  // 500+ 行
  columnPinning?:           'left' | 'right';
  hiddenColumns?:           string[];  // 字段级权限隐藏列
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
  onSubmit:      (data: UserFormData) => Promise<void>;
}

interface UserFormData {
  name:       string;   // 必填，2–50 字符
  email:      string;   // 必填，邮箱格式
  department: string;   // 必填
  role:       'Admin' | 'Editor' | 'Viewer';
  status:     'Active' | 'Inactive' | 'Suspended';
  tags?:      string[];
}

// ⚠ 表单内所有输入控件使用原生 HTML 元素（<input> / <select> / <label>）
//    不使用 shadcn Input / Select / Label
//    样式通过 semantic token CSS 变量统一：
//    - 输入框：var(--input-height), var(--input-border-default), var(--input-radius) 等
//    - 下拉框：同上 + appearance:none + 自定义 SVG 箭头
//    - focus ring：onFocus/onBlur 手动设置 borderColor + boxShadow
```

---

## ConfirmDialog — 危险操作必须使用

```typescript
interface ConfirmDialogProps {
  open:        boolean;
  type:        'danger' | 'warning' | 'info';
  title:       string;
  description: string;
  count?:      number;          // 受影响条数
  confirmText?: string;         // 危险操作需输入的确认文本（默认 'confirm'）
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
// 从右侧滑入，宽 360px（实际实现值，admin.html 对齐）
// 遮罩层：透明背景（background: transparent），仅做点击关闭区域，不遮挡表格数据
// 激活状态：触发按钮显示数字角标，抽屉顶部显示 chips 可单独移除
```

---

## EmptyState

```typescript
interface EmptyStateProps {
  scene:     'empty' | 'no-results' | 'no-permission';
  resource?: string;    // e.g. "users"
  keyword?:  string;    // scene=no-results 时显示
  onAction?: () => void;
}
// 三种场景图标：Inbox / SearchX / Lock
// 无权限场景不显示 action 按钮
```

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
// 标准两列表单
<div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
  <FormField name="name" label="Name" required />
  <FormField name="email" label="Email" required />
  <FormField name="bio" label="Bio" className="md:col-span-2" /> {/* 跨两列 */}
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

```tsx
// < 768px 时 DataTable 自动切换，开发者无需手动处理
// 卡片展示字段：name/email（主信息）+ RoleBadge + StatusBadge + 操作按钮
// 选中态：border-[var(--sel-border)] + shadow-[inset_3px_0_0_var(--sel-border)]
```

---

## 响应式列折叠优先级

| 隐藏断点 | 列 | class |
|---------|----|----- |
| < 768px | 创建时间、部门 | `.date-col` `.dept-col` |
| < 480px | 角色 | `.role-col` |
| 永不隐藏 | 姓名/邮箱 + 操作列 | — |

---

## Header（布局级，视觉参考 admin.html `.header`）

```typescript
// 无 props — locale 通过 useLocale()（next-intl）获取，折叠状态来自 useMenuStore
export function Header(): JSX.Element

// ⚠ 使用自定义 useDropdown() hook + click-outside，不使用 shadcn DropdownMenu
//    原因：base-ui DropdownMenu 样式（ring-foreground/10, bg-popover, focus:bg-accent）
//    与 admin.html 的 .dropdown-btn / .dropdown-panel / .user-menu-item 不一致

// 三区布局（flex, gap: 12px, padding: 0 20px, height: var(--header-h)）
// 左区：sidebar collapse toggle（30×30px）+ <Breadcrumb>（根据 pathname 自动生成）
// 中区：<GlobalSearch /> 组件（详见下方 GlobalSearch 章节）
// 右区（marginLeft:auto）：NotificationDropdown + UserDropdown
//
// 两个 Dropdown 均使用 useDropdown() hook：
//   - 触发按钮：bordered（dropdown-btn 样式，32px height, 1px border, var(--bg)）
//   - 面板：absolute, right:0, top:calc(100%+6px), shadow-lg, radius-lg, 淡入动画
//
// NotificationDropdown 面板（300px）：
//   - 头部：Notifications 标题 + "3 new" accent badge
//   - 列表：colored dots + title + time, hover var(--stripe), dividers
//
// UserDropdown 面板（220px）：
//   - 头部：32px 圆形 avatar + name(13px 600) + email(11px muted)
//   - 菜单项：Profile / Change Password（9px 16px padding, hover stripe）
//   - Theme row：icon + label + <select>(26px height, mono font, SVG arrow)
//   - Language row：同上，4 选项（简体中文/繁體中文/日本語/English）
//       切换机制：设置 NEXT_LOCALE cookie + router.refresh()（不改 URL）
//   - Sign Out：color var(--danger)
//   - 分隔线：1px var(--border), margin 4px 0
```

**折叠按钮图标**：展开时显示"lines+左箭头"SVG，收起时显示"lines+右箭头"SVG（与 admin.html `.header-collapse-btn` 一致）

---

## GlobalSearch（Header 中区，全局搜索组件）

```typescript
// components/common/GlobalSearch.tsx
// 无 props — URL 不含 locale 前缀，路径直接使用 /dashboard、/users 等
export function GlobalSearch(): JSX.Element

// 搜索逻辑封装在 hooks/useGlobalSearch.ts
// 静态页面注册表在 lib/searchablePages.ts
// 查询键：queryKeys.search.users(q)（与 users.list 分离命名空间）
```

**输入框**（plain `<input>`，非 shadcn）：
- 容器：`position:relative`, `flex:1`, `maxWidth:320px`, `marginLeft:12px`
- 高度 32px，padding `0 10px 0 32px`，fontSize 13px
- 左侧 Search icon（absolute，13px，`var(--txt-muted)`）
- 聚焦：`borderColor=var(--accent)`, `boxShadow=0 0 0 3px rgba(99,102,241,.12)`
- 无障碍：`role="combobox"`, `aria-expanded`, `aria-controls`, `aria-activedescendant`

**下拉面板**（输入有内容时展开）：
- 定位：`left:0`, `top:calc(100%+6px)`, `width:100%`, `minWidth:280px`
- 样式：`bg:var(--white)`, `border:1px var(--border)`, `radius:var(--radius-lg)`, `shadow:var(--shadow-lg)`
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
// 无 props，内部从 useLocale()（next-intl）读取 locale
export function HtmlLangSync(): null
```

**双重保障机制**：
1. **服务端**：`middleware.ts` 从 `NEXT_LOCALE` cookie 读取 locale → 通过 `x-middleware-request-x-locale` 传递 → `app/layout.tsx` 通过 `headers().get('x-locale')` 读取并设置 `<html lang={locale}>`
2. **客户端**：`HtmlLangSync` 在 `[locale]/layout.tsx` 挂载，使用 `useLocale()`（next-intl）+ `useEffect` 同步 `<html lang>`，处理语言切换后 `router.refresh()` 触发的重渲染

---

## Sidebar（布局级，视觉参考 admin.html `.sidebar`）

```typescript
// 无 props — locale 不再用于构建路径（URL 无 locale 前缀）
// 折叠状态来自 useMenuStore().collapsed（持久化到 localStorage）
// 宽度：展开 var(--sidebar-w) = 220px，收起 var(--sidebar-collapsed-w) = 56px
// 过渡：transition-[width] 220ms cubic-bezier(.4,0,.2,1)
// 结构：Logo 区（高度=var(--header-h)）+ Nav 区（flex-1）+ Footer 区
// Footer：仅版本号（无 Logout 按钮，登出功能在 Header UserDropdown 中）
//   版本号样式：font-family:monospace, font-size:10px, color:#334155
//   collapsed 时隐藏 Footer
```

---

## NavItem（Sidebar 内部组件）

```typescript
interface NavItem {
  id:        string;
  title:     string;
  icon:      string;           // ICON_MAP key → LucideIcon
  path:      string;           // e.g. '/users'
  permCode?: string;           // 无权限时 return null（不渲染）
  badge?:    number;           // 右侧徽标数字（accent bg + 白字，pill 样式）
  children?: NavItem[];        // 有 children 时渲染为可展开/折叠的分组
}

// 展开态：height:40px, padding:9px 18px, fontSize:13px
// 收起态：height:40px, padding:0, justify-content:center + Tooltip(side=right, fontSize:12px, padding:5px 10px)
// 激活：左侧 3px accent bar + bg rgba(99,102,241,.20)
// 子导航：padding-left:44px, fontSize:12.5px, 激活色 #a5b4fc + bg rgba(99,102,241,.16)
// 收起态隐藏子导航和 badge
// 分组父项：带 ChevronDown 展开/折叠箭头，点击展开子项
// 无 section label（不显示分组标签文字）
// Badge 样式：bg:var(--accent), color:#fff, mono 10px, padding:1px 6px, radius:10px
```

---

## FilterBar（列表页筛选区，视觉参考 admin.html `.filter-bar`）

```typescript
// FilterBar 不是独立组件，是列表页内联的 JSX 结构
// 容器样式：bg var(--white), border 1px var(--border), radius var(--radius-md), padding 8px 12px
//            display:flex, flex-wrap:wrap, gap:8px, margin-bottom:10px
//
// ⚠ 所有控件使用原生 HTML 元素，不使用 shadcn 组件：
//   - 搜索框：plain <input type="text">（非 shadcn <Input>）
//   - 下拉选择：native <select>（非 shadcn Select）
//   - 日期选择：<input type="date">
//   原因：base-ui Select 的 SelectValue 渲染 value 属性而非 children 文本；
//         shadcn Input 的 focus-visible:ring-ring/50 与 admin.html 的 accent ring 不一致
//
// 元素规格（从左到右）：
//   1. 搜索框（plain <input>）：height:28px, padding:0 8px 0 28px, fontSize:12px
//      focus: borderColor var(--accent), boxShadow 0 0 0 3px rgba(99,102,241,.12)
//      通过 onFocus/onBlur 手动设置 style
//   2. 下拉选择（native <select>）：height:28px, min-width:120px, fontSize:12px
//      appearance:none, 自定义 SVG 箭头 background-image
//      focus: borderColor var(--accent)
//   3. 日期选择（<input type="date">）：height:28px, min-width:160px, fontSize:11px, mono 字体
//   4. 操作按钮组（marginLeft:auto）：
//      - Search（PrimaryButton，28px）
//      - Reset（GhostButton，28px）
//      - Filters 高级筛选触发按钮（funnel icon + "Filters" + badge count）
//        激活态：border+bg+color=var(--accent)，badge 圆形计数
//
// 高级筛选按钮打开 <AdvancedFilter> 右侧抽屉（360px）
// 筛选条件绑定到 URL Params（禁止 useState / Zustand 存储筛选值）
```

---

## StatCard（仪表盘统计卡片，Dashboard 无 HTML 原型）

```typescript
interface StatCardProps {
  label:     string;
  value:     number | string;
  icon:      React.ComponentType<{ size?: number }>;
  iconBg:    string;   // e.g. 'var(--accent-light)'
  iconColor: string;   // e.g. 'var(--accent)'
  trend?:    { value: number; up: boolean };
}

// 卡片：padding:16px, border:1px var(--border), radius:var(--radius-md), bg:var(--white)
// value 字体：fontSize:20px（--text-2xl），fontWeight:600
// label 字体：fontSize:12px（--text-sm），color:var(--txt-muted)
// icon 区域：40×40px, borderRadius:var(--radius-md), bg:iconBg
```
