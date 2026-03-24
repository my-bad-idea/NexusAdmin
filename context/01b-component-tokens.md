# NexusAdmin Semantic Tokens + Component System
> 语义 Token + 状态矩阵 + 封装组件清单。开发具体组件时注入此文件。

## 三、语义 Token（组件直接引用，不再手拼基础变量）

```css
:root {
  /* Button Primary */
  --btn-primary-bg: var(--accent);  --btn-primary-bg-hover: var(--accent-hover);
  --btn-primary-bg-active: var(--accent-active);
  --btn-primary-bg-disabled: color-mix(in srgb, var(--accent) 40%, transparent);
  --btn-primary-text: #ffffff;  --btn-primary-text-disabled: rgba(255,255,255,0.5);
  --btn-primary-ring-focus: var(--shadow-focus);
  /* Button Ghost */
  --btn-ghost-bg-hover: var(--surface-1);  --btn-ghost-bg-active: var(--surface-2);
  --btn-ghost-text: var(--txt-sec);  --btn-ghost-text-hover: var(--txt);
  --btn-ghost-text-disabled: var(--txt-muted);
  /* Button Danger */
  --btn-danger-bg: var(--btn-delete-bg);  --btn-danger-text: var(--btn-delete);
  /* Button Warn */
  --btn-warn-bg: var(--btn-disable-bg);  --btn-warn-text: var(--btn-disable);
  --btn-height-sm: 28px;  --btn-height-md: 34px;  --btn-radius: var(--radius-sm);

  /* Badge */
  --badge-radius: 20px;  --badge-font-size: var(--text-xs);  --badge-px: 8px;  --badge-py: 2px;

  /* Table */
  --table-header-bg: var(--surface-1);  --table-header-text: var(--txt-sec);
  --table-row-default: var(--white);  --table-row-stripe: var(--surface-1);
  --table-row-hover: var(--surface-2);  --table-row-selected: var(--surface-3);
  --table-row-selected-bar: var(--sel-border);
  --table-border: var(--border);  --table-radius: var(--radius-md);

  /* Form Input */
  --input-height: 32px;  --input-radius: var(--radius-sm);
  --input-border-default: var(--border);  --input-border-focus: var(--accent);  --input-border-error: var(--danger);
  --input-bg-default: var(--bg);  --input-bg-hover: var(--white);  --input-bg-disabled: var(--surface-1);
  --input-text-default: var(--txt);  --input-text-placeholder: var(--txt-muted);
  --input-ring-focus: 0 0 0 3px rgba(99,102,241,.12);
  --input-ring-error: 0 0 0 3px rgba(239,68,68,.12);
  --label-text: var(--txt-sec);  --label-required: var(--danger);  --error-text: var(--danger);

  /* Dialog / Drawer */
  --dialog-bg: var(--white);  --dialog-overlay: rgba(15,23,42,.5);
  --dialog-shadow: var(--shadow-3);  --dialog-radius: var(--radius-lg);
  --dialog-max-w: 560px;  --drawer-w: 360px;

  /* Nav */
  --nav-item-text: var(--txt-sidebar);  --nav-item-text-active: #ffffff;
  --nav-item-bg-active: rgba(99,102,241,.20);  --nav-active-bar: var(--accent);
}
```

---

## 四、组件状态矩阵（Button/Input/Row 三大矩阵）

**Button 状态**：通过 CSS 伪类选择器 + semantic token 自动覆盖，禁止 JS 条件拼接：
```tsx
// ✅ 正确写法
className={cn(
  'bg-[var(--btn-primary-bg)] hover:not(:disabled):bg-[var(--btn-primary-bg-hover)]',
  'active:not(:disabled):bg-[var(--btn-primary-bg-active)]',
  'disabled:bg-[var(--btn-primary-bg-disabled)] disabled:cursor-not-allowed',
  'focus-visible:shadow-[var(--btn-primary-ring-focus)] focus-visible:outline-none'
)}
// ❌ 禁止：isDisabled ? 'bg-indigo-300' : 'bg-indigo-500'
```

**Table Row 状态**：
```tsx
className={cn(
  'border-b border-[var(--table-border)] transition-colors cursor-pointer',
  row.getIsSelected()
    ? 'bg-[var(--table-row-selected)] shadow-[inset_4px_0_0_var(--table-row-selected-bar)]'
    : ['hover:bg-[var(--table-row-hover)]', index % 2 === 1 && 'bg-[var(--table-row-stripe)]']
)}
```

---

## 五、封装组件清单（唯一访问入口）

| 样式需求 | 封装组件 | 禁止直接使用 |
|---------|---------|------------|
| 主操作按钮 | `<PrimaryButton>` | `bg-indigo-500` |
| 幽灵按钮 | `<GhostButton>` | `hover:bg-gray-100` |
| 危险按钮 | `<DestructiveButton>` | `bg-red-50 text-red-600` |
| 警告按钮 | `<WarnButton>` | `bg-amber-50 text-amber-500` |
| 角色标签 | `<RoleBadge role="Admin">` | `text-blue-700` |
| 状态标签 | `<StatusBadge status="Active">` | `text-green-700` |
| 数据表格 | `<DataTable>` | 行内颜色 class |
| 表单输入 | `<FormField>` | `border-gray-300` |
| 确认弹窗 | `<ConfirmDialog>` | 自定义 Modal |
| 页面容器 | `<PageContainer>` | `p-6 max-w-*` |
| 空状态 | `<EmptyState>` | 自定义空态 |
| 骨架屏 | `<SkeletonTable>` | 自定义 loading |

### RoleBadge 实现
```tsx
// components/ui/role-badge.tsx
const ROLE_COLORS = {
  Admin:  'var(--role-admin)',
  Editor: 'var(--role-editor)',
  Viewer: 'var(--role-viewer)',
};
export function RoleBadge({ role }: { role: 'Admin'|'Editor'|'Viewer' }) {
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
      style={{
        '--role-color': ROLE_COLORS[role],
        background: 'var(--badge-bg)',
        color: 'var(--role-color)',
        border: '1px solid color-mix(in srgb, var(--role-color) 18%, transparent)',
        boxShadow: '0 1px 2px rgba(0,0,0,.05)',
      } as React.CSSProperties}
    >{role}</span>
  );
}
```

### StatusBadge 实现
```tsx
// components/ui/status-badge.tsx
const STATUS = {
  Active:    { color: 'var(--success)',  bg: 'var(--success-bg)' },
  Inactive:  { color: 'var(--inactive)', bg: 'var(--inactive-bg)' },
  Suspended: { color: 'var(--danger)',   bg: 'var(--danger-bg)' },
};
export function StatusBadge({ status }: { status: keyof typeof STATUS }) {
  const { color, bg } = STATUS[status];
  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium"
      style={{ background: bg, color,
        border: `1px solid color-mix(in srgb, ${color} 18%, transparent)` } as React.CSSProperties}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
      {status}
    </span>
  );
}
```
