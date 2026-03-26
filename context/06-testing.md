# NexusAdmin 测试规范
> Vitest 单测 + Playwright E2E 分级（MVP / Sprint / 扩展三阶段）。

---

## 一、测试工具栈

```json
{
  "devDependencies": {
    "vitest":                    "^1.0.0",
    "@vitest/coverage-v8":       "^1.0.0",
    "@testing-library/react":    "^15.0.0",
    "@testing-library/user-event": "^14.0.0",
    "@playwright/test":          "^1.45.0",
    "msw":                       "^2.0.0"
  }
}
```

**规则**：所有 Mock 使用 MSW，禁止直接 mock fetch / Axios。

---

## 二、单测目录与覆盖要求

```
tests/unit/                                      # 实际目录路径
├── hooks/
│   └── usePermission.test.ts      # 🔴 P0，100% 覆盖 ✅ 已实现
├── components/
│   ├── ConfirmDialog.test.tsx     # P1：渲染/确认/取消    ✅ 已实现
│   ├── DataTable.test.tsx         # P1：渲染/分页/选中/空态  ⬜ 待实现
│   ├── UserForm.test.tsx          # P1：校验/提交/错误映射  ⬜ 待实现
│   └── AdvancedFilter.test.tsx    # P1：筛选条件计数       ⬜ 待实现
├── store/
│   ├── authStore.test.ts          # P1：setAuth/clearAuth  ✅ 已实现
│   └── themeStore.test.ts         # P1：切换主题           ✅ 已实现
└── queries/
    └── usersQuery.test.ts         # P2：TanStack Query mock ⬜ 待实现
```

| 目标 | 覆盖率 | 优先级 |
|------|--------|--------|
| `usePermission` hook | 100% | 🔴 P0 |
| Zustand store actions | ≥ 90% | 🟡 P1 |
| 核心 UI 组件语句 | ≥ 80% | 🟡 P1 |
| TanStack Query hooks | ≥ 60% | 🟢 P2 |

**Vitest 配置**（`vitest.config.ts`）：
```typescript
export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles:  ['./tests/setup.ts'],
    coverage:    { provider: 'v8', thresholds: { statements: 80 } },
  },
});
```

---

## 三、E2E 目录结构（Playwright）

```
tests/e2e/                                        # 实际目录路径
├── auth/
│   └── login.spec.ts              # 🔴 P0 MVP    ✅ 已实现（合并 login-jwt + auth-guard）
├── permission/
│   ├── route-guard.spec.ts        # 🔴 P0 MVP    ⬜ 待实现
│   └── button-permission.spec.ts  # 🔴 P0 MVP    ⬜ 待实现
├── users/
│   ├── list.spec.ts               # 🔴 P0 MVP    ✅ 已实现（合并 list-filter + create-user）
│   ├── batch-delete.spec.ts       # 🟡 P1 Sprint ⬜ 待实现
│   └── advanced-filter.spec.ts   # 🟡 P1 Sprint  ⬜ 待实现
├── theme/
│   └── theme-switch.spec.ts       # 🟡 P1 Sprint ⬜ 待实现
└── i18n/
    ├── lang-switch.spec.ts        # 🟡 P1 Sprint ⬜ 待实现
    └── date-format.spec.ts       # 🟢 P2 扩展    ⬜ 待实现
```

---

## 四、E2E 分阶段执行

### MVP 阶段（🔴 P0，必须全部通过才能上线）

```bash
pnpm test:e2e:mvp
# 覆盖：登录 / 路由守卫 / 按钮权限 / 列表筛选 / 新建表单
```

5 个核心用例：
1. JWT 登录成功/失败
2. 未登录访问 `/users` → 重定向 `/login`
3. Viewer 角色看不到 Delete 按钮
4. 搜索关键词筛选用户列表
5. 新建表单校验 + 提交成功

### Sprint 1–2（🟡 P1）

```bash
pnpm playwright test e2e/users/batch-delete.spec.ts \
  e2e/users/advanced-filter.spec.ts \
  e2e/theme/theme-switch.spec.ts \
  e2e/i18n/lang-switch.spec.ts
```

### 扩展阶段（🟢 P2，按需）

OAuth 登录 / 主题持久化 / 日期格式 / 菜单可见性

---

## 五、E2E 用例规范示例

```typescript
// e2e/users/batch-delete.spec.ts
import { test, expect } from '@playwright/test';
import { loginAs } from '../fixtures/auth';

test('batch delete with partial failure', async ({ page }) => {
  await loginAs(page, 'admin');
  await page.goto('/users');  // localePrefix: 'never'，URL 无 locale 前缀

  // 选中 3 行
  for (let i = 1; i <= 3; i++) {
    await page.getByRole('checkbox').nth(i).check();
  }

  // 点击 Delete → ConfirmDialog 出现
  await page.getByRole('button', { name: 'Delete' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByText('3 selected')).toBeVisible();

  // 确认删除
  await page.getByRole('button', { name: 'Confirm' }).click();

  // 断言：Toast 显示部分成功
  await expect(page.getByRole('status')).toContainText('2 of 3');
});
```

---

## 六、CI 集成

```yaml
# .github/workflows/ci.yml
- name: Unit Tests
  run: pnpm vitest run --coverage

- name: MVP E2E
  run: pnpm test:e2e:mvp

# package.json scripts
"test":          "vitest run --coverage",
"test:e2e:mvp":  "playwright test tests/e2e/auth tests/e2e/permission tests/e2e/users/list",
"ci":            "pnpm lint && pnpm type-check && pnpm test && pnpm test:e2e:mvp"
```
