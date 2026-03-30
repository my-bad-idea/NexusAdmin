# NexusAdmin Color Tokens
> 颜色变量 + Spacing/Shadow/Interaction 基础值 + CSS 工具类。样式任务必须注入此文件。

---

## 一、颜色变量（app/globals.css）

```css
/* ── 浅色主题 :root ───────────────────── */
:root {
  /* Layout */
  --sidebar-w: 220px;  --sidebar-collapsed-w: 56px;  --header-h: 52px;

  /* 4-layer surface */
  --bg:         #f4f6f9;   /* page 背景 */
  --white:      #ffffff;   /* 卡片/表格默认行 */
  --surface-1:  #f8fafc;   /* 斑马纹偶数行 */
  --surface-2:  #f1f5f9;   /* hover 行 */
  --surface-3:  #f0f4ff;   /* 选中行背景 */
  --sel-border: #6366f1;   /* 选中行左侧 4px 条 */
  --sidebar-bg: #0f172a;

  /* Borders */
  --border:      #e2e8f0;
  --border-dark: #1e293b;

  /* Text */
  --txt:         #0f172a;
  --txt-sec:     #475569;
  --txt-muted:   #64748b;
  --txt-inv:     #ffffff;
  --txt-sidebar: #cbd5e1;

  /* Accent: Indigo */
  --accent:        #6366f1;
  --accent-hover:  #4f46e5;
  --accent-active: #4338ca;
  --accent-light:  #eef2ff;
  --accent-mid:    #c7d2fe;
  --on-accent:     #ffffff;  /* text on accent bg */

  /* Avatar Colors */
  --avatar-1: #6366f1;  --avatar-2: #8b5cf6;  --avatar-3: #0ea5e9;
  --avatar-4: #10b981;  --avatar-5: #f59e0b;  --avatar-6: #ef4444;

  /* Role Badges */
  --badge-bg:    #ffffff;
  --role-admin:  #1d4ed8;
  --role-editor: #7c3aed;
  --role-viewer: #374151;

  /* Action Buttons */
  --btn-delete:     #ef4444;  --btn-delete-bg:  #fef2f2;
  --btn-disable:    #f59e0b;  --btn-disable-bg: #fffbeb;

  /* Semantic */
  --success:  #10b981;  --success-bg: #ecfdf5;  --success-txt: #064e3b;
  --warn:     #f59e0b;  --warn-bg:    #fffbeb;
  --danger:   #ef4444;  --danger-bg:  #fef2f2;  --danger-txt:  #7f1d1d;
  --info:     #3b82f6;  --info-bg:    #eff6ff;
  --inactive: #6b7280;  --inactive-bg:#f3f4f6;
  --tag-bg:   #f1f5f9;

  /* Radius */
  --radius-sm: 5px;  --radius-md: 8px;  --radius-lg: 12px;
}

/* ── 深色主题 [data-theme="dark"] ──── */
[data-theme="dark"] {
  --bg:         #020617;
  --white:      #1e293b;
  --surface-1:  #334155;
  --surface-2:  #475569;
  --surface-3:  rgba(71,85,105,0.5);
  --sel-border: #818cf8;
  --border:      #334155;
  --txt:         #f1f5f9;
  --txt-sec:     #cbd5e1;
  --txt-muted:   #94a3b8;
  --badge-bg:    #334155;
  --role-admin:  #93c5fd;  --role-editor: #c084fc;  --role-viewer: #e2e8f0;
  --accent:        #818cf8;  --accent-hover:  #6366f1;
  --accent-light:  #1e2356;
  --avatar-1: #818cf8;  --avatar-2: #a78bfa;  --avatar-3: #38bdf8;
  --avatar-4: #34d399;  --avatar-5: #fbbf24;  --avatar-6: #f87171;
  --btn-delete:     #f87171;  --btn-delete-bg:  #7f1d1d;
  --btn-disable:    #fbbf24;  --btn-disable-bg: #78350f;
  --success:  #34d399;  --success-bg: #064e3b;  --success-txt: #a1f2d1;
  --danger:   #f87171;  --danger-bg:  #7f1d1d;  --danger-txt:  #fecaca;
  --warn:     #fbbf24;  --warn-bg:    #78350f;
  --info:     #60a5fa;  --info-bg:    #1e3a8a;
  --inactive: #94a3b8;  --inactive-bg:#334155;
  --tag-bg:   #334155;
}
```

---

## 一·五、字体变量

