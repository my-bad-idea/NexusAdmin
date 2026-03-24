# NexusAdmin 快速参考
> 技术栈 + 目录结构 + P0 规则摘要 + 视觉规则（提炼自 admin.html）。大多数任务注入此文件即可。

---

## 一、技术栈

```
Next.js 15 App Router · React 19 · shadcn/ui · Tailwind v4
Zustand（客户端状态）· TanStack Query v5（服务端状态）
next-intl · MSW v2 · Vitest · Playwright · TypeScript 5.6
```

---

## 二、目录结构

```
nexus-admin/
├── app/[locale]/                 # locale 不在 URL 显示（localePrefix:'never'），由 NEXT_LOCALE cookie 决定
│   ├── layout.tsx              # NextIntlClientProvider + HtmlLangSync
│   ├── login/page.tsx
│   └── (admin)/layout.tsx      # AdminLayout（需鉴权）
├── components/
│   ├── ui/                     # shadcn + 极简封装（禁止业务逻辑）
│   ├── common/                 # 通用业务组件（可跨模块）
│   └── features/               # 业务组合组件（禁止跨模块引用）
├── store/                      # Zustand: auth | theme | menu | tableView
├── queries/                    # TanStack Query hooks + queryKeys 工厂
├── hooks/
│   ├── usePermission.ts
│   ├── useList.ts / useAction.ts / useFormError.ts
│   └── templates/useListPage.ts / useFormPage.ts
├── features/{module}/          # schema.ts | columns | form | viewModel
├── .nexus/{module}/            # 编译产物（只读，禁止手改）
├── mocks/handlers/             # MSW（按模块分文件）
├── i18n/messages/              # zh-CN | zh-TW | en | ja
├── styles/globals.css          # 所有 CSS 变量双主题（唯一 Token 定义处）
└── middleware.ts               # 路由守卫（未登录→/login，无权限→/403）
```

---

## 三、P0 规则摘要（违反必须重写）

### 样式禁令
```
❌ className="bg-blue-500"        → ✅ className="bg-[var(--accent)]"
❌ className="text-gray-900"      → ✅ className="text-[var(--txt)]"
❌ style={{ color: '#6366f1' }}   → ✅ <PrimaryButton>（通过封装组件）
❌ features/ 中直接写 var(--)     → 只有 components/ui/ 和 common/ 可以
```

### 状态禁令
```
❌ Zustand 存放 list/items/rows   → ✅ TanStack Query 管理服务端数据
❌ useState 存放筛选条件          → ✅ URL Search Params
❌ setQueryData 手动拼接列表      → ✅ invalidateQueries 重新 fetch
```

### 组件禁令
```
❌ features/ 模块互相引用         → ✅ 提取到 common/ 再共享
❌ common/ 依赖 features/         → 单向依赖，common 不知道业务
❌ ui/ 组件调用 useQuery          → ui/ 只做展示，无数据获取
❌ Delete 直接调 API              → ✅ 必须经过 <ConfirmDialog>
❌ 无权限用 disabled              → ✅ return null（隐藏）
```

### 国际化
```
❌ 硬编码用户可见文本            → ✅ useTranslations() + t('key')
❌ 组件外常量直接写英文 label    → ✅ 常量存翻译键，组件内 t(key)
❌ 工厂函数内直接写文本          → ✅ 通过参数接收 t 函数
翻译文件: i18n/messages/{zh-CN,zh-TW,ja,en}.json
```

### 强制约束
```typescript
// DataTable 泛型必须有 id 字段
function DataTable<T extends { id: string }>

// 权限检查统一写法
const can = usePermission('user:delete');
if (!can) return null;

// 批量 CRUD 后刷新缓存
onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.users.all })
```

---

## 四、页面骨架（三种，禁止自创布局）

```
骨架A（列表页）：
  <PageContainer title titleExtra={selectedBadge} actions>
    <FilterBar>
      plain <input>（搜索，非 shadcn Input）+ native <select>×N + <input type="date"> + SearchBtn + ResetBtn + FiltersBtn(→AdvancedFilter)
    </FilterBar>
    <DataTable columns data isLoading total page onPageChange onPageSizeChange paginationResource />
  </PageContainer>

骨架B（表单页）：
  <PageContainer title>
    <PageHeader actions />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
      <FormField />
      <FormField className="md:col-span-2" />  {/* 跨列 */}
    </div>
    <div className="flex justify-end gap-2 mt-6">
      <GhostButton>Cancel</GhostButton>
      <PrimaryButton type="submit">Save</PrimaryButton>
    </div>
  </PageContainer>

骨架C（仪表盘）：
  <PageContainer>
    <StatCards />
    <ChartsGrid />
  </PageContainer>
```

