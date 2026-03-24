# NexusAdmin API 契约 & Mock 规范
> 响应格式 + 错误码 + 排序筛选协议 + MSW Mock 规则 + 数据约定。

---

## 一、统一响应格式

```typescript
// types/api.ts
interface ApiResponse<T = unknown> {
  code:    number;    // 0 = 成功，非 0 = 业务错误
  data:    T;
  message: string;
}

interface PageData<T> {
  list:     T[];
  total:    number;
  page:     number;
  pageSize: number;
}
```

---

## 二、错误码分层

```typescript
enum ErrorCode {
  OK               = 0,
  VALIDATION_ERROR = 1001,  // 字段校验失败（含 errors 字段）
  UNAUTHORIZED     = 1002,  // 未登录
  FORBIDDEN        = 1003,  // 无权限
  NOT_FOUND        = 1004,
  CONFLICT         = 1009,  // 重复数据
  INTERNAL_ERROR   = 5000,
}
```

**字段级校验错误结构**（code: 1001）：
```json
{
  "code": 1001,
  "message": "Validation failed",
  "data": null,
  "errors": {
    "email": ["Email is already in use"],
    "name":  ["Name must be between 2 and 50 characters"]
  }
}
```

前端消费（配合 `useFormError`）：
```typescript
if (err.code === 1001 && err.errors) {
  Object.entries(err.errors).forEach(([field, msgs]) =>
    form.setError(field, { message: msgs[0] })
  );
}
```

---

## 三、排序与筛选协议

```
GET /api/users?page=1&size=20&sort=createdAt:desc&keyword=alice&role=Admin&status=Active
```

| 参数 | 格式 | 示例 |
|------|------|------|
| `page` | 整数，从 1 开始 | `page=2` |
| `size` | 整数 10/20/50 | `size=20` |
| `sort` | `{field}:{asc\|desc}` | `sort=createdAt:desc` |
| 筛选字段 | 直接 query param | `role=Admin&status=Active` |

---

## 四、批量操作返回格式（支持部分成功）

```json
POST /api/users/batch-disable → { "ids": ["u001", "u002", "u003"] }

// 响应
{
  "code": 0,
  "data": {
    "succeeded": ["u001", "u002"],
    "failed":    [{ "id": "u003", "reason": "User is already disabled" }]
  },
  "message": "2 of 3 users disabled"
}
```

---

## 五、幂等要求

| 操作 | 幂等 | 方式 |
|------|------|------|
| GET | ✅ | 天然幂等 |
| POST（创建） | ❌ | 前端加 `X-Idempotency-Key: uuid` |
| PUT / PATCH / DELETE | ✅ | — |

---

## 六、MSW Mock 规范

所有 Mock handler 放在 `mocks/handlers/` 下，按模块分文件。开发/测试环境自动启用，生产禁用。

```typescript
// mocks/handlers/users.ts
import { http, HttpResponse } from 'msw';

export const usersHandlers = [
  http.get('/api/users', ({ request }) => {
    const url = new URL(request.url);
    const page     = Number(url.searchParams.get('page') ?? 1);
    const pageSize = Number(url.searchParams.get('size') ?? 20);
    const keyword  = url.searchParams.get('keyword') ?? '';

    const filtered = MOCK_USERS.filter(u =>
      !keyword || u.name.toLowerCase().includes(keyword.toLowerCase())
    );
    const list = filtered.slice((page - 1) * pageSize, page * pageSize);

    return HttpResponse.json({
      code: 0,
      data: { list, total: filtered.length, page, pageSize },
      message: 'ok',
    });
  }),

  http.post('/api/users', async ({ request }) => {
    const body = await request.json() as Partial<UserDTO>;
    const newUser = { id: `u${Date.now()}`, ...body, createdAt: new Date().toISOString() };
    MOCK_USERS.push(newUser as UserDTO);
    return HttpResponse.json({ code: 0, data: newUser, message: 'ok' });
  }),

  http.delete('/api/users/:id', ({ params }) => {
    const idx = MOCK_USERS.findIndex(u => u.id === params.id);
    if (idx === -1)
      return HttpResponse.json({ code: 1004, data: null, message: 'User not found' }, { status: 404 });
    MOCK_USERS.splice(idx, 1);
    return HttpResponse.json({ code: 0, data: null, message: 'ok' });
  }),
];
```

---

## 七、关键接口 Mock 数据约定

### GET /api/users
```json
{
  "code": 0,
  "data": {
    "list": [{
      "id": "u001",
      "name": "Alice Wang",
      "email": "alice@corp.com",
      "department": "Engineering",
      "role": "Admin",
      "status": "Active",
      "createdAt": "2024-03-01T08:00:00Z",
      "lastLogin": "2026-03-10T09:00:00Z",
      "tags": ["beta-user"]
    }],
    "total": 128, "page": 1, "pageSize": 20
  },
  "message": "ok"
}
```

### GET /api/menu
```json
{
  "code": 0,
  "data": [
    { "id": "dashboard", "title": "menu.dashboard", "icon": "LayoutDashboard",
      "path": "/dashboard", "permCode": "dashboard:view" },
    { "id": "users", "title": "menu.userManagement", "icon": "Users",
      "path": "/users", "permCode": "user:list",
      "children": [
        { "id": "user-list", "title": "menu.userList", "icon": "List",
          "path": "/users", "permCode": "user:list" }
      ]}
  ],
  "message": "ok"
}
```

### GET /api/enums（枚举字典，动态下发）
```json
{
  "code": 0,
  "data": {
    "role":       [{ "value": "Admin",  "label": "管理员" }, { "value": "Editor", "label": "编辑" }, { "value": "Viewer", "label": "访客" }],
    "status":     [{ "value": "Active", "label": "启用"  }, { "value": "Inactive","label": "禁用" }, { "value": "Suspended","label": "暂停" }],
    "department": [{ "value": "Engineering", "label": "工程" }, { "value": "Product", "label": "产品" }]
  },
  "message": "ok"
}
```

---

## 八、时区与货币规范

```
日期时间：后端返回 ISO 8601 UTC，前端本地化显示
  ✅ "createdAt": "2024-03-01T08:00:00Z"
  ❌ "createdAt": "2024-03-01 16:00:00"（无时区）

货币：后端返回最小单位整数（分），前端格式化
  amount: 12500  →  formatCurrency(12500 / 100, locale, 'USD')  →  "$125.00"
```
