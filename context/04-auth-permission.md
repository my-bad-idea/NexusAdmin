# NexusAdmin 认证与权限规范
> 权限四层模型 + usePermission hook + 路由守卫 + Permission Code 命名。

---

## 一、权限四层模型 🔴 P0

| 层级 | 控制目标 | 实现位置 | 无权限表现 |
|------|---------|---------|-----------|
| 菜单可见性 | 左侧导航项 | `menuStore`（后端下发） | 隐藏菜单项 |
| 路由可访问性 | URL 直接访问 | `middleware.ts` | 重定向 /403 |
| 按钮可操作性 | 页面操作按钮 | `usePermission()` hook | **隐藏**（return null） |
| 字段可见性 | 表格列/表单字段 | `hiddenColumns` prop | 隐藏或脱敏 |

**隐藏 vs 禁用 vs 脱敏（P0 硬性规则）**：

| 表现 | 使用条件 |
|------|---------|
| **隐藏**（`return null`） | 无权限功能——用户不应感知其存在 |
| **禁用**（`disabled`） | 功能存在但当前状态不满足（如未选中行） |
| **脱敏**（`••••@••••`） | 数据存在但用户无字段查看权，前后端双重实现 |

---

## 二、usePermission Hook

```typescript
// hooks/usePermission.ts
import { useAuthStore } from '@/store/authStore';

export function usePermission(code: string): boolean {
  return useAuthStore((s) => s.permissions.includes(code));
}

// ✅ 正确用法
const canDelete = usePermission('user:delete');
if (!canDelete) return null;    // 隐藏，不是 disabled

const canWrite = usePermission('user:write');
// 在 JSX 中
{canWrite && <PrimaryButton onClick={openForm}>+ Add User</PrimaryButton>}
```

---

## 三、Permission Code 命名规范

```
格式：{resource}:{action}[:{field}]

user:list          路由/菜单级（查看用户列表页）
user:write         按钮级（新建/编辑用户）
user:delete        按钮级（删除用户）
user:export        按钮级（导出用户数据）
user:read:email    字段级（查看邮箱，P2）

role:list
role:write
```

---

## 四、认证三种模式

通过环境变量 `NEXT_PUBLIC_AUTH_MODE` 切换：

### JWT（默认）
```typescript
// accessToken → Zustand memory（不存 localStorage）
// refreshToken → httpOnly Cookie
// 401 时 → clearAuth() → redirect /login

// lib/fetch.ts 自动注入
headers: { Authorization: `Bearer ${token}` }
```

### Session
```typescript
// 依赖后端 Set-Cookie，前端无需管理 Token
// fetch 配置：credentials: 'include'
```

### OAuth2 / OpenID Connect
```typescript
AUTH_MODE=oauth
OAUTH_PROVIDER=google|github|enterprise
OAUTH_CLIENT_ID=...
OAUTH_REDIRECT_URI=...
// 使用 next-auth，支持 PKCE
// 登录后写入 useAuthStore
```

---

## 五、路由守卫（middleware.ts）

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const token = req.cookies.get('nexus-token')?.value;
  const isAuthPage = req.nextUrl.pathname.includes('/login');

  if (!token && !isAuthPage) {
    return NextResponse.redirect(new URL('/login', req.url));
  }
  // 权限校验：对比 JWT payload 中的 permissions 与路由 permCode
  // 无权限 → redirect /403
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

---

## 六、菜单动态下发

```typescript
// types/menu.ts
interface MenuItem {
  id:        string;
  title:     string;       // i18n key，如 'menu.userManagement'
  icon:      string;       // lucide-react icon name，如 'Users'
  path:      string;       // 路由路径
  permCode:  string;       // 如 'user:list'
  children?: MenuItem[];
  badge?:    number;
}

// 登录后调用 GET /api/menu → 写入 menuStore
// menuStore 根据 permissions 过滤掉无权限的菜单项
```

---

## 七、AuthStore 接口

```typescript
// store/authStore.ts
interface AuthState {
  token:       string | null;
  user:        UserProfile | null;
  permissions: string[];   // ['user:read', 'user:write', ...]
  setAuth:  (token: string, user: UserProfile, permissions: string[]) => void;
  clearAuth: () => void;
}
```

---

## 八、FOUC 防闪烁（必须在 layout.tsx 中实现）

```tsx
// app/[locale]/layout.tsx — <head> 中同步内联脚本
<script dangerouslySetInnerHTML={{ __html: `
  (function() {
    try {
      var s = localStorage.getItem('nexus-theme');
      var mode = s ? JSON.parse(s).state?.mode : 'system';
      var isDark = mode === 'dark' ||
        (mode !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      if (isDark) document.documentElement.setAttribute('data-theme', 'dark');
    } catch(e) {}
  })();
`}} />
// suppressHydrationWarning 必须加在 <html> 标签上
```
