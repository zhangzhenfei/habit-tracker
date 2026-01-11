# 测试与日志最佳实践

## 目录

**第一部分：structlog 日志**
1. [为什么用 structlog](#1-为什么用-structlog)
2. [配置](#2-配置)
3. [FastAPI 集成](#3-fastapi-集成)
4. [上下文绑定](#4-上下文绑定)
5. [异常日志](#5-异常日志)

**第二部分：测试策略**
6. [测试金字塔](#6-测试金字塔)
7. [单元测试](#7-单元测试)
8. [集成测试](#8-集成测试)
9. [React 组件测试](#9-react-组件测试)
10. [E2E 测试](#10-e2e-测试)
11. [测试组织](#11-测试组织)

---

# 第一部分：structlog 日志

## 1. 为什么用 structlog

| 特性 | 标准 logging | structlog |
|-----|-------------|-----------|
| 输出格式 | 纯文本 | 结构化键值对 |
| 上下文 | 每次手动 | 绑定后自动携带 |
| JSON 输出 | 需自定义 | 内置 |

**核心优势**：
- 结构化数据，便于解析
- 绑定 logger 自动携带上下文
- 开发用彩色输出，生产用 JSON

---

## 2. 配置

```python
# app/logging_config.py
import structlog

def configure_logging(json_format: bool = False):
    shared_processors = [
        structlog.contextvars.merge_contextvars,
        structlog.processors.add_log_level,
        structlog.processors.TimeStamper(fmt="iso"),
    ]

    if json_format:
        processors = shared_processors + [structlog.processors.JSONRenderer()]
    else:
        processors = shared_processors + [structlog.dev.ConsoleRenderer(colors=True)]

    structlog.configure(
        processors=processors,
        wrapper_class=structlog.make_filtering_bound_logger(logging.INFO),
        cache_logger_on_first_use=True,
    )
```

### FastAPI 初始化

```python
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    configure_logging()
    yield

app = FastAPI(lifespan=lifespan)
```

---

## 3. FastAPI 集成

### 请求日志中间件

```python
import structlog
from starlette.middleware.base import BaseHTTPMiddleware

logger = structlog.get_logger()

class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        structlog.contextvars.clear_contextvars()
        request_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))

        structlog.contextvars.bind_contextvars(
            request_id=request_id,
            method=request.method,
            path=request.url.path,
        )

        start_time = time.perf_counter()
        response = await call_next(request)
        duration_ms = (time.perf_counter() - start_time) * 1000

        logger.info("请求完成", status_code=response.status_code, duration_ms=round(duration_ms, 2))
        response.headers["X-Request-ID"] = request_id
        return response
```

---

## 4. 上下文绑定

```python
# 请求级上下文
structlog.contextvars.bind_contextvars(request_id="abc-123", user_id=42)

# 后续日志自动包含上下文
logger = structlog.get_logger()
logger.info("处理请求")  # 包含 request_id, user_id

# 临时上下文
with structlog.contextvars.bound_contextvars(operation="streak_calculation"):
    logger.info("开始计算")
# 块结束后上下文恢复

# 每个 logger 绑定
logger = structlog.get_logger().bind(component="habit_service")
logger.info("服务启动")  # 包含 component
```

---

## 5. 异常日志

```python
try:
    risky_operation()
except Exception:
    logger.exception("操作失败")  # 自动包含堆栈
```

---

# 第二部分：测试策略

## 6. 测试金字塔

| 层级 | 占比 | 速度 | 范围 |
|-----|-----|-----|-----|
| 单元 | 70% | 毫秒 | 单函数/类 |
| 集成 | 20% | 秒 | 多组件 |
| E2E | 10% | 分钟 | 全系统 |

**各层内容**：
- **单元**：纯函数、验证器、业务逻辑
- **集成**：API 端点、数据库操作
- **E2E**：关键用户流程

---

## 7. 单元测试

```python
import pytest
from app.services.streak import calculate_streak

class TestStreakCalculation:
    def test_空完成返回零(self):
        assert calculate_streak([]) == 0

    def test_连续天数计数(self):
        completions = [date(2025, 1, 1), date(2025, 1, 2), date(2025, 1, 3)]
        assert calculate_streak(completions) == 3

# 参数化测试
@pytest.mark.parametrize("completions,expected", [
    ([], 0),
    ([date(2025, 1, 1)], 1),
    ([date(2025, 1, 1), date(2025, 1, 3)], 1),  # 间隔打断
])
def test_streak_calculation(completions, expected):
    assert calculate_streak(completions) == expected
```

### Mock

```python
from unittest.mock import Mock

def test_service_calls_repository():
    mock_repo = Mock()
    mock_repo.get_by_id.return_value = Habit(id=1, name="运动")

    service = HabitService(repository=mock_repo)
    result = service.get_habit(1)

    mock_repo.get_by_id.assert_called_once_with(1)
    assert result.name == "运动"
```

---

## 8. 集成测试

### 测试设置

```python
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, StaticPool

@pytest.fixture
def db_session():
    engine = create_engine("sqlite:///:memory:", poolclass=StaticPool)
    Base.metadata.create_all(engine)
    session = sessionmaker(bind=engine)()
    yield session
    session.close()

@pytest.fixture
def client(db_session):
    def override_get_db():
        yield db_session
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()
```

### API 测试

```python
class TestHabitAPI:
    def test_创建习惯返回201(self, client):
        response = client.post("/api/habits", json={"name": "运动"})
        assert response.status_code == 201
        assert response.json()["name"] == "运动"

    def test_无名称返回422(self, client):
        response = client.post("/api/habits", json={})
        assert response.status_code == 422

    def test_不存在返回404(self, client):
        response = client.get("/api/habits/99999")
        assert response.status_code == 404
```

---

## 9. React 组件测试

### Vitest 设置

```javascript
// vite.config.js
export default defineConfig({
  test: { globals: true, environment: 'jsdom', setupFiles: './src/test/setup.js' },
});

// src/test/setup.js
import '@testing-library/jest-dom';
```

### 组件测试

```javascript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('HabitCard', () => {
  it('渲染习惯名称', () => {
    render(<HabitCard habit={{ id: 1, name: '运动' }} />);
    expect(screen.getByText('运动')).toBeInTheDocument();
  });

  it('点击调用 onComplete', async () => {
    const onComplete = vi.fn();
    render(<HabitCard habit={{ id: 1, name: '运动' }} onComplete={onComplete} />);
    await userEvent.click(screen.getByRole('button', { name: /完成/i }));
    expect(onComplete).toHaveBeenCalledWith(1);
  });
});
```

### 查询优先级

1. `getByRole` - 无障碍名称（最佳）
2. `getByLabelText` - 表单标签
3. `getByText` - 文本内容
4. `getByTestId` - 最后手段

---

## 10. E2E 测试

### Playwright 配置

```javascript
// playwright.config.js
export default defineConfig({
  testDir: './tests/e2e',
  use: { baseURL: 'http://localhost:5173' },
  webServer: { command: 'npm run dev', url: 'http://localhost:5173' },
});
```

### Page Object 模式

```javascript
export class DashboardPage {
  constructor(page) {
    this.page = page;
    this.addHabitButton = page.getByRole('button', { name: /添加习惯/i });
  }

  async goto() { await this.page.goto('/'); }

  async addHabit(name) {
    await this.addHabitButton.click();
    await this.page.getByLabel('习惯名称').fill(name);
    await this.page.getByRole('button', { name: /保存/i }).click();
  }
}
```

### E2E 测试

```javascript
import { test, expect } from '@playwright/test';
import { DashboardPage } from './pages/DashboardPage';

test('用户可以创建并完成习惯', async ({ page }) => {
  const dashboard = new DashboardPage(page);
  await dashboard.goto();
  await dashboard.addHabit('运动');
  await expect(page.getByText('运动')).toBeVisible();
});
```

---

## 11. 测试组织

### 目录结构

```
tests/
├── conftest.py           # 共享 fixtures
├── unit/
│   └── test_streak.py
├── integration/
│   └── test_api_habits.py
└── e2e/
    ├── pages/
    └── habits.spec.js
```

### Pytest 标记

```ini
# pytest.ini
[pytest]
markers =
    unit: 单元测试
    integration: 集成测试
```

```python
@pytest.mark.unit
def test_calculate_streak():
    pass
```

```bash
pytest -m unit          # 只运行单元测试
pytest -m integration   # 只运行集成测试
```

### 覆盖率配置

```toml
# pyproject.toml
[tool.coverage.run]
source = ["app"]
fail_under = 80
```

```bash
pytest --cov=app --cov-report=html
```

---

## 快速参考

### 测试命令

```bash
# 后端
pytest                    # 全部测试
pytest tests/unit         # 单元测试
pytest --cov=app          # 带覆盖率

# 前端
npm test                  # 全部测试
npm test -- --coverage    # 带覆盖率

# E2E
npx playwright test       # 全部 E2E
npx playwright test --ui  # UI 模式
```

### 断言速查

```python
# Pytest
assert result == expected
pytest.raises(ValueError)
```

```javascript
// React Testing Library
expect(element).toBeInTheDocument();
expect(element).toBeVisible();
expect(mockFn).toHaveBeenCalledWith(arg);

// Playwright
await expect(locator).toBeVisible();
await expect(page).toHaveURL('/path');
```

---

## 资源

- [structlog 文档](https://www.structlog.org/)
- [pytest 文档](https://docs.pytest.org/)
- [React Testing Library](https://testing-library.com/)
- [Playwright 文档](https://playwright.dev/)