---

## 五、视觉规则摘要（提炼自 admin.html）

### 5.1 布局尺寸

| 元素 | 数值 | 说明 |
|------|------|------|
| Sidebar 展开宽 | 220px | `--sidebar-w` |
| Sidebar 折叠宽 | 56px | `--sidebar-collapsed-w` |
| Header 高度 | 52px | `--header-h` |
| PageContainer 水平内边距 | 24px | `--page-px`，`padding: 0 20px` |
| ActionBar 底部间距 | 10px | `margin-bottom: 10px` |
| FilterBar 底部间距 | 10px | `margin-bottom: 10px` |

### 5.2 字号体系（正文 14px 基准）

| 场景 | 字号 | 字重 |
|------|------|------|
| 基础正文 / body | 14px | 400 |
| 表格内容 / td | 12.5px | 400 |
| 表头 / th | 10.5px | 600，大写 |
| Badge / 标签 | 10px | 500，等宽字体 |
| 分页信息 | 11px | 400 |
| 行内操作按钮 | 11px | 500 |
| 导航项 | 13px | 400 |
| 页面标题（ActionBar）| 15px | 700 |
| Sidebar Logo | 16px | 700，Display 字体 |
| Modal 标题 | 14px | 600 |
| 辅助/时间戳 | 11px | 400，`--txt-muted` |

### 5.3 间距规格

| 元素 | 规格 |
|------|------|
| 按钮（standard）| height: 28px，padding: 0 12px，font-size: 12px |
| 按钮（small）| height: 24px，padding: 0 10px，font-size: 11px |
| 行内操作按钮 | height: 22px，padding: 0 8px，font-size: 11px |
| 表格 td padding | 8px 10px, vertical-align: middle |
| 表头 th padding | 7px 10px, vertical-align: middle |
| FilterBar padding | 8px 12px |
| FilterBar 控件高度 | 28px（input/select/date） |
| Filter input padding | 0 8px 0 28px（含 icon 留位）|
| Badge padding | 1px 7px |
| Pagination 按钮 | 24×24px |
| 头像 | 26×26px |
| Header 操作按钮 | height: 32px，padding: 0 10px |

### 5.4 圆角

| 场景 | 数值 | 变量 |
|------|------|------|
| 按钮/输入框/小控件 | 5px | `--radius-sm` |
| 卡片/FilterBar/下拉 | 8px | `--radius-md` |
| Modal/抽屉/大容器 | 12px | `--radius-lg` |
| Badge 胶囊 | 20px | 固定值 |
| 头像 | 50% | 圆形 |
| Logo 图标 | 6px | 固定值 |

### 5.5 Hover & 交互动效

| 元素 | Hover 效果 | Transition |
|------|-----------|-----------|
| 主按钮 | `--accent-hover` bg + `0 2px 8px rgba(99,102,241,.3)` 阴影 | `background .15s, box-shadow .15s` |
| 幽灵按钮 | `--white` bg + border-color #ccc | `background .15s` |
| 行内操作按钮 | `--white` bg + border #bbb | `all .12s` |
| :active 按压 | `transform: scale(.98)` | `transform .1s` |
| 表格行 hover | `--surface-2` 背景 | `background .1s` |
| 导航项 hover | `rgba(255,255,255,.06)` bg | `color .15s, background .15s` |
| Focus ring | `0 0 0 3px rgba(99,102,241,.12)` | `border-color .15s, box-shadow .15s` |
| Sidebar 折叠 | `width .22s cubic-bezier(.4,0,.2,1)` | — |
| Dropdown 弹出 | `opacity .18s, transform .18s` | — |
| Drawer 滑入 | `transform .25s cubic-bezier(.4,0,.2,1)` | — |
| Drawer 遮罩层 | 透明背景（background: transparent），仅做点击关闭区域 | — |

### 5.6 阴影层级

| 层级 | 数值 | 使用场景 |
|------|------|---------|
| shadow-sm | `0 1px 3px rgba(15,23,42,.06), 0 1px 2px rgba(15,23,42,.04)` | 卡片、Table Card |
| shadow-md | `0 4px 16px rgba(15,23,42,.08), 0 2px 6px rgba(15,23,42,.05)` | Dropdown |
| shadow-lg | `0 12px 32px rgba(15,23,42,.12)` | Modal、Drawer |
| 深色 focus | `0 0 0 3px rgba(99,102,241,.12)` | input/button focus |
| 主按钮 hover | `0 2px 8px rgba(99,102,241,.3)` | PrimaryButton:hover |