| 变量 | 值 | 用途 |
|------|----|------|
| `--font-display` | `'Bricolage Grotesque', sans-serif` | 页面标题、ActionBar 标题、高亮字 |
| `--font-body` | `'Instrument Sans', sans-serif` | 正文、表单、按钮 |
| `--font-mono` | `'DM Mono', monospace` | 徽章、数字、版本号、代码 |
| `--stripe` | `var(--surface-1)` | 下拉列表 hover 背景（alias） |

> Google Fonts 必须在 `layout.tsx` `<head>` 中通过 `<link>` 引入（Bricolage Grotesque + DM Mono + Instrument Sans）。

---

## 二、Spacing / Typography / Shadow / Interaction Token

```css
:root {
  /* Spacing */
  --page-px: 24px;  --page-py: 16px;
  --space-xs: 4px;  --space-sm: 8px;  --space-md: 12px;
  --space-lg: 16px; --space-xl: 24px; --space-2xl: 32px;
  --table-px: 12px;
  --table-py-compact: 8px;   --table-py-relaxed: 12px;
  --bar-gap: 8px;   --bar-py: 10px;

  /* Typography */
  --text-xs:  11px;  --text-sm:  12px;  --text-base: 13px;
  --text-md:  14px;  --text-lg:  15px;  --text-xl:   17px;  --text-2xl: 20px;
  --font-normal: 400;  --font-medium: 500;  --font-bold: 600;
  --leading-tight: 1.25;  --leading-normal: 1.5;

  /* Shadow（语义层级） */
  --shadow-0: none;
  --shadow-1: 0 1px 3px rgba(15,23,42,.06), 0 1px 2px rgba(15,23,42,.04);  /* 卡片 */
  --shadow-2: 0 4px 16px rgba(15,23,42,.08), 0 2px 6px rgba(15,23,42,.05); /* Dropdown */
  --shadow-3: 0 12px 32px rgba(15,23,42,.12);                               /* Modal/Drawer */
  --shadow-focus: 0 0 0 3px rgba(99,102,241,.15);

  /* Interaction */
  --duration-fast:   100ms;  --duration-normal: 150ms;
  --duration-slow:   250ms;  --duration-xslow:  350ms;
  --ease-default: cubic-bezier(.4,0,.2,1);
  --scale-press:  .98;
}

[data-theme="dark"] {
  --shadow-1: 0 1px 3px rgba(0,0,0,.2), 0 1px 2px rgba(0,0,0,.16);
  --shadow-2: 0 4px 16px rgba(0,0,0,.3), 0 2px 6px rgba(0,0,0,.2);
  --shadow-3: 0 12px 32px rgba(0,0,0,.4);
  --shadow-focus: 0 0 0 3px rgba(129,140,248,.2);
}
```

> **响应式覆盖**：`≤1024px` → `--sidebar-w: 0px`, `--page-px: 16px`；`≤768px` → `--page-px: 12px`；`≤480px` → `--page-px: 10px`

---

## 三、CSS 工具类（nx-*）

> `app/globals.css` 中预定义了原生控件工具类，直接使用 className，无需内联样式。

| 类名 | 用途 | 高度 |
|------|------|------|
| `.nx-input` | 表单输入框（表单页、ConfirmDialog） | 32px |
| `.nx-input-sm` | 筛选栏输入框（FilterBar compact）| 28px |
| `.nx-input-error` | 配合 `.nx-input` 展示校验错误状态 | — |
| `.nx-select` | 表单下拉选择 | 32px |
| `.nx-select-sm` | 筛选栏下拉（FilterBar compact）| 28px，`width:auto` |
| `.nx-select-mini` | Header 用户面板内迷你下拉（主题/语言）| 26px，等宽字体 |
| `.nx-label` | 表单 label（11px uppercase 600）| — |
| `.nx-menu-item` | Header Dropdown 可点击菜单项 | — |
| `.nx-menu-row` | Header Dropdown 非交互行（icon+控件）| — |
| `.nx-divider` | Dropdown 分隔线 | 1px |

```tsx
// ✅ 正确：使用 nx-* 工具类
<input className="nx-input" type="text" />
<input className="nx-input nx-input-sm" type="text" />  {/* FilterBar */}
<select className="nx-select-sm">...</select>
<label className="nx-label">Email</label>

// ❌ 禁止：内联样式手写输入框样式
<input style={{ height: 32, border: '1px solid var(--border)' }} />
```

---

