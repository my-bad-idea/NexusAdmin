# NexusAdmin — AI 开发约束

## 项目介绍

通用的后台管理 Web 前端项目。技术栈禁止替换：Next.js 15 App Router · React 19 · shadcn/ui · Tailwind v4 · Zustand · TanStack Query v5 · next-intl · MSW v2 · Vitest · TypeScript 5.6

## 视觉参考
`admin.html`（项目根目录）是唯一视觉原型，实现时以此为对齐标准。
Dashboard 页无 HTML 原型，按 `context/02-components.md` 接口规范自由实现。

## ❌ P0 禁止（违反必须重写）

**样式**
- 禁止 Tailwind 颜色类：`bg-blue-*` `text-gray-*` `border-red-*`
- 禁止硬编码色值（hex/rgb/hsl），`style` 属性中允许 `var(--*)`
- `className` 中优先使用 Tailwind 任意值形式 `bg-[var(--accent)]`，封装组件仍为首选

**状态**
- Zustand 禁止存服务端数据（list / items / rows / records 键名）
- 筛选条件存 URL Params，不存 useState / Zustand
- 禁止重复实现 loading / error / pagination（用 useListPage）

**组件边界**
- `features/` 模块之间禁止互相引用
- `common/` 禁止依赖 `features/`
- `ui/` 组件禁止调用 useQuery / useMutation

**交互**
- Delete 必须经过 `<ConfirmDialog>`，禁止直接调 API
- 无权限按钮必须 `return null`，禁止用 `disabled` 代替

**Header / FilterBar / 表单**
- Header 下拉菜单（通知、用户菜单）使用自定义 Dropdown（`useDropdown` hook），禁止使用 shadcn DropdownMenu。表格行操作菜单可使用 shadcn DropdownMenu
- FilterBar 搜索框/下拉/日期使用原生 HTML 元素（`<input>` / `<select>`），禁止 shadcn Input / Select
- 表单（UserForm / ConfirmDialog 等）使用原生 `<input>` / `<select>`，禁止 shadcn Input / Select
- 所有弹框遮罩层使用透明背景（`bg-transparent`），不遮挡底层内容
- 所有原生控件（date picker、表单验证消息等）语言必须与系统语言一致（`<html lang>` 由 `HtmlLangSync` 组件同步）

## ✅ P0 必须遵守

**国际化**
- 所有用户可见文本必须通过 `useTranslations()` 获取，禁止硬编码字符串
- 翻译文件：`i18n/messages/{zh-CN,zh-TW,ja,en}.json`
- 组件外常量使用翻译键字符串，在组件内通过 `t(key)` 解析
- 工厂函数（如 `createUserColumns`）通过参数接收 `t` 函数

代码模式见 `@context/00-quick-ref.md` 第三节（状态归属 / 权限 / DataTable / CRUD 刷新）。

## 页面骨架（三种，禁止自创）
列表页 / 表单页 / 仪表盘，详见 `@context/00-quick-ref.md` 第四节。

## 按钮层级（每区域最多 1 个 primary）
primary=Add/Save · outline=Export/Reset · warn=Disable · destructive=Delete(+ConfirmDialog) · ghost=Edit/图标

## 按任务 @引用
- **通用/日常**：`@context/00-quick-ref.md`（涵盖大多数任务）
- 颜色/主题：`@context/01a-color-tokens.md`
- 封装组件：`@context/01a-color-tokens.md @context/01b-component-tokens.md`
- 组件接口：`@context/02-components.md`
- 数据/状态：`@context/03-data-layer.md`
- 权限：`@context/04-auth-permission.md`
- API/Mock：`@context/05-api-mock.md`
- 测试：`@context/06-testing.md`