### 5.7 Sidebar 视觉规范

```
导航项高度：40px
导航项 padding：9px 18px
导航项字号：13px
子导航缩进：padding-left: 44px，font-size: 12.5px
子导航激活色：color: #a5b4fc，background: rgba(99,102,241,.16)
激活指示条：width: 3px，左侧，--accent 色
折叠态 tooltip：font-size: 12px，padding: 5px 10px，radius: 5px，shadow: 0 4px 12px rgba(0,0,0,.3)
折叠态隐藏：子导航项、badge、展开箭头、版本号
分组导航：父项可展开/折叠，带 ChevronDown 箭头
Badge 徽标：accent bg + 白字，font-size: 10px，pill 样式（1px 6px, radius: 10px）
无 section label（不显示 "MAIN" 等分组标签文字）
Footer：仅显示版本号（monospace 10px #334155），无 Logout 按钮（登出在 Header UserDropdown）
```

### 5.8 字体加载规范

```
1. Google Fonts 必须在 layout.tsx <head> 中通过 <link> 引入：
   Bricolage Grotesque (400/600/700) + DM Mono (400/500) + Instrument Sans (ital,400/500/600)

2. 页面标题（ActionBar h1）：font-family: var(--font-display)，letter-spacing: -.3px
   选中数量徽标（"X selected"）通过 titleExtra 左对齐在标题旁，不放在右侧 actions 区

3. 内容底部间距：pb-[var(--space-2xl)] (32px)，而非 py-[var(--page-py)]

4. 分页结构：pagination 是 table-card 内部一部分（border-top 分隔线），不在卡片外独立渲染
```

### 5.9 表格视觉规范

```
表头背景：--surface-1，border-bottom: 1px solid --border
表头字号：10.5px，uppercase，letter-spacing: .05em，--txt-sec
斑马纹：偶数行 --surface-1
选中行：--surface-3 背景 + inset 4px 0 0 --sel-border（左侧 indigo 条）
行 hover：--surface-2
操作列宽：90px，居中对齐
复选框列宽：40px，th/td padding: 7px/8px 0，textAlign: center
复选框居中：裸 <input> + verticalAlign: middle；th 内跳过 inline-flex 排序 span 包裹（select 列直接渲染 checkbox，不包裹在 <span className="inline-flex"> 中）
排序：仅显式标记的列可排序（Name/Email + Created），其余列 enableSorting: false
排序图标：文本箭头 ↕（未排序）/ ↑（升序）/ ↓（降序），font-size: 9px, opacity: .4，非 Lucide 图标
操作列：Edit 幽灵按钮 + "···" 更多菜单（DropdownMenu），非直接显示 Delete
分页样式：Showing X–Y of Z {resource} + 数字页码按钮（‹ 1 2 3 ··· N ›）+ Per page 下拉
日期格式：YYYY-MM-DD（toISOString().slice(0,10)），等宽字体
```

### 5.10 Badge / 状态标签规范

```
角色 Badge（胶囊型）：
  padding: 1px 7px，border-radius: 20px，font-size: 10px，等宽字体
  白底 + 角色色文字 + 20% 角色色边框
  Admin → --role-admin #1d4ed8
  Editor → --role-editor #7c3aed
  Viewer → --role-viewer #374151

状态 Badge：
  Active  → --success-bg 底 + --success 文字 + 5px 圆点
  Inactive → --warn-bg 底 + --warn 文字
  Suspended → --danger-bg 底 + --danger 文字
```

### 5.11 Header Dropdown 视觉规范

```
⚠ Header 通知和用户菜单使用自定义 Dropdown（useDropdown hook + click-outside），
  不使用 shadcn DropdownMenu（其 base-ui 样式 ring-foreground/10, bg-popover 等与 admin.html 不一致）。

触发按钮（dropdown-btn）：
  height: 32px, padding: 0 10px, border: 1px solid var(--border)
  border-radius: var(--radius-sm), background: var(--bg)
  font-size: 13px, color: var(--txt-sec), cursor: pointer
  hover: border-color #ccc, background var(--white)

面板（dropdown-panel）：
  position: absolute, right: 0, top: calc(100% + 6px)
  background: var(--white), border: 1px solid var(--border)
  border-radius: var(--radius-lg), box-shadow: var(--shadow-lg)
  动画：opacity .18s + translateY(-6px→0) scale(.98→1)
  关闭：click-outside（mousedown listener）

通知面板（notif-panel）：width: 300px
  头部：Notifications + "3 new" badge（accent-light bg）
  列表项：8px 彩色圆点 + 标题(13px) + 时间(11px muted), hover var(--stripe)
  分隔线：1px var(--border), margin 0 16px
  底部：border-top 1px var(--border), padding 10px 16px, "View all notifications" 链接
    fontSize 12px, color var(--accent), fontWeight 500, hover underline

用户面板（user-panel）：width: 220px
  头部：32px 圆形头像(accent bg) + name(13px 600) + email(11px muted)
  菜单项：padding 9px 16px, fontSize 13px, hover var(--stripe), width 100%
  Theme/Language 行：flex row, icon + label + ml-auto <select>
  迷你 select：height 26px, padding 0 22px 0 8px, border 1px var(--border)
    radius 4px, fontSize 12px, font-mono, 自定义 SVG 箭头, appearance:none
  分隔线：height 1px, var(--border), margin 4px 0
  Sign Out：color var(--danger)
```

### 5.12 原生控件统一规范

```
⚠ FilterBar、表单（UserForm / ConfirmDialog）、高级筛选中的所有输入控件
  均使用原生 HTML 元素，不使用 shadcn Input / Select / Label。
  原因：
  - base-ui Input 的 focus-visible:ring-ring/50 与 admin.html 的 accent ring 不一致
  - base-ui Select 的 SelectValue 渲染 value 属性而非 children 文本
  - 统一样式确保 FilterBar、表单、高级筛选视觉一致

输入框统一样式：
  height: var(--input-height), width: 100%, padding: 0 10px
  border: 1px solid var(--input-border-default), border-radius: var(--input-radius)
  fontSize: var(--text-sm), background: var(--input-bg-default), color: var(--input-text-default)
  focus: borderColor var(--input-border-focus), boxShadow var(--input-ring-focus)
  onFocus/onBlur 手动设置 style

下拉选择统一样式：
  同上 + appearance: none, WebkitAppearance: none
  自定义 SVG 箭头 background-image, padding-right: 28px
  <option> 显示文本即 children（原生行为，无 base-ui 问题）

日期选择：<input type="date">
  同输入框样式，min-width: 160px, fontSize: 11px, font-mono

Label：原生 <label>，fontSize: var(--text-sm), color: var(--label-text), fontWeight: 500
```

### 5.13 遮罩层规范

```
所有弹框（Dialog / ConfirmDialog）和抽屉（AdvancedFilter）遮罩层：
  background: transparent（不遮挡底层内容）
  仅作为点击关闭区域

Dialog overlay：在 dialog.tsx 中 DialogOverlay className 使用 bg-transparent
AdvancedFilter overlay：inline style background: 'transparent'
```

### 5.14 控件语言同步 & i18n 机制

```
支持语言：zh-CN（默认）| zh-TW | ja | en
语言偏好存储：NEXT_LOCALE cookie（由 Header 语言下拉设置，1年有效期）
URL 不包含 locale 前缀（localePrefix: 'never'），所有路由形如 /dashboard、/users

原生控件（<input type="date">、表单验证消息等）的语言由 <html lang=""> 决定。
服务端：middleware.ts 从 NEXT_LOCALE cookie 读取 locale →
  通过 x-middleware-request-x-locale 传递 → app/layout.tsx 设置 <html lang={locale}>
客户端：<HtmlLangSync>（components/common/HtmlLangSync.tsx）使用 useLocale()（next-intl）
  通过 useEffect 同步 <html lang>

语言切换流程：Header 下拉 → 设置 NEXT_LOCALE cookie → router.refresh() →
  middleware 读取新 cookie → next-intl 加载对应 messages → 页面重新渲染
```

---

## 六、context 注入速查

| 任务 | 注入文件 |
|------|---------|
| 样式 / Token | `@01a-color-tokens.md` |
| 组件实现 | `@01a + @01b-component-tokens.md` |
| 列表页 / 表格 | `@02-components.md @03-data-layer.md` |
| 表单 / 编辑 | `@02-components.md @03-data-layer.md` |
| 权限控制 | `@04-auth-permission.md` |
| API / Mock | `@05-api-mock.md` |
| 测试 | `@06-testing.md` |
| 完整功能页 | `@02 @03 @04` |
